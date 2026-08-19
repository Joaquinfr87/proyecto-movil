# Asignacion de Tareas - Sprint 2

## Proyecto: Lugares Interactivos (DeporteYa)

> **Sprint 2:** Frontend Core MVP
> **Regla clave:** Angel (Junior) trabaja en tareas independientes que no bloquean a los seniors.

---

## Joaquin Alessandro Felipez Rojas - Scrum Master / Lider Tecnico

### Responsabilidades
- Coordinar el equipo y el avance del sprint
- Hacer code review de todo el codigo mergesdo en develop
- Probar end-to-end el flujo completo de la app
- Tomar decisiones de arquitectura rapida
- Documentar bugs y priorizar correccion

### Tareas Asignadas

| ID | Tarea | Dependencias |
|----|-------|--------------|
| **T-035** | Test end-to-end: auth → mapa → detalle → favorito | Todas |
| **T-039** | Code review de todo el codigo del sprint | Todas |

---

## Nicolas Sebastian Reguerin Meneses - Desarrollador Full Stack

### Responsabilidades
- Instalar dependencias criticas (maps, location)
- Crear hooks de datos con React Query
- Subir imagenes a Supabase Storage
- Optimizar queries de base de datos

### Tareas Asignadas (en orden)

| ID | Tarea | Grupo | Dependencias |
|----|-------|-------|--------------|
| **T-016** | Instalar `react-native-maps` y `expo-location` | Infra | Ninguna |
| **T-021** | Crear hook `useScenarios` con React Query | Datos | T-016 |
| **T-022** | Crear hook `useFavorites` con React Query | Datos | T-016 |
| **T-034** | Subir imagenes de prueba a Supabase Storage | Pulido | T-016 |
| **T-038** | Optimizar queries de Supabase (indices) | Cierre | T-035 |

### Orden de ejecucion sugerido
1. T-016 (instalar deps) → desbloquea a todo el equipo
2. T-021 (useScenarios) → desbloquea catalogo y detalle
3. T-022 (useFavorites) → desbloquea favoritos y toggle
4. T-034 (subir imagenes) → mejora visual del detalle
5. T-038 (optimizar) → al final del sprint

---

## David Willy Cruz Huanca - Desarrollador Full Stack

### Responsabilidades
- Configurar React Query provider
- Implementar mapa con react-native-maps
- Implementar busqueda, filtros y toggle de favorito
- Manejar errores de red en todas las pantallas

### Tareas Asignadas (en orden)

| ID | Tarea | Grupo | Dependencias |
|----|-------|-------|--------------|
| **T-017** | Configurar `QueryClientProvider` en `_layout.tsx` | Infra | Ninguna |
| **T-023** | Implementar pantalla de mapa con `react-native-maps` | Datos | T-016, T-017 |
| **T-024** | Obtener ubicacion del usuario con `expo-location` | Datos | T-016 |
| **T-026** | Conectar marcadores del mapa con pantalla de detalle | Pantallas | T-023 |
| **T-029** | Implementar busqueda por nombre en catalogo | Pulido | T-025 |
| **T-030** | Implementar filtros por deporte y tipo | Pulido | T-025 |
| **T-031** | Implementar toggle de favorito (agregar/quitar) | Pulido | T-022, T-028 |
| **T-032** | Manejar estados de error de red en todas las pantallas | Pulido | T-025, T-027, T-028 |
| **T-036** | Corregir bugs de integracion | Cierre | T-035 |

### Orden de ejecucion sugerido
1. T-017 (QueryClientProvider) → primero, desbloquea React Query
2. T-023 + T-024 (mapa + ubicacion) → feature principal
3. T-026 (conexion mapa → detalle)
4. T-029 + T-030 (busqueda y filtros) → cuando T-025 este listo
5. T-031 (toggle favorito) → cuando T-022 y T-028 esten listos
6. T-032 (error handling) → al final
7. T-036 (bug fixes) → despues del testing

---

## Angel Gabriel Rojas Hinojosa - Desarrollador Junior / QA

### Responsabilidades
- Crear componentes reutilizables de UI
- Implementar pantallas de catalogo, favoritos y detalle
- Testing manual en dispositivo real
- Pull-to-refresh en pantallas con listas

### Tareas Asignadas (en orden)

