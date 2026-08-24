-- ============================================================
-- T-034 fix: Solo el rol 'admin' puede gestionar imagenes del bucket
-- (antes: gestor y admin)
-- ============================================================

DROP POLICY IF EXISTS "storage_insert_scenario_images" ON storage.objects;

CREATE POLICY "storage_insert_scenario_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scenario-images'
    AND public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "storage_delete_scenario_images" ON storage.objects;

CREATE POLICY "storage_delete_scenario_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scenario-images'
    AND public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "storage_update_scenario_images" ON storage.objects;

CREATE POLICY "storage_update_scenario_images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'scenario-images'
    AND public.get_user_role() = 'admin'
  );
