# DOCUMENTACIÓN DE EXAMEN
## Sistema de Reserva de Turnos y Canchas Deportivas

---

**Estudiante:** Ángel  
**Rama de desarrollo:** `examen-angel` (aislada de `develop`)  
**Proyecto Base:** Lugares Interactivos – Escenarios Deportivos  
**Tecnologías:** React Native + Expo Router + TypeScript + Supabase + PostgreSQL  
**Fecha:** 2026-09-01

---

## PARTE 1 - ANÁLISIS DE LA NUEVA FUNCIONALIDAD

### 1. Nombre de la Funcionalidad
**Sistema de Reserva y Gestión de Turnos en Escenarios Deportivos.**

### 2. Problema o Necesidad que Resuelve
Los deportistas y ciudadanos que visitan los escenarios deportivos no disponen de un mecanismo digital para verificar la disponibilidad horaria ni agendar turnos de uso en canchas y sectores específicos. Esto genera:
- Llegadas a canchas ya ocupadas sin previo aviso.
- Conflictos entre grupos de deportistas por uso simultáneo del mismo espacio.
- Falta de registro y control de ocupación para los administradores.

### 3. Usuarios Involucrados
1. **Deportista / Ciudadano:** Consulta disponibilidad, reserva turnos, visualiza su comprobante digital y reprograma o cancela reservas.
2. **Administrador / Gestor Deportivo:** Consulta la ocupación general, cambia estados de reserva y gestiona incidencias.

### 4. Objetivo de la Funcionalidad
Permitir a los usuarios reservar turnos de manera ágil, validar en tiempo real que no existan colisiones de horario, generar un ticket/voucher digital con código único de comprobante (accesible online y offline), y mantener sincronización centralizada en Supabase/PostgreSQL.

### 5. Flujo de Funcionamiento

```
Usuario ingresa al Detalle del Escenario
↓
Presiona "Reservar Turno"
↓
Selecciona Fecha (próximos 14 días)
↓
Consulta disponibilidad en tiempo real
↓
Selecciona Bloque Horario (08:00 – 22:00, slots de 1 hora)
↓
Completa datos: Actividad, Participantes, Teléfono, Notas
↓
¿Validación correcta?
  → NO: Muestra alertas en campos inválidos
  → SÍ: Guarda en Supabase + Persiste voucher en AsyncStorage
↓
Pantalla de Comprobante con Código único RSV-XXXXXX
↓
Mis Reservas: Consulta, Reprogramación o Cancelación
```

---

## PARTE 2 - DISEÑO DE LA INTERFAZ

### Acceso al Módulo
- Botón **"Reservar Turno"** (verde, con ícono de calendario) en la sección inferior de cada ficha de escenario deportivo.
- Acceso directo a "Mis Reservas" desde la pestaña de navegación en el botón flotante (+).

### Pantallas Creadas

| Pantalla | Ruta | Descripción |
| :--- | :--- | :--- |
| **Mis Reservas** | `/bookings/index.tsx` | Lista con tabs Próximas/Historial, soporte offline, FAB para nueva reserva |
| **Nueva Reserva** | `/bookings/create.tsx` | Selector de fecha (14 días), matriz de slots horarios, tipo actividad, form validado |
| **Comprobante / Ticket** | `/bookings/[id]/index.tsx` | Ticket digital estilo voucher con código alfanumérico, detalles y acciones |
| **Reprogramar Turno** | `/bookings/[id]/edit.tsx` | Reutiliza selector de fecha/horario, valida disponibilidad sin el slot actual |

### Componentes Creados

| Componente | Descripción |
| :--- | :--- |
| `BookingCard.tsx` | Tarjeta de reserva con franja lateral de estado, badge, fecha/hora, actividad y código |
| `TimeSlotGrid.tsx` | Matriz horizontal de slots 08:00–22:00 con estados visual Disponible/Seleccionado/Ocupado |
| `BookingTicket.tsx` | Voucher deportivo con línea punteada decorativa, código grande y todas las filas de datos |

