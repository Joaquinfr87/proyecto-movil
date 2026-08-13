# DeporteYa — Lugares Interactivos

Aplicación móvil multiplataforma (iOS y Android) para la **visualización interactiva de escenarios deportivos a nivel nacional**, que facilita a la ciudadanía la localización y el acceso a información confiable y actualizada sobre la infraestructura deportiva del país.

## Características

- Mapa interactivo con la ubicación georreferenciada de los escenarios deportivos.
- Catálogo de escenarios con búsqueda y filtros por deporte, ciudad y tipo de recinto.
- Ficha de detalle de cada escenario: disciplinas, capacidad, horarios, servicios y eventos.
- Registro e inicio de sesión de usuarios con perfiles de asistente, gestor y administrador.
- Gestión de favoritos para acceder rápidamente a los escenarios de interés.

## Tecnologías

| Capa            | Tecnología                                      |
| --------------- | ----------------------------------------------- |
| Frontend móvil  | React Native + Expo                             |
| Mapas           | Leaflet                                         |
| Backend         | Node.js + Express                               |
| Base de datos   | PostgreSQL + PostGIS                            |
| Backend servicio| Supabase                                        |
| Paquetería      | pnpm                                            |
| Control versión | Git + GitHub                                    |

## Requisitos previos

- [Node.js](https://nodejs.org/) (v20 o superior).
- [pnpm](https://pnpm.io/) (gestor de paquetes).
- [Expo Go](https://expo.dev/go) instalado en el teléfono físico.
- El teléfono y el equipo de desarrollo deben estar en la misma red local.

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Joaquinfr87/proyecto-movil.git
cd proyecto-movil

# Instalar las dependencias
pnpm install
```

## Ejecución

```bash
# Iniciar el servidor de desarrollo de Expo
pnpm start
```

Escanea el código QR que aparece en la terminal con la aplicación **Expo Go** del teléfono físico. También puedes presionar `a` para abrir la aplicación directamente en un dispositivo Android conectado.

## Estructura del proyecto

```
lugares-interactivos/
|-- assets/                 # Recursos estáticos: iconos e imágenes
|-- src/
|   |-- app/
|   |   |-- navigation/     # Configuración de la navegación
|   |   |-- screens/        # Pantallas por módulo funcional
|   |   |-- context/        # Estado global (autenticación, favoritos, tema)
|   |   |-- components/     # Componentes reutilizables
|   |   |-- services/       # Cliente de API, almacenamiento y ubicación
|   |   |-- hooks/          # Lógica reutilizable
|   |   |-- types/          # Modelos de datos
|   |   `-- theme/          # Tema visual de la aplicación
|   |-- App.tsx             # Componente raíz
|   `-- index.ts            # Punto de entrada
|-- app.json                # Configuración de Expo
|-- package.json            # Dependencias y scripts
|-- pnpm-lock.yaml          # Lockfile de dependencias
`-- tsconfig.json           # Configuración de TypeScript
```

## Scripts disponibles

| Comando          | Descripción                                  |
| ---------------- | -------------------------------------------- |
| `pnpm start`     | Inicia el servidor de desarrollo de Expo     |
| `pnpm android`   | Abre la aplicación en un dispositivo Android |
| `pnpm ios`       | Abre la aplicación en un simulador de iOS    |
| `pnpm web`       | Abre la aplicación en el navegador           |

## Ramas del repositorio

| Rama      | Propósito                                       |
| --------- | ----------------------------------------------- |
| `docs`    | Documentación del proyecto (informe de grado)   |
| `develop` | Código fuente de la aplicación, sin documentación |

## Licencia

MIT
