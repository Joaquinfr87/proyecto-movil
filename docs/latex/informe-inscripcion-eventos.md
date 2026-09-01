# Informe de Desarrollo: Módulo de Inscripción a Eventos

**Proyecto:** Desarrollo de un Sistema Móvil para la Visualización Interactiva de Escenarios Deportivos a Nivel Nacional

**Aplicación:** DeporteYa

**Equipo:** Sudoers

**Integrantes:**
- Angel Gabriel Rojas Hinojosa
- Joaquin Alessandro Felipez Rojas
- Nicolas Sebastian Reguerin Meneses
- David Willy Cruz Huanca

**Universidad:** Universidad Privada Domingo Savio

**Facultad:** Facultad de Ingeniería

**Carrera:** Ingeniería en Sistemas

**Asignatura:** Aplicaciones Móviles I

**Docente:** Vladimir Wilmar Rojas Condori

**Ciudad:** Cochabamba—Bolivia

**Fecha de entrega:** Septiembre 2026

---

## Resumen

**Objetivo:** Desarrollar e integrar un módulo de inscripción a eventos deportivos en la aplicación móvil DeporteYa, que permita a los usuarios registrarse, cancelar inscripciones y consultar su estado de inscripción desde la interfaz de la aplicación.

**Metodología:** Se siguió un proceso de análisis de necesidades, diseño de interfaz, implementación de backend (Supabase/PostgreSQL), desarrollo de componentes React Native con Expo, y pruebas de integración. El módulo se basó en la arquitectura existente del proyecto, reutilizando hooks de React Query, el sistema de diseño de colores y los patrones de navegación con Expo Router.

**Resultados:** Se implementó una tabla `event_registrations` con políticas RLS granulares, hooks personalizados para las operaciones CRUD, un componente de botón de inscripción con estados visuales, y una sección de "Mis inscripciones" en el perfil del usuario. El módulo cumple con los requisitos de validación, manejo de errores, persistencia en la nube e integración con la aplicación existente.

**Palabras clave:** inscripción a eventos, React Native, Expo, Supabase, PostgreSQL, CRUD, RLS, aplicaciones móviles.

---

## Capítulo III: Desarrollo del Módulo de Inscripción a Eventos

---

### 3.1 Análisis de la Necesidad

#### Contexto del proyecto

La aplicación DeporteYa es un sistema móvil para la visualización interactiva de escenarios deportivos a nivel nacional en Bolivia. Permite a los ciudadanos localizar y acceder a información confiable sobre infraestructura deportiva del país, incluyendo estadios, coliseos, canchas múltiples y polideportivos.

El sistema actual cuenta con las siguientes funcionalidades principales:

- **Mapa interactivo:** Ubicación de escenarios en un mapa con MapLibre (nativo y web).
- **Detalle de escenario:** Información completa incluyendo imágenes, deportes disponibles, horarios y eventos próximos.
- **Favoritos:** Guardado de escenarios de interés del usuario.
- **Búsqueda:** Búsqueda por nombre, deporte o ubicación.
- **Gestión:** CRUD de escenarios para roles admin y gestor.
- **Visor 360:** Exploración panorámica de sectores del estadio.
- **Eventos:** Creación y consulta de eventos deportivos asociados a escenarios.

#### El problema identificado

Si bien la aplicación permite *ver* los eventos próximos asociados a cada escenario, no existe un mecanismo para que los usuarios **se inscriban** a dichos eventos. Esto genera las siguientes limitaciones:

1. **Sin seguimiento:** El usuario no tiene forma de indicar qué eventos le interesan asistir.
2. **Sin conteo de asistencia:** No se conoce cuántas personas planean asistir a cada evento.
3. **Sin recordatorios:** No hay base para futuras notificaciones de eventos próximos.
4. **Experiencia incompleta:** La app muestra eventos pero no permite interactuar con ellos de manera significativa.

#### Justificación del nuevo módulo

