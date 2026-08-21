import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import { ScenarioCard } from '../../components/common/ScenarioCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: favorites,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useFavorites(user?.id ?? '');

  if (isLoading) {
    return <LoadingSpinner message="Cargando favoritos..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="wifi-outline"
        title="Error al cargar datos"
        subtitle="No se pudieron cargar tus favoritos. Toca para reintentar."
        actionButton={{ label: 'Reintentar', onPress: () => refetch() }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <Text style={styles.headerSubtitle}>
          {favorites?.length ?? 0} escenarios guardados
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.scenario_id}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item.scenarios}
            onPress={(id) => router.push(`/scenario/${id}`)}
          />
        )}
        contentContainerStyle={
          favorites && favorites.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Sin favoritos aún"
            subtitle="Explora el catálogo y guarda tus escenarios favoritos aquí."
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
});
