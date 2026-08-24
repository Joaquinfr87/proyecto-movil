import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Scenario, Event } from '../types';

export interface ScenarioImage {
  url: string;
  is_primary: boolean;
  storage_path: string;
  display_order: number;
}

export interface ScenarioSport {
  sports: { nombre: string };
}

export interface ScenarioWithDetails extends Scenario {
  scenario_images: ScenarioImage[];
  scenario_sports: ScenarioSport[];
  events: Event[];
}

// El seed guarda rutas relativas en la columna url (ej: 'scenario-images/{id}/image-1.jpg').
// Esta funcion las convierte a URL publicas del bucket usando storage_path.
export function resolveScenarioImages<T extends { scenario_images?: ScenarioImage[] }>(
  row: T,
): T {
  return {
    ...row,
    scenario_images:
      row.scenario_images?.map((img) => {
        const url = /^https?:\/\//.test(img.url)
          ? img.url
          : supabase.storage.from('scenario-images').getPublicUrl(img.storage_path).data.publicUrl;
        return { ...img, url };
      }) ?? [],
  };
}

async function fetchScenarios(): Promise<ScenarioWithDetails[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(
      `
      *,
      scenario_images(url, is_primary, storage_path, display_order),
      scenario_sports(sports(nombre))
    `,
    )
    .eq('estado', 'activo')
    .order('nombre');

  if (error) {
    throw new Error(error.message);
  }

  return data.map(resolveScenarioImages);
}

async function fetchScenarioById(id: string): Promise<ScenarioWithDetails | null> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(
      `
      *,
      scenario_images(url, is_primary, storage_path, display_order),
      scenario_sports(sports(nombre)),
      events(*)
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return resolveScenarioImages(data);
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
