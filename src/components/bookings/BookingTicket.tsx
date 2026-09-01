/**
 * BookingTicket.tsx
 * Componente de comprobante / voucher estilo "ticket deportivo".
 * Muestra el código de reserva, datos del turno y estado en tiempo real.
 */
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { getStatusStyle, formatTime12h, formatActivity } from '../../hooks/useBookings';
import type { ScenarioBooking } from '../../types';

interface BookingTicketProps {
  booking: ScenarioBooking;
}

export function BookingTicket({ booking }: BookingTicketProps) {
  const status = getStatusStyle(booking.status);
  const dateLabel = (() => {
    const d = new Date(booking.booking_date + 'T00:00:00');
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  })();

  return (
    <View style={styles.ticket}>
      {/* Cabecera del ticket */}
      <View style={[styles.ticketHeader, { backgroundColor: colors.primary }]}>
        <Ionicons name="ticket-outline" size={22} color={colors.white} />
        <Text style={styles.ticketHeaderTitle}>Comprobante de Reserva</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Cuerpo: Código grande */}
      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>Código de Reserva</Text>
        <Text style={styles.codeText}>{booking.booking_code}</Text>
      </View>

      {/* Línea punteada decorativa */}
      <View style={styles.dashedLine}>
        <View style={styles.dashedContent}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <View style={styles.cutCircleLeft} />
        <View style={styles.cutCircleRight} />
      </View>

      {/* Detalles del turno */}
      <View style={styles.details}>
        <TicketRow
          icon="business-outline"
          label="Escenario"
          value={booking.scenarios?.nombre ?? '—'}
        />
        <TicketRow
          icon="location-outline"
          label="Dirección"
          value={booking.scenarios?.direccion ?? '—'}
        />
        <TicketRow
          icon="calendar-outline"
          label="Fecha"
          value={dateLabel}
        />
        <TicketRow
          icon="time-outline"
          label="Horario"
          value={`${formatTime12h(booking.start_time)} – ${formatTime12h(booking.end_time)}`}
        />
        <TicketRow
          icon="football-outline"
          label="Actividad"
          value={formatActivity(booking.activity_type)}
        />
        <TicketRow
          icon="people-outline"
          label="Participantes"
          value={`${booking.participants_count} personas`}
        />
        <TicketRow
          icon="call-outline"
          label="Contacto"
          value={booking.contact_phone}
        />
        {booking.notes ? (
          <TicketRow
            icon="document-text-outline"
            label="Notas"
            value={booking.notes}
          />
        ) : null}
      </View>

      {/* Pie del ticket */}
      <View style={styles.ticketFooter}>
        <Text style={styles.footerText}>
          Reserva registrada el{' '}
          {new Date(booking.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.footerApp}>📍 Escenarios Deportivos</Text>
      </View>
    </View>
  );
}

function TicketRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={colors.primary} style={styles.detailIcon} />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  ticketHeaderTitle: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  codeSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: '#F8FAFC',
  },
  codeLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  codeText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 4,
  },
  dashedLine: {
    height: 20,
    position: 'relative',
    overflow: 'visible',
  },
  dashedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 20,
  },
  dash: {
    width: 6,
    height: 1.5,
    backgroundColor: colors.border,
  },
  cutCircleLeft: {
    position: 'absolute',
    left: -14,
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cutCircleRight: {
    position: 'absolute',
    right: -14,
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  details: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    marginTop: 1,
  },
  ticketFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footerApp: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
