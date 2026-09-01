-- ============================================================
-- Migration: 011_create_scenario_ratings
-- Valoraciones y reseñas de escenarios deportivos
-- Calificacion 1-5 + comentario opcional por usuario y escenario
-- ============================================================

-- -----------------------------------------------------------
-- Tabla: scenario_ratings
-- Una valoracion por usuario y escenario (clave unica compuesta)
-- -----------------------------------------------------------
CREATE TABLE public.scenario_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, scenario_id)
);

ALTER TABLE public.scenario_ratings ENABLE ROW LEVEL SECURITY;

-- Privilegios de tabla (los default privileges locales no los otorgan)
GRANT SELECT ON public.scenario_ratings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scenario_ratings TO authenticated;

-- Valoraciones de usuarios autenticados

-- Todos los autenticados pueden leer las valoraciones
CREATE POLICY "scenario_ratings_select_authenticated"
  ON public.scenario_ratings FOR SELECT
  TO authenticated
  USING (true);

-- Valorar un escenario (solo la propia valoracion)
CREATE POLICY "scenario_ratings_insert_own"
  ON public.scenario_ratings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Editar la propia valoracion
CREATE POLICY "scenario_ratings_update_own"
  ON public.scenario_ratings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Eliminar la propia valoracion; admin puede eliminar cualquiera
CREATE POLICY "scenario_ratings_delete_own_or_admin"
  ON public.scenario_ratings FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger: actualizar updated_at automaticamente
CREATE TRIGGER scenario_ratings_updated_at
  BEFORE UPDATE ON public.scenario_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Indices para consultas frecuentes
CREATE INDEX IF NOT EXISTS scenario_ratings_scenario_id_idx
  ON public.scenario_ratings (scenario_id);

CREATE INDEX IF NOT EXISTS scenario_ratings_user_id_idx
  ON public.scenario_ratings (user_id);

-- -----------------------------------------------------------
-- Funcion: scenario_rating_stats()
-- Agregado de promedio y conteo por escenario (para tarjetas)
-- SECURITY DEFINER: solo expone agregados, no datos de usuarios
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.scenario_rating_stats()
RETURNS TABLE (scenario_id UUID, average NUMERIC, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.scenario_id, ROUND(AVG(r.rating)::numeric, 1), COUNT(*)::bigint
  FROM public.scenario_ratings r
  GROUP BY r.scenario_id;
$$;

GRANT EXECUTE ON FUNCTION public.scenario_rating_stats() TO authenticated;