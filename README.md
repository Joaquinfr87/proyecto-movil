<div align="center">

# ⚽ DeporteYa — Lugares Interactivos 🏟️

### Visualización interactiva de escenarios deportivos a nivel nacional

[![Platform](https://img.shields.io/badge/Platform-iOS%20%26%20Android-blue?style=for-the-badge&logo=apple&logoColor=white)](https://expo.dev)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57-black?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge&logo=github)](LICENSE)

---

Aplicación móvil multiplataforma (iOS y Android) que facilita a la ciudadanía la
**localización y el acceso a información confiable y actualizada** sobre la
infraestructura deportiva del país. 📍

[🚀 Empezar](#-instalación) · [📚 Características](#-características) · [🧰 Tecnologías](#-tecnologías) · [📁 Estructura](#-estructura-del-proyecto)

</div>

---

## ✨ Características

| | Funcionalidad | Descripción |
| :-: | --- | --- |
| 🗺️ | **Mapa interactivo** | Ubicación georreferenciada de los escenarios deportivos y consulta de los más cercanos al usuario. |
| 🔍 | **Búsqueda y filtros** | Filtros por deporte, ciudad y tipo de recinto (estadio, coliseo, cancha, complejo). |
| 📋 | **Catálogo** | Listado completo de escenarios con su información básica. |
| 📄 | **Detalle del escenario** | Disciplinas, capacidad, horarios, servicios y eventos programados. |
| 👤 | **Perfiles de usuario** | Registro e inicio de sesión para asistente, gestor y administrador. |
| ⭐ | **Favoritos** | Guarda y consulta rápidamente los escenarios de tu interés. |

## 🧰 Tecnologías

| Capa | Tecnología | Icono |
| --- | --- | :-: |
| Frontend móvil | React Native + Expo | <img src="https://img.shields.io/badge/-React%20Native-61DAFB?logo=react&logoColor=black" /> |
| Mapas | Leaflet | <img src="https://img.shields.io/badge/-Leaflet-199900?logo=leaflet&logoColor=white" /> |
| Backend | Node.js + Express | <img src="https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white" /> |
| Base de datos | PostgreSQL + PostGIS | <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white" /> |
| Backend como servicio | Supabase | <img src="https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase&logoColor=white" /> |
| Paquetería | pnpm | <img src="https://img.shields.io/badge/-pnpm-F69220?logo=pnpm&logoColor=white" /> |
| Control de versiones | Git + GitHub | <img src="https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white" /> |

## 📋 Requisitos previos

- 🟢 [Node.js](https://nodejs.org/) **v20 o superior**
- 📦 [pnpm](https://pnpm.io/) como gestor de paquetes
- 📱 [Expo Go](https://expo.dev/go) instalado en el teléfono físico
- 🌐 El teléfono y el equipo de desarrollo en la **misma red local**

## 🚀 Instalación

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/Joaquinfr87/proyecto-movil.git
cd proyecto-movil

# 2️⃣ Cambiar a la rama de desarrollo
git checkout develop

# 3️⃣ Instalar las dependencias
pnpm install
```

## ▶️ Ejecución

```bash
# Iniciar el servidor de desarrollo de Expo
pnpm start
```

📲 Escanea el código QR con la aplicación **Expo Go** del teléfono físico, o
presiona `a` para abrir la aplicación directamente en un dispositivo Android conectado.

## 🧩 Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm start` | ▶️ Inicia el servidor de desarrollo de Expo |
| `pnpm android` | 🤖 Abre la aplicación en un dispositivo Android |
| `pnpm ios` | 🍎 Abre la aplicación en un simulador de iOS |
| `pnpm web` | 🌐 Abre la aplicación en el navegador |

## 📁 Estructura del proyecto

```
lugares-interactivos/
├── assets/                    🎨 Recursos estáticos: iconos e imágenes
├── src/
│   └── app/
│       ├── navigation/        🧭 Configuración de la navegación
│       ├── screens/           📱 Pantallas por módulo funcional
│       │   ├── auth/          🔐 Autenticación
│       │   ├── home/          🏠 Inicio
│       │   ├── map/           🗺️ Mapa interactivo
│       │   ├── catalog/       📋 Catálogo
│       │   └── details/       📄 Detalle del escenario
│       ├── context/           🔄 Estado global (autenticación, favoritos, tema)
│       ├── components/        🧱 Componentes reutilizables
│       ├── services/          🔌 Cliente de API, almacenamiento y ubicación
│       ├── hooks/             ⚙️ Lógica reutilizable
│       ├── types/             📐 Modelos de datos
│       └── theme/             🎨 Tema visual de la aplicación
├── App.tsx                    📌 Componente raíz
├── index.ts                   🚪 Punto de entrada
├── app.json                   ⚙️ Configuración de Expo
├── package.json               📦 Dependencias y scripts
├── pnpm-lock.yaml             🔒 Lockfile de dependencias
└── tsconfig.json              ⚙️ Configuración de TypeScript
```

## 🌿 Ramas del repositorio

| Rama | Propósito |
| --- | --- |
| 📚 `docs` | Documentación del proyecto (informe de grado) |
| 💻 `develop` | Código fuente de la aplicación, sin documentación |

## 🤝 Contribuciones

¿Tienes ideas para mejorar el proyecto? ¡Las contribuciones son bienvenidas!

1. 🍴 Haz un *fork* del repositorio
2. 🌿 Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. 💾 Realiza los cambios y haz commit (`git commit -m 'feat: añade nueva funcionalidad'`)
4. 🚀 Sube la rama (`git push origin feature/nueva-funcionalidad`)
5. 🔀 Abre un *pull request*

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ por el Equipo Sudoers** — Aplicaciones Móviles I · Universidad Privada Domingo Savio

</div>
