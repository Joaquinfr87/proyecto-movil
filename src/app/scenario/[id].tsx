import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useScenario } from '../../hooks/useScenarios';
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useCreateEvent, useDeleteEvent } from '../../hooks/useEvents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { InteractiveStadiumMap } from '../../components/scenario/InteractiveStadiumMap';
import { Visor360Modal } from '../../components/scenario/Visor360Modal';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { getRole, canManageContent } from '../../utils/permissions';
import type { ScenarioSector } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 260;

export default function ScenarioDetailScreen() {
  const rawId = useLocalSearchParams<{ id: string }>().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { data: scenario, isLoading, error } = useScenario(id ?? '');
  const { data: isFavorite } = useIsFavorite(user?.id ?? '', id ?? '');
  const { toggleFavorite, isToggling } = useToggleFavorite();
  const { uploadImage, isUploading } = useUploadImage();
  const { mutateAsync: createEvent, isPending: isCreatingEvent } = useCreateEvent();
  const { mutateAsync: deleteEvent, isPending: isDeletingEvent } = useDeleteEvent(id ?? '');

  const [imageError, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSector, setSelectedSector] = useState<ScenarioSector | null>(null);
  const imageScrollRef = useRef<ScrollView>(null);

  const sortedImages = (scenario?.scenario_images ?? [])
    .filter((img) => img.url)
    .sort((a, b) => a.display_order - b.display_order);

  const hasMultipleImages = (sortedImages?.length ?? 0) > 1;

  const handleImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
    setActiveImageIndex(index);
  };

  // Modal para crear evento
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('18:00');
  const [descripcion, setDescripcion] = useState('');
  const [eventError, setEventError] = useState<string | null>(null);

  // Solo admin y gestor pueden administrar (subir fotos, eventos)
  const role = getRole(user);
  const canManage = canManageContent(role);

  const primaryImage = sortedImages?.find((img) => img.is_primary);
  const imageUrl = !imageError
    ? (primaryImage?.url ?? sortedImages?.[0]?.url ?? null)
    : null;

  const handleToggleFavorite = async () => {
    if (!user?.id || !id) return;
    await toggleFavorite(user.id, id);
  };

  const handleUploadImage = async () => {
    if (!id) return;
    const result = await uploadImage(id);
    if (result) {
      await queryClient.invalidateQueries({ queryKey: ['scenario', id] });
      Alert.alert('Éxito', 'Imagen subida correctamente.');
    }
  };

  const handleOpenAddEvent = () => {
    // Configurar fecha de mañana por defecto (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    setNombre('');
    setFecha(dateStr);
    setHora('18:00');
    setDescripcion('');
    setEventError(null);
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!nombre.trim()) {
      setEventError('El nombre del evento es requerido');
      return;
    }
    if (!fecha.trim()) {
      setEventError('La fecha es requerida (YYYY-MM-DD)');
      return;
    }

    try {
      setEventError(null);
      await createEvent({
        scenario_id: id ?? '',
        nombre: nombre.trim(),
        fecha: fecha.trim(),
        hora: hora.trim() || '00:00',
        descripcion: descripcion.trim(),
      });
      setModalVisible(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear evento';
      setEventError(msg);
    }
  };

  const handleDeleteEvent = (eventId: string, eventName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar el evento "${eventName}"?`)) {
        deleteEvent(eventId);
      }
    } else {
      Alert.alert(
        'Eliminar evento',
        `¿Estás seguro de eliminar "${eventName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => deleteEvent(eventId),
          },
        ],
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando escenario..." />;
  }

  if (error || !scenario) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Escenario no encontrado"
        subtitle="No pudimos cargar la información de este escenario."
        actionButton={{ label: 'Volver', onPress: () => router.back() }}
      />
    );
  }

  const hasEvents = scenario.events && scenario.events.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Imagen principal / Carrusel */}
        <View style={styles.imageContainer}>
          {sortedImages && sortedImages.length > 0 ? (
            <>
              <ScrollView
                ref={imageScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleImageScroll}
                scrollEventThrottle={16}
              >
                {sortedImages.map((img, index) => (
                  <View key={img.storage_path ?? index} style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}>
                    <Image
                      source={{ uri: img.url }}
                      style={styles.image}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                ))}
              </ScrollView>

              {hasMultipleImages && (
                <View style={styles.detailDotsContainer}>
                  {sortedImages.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.detailDot, index === activeImageIndex && styles.detailDotActive]}
                    />
                  ))}
                </View>
              )}

              {hasMultipleImages && (
                <View style={styles.imageCounterBadge}>
                  <Ionicons name="images-outline" size={12} color={colors.white} />
                  <Text style={styles.imageCounterText}>
                    {activeImageIndex + 1}/{sortedImages.length}
                  </Text>
                </View>
              )}
            </>
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
          {canManage && (
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

          {/* Mapa Interactivo de Sectores y Visor 360 (T-059, T-060, T-061) */}
          {(() => {
            const sectors =
              scenario.scenario_sectors && scenario.scenario_sectors.length > 0
                ? scenario.scenario_sectors
                : (scenario.nombre?.toLowerCase().includes('capriles') ||
                   scenario.tipo?.toLowerCase().includes('estadio'))
                ? [
                    {
                      id: 'sec-cancha',
                      scenario_id: scenario.id,
                      nombre: 'Cancha Central',
                      svg_path: 'M 300 200 L 500 200 L 500 400 L 300 400 Z',
                      foto_360_url: 'https://pannellum.org/images/alma.jpg',
                      color_hex: '#22c55e',
                      display_order: 1,
                    },
                    {
                      id: 'sec-norte',
                      scenario_id: scenario.id,
                      nombre: 'Curva Norte',
                      svg_path: 'M 260 80 Q 400 30 540 80 L 510 180 Q 400 140 290 180 Z',
                      foto_360_url: 'https://pannellum.org/images/cerro-toco-0.jpg',
                      color_hex: '#3b82f6',
                      display_order: 2,
                    },
                    {
                      id: 'sec-sur',
                      scenario_id: scenario.id,
                      nombre: 'Curva Sur',
                      svg_path: 'M 290 420 Q 400 460 510 420 L 540 520 Q 400 570 260 520 Z',
                      foto_360_url: 'https://pannellum.org/images/bma-0.jpg',
                      color_hex: '#ef4444',
                      display_order: 3,
                    },
                    {
                      id: 'sec-pref',
                      scenario_id: scenario.id,
                      nombre: 'Tribuna Preferencia',
                      svg_path: 'M 120 120 L 260 190 L 260 410 L 120 480 Z',
                      foto_360_url: 'https://pannellum.org/images/jfk.jpg',
                      color_hex: '#f59e0b',
                      display_order: 4,
                    },
                    {
                      id: 'sec-gen',
                      scenario_id: scenario.id,
                      nombre: 'Tribuna General',
                      svg_path: 'M 540 190 L 680 120 L 680 480 L 540 410 Z',
                      foto_360_url: 'https://pannellum.org/images/milan.jpg',
                      color_hex: '#8b5cf6',
                      display_order: 5,
                    },
                  ]
                : [];

            if (sectors.length === 0) return null;

            return (
              <InteractiveStadiumMap
                sectors={sectors}
                onSectorPress={(sector) => {
                  if (sector.foto_360_url) {
                    setSelectedSector(sector);
                  } else {
                    Alert.alert('Aviso', 'Este sector aún no tiene vista 360° disponible.');
                  }
                }}
              />
            );
          })()}

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

          {/* Eventos próximos (T-044) */}
          {(hasEvents || canManage) && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Eventos próximos</Text>
                {canManage && (
                  <TouchableOpacity
                    style={styles.addEventButton}
                    onPress={handleOpenAddEvent}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                    <Text style={styles.addEventText}>Agregar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {hasEvents ? (
                scenario.events.map((event) => (
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
                    {canManage && (
                      <TouchableOpacity
                        style={styles.deleteEventButton}
                        onPress={() => handleDeleteEvent(event.id, event.nombre)}
                        disabled={isDeletingEvent}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noEventsText}>No hay eventos próximos registrados.</Text>
              )}
            </View>
          )}

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

      {/* Modal para Crear Evento (T-044) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Evento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false}>
              <View style={styles.modalBody}>
                {/* Nombre */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Nombre del evento *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Ej: Torneo de Fútbol Infantil"
                    placeholderTextColor={colors.textSecondary}
                    value={nombre}
                    onChangeText={setNombre}
                  />
                </View>

                {/* Fecha */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Fecha (YYYY-MM-DD) *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="2026-09-01"
                    placeholderTextColor={colors.textSecondary}
                    value={fecha}
                    onChangeText={setFecha}
                  />
                </View>

                {/* Hora */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Hora (HH:MM)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="18:00"
                    placeholderTextColor={colors.textSecondary}
                    value={hora}
                    onChangeText={setHora}
                  />
                </View>

                {/* Descripción */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Descripción</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMultiline]}
                    placeholder="Detalles sobre el evento..."
                    placeholderTextColor={colors.textSecondary}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {eventError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{eventError}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveModalButton, isCreatingEvent && styles.buttonDisabled]}
                onPress={handleSaveEvent}
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveModalText}>Guardar evento</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visor 360 Panorámico (T-060) */}
      {selectedSector && selectedSector.foto_360_url ? (
        <Visor360Modal
          visible={!!selectedSector}
          onClose={() => setSelectedSector(null)}
          foto360Url={selectedSector.foto_360_url}
          titulo={`Vista 360° · ${selectedSector.nombre}`}
        />
      ) : null}
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
  detailDotsContainer: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  detailDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  detailDotActive: {
    backgroundColor: colors.white,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  imageCounterBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  imageCounterText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.semibold,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  addEventText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
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
    alignItems: 'center',
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
  deleteEventButton: {
    padding: spacing.xs,
  },
  noEventsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
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
  // Modal styles
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
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
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
    minHeight: 60,
    textAlignVertical: 'top',
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