| ID | Tarea | Grupo | Dependencias |
|----|-------|-------|--------------|
| **T-018** | Crear componente `ScenarioCard` reutilizable | Infra | Ninguna |
| **T-019** | Crear componente `LoadingSpinner` | Infra | Ninguna |
| **T-020** | Crear componente `EmptyState` | Infra | Ninguna |
| **T-025** | Implementar pantalla de catalogo (FlatList) | Pantallas | T-018, T-019, T-020, T-021 |
| **T-027** | Implementar pantalla de Favoritos | Pantallas | T-018, T-019, T-020, T-022 |
| **T-028** | Implementar pantalla de detalle de escenario | Pantallas | T-018, T-019, T-021, T-022 |
| **T-033** | Pull-to-refresh en catalogo y favoritos | Pulido | T-025, T-027 |
| **T-035** | Test end-to-end (con Joaquin) | Cierre | Todas |
| **T-037** | Verificar que funciona en Android real | Cierre | T-036 |

### Orden de ejecucion sugerido
1. T-018 + T-019 + T-020 (componentes UI) → primero, sin dependencias
2. T-025 (catalogo) → cuando useScenarios este listo
3. T-027 (favoritos) → cuando useFavorites este listo
4. T-028 (detalle) → cuando ambos hooks esten listos
5. T-033 (pull-to-refresh) → refactor rapido
6. T-035 + T-037 (testing) → al final del sprint

### Por que estas tareas para el junior
- Son **principalmente UI** con specs claras
- No requieren conocimiento profundo de Supabase o React Query
- Los hooks de datos se los provee Nicolas
- Puede trabajar **en paralelo** desde el inicio (componentes UI no dependen de nada)
- Si se trabaja, Nicolas o David le resuelven dudas rapidamente

---

## Flujo Paralelo del Sprint

```
Semana completa:

Nicolas:  T-016 ──> T-021 ──> T-022 ──> T-034 ──> T-038
                │         │
David:    T-017 ──> T-023 ──> T-024 ──> T-026 ──> T-029/030 ──> T-031 ──> T-032 ──> T-036
                │
Angel:    T-018/019/020 ──> T-025 ──> T-027 ──> T-028 ──> T-033 ──> T-035/037

Joaquin:  Supervision continua ──> T-035 ──> T-039
```

### Puntos de sincronizacion
1. **Despues de T-016:** Nicolas avisa que las deps estan instaladas. David y Angel pueden empezar.
2. **Despues de T-021 + T-022:** Los hooks estan listos. Angel puede empezar pantallas.
3. **Despues de T-025 + T-027 + T-028:** Todas las pantallas basicas listas. David integra busqueda/filtros.
4. **Antes del cierre:** Joaquin + Angel hacen testing end-to-end.

---

## Matriz de Asignacion Final

| Tarea | Joaquin | Nicolas | David | Angel |
|-------|---------|---------|-------|-------|
| T-016 Instalar deps | - | **R** | - | - |
| T-017 QueryClientProvider | - | - | **R** | - |
| T-018 ScenarioCard | - | - | - | **R** |
| T-019 LoadingSpinner | - | - | - | **R** |
| T-020 EmptyState | - | - | - | **R** |
| T-021 useScenarios | - | **R** | - | - |
| T-022 useFavorites | - | **R** | - | - |
| T-023 Mapa | - | - | **R** | - |
| T-024 Ubicacion | - | - | **R** | - |
| T-025 Catalogo | - | C | C | **R** |
| T-026 Mapa→Detalle | - | - | **R** | - |
| T-027 Favoritos | - | C | C | **R** |
| T-028 Detalle | - | C | C | **R** |
| T-029 Busqueda | - | - | **R** | - |
| T-030 Filtros | - | - | **R** | - |
| T-031 Toggle favorito | - | C | **R** | - |
| T-032 Error handling | - | - | **R** | - |
| T-033 Pull-to-refresh | - | - | - | **R** |
| T-034 Subir imagenes | - | **R** | - | - |
| T-035 Test E2E | **R** | C | C | **R** |
| T-036 Bug fixes | I | C | **R** | - |
| T-037 Test Android real | C | - | **R** | **R** |
| T-038 Optimizar DB | I | **R** | - | - |
| T-039 Code review | **R** | C | C | C |

**R** = Responsable, **C** = Consultado, **I** = Informado
