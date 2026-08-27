import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Sport } from '../types';

export const DEFAULT_SPORTS: Array<Omit<Sport, 'id'> & { id?: string }> = [
  { nombre: 'Futbol', descripcion: 'Fútbol en campo reglamentario' },
  { nombre: 'Basquetbol', descripcion: 'Baloncesto en cancha techada o al aire libre' },
  { nombre: 'Voleibol', descripcion: 'Voleibol de sala o arena' },
  { nombre: 'Futsal', descripcion: 'Fútbol de salón' },
  { nombre: 'Tenis', descripcion: 'Tenis en superficie dura o arcilla' },
  { nombre: 'Natacion', descripcion: 'Natación en piscina olímpica o semiolímpica' },
  { nombre: 'Atletismo', descripcion: 'Pista de carreras y pruebas de campo' },
  { nombre: 'Artes Marciales', descripcion: 'Karate, taekwondo, judo, boxeo' },
  { nombre: 'Ciclismo', descripcion: 'Velódromo o circuito de ciclismo' },
  { nombre: 'Raquetbol', descripcion: 'Raquetbol en cancha cerrada' },
  { nombre: 'Padel', descripcion: 'Pádel en cancha de cristal' },
  { nombre: 'Gimnasia', descripcion: 'Gimnasia artística o rítmica' },
  { nombre: 'Handball', descripcion: 'Balonmano' },
];

async function fetchSports(): Promise<Sport[]> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .order('nombre');

    if (error) {
      console.warn('Error fetching sports from DB, using defaults:', error.message);
      return DEFAULT_SPORTS.map((s, idx) => ({
        id: s.id || `default-sport-${idx}`,
        nombre: s.nombre,
        descripcion: s.descripcion,
      }));
    }

    if (!data || data.length === 0) {
      return DEFAULT_SPORTS.map((s, idx) => ({
        id: s.id || `default-sport-${idx}`,
        nombre: s.nombre,
        descripcion: s.descripcion,
      }));
    }

    return data as Sport[];
  } catch (err) {
    console.warn('Network error fetching sports:', err);
    return DEFAULT_SPORTS.map((s, idx) => ({
      id: s.id || `default-sport-${idx}`,
      nombre: s.nombre,
      descripcion: s.descripcion,
    }));
  }
}

async function createSport(sport: { nombre: string; descripcion?: string }): Promise<Sport> {
  const { data, error } = await supabase
    .from('sports')
    .insert({
      nombre: sport.nombre.trim(),
      descripcion: sport.descripcion?.trim() ?? '',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Sport;
}

export async function syncScenarioSports(scenarioId: string, sportIds: string[]): Promise<void> {
  try {
    // 1. Eliminar asociaciones existentes
    const { error: delError } = await supabase
      .from('scenario_sports')
      .delete()
      .eq('scenario_id', scenarioId);

    if (delError) {
      console.warn('Error deleting old scenario_sports:', delError.message);
    }

    // 2. Insertar nuevas asociaciones si hay seleccionadas
    if (sportIds.length > 0) {
      const recordsToInsert = sportIds
        .filter((id) => !id.startsWith('default-sport-')) // Solo IDs válidos de base de datos
        .map((sport_id) => ({
          scenario_id: scenarioId,
          sport_id,
        }));

      if (recordsToInsert.length > 0) {
        const { error: insError } = await supabase
          .from('scenario_sports')
          .insert(recordsToInsert);

        if (insError) {
          console.warn('Error inserting scenario_sports:', insError.message);
        }
      }
    }
  } catch (err) {
    console.warn('Exception during syncScenarioSports:', err);
  }
}

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: fetchSports,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateSport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
}
