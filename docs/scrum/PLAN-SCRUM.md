# Plan de Trabajo - Desarrollo Express con Supabase

## Proyecto: Lugares Interactivos (DeporteYa)

**Equipo de Desarrollo:**

| Nombre | Rol en el Equipo |
|---|---|
| Joaquin Alessandro Felipez Rojas | Scrum Master / Lider Tecnico |
| Nicolas Sebastian Reguerin Meneses | Desarrollador Full Stack |
| David Willy Cruz Huanca | Desarrollador Full Stack |
| Angel Gabriel Rojas Hinojosa | Desarrollador Junior / QA |

---

## 1. Enfoque del Proyecto

- **Tipo:** MVP funcional express (no desarrollo profesional completo)
- **Backend:** Supabase (Auth, PostgreSQL, PostGIS, Storage, Realtime)
- **Frontend:** React Native + Expo
- **Duracion total:** 3 semanas
- **Sprints:** 3 sprints de 1 semana
- **Filosofia:** Rapido, funcional, iterativo. Los agentes de IA ejecutan gran parte del codigo, el equipo supervisa e integra.

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│            FRONTEND (Expo)              │
│  React Native + Expo Router + Maps      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          SUPABASE (BaaS)                │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │   Auth   │ │   DB     │ │ Storage │ │
│  │ (login,  │ │(Postgres │ │(imagenes│ │
│  │ registro)│ │ +PostGIS)│ │ escen.) │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
```

**No hay backend custom.** Todo se conecta directamente desde Expo a Supabase usando `@supabase/supabase-js`.

---

## 3. Fases del Proyecto

| Sprint | Dias | Objetivo | Entregable |
|---|---|---|---|
| **Sprint 1: Fundamentos + Backend** | Lunes 1 - Viernes 3 | Configurar Supabase, esquema DB, auth, datos semilla | App conectada a Supabase con auth funcional |
| **Sprint 2: Frontend Core** | Lunes 6 - Viernes 8 | Todas las pantallas del MVP funcionando | App navegable con mapa, catalogo, detalle, favoritos |
| **Sprint 3: Pulido + Pruebas** | Lunes 10 - Viernes 12 | Tema visual, bugs, pruebas, documentacion | MVP listo para entregar |

---

## 4. Roles y Responsabilidades

### Joaquin Felipez Rojas - Scrum Master / Lider Tecnico
- Coordinar sprints y ceremonias
- Supervisar el uso de agentes de IA
- Revisar PRs criticos
- Tomar decisiones de arquitectura
- Documentacion final

### Nicolas Reguerin Meneses - Desarrollador Full Stack
- Configurar Supabase (proyecto, DB, auth, RLS)
- Disenar esquema de datos SQL
- Crear funciones RPC si son necesarias
- Integracion de auth en el frontend
- Revision de codigo de Angel

### David Cruz Huanca - Desarrollador Full Stack
- Navegacion de la app (Expo Router)
- Pantalla de mapa con react-native-maps
- Integracion de Supabase en pantallas
- Manejo de estado global
- Revision de codigo de Angel

### Angel Gabriel Rojas Hinojosa - Desarrollador Junior / QA
- Pantallas de UI (login, registro, detalle, favoritos)
- Componentes reutilizables
- Testing manual
- Seeds de datos de prueba
- Documentacion

---

## 5. Herramientas

| Herramienta | Uso |
|---|---|
| **Supabase** | Backend completo (auth, DB, storage, realtime) |
| **Expo** | Frontend mobile multiplataforma |
| **Supabase JS Client** | Conexion frontend -> Supabase |
| **react-native-maps** | Mapa nativo |
| **GitHub** | Repositorio, issues, projects |
| **Agentes de IA** | Generacion de codigo, componentes, configuracion |

---

## 6. Reglas del Equipo

1. **Un solo `develop` como rama base.** Feature branches cortas, merge rapido.
2. **Los agentes de IA generan el codigo inicial**, el equipo lo revisa, adapta e integra.
3. **Commits atomicos** con convencion: `feat(scope): descripcion`
4. **Reunion diaria opcional** de 10 min. Si no hay bloqueos, no hay reunion.
5. **Cada quien prueba su propio codigo** antes de merge.
6. **Priorizar funcionalidad sobre perfeccion.** Es un MVP, no un producto final.

---

## 7. Criterios de Aceptacion del MVP

- [ ] Login y registro funcionan con Supabase Auth
- [ ] El mapa muestra escenarios geolocalizados
- [ ] El catalogo lista escenarios con filtros basicos
- [ ] El detalle muestra info completa del escenario
- [ ] Los favoritos se guardan y persisten
- [ ] La app compila sin errores en Android (iOS es plus)
- [ ] No hay bugs criticos que impidan uso
