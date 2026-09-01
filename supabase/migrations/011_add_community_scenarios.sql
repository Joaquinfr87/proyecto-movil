-- ============================================================
-- Migration: 011_add_community_scenarios
-- Agrega soporte para escenarios comunitarios creados por usuarios
-- ============================================================

-- Columna para diferenciar escenarios oficiales de comunitarios (POV)
ALTER TABLE public.scenarios
  ADD COLUMN is_community BOOLEAN NOT NULL DEFAULT false;

-- Índice parcial para filtrado eficiente de escenarios comunitarios
CREATE INDEX idx_scenarios_is_community
  ON public.scenarios(is_community)
  WHERE is_community = true;

-- ── Políticas RLS para escenarios comunitarios ──────────────

-- Cualquier usuario autenticado puede crear escenarios comunitarios
CREATE POLICY "scenarios_insert_community"
  ON public.scenarios FOR INSERT
  TO authenticated
  WITH CHECK (is_community = true);

-- Usuarios pueden editar sus propios escenarios comunitarios
CREATE POLICY "scenarios_update_community_own"
  ON public.scenarios FOR UPDATE
  TO authenticated
  USING (is_community = true AND created_by = auth.uid())
  WITH CHECK (is_community = true AND created_by = auth.uid());
