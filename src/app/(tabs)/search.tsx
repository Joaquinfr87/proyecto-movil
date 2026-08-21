import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useScenarios } from '../../hooks/useScenarios';
import { ScenarioCard } from '../../components/common/ScenarioCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function SearchScreen() {
  const router = useRouter();
  const { data: scenarios, isLoading, error, refetch, isRefetching } = useScenarios();

  if (isLoading) {
    return <LoadingSpinner message="Cargando escenarios..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="wifi-outline"
        title="Error al cargar datos"
        subtitle="No se pudieron cargar los escenarios. Toca para reintentar."
        actionButton={{ label: 'Reintentar', onPress: () => refetch() }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <Text style={styles.headerSubtitle}>
          {scenarios?.length ?? 0} escenarios disponibles
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={scenarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item}
            onPress={(id) => router.push(`/scenario/${id}`)}
          />
        )}
        contentContainerStyle={
          scenarios && scenarios.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Sin escenarios"
            subtitle="No hay escenarios disponibles en este momento."
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
