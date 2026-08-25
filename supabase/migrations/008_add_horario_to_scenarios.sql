-- T-041: Agregar columna horario a scenarios
-- Campo TEXT simple para horarios tipo "Lun-Dom 08:00-22:00"

ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS horario TEXT;

COMMENT ON COLUMN public.scenarios.horario IS 'Horario de atencion del escenario (ej: Lun-Dom 08:00-22:00)';
