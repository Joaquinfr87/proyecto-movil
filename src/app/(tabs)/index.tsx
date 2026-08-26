import React, { useEffect, useState, memo, useMemo } from 'react';
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

import { Map, Camera, Marker, Callout } from '@maplibre/maplibre-react-native';

const ScenarioMarker = memo(function ScenarioMarker({
  scenario,
  onPress,
}: {
  scenario: Scenario;
  onPress: (id: string) => void;
}) {
  return (
    <Marker
      coordinate={[scenario.longitud, scenario.latitud]}
      key={scenario.id}
    >
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            borderWidth: 2,
            borderColor: colors.white,
          }}
        />
      </View>
      <Callout>
        <TouchableOpacity onPress={() => onPress(scenario.id)}>
          <Text style={{ fontWeight: '600' }}>{scenario.nombre}</Text>
          <Text style={{ fontSize: 12 }}>{scenario.tipo}</Text>
        </TouchableOpacity>
      </Callout>
    </Marker>
  );
});

const ScenarioMap = memo(function ScenarioMap({
  scenarios,
  cameraCenter,
  cameraZoom,
  userLocation,
  onPressScenario,
}: {
  scenarios: Scenario[];
  cameraCenter: [number, number];
  cameraZoom: number;
  userLocation: Location.LocationObject | null;
  onPressScenario: (id: string) => void;
}) {
  const initialViewState = useMemo(
    () => ({
      centerCoordinate: cameraCenter,
      zoomLevel: cameraZoom,
    }),
    [cameraCenter[0], cameraCenter[1], cameraZoom],
  );

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle="https://demotiles.maplibre.org/style.json"
        logo={false}
      >
        <Camera initialViewState={initialViewState} />

        {scenarios.map((scenario) => (
          <ScenarioMarker
            key={scenario.id}
            scenario={scenario}
            onPress={onPressScenario}
          />
        ))}

        {userLocation && (
          <Marker
            coordinate={[
              userLocation.coords.longitude,
              userLocation.coords.latitude,
            ]}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: colors.secondary,
                borderWidth: 2,
                borderColor: colors.white,
              }}
            />
          </Marker>
        )}
      </Map>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {scenarios.length} escenarios encontrados
        </Text>
      </View>
    </View>
  );
});
const BOLIVIA_CENTER = {
  latitude: -17.0,
  longitude: -65.0,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function MapScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [cameraState, setCameraState] = useState({
    centerCoordinate: [BOLIVIA_CENTER.longitude, BOLIVIA_CENTER.latitude] as [number, number],
    zoomLevel: 5,
  });
  const [locationLoading, setLocationLoading] = useState(true);

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

        // Centrar mapa en la ubicacion del usuario
        setCameraState({
          centerCoordinate: [
            location.coords.longitude,
            location.coords.latitude,
          ],
          zoomLevel: 14,
        });
      } catch {
        // Si falla la ubicacion, usar region por defecto (Bolivia)
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Estado de carga
  if (isLoading || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  // Estado de error
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
    <View style={{ flex: 1 }}>
      <ScenarioMap
        scenarios={scenarios!}
        cameraCenter={cameraState.centerCoordinate}
        cameraZoom={cameraState.zoomLevel}
        userLocation={userLocation}
        onPressScenario={(id) => router.push(`/scenario/${id}`)}
      />
      {renderUpcomingEventsSection()}
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
