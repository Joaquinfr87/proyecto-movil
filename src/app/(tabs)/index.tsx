import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useUpcomingEvents } from '../../hooks/useEvents';
import { Scenario } from '../../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

import {
  Map,
  Camera,
  type CameraRef,
  Marker,
} from '@maplibre/maplibre-react-native';

const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_API_KEY}`;

// Region inicial: centro de Bolivia
const BOLIVIA_CENTER = {
  latitude: -17.0,
  longitude: -65.0,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function MapScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraRef>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // T-023: Cargar escenarios desde Supabase
  const {
    data: scenarios,
    isLoading,
    error,
    refetch,
  } = useQuery<Scenario[]>({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('estado', 'activo');

      if (error) throw error;
      return data as Scenario[];
    },
  });

  // T-045: Próximos eventos
  const { data: upcomingEvents } = useUpcomingEvents();

  // T-024: Obtener ubicacion del usuario (solo en nativo)
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
        // Si falla la ubicacion, usar region por defecto (Bolivia)
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Centrar mapa en la ubicacion del usuario cuando se obtiene
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

  // Si no hay ubicacion pero hay escenarios, ajustar camara a todos los marcadores
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

  // Funcion para centrar mapa en ubicacion del usuario (boton)
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

  // Centrar camara en escenario seleccionado
  useEffect(() => {
    if (selectedScenario && cameraRef.current) {
      cameraRef.current.flyTo({
        center: [selectedScenario.longitud, selectedScenario.latitud],
        zoom: 15,
        duration: 800,
      });
    }
  }, [selectedScenario]);

  // Solo bloquear si la query de escenarios fallo
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error al cargar escenarios</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          Toca para reintentar
        </Text>
      </View>
    );
  }

  // Componente de carrusel/lista de próximos eventos (T-045)
  const renderUpcomingEventsSection = () => {
    if (!upcomingEvents || upcomingEvents.length === 0) return null;

    return (
      <View style={styles.eventsOverlay}>
        <View style={styles.eventsHeaderRow}>
          <Ionicons name="flash-outline" size={16} color={colors.primary} />
          <Text style={styles.eventsTitle}>Próximos eventos</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsScrollList}
        >
          {upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCardItem}
              onPress={() => router.push(`/scenario/${event.scenario_id}`)}
              activeOpacity={0.85}
            >
              <View style={styles.eventBadge}>
                <Ionicons name="calendar" size={12} color={colors.white} />
                <Text style={styles.eventBadgeText}>{event.fecha}</Text>
              </View>

              <Text style={styles.eventCardName} numberOfLines={1}>
                {event.nombre}
              </Text>

              {event.scenarios?.nombre ? (
                <Text style={styles.eventScenarioName} numberOfLines={1}>
                  📍 {event.scenarios.nombre}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // --- Web fallback: lista de escenarios ---
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>Escenarios deportivos</Text>
        <Text style={styles.webSubtitle}>
          {scenarios?.length ?? 0} escenarios encontrados
        </Text>

        {/* Seccion Próximos Eventos en Web */}
        {renderUpcomingEventsSection()}

        <FlatList
          data={scenarios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.webList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.webCard}
              onPress={() => router.push(`/scenario/${item.id}`)}
            >
              <Text style={styles.webCardTitle}>{item.nombre}</Text>
              <Text style={styles.webCardType}>{item.tipo}</Text>
              <Text style={styles.webCardDir}>{item.direccion}</Text>
            </TouchableOpacity>
          )}
        />
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

        {/* Marcadores de escenarios */}
        {scenarios?.map((scenario) => (
          <Marker
            key={scenario.id}
            id={scenario.id}
            lngLat={[scenario.longitud, scenario.latitud]}
            onPress={() => setSelectedScenario(scenario)}
          >
            <View style={styles.markerWrapper}>
              <View style={styles.markerPin}>
                <Ionicons name="location" size={18} color={colors.white} />
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}

        {/* T-024: Marcador de ubicacion del usuario */}
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

      {/* Boton de ubicacion estilo Google Maps */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={requestAndCenterLocation}
        activeOpacity={0.8}
      >
        {locationRequesting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={22} color={colors.primary} />
        )}
      </TouchableOpacity>

      {/* T-045: Overlay Próximos Eventos */}
      {renderUpcomingEventsSection()}

      {/* Indicador de cantidad de escenarios */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {scenarios?.length ?? 0} escenarios encontrados
        </Text>
      </View>

      {/* Overlay de carga (ubicacion o escenarios) */}
      {(isLoading || locationLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: colors.primary,
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
    borderTopColor: colors.primary,
    marginTop: -2,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  // T-045: Upcoming Events section overlay
  eventsOverlay: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  eventsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  eventsTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventsScrollList: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  eventCardItem: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
    maxWidth: 200,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginBottom: 4,
  },
  eventBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  eventCardName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  eventScenarioName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
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
    backgroundColor: colors.primary,
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
  // Web fallback styles
  webContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  webTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  webSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  webList: {
    paddingBottom: spacing.xl,
    marginTop: spacing.md,
  },
  webCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  webCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  webCardType: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  webCardDir: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
