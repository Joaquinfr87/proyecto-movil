import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Scenario } from '../types';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ScenarioImage {
  url: string;
  is_primary: boolean;
  storage_path: string;
  display_order: number;
}

export interface ScenarioWithImages extends Scenario {
  scenario_images: ScenarioImage[];
}

export interface UpsertScenarioData {
  id?: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  capacidad: number;
  direccion: string;
  latitud: number;
  longitud: number;
  estado?: string;
  created_by?: string | null;
}

// ─── Funciones de acceso a datos ─────────────────────────────────────────────

async function fetchAllScenarios(): Promise<ScenarioWithImages[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(
      `
      *,
      scenario_images(url, is_primary, storage_path, display_order)
    `,
    )
    .order('nombre');

  if (error) {
    throw new Error(error.message);
  }

  return data as ScenarioWithImages[];
}

async function upsertScenario(scenario: UpsertScenarioData): Promise<Scenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .upsert({
      ...scenario,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Scenario;
}

async function softDeleteScenario(id: string): Promise<void> {
  const { error } = await supabase
    .from('scenarios')
    .update({ estado: 'inactivo', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAllScenarios() {
  return useQuery({
    queryKey: ['all-scenarios'],
    queryFn: fetchAllScenarios,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: softDeleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}
