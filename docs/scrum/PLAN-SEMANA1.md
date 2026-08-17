# Plan de Desarrollo - Semana 1

## Equipo: Lugares Interactivos (DeporteYa)

---

## Arquitectura Base

Vamos a utilizar **Supabase** como backend completo (auth, base de datos, storage).

### Supabase Local vs Cloud

- **Supabase Local**: Instance de Supabase que corre en tu maquina via Docker. Utilizaremos esta para el desarrollo diario. Permite trabajar con migrations, seed y config.toml para tener control total sobre la base de datos.
  - *Requisito:* Docker corriendo + 4GB de RAM libres approx.
- **Supabase Cloud**: Proyecto real en supabase.com. Nicolas sera el responsable de gestionar el proyecto en la cloud. Los cambios realizados en local seran sincronizados a la cloud cuando esten listos.

### Flujo de trabajo

```
Local (tu maquina)  -->  Cloud (Supabase)
       |
 Desarrollo
```

### Comandos utiles

```bash
pnpm db:start    # Levantar Supabase local
pnpm db:stop     # Detener Supabase local
pnpm db:reset    # Resetear DB (migraciones + seed)
pnpm db:push     # Subir cambios al cloud
pnpm db:types    # Generar tipos TypeScript
```

---

## Ramas del Repositorio

| Rama | Para que sirve |
|---|---|
| `develop` | Todo el codigo del desarrollo aqui se integra |
| `docs` | Solo documentacion e informe LaTeX |
| `main` | App lista para produccion |

### Flujo de ramas

```
feature/xxx  -->  develop  -->  main
```

Cada tarea se realiza en una **rama separada** basada en `develop`:

```bash
git checkout develop
git checkout -b feature/nombre-tarea
# ... desarrollar ...
git push origin feature/nombre-tarea
```

Una vez terminada la tarea, pueden hacer un **PR a develop** (si estan seguros) o avisarme por WhatsApp para que lo una.

---

## Tecnologias

Las tecnologias que utilizamos estan documentadas en `TECHNOLOGIES.md` (dentro de la rama `docs`). Revisen ese archivo antes de empezar cualquier tarea. Alli encontrarán ejemplos de uso de Zod, React Query, formularios, etc.

---

## Tareas Asignadas

### Lunes (Dia 1) - Configuracion Inicial

| Tarea | Asignado | Estado |
|---|---|---|
| T-001: Crear proyecto en Supabase | Nicolas | *Hecho* |
| T-002: Configurar Expo, TypeScript, dependencias | David | *Hecho* |
| T-003: Crear esquema SQL (tablas, RLS) | Nicolas | *Hecho* |
| T-004: Configurar @supabase/supabase-js | David | *Hecho* |
| T-005: Crear estructura de carpetas | Angel | *Hecho* |

---

### Martes (Dia 2) - Auth + Datos

| ID | Tarea | Asignado | Herramienta |
|---|---|---|---|
| **T-006** | Implementar `AuthContext` con Supabase (login, registro, sesion) | *Nicolas* | opencode |
| **T-007** | Crear pantallas de Login y Register conectadas a Supabase | *Angel* | opencode |
| **T-008** | Crear seed SQL con 10-15 escenarios de prueba (datos reales de Bolivia) | *Nicolas* | opencode |
| **T-009** | Insertar imagenes de prueba en Supabase Storage | *Angel* | Manual |
| **T-010** | Crear flujo de navegacion basico: Splash -> Auth -> Main | *David* | opencode |

**Detalle de tareas:**

**Nicolas - T-006:** Crear `src/context/AuthContext.tsx` que provea:
- `session`, `user`, `loading`
- `signIn(email, password)` usando `supabase.auth.signInWithPassword()`
- `signUp(email, password, fullName)` usando `supabase.auth.signUp()`
- `signOut()` usando `supabase.auth.signOut()`
- Escuchar cambios de sesion con `onAuthStateChange`

**Nicolas - T-008:** Crear archivo `supabase/seed.sql` con INSERTs de escenarios deportivos reales de Bolivia. Ejemplos:
- Estadio Hernando Siles (La Paz)
- Estadio Ramon Tahuichi Aguilera (Santa Cruz)
- Coliseo de Deportes (Cochabamba)
- Canchas multiples en distintas ciudades
Incluir: nombre, tipo, capacidad, direccion, latitud, longitud, disciplinas.

