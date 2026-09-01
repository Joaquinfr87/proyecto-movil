import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RatingStars } from './RatingStars';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { RatingWithProfile } from '../../hooks/useScenarioRatings';

export interface RatingListProps {
  ratings: RatingWithProfile[];
  userId: string | undefined;
  onEdit?: (rating: RatingWithProfile) => void;
  onDelete?: (rating: RatingWithProfile) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function RatingList({ ratings, userId, onEdit, onDelete }: RatingListProps) {
  if (ratings.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="star-outline" size={28} color={colors.textSecondary} />
        <Text style={styles.emptyText}>
          Aún no hay valoraciones para este escenario. Sé el primero en opinar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {ratings.map((rating) => {
        const isMine = userId != null && rating.user_id === userId;
        const displayName = isMine ? 'Tú' : rating.profiles?.full_name?.trim() || 'Usuario';

        return (
          <View key={rating.id} style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                  {isMine && <Text style={styles.mineTag}> (tu valoración)</Text>}
                </Text>
                <Text style={styles.date}>{formatDate(rating.created_at)}</Text>
              </View>

              <RatingStars value={rating.rating} size={15} />

              {rating.comment ? <Text style={styles.comment}>{rating.comment}</Text> : null}
            </View>

            {isMine && (onEdit || onDelete) && (
              <View style={styles.actions}>
                {onEdit && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onEdit(rating)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onDelete(rating)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  mineTag: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  comment: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  emptyBox: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