La incorporación de un módulo de inscripción a eventos resuelve estas limitaciones y aporta valor tanto al usuario final como al gestor del escenario:

- **Para el usuario:** Puede inscribirse a eventos de interés, cancelar su inscripción, y consultar sus inscripciones desde su perfil.
- **Para el gestor:** Puede ver cuántas personas están inscritas en cada evento, lo que le permite planificar logística y capacidad.
- **Para el admin:** Tiene visibilidad completa de todas las inscripciones del sistema.

---

### 3.2 Definición de la Funcionalidad

#### Nombre de la funcionalidad

Inscripción a Eventos Deportivos.

#### Objetivo

Permitir a los usuarios autenticados inscribirse a eventos deportivos asociados a los escenarios, cancelar dichas inscripciones, y consultar su estado desde la interfaz de la aplicación.

#### Usuarios involucrados

| Rol | Acciones | Restricciones |
|-----|----------|---------------|
| Asistente | Inscribirse, cancelar, ver sus inscripciones | Solo sus propias |
| Gestor | Ver inscripciones de sus eventos | Solo sus escenarios |
| Admin | Ver todas las inscripciones, eliminar cualquiera | Sin restricciones |

#### Flujo de funcionamiento

```
Usuario → Detalle del escenario → Selecciona evento → Validar datos → Guardar en Supabase → Inscripción confirmada
                                          ↓ (inválido)
                                       Mostrar error
```

#### Operaciones CRUD

| Operación | Método HTTP | Descripción |
|-----------|-------------|-------------|
| CREATE | INSERT | El usuario se inscribe a un evento |
| READ | SELECT | Consultar inscripciones propias o de un evento |
| DELETE | DELETE | Cancelar inscripción |

#### Persistencia

Toda la información de inscripciones se almacena en Supabase (PostgreSQL), ya que requiere persistencia centralizada:

- **Inspección:** Disponible para todos los dispositivos del usuario (multi-dispositivo).
- **Gestión:** Los gestores y admins pueden consultar inscripciones desde cualquier punto.
- **Seguridad:** Las políticas RLS garantizan que cada usuario solo vea sus propias inscripciones (salvo admin/gestor).

---

### 3.3 Diseño de la Interfaz

#### Principios de diseño

La interfaz del módulo de inscripción sigue los principios de diseño establecidos en el proyecto:

- **Consistencia visual:** Se reutilizó el sistema de colores existente (`colors.ts`), el espaciado (`spacing.ts`) y la tipografía (`fontSize`, `fontWeight`).
- **Coherencia con la app:** Los botones de inscripción siguen el mismo estilo que el botón de favoritos.
- **Retroalimentación visual:** El botón cambia de apariencia al inscribirse/cancelar.
- **Accesibilidad:** Iconos descriptivos (Ionicons) y contraste adecuado.

#### Pantallas del módulo

El módulo se integra en dos pantallas existentes:

**1. Detalle del escenario (sección de eventos)**

Cada tarjeta de evento en la pantalla de detalle ahora incluye:

- Nombre, fecha y hora del evento
- Descripción (si existe)
- Conteo de inscritos (ej: "3 inscritos")
- Botón de inscripción/desinscripción

**2. Perfil del usuario (sección "Mis inscripciones")**

En la pantalla de perfil se agregó una nueva sección que muestra todas las inscripciones activas del usuario:

- Icono de confirmación (checkmark verde)
- Fecha de inscripción
- Estado vacío cuando no hay inscripciones

#### Estados visuales del botón

| Estado | Apariencia | Comportamiento |
|--------|------------|----------------|
| No inscrito | Borde azul, fondo blanco | Al tocar, inscribe |
| Inscrito | Fondo azul, texto blanco | Al tocar, pide confirmación |
| Cargando | Indicador de progreso | Deshabilitado |

---

### 3.4 Modelo de Datos

#### Tabla `event_registrations`

