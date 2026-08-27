import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Scenario, Event, ScenarioSector } from '../types';

export interface ScenarioImage {
  id?: string;
  url: string;
  is_primary: boolean;
  storage_path: string;
  display_order: number;
}

export interface ScenarioSport {
  sports: { id?: string; nombre: string };
}

export interface ScenarioWithDetails extends Scenario {
  scenario_images: ScenarioImage[];
  scenario_sports: ScenarioSport[];
  events: Event[];
  scenario_sectors?: ScenarioSector[];
}

// El seed guarda rutas relativas en la columna url (ej: 'scenario-images/{id}/image-1.jpg').
// Esta funcion las convierte a URL publicas del bucket usando storage_path.
export function resolveScenarioImages<T extends { scenario_images?: ScenarioImage[] }>(
  row: T,
): T {
  return {
    ...row,
    scenario_images:
      (row.scenario_images ?? [])
        .filter((img) => img.url || img.storage_path)
        .map((img) => {
          const url = /^https?:\/\//.test(img.url)
            ? img.url
            : supabase.storage
                .from('scenario-images')
                .getPublicUrl(img.storage_path).data.publicUrl;
          return { ...img, url };
        }),
  };
}

async function fetchScenarios(): Promise<ScenarioWithDetails[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(
      `
      *,
      scenario_images(id, url, is_primary, storage_path, display_order),
      scenario_sports(sports(id, nombre))
    `,
    )
    .eq('estado', 'activo')
    .order('nombre');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(resolveScenarioImages);
}

async function fetchScenarioById(id: string): Promise<ScenarioWithDetails | null> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(
      `
      *,
      scenario_images(id, url, is_primary, storage_path, display_order),
      scenario_sports(sports(id, nombre)),
      events(*)
    `,
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return null;
  }

  // Intentar cargar sectores si la tabla existe en Supabase
  let scenario_sectors: ScenarioSector[] = [];
  try {
    const { data: sectorsData, error: sectorsError } = await supabase
      .from('scenario_sectors')
      .select('*')
      .eq('scenario_id', id)
      .order('display_order');
    if (!sectorsError && sectorsData) {
      scenario_sectors = sectorsData;
    }
  } catch {
    // Silenciar si la tabla aún no existe en Supabase Cloud
  }

  const resolved = resolveScenarioImages(data as ScenarioWithDetails);
  return {
    ...resolved,
    scenario_sectors,
  };
}

export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
    staleTime: 1000 * 60 * 5,
  });
}

export function useScenario(id: string) {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: () => fetchScenarioById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
