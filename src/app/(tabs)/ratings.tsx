import { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  useMyRatings,
  useDeleteRating,
  type MyRatingWithScenario,
} from '../../hooks/useScenarioRatings';
import { RatingStars } from '../../components/rating/RatingStars';
import { RatingFormModal } from '../../components/rating/RatingFormModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

function principalImage(rating: MyRatingWithScenario) {
  const images = (rating.scenarios.scenario_images ?? [])
    .filter((img) => img.url)
    .sort((a, b) => a.display_order - b.display_order);
  const primary = images.find((img) => img.is_primary);
  return (primary ?? images[0])?.url ?? null;
}

export default function RatingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { data: ratings, isLoading, error, refetch, isRefetching } = useMyRatings(userId);
  const { mutateAsync: deleteRating, isPending: isDeleting } = useDeleteRating(userId);

  const [editingRating, setEditingRating] = useState<MyRatingWithScenario | null>(null);

  const confirmDelete = (rating: MyRatingWithScenario) => {
    const msg = '¿Eliminar tu valoración de este escenario?';
    const run = () => deleteRating(rating.id);
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) run();
    } else {
      Alert.alert('Eliminar valoración', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: run },
      ]);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando tus valoraciones..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar valoraciones"
        message="No se pudieron cargar tus valoraciones. Toca para reintentar."
        onRetry={() => refetch()}
      />
    );
  }

  const renderItem = ({ item }: { item: MyRatingWithScenario }) => {
    const imageUrl = principalImage(item);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardImage}
          activeOpacity={0.8}
          onPress={() => router.push(`/scenario/${item.scenario_id}`)}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.cardImageInner}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/scenario/${item.scenario_id}`)}
          >
            <Text style={styles.cardName} numberOfLines={1}>
              {item.scenarios.nombre}
            </Text>
            <Text style={styles.cardType} numberOfLines={1}>
              {item.scenarios.tipo}
            </Text>
          </TouchableOpacity>

          <View style={styles.ratingRow}>
            <RatingStars value={item.rating} size={15} />
            <Text style={styles.ratingDate}>
              {new Date(item.created_at).toLocaleDateString('es-BO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {item.comment ? (
            <Text style={styles.cardComment} numberOfLines={3}>
              {item.comment}
            </Text>
          ) : null}

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setEditingRating(item)}
              disabled={isDeleting}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => confirmDelete(item)}
              disabled={isDeleting}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={[styles.actionText, styles.actionTextDanger]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Valoraciones</Text>
        <Text style={styles.headerSubtitle}>{ratings?.length ?? 0} valoraciones de escenarios</Text>
      </View>

      <FlatList
        data={ratings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          ratings && ratings.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            title="Sin valoraciones aún"
            subtitle="Explora el catálogo y califica los escenarios que conozcas. Tu opinión ayuda a toda la comunidad."
            actionButton={{
              label: 'Explorar catálogo',
              onPress: () => router.push('/(tabs)/search'),
            }}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {editingRating && (
        <RatingFormModal
          visible={!!editingRating}
          scenarioId={editingRating.scenario_id}
          scenarioName={editingRating.scenarios.nombre}
          userId={userId}
          initialRating={{
            id: editingRating.id,
            rating: editingRating.rating,
            comment: editingRating.comment,
          }}
          onClose={() => setEditingRating(null)}
          onSaved={() => setEditingRating(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  cardImageInner: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  cardName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  cardType: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  cardComment: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  actionTextDanger: {
    color: colors.error,
  },
});
