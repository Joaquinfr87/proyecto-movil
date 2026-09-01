/**
 * useBookings.ts
 * Hook de React Query para el módulo de Reservas de Canchas Deportivas.
 * Gestiona: consultar disponibilidad, crear, actualizar y cancelar reservas.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { cacheActiveBookings } from '../services/bookingStorage';
import type { ScenarioBooking, CreateBookingPayload, UpdateBookingPayload } from '../types';

// ── Utilidades ──────────────────────────────────────────────────────────────

/** Genera un código de reserva aleatorio con formato RSV-XXXX */
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RSV-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Calcula la hora de fin sumando 1 hora a la hora de inicio */
export function calcEndTime(startTime: string): string {
  const [h, m] = startTime.split(':').map(Number);
  const end = new Date();
  end.setHours(h + 1, m, 0, 0);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

/** Formatea una hora HH:mm en formato 12h amigable: "6:00 PM" */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Devuelve etiqueta legible de un tipo de actividad */
export function formatActivity(activity: string): string {
  const labels: Record<string, string> = {
    amistoso: '⚽ Amistoso',
    entrenamiento: '🏋️ Entrenamiento',
    torneo: '🏆 Torneo',
    recreativo: '🎯 Recreativo',
  };
  return labels[activity] ?? activity;
}

/** Devuelve color y etiqueta de un estado de reserva */
export function getStatusStyle(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'confirmada':
      return { label: 'Confirmada', color: '#059669', bg: '#D1FAE5' };
    case 'completada':
      return { label: 'Completada', color: '#1D4ED8', bg: '#DBEAFE' };
    case 'cancelada':
      return { label: 'Cancelada', color: '#DC2626', bg: '#FEE2E2' };
    default:
      return { label: status, color: '#64748B', bg: '#F1F5F9' };
  }
}

// ── Consultas ────────────────────────────────────────────────────────────────

/** Consulta las reservas del usuario autenticado con datos del escenario */
async function fetchUserBookings(userId: string): Promise<ScenarioBooking[]> {
  const { data, error } = await supabase
    .from('scenario_bookings' as any)
    .select('*, scenarios(id, nombre, tipo, direccion)')
    .eq('user_id', userId)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown) as ScenarioBooking[];
}

/** Consulta los horarios ocupados en un escenario y fecha específica */
async function fetchOccupiedSlots(
  scenarioId: string,
  date: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('scenario_bookings' as any)
    .select('start_time')
    .eq('scenario_id', scenarioId)
    .eq('booking_date', date)
    .neq('status', 'cancelada');

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as { start_time: string }[]).map(
    (row) => row.start_time.slice(0, 5),
  );
}

// ── Hooks de Consulta ────────────────────────────────────────────────────────

export function useUserBookings(userId: string) {
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: async () => {
      const bookings = await fetchUserBookings(userId);
      // Persistir las reservas confirmadas localmente para modo offline
      const active = bookings.filter((b) => b.status === 'confirmada');
      await cacheActiveBookings(active);
      return bookings;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useOccupiedSlots(scenarioId: string, date: string) {
  return useQuery({
    queryKey: ['bookings', 'slots', scenarioId, date],
    queryFn: () => fetchOccupiedSlots(scenarioId, date),
    enabled: !!scenarioId && !!date,
    staleTime: 1000 * 30, // 30 segundos (alta volatilidad)
  });
}

// ── Mutaciones CRUD ──────────────────────────────────────────────────────────

/** CREATE: Crea una nueva reserva en Supabase */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload & { user_id: string }) => {
      const { user_id, ...rest } = payload;
      const booking_code = generateBookingCode();
      const end_time = rest.end_time || calcEndTime(rest.start_time);

      const { data, error } = await supabase
        .from('scenario_bookings' as any)
        .insert([{ ...rest, user_id, booking_code, end_time, status: 'confirmada' }])
        .select('*, scenarios(id, nombre, tipo, direccion)')
        .single();

      if (error) {
        // Detectar colisión de horario (restricción UNIQUE)
        if (error.code === '23505') {
          throw new Error('Este horario ya fue reservado por otro usuario. Por favor elige otro.');
        }
        throw new Error(error.message);
      }
      return (data as unknown) as ScenarioBooking;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'user', variables.user_id] });
      queryClient.invalidateQueries({
        queryKey: ['bookings', 'slots', variables.scenario_id, variables.booking_date],
      });
    },
  });
}

/** UPDATE: Reprograma fecha/hora o actualiza datos de una reserva */
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateBookingPayload) => {
      const { id, ...updates } = payload;

      // Si se cambia la hora, recalcular end_time automáticamente
      if (updates.start_time && !updates.end_time) {
        updates.end_time = calcEndTime(updates.start_time);
      }

      const { data, error } = await supabase
        .from('scenario_bookings' as any)
        .update(updates)
        .eq('id', id)
        .select('*, scenarios(id, nombre, tipo, direccion)')
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este horario ya está ocupado. Selecciona otro.');
        }
        throw new Error(error.message);
      }
      return (data as unknown) as ScenarioBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/** DELETE/CANCEL: Cancela una reserva cambiando su estado a 'cancelada' */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      cancellation_reason,
    }: {
      id: string;
      cancellation_reason?: string;
    }) => {
      const { error } = await supabase
        .from('scenario_bookings' as any)
        .update({ status: 'cancelada', cancellation_reason: cancellation_reason ?? '' })
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
