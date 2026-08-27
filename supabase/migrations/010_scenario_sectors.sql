-- Migración 010: Crear tabla de sectores de escenarios y visor 360°

CREATE TABLE IF NOT EXISTS public.scenario_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,           -- Ej: "Curva Sur", "Cancha", "Preferencia"
  svg_path TEXT NOT NULL,         -- Atributo 'd' del <path> SVG para dibujar la zona interactiva
  foto_360_url TEXT,              -- URL de la imagen equirectangular en Supabase Storage o CDN
  color_hex TEXT DEFAULT '#3b82f6', -- Color para dibujar el sector en el SVG
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scenario_sectors ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Sectores visibles para todos"
  ON public.scenario_sectors FOR SELECT
  USING (true);

CREATE POLICY "Gestión de sectores para admin y gestor"
  ON public.scenario_sectors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('gestor', 'admin')
    )
  );
