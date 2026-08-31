import { Image } from 'react-native';
import { supabase } from '../services/supabase';
import type { ScenarioSector } from '../types';

export interface SectorTemplate {
  nombre: string;
  svg_path: string;
  foto_360_url: string;
  color_hex: string;
  display_order: number;
}

export function resolveImageUri(source: any): string {
  if (typeof source === 'string') return source;
  if (!source) return '';
  const resolved = Image.resolveAssetSource(source);
  if (resolved && resolved.uri) {
    return resolved.uri;
  }
  if (typeof source === 'object' && source.default) {
    return source.default;
  }
  return String(source);
}

export function getSupabase360Url(filename: string): string {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return `https://pannellum.org/images/alma.jpg`;
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/scenario-images/fotos360/${filename}`;
}

export const FOTOS_360_URLS = {
  cancha: getSupabase360Url('fotocanchaestadio.jpg'),
  curvaNorte: getSupabase360Url('Curvanorte.jpg'),
  general: getSupabase360Url('generalSiles.jpg'),
  curvaSur: getSupabase360Url('curva-sur.jpg'),
  preferencia: getSupabase360Url('preferencia.jpg'),
};

export function getSector360Url(sector: { nombre?: string; foto_360_url?: string | null }): string {
  const name = (sector.nombre || '').toLowerCase();
  const url = sector.foto_360_url || '';

  // Si incluye las referencias a los archivos locales en fotos360 o coincide por nombre
  if (url.includes('fotocanchaestadio') || name.includes('cancha')) {
    return FOTOS_360_URLS.cancha;
  }
  if (
    url.includes('Curvanorte') ||
    url.includes('curva-norte') ||
    name.includes('curva norte') ||
    name.includes('gradería norte') ||
    name.includes('graderia norte')
  ) {
    return FOTOS_360_URLS.curvaNorte;
  }
  if (
    url.includes('generalSiles') ||
    url.includes('general.jpg') ||
    name.includes('general') ||
    name.includes('gradería general') ||
    name.includes('graderia general')
  ) {
    return FOTOS_360_URLS.general;
  }
  if (url.includes('curva-sur') || name.includes('curva sur') || name.includes('gradería sur') || name.includes('graderia sur')) {
    return FOTOS_360_URLS.curvaSur;
  }
  if (url.includes('preferencia') || name.includes('preferencia')) {
    return FOTOS_360_URLS.preferencia;
  }

  // Si tiene una URL remota personalizada que no sea el placeholder antiguo
  if (
    url &&
    !url.includes('alma.jpg') &&
    !url.includes('cerro-toco') &&
    !url.includes('milan.jpg')
  ) {
    return url;
  }

  return url || FOTOS_360_URLS.cancha;
}

export const STADIUM_SECTOR_TEMPLATE: SectorTemplate[] = [
  {
    nombre: 'Cancha Central',
    svg_path: 'M 300 200 L 500 200 L 500 400 L 300 400 Z',
    foto_360_url: FOTOS_360_URLS.cancha,
    color_hex: '#22c55e',
    display_order: 1,
  },
  {
    nombre: 'Curva Norte',
    svg_path: 'M 260 80 Q 400 30 540 80 L 510 180 Q 400 140 290 180 Z',
    foto_360_url: FOTOS_360_URLS.curvaNorte,
    color_hex: '#3b82f6',
    display_order: 2,
  },
  {
    nombre: 'Curva Sur',
    svg_path: 'M 290 420 Q 400 460 510 420 L 540 520 Q 400 570 260 520 Z',
    foto_360_url: FOTOS_360_URLS.curvaSur,
    color_hex: '#ef4444',
    display_order: 3,
  },
  {
    nombre: 'Tribuna Preferencia',
    svg_path: 'M 120 120 L 260 190 L 260 410 L 120 480 Z',
    foto_360_url: FOTOS_360_URLS.preferencia,
    color_hex: '#f59e0b',
    display_order: 4,
  },
  {
    nombre: 'Tribuna General',
    svg_path: 'M 540 190 L 680 120 L 680 480 L 540 410 Z',
    foto_360_url: FOTOS_360_URLS.general,
    color_hex: '#8b5cf6',
    display_order: 5,
  },
];

export const COLISEUM_SECTOR_TEMPLATE: SectorTemplate[] = [
  {
    nombre: 'Cancha Principal',
    svg_path: 'M 250 180 L 550 180 L 550 420 L 250 420 Z',
    foto_360_url: FOTOS_360_URLS.cancha,
    color_hex: '#10b981',
    display_order: 1,
  },
  {
    nombre: 'Gradería Norte',
    svg_path: 'M 160 70 L 640 70 L 570 160 L 230 160 Z',
    foto_360_url: FOTOS_360_URLS.curvaNorte,
    color_hex: '#3b82f6',
    display_order: 2,
  },
  {
    nombre: 'Gradería Sur',
    svg_path: 'M 230 440 L 570 440 L 640 530 L 160 530 Z',
    foto_360_url: FOTOS_360_URLS.curvaSur,
    color_hex: '#ef4444',
    display_order: 3,
  },
];

export async function saveScenarioSectors(
  scenarioId: string,
  modelType: 'estadio' | 'coliseo' | 'ninguno',
): Promise<void> {
  if (modelType === 'ninguno') return;

  try {
    const template = modelType === 'coliseo' ? COLISEUM_SECTOR_TEMPLATE : STADIUM_SECTOR_TEMPLATE;

    // Verificar si ya tiene sectores
    const { data: existing } = await supabase
      .from('scenario_sectors')
      .select('id')
      .eq('scenario_id', scenarioId);

    if (existing && existing.length > 0) {
      // Ya tiene sectores configurados, no sobreescribir automáticamente
      return;
    }

    const rows = template.map((sec) => ({
      scenario_id: scenarioId,
      nombre: sec.nombre,
      svg_path: sec.svg_path,
      foto_360_url: sec.foto_360_url,
      color_hex: sec.color_hex,
      display_order: sec.display_order,
    }));

    await supabase.from('scenario_sectors').insert(rows);
  } catch (err) {
    console.warn('Error configurando sectores 360:', err);
  }
}

