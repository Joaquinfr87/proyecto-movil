-- ============================================================
-- T-038: Indices para optimizar las queries de la app
-- Los PK existentes ya cubren: scenario_images? NO (ver 003), favorites(user_id),
-- scenario_sports(scenario_id). Aqui se cubren los accesos restantes.
-- ============================================================

-- Catalogo: WHERE estado = 'activo' ORDER BY nombre
CREATE INDEX IF NOT EXISTS idx_scenarios_estado_nombre
  ON public.scenarios (estado, nombre);

-- Join inverso deportes -> escenarios
CREATE INDEX IF NOT EXISTS idx_scenario_sports_sport_id
  ON public.scenario_sports (sport_id);

-- Eventos por escenario, ordenados por fecha (eventos proximos)
CREATE INDEX IF NOT EXISTS idx_events_scenario_fecha
  ON public.events (scenario_id, fecha);

-- Eliminacion en cascada y checks RLS sobre favorites.scenario_id
CREATE INDEX IF NOT EXISTS idx_favorites_scenario_id
  ON public.favorites (scenario_id);

-- Busqueda de eventos proximos globales (fecha >= hoy)
CREATE INDEX IF NOT EXISTS idx_events_fecha
  ON public.events (fecha);
