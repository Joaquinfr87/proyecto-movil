# DOCUMENTACIÓN TÉCNICA Y EVALUACIÓN DEL EXAMEN FINAL
## MÓDULO "POV (POINT OF VIEW) COMUNITARIO"

**Estudiante:** David Cruz  
**Materia:** Aplicaciones Móviles  
**Rama de Git:** `ExamenFinalDavidCruz`  
**Proyecto:** Lugares Interactivos (Expo / React Native + Supabase)  
**Fecha:** Septiembre 2026  

---

## PARTE 1. RESUMEN EJECUTIVO Y CADENA DE VALOR DEL DESARROLLO

Esta implementación demuestra una integración completa de punta a punta cubriendo la expectativa técnica requerida:

$$\text{ANÁLISIS} \rightarrow \text{DISEÑO} \rightarrow \text{INTERFAZ} \rightarrow \text{NAVEGACIÓN} \rightarrow \text{LÓGICA} \rightarrow \text{VALIDACIÓN} \rightarrow \text{ESTADO} \rightarrow \text{PERSISTENCIA} \rightarrow \text{SUPABASE} \rightarrow \text{POSTGRESQL} \rightarrow \text{CRUD} \rightarrow \text{PRUEBAS}$$

---

## PARTE 2. FUNCIONALIDAD IMPLEMENTADA Y PROBLEMA QUE RESUELVE

### 1. Funcionalidad Implementada
Se desarrolló la **sexta pestaña interactiva llamada "POV"** (Point of View), orientada a la generación de contenido por parte de la comunidad. Esta pantalla integra:
* Un mapa interactivo (MapTiler + MapLibre GL) que filtra exclusivamente puntos registrados por los usuarios.
* Marcadores rojos diferenciados (`#EF4444`) para otorgar identidad visual comunitaria frente al mapa oficial.
* Un botón flotante de acción (FAB) para la creación instantánea de nuevos lugares deportivos/recreativos.
* Un formulario de registro con **captura obligatoria de ubicación GPS en tiempo real**.

### 2. Problema que Resuelve
Anteriormente, la aplicación solo mostraba información administrada de forma estática o por usuarios de rol avanzado (`admin` / `gestor`).
* **Falta de contenido participativo:** Los usuarios comunes (`asistente`) no tenían forma de compartir o mapear canchas de barrio, pistas locales o espacios deportivos informales.
* **Saturación del mapa principal:** Mezclar datos verificados del sistema con aportes informales afectaba la legibilidad del mapa de Inicio.
* **Solución:** La sección POV descentraliza el mapeo deportivo, empoderando a la comunidad y manteniendo aislados y ordenados los lugares oficiales frente a los comunitarios.

---

## PARTE 3. ARQUITECTURA Y COMPONENTES DESARROLLADOS

### 1. Vistas Creadas
* **`src/app/(tabs)/pov.tsx` (Pantalla Principal POV):**
  * Renderizado adaptativo de mapa (MapLibre nativo para Android/iOS y WebMapLibre para Web).
  * Filtro de datos exclusivo comunitarios (`is_community = true`).
  * Marcadores en color rojo (`#EF4444`) con eventos de selección.
  * Tarjeta flotante interactiva de previsualización del punto seleccionado.
  * Botón flotante FAB para lanzar el flujo de registro.
* **`src/app/pov-form/[id].tsx` (Formulario de Creación POV):**
  * Captura automática y obligatoria de coordenadas GPS (`latitud`, `longitud`).
  * Selector mediante *Chips* táctiles para tipo de escenario (Cancha, Pista, Parque, etc.).
  * Selección y carga de fotografías locales desde galería.
  * Validación reactiva con Zod y React Hook Form.

### 2. Navegación
* **`src/app/(tabs)/_layout.tsx`:** Registro del nuevo tab `pov` situado inmediatamente después del tab `index` (Inicio), accesible para todos los roles mediante el ícono `eye-outline`.
* Navegación parametrizada por URL desde `pov.tsx` hacia `pov-form/new?lat=...&lng=...` para transferir las coordenadas de geolocalización detectadas.

---

## PARTE 4. BASE DE DATOS, PERSISTENCIA Y SUPABASE (POSTGRESQL)

### 1. Tablas Modificadas e Índices
* **Tabla `public.scenarios` (Modificada):**
  * `is_community` (`BOOLEAN NOT NULL DEFAULT false`): Campo discriminador para separar puntos comunitarios de los del seed/oficiales.
* **Índice Parcial Creado:**
  * `idx_scenarios_is_community`: Optimización en PostgreSQL para acelerar las consultas `.eq('is_community', true)`.

