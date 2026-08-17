# Asignacion de Tareas por Desarrollador

## Proyecto: Lugares Interactivos (DeporteYa)

> MVP express de 3 semanas. Supabase como backend. Agentes de IA generan el codigo.

---

## Joaquin Alessandro Felipez Rojas - Scrum Master / Lider Tecnico

### Que hace
- Coordinar el equipo y las reuniones
- Supervisar que los agentes de IA generen codigo correcto
- Revisar PRs criticos (auth, navegacion, integracion)
- Tomar decisiones de arquitectura rapida
- Documentacion final y presentacion

### Tareas por Dia

| Dia | Tarea | Estado |
|---|---|---|
| 1 | Crear repo en GitHub, configurar ramas (main, develop) | Pendiente |
| 1 | Configurar tablero de GitHub Projects | Pendiente |
| 2 | Supervisar configuracion de Supabase y auth | Pendiente |
| 3 | Revision de integracion auth | Pendiente |
| 4-5 | Revision de pantallas principales | Pendiente |
| 6 | Coordinar integracion de favoritos y busqueda | Pendiente |
| 7-8 | Revision de integracion total | Pendiente |
| 9 | Aprobar tema visual | Pendiente |
| 10 | Supervisar correccion de bugs | Pendiente |
| 11 | Revisar pruebas de Angel | Pendiente |
| 12 | Crear README, documentacion, preparar entrega | Pendiente |

**Horas estimadas: ~15h**

---

## Nicolas Sebastian Reguerin Meneses - Desarrollador Full Stack

### Que hace
- Configurar y administrar Supabase (proyecto, DB, auth, RLS, storage)
- Disenar esquema SQL y relaciones
- Implementar logica de datos (favoritos, busqueda, optimizacion)
- Apoyar en correccion de bugs criticos

### Tareas por Dia

| Dia | Tarea | Estado |
|---|---|---|
| 1 | Crear proyecto en Supabase, configurar auth providers | Pendiente |
| 1 | Escribir esquema SQL completo (tablas, enums, relaciones, RLS) | Pendiente |
| 2 | Implementar AuthContext con supabase-js | Pendiente |
| 2 | Crear seed SQL con 10-15 escenarios reales de Bolivia | Pendiente |
| 3 | Verificar RLS policies, probar auth end-to-end | Pendiente |
| 6 | Implementar funcionalidad de favoritos (tabla + logica) | Pendiente |
| 8 | Optimizar queries de Supabase (indices, selects) | Pendiente |
| 10 | Corregir bugs de datos y integracion | Pendiente |
| 12 | Documentacion tecnica: diagrama, modelo de datos | Pendiente |

**Horas estimadas: ~30h**

---

## David Willy Cruz Huanca - Desarrollador Full Stack

### Que hace
- Configurar Expo, navegacion y estructura de la app
- Implementar pantalla de mapa con react-native-maps
- Integrar busqueda, filtros y conectividad con Supabase
- Corregir bugs de UI y rendimiento

### Tareas por Dia

| Dia | Tarea | Estado |
|---|---|---|
| 1 | Configurar Expo con TypeScript, Expo Router, dependencias | Pendiente |
| 1 | Configurar cliente Supabase y variables de entorno | Pendiente |
| 2 | Crear flujo de navegacion: Splash -> Auth -> Tabs | Pendiente |
| 3 | Implementar proteccion de rutas (auth guard) | Pendiente |
| 4 | Implementar pantalla de mapa con react-native-maps | Pendiente |
| 4 | Cargar marcadores de escenarios desde Supabase | Pendiente |
| 5 | Implementar navegacion inferior (tabs) | Pendiente |
| 5 | Conectar marcadores con pantalla de detalle | Pendiente |
| 6 | Implementar busqueda por nombre | Pendiente |
| 6 | Implementar filtros por deporte y tipo | Pendiente |
| 7 | Pull-to-refresh, loading states | Pendiente |
| 8 | Integracion total, probar flujo completo | Pendiente |
| 10 | Corregir bugs, optimizar mapa | Pendiente |
| 10 | Manejar errores de red | Pendiente |
| 12 | Grabar demo de la app | Pendiente |

**Horas estimadas: ~30h**

---

## Angel Gabriel Rojas Hinojosa - Desarrollador Junior / QA

### Que hace
- Crear pantallas de UI (login, registro, detalle, favoritos)
- Crear componentes reutilizables con el tema
- Testing manual de toda la app
- Insertar datos de prueba y verificar visualmente

### Tareas por Dia

| Dia | Tarea | Estado |
|---|---|---|
| 1 | Crear estructura de carpetas (src/app, src/components, etc.) | Pendiente |
| 2 | Crear pantallas de Login y Register | Pendiente |
| 3 | Crear pantalla de Splash con logo | Pendiente |
| 4 | Crear componente ScenarioCard | Pendiente |
| 4 | Crear pantalla de catalogo con FlatList | Pendiente |
| 5 | Crear pantalla de detalle de escenario | Pendiente |
| 5 | Implementar boton de favorito en detalle | Pendiente |
| 6 | Crear pantalla de Favoritos | Pendiente |
| 7 | Mostrar eventos en el detalle | Pendiente |
| 7 | Loading states y estados vacios | Pendiente |
| 8 | Probar en Android real, reportar bugs | Pendiente |
| 9 | Definir paleta de colores y tipografia | Pendiente |
| 9 | Aplicar tema en todas las pantallas | Pendiente |
| 10 | Crear componentes base con tema (Button, Input, Card) | Pendiente |
| 11 | Ejecutar checklist de pruebas funcionales | Pendiente |
| 11 | Probar en 2 dispositivos diferentes | Pendiente |
| 12 | Documentar bugs restantes | Pendiente |

**Horas estimadas: ~25h**

---

## Matriz RACI por Funcionalidad

| Funcionalidad | Joaquin | Nicolas | David | Angel |
|---|---|---|---|---|
| **Supabase Setup** | I | R | C | - |
| **Esquema SQL** | I | R | C | - |
| **Auth (login/registro)** | I | R | C | C |
| **Navegacion** | I | - | R | C |
| **Mapa** | I | C | R | C |
| **Catalogo** | I | C | C | R |
| **Detalle** | I | C | C | R |
| **Favoritos** | I | R | C | R |
| **Busqueda/Filtros** | I | C | R | - |
| **Tema Visual** | A | - | C | R |
| **Testing** | I | C | C | R |
| **Documentacion** | R | C | C | C |

**R** = Responsable, **A** = Aprobador, **C** = Consultado, **I** = Informado

---

## Dependencias Criticas

```
Dia 1: Nicolas crea Supabase + SQL  -->  Dia 2: David conecta Expo a Supabase
                                        -->  Dia 2: Angel crea pantallas auth

Dia 3: Auth funcionando  -->  Dia 4: David crea mapa con datos de Supabase
                          -->  Dia 4: Angel crea catalogo con datos de Supabase

Dia 5: Navegacion lista  -->  Dia 6: David integra busqueda + filtros
                           -->  Dia 6: Angel integra favoritos

Dia 8: Todo integrado  -->  Dia 9: Angel aplica tema visual
                        -->  Dia 10: David + Nicolas corrigen bugs
                        -->  Dia 11: Angel hace testing final
                        -->  Dia 12: Joaquin prepara entrega
```
