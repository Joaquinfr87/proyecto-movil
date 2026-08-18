-- ============================================================
-- Migration: 002_create_scenarios_sports_events_favorites
-- Tablas de escenarios deportivos, deportes, eventos y favoritos
-- ============================================================

-- -----------------------------------------------------------
-- Tabla: scenarios (escenarios deportivos)
-- -----------------------------------------------------------
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  capacidad INTEGER NOT NULL DEFAULT 0,
  direccion TEXT NOT NULL DEFAULT '',
  latitud DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitud DOUBLE PRECISION NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'activo',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer escenarios
CREATE POLICY "scenarios_select_authenticated"
  ON public.scenarios FOR SELECT
  TO authenticated
  USING (true);

-- Gestores y admins pueden crear escenarios
CREATE POLICY "scenarios_insert_gestor_admin"
  ON public.scenarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('gestor', 'admin')
    )
  );

-- Gestores pueden actualizar sus propios escenarios; admins los de todos
CREATE POLICY "scenarios_update_owner_or_admin"
  ON public.scenarios FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Gestores pueden eliminar sus propios escenarios; admins los de todos
CREATE POLICY "scenarios_delete_owner_or_admin"
  ON public.scenarios FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------
-- Tabla: sports (deportes / disciplinas)
-- -----------------------------------------------------------
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer deportes
CREATE POLICY "sports_select_authenticated"
  ON public.sports FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede gestionar deportes
CREATE POLICY "sports_admin_all"
  ON public.sports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------
-- Tabla: scenario_sports (relacion escenario <-> deporte)
-- -----------------------------------------------------------
CREATE TABLE public.scenario_sports (
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  PRIMARY KEY (scenario_id, sport_id)
);

ALTER TABLE public.scenario_sports ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer la relacion
CREATE POLICY "scenario_sports_select_authenticated"
  ON public.scenario_sports FOR SELECT
  TO authenticated
  USING (true);

-- Gestores en sus escenarios y admin pueden gestionar
CREATE POLICY "scenario_sports_gestor_admin"
  ON public.scenario_sports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- -----------------------------------------------------------
-- Tabla: events (eventos en escenarios)
-- -----------------------------------------------------------
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL DEFAULT '00:00',
  descripcion TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer eventos
CREATE POLICY "events_select_authenticated"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

-- Gestores en sus escenarios y admin pueden gestionar eventos
CREATE POLICY "events_gestor_admin"
  ON public.events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- -----------------------------------------------------------
-- Tabla: favorites (escenarios favoritos de usuarios)
-- -----------------------------------------------------------
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, scenario_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve sus propios favoritos
CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin puede ver todos los favoritos
CREATE POLICY "favorites_select_admin"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuarios autenticados pueden agregar favoritos (solo los suyos)
CREATE POLICY "favorites_insert_own"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden eliminar sus propios favoritos; admin puede eliminar cualquiera
CREATE POLICY "favorites_delete_own_or_admin"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------
-- Triggers: updated_at para scenarios y events
-- -----------------------------------------------------------
CREATE TRIGGER scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