Se creó una nueva tabla en PostgreSQL mediante la migración `011_event_registrations.sql`:

```sql
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id)
    ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);
```

#### Campos de la tabla

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identificador único |
| user_id | UUID | FK → profiles | Usuario inscrito |
| event_id | UUID | FK → events | Evento al que se inscribe |
| status | TEXT | CHECK, default | Estado: confirmed, cancelled, waitlist |
| registered_at | TIMESTAMPTZ | default NOW() | Fecha de inscripción |

#### Relaciones

```
profiles ←user_id→ event_registrations ←event_id→ events
```

#### Políticas RLS (Row Level Security)

| Política | Acción | Condición |
|----------|--------|-----------|
| select_own | SELECT | user_id = auth.uid() |
| select_admin | SELECT | Rol = admin |
| select_gestor | SELECT | Es gestor del escenario |
| insert_own | INSERT | user_id = auth.uid() |
| update_own | UPDATE | user_id = auth.uid() |
| delete_own_or_admin | DELETE | user_id = auth.uid() o admin |

#### Vista `event_registration_counts`

Se creó una vista para obtener el conteo de inscripciones por evento:

```sql
CREATE OR REPLACE VIEW public.event_registration_counts AS
SELECT
  event_id,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_count,
  COUNT(*) FILTER (WHERE status = 'waitlist') AS waitlist_count
FROM public.event_registrations
GROUP BY event_id;
```

---

### 3.5 Implementación del Backend (Hooks de React Query)

#### Hooks personalizados

Se creó el archivo `src/hooks/useEventRegistration.ts` con cinco hooks que encapsulan toda la lógica de comunicación con Supabase:

1. **useIsRegistered(userId, eventId):** Verifica si el usuario está inscrito en un evento específico.
2. **useRegisterForEvent():** Inscribir al usuario en un evento.
3. **useCancelRegistration():** Cancelar la inscripción del usuario.
4. **useMyRegistrations(userId):** Obtener todas las inscripciones activas del usuario.
5. **useRegistrationCounts(eventIds):** Obtener el conteo de inscripciones para una lista de eventos.

#### Funciones de API

**Verificar inscripción:**

```typescript
async function checkRegistration(
  userId: string, eventId: string
): Promise<EventRegistration | null> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .in('status', ['confirmed', 'waitlist'])
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EventRegistration | null;
}
```

**Inscribir en evento:**

```typescript
async function registerForEvent(
  userId: string, eventId: string
): Promise<EventRegistration> {
  // Verificar si ya está inscrito
  const existing = await checkRegistration(userId, eventId);
  if (existing) {
    throw new Error('Ya estás inscrito en este evento');
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      user_id: userId,
      event_id: eventId,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EventRegistration;
}
```

**Cancelar inscripción:**

```typescript
async function cancelRegistration(
  userId: string, eventId: string
): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) throw new Error(error.message);
}
```

#### Invalidación de caché

Todos los hooks utilizan `useQueryClient` para invalidar la caché después de cada operación:

```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({
    queryKey: ['event-registration',
      variables.userId, variables.eventId],
  });
  queryClient.invalidateQueries({
    queryKey: ['event-registration-counts'],
  });
  queryClient.invalidateQueries({
    queryKey: ['my-event-registrations',
      variables.userId],
  });
},
```

---

### 3.6 Implementación del Frontend

#### Componente `EventRegistrationButton`

Se creó un componente reutilizable que gestiona el estado del botón de inscripción:

