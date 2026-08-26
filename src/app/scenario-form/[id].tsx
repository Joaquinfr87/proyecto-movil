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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Location from 'expo-location';

import { useAuth } from '../../context/AuthContext';
import { useScenario } from '../../hooks/useScenarios';
import { useUpsertScenario } from '../../hooks/useManageScenarios';
import { useUploadImage } from '../../hooks/useUploadImage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

// ─── Schema de validacion ────────────────────────────────────────────────────

const scenarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').min(3, 'Mínimo 3 caracteres'),
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  descripcion: z.string().optional().default(''),
  capacidad: z.string().min(1, 'La capacidad es obligatoria').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Debe ser un número mayor a 0',
  ),
  direccion: z.string().optional().default(''),
  latitud: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
    'Latitud inválida (-90 a 90)',
  ).optional().default(''),
  longitud: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
    'Longitud inválida (-180 a 180)',
  ).optional().default(''),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ScenarioFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isEditing = id !== 'new';

  const { data: existingScenario, isLoading: isLoadingScenario } = useScenario(
    isEditing ? (id ?? '') : '',
  );
  const { mutateAsync: upsertScenario, isPending: isSaving } = useUpsertScenario();

  const [locationLoading, setLocationLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdScenarioId, setCreatedScenarioId] = useState<string | null>(null);
  const { uploadImage, isUploading } = useUploadImage();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      nombre: '',
      tipo: '',
      descripcion: '',
      capacidad: '',
      direccion: '',
      latitud: '',
      longitud: '',
    },
  });

  // Precargar datos si estamos editando
  useEffect(() => {
    if (isEditing && existingScenario) {
      reset({
        nombre: existingScenario.nombre,
        tipo: existingScenario.tipo,
        descripcion: existingScenario.descripcion ?? '',
        capacidad: String(existingScenario.capacidad),
        direccion: existingScenario.direccion ?? '',
        latitud: String(existingScenario.latitud),
        longitud: String(existingScenario.longitud),
      });
    }
  }, [isEditing, existingScenario, reset]);

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const message = 'Se necesita permiso de ubicación para usar esta función.';
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('Permiso denegado', message);
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setValue('latitud', String(location.coords.latitude.toFixed(6)));
      setValue('longitud', String(location.coords.longitude.toFixed(6)));
    } catch {
      const message = 'No se pudo obtener la ubicación. Intenta de nuevo.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const onSubmit = async (data: ScenarioFormData) => {
    setServerError(null);

    try {
      const result = await upsertScenario({
        ...(isEditing && id ? { id } : {}),
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        descripcion: data.descripcion?.trim() ?? '',
        capacidad: Number(data.capacidad),
        direccion: data.direccion?.trim() ?? '',
        latitud: data.latitud ? Number(data.latitud) : 0,
        longitud: data.longitud ? Number(data.longitud) : 0,
        estado: 'activo',
        created_by: isEditing ? undefined : (user?.id ?? null),
      });

      // Guardar el ID del escenario creado para poder subir imágenes
      const scenarioId = result?.id ?? id;
      if (scenarioId) {
        setCreatedScenarioId(scenarioId);
      }

      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al guardar';
      setServerError(message);
    }
  };

  if (isEditing && isLoadingScenario) {
    return <LoadingSpinner message="Cargando escenario..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header con botón volver */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Editar escenario' : 'Nuevo escenario'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Nombre *</Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  placeholder="Ej: Estadio Hernando Siles"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  testID="scenario-nombre-input"
                />
              )}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}
          </View>

          {/* Tipo */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Tipo *</Text>
            <Controller
              control={control}
              name="tipo"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.tipo && styles.inputError]}
                  placeholder="Ej: estadio, cancha, coliseo, complejo"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  testID="scenario-tipo-input"
                />
              )}
            />
            {errors.tipo && <Text style={styles.errorText}>{errors.tipo.message}</Text>}
          </View>

          {/* Descripcion */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Descripción</Text>
            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Descripción del escenario deportivo"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  testID="scenario-descripcion-input"
                />
              )}
            />
          </View>

          {/* Capacidad */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Capacidad *</Text>
            <Controller
              control={control}
              name="capacidad"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.capacidad && styles.inputError]}
                  placeholder="Ej: 5000"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  testID="scenario-capacidad-input"
                />
              )}
            />
            {errors.capacidad && <Text style={styles.errorText}>{errors.capacidad.message}</Text>}
          </View>

          {/* Direccion */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Dirección</Text>
            <Controller
              control={control}
              name="direccion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input]}
                  placeholder="Ej: Av. del Ejercito 123"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="scenario-direccion-input"
                />
              )}
            />
          </View>

          {/* Ubicación */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Ubicación</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleUseMyLocation}
                disabled={locationLoading}
                activeOpacity={0.7}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                    <Text style={styles.locationButtonText}>Usar mi ubicación</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.locationFields}>
              {/* Latitud */}
              <View style={[styles.fieldWrapper, styles.locationField]}>
                <Text style={styles.sublabel}>Latitud</Text>
                <Controller
                  control={control}
                  name="latitud"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.latitud && styles.inputError]}
                      placeholder="-17.3895"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      testID="scenario-latitud-input"
                    />
                  )}
                />
                {errors.latitud && <Text style={styles.errorText}>{errors.latitud.message}</Text>}
              </View>

              {/* Longitud */}
              <View style={[styles.fieldWrapper, styles.locationField]}>
                <Text style={styles.sublabel}>Longitud</Text>
                <Controller
                  control={control}
                  name="longitud"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.longitud && styles.inputError]}
                      placeholder="-66.1568"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      testID="scenario-longitud-input"
                    />
                  )}
                />
                {errors.longitud && <Text style={styles.errorText}>{errors.longitud.message}</Text>}
              </View>
            </View>
          </View>

          {/* Subir imágenes (solo al editar) */}
          {isEditing && id && (
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Imágenes</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={async () => {
                  const result = await uploadImage(id);
                  if (result) {
                    Alert.alert('Éxito', 'Imagen subida correctamente.');
                  }
                }}
                disabled={isUploading}
                activeOpacity={0.7}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={20} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Agregar imagen</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Error del servidor */}
          {serverError && (
            <View style={styles.serverErrorBox}>
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          )}

          {/* Botón guardar */}
          <TouchableOpacity
            style={[styles.button, (isSubmitting || isSaving) && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || isSaving}
            testID="scenario-submit-button"
          >
            {isSubmitting || isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isEditing ? 'Guardar cambios' : 'Crear escenario'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
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
  form: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  fieldWrapper: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sublabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: spacing.sm + 4,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  locationSection: {
    marginBottom: spacing.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  locationButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  locationFields: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locationField: {
    flex: 1,
    marginBottom: 0,
  },
  serverErrorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  serverErrorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  uploadButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
