/**
 * src/app/bookings/create.tsx
 * Formulario de Nueva Reserva con:
 * - Selector de fecha (próximos 14 días)
 * - Matriz de slots horarios con disponibilidad en tiempo real
 * - Validación completa con react-hook-form + zod
 * - Guardado de borrador en AsyncStorage
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useOccupiedSlots, useCreateBooking } from '../../hooks/useBookings';
import { saveBookingDraft, clearBookingDraft, getBookingDraft, saveBookingPreferences, getBookingPreferences } from '../../services/bookingStorage';
import { TimeSlotGrid } from '../../components/bookings/TimeSlotGrid';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { BookingActivity } from '../../types';

// ── Esquema de validación con Zod ──────────────────────────────────────────
const schema = z.object({
  contact_phone: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(15, 'El teléfono no puede superar 15 dígitos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  participants_count: z
    .number({ message: 'Ingresa un número válido' })
    .min(1, 'Mínimo 1 participante')
    .max(50, 'Máximo 50 participantes'),
  notes: z.string().max(250, 'Las notas no pueden superar 250 caracteres').optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Constantes ─────────────────────────────────────────────────────────────
const ACTIVITIES: { value: BookingActivity; label: string; icon: string }[] = [
  { value: 'amistoso', label: 'Amistoso', icon: '⚽' },
  { value: 'entrenamiento', label: 'Entrenamiento', icon: '🏋️' },
  { value: 'torneo', label: 'Torneo', icon: '🏆' },
  { value: 'recreativo', label: 'Recreativo', icon: '🎯' },
];

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

// ── Componente ─────────────────────────────────────────────────────────────
export default function CreateBookingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ scenario_id?: string; scenario_nombre?: string }>();
  const scenarioId = Array.isArray(params.scenario_id) ? params.scenario_id[0] : params.scenario_id ?? '';
  const scenarioNombre = Array.isArray(params.scenario_nombre)
    ? params.scenario_nombre[0]
    : params.scenario_nombre ?? 'Escenario';

  const dateOptions = buildDateOptions();
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<BookingActivity>('amistoso');

  const { data: occupied = [], isLoading: slotsLoading } = useOccupiedSlots(scenarioId, selectedDate);
  const { mutateAsync: createBooking, isPending } = useCreateBooking();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_phone: '',
      participants_count: 10,
      notes: '',
    },
  });

  // Recuperar borrador y preferencias al montar
  useEffect(() => {
    (async () => {
      const prefs = await getBookingPreferences();
      if (prefs.contact_phone) setValue('contact_phone', prefs.contact_phone);
      if (prefs.preferred_activity) setSelectedActivity(prefs.preferred_activity as BookingActivity);

      const draft = await getBookingDraft();
      if (draft && draft.scenario_id === scenarioId) {
        if (draft.booking_date) setSelectedDate(draft.booking_date);
        if (draft.start_time) setSelectedSlot(draft.start_time);
        if (draft.activity_type) setSelectedActivity(draft.activity_type);
        if (draft.contact_phone) setValue('contact_phone', draft.contact_phone);
        if (draft.participants_count) setValue('participants_count', draft.participants_count);
        if (draft.notes) setValue('notes', draft.notes);
      }
    })();
  }, []);

  // Guardar borrador al cambiar los campos
  const phone = watch('contact_phone');
  const participants = watch('participants_count');
  const notes = watch('notes');

  useEffect(() => {
    if (!scenarioId) return;
    saveBookingDraft({
      scenario_id: scenarioId,
      scenario_nombre: scenarioNombre,
      booking_date: selectedDate,
      start_time: selectedSlot ?? undefined,
      activity_type: selectedActivity,
      contact_phone: phone,
      participants_count: participants,
      notes: notes ?? '',
    });
  }, [selectedDate, selectedSlot, selectedActivity, phone, participants, notes]);

  const onSubmit = async (values: FormValues) => {
    if (!scenarioId) {
      Alert.alert('Error', 'No se especificó el escenario.');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Franja horaria requerida', 'Por favor selecciona un bloque de horario disponible.');
      return;
    }

    try {
      const [h, m] = selectedSlot.split(':').map(Number);
      const endH = h + 1;
      const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const result = await createBooking({
        scenario_id: scenarioId,
        booking_date: selectedDate,
        start_time: selectedSlot,
        end_time: endTime,
        activity_type: selectedActivity,
        participants_count: values.participants_count,
        contact_phone: values.contact_phone,
        notes: values.notes ?? '',
        user_id: user!.id,
      });

      // Guardar preferencias para agilizar próximas reservas
      await saveBookingPreferences({
        contact_phone: values.contact_phone,
        preferred_activity: selectedActivity,
      });
      await clearBookingDraft();

      // Navegar al ticket generado
      router.replace(`/bookings/${result.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear la reserva';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error al Reservar', msg);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Escenario seleccionado */}
      <View style={styles.scenarioCard}>
        <Ionicons name="business-outline" size={20} color={colors.primary} />
        <Text style={styles.scenarioName}>{scenarioNombre}</Text>
      </View>

      {/* SECCIÓN: Fecha */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Selecciona la Fecha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dateOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dateChip, selectedDate === opt.value && styles.dateChipActive]}
              onPress={() => {
                setSelectedDate(opt.value);
                setSelectedSlot(null); // Limpiar slot al cambiar fecha
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

      {/* SECCIÓN: Horario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Selecciona el Horario</Text>
        {slotsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
        ) : (
          <TimeSlotGrid
            occupiedSlots={occupied}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        )}
        {!selectedSlot && (
          <Text style={styles.helperText}>Toca un bloque verde para seleccionarlo</Text>
        )}
        {selectedSlot && (
          <View style={styles.selectedSlotInfo}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.selectedSlotText}>
              Turno seleccionado: {selectedSlot} – {String(parseInt(selectedSlot) + 1).padStart(2, '0')}:00
            </Text>
          </View>
        )}
      </View>

      {/* SECCIÓN: Tipo de Actividad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏅 Tipo de Actividad</Text>
        <View style={styles.activityGrid}>
          {ACTIVITIES.map((act) => (
            <TouchableOpacity
              key={act.value}
              style={[styles.activityChip, selectedActivity === act.value && styles.activityChipActive]}
              onPress={() => setSelectedActivity(act.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.activityIcon}>{act.icon}</Text>
              <Text style={[styles.activityLabel, selectedActivity === act.value && styles.activityLabelActive]}>
                {act.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SECCIÓN: Datos del Grupo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Datos del Grupo</Text>

        {/* Participantes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Número de participantes *</Text>
          <Controller
            control={control}
            name="participants_count"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.participants_count && styles.inputError]}
                keyboardType="number-pad"
                value={String(value ?? '')}
                onChangeText={(v) => onChange(parseInt(v) || 0)}
                placeholder="Ej: 10"
                placeholderTextColor={colors.textSecondary}
              />
            )}
          />
          {errors.participants_count && (
            <Text style={styles.errorText}>{errors.participants_count.message}</Text>
          )}
        </View>

        {/* Teléfono */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Teléfono de contacto *</Text>
          <Controller
            control={control}
            name="contact_phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.contact_phone && styles.inputError]}
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                placeholder="Ej: 0414-1234567"
                placeholderTextColor={colors.textSecondary}
              />
            )}
          />
          {errors.contact_phone && (
            <Text style={styles.errorText}>{errors.contact_phone.message}</Text>
          )}
        </View>

        {/* Notas */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Notas adicionales (opcional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={value}
                onChangeText={onChange}
                placeholder="Ej: Llevarán sus propios implementos deportivos..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={250}
              />
            )}
          />
          {errors.notes && <Text style={styles.errorText}>{errors.notes.message}</Text>}
        </View>
      </View>

      {/* Botón de Confirmar Reserva */}
      <TouchableOpacity
        style={[styles.submitBtn, (isPending || !selectedSlot) && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending || !selectedSlot}
        activeOpacity={0.85}
      >
        {isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
            <Text style={styles.submitText}>Confirmar Reserva</Text>
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
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight + '33',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  scenarioName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  dateChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  dateChipTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  selectedSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#DCFCE7',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  selectedSlotText: {
    fontSize: fontSize.sm,
    color: '#166534',
    fontWeight: fontWeight.semibold,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
  activityChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  activityIcon: { fontSize: 16 },
  activityLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  activityLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  fieldGroup: { gap: spacing.xs },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    fontWeight: fontWeight.medium,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  submitBtnDisabled: { backgroundColor: colors.textSecondary },
  submitText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
