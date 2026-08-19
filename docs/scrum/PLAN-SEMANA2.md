# Plan de Desarrollo - Sprint 2: Frontend Core MVP

## Equipo: Lugares Interactivos (DeporteYa)

> **Objetivo:** Todas las pantallas del MVP funcionando con datos reales de Supabase.
> **Enfoque:** Funcionalidad > Perfeccion. Priorizar features core.

---

## Estado Actual (fin Sprint 1)

### Completado
- Supabase configurado (local + cloud)
- Esquema SQL con 7 tablas, RLS, triggers, seed data (20 escenarios reales de Bolivia)
- Auth funcional: login, registro, logout, sesion persistente
- AuthGuard protegiendo rutas
- Splash screen con logo
- Navegacion por tabs (Inicio, Buscar, Favoritos, Perfil)
- Perfil de usuario con logout
- Theme system (colors, spacing)
- TypeScript types para todas las tablas

### Pendiente (pantallas placeholder)
- `(tabs)/index.tsx` → Solo muestra texto "Lugares Interactivos"
- `(tabs)/search.tsx` → Solo muestra texto "Buscar Escenarios"
- `(tabs)/favorites.tsx` → Solo muestra texto "Mis Favoritos"
- `scenario/[id].tsx` → Solo muestra ID del escenario

### Dependencias faltantes
- `react-native-maps` (requerida para mapa)
- `expo-location` (requerida para ubicacion del usuario)

---

## Dependencias entre Tareas

```
T-016 (Instalar deps) ──┬──> T-021 (Hooks de datos) ──┬──> T-025 (Catalogo)
                        │                              ├──> T-027 (Favoritos)
                        │                              └──> T-028 (Detalle data)
                        ├──> T-022 (Componentes UI) ───┬──> T-025 (Catalogo)
                        │                              ├──> T-027 (Favoritos)
                        │                              └──> T-028 (Detalle UI)
                        └──> T-023 (Mapa) ───────────────> T-026 (Mapa + Detalle)

T-025 (Catalogo) + T-028 (Detalle) ──> T-029 (Busqueda + Filtros)
T-027 (Favoritos) + T-028 (Detalle) ──> T-030 (Toggle favorito)
T-023 (Mapa) ──> T-024 (Ubicacion usuario)
```

---

## Grupo 1: Infraestructura

> **Pre-requisito para todo lo demas.** Completar primero.

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-016** | Instalar `react-native-maps` y `expo-location` | Nicolas | Ninguna |
| **T-017** | Configurar `QueryClientProvider` de React Query en `_layout.tsx` | David | Ninguna |
| **T-018** | Crear componente `ScenarioCard` reutilizable | Angel | Ninguna |
| **T-019** | Crear componente `LoadingSpinner` | Angel | Ninguna |
| **T-020** | Crear componente `EmptyState` | Angel | Ninguna |

**Detalle:**

**Nicolas - T-016:**
```bash
pnpm add react-native-maps expo-location
```
Verificar que compila despues de instalar. No romper nada existente.

**David - T-017:**
- Envolver la app en `<QueryClientProvider>` dentro de `_layout.tsx`
- Configurar `QueryClient` con `staleTime: 5 minutos`
- Seguir convenciones de TECHNOLOGIES.md

**Angel - T-018:** Crear `src/components/common/ScenarioCard.tsx`
- Recibe props: `scenario: Scenario`, `onPress: (id: string) => void`
- Muestra: imagen principal (o placeholder), nombre, tipo, capacidad, direccion
- Estilos usando `colors` y `spacing` del theme
- Export default

**Angel - T-019:** Crear `src/components/common/LoadingSpinner.tsx`
- ActivityIndicator centrado con color `colors.primary`
- Recibe prop opcional `message?: string`
- Fondo `colors.background`

**Angel - T-020:** Crear `src/components/common/EmptyState.tsx`
- Icono + titulo + subtitulo centrados
- Props: `icon: string`, `title: string`, `subtitle: string`
- Estilos consistentes con el theme

---

## Grupo 2: Capa de Datos (Hooks)

> **Nicolas crea los hooks. David crea el mapa. Angel crea UI en paralelo.**

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-021** | Crear hook `useScenarios` con React Query | Nicolas | T-016 |
| **T-022** | Crear hook `useFavorites` con React Query | Nicolas | T-016 |
| **T-023** | Implementar pantalla de mapa con `react-native-maps` | David | T-016, T-017 |
| **T-024** | Obtener ubicacion del usuario con `expo-location` | David | T-016 |

**Detalle:**

**Nicolas - T-021:** Crear `src/hooks/useScenarios.ts`
```typescript
// useScenarios() -> useQuery con data, isLoading, error
// useScenario(id: string) -> useQuery de un solo escenario
// Select: id, nombre, tipo, descripcion, capacidad, direccion, latitud, longitud, estado
// Join con scenario_images para obtener imagen principal
// Join con scenario_sports -> sports para obtener deportes
// staleTime: 5 minutos
```

