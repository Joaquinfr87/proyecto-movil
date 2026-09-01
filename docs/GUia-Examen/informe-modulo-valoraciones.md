# Informe · Módulo "Valoraciones y reseñas de escenarios"

**Proyecto:** Lugares Interactivos — Visualización interactiva de escenarios deportivos a nivel nacional
**Examen práctico integrador:** PDF 7 — Nuevo módulo / funcionalidad
**Rama:** Examen-NicolasReguerin

---

## 1. Funcionalidad implementada

**Valoraciones y reseñas de escenarios deportivos.**

Los usuarios autenticados pueden calificar cada escenario con **1 a 5 estrellas** y dejar un
comentario opcional. La aplicación muestra:

- El **promedio** y la **cantidad** de valoraciones de cada escenario (en el detalle y en las
  tarjetas del catálogo).
- La **lista de reseñas** con el autor y el comentario.
- La pestaña **"Valoraciones"** con **mis valoraciones** (consultar, editar o eliminar).

## 2. Problema o necesidad que resuelve

La app ofrece información oficial de infraestructura deportiva (capacidad, horario, fotos,
eventos), pero el usuario no disponía de información **sobre la experiencia y el estado
percibido** de cada escenario. Las valoraciones agregan información comunitaria que ayuda a
otros ciudadanos a decidir y proporciona retroalimentación al personal de gestión.

## 3. Usuarios involucrados

- **Ciudadanía** (rol `asistente` / cualquier usuario autenticado): valora, consulta y gestiona
  sus propias reseñas.
- **Gestores y administradores**: consultan las valoraciones de los escenarios que administran.
  El **admin** puede eliminar cualquier valoración (moderación).

## 4. Objetivo

Permitir que la comunidad califique los escenarios y consultar el promedio de forma centralizada,
integrada a la navegación existente, sin duplicar datos ni romper la lógica actual.

## 5. Flujo de funcionamiento

```
Usuario
   ↓ 1. Abre el detalle de un escenario (o la pestaña Valoraciones)
   ↓ 2. Toca "Valorar" / "Editar mi valoración"
   ↓ 3. Selecciona estrellas (1–5) y escribe un comentario opcional
   ↓ 4. Se validan los datos (RHF + Zod)
   ↓ 5. Se guarda en Supabase (upsert por usuario+escenario)
   ↓ 6. Se recalculan promedio y lista (react-query)
   ↓ 7. Consulta / edita / elimina desde "Mis Valoraciones" o el detalle
```

## 6. Pantallas creadas y modificadas

| Pantalla | Tipo | Descripción |
| --- | --- | --- |
| `src/app/(tabs)/ratings.tsx` | **Nueva** | "Mis Valoraciones": lista con editar/eliminar/crear |
| `src/app/(tabs)/_layout.tsx` | Modificada | Pestaña **Valoraciones** (icono star-half) |
| `src/app/scenario/[id].tsx` | Modificada | Sección "Valoraciones": promedio, botón Valorar, lista de reseñas |
| `src/components/rating/RatingStars.tsx` | **Nueva** | Selector / visualización de estrellas |
| `src/components/rating/RatingFormModal.tsx` | **Nueva** | Modal crear/editar valoración (RHF + Zod) |
| `src/components/rating/RatingList.tsx` | **Nueva** | Lista de reseñas con acciones propias |
| `src/components/common/ScenarioCard.tsx` | Modificada | Badge de promedio y cantidad |
| `src/hooks/useScenarioRatings.ts` | **Nueva** | CRUD + stats + caché offline |
| `src/utils/ratingDraft.ts` | **Nueva** | Persistencia local (borrador + caché) |

## 7. Tablas creadas / modificadas (Supabase + PostgreSQL)

### Tabla nueva: `public.scenario_ratings` (migración `011_create_scenario_ratings.sql`)

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID PK | `gen_random_uuid()` |
| `scenario_id` | UUID FK → `scenarios.id` | `ON DELETE CASCADE` |
| `user_id` | UUID FK → `profiles.id` | `ON DELETE CASCADE` |
| `rating` | SMALLINT | `CHECK (rating BETWEEN 1 AND 5)` |
| `comment` | TEXT | default `''`, máx. 500 (validación en app) |
| `created_at` / `updated_at` | TIMESTAMPTZ | trigger automático |

- **Restricción única:** `UNIQUE (user_id, scenario_id)` → una valoración por usuario y escenario.
- **Índices:** por `scenario_id` y por `user_id`.

### RLS (Row Level Security)

| Operación | Política |
| --- | --- |
| SELECT | autenticados y anon (los usuarios pueden ver reseñas) |
| INSERT | `user_id = auth.uid()` |
| UPDATE | `user_id = auth.uid()` |
| DELETE | `user_id = auth.uid()` **o** rol `admin` |

### Función: `public.scenario_rating_stats()`

Devuelve `(scenario_id, average, count)` agrupado, usada para el promedio en tarjetas
(`SECURITY DEFINER`, solo expone agregados).

## 8. Operaciones CRUD

| Operación | Dónde | Cómo |
| --- | --- | --- |
| **Create** | Detalle de escenario / Modal | `upsert` con `onConflict: user_id,scenario_id` |
| **Read** | Detalle (lista+promedio) y tab | `SELECT` con join a `profiles` y `scenarios` |
| **Update** | Modal de edición | `upsert` (misma clave) |
| **Delete** | Detalle y tab | `DELETE` por id (propia; admin: cualquiera) |
| **Aggregate** | Tarjetas de catálogo | `rpc('scenario_rating_stats')` |

Invalida queries con react-query (`['scenario-ratings', id]`, `['my-ratings', userId]`,
`['rating-stats']`) para reflejar la UI al instante.