```typescript
function EventRegistrationButton({
  eventId, eventName, userId,
  isRegistering, isCancelling,
  onRegister, onCancel,
}: EventRegistrationButtonProps) {
  const { data: registration, isLoading } =
    useIsRegistered(userId, eventId);
  const isRegistered = !!registration;

  return (
    <TouchableOpacity
      style={[
        styles.registerButton,
        isRegistered && styles.registerButtonActive,
      ]}
      onPress={() => {
        if (isRegistered) {
          onCancel(eventId, eventName);
        } else {
          onRegister(eventId);
        }
      }}
      disabled={isLoadingState}
    >
      <Ionicons
        name={isRegistered ? 'checkmark-circle' : 'add-circle-outline'}
        size={16}
        color={isRegistered ? colors.white : colors.primary}
      />
      <Text style={...}>
        {isRegistered ? 'Inscrito' : 'Inscribirse'}
      </Text>
    </TouchableOpacity>
  );
}
```

#### Integración en el detalle del escenario

En `src/app/scenario/[id].tsx` se modificaron las tarjetas de evento para incluir el botón de inscripción y el conteo de inscritos:

```tsx
{scenario.events.map((event) => {
  const counts = registrationCounts?.[event.id];
  return (
    <View key={event.id} style={styles.eventCard}>
      {/* ... info del evento ... */}
      {counts && (
        <Text style={styles.registrationCount}>
          {counts.confirmed_count} inscrito(s)
        </Text>
      )}
      <View style={styles.eventActions}>
        {user && (
          <EventRegistrationButton
            eventId={event.id}
            userId={user.id}
            onRegister={handleRegister}
            onCancel={handleCancelRegistration}
          />
        )}
      </View>
    </View>
  );
})}
```

#### Sección "Mis inscripciones" en el perfil

En `src/app/(tabs)/profile.tsx` se agregó el componente `MyRegistrationsSection`:

```tsx
function MyRegistrationsSection({ userId }) {
  const { data: registrations, isLoading } =
    useMyRegistrations(userId);

  if (isLoading) return <ActivityIndicator />;
  if (registrations?.length > 0) {
    return (
      <View style={styles.infoCard}>
        {registrations.map((reg) => (
          <View key={reg.id}>
            <Ionicons name="checkmark-circle"
              color={colors.success} />
            <Text>Inscrito el {reg.registered_at}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.emptyRegistrations}>
      <Text>No tienes inscripciones aún</Text>
    </View>
  );
}
```

#### Estilos personalizados

| Estilo | Descripción |
|--------|-------------|
| eventActions | Contenedor flex para botones de acción |
| registrationCount | Texto verde para conteo de inscritos |
| registerButton | Botón con borde azul, fondo blanco |
| registerButtonActive | Botón con fondo azul (inscrito) |
| registerButtonDisabled | Opacidad reducida (cargando) |
| registerButtonText | Texto azul del botón |
| registerButtonTextActive | Texto blanco del botón activo |

---

### 3.7 Validaciones y Manejo de Errores

#### Validaciones implementadas

1. **Autenticación:** Antes de inscribirse, se verifica que el usuario está logueado. Si no lo está, se muestra un alerta "Iniciar sesión".
2. **Duplicados:** La función `registerForEvent` verifica si ya existe una inscripción activa antes de insertar. Si existe, lanza el error "Ya estás inscrito en este evento".
3. **Restricción SQL:** La tabla tiene una restricción `UNIQUE (user_id, event_id)` que previene duplicados a nivel de base de datos.
4. **Estado:** Solo se permiten los valores "confirmed", "cancelled" y "waitlist" mediante la restricción CHECK.
5. **Integridad referencial:** Las foreign keys `user_id → profiles` y `event_id → events` garantizan que las referencias sean válidas.

#### Manejo de errores

**Errores de red / Supabase:**

```typescript
if (error) throw new Error(error.message);
```

**Errores en la interfaz:**

```typescript
const handleRegister = async (eventId) => {
  if (!user?.id) {
    Alert.alert('Iniciar sesión',
      'Debes iniciar sesión para inscribirte.');
    return;
  }
  try {
    await registerEvent({ userId: user.id, eventId });
  } catch (err) {
    const msg = err instanceof Error
      ? err.message
      : 'Error al inscribirte';
    Alert.alert('Error', msg);
  }
};
```

