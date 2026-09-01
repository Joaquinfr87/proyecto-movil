/**
 * src/app/bookings/[id]/index.tsx
 * Pantalla de Detalle / Comprobante de Reserva (Ticket Digital)
 */
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import { useCancelBooking } from '../../../hooks/useBookings';
import { BookingTicket } from '../../../components/bookings/BookingTicket';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../../theme';
import type { ScenarioBooking } from '../../../types';

async function fetchBookingById(id: string): Promise<ScenarioBooking | null> {
  const { data, error } = await supabase
    .from('scenario_bookings' as any)
    .select('*, scenarios(id, nombre, tipo, direccion)')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return (data as unknown) as ScenarioBooking;
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Array.isArray(id) ? id[0] : id ?? '';

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBookingById(bookingId),
    enabled: !!bookingId,
  });

  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const handleCancel = () => {
    if (!booking) return;
    if (Platform.OS === 'web') {
      const reason = prompt('¿Motivo de cancelación?') ?? 'Cancelada por el usuario';
      cancelBooking({ id: booking.id, cancellation_reason: reason })
        .then(() => router.back())
        .catch((e) => alert(e.message));
    } else {
      Alert.alert(
        'Cancelar Reserva',
        `¿Estás seguro de cancelar la reserva ${booking.booking_code}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: () =>
              cancelBooking({ id: booking.id, cancellation_reason: 'Cancelada por el usuario' })
                .then(() => router.back())
                .catch((e) => Alert.alert('Error', e.message)),
          },
        ],
      );
    }
  };

  if (isLoading) return <LoadingSpinner message="Cargando comprobante..." />;
  if (error || !booking) {
    return (
      <EmptyState
        icon="ticket-outline"
        title="Reserva no encontrada"
        subtitle="Este comprobante no está disponible."
        actionButton={{ label: 'Volver', onPress: () => router.back() }}
      />
    );
  }

  const isActive = booking.status === 'confirmada';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Ticket / Comprobante */}
      <BookingTicket booking={booking} />

      {/* Acciones */}
      {isActive && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/bookings/${booking.id}/edit`)}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.editBtnText}>Reprogramar Turno</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={isCancelling}
            activeOpacity={0.85}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                <Text style={styles.cancelBtnText}>Cancelar Reserva</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Nota de Cancelación */}
      {booking.status === 'cancelada' && booking.cancellation_reason && (
        <View style={styles.cancelNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.error} />
          <Text style={styles.cancelNoteText}>
            Motivo: {booking.cancellation_reason}
          </Text>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editBtnText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelBtnText: {
    fontSize: fontSize.md,
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
  cancelNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelNoteText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
  },
});
