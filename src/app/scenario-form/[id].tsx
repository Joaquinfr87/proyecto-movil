import { useEffect, useState, useMemo } from 'react';
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
  Modal,
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
import { useScenario } from '../../hooks/useScenarios';
import { useUpsertScenario } from '../../hooks/useManageScenarios';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useSports, useCreateSport, syncScenarioSports } from '../../hooks/useSports';
import { saveScenarioSectors } from '../../utils/sectorTemplates';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

// ─── Categorías estándar de escenarios ──────────────────────────────────────
const STANDARD_TYPES = [
  'Estadio',
  'Coliseo',
  'Cancha',
  'Complejo',
  'Piscina',
  'Gimnasio',
  'Pista',
  'Polideportivo',
];

// ─── Modelos 360 disponibles ────────────────────────────────────────────────
type Sector360Model = 'estadio' | 'coliseo' | 'ninguno';

// ─── Schema de validacion ────────────────────────────────────────────────────
const scenarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').min(3, 'Mínimo 3 caracteres'),
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  descripcion: z.string(),
  capacidad: z.string().min(1, 'La capacidad es obligatoria').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Debe ser un número mayor a 0',
  ),
  direccion: z.string(),
  latitud: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
    'Latitud inválida (-90 a 90)',
  ),
  longitud: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
    'Longitud inválida (-180 a 180)',
  ),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

