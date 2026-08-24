# T-035 — Reporte de Test E2E de Integración (Sprint 2)

> Fecha: 2026-08-24 · Ejecutado por: Joaquín (automatizado con `scripts/smoke-test.mjs`)
> Flujo probado: auth → mapa/catálogo → detalle → favorito → favoritos → búsqueda/filtros → RLS → logout

## Cómo ejecutarlo

```bash
# Contra Supabase local (recomendado):
pnpm db:reset
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 node scripts/smoke-test.mjs

# Contra cloud (usa el .env del proyecto):
node scripts/smoke-test.mjs
```

## Resultado local: 28/28 PASS ✅

| # | Bloque | Resultado |
|---|--------|-----------|
| 1 | Auth con las 3 credenciales del seed + `metadata.role` correcto | 6/6 |
| 2 | Catálogo/mapa: 20 escenarios activos, coordenadas válidas | 4/4 |
| 3 | Detalle: joins deportes/eventos/imagenes + URL pública sirve imagen | 4/4 |
| 4 | Favoritos: agregar → confirmar → listar → quitar | 5/5 |
| 5 | Búsqueda por nombre, filtro tipo/deporte, acumulativos | 4/4 |
| 6 | RLS Storage: solo admin sube; gestor/asistente bloqueados | 3/3 |
| 7 | RLS favoritos: aislamiento entre usuarios | 1/1 |
| 8 | Logout limpia sesión | 1/1 |

## Hallazgos corregidos durante el sprint (T-036)

1. **`user_metadata.role` no existía en el seed** → el botón de subida nunca aparecía ni para admin.
   Fix: seed.sql + migración idempotente `007_seed_user_roles_metadata.sql`.
2. **Gestor podía subir imágenes** → se restringió a admin-only en cliente (`scenario/[id].tsx`) y RLS (`005_storage_admin_only.sql`). Test de regresión incluido.
3. **URLs relativas del seed no renderizaban** → `resolveScenarioImages()` en los hooks construye la URL pública desde `storage_path`.

## Pendiente del proyecto CLOUD ⚠️

El `.env` apunta al cloud, que está desfasado respecto a las migraciones:

```bash
supabase link --project-ref qwsahglqvqwwzpejeqep   # pide access token
supabase db push                                    # aplica 005, 006, 007
```

Además, el bucket cloud **no tiene los archivos de imágenes** (solo están en local).
Consecuencias hasta que se sincronice: botón de subida invisible para admin, gestor puede subir,
imágenes del seed dan 400. Alternativa rápida: apuntar `.env` al local mientras tanto.

## Pendiente manual (T-037) 📱

Probar en Android físico (requiere dispositivo):

```bash
pnpm android        # con celular conectado y depuración USB
```

Checklist: mapa carga tiles (MapTiler), marcadores navegan a detalle, imágenes se ven,
pull-to-refresh, toggle favorito refleja estado real tras recargar, sin crashes en 10 min de uso.
