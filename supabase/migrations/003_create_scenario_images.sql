-- ============================================================
-- Migration: 003_create_scenario_images
-- Tabla de imagenes por escenario + bucket de storage
-- ============================================================

-- -----------------------------------------------------------
-- Tabla: scenario_images (imagenes de escenarios)
-- -----------------------------------------------------------
CREATE TABLE public.scenario_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scenario_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_scenario_images_scenario_id ON public.scenario_images (scenario_id);

-- Todos los autenticados pueden ver imagenes de escenarios
CREATE POLICY "scenario_images_select_authenticated"
  ON public.scenario_images FOR SELECT
  TO authenticated
  USING (true);

-- Gestores en sus escenarios y admin pueden agregar imagenes
CREATE POLICY "scenario_images_insert_gestor_admin"
  ON public.scenario_images FOR INSERT
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

-- Gestores en sus escenarios y admin pueden actualizar imagenes
CREATE POLICY "scenario_images_update_gestor_admin"
  ON public.scenario_images FOR UPDATE
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

-- Gestores en sus escenarios y admin pueden eliminar imagenes
CREATE POLICY "scenario_images_delete_gestor_admin"
  ON public.scenario_images FOR DELETE
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
  );

-- -----------------------------------------------------------
-- Storage bucket: scenario-images
-- -----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scenario-images',
  'scenario-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------------
-- Storage policies
-- -----------------------------------------------------------

-- Cualquier usuario autenticado puede ver imagenes del bucket
CREATE POLICY "storage_select_scenario_images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'scenario-images');

-- El public bucket permite lectura sin auth (para preview)
CREATE POLICY "storage_select_scenario_images_anon"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'scenario-images');

-- Gestores y admin pueden subir imagenes
CREATE POLICY "storage_insert_scenario_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scenario-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('gestor', 'admin')
      )
    )
  );

-- Gestores y admin pueden eliminar imagenes
CREATE POLICY "storage_delete_scenario_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scenario-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('gestor', 'admin')
      )
    )
  );

-- Gestores y admin pueden actualizar metadatos de imagenes
CREATE POLICY "storage_update_scenario_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'scenario-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('gestor', 'admin')
      )
    )
  );
