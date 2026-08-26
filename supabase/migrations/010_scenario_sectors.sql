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

-- Datos iniciales (PoC) para el Estadio Félix Capriles (UUID: e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01)
-- Dimensiones del ViewBox SVG: 800 x 600
INSERT INTO public.scenario_sectors (scenario_id, nombre, svg_path, foto_360_url, color_hex, display_order)
VALUES
  -- 1. Cancha Central
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'Cancha Central',
    'M 300 200 L 500 200 L 500 400 L 300 400 Z',
    'https://pannellum.org/images/alma.jpg',
    '#22c55e',
    1
  ),
  -- 2. Curva Norte
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'Curva Norte',
    'M 260 80 Q 400 30 540 80 L 510 180 Q 400 140 290 180 Z',
    'https://pannellum.org/images/cerro-toco-0.jpg',
    '#3b82f6',
    2
  ),
  -- 3. Curva Sur
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'Curva Sur',
    'M 290 420 Q 400 460 510 420 L 540 520 Q 400 570 260 520 Z',
    'https://pannellum.org/images/bma-0.jpg',
    '#ef4444',
    3
  ),
  -- 4. Preferencia (Oeste)
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'Tribuna Preferencia',
    'M 120 120 L 260 190 L 260 410 L 120 480 Z',
    'https://pannellum.org/images/jfk.jpg',
    '#f59e0b',
    4
  ),
  -- 5. General (Este)
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'Tribuna General',
    'M 540 190 L 680 120 L 680 480 L 540 410 Z',
    'https://pannellum.org/images/milan.jpg',
    '#8b5cf6',
    5
  )
ON CONFLICT DO NOTHING;