**Nicolas - T-022:** Crear `src/hooks/useFavorites.ts`
```typescript
// useFavorites(userId: string) -> useQuery de favoritos del usuario
//   Join con scenarios para tener los datos del escenario
// useToggleFavorite() -> useMutation para agregar/quitar favorito
//   Invalidar query de favorites en onSuccess
```

**David - T-023:** Implementar `src/app/(tabs)/index.tsx` (pantalla de mapa)
- Importar `MapView` y `Marker` de `react-native-maps`
- Cargar escenarios con `useScenarios()`
- Renderizar marcadores con titulo y coordenadas
- Al tocar marcador: navegar a `/scenario/[id]`
- Loading state con `LoadingSpinner`
- Mapa con region inicial en Bolivia centro (-17.0, -65.0)

**David - T-024:** Integrar ubicacion del usuario en el mapa (T-023)
- Usar `expo-location` para obtener posicion actual
- Mostrar marcador especial (azul) en la ubicacion del usuario
- Centrar mapa en ubicacion del usuario al cargar
- Manejar permisos: si no tiene permiso, mostrar mapa sin ubicacion

---

## Grupo 3: Pantallas MVP

> **Depende de Grupo 1 y 2. Aqui se construyen las pantallas reales.**

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-025** | Implementar pantalla de catalogo (FlatList) | Angel | T-018, T-019, T-020, T-021 |
| **T-026** | Conectar marcadores del mapa con pantalla de detalle | David | T-023 |
| **T-027** | Implementar pantalla de Favoritos | Angel | T-018, T-019, T-020, T-022 |
| **T-028** | Implementar pantalla de detalle de escenario | Angel | T-018, T-019, T-021, T-022 |

**Detalle:**

**Angel - T-025:** Implementar `src/app/(tabs)/search.tsx` como catalogo
- FlatList con `ScenarioCard` para cada escenario
- Datos de `useScenarios()`
- `RefreshControl` para pull-to-refresh
- `LoadingSpinner` mientras carga
- `EmptyState` si no hay resultados
- Al tocar card → navegar a `/scenario/[id]`

**David - T-026:** Conectar mapa con detalle
- Al tocar un marker en el mapa → `router.push(/scenario/${id})`
- Verificar que la navegacion funciona con el parametro ID
- Al tocar el marcador del usuario, no navegar (solo info basica)

**Angel - T-027:** Implementar `src/app/(tabs)/favorites.tsx`
- FlatList con `ScenarioCard` para cada favorito
- Datos de `useFavorites(user.id)`
- `LoadingSpinner` mientras carga
- `EmptyState` cuando no tiene favoritos ("Guarda tus escenarios favoritos")
- Pull-to-refresh
- Al tocar card → navegar a `/scenario/[id]`

**Angel - T-028:** Implementar `src/app/scenario/[id].tsx`
- Header con imagen principal (o placeholder si no hay)
- Seccion de informacion: nombre, descripcion, capacidad, direccion, estado
- Seccion de deportes disponibles (chips/tags)
- Seccion de eventos proximos (lista)
- Boton flotante de favorito (corazon) usando `useToggleFavorite()`
- `LoadingSpinner` mientras carga
- `ScrollView` para todo el contenido

---

## Grupo 4: Funcionalidad + Pulido

> **Completar la funcionalidad core y pulir la experiencia.**

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-029** | Implementar busqueda por nombre en catalogo | David | T-025 |
| **T-030** | Implementar filtros por deporte y tipo de escenario | David | T-025 |
| **T-031** | Implementar toggle de favorito (agregar/quitar) | David | T-022, T-028 |
| **T-032** | Manejar estados de error de red en todas las pantallas | David | T-025, T-027, T-028 |
| **T-033** | Agregar pull-to-refresh en catalogo y favoritos | Angel | T-025, T-027 |
| **T-033** | Subir imagenes de prueba a Supabase Storage | Nicolas | T-016 |

**Detalle:**

**David - T-029:** Busqueda en catalogo
- Barra de busqueda (`TextInput`) en la parte superior de `search.tsx`
- Filtrar por `scenario.nombre` (case-insensitive)
- Debounce de 300ms para no hacer fetch en cada tecla
- Usar estado local para el texto de busqueda, filtrar del array ya cargado

**David - T-030:** Filtros en catalogo
- Chips/botones para filtrar por deporte (chips horizontales scrollables)
- Chips para filtrar por tipo de escenario (estadio, cancha, coliseo, etc.)
- Filtros acumulativos (puedes seleccionar deporte Y tipo)
- boton "Limpiar filtros"
- Los filtros se aplican al array en memoria (ya cargado por useScenarios)

