<div align="center">

# Lugares Interactivos

### Visualizacion interactiva de escenarios deportivos a nivel nacional

[![Platform](https://img.shields.io/badge/Platform-iOS%20%26%20Android-blue?style=for-the-badge&logo=apple&logoColor=white)](https://expo.dev)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57-black?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

---

Aplicacion movil multiplataforma (iOS y Android) que facilita a la ciudadania la
**localizacion y el acceso a informacion confiable y actualizada** sobre la
infraestructura deportiva del pais.

</div>

---

## Requisitos Previos

### Software

| Requisito | Version Minima | Verificar | Instalar |
| --- | --- | --- | --- |
| **Node.js** | v20+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **pnpm** | v11+ | `pnpm --version` | `npm install -g pnpm` |
| **Docker** | 24+ | `docker --version` | [docker.com](https://docs.docker.com/get-docker/) |
| **Expo Go** | latest | Instalar en el telefono | [expo.dev/go](https://expo.dev/go) |

### Hardware

| Recomendacion | Minimo | Ideal |
| --- | --- | --- |
| **RAM** | 8 GB | 16 GB |
| **Disco** | 5 GB libres | 10 GB libres |
| **CPU** | 2 nucleos | 4+ nucleos |
| **Red** | Local (para Expo Go) | Local + Internet |

> **Docker es obligatorio** para Supabase local. Si usas Windows, instala Docker Desktop.
> En Linux, asegurate de que tu usuario este en el grupo `docker`.

---

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/Joaquinfr87/proyecto-movil.git
cd proyecto-movil

# 2. Cambiar a la rama de desarrollo
git checkout develop

# 3. Instalar dependencias
pnpm install

# 4. Copiar variables de entorno
cp .env.example .env
```

---

## Configuracion de Supabase (Desarrollo Local)

Supabase corre localmente via Docker. Esto levanta:
- **PostgreSQL** en puerto `54322`
- **API (PostgREST)** en puerto `54321`
- **Studio (dashboard web)** en puerto `54323`
- **Auth** en puerto `54321`
- **Storage** integrado

### Levantar Supabase

```bash
# Iniciar Supabase local (descarga las imagenes la primera vez, ~2-3 min)
pnpm supabase start
```

> La primera ejecucion descarga ~500MB de imagenes Docker. Paciencia.

### Verificar que funciona

```bash
# Ver el estado de los servicios
pnpm supabase status
```

Deberias ver algo como:

```
API URL:       http://127.0.0.1:54321
DB URL:        postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:    http://127.0.0.1:54323
Inbucket URL:  http://127.0.0.1:54324
```

### Abrir Supabase Studio

Abre `http://127.0.0.1:54323` en tu navegador para ver:
- Tablas y datos
- Auth (usuarios registrados)
- Storage (archivos subidos)
- SQL Editor (para probar queries)

### Aplicar migraciones y seed

Las migraciones se ejecutan automaticamente al hacer `pnpm supabase start`.
Si necesitas resetear la base de datos:

```bash
# Resetear DB (borra todo y reaplica migraciones + seed)
pnpm supabase db reset
```

### Usuarios de prueba (seed)

| Email | Password | Rol |
| --- | --- | --- |
| `admin@test.com` | `password123` | admin |
| `gestor@test.com` | `password123` | gestor |
| `asistente@test.com` | `password123` | asistente |

### Detener Supabase

```bash
pnpm supabase stop
```

---

## Supabase Cloud (Produccion)

Para deployment real, usa [Supabase Cloud](https://supabase.com) (free tier incluye 2 proyectos).

### Crear proyecto en la nube

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Click **New Project** -> elegir nombre, password de DB, region
3. Copiar los valores de **Project URL** y **anon/public key** desde `Settings > API`

### Configurar `.env` para cloud

```bash
# .env (produccion)
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Link local al proyecto cloud

```bash
# Login a Supabase (abre navegador)
pnpm supabase login

# Linkar el proyecto local al cloud (usar Project Ref del dashboard)
pnpm supabase link --project-ref TU-PROJECT-REF
```

> El `project-ref` lo encuentras en `Settings > General > Reference ID`.

### Sync: local -> cloud

```bash
# Empujar migraciones al cloud (NO borra datos, solo aplica cambios)
pnpm supabase db push

# Empujar migraciones + seed al cloud
pnpm supabase db push --seed

# Empujar config.toml al cloud (auth, storage, realtime, etc.)
pnpm supabase config push

# Ver diff entre local y cloud
pnpm supabase db diff
```

### Sync: cloud -> local

```bash
# Traer el esquema actual del cloud como migracion local
pnpm supabase db pull

# Traer config.toml del proyecto cloud al local
pnpm supabase config pull

# Exportar esquema completo del cloud
pnpm supabase db dump > supabase/remote_dump.sql
```

### Generar tipos de TypeScript desde la DB

```bash
# Genera src/types/database.ts con los tipos de todas las tablas
pnpm supabase gen types typescript --local > src/types/database.ts
```

### Resumen de comandos cloud

| Comando | Descripcion |
| --- | --- |
| `supabase login` | Login a Supabase (una vez) |
| `supabase link --project-ref <ref>` | Linkar proyecto local al cloud |
| `supabase db push` | Push migraciones local -> cloud |
| `supabase db push --seed` | Push migraciones + seed al cloud |
| `supabase db pull` | Traer esquema cloud -> migracion local |
| `supabase db diff` | Ver diferencia entre local y cloud |
| `supabase db dump` | Exportar esquema del cloud |
| `supabase config push` | Push config.toml local -> cloud |
| `supabase config pull` | Traer config cloud -> config.toml local |
| `supabase gen types typescript` | Generar tipos TypeScript |

---

## Ejecutar la App

```bash
# En otra terminal (mientras Supabase corre)
pnpm start
```

Escanea el codigo QR con **Expo Go** o presiona `a` para Android.

> La app se conecta automaticamente a Supabase local via `http://127.0.0.1:54321`.
> Asegurate de que tu telefono y tu computadora esten en la **misma red WiFi**.

---

## Scripts Disponibles

| Comando | Descripcion |
| --- | --- |
| `pnpm start` | Inicia el servidor de desarrollo de Expo |
| `pnpm android` | Abre la app en Android |
| `pnpm ios` | Abre la app en iOS |
| `pnpm web` | Abre la app en el navegador |
| `pnpm supabase start` | Levanta Supabase local (Docker) |
| `pnpm supabase stop` | Detiene Supabase local |
| `pnpm supabase status` | Muestra estado de Supabase |
| `pnpm supabase db reset` | Resetea la DB (migraciones + seed) |

---

## Estructura del Proyecto

```
lugares-interactivos/
├── assets/                    Recursos estaticos
├── src/
│   └── app/
│       ├── (tabs)/            Pantallas con navegacion inferior
│       ├── auth/              Pantallas de autenticacion
│       ├── scenario/          Detalle de escenario
│       └── _layout.tsx        Layout raiz de Expo Router
├── supabase/
│   ├── config.toml            Configuracion de Supabase local
│   ├── migrations/            Migraciones SQL
│   │   └── 001_create_profiles.sql
│   └── seed.sql               Datos de prueba
├── .env.example               Variables de entorno (ejemplo)
├── .env                       Variables de entorno (local, no commitear)
├── app.json                   Configuracion de Expo
├── package.json               Dependencias y scripts
└── tsconfig.json              Configuracion de TypeScript
```

---

## Arquitectura

```
┌─────────────────────────────────┐
│      FRONTEND (Expo)            │
│  React Native + Expo Router     │
│  react-native-maps              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│      SUPABASE (local/produccion)│
│  ┌────────┐ ┌──────┐ ┌───────┐ │
│  │  Auth  │ │  DB  │ │Storage│ │
│  │ email  │ │Postgr│ │imgs   │ │
│  └────────┘ └──────┘ └───────┘ │
└─────────────────────────────────┘
```

No hay backend custom. La app habla directo con Supabase via `@supabase/supabase-js`.

---

## Ramas del Repositorio

| Rama | Propósito |
| --- | --- |
| `main` | Produccion, version estable |
| `develop` | Integracion, codigo en desarrollo |
| `docs` | Documentacion del proyecto (informe de grado) |
| `feature/*` | Funcionalidades individuales |

---

## Contribuciones

1. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
2. Hacer cambios y commit (`git commit -m 'feat: descripcion'`)
3. Push (`git push origin feature/nueva-funcionalidad`)
4. Abrir Pull Request

---

<div align="center">

**Equipo Sudoers** -- Aplicaciones Moviles I

</div>
