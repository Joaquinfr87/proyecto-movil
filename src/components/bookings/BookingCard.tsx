/**
 * BookingCard.tsx
 * Tarjeta de resumen de una reserva para la lista "Mis Reservas".
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { getStatusStyle, formatTime12h, formatActivity } from '../../hooks/useBookings';
import type { ScenarioBooking } from '../../types';

interface BookingCardProps {
  booking: ScenarioBooking;
  onPress: () => void;
  onCancel?: () => void;
}

export function BookingCard({ booking, onPress, onCancel }: BookingCardProps) {
  const status = getStatusStyle(booking.status);
  const isActive = booking.status === 'confirmada';

  // Formatear la fecha: "2026-09-15" → "lun, 15 sep"
  const dateLabel = (() => {
    const d = new Date(booking.booking_date + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  })();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Franja lateral de color según estado */}
      <View style={[styles.statusStripe, { backgroundColor: status.color }]} />

      <View style={styles.body}>
        {/* Cabecera: Escenario y código */}
        <View style={styles.row}>
          <Text style={styles.scenarioName} numberOfLines={1}>
            {booking.scenarios?.nombre ?? 'Escenario'}
          </Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Fecha y hora */}
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{dateLabel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatTime12h(booking.start_time)} – {formatTime12h(booking.end_time)}
            </Text>
          </View>
        </View>

        {/* Actividad y participantes */}
        <View style={styles.row}>
          <Text style={styles.activity}>{formatActivity(booking.activity_type)}</Text>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{booking.participants_count} personas</Text>
          </View>
        </View>

        {/* Código de reserva */}
        <View style={styles.codeRow}>
          <Ionicons name="barcode-outline" size={14} color={colors.primary} />
          <Text style={styles.code}>{booking.booking_code}</Text>
          {isActive && onCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statusStripe: {
    width: 4,
    minHeight: 100,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  scenarioName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  activity: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  code: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  cancelText: {
    fontSize: fontSize.xs,
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
});
