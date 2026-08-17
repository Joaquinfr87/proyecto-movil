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

## Sprint 2: Frontend Core (Dias 4-8)

### Objetivo
Todas las pantallas del MVP funcionando: mapa, catalogo, detalle, favoritos, busqueda.

### Dia 4 - Jueves: Mapa + Catalogo

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-016 | Implementar pantalla de mapa con react-native-maps | David | opencode |
| T-017 | Cargar marcadores de escenarios desde Supabase en el mapa | David | opencode |
| T-018 | Implementar pantalla de catalogo (FlatList de escenarios) | Angel | opencode |
| T-019 | Crear componente ScenarioCard reutilizable | Angel | opencode |
| T-020 | Obtener ubicacion actual del usuario con expo-location | David | opencode |

### Dia 5 - Viernes: Detalle + Navegacion

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-021 | Implementar pantalla de detalle de escenario | Angel | opencode |
| T-022 | Implementar navegacion inferior (tabs: Inicio, Buscar, Perfil) | David | opencode |
| T-023 | Conectar detalle con parametros de ruta (ID del escenario) | David | opencode |
| T-024 | Mostrar disciplinas, horarios, capacidad en el detalle | Angel | opencode |
| T-025 | Implementar boton de favorito en el detalle | Angel | opencode |

### Dia 6 - Lunes: Favoritos + Busqueda

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-026 | Implementar tabla de favoritos y funcion de guardado | Nicolas | opencode |
| T-027 | Crear pantalla de Favoritos con lista de escenarios guardados | Angel | opencode |
| T-028 | Implementar busqueda por nombre en el catalogo | David | opencode |
| T-029 | Implementar filtros basicos (por deporte, tipo de escenario) | David | opencode |
| T-030 | Conectar marcadores del mapa con pantalla de detalle | David | opencode |

### Dia 7 - Martes: Eventos + Pulido Basico

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-031 | Mostrar eventos programados en el detalle del escenario | Angel | opencode |
| T-032 | Implementar pull-to-refresh en catalogo y favoritos | David | opencode |
| T-033 | Agregar loading states (spinners) en todas las pantallas | Angel | opencode |
| T-034 | Manejar estados vacios (sin resultados, sin favoritos) | Angel | opencode |
| T-035 | Integrar todo: probar flujo completo de navegacion | David + Nicolas | Manual |

### Dia 8 - Miercoles: Integracion Total

| ID | Tarea | Asignado | Herramienta IA |
|---|---|---|---|
| T-036 | Probar en Android real: auth -> mapa -> detalle -> favorito | Angel + David | Manual |
| T-037 | Corregir bugs de integracion encontrados | David + Nicolas | opencode |
| T-038 | Optimizar consultas a Supabase (indices, selects optimizados) | Nicolas | Supabase Dashboard |
| T-039 | Verificar que los datos semilla se ven bien en todas las pantallas | Angel | Manual |

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
| **Joaquin** | Coordinacion | Revision | Docs + Entrega | ~15h |
| **Nicolas** | Supabase + DB + Auth | Favoritos + Optimizacion | Bugs + Entrega | ~30h |
| **David** | Expo + Navegacion | Mapa + Busqueda + Filtros | Bugs + Rendimiento + Demo | ~30h |
| **Angel** | Componentes + Auth UI | Detalle + Favoritos + Eventos | Tema + Testing | ~25h |
