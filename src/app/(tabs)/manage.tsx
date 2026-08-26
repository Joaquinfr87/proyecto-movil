import { useState, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
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
  useAllScenarios,
  useDeleteScenario,
  useHardDeleteScenario,
  useToggleScenarioStatus,
} from '../../hooks/useManageScenarios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { ScenarioWithImages } from '../../hooks/useManageScenarios';
import {
  getRole,
  canManageContent,
  canDeleteScenario,
  canHardDeleteScenario,
} from '../../utils/permissions';

export default function ManageScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: scenarios,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAllScenarios();
  const { mutateAsync: softDelete, isPending: isSoftDeleting } = useDeleteScenario();
  const { mutateAsync: hardDelete, isPending: isHardDeleting } = useHardDeleteScenario();
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleScenarioStatus();

  const [searchQuery, setSearchQuery] = useState('');

  const role = getRole(user);
  const canDelete = canDeleteScenario(role);
  const canHardDel = canHardDeleteScenario(role);
  const isDeleting = isSoftDeleting || isHardDeleting;

  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    if (!searchQuery.trim()) return scenarios;
    const q = searchQuery.toLowerCase().trim();
    return scenarios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.tipo.toLowerCase().includes(q) ||
        s.direccion?.toLowerCase().includes(q),
    );
  }, [scenarios, searchQuery]);

  if (!canManageContent(role)) {
    return (
      <EmptyState
        icon="lock-closed-outline"
        title="Acceso restringido"
        subtitle="No tienes permisos para acceder a esta sección."
      />
    );
  }

  const handleHardDelete = (id: string, nombre: string) => {
    const msg = `¿Eliminar permanentemente \"${nombre}\"? Esta acción no se puede deshacer.`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        hardDelete(id);
      }
    } else {
      Alert.alert('Eliminar escenario', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => hardDelete(id) },
      ]);
    }
  };

  const handleToggleStatus = (id: string, nombre: string, currentStatus: string) => {
    const activating = currentStatus !== 'activo';
    const newStatus = activating ? 'activo' : 'inactivo';
    const label = activating ? 'habilitar' : 'deshabilitar';
    const msg = `¿${label.charAt(0).toUpperCase() + label.slice(1)} el escenario \"${nombre}\"?`;

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        toggleStatus({ id, status: newStatus });
      }
    } else {
      Alert.alert(label.charAt(0).toUpperCase() + label.slice(1), msg, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: label.charAt(0).toUpperCase() + label.slice(1),
          onPress: () => toggleStatus({ id, status: newStatus }),
        },
      ]);
    }
  };

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

  const renderItem = ({ item }: { item: ScenarioWithImages }) => {
    const images = (item.scenario_images ?? [])
      .filter((img) => img.url)
      .sort((a, b) => a.display_order - b.display_order);
    const primaryImage = images?.find((img) => img.is_primary);
    const imageUrl = primaryImage?.url ?? images?.[0]?.url ?? null;
    const isActive = item.estado === 'activo';

    return (
      <View style={styles.card}>
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
          {(images?.length ?? 0) > 1 && (
            <View style={styles.imageCountBadge}>
              <Ionicons name="images-outline" size={10} color={colors.white} />
              <Text style={styles.imageCountText}>{images!.length}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.nombre}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardType}>{item.tipo}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isActive ? colors.success : colors.textSecondary },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
          <View style={styles.cardLocationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.cardLocation} numberOfLines={1}>
              {item.direccion || 'Sin dirección'}
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/scenario-form/${item.id}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Habilitar/Deshabilitar - admin y gestor */}
          <TouchableOpacity
            style={[styles.actionButton, isActive ? styles.disableButton : styles.enableButton]}
            onPress={() => handleToggleStatus(item.id, item.nombre, item.estado)}
            disabled={isToggling}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
              size={20}
              color={isActive ? colors.warning : colors.success}
            />
          </TouchableOpacity>

          {/* Eliminar permanentemente - solo admin */}
          {canHardDel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleHardDelete(item.id, item.nombre)}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión</Text>
        <Text style={styles.headerSubtitle}>
          {filteredScenarios.length} de {scenarios?.length ?? 0} escenarios
        </Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar escenario..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredScenarios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredScenarios.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon={searchQuery ? 'search-outline' : 'albums-outline'}
            title={searchQuery ? 'Sin resultados' : 'Sin escenarios'}
            subtitle={
              searchQuery
                ? 'No se encontraron escenarios que coincidan con tu búsqueda.'
                : 'Crea el primer escenario deportivo tocando el botón +.'
            }
            actionButton={
              searchQuery ? { label: 'Limpiar búsqueda', onPress: () => setSearchQuery('') } : undefined
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
        showsVerticalScrollIndicator={false}
      />

      {/* FAB: Crear nuevo escenario */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/scenario-form/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

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
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
  },
  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  imageCountText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: fontWeight.semibold,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    gap: 2,
  },
  cardName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardType: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardLocation: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disableButton: {
    backgroundColor: '#FFF3E0',
  },
  enableButton: {
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