**Angel - T-007:** Modificar `src/app/auth/login.tsx` y `src/app/auth/register.tsx` para:
- Usar react-hook-form + Zod para validar inputs
- Llamar a las funciones de AuthContext al enviar
- Mostrar errores de Supabase si falla
- Navegar a la pantalla principal despues de login exitoso

**Angel - T-009:** Subir 3-5 imagenes de escenarios deportivos a Supabase Storage (bucket `scenarios`). Pueden buscar imagenes de Unsplash o Pexels.

**David - T-010:** Configurar el flujo de navegacion:
- Si hay sesion activa -> ir a `(tabs)`
- Si no hay sesion -> ir a `auth/login`
- Si toca "Comenzar" en splash -> ir a auth

---

### Miercoles (Dia 3) - Integracion Auth

| ID | Tarea | Asignado | Herramienta |
|---|---|---|---|
| **T-011** | Probar login/registro en dispositivo real | *Angel + David* | Manual |
| **T-012** | Implementar proteccion de rutas (no autenticado -> login) | *David* | opencode |
| **T-013** | Crear pantalla de Splash con logo y boton "Comenzar" | *Angel* | opencode |
| **T-014** | Verificar RLS policies funcionando correctamente | *Nicolas* | Supabase Dashboard |
| **T-015** | Fix de bugs encontrados en integracion auth | *David + Nicolas* | opencode |

**Detalle de tareas:**

**Angel + David - T-011:**
- Ejecutar `pnpm start` y probar en Expo Go (telefono real)
- Probar registro con un email nuevo
- Probar login con las credenciales del seed (admin@test.com / password123)
- Verificar que el logout funciona
- Reportar cualquier bug encontrado

**David - T-012:** Crear un componente/guard que verifique si hay sesion:
- Si `session` es null -> redirigir a `/auth/login`
- Si `session` existe -> permitir acceso
- Aplicar esto en el `_layout.tsx` principal

**Angel - T-013:** Crear `src/app/splash.tsx` con:
- Logo de la app (puede ser un icono temporal)
- Nombre "DeporteYa" o "Lugares Interactivos"
- Boton "Comenzar" que navegue a auth

**Nicolas - T-014:** Abrir Supabase Studio (http://127.0.0.1:54323) y verificar:
- Que las tablas existen con las columnas correctas
- Que las RLS policies estan activas
- Que un usuario no autenticado NO puede leer la tabla profiles
- Que un usuario autenticado SI puede leer profiles
- Que el admin puede todo

**David + Nicolas - T-015:** Corregir bugs que salgan de las pruebas de T-011.

---

## Credenciales de Prueba (Seed)

| Email | Password | Rol |
|---|---|---|
| admin@test.com | password123 | admin |
| gestor@test.com | password123 | gestor |
| asistente@test.com | password123 | asistente |

---

## Cuentas Pendientes

| Miembro | Que hacer |
|---|---|
| **Nicolas** | Crear proyecto en Supabase Cloud (supabase.com) y sharearlo con el equipo |
| **David** | Probar que `pnpm db:start` funciona en su maquina |
| **Angel** | Instalar Docker si no lo tiene, y verificar que tiene 4GB+ de RAM libres |

---

## Notas Importantes

1. **Antes de empezar cualquier tarea**, revisar `TECHNOLOGIES.md` en la rama `docs` para ver las convenciones de codigo y ejemplos de uso de las librerias.

2. **Supabase local consume ~4GB de RAM**. Cierren Chrome y otros pesados si su maquina no tiene mucho RAM.

3. **Usen agentes de IA** (opencode) para generar el codigo base, pero siempre **revisen que funcione** antes de commitear.

4. **Commits con convencion**: `feat(scope): descripcion` (ej: `feat(auth): implementar login con Supabase`)

5. **No subir .env** a git. Ya esta en `.gitignore`.

6. Si tienen dudas, avisen por WhatsApp. No se queden trabados.
