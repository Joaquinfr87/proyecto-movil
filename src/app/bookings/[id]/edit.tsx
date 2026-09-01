/**
 * src/app/bookings/[id]/edit.tsx
 * Pantalla de Reprogramación de Turno
 * Permite cambiar fecha y/o horario de una reserva confirmada.
 */
import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import { useOccupiedSlots, useUpdateBooking } from '../../../hooks/useBookings';
import { TimeSlotGrid } from '../../../components/bookings/TimeSlotGrid';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../../theme';
import type { ScenarioBooking } from '../../../types';

function buildDateOptions(): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return options;
}

async function fetchBooking(id: string): Promise<ScenarioBooking | null> {
  const { data, error } = await supabase
    .from('scenario_bookings' as any)
    .select('*, scenarios(id, nombre, tipo, direccion)')
    .eq('id', id)
    .single();
  if (error) return null;
  return (data as unknown) as ScenarioBooking;
}

export default function EditBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Array.isArray(id) ? id[0] : id ?? '';

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    enabled: !!bookingId,
  });

  const dateOptions = buildDateOptions();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Inicializar con los valores actuales de la reserva
  if (booking && !initialized) {
    const currentDate = booking.booking_date;
    const currentSlot = booking.start_time.slice(0, 5);
    setSelectedDate(currentDate >= dateOptions[0].value ? currentDate : dateOptions[0].value);
    setSelectedSlot(currentSlot);
    setInitialized(true);
  }

  const { data: occupied = [], isLoading: slotsLoading } = useOccupiedSlots(
    booking?.scenario_id ?? '',
    selectedDate,
  );

  // Excluir el slot actual de la reserva para no bloquearlo como ocupado al editar
  const occupiedExcludingCurrent = occupied.filter(
    (s) => !(s === booking?.start_time.slice(0, 5) && selectedDate === booking?.booking_date),
  );

  const { mutateAsync: updateBooking, isPending } = useUpdateBooking();

  const handleSave = async () => {
    if (!booking) return;
    if (!selectedSlot) {
      Alert.alert('Horario requerido', 'Selecciona un bloque horario disponible.');
      return;
    }
    if (selectedDate === booking.booking_date && selectedSlot === booking.start_time.slice(0, 5)) {
      Alert.alert('Sin cambios', 'La fecha y hora son iguales a la reserva actual.');
      return;
    }

    try {
      const [h, m] = selectedSlot.split(':').map(Number);
      const endH = h + 1;
      const end_time = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      await updateBooking({
        id: booking.id,
        booking_date: selectedDate,
        start_time: selectedSlot,
        end_time,
      });

      if (Platform.OS !== 'web') {
        Alert.alert('✅ Reserva Reprogramada', `Tu turno fue actualizado al ${selectedDate} a las ${selectedSlot}.`);
      }
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al reprogramar';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  if (isLoading) return <LoadingSpinner message="Cargando reserva..." />;
  if (!booking) {
    return (
      <EmptyState
        icon="ticket-outline"
        title="Reserva no encontrada"
        subtitle="No se pudo cargar la información de esta reserva."
        actionButton={{ label: 'Volver', onPress: () => router.back() }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Escenario */}
      <View style={styles.infoCard}>
        <Ionicons name="business-outline" size={18} color={colors.primary} />
        <Text style={styles.infoText}>{booking.scenarios?.nombre ?? 'Escenario'}</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{booking.booking_code}</Text>
        </View>
      </View>

      {/* Turno actual */}
      <View style={styles.currentCard}>
        <Text style={styles.currentLabel}>Turno actual</Text>
        <Text style={styles.currentValue}>
          {booking.booking_date} · {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
        </Text>
      </View>

      {/* Selector de Fecha */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Nueva Fecha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dateOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dateChip, selectedDate === opt.value && styles.dateChipActive]}
              onPress={() => {
                setSelectedDate(opt.value);
                setSelectedSlot(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateChipText, selectedDate === opt.value && styles.dateChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selector de Horario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Nuevo Horario</Text>
        {slotsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <TimeSlotGrid
            occupiedSlots={occupiedExcludingCurrent}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        )}
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity
        style={[styles.saveBtn, (!selectedSlot || isPending) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!selectedSlot || isPending}
        activeOpacity={0.85}
      >
        {isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color={colors.white} />
            <Text style={styles.saveBtnText}>Guardar Nueva Fecha</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight + '22',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  codeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  codeText: { fontSize: fontSize.xs, color: colors.white, fontWeight: fontWeight.bold, letterSpacing: 1 },
  currentCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  currentLabel: { fontSize: fontSize.xs, color: '#92400E', fontWeight: fontWeight.medium, textTransform: 'uppercase' },
  currentValue: { fontSize: fontSize.md, color: '#78350F', fontWeight: fontWeight.semibold, marginTop: 2 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  dateRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dateChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  dateChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  dateChipTextActive: { color: colors.primary, fontWeight: fontWeight.semibold },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  saveBtnDisabled: { backgroundColor: colors.textSecondary },
  saveBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