### 2. Migración de Base de Datos
* **`supabase/migrations/011_add_community_scenarios.sql`:**
```sql
-- Adición de columna
ALTER TABLE public.scenarios ADD COLUMN is_community BOOLEAN NOT NULL DEFAULT false;

-- Índice optimizado
CREATE INDEX idx_scenarios_is_community ON public.scenarios(is_community) WHERE is_community = true;

-- Políticas de Seguridad RLS (Row Level Security)
CREATE POLICY "scenarios_insert_community"
  ON public.scenarios FOR INSERT TO authenticated
  WITH CHECK (is_community = true);

CREATE POLICY "scenarios_update_community_own"
  ON public.scenarios FOR UPDATE TO authenticated
  USING (is_community = true AND created_by = auth.uid())
  WITH CHECK (is_community = true AND created_by = auth.uid());
```

### 3. Datos Semilla (Seed)
* **`supabase/seed.sql`:** Se incorporaron 5 escenarios comunitarios de prueba distribuidos geográficamente en Bolivia (La Paz, Cochabamba, Santa Cruz, Sucre y Oruro) asignados al usuario de rol `asistente`.

### 4. Operaciones CRUD Implementadas
* **Create (Creación):** Inserción en `scenarios` forzando `is_community: true` y `created_by: auth.uid()` mediante el hook `useCreateCommunityScenario()`. Subida de imágenes al bucket `scenario-images` en Supabase Storage.
* **Read (Lectura):** Consulta en `useCommunityScenarios()` filtrando escenarios con `estado = 'activo'` e `is_community = true`. En la pantalla Inicio, lectura filtrando `is_community = false`.
* **Update (Actualización):** Permitido para el usuario creador del punto mediante la política RLS `scenarios_update_community_own`.

---

## PARTE 5. MANEJO DE ESTADO Y CACHÉ

* **React Query (@tanstack/react-query):**
  * `queryKey: ['scenarios-community']`: Caché independiente con `staleTime` ajustado para refresco de datos en la comunidad.
  * Invalidador de caché automático en mutaciones de creación para reflejar el nuevo marcador en el mapa de inmediato sin necesidad de recargar la aplicación.

---

## PARTE 6. DESAFÍO ADICIONAL INCORPORADO

* **Mejora de Experiencia de Usuario (UX):** Diseño de mapas con colores temáticos diferenciados (rojo comunitarios vs azul oficiales) e interfaz adaptada con FAB.
* **Filtros Avanzados:** Segregación lógica de datos en tiempo de consulta PostgreSQL.
* **Validaciones Adicionales:** Validación estricta de GPS y esquemas Zod en formularios.
* **Seguridad y Permisos:** Control de acceso detallado mediante Row Level Security (RLS) en Supabase.

---

## PARTE 7. DIFICULTADES ENCONTRADAS Y SOLUCIONES

1. **Incompatibilidad de Tipos de Supabase en Frontend:**
   * *Dificultad:* TypeScript arrojaba errores al usar `.eq('is_community', true)` porque el archivo de definición autogenerado `database.ts` no reconocía la nueva columna.
   * *Solución:* Se actualizaron las interfaces de `Row`, `Insert` y `Update` en `src/types/database.ts` y `src/types/index.ts`.
2. **Restricciones de RLS para Usuarios de Rol Asistente:**
   * *Dificultad:* Por defecto, solo los usuarios `admin` y `gestor` podían hacer `INSERT` en la tabla `scenarios`.
   * *Solución:* Se creó una política RLS específica (`scenarios_insert_community`) que permite a cualquier usuario autenticado crear registros siempre que el campo `is_community` se envíe como `true`.
3. **Obtención de Ubicación en Formularios:**
   * *Dificultad:* Garantizar que las coordenadas correspondan a la ubicación física real del usuario al momento de la publicación.
   * *Solución:* Se integró `expo-location` bloqueando el envío del formulario si no existe una coordenada GPS válida capturada.

---

## PARTE 8. PLAN DE PRUEBAS DE SOFTWARE (OBLIGATORIO)

### Prueba 1: Acceso al nuevo módulo
* **Objetivo:** Verificar que la pestaña "POV" es visible y accesible en la barra de navegación inferior.
* **Procedimiento:** Iniciar la aplicación e iniciar sesión con cualquier rol (`asistente`, `gestor` o `admin`). Presionar sobre el ícono del ojo ("POV").
* **Resultado Esperado:** La aplicación navega correctamente a la pantalla `/pov` mostrando el mapa interactivo comunitario.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Pestaña POV abierta mostrando la barra de tabs inferior con la opción POV seleccionada]**

