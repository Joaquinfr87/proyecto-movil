// T-035: Test E2E de integracion - flujo completo del MVP contra Supabase local.
// Simula la capa de datos exactamente como la hace la app:
// auth -> mapa/catalogo -> detalle -> favorito -> favoritos -> busqueda/filtros -> logout
// Uso: node scripts/smoke-test.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, extra = '') {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

async function loginAs(email, password) {
  const sb = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { storageKey: `smoke-${email}` },
  });
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return { sb, user: data.user };
}

async function main() {
  console.log(`\n=== T-035 Smoke Test contra ${SUPABASE_URL} ===\n`);

  // ---------- 1. Auth: las 3 credenciales del seed ----------
  console.log('[1] Autenticación (3 credenciales del seed)');
  const creds = [
    ['admin@test.com', 'password123', 'admin'],
    ['gestor@test.com', 'password123', 'gestor'],
    ['asistente@test.com', 'password123', 'asistente'],
  ];
  for (const [email, pass, expectedRole] of creds) {
    try {
      const { sb, user } = await loginAs(email, pass);
      check(`${email} inicia sesión`, !!user?.id);
      check(
        `${email} metadata.role = ${expectedRole}`,
        user.user_metadata?.role === expectedRole,
        `(got: ${user.user_metadata?.role})`,
      );
      await sb.auth.signOut();
    } catch (e) {
      check(`${email} inicia sesión`, false, e.message);
    }
  }

  // ---------- Flujo principal como asistente (usuario normal) ----------
  const { sb, user } = await loginAs('asistente@test.com', 'password123');
  const userId = user.id;

  // ---------- 2. Mapa / Catálogo: useScenarios() ----------
  console.log('\n[2] Mapa y catálogo (useScenarios)');
  const { data: scenarios, error: scErr } = await sb
    .from('scenarios')
    .select('*, scenario_images(url, is_primary, storage_path, display_order), scenario_sports(sports(nombre))')
    .eq('estado', 'activo')
    .order('nombre');
  check('query de escenarios sin error', !scErr, scErr?.message ?? '');
  check('hay escenarios activos', (scenarios?.length ?? 0) > 0, `(got: ${scenarios?.length})`);
  check(
    'todos tienen coordenadas válidas para el mapa',
    scenarios.every((s) => typeof s.latitud === 'number' && typeof s.longitud === 'number'),
  );
  check(
    'todos tienen nombre y tipo',
    scenarios.every((s) => !!s.nombre && !!s.tipo),
  );

  // ---------- 3. Detalle: useScenario(id) ----------
  console.log('\n[3] Detalle de escenario');
  const first = scenarios[0];
  const { data: detail, error: detErr } = await sb
    .from('scenarios')
    .select('*, scenario_images(url,is_primary,storage_path,display_order), scenario_sports(sports(nombre)), events(*)')
    .eq('id', first.id)
    .single();
  check('query de detalle sin error', !detErr && !!detail, detErr?.message ?? '');
  check('detalle incluye deportes', Array.isArray(detail.scenario_sports));
  check('detalle incluye eventos', Array.isArray(detail.events));

  // Resolución de imagen como hace resolveScenarioImages()
  const img = detail.scenario_images?.[0];
  let imageUrl = null;
  if (img) {
    imageUrl = /^https?:\/\//.test(img.url)
      ? img.url
      : sb.storage.from('scenario-images').getPublicUrl(img.storage_path).data.publicUrl;
    const res = await fetch(imageUrl);
    check(
      'imagen primaria sirve por URL pública',
      res.ok && res.headers.get('content-type')?.startsWith('image/'),
      `(${res.status} ${res.headers.get('content-type')})`,
    );
  }

  // ---------- 4. Favoritos: toggle + lista ----------
  console.log('\n[4] Favoritos (toggle optimista + lista)');
  // Idempotente: el seed ya puede incluir este favorito
  await sb.from('favorites').delete().eq('user_id', userId).eq('scenario_id', first.id);
  const { error: insErr } = await sb.from('favorites').insert({ user_id: userId, scenario_id: first.id });
  check('agregar favorito', !insErr, insErr?.message ?? '');
  const { data: isFav } = await sb
    .from('favorites')
    .select('user_id, scenario_id')
    .eq('user_id', userId)
    .eq('scenario_id', first.id)
    .maybeSingle();
  check('useIsFavorite confirma el favorito', !!isFav);
  const { data: favList, error: favErr } = await sb
    .from('favorites')
    .select('*, scenarios(*, scenario_images(url, is_primary, storage_path))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  check('lista de favoritos sin error', !favErr, favErr?.message ?? '');
  check('el favorito aparece en la lista con datos del escenario', favList.some((f) => f.scenario_id === first.id && f.scenarios?.nombre));
  // Toggle: quitar y volver a agregar (como haría un usuario)
  await sb.from('favorites').delete().eq('user_id', userId).eq('scenario_id', first.id);
  const { data: afterRemove } = await sb
    .from('favorites')
    .select('scenario_id')
    .eq('user_id', userId)
    .eq('scenario_id', first.id)
    .maybeSingle();
  check('quitar favorito funciona', !afterRemove);
  await sb.from('favorites').insert({ user_id: userId, scenario_id: first.id });

  // ---------- 5. Búsqueda y filtros (lógica en memoria de search.tsx) ----------
  console.log('\n[5] Búsqueda y filtros en memoria');
  const query = scenarios[0].nombre.split(' ')[0].toLowerCase();
  const byName = scenarios.filter((s) => s.nombre.toLowerCase().includes(query));
  check(`búsqueda por nombre "${query}" devuelve resultados`, byName.length > 0);
  const types = new Set(scenarios.map((s) => s.tipo));
  const someType = [...types][0];
  const byType = scenarios.filter((s) => s.tipo.toLowerCase() === someType.toLowerCase());
  check(`filtro por tipo "${someType}" filtra`, byType.length > 0 && byType.length <= scenarios.length);
  const someSport = scenarios.flatMap((s) => s.scenario_sports?.map((ss) => ss.sports.nombre) ?? [])[0];
  if (someSport) {
    const bySport = scenarios.filter((s) =>
      s.scenario_sports?.some((ss) => ss.sports.nombre.toLowerCase() === someSport.toLowerCase()),
    );
    check(`filtro por deporte "${someSport}" filtra`, bySport.length > 0);
  }
  const both = scenarios.filter(
    (s) =>
      s.tipo.toLowerCase() === someType.toLowerCase() &&
      s.nombre.toLowerCase().includes(query),
  );
  check('filtros acumulativos tipo+nombre no explotan', Array.isArray(both));

  // ---------- 6. RLS: solo admin sube imágenes al bucket ----------
  console.log('\n[6] RLS Storage (regresión admin-only)');
  async function tryUpload(sbClient, label) {
    const bytes = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70]); // cabecera JPEG mínima
    const { error } = await sbClient.storage
      .from('scenario-images')
      .upload(`rls-test/${label}-${Date.now()}.jpg`, bytes, { contentType: 'image/jpeg' });
    return error;
  }
  const { sb: sbGestor } = await loginAs('gestor@test.com', 'password123');
  const gestorErr = await tryUpload(sbGestor, 'gestor');
  check('gestor NO puede subir imágenes (ahora es solo-admin)', !!gestorErr, gestorErr ? '' : '(¡subió!)');
  const asisErr = await tryUpload(sb, 'asistente');
  check('asistente NO puede subir imágenes', !!asisErr, asisErr ? '' : '(¡subió!)');

  const { sb: sbAdmin, user: adminUser } = await loginAs('admin@test.com', 'password123');
  const adminErr = await tryUpload(sbAdmin, 'admin');
  check('admin SÍ puede subir imágenes', !adminErr, adminErr?.message ?? '');
  if (!adminErr) {
    const files = await sbAdmin.storage.from('scenario-images').list('rls-test');
    for (const f of files.data ?? []) {
      await sbAdmin.storage.from('scenario-images').remove([`rls-test/${f.name}`]);
    }
  }

  // ---------- 7. RLS favoritos: aislamiento entre usuarios ----------
  console.log('\n[7] RLS favoritos (aislamiento por usuario)');
  const { data: othersFavs } = await sb.from('favorites').select('*').neq('user_id', userId);
  check('un usuario no ve favoritos ajenos', (othersFavs?.length ?? 0) === 0, `(got: ${othersFavs?.length})`);
  const { error: foreignDelete } = await sbAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('scenario_id', first.id);
  void foreignDelete; // admin puede o no según política; no se assertion

  // ---------- 8. Logout ----------
  console.log('\n[8] Cierre de sesión');
  await sb.auth.signOut();
  const { data: sessionAfter } = await sb.auth.getSession();
  check('signOut limpia la sesión', !sessionAfter.session);

  // ---------- Limpieza ----------
  await sbAdmin.from('favorites').delete().eq('user_id', userId);

  console.log('\n=== RESUMEN ===');
  console.log(`PASS: ${passed} | FAIL: ${failed}`);
  if (failures.length) {
    console.log('\nBugs encontrados (para GitHub Issues):');
    failures.forEach((f) => console.log(` - ${f}`));
    process.exitCode = 1;
  } else {
    console.log('Flujo E2E completo sin errores.');
  }
}

main().catch((e) => {
  console.error('Error fatal:', e.message);
  process.exit(1);
});