## 9. Persistencia utilizada

### Supabase (centralizada) — la información de valoración es pública del escenario

Promedios, reseñas y quién las emitió deben ser consultables por todos los usuarios desde
cualquier dispositivo y moderables por admin → se almacenan en PostgreSQL vía Supabase.

### AsyncStorage (local) — `src/utils/ratingDraft.ts`

- **Borrador de la valoración** (`rating_draft:v1:{userId}`): si el usuario escribe estrellas /
  comentario y cierra el modal sin guardar, el borrador se restaura la próxima vez.
- **Caché offline de "Mis Valoraciones"** (`my_ratings_cache:v1:{userId}`): la pestaña muestra
  los datos guardados del dispositivo antes de la respuesta del servidor (experiencia offline).

Justificación: información privada por dispositivo y temporales de edición. El proyecto ya tenía
`AsyncStorage` instalado pero sin uso; esta es la primera funcionalidad que lo aprovecha.

## 10. Validaciones y manejo de errores

- **Validación de campos:** Zod en el formulario — calificación requerida entre 1–5; comentario
  opcional con máximo 500 caracteres.
- **Datos inválidos:** el `CHECK (rating BETWEEN 1 AND 5)` y el `UNIQUE` refuerzan a nivel DB.
- **Información inexistente:** `EmptyState` ("Sin valoraciones aún") y estado de error con retry.
- **Error al guardar:** mensaje en el modal (box de error) sin cerrar el formulario.
- **Error de consulta:** `ErrorState` con botón "Reintentar" en la pestaña.
- **Doble envío:** botón deshabilitado con spinner mientras guarda.

## 11. Pruebas realizadas

| # | Prueba | Resultado |
| --- | --- | --- |
| 1 | Acceso al módulo (pestaña Valoraciones + botón en detalle) | ✔ |
| 2 | Ingreso de datos válidos (5 estrellas + comentario) | ✔ insertado |
| 3 | Ingreso de datos inválidos (rating = 6) | ✔ rechazado por CHECK |
| 4 | Validación de campos (0 estrellas al publicar) | ✔ error en UI |
| 5 | Guardado de información (CREATE via upsert) | ✔ |
| 6 | Consulta (lista con `profiles` + promedio por RPC) | ✔ |
| 7 | Modificación (UPDATE del propio rating/comment) | ✔ |
| 8 | Eliminación (DELETE propia) | ✔ |
| 9 | Persistencia (caché AsyncStorage + borrador) | ✔ implementada |
| 10 | Manejo de errores (RLS ajeno bloqueado: INSERT/UPDATE/DELETE) | ✔ |
| 11 | RLS: admin puede eliminar valoración ajena | ✔ |
| 12 | Estadísticas agregadas (`scenario_rating_stats`) | ✔ |

Las pruebas 1–12 se ejecutaron contra **Supabase local** (script de smoke test con
`@supabase/supabase-js`): sign-in de usuarios seed, CRUD completo, constraints y control de RLS.

## 12. Desafío adicional

- **Ordenamiento** de reseñas por más recientes (`created_at desc`).
- **Edición inline** vía el mismo modal reutilizado (crear/editar/eliminar desde detalle y desde
  la pestaña).
- **Promedio agregado en tarjetas** del catálogo (búsqueda) sin duplicar consultas.
- **Caché offline** de "Mis Valoraciones" y **borrador** en AsyncStorage.

## 13. Dificultades encontradas

1. **Privilegios de tabla en Supabase local:** las tablas nuevas no recibían los
   grants automáticos (`authenticated` sin INSERT/SELECT), solucionado agregando `GRANT`
   explícitos en la migración.
2. **Caché de esquema de PostgREST:** tras aplicar la migración, la API devolvía 404 hasta
   recargar el esquema (resuelto con `db reset` y reinicio del contenedor `rest`).
3. **Ambigüedad en el listado de migraciones local** que sugería que `011` estaba aplicada
   cuando realmente no lo estaba; verificado directamente contra la base con `psql`.
4. **Tipos de expo-router stale** (`.expo/types/router.d.ts` generado sin las rutas nuevas):
   errores de TS preexistentes en `manage.tsx`, que se regeneran con `expo start`.
5. **Lint preexistente roto** en el repo (ESLint v10 exige flat config y el repo usa
   `.eslintrc.js`); se aplicó Prettier y `tsc` validado sobre los archivos del módulo.

## 14. Evidencias

### Demostración en web (cómo reproducir)

La app incluye soporte web (`react-native-web`, `WebMapLibre.web.tsx`). Para la demo:

```bash
# 1. Apuntar Supabase al stack local (contiene los datos + migración 011)
#    .env → EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 + anon key local
pnpm web        # abre http://localhost:8081
# 2. Iniciar sesión: asistente@test.com / password123
# 3. Probar el módulo: pestaña Valoraciones, valorar en un detalle, etc.
```

En emulador Android usar `http://10.0.2.2:54321`; en APK físico, la IP LAN de la máquina.

### Capturas (carpeta `./evidencias/`)

1. `01-tab-valoraciones.png` — Pestaña "Valoraciones" (pantalla principal del módulo).
2. `02-modal-valorar.png` — Modal "Valorar escenario" (estrellas 1–5 + comentario).
3. `03-detalle-promedio.png` — Sección "Valoraciones" en el detalle (promedio y reseñas con autor).
4. `04-tarjeta-promedio.png` — Tarjeta del catálogo con badge de promedio (★ x.x · n).
5. `05-validacion-error.png` — Validación de campos (error) / error al guardar.
6. `06-eliminar-valoracion.png` — Confirmación de eliminación de una valoración.