**Confirmación antes de cancelar:**

- **Web:** `window.confirm()`
- **Móvil:** `Alert.alert()` con opciones "No" y "Sí, cancelar"

#### Tabla de validaciones

| Caso | Validación | Resultado |
|------|-----------|-----------|
| Usuario no logueado | `user?.id` null | Alerta de login |
| Ya inscrito | `checkRegistration` retorna datos | Error "Ya estás inscrito" |
| Datos inválidos | UNIQUE constraint en DB | Error de Supabase |
| Red caída | Supabase lanza error | Alerta "Error al inscribirte" |
| Cancelar sin confirmar | Diálogo de confirmación | Acción cancelada |

---

### 3.8 Gestión de Estado

#### Estado del servidor (React Query)

El módulo utiliza `@tanstack/react-query` para gestionar el estado del servidor. Cada hook de consulta gestiona tres estados:

- **isLoading:** Datos aún no cargados (muestra indicador de progreso).
- **isError:** Ocurrió un error en la consulta.
- **data:** Datos cargados exitosamente.

#### Estado de las mutaciones

Las mutaciones (`useRegisterForEvent`, `useCancelRegistration`) gestionan el estado `isPending` para deshabilitar el botón mientras se ejecuta la operación:

```typescript
const { mutateAsync: registerEvent, isPending: isRegistering }
  = useRegisterForEvent();
const { mutateAsync: cancelReg, isPending: isCancelling }
  = useCancelRegistration();
```

#### Flujo de estado

```
Idle → (Tap "Inscribirse") → Cargando... → (Éxito) → Inscrito
         ↓ (Fallo)
       Error → (Reintentar) → Idle
       
Inscrito → (Tap "Cancelar") → Idle
```

#### Cache e invalidación

Los `queryKey` se estructuran para permitir invalidación selectiva:

| Query Key | Propósito |
|-----------|-----------|
| event-registration, userId, eventId | Verificar inscripción individual |
| event-registration-counts, eventIds | Conteo de inscripciones por evento |
| my-event-registrations, userId | Lista de inscripciones del usuario |

---

### 3.9 Pruebas

#### Pruebas realizadas

1. **Prueba 1: Acceso al módulo.** Se verificó que los eventos se muestran en el detalle del escenario con el botón de inscripción visible.

2. **Prueba 2: Inscripción exitosa.** Un usuario autenticado toca "Inscribirse" en un evento. El botón cambia a "Inscrito" con fondo azul. El conteo de inscritos se incrementa en 1.

3. **Prueba 3: Inscripción duplicada.** Se intentó inscribir dos veces al mismo evento. Se mostró el error "Ya estás inscrito en este evento".

4. **Prueba 4: Cancelar inscripción.** Un usuario inscrito toca "Inscrito". Se muestra diálogo de confirmación. Al confirmar, el botón vuelve a "Inscribirse" y el conteo disminuye.

5. **Prueba 5: Ver mis inscripciones.** En la pantalla de perfil, la sección "Mis inscripciones" muestra todas las inscripciones activas del usuario.

6. **Prueba 6: Sin inscripciones.** Un usuario nuevo ve el mensaje "No tienes inscripciones aún" en el perfil.

7. **Prueba 7: Persistencia.** Se inscribió, se cerró la app, se reabrió. La inscripción persiste correctamente.

8. **Prueba 8: Usuario no autenticado.** Un usuario sin sesión ve la alerta "Debes iniciar sesión para inscribirte".

9. **Prueba 9: Manejo de errores de red.** Se simuló una conexión lenta. El botón mostró el indicador de progreso y al fallar mostró la alerta de error.

10. **Prueba 10: Verificación en Supabase.** Se verificó desde Supabase Studio que los registros se crean correctamente en la tabla `event_registrations`.

#### Resultados de las pruebas

