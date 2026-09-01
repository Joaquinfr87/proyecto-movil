import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Scenario } from '../types';
import { resolveScenarioImages, type ScenarioImage } from './useScenarios';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface CommunityScenarioWithImages extends Scenario {
  scenario_images: ScenarioImage[];
}

export interface CreateCommunityScenarioData {
  nombre: string;
  tipo: string;
  descripcion: string;
  capacidad: number;
  direccion: string;
  latitud: number;
  longitud: number;
  created_by: string;
}

// ─── Funciones de acceso a datos ─────────────────────────────────────────────

async function fetchCommunityScenarios(): Promise<CommunityScenarioWithImages[]> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(
      `
      *,
      scenario_images(id, url, is_primary, storage_path, display_order)
    `,
    )
    .eq('is_community', true)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    resolveScenarioImages(row as CommunityScenarioWithImages),
  );
}

async function createCommunityScenario(
  scenario: CreateCommunityScenarioData,
): Promise<Scenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .insert({
      ...scenario,
      estado: 'activo',
      is_community: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Scenario;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useCommunityScenarios() {
  return useQuery({
    queryKey: ['scenarios-community'],
    queryFn: fetchCommunityScenarios,
    staleTime: 1000 * 60 * 2, // 2 minutos (más fresco que los oficiales)
  });
}

export function useCreateCommunityScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityScenario,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios-community'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios-map'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['scenario', data.id] });
      }
    },
  });
}
