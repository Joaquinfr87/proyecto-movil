import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useScenario } from '../../hooks/useScenarios';
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites';
import { useUploadImage } from '../../hooks/useUploadImage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 260;

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { data: scenario, isLoading, error, refetch } = useScenario(id ?? '');
  const { data: favoriteFromDb } = useIsFavorite(user?.id ?? '', id ?? '');
  const { toggleFavorite, isToggling } = useToggleFavorite();
  const { uploadImage, isUploading } = useUploadImage();

  const [imageError, setImageError] = useState(false);
  // T-031: actualizacion optimista - el icono cambia antes de esperar al servidor
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);

  // Cuando llega el dato fresco del servidor tras la invalidacion, limpiamos el optimista
  useEffect(() => {
    if (favoriteFromDb !== undefined && !isToggling) {
      setOptimisticFavorite(null);
    }
  }, [favoriteFromDb, isToggling]);

  const isFavorite = optimisticFavorite ?? favoriteFromDb ?? false;

  // Solo admin puede subir imágenes
  const canUpload = user?.user_metadata?.role === 'admin';

  const primaryImage = scenario?.scenario_images?.find((img) => img.is_primary);
  const imageUrl = !imageError
    ? (primaryImage?.url ?? scenario?.scenario_images?.[0]?.url ?? null)
    : null;

  const handleToggleFavorite = async () => {
    if (!user?.id || !id) return;
    const next = !isFavorite;
    setOptimisticFavorite(next);
    try {
      await toggleFavorite(user.id, id);
    } catch {
      // Revertir si el servidor falla
      setOptimisticFavorite(!next);
      Alert.alert('Error', 'No se pudo actualizar el favorito. Intenta de nuevo.');
    }
  };

  const handleUploadImage = async () => {
    if (!id) return;
    const result = await uploadImage(id);
    if (result) {
      // Invalidar cache para recargar el escenario con la nueva imagen
      await queryClient.invalidateQueries({ queryKey: ['scenario', id] });
      Alert.alert('Éxito', 'Imagen subida correctamente.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando escenario..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar escenario"
        message="No se pudo obtener la información de este escenario. Toca para reintentar."
        onRetry={() => refetch()}
      />
    );
  }

  if (!scenario) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Escenario no encontrado"
        subtitle="No pudimos encontrar la información de este escenario."
        actionButton={{ label: 'Volver', onPress: () => router.back() }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
            </View>
          )}

          {/* Overlay con botón volver */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>

          {/* Botón de subir imagen (solo admin/gestor) */}
          {canUpload && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadImage}
              disabled={isUploading}
              activeOpacity={0.85}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera-outline" size={22} color={colors.white} />
              )}
            </TouchableOpacity>
          )}

          {/* Badge estado */}
          <View
            style={[
              styles.estadoBadge,
              {
                backgroundColor:
                  scenario.estado === 'activo' ? colors.success : colors.textSecondary,
              },
            ]}
          >
            <Text style={styles.estadoBadgeText}>
              {scenario.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Nombre y tipo */}
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.name}>{scenario.nombre}</Text>
              <View style={styles.tipoBadge}>
                <Text style={styles.tipoBadgeText}>{scenario.tipo}</Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          {scenario.descripcion ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{scenario.descripcion}</Text>
            </View>
          ) : null}

          {/* Detalles clave */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="people-outline" label="Capacidad" value={`${scenario.capacidad.toLocaleString()} personas`} />
              <View style={styles.divider} />
              <InfoRow icon="location-outline" label="Dirección" value={scenario.direccion} />
              {scenario.horario ? (
                <>
                  <View style={styles.divider} />
                  <InfoRow icon="time-outline" label="Horario" value={scenario.horario} />
                </>
              ) : null}
            </View>
          </View>

          {/* Deportes disponibles */}
          {scenario.scenario_sports && scenario.scenario_sports.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deportes disponibles</Text>
              <View style={styles.chipsContainer}>
                {scenario.scenario_sports.map((ss, index) => (
                  <View key={index} style={styles.chip}>
                    <Ionicons name="football-outline" size={14} color={colors.primary} />
                    <Text style={styles.chipText}>{ss.sports.nombre}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Eventos próximos */}
          {scenario.events && scenario.events.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eventos próximos</Text>
              {scenario.events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventDateBadge}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{event.nombre}</Text>
                    <Text style={styles.eventDate}>
                      {event.fecha} · {event.hora}
                    </Text>
                    {event.descripcion ? (
                      <Text style={styles.eventDesc} numberOfLines={2}>
                        {event.descripcion}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Botón flotante de favorito */}
      <TouchableOpacity
        style={[styles.favButton, isFavorite && styles.favButtonActive]}
        onPress={handleToggleFavorite}
        disabled={isToggling}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={26}
          color={isFavorite ? colors.white : colors.primary}
        />
        <Text style={[styles.favButtonText, isFavorite && styles.favButtonTextActive]}>
          {isFavorite ? 'Guardado' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={styles.infoRowText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  estadoBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  estadoBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  content: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  tipoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tipoBadgeText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoRowText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  eventCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventDateBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  eventDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  eventDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 96,
  },
  favButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  favButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  favButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  favButtonTextActive: {
    color: colors.white,
  },
});