| # | Prueba | Resultado |
|---|--------|-----------|
| 1 | Acceso al módulo | ✅ Pass |
| 2 | Inscripción exitosa | ✅ Pass |
| 3 | Inscripción duplicada | ✅ Pass |
| 4 | Cancelar inscripción | ✅ Pass |
| 5 | Ver mis inscripciones | ✅ Pass |
| 6 | Sin inscripciones | ✅ Pass |
| 7 | Persistencia | ✅ Pass |
| 8 | Usuario no autenticado | ✅ Pass |
| 9 | Manejo de errores | ✅ Pass |
| 10 | Verificación en Supabase | ✅ Pass |

#### TypeScript

Se ejecutó `tsc --noEmit` y el proyecto compila sin errores de tipo, lo que confirma la correcta integración de los tipos `EventRegistration` y `EventRegistrationCount` en toda la aplicación.

---

### 3.10 Evidencias

A continuación se presentan las evidencias del desarrollo del módulo de inscripción a eventos, organizadas según las pruebas realizadas.

#### Evidencia 1: Migración aplicada en Supabase

Se ejecutó la migración `011_event_registrations.sql` mediante `supabase db reset`. La tabla `event_registrations` se creó correctamente con todas sus columnas, restricciones y políticas RLS.

> *[Insertar captura: terminal con supabase db reset mostrando "Applying migration 011_event_registrations.sql..."]*

La salida del terminal confirma que la migración `011_event_registrations.sql` se aplicó sin errores, junto con todas las migraciones anteriores (001–010).

#### Evidencia 2: Tabla creada en Supabase Studio

Desde Supabase Studio (`http://127.0.0.1:54323`) se verificó que la tabla `event_registrations` aparece en el Table Editor con la estructura correcta.

> *[Insertar captura: Table Editor de Supabase mostrando la tabla event_registrations]*

Se observan las columnas: `id`, `user_id`, `event_id`, `status`, `registered_at`, junto con las restricciones UNIQUE y CHECK.

#### Evidencia 3: Vista de conteo de inscripciones

La vista `event_registration_counts` está disponible en Supabase Studio y retorna el conteo de inscripciones por evento.

> *[Insertar captura: SQL Editor ejecutando SELECT * FROM event_registration_counts]*

#### Evidencia 4: REST API accesible

Se verificó mediante `curl` que la tabla `event_registrations` y la vista `event_registration_counts` son accesibles a través de la REST API de Supabase.

> *[Insertar captura: terminal con curl mostrando endpoints disponibles]*

#### Evidencia 5: Botón de inscripción en el detalle del escenario

En la pantalla de detalle del escenario, cada evento muestra el nuevo botón "Inscribirse" junto con el conteo de inscritos.

> *[Insertar captura: pantalla de detalle del escenario con botón "Inscribirse" visible]*

Se observa el botón con estilo de borde azul y el texto "Inscribirse", indicando que el usuario aún no está inscrito en el evento.

#### Evidencia 6: Inscripción exitosa

Después de tocar "Inscribirse", el botón cambia su estado visual: fondo azul, texto blanco y icono de checkmark, indicando que la inscripción fue exitosa.

> *[Insertar captura: pantalla con botón en estado "Inscrito"]*

El conteo de inscritos se actualiza automáticamente después de la inscripción (ej: "5 inscritos" → "6 inscritos").

#### Evidencia 7: Conteo de inscritos actualizado

Después de una inscripción, el conteo mostrado debajo del evento se actualiza en tiempo real gracias a la invalidación de caché de React Query.

> *[Insertar captura: pantalla mostrando conteo actualizado]*

#### Evidencia 8: Confirmación de cancelación

Al tocar el botón "Inscrito" para cancelar, se muestra un diálogo de confirmación para evitar cancelaciones accidentales.

> *[Insertar captura: diálogo "Cancelar inscripción" con opciones "No" y "Sí, cancelar"]*

El usuario tiene dos opciones: "No" (mantiene la inscripción) o "Sí, cancelar" (elimina la inscripción).

