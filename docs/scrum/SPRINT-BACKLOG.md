# Sprint Backlog - Historias de Usuario

## Proyecto: Lugares Interactivos (DeporteYa)

> Desarrollo express de 3 semanas. Backend via Supabase (sin API custom). Agentes de IA generan el codigo base.

---

## Sprint 1: Fundamentos + Backend (Dias 1-3)

### Objetivo
Supabase configurado, esquema de base de datos creado, auth funcional, datos semilla insertados.

### Dia 1 - Lunes: Configuracion Inicial

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-001 | Crear proyecto en Supabase (nombre: lugares-interactivos) | Nicolas | Manual |
| T-002 | Configurar Expo con TypeScript, Expo Router, dependencias base | David | opencode |
| T-003 | Crear esquema SQL completo (tablas, relaciones, RLS) | Nicolas | opencode |
| T-004 | Configurar `@supabase/supabase-js` y `EXPO_PUBLIC_SUPABASE_URL/KEY` | David | opencode |
| T-005 | Crear estructura de carpetas del proyecto (`src/app/`, `src/components/`, etc.) | Angel | opencode |

### Dia 2 - Martes: Auth + Datos

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-006 | Implementar AuthContext con Supabase (login, registro, sesion) | Nicolas | opencode |
| T-007 | Crear pantallas de Login y Register conectadas a Supabase | Angel | opencode |
| T-008 | Crear seed SQL con 10-15 escenarios de prueba (datos reales de Bolivia) | Nicolas | opencode |
| T-009 | Insertar imagenes de prueba en Supabase Storage | Angel | Manual |
| T-010 | Crear flujo de navegacion basico: Splash -> Auth -> Main | David | opencode |

### Dia 3 - Miercoles: Integracion Auth

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-011 | Probar login/registro en dispositivo real | Angel + David | Manual |
| T-012 | Implementar proteccion de rutas (no autenticado -> login) | David | opencode |
| T-013 | Crear pantalla de Splash con logo y boton "Comenzar" | Angel | opencode |
| T-014 | Verificar RLS policies funcionando correctamente | Nicolas | Supabase Dashboard |
| T-015 | Fix de bugs encontrados en integracion auth | David + Nicolas | opencode |

**Entregable Sprint 1:** App con auth funcional, datos en DB, splash screen.

---

## Sprint 2: Frontend Core MVP

### Objetivo
Todas las pantallas del MVP funcionando con datos reales de Supabase.

> Sin division por dia. Tareas organizadas por grupo con dependencias claras.
> Ver `PLAN-SEMANA2.md` para detalle completo y `ASIGNACION-SPRINT2.md` para asignaciones.

### Grupo 1: Infraestructura

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| T-016 | Instalar `react-native-maps` y `expo-location` | Nicolas | Ninguna |
| T-017 | Configurar `QueryClientProvider` de React Query | David | Ninguna |
| T-018 | Crear componente `ScenarioCard` reutilizable | Angel | Ninguna |
| T-019 | Crear componente `LoadingSpinner` | Angel | Ninguna |
| T-020 | Crear componente `EmptyState` | Angel | Ninguna |

### Grupo 2: Capa de Datos

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| T-021 | Crear hook `useScenarios` con React Query | Nicolas | T-016 |
| T-022 | Crear hook `useFavorites` con React Query | Nicolas | T-016 |
| T-023 | Implementar pantalla de mapa con `react-native-maps` | David | T-016, T-017 |
| T-024 | Obtener ubicacion del usuario con `expo-location` | David | T-016 |

### Grupo 3: Pantallas MVP

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| T-025 | Implementar pantalla de catalogo (FlatList) | Angel | T-018, T-019, T-020, T-021 |
| T-026 | Conectar marcadores del mapa con pantalla de detalle | David | T-023 |
| T-027 | Implementar pantalla de Favoritos | Angel | T-018, T-019, T-020, T-022 |
| T-028 | Implementar pantalla de detalle de escenario | Angel | T-018, T-019, T-021, T-022 |