export default function ScenarioFormScreen() {
  const rawId = useLocalSearchParams<{ id: string }>().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id && id !== 'new');

  const { data: existingScenario, isLoading: isLoadingScenario } = useScenario(
    isEditing ? (id ?? '') : '',
  );
  const { mutateAsync: upsertScenario, isPending: isSaving } = useUpsertScenario();
  const { pickImage, uploadImageUri, deleteScenarioImage, isUploading } = useUploadImage();
  const { data: sportsList, isLoading: isLoadingSports } = useSports();
  const { mutateAsync: createSportMutation, isPending: isCreatingSport } = useCreateSport();

  const [locationLoading, setLocationLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Imágenes seleccionadas localmente pendientes de subida
  const [pendingImageUris, setPendingImageUris] = useState<string[]>([]);
  // Imágenes existentes (al editar)
  const [currentImages, setCurrentImages] = useState<Array<{ id?: string; url: string; storage_path: string }>>([]);

  // Deportes seleccionados (IDs o nombres)
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);

  // Modal para agregar nuevo deporte
  const [newSportModalVisible, setNewSportModalVisible] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [newSportDesc, setNewSportDesc] = useState('');
  const [sportModalError, setSportModalError] = useState<string | null>(null);

  // Modelo de sectores 360 seleccionado
  const [sector360Model, setSector360Model] = useState<Sector360Model>('estadio');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      nombre: '',
      tipo: 'Estadio',
      descripcion: '',
      capacidad: '',
      direccion: '',
      latitud: '',
      longitud: '',
    },
  });

  const selectedTipo = watch('tipo');

  // Precargar datos si estamos editando
  useEffect(() => {
    if (isEditing && existingScenario) {
      reset({
        nombre: existingScenario.nombre ?? '',
        tipo: existingScenario.tipo ?? 'Estadio',
        descripcion: existingScenario.descripcion ?? '',
        capacidad: existingScenario.capacidad ? String(existingScenario.capacidad) : '',
        direccion: existingScenario.direccion ?? '',
        latitud: existingScenario.latitud !== undefined && existingScenario.latitud !== null ? String(existingScenario.latitud) : '',
        longitud: existingScenario.longitud !== undefined && existingScenario.longitud !== null ? String(existingScenario.longitud) : '',
      });

      // Cargar imágenes existentes
      if (existingScenario.scenario_images) {
        setCurrentImages(
          existingScenario.scenario_images.map((img) => ({
            id: (img as any).id,
            url: img.url,
            storage_path: img.storage_path,
          })),
        );
      }

      // Cargar deportes existentes
      if (existingScenario.scenario_sports && sportsList) {
        const matchedIds: string[] = [];
        existingScenario.scenario_sports.forEach((ss) => {
          const match = sportsList.find(
            (sp) => sp.nombre.toLowerCase() === ss.sports?.nombre?.toLowerCase(),
          );
          if (match?.id) matchedIds.push(match.id);
        });
        setSelectedSportIds(matchedIds);
      }

      // Configurar modelo 360 según tipo existente
      if (existingScenario.tipo?.toLowerCase().includes('estadio')) {
        setSector360Model('estadio');
      } else if (existingScenario.tipo?.toLowerCase().includes('coliseo')) {
        setSector360Model('coliseo');
      }
    }
  }, [isEditing, existingScenario, reset, sportsList]);

  // Selección rápida de tipo con chips
  const handleSelectTipo = (tipo: string) => {
    setValue('tipo', tipo, { shouldValidate: true, shouldDirty: true });
    // Ajustar sugerencia de modelo 360 si es estadio o coliseo
    if (tipo.toLowerCase().includes('estadio')) {
      setSector360Model('estadio');
    } else if (tipo.toLowerCase().includes('coliseo')) {
      setSector360Model('coliseo');
    }
  };

  // Manejar selección de deporte
  const handleToggleSport = (sportId: string) => {
    setSelectedSportIds((prev) =>
      prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId],
    );
  };

  // Crear nuevo deporte
  const handleCreateNewSport = async () => {
    if (!newSportName.trim()) {
      setSportModalError('Ingresa el nombre del deporte');
      return;
    }
    setSportModalError(null);
    try {
      const created = await createSportMutation({
        nombre: newSportName.trim(),
        descripcion: newSportDesc.trim(),
      });
      if (created?.id) {
        setSelectedSportIds((prev) => [...prev, created.id]);
      }
      setNewSportName('');
      setNewSportDesc('');
      setNewSportModalVisible(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar deporte';
      setSportModalError(msg);
    }
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

  const handleDeleteCurrentImage = async (imageId?: string, storagePath?: string) => {
    if (!imageId && !storagePath) return;

    const performDelete = async () => {
      await deleteScenarioImage(storagePath, imageId);
      setCurrentImages((prev) =>
        prev.filter((img) => (storagePath ? img.storage_path !== storagePath : img.id !== imageId)),
      );
      if (id && id !== 'new') {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['scenario', id] }),
          queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
          queryClient.invalidateQueries({ queryKey: ['all-scenarios'] }),
        ]);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar esta imagen del escenario?')) {
        await performDelete();
      }
    } else {
      Alert.alert('Eliminar imagen', '¿Deseas eliminar esta imagen?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

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

      setValue('latitud', String(location.coords.latitude.toFixed(6)), { shouldValidate: true });
      setValue('longitud', String(location.coords.longitude.toFixed(6)), { shouldValidate: true });
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
      // 1. Guardar o actualizar escenario
      const result = await upsertScenario({
        ...(isEditing && id ? { id } : {}),
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        descripcion: data.descripcion?.trim() ?? '',
        capacidad: Number(data.capacidad),
        direccion: data.direccion?.trim() ?? '',
        latitud: data.latitud ? Number(data.latitud) : 0,
        longitud: data.longitud ? Number(data.longitud) : 0,
        estado: isEditing && existingScenario?.estado ? existingScenario.estado : 'activo',
        created_by: isEditing ? (existingScenario?.created_by ?? null) : (user?.id ?? null),
      });

      const scenarioId = result?.id ?? id;

      if (!scenarioId) {
        throw new Error('No se pudo obtener el identificador del escenario');
      }

      // 2. Subir imágenes pendientes si hay
      if (pendingImageUris.length > 0) {
        for (const uri of pendingImageUris) {
          await uploadImageUri(scenarioId, uri);
        }
      }

      // 3. Sincronizar deportes
      if (selectedSportIds.length > 0) {
        await syncScenarioSports(scenarioId, selectedSportIds);
      }

      // 4. Guardar plantilla 360° / Sectores si corresponde
      if (sector360Model !== 'ninguno') {
        await saveScenarioSectors(scenarioId, sector360Model);
      }

      // 5. Invalidar cachés
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
        queryClient.invalidateQueries({ queryKey: ['all-scenarios'] }),
        queryClient.invalidateQueries({ queryKey: ['scenario', scenarioId] }),
        queryClient.invalidateQueries({ queryKey: ['favorites'] }),
      ]);

      const successMsg = isEditing
        ? 'Escenario actualizado correctamente.'
        : 'Escenario creado exitosamente.';

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
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

          {/* Tipo / Categoría */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Tipo de escenario *</Text>
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
                  testID="scenario-tipo-input"
                />
              )}
            />
            {errors.tipo && <Text style={styles.errorText}>{errors.tipo.message}</Text>}
          </View>

          {/* Deportes disponibles */}
          <View style={styles.fieldWrapper}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Deportes vinculados</Text>
              <TouchableOpacity
                style={styles.addSportButton}
                onPress={() => setNewSportModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={14} color={colors.primary} />
                <Text style={styles.addSportButtonText}>Nuevo deporte</Text>
              </TouchableOpacity>
            </View>

            {isLoadingSports ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 6 }} />
            ) : (
              <View style={styles.sportsChipsWrapper}>
                {sportsList && sportsList.map((sport) => {
                  const isSelected = selectedSportIds.includes(sport.id);
                  return (
                    <TouchableOpacity
                      key={sport.id}
                      style={[styles.sportChip, isSelected && styles.sportChipActive]}
                      onPress={() => handleToggleSport(sport.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={14}
                        color={isSelected ? colors.white : colors.textSecondary}
                      />
                      <Text style={[styles.sportChipText, isSelected && styles.sportChipTextActive]}>
                        {sport.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Modelo 360° / Sectores interactivos */}
          <View style={styles.fieldWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="globe-outline" size={16} color={colors.primary} />
              <Text style={styles.labelNoMargin}>Modelo de Sectores y Visor 360°</Text>
            </View>
            <Text style={styles.fieldHelpText}>
              Configura automáticamente los sectores con visor panorámico 360° para este escenario:
            </Text>

            <View style={styles.sectorModelRow}>
              <TouchableOpacity
                style={[
                  styles.modelOptionCard,
                  sector360Model === 'estadio' && styles.modelOptionCardActive,
                ]}
                onPress={() => setSector360Model('estadio')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="football"
                  size={20}
                  color={sector360Model === 'estadio' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.modelOptionTitle,
                    sector360Model === 'estadio' && styles.modelOptionTitleActive,
                  ]}
                >
                  Estadio Estándar
                </Text>
                <Text style={styles.modelOptionSubtitle}>5 sectores 360°</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modelOptionCard,
                  sector360Model === 'coliseo' && styles.modelOptionCardActive,
                ]}
                onPress={() => setSector360Model('coliseo')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="basketball"
                  size={20}
                  color={sector360Model === 'coliseo' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.modelOptionTitle,
                    sector360Model === 'coliseo' && styles.modelOptionTitleActive,
                  ]}
                >
                  Coliseo Cerrado
                </Text>
                <Text style={styles.modelOptionSubtitle}>3 sectores 360°</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modelOptionCard,
                  sector360Model === 'ninguno' && styles.modelOptionCardActive,
                ]}
                onPress={() => setSector360Model('ninguno')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={sector360Model === 'ninguno' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.modelOptionTitle,
                    sector360Model === 'ninguno' && styles.modelOptionTitleActive,
                  ]}
                >
                  Sin modelo 360°
                </Text>
                <Text style={styles.modelOptionSubtitle}>Desactivado</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Subida y Previsualización de Imágenes */}
          <View style={styles.fieldWrapper}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Imágenes del escenario</Text>
              <Text style={styles.counterText}>
                {currentImages.length + pendingImageUris.length} fotos
              </Text>
            </View>

            {/* Lista horizontal de imágenes cargadas / pendientes */}
            {(currentImages.length > 0 || pendingImageUris.length > 0) && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePreviewsContainer}>
                {/* Imágenes existentes */}
                {currentImages.map((img, idx) => (
                  <View key={`cur-${idx}`} style={styles.imagePreviewBox}>
                    <Image source={{ uri: img.url }} style={styles.previewImage} contentFit="cover" />
                    <View style={styles.previewBadge}>
                      <Text style={styles.previewBadgeText}>Guardada</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteImageBtn}
                      onPress={() => handleDeleteCurrentImage(img.id, img.storage_path)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Imágenes nuevas seleccionadas pendientes */}
                {pendingImageUris.map((uri, idx) => (
                  <View key={`pend-${idx}`} style={styles.imagePreviewBox}>
                    <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
                    <View style={[styles.previewBadge, styles.previewBadgeNew]}>
                      <Text style={styles.previewBadgeText}>Nueva</Text>
                    </View>
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

            {/* Botón para seleccionar imagen */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>
                    {pendingImageUris.length > 0 || currentImages.length > 0
                      ? 'Agregar otra imagen'
                      : 'Seleccionar imagen desde galería'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
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
            <Text style={styles.label}>Capacidad de espectadores *</Text>
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
                  placeholder="Ej: Av. Libertador Simón Bolívar, Zona Cala Cala"
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
              <Text style={styles.label}>Coordenadas GPS</Text>
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
            activeOpacity={0.85}
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

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal para agregar nuevo deporte */}
      <Modal
        visible={newSportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNewSportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Deporte</Text>
              <TouchableOpacity onPress={() => setNewSportModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Nombre del deporte *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Pádel, Raquetbol, Voleibol de Playa"
                placeholderTextColor={colors.textSecondary}
                value={newSportName}
                onChangeText={setNewSportName}
                autoFocus
              />

              <Text style={[styles.label, { marginTop: spacing.sm }]}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                placeholder="Breve descripción..."
                placeholderTextColor={colors.textSecondary}
                value={newSportDesc}
                onChangeText={setNewSportDesc}
                multiline
              />

              {sportModalError && (
                <Text style={[styles.errorText, { marginTop: spacing.xs }]}>{sportModalError}</Text>
              )}

              <TouchableOpacity
                style={[styles.button, { marginTop: spacing.md }, isCreatingSport && styles.buttonDisabled]}
                onPress={handleCreateNewSport}
                disabled={isCreatingSport}
                activeOpacity={0.85}
              >
                {isCreatingSport ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Registrar y Vincular</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  labelNoMargin: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fieldHelpText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sublabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  counterText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
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
  inputSpacedTop: {
    marginTop: spacing.xs,
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
  // Type Chips
  typeChipsContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  typeChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  typeChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  // Sports
  addSportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addSportButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  sportsChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  sportChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  sportChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  // Model 360
  sectorModelRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  modelOptionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  modelOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  modelOptionTitle: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  modelOptionTitleActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  modelOptionSubtitle: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  // Image previews
  imagePreviewsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  imagePreviewBox: {
    width: 100,
    height: 75,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  previewBadgeNew: {
    backgroundColor: colors.primary,
  },
  previewBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: fontWeight.bold,
  },
  deleteImageBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 4,
  },
  uploadButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  // Location
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  modalBody: {
    gap: spacing.xs,
  },
});
