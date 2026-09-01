-- ============================================================
-- Migración 011: Sistema de Reservas de Turnos (examen-angel)
-- ============================================================

-- 1. Crear Tipos ENUM
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmada', 'completada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_activity AS ENUM ('amistoso', 'entrenamiento', 'torneo', 'recreativo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Crear Tabla de Reservas
CREATE TABLE IF NOT EXISTS public.scenario_bookings (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code        VARCHAR(12) NOT NULL UNIQUE,
  scenario_id         UUID        NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  sector_id           UUID        REFERENCES public.scenario_sectors(id) ON DELETE SET NULL,
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date        DATE        NOT NULL,
  start_time          TIME        NOT NULL,
  end_time            TIME        NOT NULL,
  activity_type       booking_activity NOT NULL DEFAULT 'amistoso',
  participants_count  INTEGER     NOT NULL DEFAULT 10 CHECK (participants_count >= 1 AND participants_count <= 50),
  contact_phone       VARCHAR(20) NOT NULL,
  notes               TEXT,
  status              booking_status NOT NULL DEFAULT 'confirmada',
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Restricción de no solapamiento de turnos activos en mismo escenario/fecha/hora
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking
  ON public.scenario_bookings (scenario_id, booking_date, start_time)
  WHERE status != 'cancelada';

-- 4. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_bookings_user_id       ON public.scenario_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scenario_date ON public.scenario_bookings(scenario_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status        ON public.scenario_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at    ON public.scenario_bookings(created_at DESC);

-- 5. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_booking_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.scenario_bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.scenario_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();

-- 6. Habilitar Row Level Security
ALTER TABLE public.scenario_bookings ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS
-- SELECT: El dueño ve todas sus reservas; cualquier autenticado puede ver confirmadas (para saber disponibilidad)
CREATE POLICY "bookings_select" ON public.scenario_bookings
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id
    OR status = 'confirmada'
    OR public.get_user_role(auth.uid()) IN ('admin', 'gestor')
  );

-- INSERT: Cualquier usuario autenticado puede crear reserva con su propio user_id
CREATE POLICY "bookings_insert" ON public.scenario_bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- UPDATE: El dueño puede modificar si está confirmada; admins/gestores pueden cambiar estado
CREATE POLICY "bookings_update" ON public.scenario_bookings
  FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
    OR public.get_user_role(auth.uid()) IN ('admin', 'gestor')
  );

-- DELETE: Solo el dueño de una reserva confirmada, o admin
CREATE POLICY "bookings_delete" ON public.scenario_bookings
  FOR DELETE TO authenticated USING (
    (auth.uid() = user_id AND status = 'confirmada')
    OR public.get_user_role(auth.uid()) = 'admin'
  );
