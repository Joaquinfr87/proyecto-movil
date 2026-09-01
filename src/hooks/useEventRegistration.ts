import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { EventRegistration, EventRegistrationCount } from '../types';

// ─── Funciones de API ────────────────────────────────────────────────────────

async function fetchMyRegistrations(userId: string): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('registered_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as EventRegistration[];
}

async function checkRegistration(
  userId: string,
  eventId: string,
): Promise<EventRegistration | null> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .in('status', ['confirmed', 'waitlist'])
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as EventRegistration | null;
}

async function fetchRegistrationCounts(
  eventIds: string[],
): Promise<Record<string, EventRegistrationCount>> {
  if (eventIds.length === 0) return {};

  const { data, error } = await supabase
    .from('event_registrations')
    .select('event_id, status')
    .in('event_id', eventIds)
    .in('status', ['confirmed', 'waitlist']);

  if (error) {
    throw new Error(error.message);
  }

  const counts: Record<string, EventRegistrationCount> = {};

  for (const eventId of eventIds) {
    counts[eventId] = { event_id: eventId, confirmed_count: 0, waitlist_count: 0 };
  }

  for (const row of data as { event_id: string; status: string }[]) {
    if (!counts[row.event_id]) {
      counts[row.event_id] = { event_id: row.event_id, confirmed_count: 0, waitlist_count: 0 };
    }
    if (row.status === 'confirmed') {
      counts[row.event_id].confirmed_count++;
    } else if (row.status === 'waitlist') {
      counts[row.event_id].waitlist_count++;
    }
  }

  return counts;
}

async function registerForEvent(
  userId: string,
  eventId: string,
): Promise<EventRegistration> {
  // Verificar si ya está inscrito
  const existing = await checkRegistration(userId, eventId);
  if (existing) {
    throw new Error('Ya estás inscrito en este evento');
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      user_id: userId,
      event_id: eventId,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as EventRegistration;
}

async function cancelRegistration(
  userId: string,
  eventId: string,
): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Verifica si el usuario actual está inscrito en un evento específico.
 */
export function useIsRegistered(userId: string | undefined, eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-registration', userId, eventId],
    queryFn: () => checkRegistration(userId!, eventId!),
    enabled: !!userId && !!eventId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Obtiene los conteos de inscripciones para una lista de eventos.
 */
export function useRegistrationCounts(eventIds: string[]) {
  return useQuery({
    queryKey: ['event-registration-counts', eventIds.sort().join(',')],
    queryFn: () => fetchRegistrationCounts(eventIds),
    enabled: eventIds.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Obtiene todas las inscripciones confirmadas del usuario actual.
 */
export function useMyRegistrations(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-event-registrations', userId],
    queryFn: () => fetchMyRegistrations(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Inscribir al usuario en un evento.
 */
export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, eventId }: { userId: string; eventId: string }) =>
      registerForEvent(userId, eventId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-registration', variables.userId, variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ['event-registration-counts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['my-event-registrations', variables.userId],
      });
    },
  });
}

/**
 * Cancelar la inscripción del usuario en un evento.
 */
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, eventId }: { userId: string; eventId: string }) =>
      cancelRegistration(userId, eventId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-registration', variables.userId, variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ['event-registration-counts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['my-event-registrations', variables.userId],
      });
    },
  });
}