### Identidad Visual
- **Paleta:** Azul institucional `#2563EB`, Verde éxito `#10B981`, Rojo cancelación `#EF4444`, Ámbar advertencia `#F59E0B`.
- **Consistencia:** `borderRadius`, `spacing`, `fontWeight` y `colors` del sistema de diseño existente en `src/theme/`.
- Todos los componentes usan las mismas variables de tema del proyecto.

---

## PARTE 3 - IMPLEMENTACIÓN

### Arquitectura
- **Navegación:** Expo Router (Stack) en `src/app/bookings/`, registrada en el `_layout.tsx` raíz.
- **Gestión de Estado del Servidor:** `@tanstack/react-query` con caché automático y revalidación.
- **Estado Local de UI:** `useState` para slots seleccionados, fecha activa, tab activa.

### Integración al Proyecto Existente
- Se añadió sección **"Reservar una Cancha"** en `src/app/scenario/[id].tsx` con botón que pasa el `scenario_id` y `scenario_nombre` como parámetros a la ruta `/bookings/create`.
- La ruta `bookings` está registrada en `src/app/_layout.tsx` (Stack raíz).
- Todos los componentes y hooks son nuevos; no se modificó lógica de negocio existente.

---

## PARTE 4 - FORMULARIOS Y VALIDACIONES

**Implementación:** `react-hook-form` con resolver `zodResolver` y esquema Zod.

| Campo | Tipo | Regla | Mensaje de Error |
| :--- | :--- | :--- | :--- |
| Fecha | DATE | Debe ser una de los próximos 14 días (selector visual) | Solo se pueden seleccionar fechas futuras |
| Horario | TIME | Requerido, bloque disponible (no ocupado, no pasado) | "Por favor selecciona un bloque de horario disponible" |
| Tipo de Actividad | Enum | Uno de: amistoso, entrenamiento, torneo, recreativo | (Selector visual; siempre válido al ser chips) |
| Participantes | Integer | Min 1, Max 50 | "Mínimo 1 participante" / "Máximo 50 participantes" |
| Teléfono | String | Min 7, Max 15 dígitos, solo números | "El teléfono debe tener al menos 7 dígitos" / "Solo números" |
| Notas | String? | Máx. 250 caracteres, opcional | "Las notas no pueden superar 250 caracteres" |

**Comportamiento:**
- El botón "Confirmar Reserva" está **deshabilitado** hasta que se seleccione un horario y los campos sean válidos.
- Los errores aparecen debajo de cada campo en color rojo al tocarlo/enviarlo.
- Si el horario ya fue tomado en tiempo real (409 Conflict), se muestra un Alert específico.

---

## PARTE 5 - PERSISTENCIA LOCAL (AsyncStorage)

### Datos almacenados localmente

| Clave | Contenido | Justificación |
| :--- | :--- | :--- |
| `@bookings_active_cache` | Lista JSON de reservas confirmadas del usuario | **Acceso offline al comprobante** sin conexión en predios deportivos con mala señal |
| `@bookings_form_draft` | Borrador parcial del formulario en curso | Evita pérdida de datos si la app se minimiza o recibe una llamada |
| `@bookings_user_preferences` | Teléfono habitual y actividad favorita | Autocompleta el formulario en reservas futuras, mejorando la UX |

### Implementación
- Módulo: `src/services/bookingStorage.ts`
- Funciones: `cacheActiveBookings`, `getCachedActiveBookings`, `saveBookingDraft`, `getBookingDraft`, `clearBookingDraft`, `saveBookingPreferences`, `getBookingPreferences`.
- El caché se actualiza automáticamente en cada consulta exitosa a Supabase (dentro del hook `useUserBookings`).

---

## PARTE 6 - SUPABASE Y POSTGRESQL

### Archivo de Migración
`supabase/migrations/011_scenario_bookings.sql`

### Tipos ENUM Creados
```sql
CREATE TYPE booking_status AS ENUM ('confirmada', 'completada', 'cancelada');
CREATE TYPE booking_activity AS ENUM ('amistoso', 'entrenamiento', 'torneo', 'recreativo');
```

