-- ============================================================
-- Migration: 011_event_registrations
-- Inscripciones de usuarios a eventos deportivos
-- ============================================================

-- -----------------------------------------------------------
-- Tabla: event_registrations (inscripciones a eventos)
-- -----------------------------------------------------------
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------
-- RLS Policies
-- -----------------------------------------------------------

-- Cada usuario puede ver sus propias inscripciones
CREATE POLICY "event_registrations_select_own"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin puede ver todas las inscripciones
CREATE POLICY "event_registrations_select_admin"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Gestores pueden ver inscripciones de sus eventos
CREATE POLICY "event_registrations_select_gestor"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.scenarios s ON s.id = e.scenario_id
      WHERE e.id = event_id
        AND (
          s.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- Usuarios autenticados pueden inscribirse (solo su propio registro)
CREATE POLICY "event_registrations_insert_own"
  ON public.event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden cancelar su propia inscripción
CREATE POLICY "event_registrations_update_own"
  ON public.event_registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden eliminar su propia inscripción; admin puede eliminar cualquiera
CREATE POLICY "event_registrations_delete_own_or_admin"
  ON public.event_registrations FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------
-- Vista: conteo de inscripciones por evento (para mostrar cupos)
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW public.event_registration_counts AS
SELECT
  event_id,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_count,
  COUNT(*) FILTER (WHERE status = 'waitlist') AS waitlist_count
FROM public.event_registrations
GROUP BY event_id;

-- Permitir lectura a todos los autenticados via Supabase API
GRANT SELECT ON public.event_registration_counts TO authenticated;
