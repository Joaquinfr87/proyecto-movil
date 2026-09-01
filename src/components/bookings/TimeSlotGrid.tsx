/**
 * TimeSlotGrid.tsx
 * Matriz visual de selección de franjas horarias (08:00 – 22:00, bloques de 1 hora).
 * Muestra cada slot como: Disponible 🟢 | Seleccionado 🔵 | Ocupado 🔴
 */
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { formatTime12h, calcEndTime } from '../../hooks/useBookings';

const SLOTS: string[] = Array.from({ length: 14 }, (_, i) => {
  const h = 8 + i;
  return `${String(h).padStart(2, '0')}:00`;
});

interface TimeSlotGridProps {
  occupiedSlots: string[];      // Horarios ya reservados: ["09:00", "14:00", ...]
  selectedSlot: string | null;  // Slot actualmente seleccionado
  onSelectSlot: (slot: string) => void;
}

export function TimeSlotGrid({ occupiedSlots, selectedSlot, onSelectSlot }: TimeSlotGridProps) {
  const isOccupied = (slot: string) => occupiedSlots.includes(slot);
  const isSelected = (slot: string) => selectedSlot === slot;

  return (
    <View style={styles.container}>
      <Text style={styles.legend}>
        <Text style={styles.legendDot}>🟢</Text> Disponible  {' '}
        <Text style={styles.legendDot}>🔵</Text> Seleccionado  {' '}
        <Text style={styles.legendDot}>🔴</Text> Ocupado
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {SLOTS.map((slot) => {
          const occupied = isOccupied(slot);
          const selected = isSelected(slot);
          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slot,
                occupied && styles.slotOccupied,
                selected && styles.slotSelected,
              ]}
              onPress={() => !occupied && onSelectSlot(slot)}
              disabled={occupied}
              activeOpacity={occupied ? 1 : 0.75}
            >
              <Text
                style={[
                  styles.slotTime,
                  occupied && styles.slotTimeOccupied,
                  selected && styles.slotTimeSelected,
                ]}
              >
                {formatTime12h(slot)}
              </Text>
              <Text
                style={[
                  styles.slotEnd,
                  occupied && styles.slotTimeOccupied,
                  selected && styles.slotTimeSelected,
                ]}
              >
                – {formatTime12h(calcEndTime(slot))}
              </Text>
              {occupied && <Text style={styles.occupiedLabel}>Ocupado</Text>}
              {selected && <Text style={styles.selectedLabel}>✓ Selec.</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  legend: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  legendDot: {
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
  },
  slot: {
    width: 82,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  slotOccupied: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    opacity: 0.75,
  },
  slotSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  slotTime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#166534',
    textAlign: 'center',
  },
  slotTimeOccupied: {
    color: '#DC2626',
  },
  slotTimeSelected: {
    color: colors.primary,
  },
  slotEnd: {
    fontSize: 10,
    color: '#4ADE80',
    textAlign: 'center',
  },
  occupiedLabel: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  selectedLabel: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
});
