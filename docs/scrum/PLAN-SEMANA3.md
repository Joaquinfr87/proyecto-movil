# Plan de Desarrollo - Sprint 3: Cierre, Gestión de Contenido y Entrega (FINAL)

## Equipo: Lugares Interactivos (DeporteYa)

> **Objetivo:** Cerrar el MVP completo según la definición de la tesis (RF-01 a RF-10),
> dejar la app instalable como APK y entregar documentación + demo final.
> **Este es el último sprint. Fecha de congelamiento de código: viernes.**

---

## Estado Actual (fin Sprint 2)

### Completado
- Auth funcional (login, registro, logout, sesión persistente) - RF-01, RF-02
- Mapa interactivo con marcadores y ubicación del usuario - RF-05
- Catálogo con búsqueda (debounce) y filtros acumulativos - RF-03, RF-04
- Detalle de escenario con deportes, eventos e imágenes - RF-06
- Favoritos con toggle optimista - RF-07
- Subida de imágenes solo-admin desde la app - RF-08 (parcial)
- 35 imágenes reales en el bucket local + script de llenado
- Smoke test E2E automatizado (28/28 PASS en local)
- Migraciones 005-007 (RLS admin-only, índices, roles)

### Pendiente / Deuda técnica
- **T-037 (Sprint 2): prueba en Android físico incompleta**
- Cloud desfasado: sin migraciones 005-007 ni imágenes en el bucket
- El detalle NO muestra horarios (el MVP de la tesis lo incluye)
- No existe pantalla de gestión de escenarios/eventos (RF-08, RF-10)
- Sin APK distribuible para la defensa

---

## Dependencias entre Tareas

```
T-040 (Sync cloud) ──┬──> T-046 (QA cloud) ──> T-049 (APK + QA final)
                     │
T-041 (Horarios) ────┤
                     │
T-042/043/044 (Panel gestión) ──> T-045 (Eventos) ──> T-047 (Permisos)
                                                        │
T-048 (Docs) <── todo lo anterior <── T-050 (Demo + code review final)
```

---

## Grupo 1: Cierre Técnico Pendiente

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-040** | Sincronizar proyecto cloud: `supabase link` + `db push` (005-007) + subir las 35 imágenes al bucket cloud con login admin | Nicolas | Ninguna |
| **T-041** | Agregar horarios al escenario: columna `horario` (TEXT) en migration 008 + seed + mostrar en pantalla de detalle | Nicolas | T-040 |

**Detalle:**

**Nicolas - T-040:** El `.env` actual apunta a local. Para el cloud:
```bash
supabase link --project-ref qwsahglqvqwwzpejeqep   # pedir access token a Joaquin
supabase db push                                    # aplica 005, 006, 007
node scripts/upload-seed-images.mjs                 # nuevo script, login admin -> sube bucket
```
Verificar con el smoke test contra cloud: `node scripts/smoke-test.mjs` (debe dar 28/28).

**Nicolas - T-041:** Migration `008_scenarios_horarios.sql`: `ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS horario TEXT;`
Seed con horarios realistas ("Lun-Dom 08:00-22:00"). Actualizar tipos (`src/types`) y sección
"Información" del detalle con fila de horario (icono `time-outline`). Regenerar tipos si usan
generación automática.

---

## Grupo 2: Gestión de Contenido (RF-08, RF-09, RF-10)

> Cierra los requerimientos funcionales que faltan. Solo visible para roles `admin` y `gestor`.

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-042** | Pantalla "Gestión" (tab oculto o sección en Perfil) con lista de escenarios propios/todos según rol | David | T-041 |
| **T-043** | Formulario crear/editar escenario (nombre, tipo, dirección, capacidad, estado, horario) con selector de ubicación en mapa | Angel | T-042 |
| **T-044** | CRUD de eventos por escenario (crear, editar, eliminar) desde el detalle o gestión | Angel | T-042 |
| **T-045** | Sección "Próximos eventos" en Inicio (alimentada por eventos, cierra RF-09 sin push) | David | T-044 |
| **T-046** | Permisos finos: gestor crea/edita escenarios y eventos; admin además elimina, sube imágenes y ve panel de usuarios | Joaquin | T-042, T-043, T-044 |

**Detalle:**

**David - T-042:** Nueva ruta `(tabs)/manage.tsx` (visible solo con `role in ('admin','gestor')`,
ocultar tab para el resto). FlatList con todos los escenarios (nuevo hook `useAllScenarios` que no
filtre `estado='activo'`). Acciones por fila: Editar -> `/scenario-edit/[id]`, Eliminar (soft:
estado='inactivo', solo admin). Botón flotante "+" para crear.

