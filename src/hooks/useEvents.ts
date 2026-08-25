import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Event, Scenario } from '../types';

export interface EventWithScenario extends Event {
  scenarios: Scenario;
}

export interface CreateEventData {
  scenario_id: string;
  nombre: string;
  fecha: string;
  hora: string;
  descripcion?: string;
}

// ─── Funciones de API ────────────────────────────────────────────────────────

async function fetchUpcomingEvents(): Promise<EventWithScenario[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      scenarios(*)
    `,
    )
    .gte('fecha', today)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data as EventWithScenario[];
}

async function createEvent(eventData: CreateEventData): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      scenario_id: eventData.scenario_id,
      nombre: eventData.nombre,
      fecha: eventData.fecha,
      hora: eventData.hora || '00:00',
      descripcion: eventData.descripcion || '',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Event;
}

async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['upcoming-events'],
    queryFn: fetchUpcomingEvents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scenario', variables.scenario_id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useDeleteEvent(scenarioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario', scenarioId] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}