**David - T-031:** Toggle favorito en detalle
- Boton de corazon (vacio/lleno) en la pantalla de detalle
- Al tocar: llamar `useToggleFavorite()`
- Actualizar UI optimistamente (cambiar icono antes de respuesta)
- Mostrar feedback visual (animacion simple o cambio de color)

**David - T-032:** Error handling global
- Crear componente `ErrorState` en `src/components/common/ErrorState.tsx`
- Mostrar en todas las pantallas cuando `error` de React Query es truthy
- Mensaje: "Error al cargar datos. Toca para reintentar."
- Boton de reintentar que hace `refetch()`

**Angel - T-033:** Pull-to-refresh
- En catalogo: `RefreshControl` en el FlatList
- En favoritos: `RefreshControl` en el FlatList
- Usar `refetch()` de React Query
- Indicador visual de refresh

**Nicolas - T-034:** Subir imagenes a Supabase Storage
- Buscar 3-5 imagenes de escenarios deportivos de Bolivia (Unsplash/Pexels)
- Subir al bucket `scenario-images`
- Actualizar las URLs en `scenario_images` si es necesario
- Verificar que las imagenes se cargan en la app

---

## Grupo 5: Integracion y Cierre

> **Probar todo junto, corregir bugs, preparar para Sprint 3.**

| ID | Tarea | Asignado | Dependencias |
|----|-------|----------|--------------|
| **T-035** | Test end-to-end: auth → mapa → detalle → favorito | Joaquin + Angel | Todas |
| **T-036** | Corregir bugs de integracion | David + Nicolas | T-035 |
| **T-037** | Verificar que funciona en Android real | Angel + David | T-036 |
| **T-038** | Optimizar queries de Supabase (indices) | Nicolas | T-035 |
| **T-039** | Code review de todo el codigo del sprint | Joaquin | Todas |

**Detalle:**

**Joaquin + Angel - T-035:** Testing completo
- Flujo: Abrir app → Splash → Login → Ver mapa → Tocar escenario → Ver detalle → Agregar favorito → Ir a favoritos → Ver favorito → Buscar → Filtrar → Logout
- Probar con las 3 credenciales del seed
- Documentar bugs en GitHub Issues

**David + Nicolas - T-036:** Fix de bugs
- Corregir todos los bugs reportados en T-035
- Priorizar bugs que impiden uso sobre bugs cosméticos

**Angel + David - T-037:** Test en dispositivo real
- Probar en al menos 1 celular Android
- Verificar que el mapa carga bien
- Verificar que las imagenes se ven
- Verificar que la navegacion no tiene saltos raros

**Nicolas - T-038:** Optimizar DB
- Revisar queries lentas en Supabase Dashboard
- Agregar indices si es necesario
- Verificar que los selects no traen data innecesaria

**Joaquin - T-039:** Code review
- Revisar todo el codigo mergesdo en develop en este sprint
- Verificar convenciones de codigo
- Verificar que no hay secrets o .env subidos
- Aprobar o pedir cambios

---

## Criterios de Aceptacion del Sprint 2

El Sprint 2 esta COMPLETO cuando:

- [ ] El mapa carga y muestra marcadores de escenarios reales
- [ ] La ubicacion del usuario se muestra en el mapa
- [ ] El catalogo lista todos los escenarios desde Supabase
- [ ] La busqueda filtra por nombre
- [ ] Los filtros por deporte y tipo funcionan
- [ ] El detalle muestra info completa (nombre, desc, capacidad, deportes, eventos)
- [ ] Se puede agregar/quitar un escenario de favoritos
- [ ] La pantalla de favoritos muestra los escenarios guardados
- [ ] Los loading states aparecen en todas las pantallas
- [ ] Los errores de red muestran mensajes amigables
- [ ] Pull-to-refresh funciona en catalogo y favoritos
- [ ] La app funciona en un Android real sin crashes
- [ ] Todo esta mergeado en `develop` sin conflictos

---

## Notas Importantes

1. **Instalar dependencias primero** (T-016) antes de cualquier trabajo con mapa o ubicacion.

2. **Angel puede trabajar en paralelo** con Nicolas y David desde el Grupo 1. Sus tareas de UI no dependen de la logica de datos.

3. **No sobre-ingenieria.** Es un MVP. Si algo funciona y se ve razonable, esta listo.

4. **Usar los tipos existentes** en `src/types/index.ts`. No crear tipos duplicados.

5. **Seguir convenciones** de TECHNOLOGIES.md (imports, naming, estructura de componentes).

6. **Commits con convencion**: `feat(scope): descripcion` (ej: `feat(map): implementar mapa con marcadores`)

7. **Si hay bloqueo**, avisar inmediatamente. No esperar al daily.
