import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { RatingStars } from './RatingStars';
import { useUpsertRating } from '../../hooks/useScenarioRatings';
import { getRatingDraft, saveRatingDraft, clearRatingDraft } from '../../utils/ratingDraft';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

const ratingSchema = z.object({
  rating: z
    .number({ error: 'Selecciona una calificación (1 a 5 estrellas)' })
    .int('Calificación inválida')
    .min(1, 'Selecciona una calificación (1 a 5 estrellas)')
    .max(5, 'Calificación inválida'),
  comment: z
    .string()
    .trim()
    .max(500, 'El comentario no puede superar los 500 caracteres')
    .optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

export interface RatingFormModalProps {
  visible: boolean;
  scenarioId: string;
  scenarioName: string;
  userId: string;
  initialRating?: { id: string; rating: number; comment: string } | null;
  onClose: () => void;
  onSaved: () => void;
}

export function RatingFormModal({
  visible,
  scenarioId,
  scenarioName,
  userId,
  initialRating,
  onClose,
  onSaved,
}: RatingFormModalProps) {
  const { mutateAsync: upsertRating, isPending: isSaving } = useUpsertRating();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const watchRating = watch('rating');
  const watchComment = watch('comment');

  // Al abrir: precargar valoración existente o borrador local
  useEffect(() => {
    if (!visible) return;

    setFormError(null);

    if (initialRating) {
      reset({ rating: initialRating.rating, comment: initialRating.comment });
      return;
    }

    getRatingDraft(userId, scenarioId).then((draft) => {
      reset({
        rating: draft?.rating ?? 0,
        comment: draft?.comment ?? '',
      });
    });
  }, [visible, userId, scenarioId, initialRating, reset]);

  // Part 5: persistir borrador local mientras el usuario escribe
  useEffect(() => {
    if (!visible) return;
    if (initialRating) return;
    saveRatingDraft(userId, scenarioId, {
      rating: watchRating || null,
      comment: watchComment ?? '',
    });
  }, [visible, watchRating, watchComment, userId, scenarioId, initialRating]);

  const onSubmit = async (data: RatingFormData) => {
    setFormError(null);
    try {
      await upsertRating({
        scenario_id: scenarioId,
        user_id: userId,
        rating: data.rating,
        comment: data.comment ?? '',
      });
      await clearRatingDraft(userId, scenarioId);
      reset({ rating: 0, comment: '' });
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar la valoración';
      setFormError(msg);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderBlock}>
              <Text style={styles.modalTitle}>
                {initialRating ? 'Editar valoración' : 'Valorar escenario'}
              </Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {scenarioName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
            <View style={styles.modalBody}>
              {/* Calificación */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Calificación *</Text>
                <Controller
                  control={control}
                  name="rating"
                  render={({ field: { onChange, value } }) => (
                    <View style={[styles.starsBox, errors.rating && styles.starsBoxError]}>
                      <RatingStars value={value} onChange={onChange} size={36} />
                      {value > 0 && <Text style={styles.starValue}>{value}/5</Text>}
                    </View>
                  )}
                />
                {errors.rating && <Text style={styles.errorText}>{errors.rating.message}</Text>}
              </View>

              {/* Comentario */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Comentario (opcional)</Text>
                <Controller
                  control={control}
                  name="comment"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.fieldInput,
                        styles.fieldInputMultiline,
                        errors.comment && styles.fieldInputError,
                      ]}
                      placeholder="Cuéntanos tu experiencia en este escenario..."
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                      textAlignVertical="top"
                    />
                  )}
                />
                {errors.comment ? (
                  <Text style={styles.errorText}>{errors.comment.message}</Text>
                ) : (
                  <Text style={styles.charCounter}>{(watchComment ?? '').length}/500</Text>
                )}
              </View>

              {formError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{formError}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelModalText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveModalButton, isSaving && styles.buttonDisabled]}
              onPress={() => {
                setValue('comment', (watchComment ?? '').trim(), {
                  shouldValidate: true,
                });
                handleSubmit(onSubmit)();
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveModalText}>
                  {initialRating ? 'Guardar cambios' : 'Publicar valoración'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  fieldWrapper: {
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  starsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  starsBoxError: {
    borderColor: colors.error,
  },
  starValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  fieldInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  fieldInputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  fieldInputError: {
    borderColor: colors.error,
  },
  charCounter: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  errorBoxText: {
    fontSize: fontSize.xs,
    color: colors.error,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelModalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelModalText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  saveModalButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveModalText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
