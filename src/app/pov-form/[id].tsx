import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Location from 'expo-location';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../context/AuthContext';
import { useCreateCommunityScenario } from '../../hooks/useCommunityScenarios';
import { useUploadImage } from '../../hooks/useUploadImage';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

// Color temático POV
const POV_COLOR = '#EF4444';

// ─── Categorías estándar de escenarios ──────────────────────────────────────
const STANDARD_TYPES = [
  'Cancha',
  'Pista',
  'Parque',
  'Gimnasio',
  'Complejo',
  'Estadio',
  'Coliseo',
  'Polideportivo',
];

// ─── Schema de validación ────────────────────────────────────────────────────
const povSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').min(3, 'Mínimo 3 caracteres'),
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  descripcion: z.string(),
  capacidad: z.string().min(1, 'La capacidad es obligatoria').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Debe ser un número mayor a 0',
  ),
  direccion: z.string(),
});

type PovFormData = z.infer<typeof povSchema>;

export default function PovFormScreen() {
  const rawId = useLocalSearchParams<{ id: string; lat?: string; lng?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutateAsync: createScenario, isPending: isSaving } = useCreateCommunityScenario();
  const { pickImage, uploadImageUri, isUploading } = useUploadImage();

  const [locationLoading, setLocationLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>(rawId.lat ?? '');
  const [longitude, setLongitude] = useState<string>(rawId.lng ?? '');
  const [locationObtained, setLocationObtained] = useState(
    Boolean(rawId.lat && rawId.lng && rawId.lat !== '' && rawId.lng !== ''),
  );

  // Imágenes seleccionadas localmente pendientes de subida
  const [pendingImageUris, setPendingImageUris] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PovFormData>({
    resolver: zodResolver(povSchema),
    defaultValues: {
      nombre: '',
      tipo: 'Cancha',
      descripcion: '',
      capacidad: '',
      direccion: '',
    },
  });

  const selectedTipo = watch('tipo');

  // Obtener ubicación GPS si no se recibió por parámetros
  useEffect(() => {
    if (locationObtained) return;

    (async () => {
      setLocationLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          const message = 'Se necesita permiso de ubicación para crear un punto POV.';
          if (Platform.OS === 'web') {
            window.alert(message);
          } else {
            Alert.alert('Permiso denegado', message);
          }
          router.back();
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLatitude(location.coords.latitude.toFixed(6));
        setLongitude(location.coords.longitude.toFixed(6));
        setLocationObtained(true);
      } catch {
        const message = 'No se pudo obtener tu ubicación. Intenta de nuevo.';
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('Error', message);
        }
        router.back();
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Refrescar ubicación GPS
  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude.toFixed(6));
      setLongitude(location.coords.longitude.toFixed(6));
      setLocationObtained(true);
    } catch {
      const message = 'No se pudo actualizar la ubicación.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // Selección rápida de tipo con chips
  const handleSelectTipo = (tipo: string) => {
    setValue('tipo', tipo, { shouldValidate: true, shouldDirty: true });
  };

  // Manejar selección de imagen
  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setPendingImageUris((prev) => [...prev, uri]);
    }
  };

  const handleRemovePendingImage = (indexToRemove: number) => {
    setPendingImageUris((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data: PovFormData) => {
    setServerError(null);

    if (!latitude || !longitude) {
      setServerError('No se pudo obtener la ubicación GPS. Es obligatoria para puntos POV.');
      return;
    }

    if (!user?.id) {
      setServerError('Debes estar autenticado para crear un punto.');
      return;
    }

    try {
      // 1. Crear escenario comunitario
      const result = await createScenario({
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        descripcion: data.descripcion?.trim() ?? '',
        capacidad: Number(data.capacidad),
        direccion: data.direccion?.trim() ?? '',
        latitud: Number(latitude),
        longitud: Number(longitude),
        created_by: user.id,
      });

      const scenarioId = result?.id;

      if (!scenarioId) {
        throw new Error('No se pudo obtener el identificador del escenario');
      }

      // 2. Subir imágenes pendientes si hay
      if (pendingImageUris.length > 0) {
        for (const uri of pendingImageUris) {
          await uploadImageUri(scenarioId, uri);
        }
      }

      // 3. Invalidar cachés
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scenarios-community'] }),
        queryClient.invalidateQueries({ queryKey: ['scenarios-map'] }),
        queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
        queryClient.invalidateQueries({ queryKey: ['all-scenarios'] }),
      ]);

      const successMsg = '¡Punto creado! Ya es visible en el mapa POV para toda la comunidad.';

      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('Éxito', successMsg);
      }

      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al guardar';
      setServerError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header con botón volver */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo punto POV</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Banner de ubicación GPS */}
        <View style={styles.locationBanner}>
          <View style={styles.locationBannerContent}>
            <View style={styles.locationIconContainer}>
              {locationLoading ? (
                <ActivityIndicator size="small" color={POV_COLOR} />
              ) : (
                <Ionicons
                  name={locationObtained ? 'location' : 'location-outline'}
                  size={20}
                  color={locationObtained ? POV_COLOR : colors.textSecondary}
                />
              )}
            </View>
            <View style={styles.locationBannerInfo}>
              <Text style={styles.locationBannerTitle}>Ubicación GPS (obligatoria)</Text>
              {locationObtained ? (
                <Text style={styles.locationBannerCoords}>
                  {latitude}, {longitude}
                </Text>
              ) : (
                <Text style={styles.locationBannerPending}>Obteniendo ubicación...</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.refreshLocationBtn}
              onPress={handleRefreshLocation}
              disabled={locationLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={POV_COLOR} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Nombre del lugar *</Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  placeholder="Ej: Canchita del Barrio"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  testID="pov-nombre-input"
                />
              )}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}
          </View>

          {/* Tipo / Categoría */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Tipo de lugar *</Text>
            {/* Chips de selección rápida */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChipsContainer}>
              {STANDARD_TYPES.map((typeOption) => {
                const isSelected = selectedTipo?.toLowerCase() === typeOption.toLowerCase();
                return (
                  <TouchableOpacity
                    key={typeOption}
                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                    onPress={() => handleSelectTipo(typeOption)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                      {typeOption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Controller
              control={control}
              name="tipo"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.inputSpacedTop, errors.tipo && styles.inputError]}
                  placeholder="O ingresa un tipo personalizado..."
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  testID="pov-tipo-input"
                />
              )}
            />
            {errors.tipo && <Text style={styles.errorText}>{errors.tipo.message}</Text>}
          </View>

          {/* Imágenes */}
          <View style={styles.fieldWrapper}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Fotos del lugar</Text>
              <Text style={styles.counterText}>
                {pendingImageUris.length} fotos
              </Text>
            </View>

            {pendingImageUris.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePreviewsContainer}>
                {pendingImageUris.map((uri, idx) => (
                  <View key={`pend-${idx}`} style={styles.imagePreviewBox}>
                    <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.deleteImageBtn}
                      onPress={() => handleRemovePendingImage(idx)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={POV_COLOR} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={20} color={POV_COLOR} />
                  <Text style={styles.uploadButtonText}>
                    {pendingImageUris.length > 0 ? 'Agregar otra foto' : 'Seleccionar foto'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Descripción */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Descripción</Text>
            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Cuéntanos sobre este lugar..."
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  testID="pov-descripcion-input"
                />
              )}
            />
          </View>

          {/* Capacidad */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Capacidad aproximada *</Text>
            <Controller
              control={control}
              name="capacidad"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.capacidad && styles.inputError]}
                  placeholder="Ej: 50"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  testID="pov-capacidad-input"
                />
              )}
            />
            {errors.capacidad && <Text style={styles.errorText}>{errors.capacidad.message}</Text>}
          </View>

          {/* Dirección */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Dirección / Referencia</Text>
            <Controller
              control={control}
              name="direccion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input]}
                  placeholder="Ej: Av. Libertador esq. Calle Jordan"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="pov-direccion-input"
                />
              )}
            />
          </View>

          {/* Error del servidor */}
          {serverError && (
            <View style={styles.serverErrorBox}>
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          )}

          {/* Botón crear */}
          <TouchableOpacity
            style={[styles.button, (isSubmitting || isSaving || !locationObtained) && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || isSaving || !locationObtained}
            testID="pov-submit-button"
            activeOpacity={0.85}
          >
            {isSubmitting || isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="pin-outline" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Crear punto POV</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  // Location Banner
  locationBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.md,
  },
  locationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationBannerInfo: {
    flex: 1,
  },
  locationBannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  locationBannerCoords: {
    fontSize: fontSize.xs,
    color: POV_COLOR,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  locationBannerPending: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  refreshLocationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  // Form
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldWrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: spacing.sm,
  },
  inputSpacedTop: {
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: 2,
  },
  // Type chips
  typeChipsContainer: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: POV_COLOR,
    borderColor: POV_COLOR,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  typeChipTextActive: {
    color: colors.white,
  },
  // Image previews
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  imagePreviewsContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  imagePreviewBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  deleteImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: POV_COLOR,
    borderStyle: 'dashed',
    backgroundColor: '#FEF2F2',
  },
  uploadButtonText: {
    fontSize: fontSize.sm,
    color: POV_COLOR,
    fontWeight: fontWeight.medium,
  },
  // Server error
  serverErrorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  serverErrorText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  // Submit button
  button: {
    backgroundColor: POV_COLOR,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