**Angel - T-043:** Formulario con TextInput validados (nombre requerido, capacidad numérica).
Mapa embebido pequeño para elegir/mover marcador (reutilizar config MapLibre de index.tsx).
Guardar via `supabase.from('scenarios').upsert(...)`. Al guardar, invalidar queries de escenarios.

**Angel - T-044:** En detalle, sección Eventos con botón "+ Agregar" (roles staff). Formulario
modal: nombre, fecha, hora, descripción. Eliminar con confirmación. Tabla `events` ya existe.

**David - T-045:** En `(tabs)/index.tsx`, debajo del mapa o como carrusel horizontal: tarjetas de
los próximos 5 eventos (`fecha >= hoy`, order by fecha asc). Tap -> abre el escenario relacionado.

**Joaquin - T-046:** Helper centralizado `src/utils/permissions.ts`:
```typescript
canManageContent(role) // admin, gestor
canDeleteScenario(role) // admin
canUploadImages(role)   // admin (ya implementado)
canManageUsers(role)    // admin
```
Refactorizar `scenario/[id].tsx` y pantallas nuevas para usar el helper (no comparar strings sueltos).
RLS: migración 009 con políticas INSERT/UPDATE en `scenarios` y `events` para staff.

---

## Grupo 3: Distribución y QA Final

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-047** | Build APK con EAS (`eas build -p android --profile preview`) e instalar en mínimo 2 celulares | David + Nicolas | T-040..T-046 |
| **T-048** | QA final: checklist completo del MVP sobre el APK (no dev server) + re-ejecutar smoke test | Angel + Joaquin | T-047 |

**Checklist T-048 (marcar en issue de GitHub):**
- [ ] Registro de cuenta nueva desde el celular
- [ ] Login con las 3 credenciales del seed
- [ ] Mapa carga tiles y marcadores; ubicación propia visible
- [ ] Búsqueda y filtros devuelven lo esperado
- [ ] Detalle muestra imagen, horario, deportes y eventos
- [ ] Favorito se agrega/quita y sobrevive reinicio de app
- [ ] Admin crea/edita escenario con ubicación de mapa
- [ ] Gestor crea evento; aparece en Próximos eventos
- [ ] Asistente NO ve tab Gestión ni puede subir imágenes
- [ ] Sin crashes en 15 minutos de uso continuo

---

## Grupo 4: Documentación y Entrega Final

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-049** | README.md: requisitos, instalación, ejecución local, variables .env, scripts, estructura | Joaquin | T-040 |
| **T-050** | Capturas de pantalla de todas las pantallas (desde APK) para capítulos 19-20 de la tesis | Angel | T-047 |
| **T-051** | Guión de demo final (5 min): flujo asistente + flujo admin/gestor, con datos preparados | Joaquin + David | T-048 |
| **T-052** | Code review final + merge de ramas sueltas a develop + tag `v1.0.0-mvp` | Joaquin | Todo |

---

## Criterios de Aceptacion del Sprint 3 (cierre del proyecto)

El proyecto está COMPLETO cuando:

- [ ] Los 10 requerimientos funcionales (RF-01 a RF-10) tienen implementación demostrable
- [ ] El smoke test da 28+/28+ tanto en local como en cloud
- [ ] La app funciona desde APK instalado (no solo dev server)
- [ ] Un admin puede gestionar escenarios y eventos desde la app
- [ ] El README permite a un tercero levantar el proyecto en menos de 15 minutos
- [ ] Capturas y guión de demo entregados al equipo de tesis
- [ ] Todo mergeado en develop, tag `v1.0.0-mvp` creado

---

## Notas Importantes

1. **Último sprint:** priorizar cerrar > perfeccionar. Si algo no llega, se documenta como trabajo futuro (la tesis ya contempla reservas/pagos fuera de alcance).
2. **No tocar el esquema** salvo las migrations definidas aquí (008 horarios, 009 políticas). Cualquier cambio extra requiere acuerdo del equipo.
3. **El cloud es la fuente de verdad para la demo.** Local es solo desarrollo. T-040 es bloqueante para todo lo demás.
4. Mantener convención de commits: `feat(scope): descripcion`. PRs a develop con review de Joaquin.
5. Si hay bloqueo > medio día, escalar inmediatamente. El tiempo no alcanza para esperar al daily.