### Tabla Creada: `scenario_bookings`

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID PK | Identificador único de la reserva |
| `booking_code` | VARCHAR(12) UNIQUE | Código alfanumérico de comprobante (RSV-XXXXXX) |
| `scenario_id` | UUID FK → scenarios | Escenario reservado |
| `sector_id` | UUID FK → scenario_sectors? | Sector específico (opcional) |
| `user_id` | UUID FK → auth.users | Usuario propietario de la reserva |
| `booking_date` | DATE | Fecha del turno |
| `start_time` | TIME | Hora de inicio (ej: 18:00) |
| `end_time` | TIME | Hora de fin (ej: 19:00) |
| `activity_type` | booking_activity | Tipo de actividad deportiva |
| `participants_count` | INTEGER (1–50) | Número de participantes |
| `contact_phone` | VARCHAR(20) | Teléfono de contacto |
| `notes` | TEXT? | Notas adicionales opcionales |
| `status` | booking_status | Estado actual de la reserva |
| `cancellation_reason` | TEXT? | Motivo de cancelación |
| `created_at`, `updated_at` | TIMESTAMPTZ | Timestamps automáticos |

### Restricción de No Solapamiento
```sql
CREATE UNIQUE INDEX idx_unique_active_booking
  ON scenario_bookings (scenario_id, booking_date, start_time)
  WHERE status != 'cancelada';
```
Garantiza que dos usuarios no puedan reservar el mismo horario simultáneamente.

### Relaciones
```
scenario_bookings → scenarios (ON DELETE CASCADE)
scenario_bookings → scenario_sectors (ON DELETE SET NULL)
scenario_bookings → auth.users (ON DELETE CASCADE)
```

### Políticas RLS
- **SELECT:** El propietario ve todas sus reservas; cualquier usuario autenticado puede ver slots confirmados para consultar disponibilidad.
- **INSERT:** Cualquier usuario puede crear reservas con su propio `user_id`.
- **UPDATE:** El propietario puede modificar reservas confirmadas; admins/gestores tienen acceso completo.
- **DELETE:** El propietario puede borrar sus reservas confirmadas; solo admins tienen borrado general.

---

## PARTE 7 - CRUD

| Operación | Pantalla | Descripción |
| :--- | :--- | :--- |
| **CREATE** | `/bookings/create.tsx` | Formulario de nueva reserva → genera código RSV-XXXXXX → inserta en Supabase → persiste en AsyncStorage |
| **READ** | `/bookings/index.tsx` y `/bookings/[id]/index.tsx` | Lista de reservas del usuario con tabs Próximas/Historial; Consulta de disponibilidad por escenario/fecha |
| **UPDATE** | `/bookings/[id]/edit.tsx` | Reprogramación de fecha y hora de reserva confirmada, con validación de disponibilidad del nuevo slot |
| **DELETE** | Botón en `BookingCard` y `/bookings/[id]/index.tsx` | Cancelación lógica (status → 'cancelada' + motivo), libera el slot automáticamente |

---

## PARTE 8 - MANEJO DE ERRORES

| Situación de Error | Manejo Implementado |
| :--- | :--- |
| Horario ya ocupado (409 Conflict / UNIQUE violation) | Detecta código de error `23505` y muestra: "Este horario ya fue reservado por otro usuario. Por favor elige otro." |
| Campos incompletos / inválidos | `react-hook-form` + `zod` bloquea el envío y muestra mensajes bajo cada campo |
| Sin conexión a internet | Carga reservas desde `AsyncStorage` y muestra banner "Modo sin conexión" |
| Fecha o slot pasado | Selector visual bloquea fechas pasadas; confirmación verifica que la fecha sea futura |
| Intento de modificar reserva completada/cancelada | Botones de edición solo visibles cuando `status === 'confirmada'` |
| Error de consulta a Supabase | `useQuery` devuelve `isError = true`; se muestra `EmptyState` con mensaje descriptivo |

---

## PARTE 9 - PRUEBAS REALIZADAS

