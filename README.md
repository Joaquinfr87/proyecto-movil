<div align="center">

<img src="assets/banner.svg" alt="Lugares Interactivos Banner" width="100%" />

<br />

[![Platform](https://img.shields.io/badge/Platform-iOS%20%26%20Android-0F172A?style=for-the-badge&logo=apple&logoColor=white)](https://expo.dev)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57-000000?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

<br />

### 🏟️ Visualización interactiva de escenarios deportivos a nivel nacional

Aplicación móvil multiplataforma (iOS y Android) que facilita a la ciudadanía la
**localización y el acceso a información confiable y actualizada** sobre la
infraestructura deportiva del país.

</div>

---

## ✨ Características

<div align="center">

| 🗺️ **Mapa Interactivo** | ⭐ **Favoritos** | 🌐 **Visor 360°** | 🔍 **Búsqueda** |
|:---:|:---:|:---:|:---:|
| Ubica escenarios en un mapa interactivo con MapLibre | Guarda y accede rápido a tus escenarios favoritos | Explora escenarios en vista panorámica 360° | Encuentra escenarios por nombre, deporte o ubicación |

</div>

---

## 🛠️ Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Expo)                       │
│  React Native + Expo Router                              │
│  MapLibre (mapas) · Reanimated (animaciones)            │
│  TanStack Query (estado del servidor)                    │
│  React Hook Form + Zod (formularios)                     │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Supabase)                     │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐          │
│  │   Auth   │  │   Database │  │   Storage  │          │
│  │  Email   │  │ PostgreSQL │  │  Imágenes  │          │
│  └──────────┘  └────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────┘
```

No hay backend custom. La app habla directo con Supabase via `@supabase/supabase-js`.

---

## 📋 Requisitos Previos

### Software

| Requisito | Versión Mínima | Verificar | Instalar |
|:----------|:---------------|:----------|:---------|
| **Node.js** | v20+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **pnpm** | v11+ | `pnpm --version` | `npm install -g pnpm` |
| **Docker** | 24+ | `docker --version` | [docker.com](https://docs.docker.com/get-docker/) |
| **Expo Go** | latest | Instalar en el teléfono | [expo.dev/go](https://expo.dev/go) |

### Hardware

| Recomendación | Mínimo | Ideal |
|:--------------|:-------|:------|
| **RAM** | 8 GB | 16 GB |
| **Disco** | 5 GB libres | 10 GB libres |
| **CPU** | 2 núcleos | 4+ núcleos |
| **Red** | Local (para Expo Go) | Local + Internet |

> **Docker es obligatorio** para Supabase local. Si usas Windows, instala Docker Desktop.
> En Linux, asegúrate de que tu usuario esté en el grupo `docker`.

---

## 🚀 Instalación

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

## ⚙️ Configuración de Supabase (Desarrollo Local)

Supabase corre localmente via Docker. Esto levanta:

| Servicio | Puerto | Descripción |
|:---------|:-------|:------------|
| **API (PostgREST)** | `54321` | API REST para la base de datos |
| **PostgreSQL** | `54322` | Base de datos relacional |
| **Studio** | `54323` | Dashboard web de administración |
| **Auth** | `54321` | Autenticación de usuarios |
| **Storage** | Integrado | Almacenamiento de archivos |

### Levantar Supabase

```bash
# Iniciar Supabase local (descarga las imágenes la primera vez, ~2-3 min)
pnpm supabase start
```

> La primera ejecución descarga ~500MB de imágenes Docker. Paciencia.

### Verificar que funciona

```bash
# Ver el estado de los servicios
pnpm supabase status
```

Deberías ver algo como:

```
API URL:       http://127.0.0.1:54321
DB URL:        postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:    http://127.0.0.1:54323
Inbucket URL:  http://127.0.0.1:54324
```

### Abrir Supabase Studio

Abre `http://127.0.0.1:54323` en tu navegador para ver:
- 📊 Tablas y datos
- 🔐 Auth (usuarios registrados)
- 📁 Storage (archivos subidos)
- 📝 SQL Editor (para probar queries)

### Aplicar migraciones y seed

Las migraciones se ejecutan automáticamente al hacer `pnpm supabase start`.
Si necesitas resetear la base de datos:

```bash
# Resetear DB (borra todo y reaplica migraciones + seed)
pnpm supabase db reset
```

### Usuarios de prueba (seed)

| Email | Password | Rol |
|:------|:---------|:----|
| `admin@test.com` | `password123` | admin |
| `gestor@test.com` | `password123` | gestor |
| `asistente@test.com` | `password123` | asistente |

### Detener Supabase

```bash
pnpm supabase stop
```

---

## ☁️ Supabase Cloud (Producción)

Para deployment real, usa [Supabase Cloud](https://supabase.com) (free tier incluye 2 proyectos).

### Crear proyecto en la nube

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Click **New Project** → elegir nombre, password de DB, region
3. Copiar los valores de **Project URL** y **anon/public key** desde `Settings > API`

### Configurar `.env` para cloud

```bash
# .env (producción)
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

### Comandos de sincronización

| Comando | Descripción |
|:--------|:------------|
| `supabase login` | Login a Supabase (una vez) |
| `supabase link --project-ref <ref>` | Linkar proyecto local al cloud |
| `supabase db push` | Push migraciones local → cloud |
| `supabase db push --seed` | Push migraciones + seed al cloud |
| `supabase db pull` | Traer esquema cloud → migración local |
| `supabase db diff` | Ver diferencia entre local y cloud |
| `supabase db dump` | Exportar esquema del cloud |
| `supabase config push` | Push config.toml local → cloud |
| `supabase config pull` | Traer config cloud → config.toml local |
| `supabase gen types typescript` | Generar tipos TypeScript |

### Generar tipos de TypeScript desde la DB

```bash
# Genera src/types/database.ts con los tipos de todas las tablas
pnpm supabase gen types typescript --local > src/types/database.ts
```

---

## ▶️ Ejecutar la App

```bash
# En otra terminal (mientras Supabase corre)
pnpm start
```

Escanea el código QR con **Expo Go** o presiona `a` para Android.

> La app se conecta automáticamente a Supabase local via `http://127.0.0.1:54321`.
> Asegúrate de que tu teléfono y tu computadora estén en la **misma red WiFi**.

---

## 📦 Scripts Disponibles

| Comando | Descripción |
|:--------|:------------|
| `pnpm start` | Inicia el servidor de desarrollo de Expo |
| `pnpm android` | Abre la app en Android |
| `pnpm ios` | Abre la app en iOS |
| `pnpm web` | Abre la app en el navegador |
| `pnpm lint` | Ejecuta ESLint en `src/` |
| `pnpm lint:fix` | Corrige errores de ESLint automáticamente |
| `pnpm format` | Formatea el código con Prettier |
| `pnpm supabase start` | Levanta Supabase local (Docker) |
| `pnpm supabase stop` | Detiene Supabase local |
| `pnpm supabase status` | Muestra estado de Supabase |
| `pnpm supabase db reset` | Resetea la DB (migraciones + seed) |

---

## 📁 Estructura del Proyecto

```
lugares-interactivos/
├── assets/                     🖼️  Recursos estáticos (logo, banner, splash)
├── src/
│   ├── app/
│   │   ├── (tabs)/             📱 Pantallas con navegación inferior
│   │   ├── auth/               🔐 Pantallas de autenticación
│   │   ├── scenario/           🏟️  Detalle de escenario
│   │   ├── scenario-form/      📝 Formulario de escenario
│   │   ├── splash.tsx          ✨ Pantalla de splash
│   │   └── _layout.tsx         🏗️  Layout raíz de Expo Router
│   ├── components/
│   │   ├── map/                🗺️  Componentes de mapa (Web/LibNative)
│   │   ├── scenario/           🏟️  Componentes de escenario
│   │   └── layout/             📐 Componentes de layout
│   ├── hooks/                  🪝 Custom hooks (React Query)
│   ├── context/                🌍 Contextos (Auth)
│   ├── services/               🔌 Servicios (Supabase client)
│   ├── theme/                  🎨 Sistema de diseño (colores, espaciado)
│   ├── types/                  📐 Tipos TypeScript
│   └── utils/                  🔧 Utilidades
├── supabase/
│   ├── config.toml             ⚙️  Configuración de Supabase local
│   ├── migrations/             📊 Migraciones SQL
│   └── seed.sql                🌱 Datos de prueba
├── .env.example                📄 Variables de entorno (ejemplo)
├── .env                        🔒 Variables de entorno (local, no commitear)
├── app.json                    ⚙️  Configuración de Expo
├── package.json                📦 Dependencias y scripts
└── tsconfig.json               🔷 Configuración de TypeScript
```

---

## 🎨 Sistema de Diseño

El proyecto usa un sistema de colores consistente definido en `src/theme/colors.ts`:

| Color | Hex | Uso |
|:------|:----|:----|
| 🔵 **Primary** | `#2563EB` | Acciones principales, navegación, links |
| 🟢 **Secondary** | `#10B981` | Éxito, acentos positivos, deportes |
| 🔴 **Error** | `#EF4444` | Errores, validación |
| 🟡 **Warning** | `#F59E0B` | Advertencias |
| ⚪ **Background** | `#F8FAFC` | Fondo de la app |
| ⬛ **Text** | `#0F172A` | Texto principal |

---

## 🌿 Ramas del Repositorio

| Rama | Propósito |
|:-----|:----------|
| `main` | Producción, versión estable |
| `develop` | Integración, código en desarrollo |
| `docs` | Documentación del proyecto (informe de grado) |
| `feature/*` | Funcionalidades individuales |

---

## 🤝 Contribuciones

1. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
2. Hacer cambios y commit (`git commit -m 'feat: descripción'`)
3. Push (`git push origin feature/nueva-funcionalidad`)
4. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

<img src="assets/logo.svg" alt="Lugares Interactivos Logo" width="120" />

**Equipo Sudoers** — Aplicaciones Móviles I

</div>
