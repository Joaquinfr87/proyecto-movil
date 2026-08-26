import React, { useState, useMemo, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScenarios, ScenarioWithDetails } from '../../hooks/useScenarios';
import { ScenarioCard } from '../../components/common/ScenarioCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

export default function SearchScreen() {
  const router = useRouter();
  const { data: scenarios, isLoading, error, refetch, isRefetching } = useScenarios();

  // Estados locales para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  // T-029: Debounce de 300ms para el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // T-030: Extraer listas dinámicas de tipos y deportes disponibles
  const availableTypes = useMemo(() => {
    if (!scenarios) return [];
    const typesSet = new Set<string>();
    scenarios.forEach((s) => {
      if (s.tipo) typesSet.add(s.tipo);
    });
    return Array.from(typesSet).sort();
  }, [scenarios]);

  const availableSports = useMemo(() => {
    if (!scenarios) return [];
    const sportsSet = new Set<string>();
    scenarios.forEach((s) => {
      s.scenario_sports?.forEach((ss) => {
        if (ss.sports?.nombre) sportsSet.add(ss.sports.nombre);
      });
    });
    return Array.from(sportsSet).sort();
  }, [scenarios]);

  // T-029 + T-030: Filtros acumulativos en memoria
  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];

    return scenarios.filter((scenario: ScenarioWithDetails) => {
      // Filtro por nombre (T-029)
      const matchesName = debouncedQuery
        ? scenario.nombre.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          scenario.direccion?.toLowerCase().includes(debouncedQuery.toLowerCase())
        : true;

      // Filtro por tipo (T-030)
      const matchesType = selectedType
        ? scenario.tipo?.toLowerCase() === selectedType.toLowerCase()
        : true;

      // Filtro por deporte (T-030)
      const matchesSport = selectedSport
        ? scenario.scenario_sports?.some(
            (ss) => ss.sports?.nombre?.toLowerCase() === selectedSport.toLowerCase(),
          )
        : true;

      return matchesName && matchesType && matchesSport;
    });
  }, [scenarios, debouncedQuery, selectedType, selectedSport]);

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedType || selectedSport);

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedType(null);
    setSelectedSport(null);
  };

  // T-032: Manejo de estado de carga y error
  if (isLoading) {
    return <LoadingSpinner message="Cargando catálogo..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar catálogo"
        message="No se pudieron cargar los escenarios deportivos. Toca el botón para reintentar."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <Text style={styles.headerSubtitle}>
          {filteredScenarios.length} de {scenarios?.length ?? 0} escenarios encontrados
        </Text>

        {/* T-029: Barra de búsqueda */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar escenario por nombre..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* T-030: Sección de Filtros por Tipo y Deporte */}
      <View style={styles.filtersSection}>
        {/* Filtro por Tipo */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tipo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            <TouchableOpacity
              style={[styles.chip, selectedType === null && styles.chipActive]}
              onPress={() => setSelectedType(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedType === null && styles.chipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {availableTypes.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.chip, selectedType === tipo && styles.chipActive]}
                onPress={() => setSelectedType(selectedType === tipo ? null : tipo)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedType === tipo && styles.chipTextActive]}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filtro por Deporte */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Deporte:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            <TouchableOpacity
              style={[styles.chip, selectedSport === null && styles.chipActive]}
              onPress={() => setSelectedSport(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedSport === null && styles.chipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {availableSports.map((deporte) => (
              <TouchableOpacity
                key={deporte}
                style={[styles.chip, selectedSport === deporte && styles.chipActive]}
                onPress={() => setSelectedSport(selectedSport === deporte ? null : deporte)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedSport === deporte && styles.chipTextActive]}>
                  {deporte}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters ? (
          <View style={styles.clearFiltersRow}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={14} color={colors.primary} />
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Lista de escenarios filtrados */}
      <FlatList
        data={filteredScenarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item}
            onPress={(id) => router.push(`/scenario/${id}`)}
          />
        )}
        contentContainerStyle={
          filteredScenarios.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Sin resultados"
            subtitle={
              hasActiveFilters
                ? 'No encontramos ningún escenario que coincida con tus criterios de búsqueda.'
                : 'No hay escenarios disponibles en este momento.'
            }
            actionButton={
              hasActiveFilters
                ? { label: 'Limpiar filtros', onPress: clearFilters }
                : undefined
            }
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
        removeClippedSubviews={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={11}
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
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  filtersSection: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  filterLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingLeft: spacing.md,
    width: 70,
  },
  chipsScroll: {
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: fontWeight.bold,
  },
  clearFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: spacing.xxl,
  },
});
