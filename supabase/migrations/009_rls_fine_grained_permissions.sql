-- ============================================================
-- T-046: Permisos finos - DELETE restringido a admin
-- gestor crea/edita escenarios y eventos; solo admin elimina
-- ============================================================

-- ── scenarios: DELETE solo admin ──────────────────────────────
DROP POLICY IF EXISTS "scenarios_delete_owner_or_admin" ON public.scenarios;

CREATE POLICY "scenarios_delete_admin_only"
  ON public.scenarios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── events: separar INSERT/UPDATE (gestor+admin) de DELETE (solo admin) ──
DROP POLICY IF EXISTS "events_gestor_admin" ON public.events;

-- gestor en sus escenarios y admin pueden crear/editar eventos
CREATE POLICY "events_insert_update_gestor_admin"
  ON public.events FOR INSERT
  TO authenticated
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

CREATE POLICY "events_update_gestor_admin"
  ON public.events FOR UPDATE
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

-- solo admin puede eliminar eventos
CREATE POLICY "events_delete_admin_only"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
