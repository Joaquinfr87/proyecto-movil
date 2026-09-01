# Documentación del Examen Final — Módulo "POV (Point of View) Comunitario"

**Estudiante:** David Cruz  
**Rama de Git:** `ExamenFinalDavidCruz`  
**Proyecto:** Lugares Interactivos (Expo / React Native + Supabase)  

---

## 1. Resumen Ejecutivo y Cadena de Valor del Desarrollo

Esta implementación demuestra una integración completa de punta a punta cubriendo la expectativa técnica requerida:

$$\text{Análisis} \rightarrow \text{Diseño} \rightarrow \text{Interfaz} \rightarrow \text{Navegación} \rightarrow \text{Lógica} \rightarrow \text{Validación} \rightarrow \text{Estado} \rightarrow \text{Persistencia} \rightarrow \text{Supabase} \rightarrow \text{PostgreSQL} \rightarrow \text{CRUD} \rightarrow \text{Pruebas}$$

---

## 2. Funcionalidad Implementada y Problema que Resuelve

### Funcionalidad Implementada
Se desarrolló la **sexta pestaña interactiva llamada "POV"** (Point of View), orientada a la generación de contenido por parte de la comunidad. Esta pantalla integra:
1. Un mapa interactivo (MapTiler + MapLibre GL) que filtra exclusivamente puntos registrados por los usuarios.
2. Marcadores rojos diferenciados (`#EF4444`) para otorgar identidad visual comunitaria.
3. Un botón flotante de acción (FAB) para la creación instantánea de nuevos lugares deportivos/recreativos.
4. Un formulario de registro con **captura obligatoria de ubicación GPS en tiempo real**.

### Problema que Resuelve
Anteriormente, la aplicación solo mostraba información administrada de forma estática o por usuarios de rol avanzado (`admin` / `gestor`). 
* **Falta de contenido participativo:** Los usuarios comunes (`asistente`) no tenían forma de compartir o mapear canchas de barrio, pistas locales o espacios deportivos informales.
* **Saturación del mapa principal:** Mezclar datos verificados del sistema con aportes informales afectaba la legibilidad del mapa de Inicio.
* **Solución:** La sección POV descentraliza el mapeo deportivo, empoderando a la comunidad y manteniendo aislados y ordenados los lugares oficiales frente a los comunitarios.

---

## 3. Arquitectura y Componentes Desarrollados

### A. Pantallas y Vistas Creadas
* **`src/app/(tabs)/pov.tsx` (Pantalla Principal POV):**
  * Renderizado adaptativo de mapa (MapLibre nativo para Android/iOS y WebMapLibre para Web).
  * Filtro de datos exclusivo comunitarios (`is_community = true`).
  * Marcadores en color rojo (`#EF4444`) con animaciones/eventos de selección (`onPress`).
  * Tarjeta flotante interactiva de previsualización del punto seleccionado.
  * Botón flotante FAB para lanzar el flujo de registro.
* **`src/app/pov-form/[id].tsx` (Formulario de Creación POV):**
  * Captura automática y obligatoria de coordenadas GPS (`latitud`, `longitud`).
  * Selector mediante *Chips* táctiles para tipo de escenario (Cancha, Pista, Parque, etc.).
  * Selección y carga de fotografías locales desde galería.
  * Validación reactiva con Zod y React Hook Form.

### B. Navegación
* **`src/app/(tabs)/_layout.tsx`:** Registro del nuevo tab `pov` situado inmediatamente después del tab `index` (Inicio), accesible para todos los roles mediante el ícono `eye-outline`.
* Navegación parametrizada por URL desde `pov.tsx` hacia `pov-form/new?lat=...&lng=...` para transferir las coordenadas de geolocalización detectadas.

---

## 4. Base de Datos, Persistencia y Supabase (PostgreSQL)

### A. Tablas Creadas / Modificadas
* **Tabla `public.scenarios` (Modificada):**
  * `is_community` (`BOOLEAN NOT NULL DEFAULT false`): Campo discriminador para separar puntos comunitarios de los del seed/oficiales.
* **Índice Parcial Creado:**
  * `idx_scenarios_is_community`: Optimización en PostgreSQL para acelerar las consultas `.eq('is_community', true)`.

### B. Migración de Base de Datos
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

### C. Datos Semilla (Seed)
* **`supabase/seed.sql` (Actualizado):** Se incorporaron 5 escenarios comunitarios de prueba distribuidos geográficamente en Bolivia (La Paz, Cochabamba, Santa Cruz, Sucre y Oruro) asignados al usuario de rol `asistente`.

### D. Operaciones CRUD Implementadas
* **Create (Creación):** Inserción en `scenarios` forzando `is_community: true` y `created_by: auth.uid()` mediante el hook `useCreateCommunityScenario()`. Subida de imágenes al bucket `scenario-images` en Supabase Storage.
* **Read (Lectura):** Consulta en `useCommunityScenarios()` filtrando escenarios con `estado = 'activo'` e `is_community = true`. En la pantalla Inicio, lectura filtrando `is_community = false`.
* **Update (Actualización):** Permitido para el usuario creador del punto mediante la política RLS `scenarios_update_community_own`.

---

## 5. Manejo de Estado y Caché

* **React Query (@tanstack/react-query):**
  * `queryKey: ['scenarios-community']`: Caché independiente con `staleTime` ajustado para refresco de datos en la comunidad.
  * Invalidador de caché automático en mutaciones de creación para reflejar el nuevo marcador en el mapa de inmediato sin necesidad de recargar la aplicación.

---

## 6. Pruebas Realizadas y Verificación

1. **Prueba de Compilación y Tipado:**
   * Ejecución de `npx tsc --noEmit` resultando en 0 errores de TypeScript.
2. **Pruebas de Base de Datos:**
   * Reset y aplicación exitosa de migraciones y semillas con `pnpm db:reset`.
3. **Prueba de Separación de Capas en Mapa:**
   * Verificación de que la pestaña **Inicio** únicamente muestra marcadores azules (escenarios oficiales).
   * Verificación de que la pestaña **POV** únicamente muestra marcadores rojos (escenarios comunitarios).
4. **Prueba de Creación de Punto:**
   * Autenticación con rol `asistente`.
   * Apertura del formulario POV, captura de GPS, llenado de datos y envío exitoso.
   * Confirmación del renderizado inmediato del nuevo marcador en el mapa POV.

---

## 7. Dificultades Encontradas y Soluciones

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

## 8. Cumplimiento del Desafío Adicional

Esta entrega cumple los siguientes criterios del Desafío Adicional:
* **Mejora de Experiencia de Usuario (UX):** Diseño de mapas con colores temáticos diferenciados (rojo comunitarios vs azul oficiales) e interfaz adaptada.
* **Filtros Avanzados:** Segregación lógica de datos en tiempo de consulta PostgreSQL.
* **Validaciones Adicionales:** Validación estricta de GPS y esquemas Zod en formularios.
* **Seguridad y Permisos:** Control de acceso detallado mediante Row Level Security (RLS) en Supabase.
