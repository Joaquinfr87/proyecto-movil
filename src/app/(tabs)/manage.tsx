import { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAllScenarios, useDeleteScenario } from '../../hooks/useManageScenarios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { ScenarioWithImages } from '../../hooks/useManageScenarios';
import { getRole, canManageContent, canDeleteScenario } from '../../utils/permissions';

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
  const { mutateAsync: deleteScenario, isPending: isDeleting } = useDeleteScenario();

  const role = getRole(user);
  const canDelete = canDeleteScenario(role);

  // Redirigir si no tiene permisos (doble seguridad, el tab ya se oculta)
  if (!canManageContent(role)) {
    return (
      <EmptyState
        icon="lock-closed-outline"
        title="Acceso restringido"
        subtitle="No tienes permisos para acceder a esta sección."
      />
    );
  }

  const handleDelete = (id: string, nombre: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Desactivar el escenario "${nombre}"? Se marcará como inactivo.`)) {
        deleteScenario(id);
      }
    } else {
      Alert.alert(
        'Desactivar escenario',
        `¿Estás seguro de desactivar "${nombre}"? Se marcará como inactivo.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => deleteScenario(id),
          },
        ],
      );
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
    const primaryImage = item.scenario_images?.find((img) => img.is_primary);
    const imageUrl = primaryImage?.url ?? item.scenario_images?.[0]?.url ?? null;
    const isActive = item.estado === 'activo';

    return (
      <View style={styles.card}>
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} resizeMode="cover" />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
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

          {canDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id, item.nombre)}
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
          {scenarios?.length ?? 0} escenarios registrados
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={scenarios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          scenarios && scenarios.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="Sin escenarios"
            subtitle="Crea el primer escenario deportivo tocando el botón +."
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
