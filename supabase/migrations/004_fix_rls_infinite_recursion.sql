-- T-015: Fix RLS infinite recursion + SECURITY DEFINER role check
-- Reemplaza subqueries a public.profiles por funcion get_user_role()
-- Esto evita el error 42P17: infinite recursion detected in policy

-- ============================================================
-- FUNCION: get_user_role() - SECURITY DEFINER
-- Consulta el rol del usuario desde profiles sin pasar por RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- TRIGGER: Prevenir auto-cambio de rol (BUG-02)
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user != 'postgres'
     AND public.get_user_role() != 'admin'
     AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'No puedes cambiar tu propio rol';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;

CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- ============================================================
-- PROFILES (2 policies a corregir, 1 sin cambio)
-- ============================================================

DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;

CREATE POLICY "profiles_select_auth"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
  )
  WITH CHECK (
    public.get_user_role() = 'admin'
  );

-- ============================================================
-- SCENARIOS (3 policies)
-- ============================================================

DROP POLICY IF EXISTS "scenarios_insert_gestor_admin" ON public.scenarios;

CREATE POLICY "scenarios_insert_gestor_admin"
  ON public.scenarios FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() IN ('gestor', 'admin')
  );

DROP POLICY IF EXISTS "scenarios_update_owner_or_admin" ON public.scenarios;

CREATE POLICY "scenarios_update_owner_or_admin"
  ON public.scenarios FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_user_role() = 'admin'
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "scenarios_delete_owner_or_admin" ON public.scenarios;

CREATE POLICY "scenarios_delete_owner_or_admin"
  ON public.scenarios FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ============================================================
-- SPORTS (1 policy)
-- ============================================================

DROP POLICY IF EXISTS "sports_admin_all" ON public.sports;

CREATE POLICY "sports_admin_all"
  ON public.sports FOR ALL
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
  );

-- ============================================================
-- SCENARIO_SPORTS (1 policy)
-- ============================================================

DROP POLICY IF EXISTS "scenario_sports_gestor_admin" ON public.scenario_sports;

CREATE POLICY "scenario_sports_gestor_admin"
  ON public.scenario_sports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

-- ============================================================
-- EVENTS (1 policy)
-- ============================================================

DROP POLICY IF EXISTS "events_gestor_admin" ON public.events;

CREATE POLICY "events_gestor_admin"
  ON public.events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

-- ============================================================
-- FAVORITES (2 policies)
-- ============================================================

DROP POLICY IF EXISTS "favorites_select_admin" ON public.favorites;

CREATE POLICY "favorites_select_admin"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "favorites_delete_own_or_admin" ON public.favorites;

CREATE POLICY "favorites_delete_own_or_admin"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ============================================================
-- SCENARIO_IMAGES (3 policies)
-- ============================================================

DROP POLICY IF EXISTS "scenario_images_insert_gestor_admin" ON public.scenario_images;

CREATE POLICY "scenario_images_insert_gestor_admin"
  ON public.scenario_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

DROP POLICY IF EXISTS "scenario_images_update_gestor_admin" ON public.scenario_images;

CREATE POLICY "scenario_images_update_gestor_admin"
  ON public.scenario_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

DROP POLICY IF EXISTS "scenario_images_delete_gestor_admin" ON public.scenario_images;

CREATE POLICY "scenario_images_delete_gestor_admin"
  ON public.scenario_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios s
      WHERE s.id = scenario_id
        AND (
          s.created_by = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

-- ============================================================
-- STORAGE (3 policies)
-- ============================================================

DROP POLICY IF EXISTS "storage_insert_scenario_images" ON storage.objects;

CREATE POLICY "storage_insert_scenario_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scenario-images'
    AND public.get_user_role() IN ('gestor', 'admin')
  );

DROP POLICY IF EXISTS "storage_delete_scenario_images" ON storage.objects;

CREATE POLICY "storage_delete_scenario_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scenario-images'
    AND public.get_user_role() IN ('gestor', 'admin')
  );

DROP POLICY IF EXISTS "storage_update_scenario_images" ON storage.objects;

CREATE POLICY "storage_update_scenario_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'scenario-images'
    AND public.get_user_role() IN ('gestor', 'admin')
  );

-- ============================================================
-- GRANTS: Permisos base para authenticated en todas las tablas
-- Sin estos GRANTs, RLS no importa porque PostgreSQL bloquea el acceso a la tabla
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenario_sports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenario_images TO authenticated;