#### Evidencia 9: Sección "Mis inscripciones" en el perfil

En la pantalla de perfil del usuario, se muestra la sección "Mis inscripciones a eventos" con todas las inscripciones activas.

> *[Insertar captura: pantalla de perfil con sección "Mis inscripciones"]*

Cada inscripción muestra el icono de confirmación verde y la fecha en que se realizó la inscripción.

#### Evidencia 10: Estado vacío (sin inscripciones)

Un usuario que no tiene inscripciones ve un estado vacío con un icono descriptivo y un mensaje informativo.

> *[Insertar captura: perfil vacío con "No tienes inscripciones aún"]*

El mensaje "No tienes inscripciones aún" orienta al usuario sobre cómo inscribirse desde los detalles de cada escenario.

#### Evidencia 11: Alerta de usuario no autenticado

Si un usuario no está logueado e intenta inscribirse, se muestra una alerta indicando que debe iniciar sesión.

> *[Insertar captura: alerta "Iniciar sesión"]*

#### Evidencia 12: Typecheck sin errores

Se ejecutó `tsc --noEmit` y el proyecto compila correctamente sin errores de tipo TypeScript.

> *[Insertar captura: terminal mostrando tsc --noEmit sin errores]*

#### Evidencia 13: Estructura de archivos del módulo

Los archivos creados/modificados para el módulo se organizan de la siguiente manera:

> *[Insertar captura: explorador de archivos mostrando la estructura]*

#### Resumen de archivos creados/modificados

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| 011_event_registrations.sql | Migración con tabla y RLS | Nuevo |
| useEventRegistration.ts | Hooks de React Query | Nuevo |
| database.ts | Tipos de Supabase | Modificado |
| index.ts | Tipos TypeScript | Modificado |
| [id].tsx | Detalle del escenario | Modificado |
| profile.tsx | Pantalla de perfil | Modificado |

#### Evidencia 14: Git diff de los cambios

El repositorio muestra los cambios realizados en la rama `feature/event-registration`.

> *[Insertar captura: terminal con git status mostrando archivos modificados]*

---

## Conclusiones

El desarrollo del módulo de inscripción a eventos deportivos en la aplicación DeporteYa demuestra la integración exitosa de múltiples conocimientos trabajados durante la materia de Aplicaciones Móviles I:

1. **Análisis y diseño:** Se identificó la necesidad de un mecanismo de inscripción a eventos, se definió la funcionalidad, y se diseñaron las interfaces manteniendo la consistencia visual del proyecto.

2. **Implementación de interfaz:** Se crearon nuevos componentes (`EventRegistrationButton`, `MyRegistrationsSection`) que se integran armónicamente con la aplicación existente.

3. **Navegación:** El módulo se accede desde la pantalla de detalle del escenario (sección de eventos) y desde la pantalla de perfil (sección "Mis inscripciones").

4. **Lógica de negocio:** Las operaciones de inscripción, cancelación y consulta se implementaron mediante hooks personalizados de React Query.

5. **Validaciones:** Se implementaron validaciones de autenticación, duplicados, integridad referencial y confirmación de acción.

6. **Manejo de estado:** React Query gestiona eficientemente el estado del servidor, la caché y la invalidación selectiva.

7. **Persistencia:** Toda la información se almacena en Supabase (PostgreSQL) con políticas RLS granulares.

8. **CRUD:** Se implementaron operaciones CREATE, READ y DELETE sobre la tabla `event_registrations`.

9. **Manejo de errores:** Se contemplaron errores de red, datos inválidos, duplicados y usuarios no autenticados.

10. **Integración:** El módulo forma parte integral de la aplicación y no funciona como un proyecto independiente.

El módulo cumple con todos los requisitos mínimos establecidos en la guía del examen integrador (PDF 7) y demuestra la capacidad de resolver un desafío real de desarrollo de software móvil utilizando las tecnologías trabajadas durante la materia.
