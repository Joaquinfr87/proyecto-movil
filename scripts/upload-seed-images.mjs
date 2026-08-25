// T-040: Sube las imagenes seed al bucket scenario-images del cloud.
// Lee las imagenes de supabase/scenario-images/{scenario_id}/image-{n}.jpg
// y las sube al bucket publico scenario-images en Supabase Cloud.
// Uso: node scripts/upload-seed-images.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const IMAGES_DIR = resolve(import.meta.dirname, '../supabase/scenario-images');

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Falta EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const BUCKET = 'scenario-images';

function walkImages(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...walkImages(full));
    } else if (/\.(jpe?g|png|webp)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  console.log(`\n=== Upload seed images a ${SUPABASE_URL} ===\n`);

  const sb = createClient(SUPABASE_URL, ANON_KEY, { auth: { storageKey: 'upload-seed' } });

  const { error: loginErr } = await sb.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'password123',
  });
  if (loginErr) {
    console.error('Login admin fallo:', loginErr.message);
    process.exit(1);
  }
  console.log('Login admin OK\n');

  const imageFiles = walkImages(IMAGES_DIR);
  console.log(`Encontradas ${imageFiles.length} imagenes\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of imageFiles) {
    const storagePath = relative(IMAGES_DIR, filePath);
    const bytes = readFileSync(filePath);

    const { error } = await sb.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      if (error.message?.includes('Already exists')) {
        skipped += 1;
        console.log(`  SKIP  ${storagePath} (ya existe)`);
      } else {
        failed += 1;
        console.log(`  FAIL  ${storagePath}: ${error.message}`);
      }
    } else {
      uploaded += 1;
      console.log(`  OK    ${storagePath}`);
    }
  }

  console.log(`\n=== RESUMEN ===`);
  console.log(`Subidas: ${uploaded} | Saltadas: ${skipped} | Fallidas: ${failed}`);

  await sb.auth.signOut();
}

main().catch((e) => {
  console.error('Error fatal:', e.message);
  process.exit(1);
});