### Grupo 4: Funcionalidad + Pulido

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| T-029 | Implementar busqueda por nombre en catalogo | David | T-025 |
| T-030 | Implementar filtros por deporte y tipo | David | T-025 |
| T-031 | Implementar toggle de favorito (agregar/quitar) | David | T-022, T-028 |
| T-032 | Manejar estados de error de red en todas las pantallas | David | T-025, T-027, T-028 |
| T-033 | Pull-to-refresh en catalogo y favoritos | Angel | T-025, T-027 |
| T-034 | Subir imagenes de prueba a Supabase Storage | Nicolas | T-016 |

### Grupo 5: Integracion y Cierre

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| T-035 | Test end-to-end: auth → mapa → detalle → favorito | Joaquin + Angel | Todas |
| T-036 | Corregir bugs de integracion | David + Nicolas | T-035 |
| T-037 | Verificar que funciona en Android real | Angel + David | T-036 |
| T-038 | Optimizar queries de Supabase (indices) | Nicolas | T-035 |
| T-039 | Code review de todo el codigo del sprint | Joaquin | Todas |

**Entregable Sprint 2:** App completa con todas las pantallas del MVP funcionando.

---

## Sprint 3: Pulido + Pruebas + Entrega (Dias 9-12)

### Objetivo
MVP pulido, sin bugs criticos, tema visual consistente, documentacion lista.

### Dia 9 - Jueves: Tema Visual

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-040 | Definir paleta de colores y tipografia del proyecto | Angel + David | opencode |
| T-041 | Aplicar tema consistente en todas las pantallas | Angel | opencode |
| T-042 | Crear componentes base con tema (Button, Input, Card) | Angel | opencode |
| T-043 | Ajustar espaciados, margenes y tamanos de fuente | Angel | opencode |

### Dia 10 - Viernes: Bugs + Rendimiento

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-044 | Corregir todos los bugs reportados en testing | David + Nicolas | opencode |
| T-045 | Optimizar carga de imagenes (lazy loading, cache) | David | opencode |
| T-046 | Manejar errores de red con mensajes amigables | David | opencode |
| T-047 | Verificar rendimiento de mapa en dispositivos basicos | David | Manual |

### Dia 11 - Lunes: Testing Final

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-048 | Ejecutar checklist completo de pruebas funcionales | Angel | Checklist |
| T-049 | Probar en al menos 2 dispositivos Android diferentes | Angel + David | Manual |
| T-050 | Verificar que auth, mapa, catalogo, detalle, favoritos funcionan | Angel | Manual |
| T-051 | Documentar bugs restantes y priorizar correccion | Angel | GitHub Issues |

### Dia 12 - Martes: Entrega

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-052 | Corregir bugs criticos finales | David + Nicolas | opencode |
| T-053 | Crear README con instrucciones de instalacion y uso | Joaquin | opencode |
| T-054 | Preparar demo grabada de la app | David + Angel | Manual |
| T-055 | Documentacion tecnica final (diagrama, modelo de datos) | Joaquin + Nicolas | opencode |
| T-056 | Merge final a `main` y tag de version v1.0.0 | Joaquin | Git |

**Entregable Sprint 3:** MVP funcional, documentado, listo para entregar.

---

## Resumen de Tareas por Persona

| Persona | Sprint 1 | Sprint 2 | Sprint 3 | Total |
|---|---|---|---|---|
| **Joaquin** | Coordinacion | Review + Test E2E | Docs + Entrega | ~15h |
| **Nicolas** | Supabase + DB + Auth | Deps + Hooks + Storage + Optimizacion | Bugs + Entrega | ~30h |
| **David** | Expo + Navegacion | Mapa + Busqueda + Filtros + Error Handling | Bugs + Rendimiento + Demo | ~30h |
| **Angel** | Componentes + Auth UI | UI Components + Catalogo + Favoritos + Detalle + Testing | Tema + Testing Final | ~25h |