### Prueba 2: Ingreso de datos válidos
* **Objetivo:** Registrar un nuevo escenario comunitario con toda la información requerida correcta.
* **Procedimiento:** Presionar el botón flotante (+), completar el formulario con: Nombre: "Cancha Los Pinos", Tipo: "Cancha", Capacidad: "50", Descripción: "Cancha comunitaria de futsal", adjuntar imagen y presionar "Crear punto POV".
* **Resultado Esperado:** El formulario procesa los datos, muestra alerta de éxito y redirige al mapa.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Formulario de creación POV llenado con datos válidos]**

### Prueba 3: Ingreso de datos inválidos
* **Objetivo:** Comprobar la respuesta del sistema al enviar datos fuera del formato o tipo esperado.
* **Procedimiento:** Intentar ingresar letras en el campo de capacidad (ej: "cincuenta") o valores negativos (ej: "-10").
* **Resultado Esperado:** El validador Zod rechaza el envío y muestra el mensaje: *"Debe ser un número mayor a 0"*.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Formulario mostrando error de validación en el campo Capacidad]**

### Prueba 4: Validación de campos obligatorios
* **Objetivo:** Validar la restricción al intentar enviar el formulario con campos vacíos.
* **Procedimiento:** Dejar el campo "Nombre del lugar" en blanco y presionar "Crear punto POV".
* **Resultado Esperado:** El formulario no se envía y aparece un mensaje en rojo debajo del campo: *"El nombre es obligatorio"*.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Mensaje de validación en rojo debajo del campo Nombre]**

### Prueba 5: Guardado de información
* **Objetivo:** Confirmar que la inserción de datos se ejecuta correctamente en Supabase.
* **Procedimiento:** Enviar un punto válido y revisar la tabla `scenarios` en Supabase Studio.
* **Resultado Esperado:** El nuevo registro aparece almacenado con `is_community = true` y el ID del usuario en `created_by`.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Panel de Supabase Studio mostrando la fila insertada en la tabla scenarios]**

### Prueba 6: Consulta de información
* **Objetivo:** Verificar la lectura y visualización de los puntos comunitarios en el mapa.
* **Procedimiento:** Abrir la pestaña POV y observar los marcadores desplegados.
* **Resultado Esperado:** Se cargan únicamente los puntos comunitarios con marcadores de color **rojo** (`#EF4444`). Al presionar un marcador, se abre la tarjeta flotante.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Mapa POV mostrando los marcadores rojos de la comunidad y la tarjeta flotante al hacer clic]**

### Prueba 7: Modificación de información
* **Objetivo:** Validar la actualización de datos de un punto comunitario por parte de su creador.
* **Procedimiento:** Ingresar con el usuario creador del punto, editar la descripción del escenario registrado y guardar cambios.
* **Resultado Esperado:** La base de datos actualiza el registro cumpliendo la política RLS `scenarios_update_community_own`.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Pantalla del punto editado reflejando los nuevos datos]**

### Prueba 8: Eliminación de información
* **Objetivo:** Comprobar las reglas de eliminación y la restricción para usuarios estándar.
* **Procedimiento:** Intentar eliminar un punto comunitario desde una cuenta de rol `asistente` vs. una cuenta `admin`.
* **Resultado Esperado:** El usuario `asistente` no tiene la opción/botón de eliminación activado; únicamente el rol `admin` puede ejecutar la eliminación (política RLS `scenarios_delete_admin_only`).
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Vista de usuario asistente sin botón de eliminación vs vista admin]**

### Prueba 9: Comprobación de persistencia
* **Objetivo:** Garantizar la permanencia de los datos tras reiniciar la aplicación o limpiar el caché.
* **Procedimiento:** Registrar un punto, cerrar la app/navegador completamente, reiniciar la aplicación y volver a abrir la pestaña POV.
* **Resultado Esperado:** El punto registrado previamente vuelve a cargarse en el mapa desde Supabase sin perder información.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Mapa POV volviendo a mostrar el punto guardado tras reiniciar la app]**

### Prueba 10: Manejo de errores
* **Objetivo:** Evaluar la resiliencia de la app ante la falta de permisos de GPS o fallos de red.
* **Procedimiento:** Denegar el permiso de localización cuando el formulario POV intenta obtener el GPS.
* **Resultado Esperado:** La aplicación atrapa la excepción, detiene la carga, muestra una alerta explicativa (*"Se necesita permiso de ubicación para crear un punto POV"*) y regresa de forma segura al mapa sin romper la ejecución.
> ⚠️ **[PONER CAPTURA DE PANTALLA AQUÍ: Alerta o aviso de error de permiso de ubicación GPS]**