| # | Prueba | Acción | Resultado Obtenido | Estado |
| :- | :--- | :--- | :--- | :--- |
| **P1** | Acceso al módulo | Clic en "Reservar Turno" en detalle de escenario | Navega a `/bookings/create` con escenario preseleccionado | ✅ Pasa |
| **P2** | Datos válidos | Seleccionar fecha, slot disponible, teléfono "04141234567", 10 participantes | Se habilita el botón y procesa la reserva correctamente | ✅ Pasa |
| **P3** | Datos inválidos | Enviar sin seleccionar horario | Muestra Alert "Por favor selecciona un bloque de horario" | ✅ Pasa |
| **P4** | Validación de campos | Ingresar teléfono "123" (< 7 dígitos) | Error: "El teléfono debe tener al menos 7 dígitos" | ✅ Pasa |
| **P5** | Guardado | Confirmar reserva con datos válidos | Código RSV-XXXXXX generado; registro en Supabase; comprobante en pantalla | ✅ Pasa |
| **P6** | Consulta | Ir a "Mis Reservas" | Lista la reserva en tab "Próximas" con fecha, hora, actividad y estado | ✅ Pasa |
| **P7** | Modificación | Clic en "Reprogramar", cambiar a otro slot disponible | Actualiza fecha/hora en Supabase y refresca la pantalla | ✅ Pasa |
| **P8** | Cancelación | Clic en "Cancelar Reserva" y confirmar | Estado cambia a "Cancelada", slot liberado para otros usuarios | ✅ Pasa |
| **P9** | Persistencia offline | Activar modo avión y abrir "Mis Reservas" | Muestra comprobantes desde AsyncStorage con banner "Modo sin conexión" | ✅ Pasa |
| **P10** | Manejo de errores | Intentar reservar un slot ya ocupado | Alert "Este horario ya fue reservado por otro usuario" | ✅ Pasa |

---

## DESAFÍO ADICIONAL IMPLEMENTADO

1. **Ticket Digital con Código de Comprobante:** Diseño visual tipo voucher deportivo con línea punteada decorativa, código alfanumérico grande `RSV-XXXXXX`, todas las filas de datos del turno y badge de estado en tiempo real.
2. **Tabs Dinámicos (Próximas / Historial):** Segmentación automática de las reservas según fecha y estado, con contadores por categoría.
3. **Modo Offline Resiliente:** Visualización completa de comprobantes sin conexión mediante `AsyncStorage`, con banner informativo que comunica al usuario que está viendo datos locales.
4. **Autocompletado de Preferencias:** El teléfono de contacto y tipo de actividad favorita del usuario se guardan en local storage y autocompletan el formulario en próximas reservas.

---

## ARCHIVOS CREADOS / MODIFICADOS

### Nuevos
- `supabase/migrations/011_scenario_bookings.sql`
- `src/types/index.ts` (extensión: tipos BookingStatus, BookingActivity, ScenarioBooking, CreateBookingPayload, UpdateBookingPayload)
- `src/services/bookingStorage.ts`
- `src/hooks/useBookings.ts`
- `src/components/bookings/BookingCard.tsx`
- `src/components/bookings/TimeSlotGrid.tsx`
- `src/components/bookings/BookingTicket.tsx`
- `src/app/bookings/_layout.tsx`
- `src/app/bookings/index.tsx`
- `src/app/bookings/create.tsx`
- `src/app/bookings/[id]/index.tsx`
- `src/app/bookings/[id]/edit.tsx`

### Modificados
- `src/app/scenario/[id].tsx` (sección "Reservar una Cancha" + estilos)
- `src/app/_layout.tsx` (ruta `bookings` en Stack raíz)

---

## DIFICULTADES ENCONTRADAS

1. **Inferencia de Tipos de Supabase:** La tabla `scenario_bookings` es nueva y no está en el archivo generado `database.ts`, por lo que Supabase TypeScript infería tipos incorrectos. Solución: usar cast `'scenario_bookings' as any` y `(data as unknown) as ScenarioBooking`.
2. **Borrador con Null Safety:** El helper `getBookingDraft()` puede devolver `null`, lo que requirió un guard explícito `if (draft && draft.scenario_id === ...)` en lugar de optional chaining para satisfacer el análisis estricto de TypeScript.
3. **Compatibilidad de Zod v4:** La versión del proyecto usa Zod v4 que cambió `invalid_type_error` por `message` en validadores de número. Se corrigió el esquema.
4. **Restricción UNIQUE en PostgreSQL:** La restricción de no solapamiento fue más delicada al incluir `sector_id` que puede ser NULL. Se simplificó usando únicamente `(scenario_id, booking_date, start_time)`.
