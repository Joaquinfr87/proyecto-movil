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

  return data as ScenarioWithDetails[];
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

  return data as ScenarioWithDetails;
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
