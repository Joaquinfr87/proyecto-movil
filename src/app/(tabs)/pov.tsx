import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCommunityScenarios } from '../../hooks/useCommunityScenarios';
import { Scenario } from '../../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

import {
  Map,
  Camera,
  type CameraRef,
  Marker,
} from '../../components/map/MapLibreView';
import { WebMapLibre } from '../../components/map/WebMapLibre';

const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_API_KEY}`;

// Color diferenciado para marcadores comunitarios
const COMMUNITY_COLOR = '#EF4444';

const BOLIVIA_CENTER = {
  latitude: -17.0,
  longitude: -65.0,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function PovScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraRef>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Cargar solo escenarios comunitarios
  const {
    data: scenarios,
    isLoading,
    error,
    refetch,
  } = useCommunityScenarios();

  // Obtener ubicación del usuario (solo en nativo)
  useEffect(() => {
    if (Platform.OS === 'web') {
      setLocationLoading(false);
      return;
    }

    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation(location);
      } catch {
        // Si falla la ubicación, usar región por defecto (Bolivia)
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Centrar mapa en la ubicación del usuario cuando se obtiene
  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.flyTo({
        center: [
          userLocation.coords.longitude,
          userLocation.coords.latitude,
        ],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [userLocation, locationLoading]);

  // Si no hay ubicación pero hay escenarios, ajustar cámara a todos los marcadores
  useEffect(() => {
    if (!userLocation && !locationLoading && scenarios && scenarios.length > 0 && cameraRef.current) {
      const lons = scenarios.map((s) => s.longitud);
      const lats = scenarios.map((s) => s.latitud);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ];
      cameraRef.current.fitBounds(bounds, [60, 60, 60, 60], 1000);
    }
  }, [locationLoading, scenarios]);

  // Función para centrar mapa en ubicación del usuario (botón)
  const requestAndCenterLocation = async () => {
    if (locationRequesting) return;
    setLocationRequesting(true);
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);
      if (cameraRef.current) {
        cameraRef.current.flyTo({
          center: [location.coords.longitude, location.coords.latitude],
          zoom: 14,
          duration: 1500,
        });
      }
    } catch {
      // Silenciar error
    } finally {
      setLocationRequesting(false);
    }
  };

  // Centrar cámara en escenario seleccionado
  useEffect(() => {
    if (selectedScenario && cameraRef.current) {
      cameraRef.current.flyTo({
        center: [selectedScenario.longitud, selectedScenario.latitud],
        zoom: 15,
        duration: 800,
      });
    }
  }, [selectedScenario]);

  // Navegar al formulario de creación POV con ubicación actual
  const handleCreatePov = async () => {
    let lat = '';
    let lng = '';

    if (userLocation) {
      lat = userLocation.coords.latitude.toFixed(6);
      lng = userLocation.coords.longitude.toFixed(6);
    } else {
      // Intentar obtener ubicación antes de navegar
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = location.coords.latitude.toFixed(6);
          lng = location.coords.longitude.toFixed(6);
          setUserLocation(location);
        }
      } catch {
        // Continuar sin ubicación — el formulario intentará obtenerla
      }
    }

    router.push(`/pov-form/new?lat=${lat}&lng=${lng}` as any);
  };

  // Solo bloquear si la query de escenarios falló
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error al cargar puntos</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          Toca para reintentar
        </Text>
      </View>
    );
  }

  // --- Web: Mapa interactivo MapTiler con MapLibre GL ---
  if (Platform.OS === 'web') {
    const mapTilerKey = process.env.EXPO_PUBLIC_MAPTILER_API_KEY || '';

    return (
      <View style={styles.container}>
        <WebMapLibre
          scenarios={scenarios ?? []}
          apiKey={mapTilerKey}
          onScenarioSelect={(scenario) => router.push(`/scenario/${scenario.id}`)}
          onMarkerClick={(scenario) => setSelectedScenario(scenario)}
        />

        {/* Card flotante de escenario seleccionado */}
        {selectedScenario && (
          <TouchableOpacity
            style={styles.scenarioCard}
            activeOpacity={0.95}
            onPress={() => router.push(`/scenario/${selectedScenario.id}`)}
          >
            <View style={styles.scenarioCardContent}>
              <View style={styles.scenarioCardInfo}>
                <View style={styles.communityBadge}>
                  <Ionicons name="people" size={10} color={colors.white} />
                  <Text style={styles.communityBadgeText}>Comunidad</Text>
                </View>
                <Text style={styles.scenarioCardTitle}>
                  {selectedScenario.nombre}
                </Text>
                <Text style={styles.scenarioCardType}>
                  {selectedScenario.tipo}
                </Text>
              </View>
              <View style={styles.scenarioCardButton}>
                <Text style={styles.scenarioCardButtonText}>Ir</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.scenarioCardClose}
              onPress={() => setSelectedScenario(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Indicador de cantidad de puntos comunitarios */}
        <View style={styles.infoBar}>
          <Ionicons name="people-outline" size={16} color={COMMUNITY_COLOR} />
          <Text style={styles.infoText}>
            {scenarios?.length ?? 0} puntos de la comunidad
          </Text>
        </View>

        {/* FAB: Crear nuevo punto POV */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePov}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>

        {/* Overlay de carga */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COMMUNITY_COLOR} />
            <Text style={styles.loadingOverlayText}>Cargando mapa...</Text>
          </View>
        )}
      </View>
    );
  }

  // --- Native: Mapa real ---
  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        compass
        compassPosition={{ top: 120, right: spacing.md }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            centerCoordinate: [
              BOLIVIA_CENTER.longitude,
              BOLIVIA_CENTER.latitude,
            ],
            zoomLevel: 5,
          }}
        />

        {/* Marcadores de escenarios comunitarios */}
        {scenarios?.map((scenario) => (
          <Marker
            key={scenario.id}
            id={scenario.id}
            lngLat={[scenario.longitud, scenario.latitud]}
            onPress={() => setSelectedScenario(scenario)}
          >
            <View style={styles.markerWrapper}>
              <View style={styles.markerPin}>
                <Ionicons name="people" size={16} color={colors.white} />
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker
            lngLat={[
              userLocation.coords.longitude,
              userLocation.coords.latitude,
            ]}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
      </Map>

      {/* Card de escenario seleccionado */}
      {selectedScenario && (
        <TouchableOpacity
          style={styles.scenarioCard}
          activeOpacity={0.95}
          onPress={() => router.push(`/scenario/${selectedScenario.id}`)}
        >
          <View style={styles.scenarioCardContent}>
            <View style={styles.scenarioCardInfo}>
              <View style={styles.communityBadge}>
                <Ionicons name="people" size={10} color={colors.white} />
                <Text style={styles.communityBadgeText}>Comunidad</Text>
              </View>
              <Text style={styles.scenarioCardTitle}>
                {selectedScenario.nombre}
              </Text>
              <Text style={styles.scenarioCardType}>
                {selectedScenario.tipo}
              </Text>
            </View>
            <View style={[styles.scenarioCardButton, { backgroundColor: COMMUNITY_COLOR }]}>
              <Text style={styles.scenarioCardButtonText}>Ir</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.scenarioCardClose}
            onPress={() => setSelectedScenario(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Botón de ubicación estilo Google Maps */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={requestAndCenterLocation}
        activeOpacity={0.8}
      >
        {locationRequesting ? (
          <ActivityIndicator size="small" color={COMMUNITY_COLOR} />
        ) : (
          <Ionicons name="locate" size={22} color={COMMUNITY_COLOR} />
        )}
      </TouchableOpacity>

      {/* Indicador de cantidad de puntos comunitarios */}
      <View style={styles.infoBar}>
        <Ionicons name="people-outline" size={16} color={COMMUNITY_COLOR} />
        <Text style={styles.infoText}>
          {scenarios?.length ?? 0} puntos de la comunidad
        </Text>
      </View>

      {/* FAB: Crear nuevo punto POV */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePov}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Overlay de carga (ubicación o escenarios) */}
      {(isLoading || locationLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COMMUNITY_COLOR} />
          <Text style={styles.loadingOverlayText}>
            {locationLoading ? 'Obteniendo ubicación...' : 'Cargando mapa...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COMMUNITY_COLOR,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COMMUNITY_COLOR,
    marginTop: -2,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COMMUNITY_COLOR,
    borderWidth: 2,
    borderColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingOverlayText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  retryText: {
    fontSize: fontSize.md,
    color: COMMUNITY_COLOR,
    textDecorationLine: 'underline',
  },
  infoBar: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  infoText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  locationButton: {
    position: 'absolute',
    bottom: 96,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  scenarioCard: {
    position: 'absolute',
    bottom: 80,
    left: spacing.md,
    right: 68,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scenarioCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  scenarioCardInfo: {
    flex: 1,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COMMUNITY_COLOR,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginBottom: 4,
  },
  communityBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: fontWeight.semibold,
  },
  scenarioCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scenarioCardType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scenarioCardButton: {
    backgroundColor: COMMUNITY_COLOR,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scenarioCardButtonText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  scenarioCardClose: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COMMUNITY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
