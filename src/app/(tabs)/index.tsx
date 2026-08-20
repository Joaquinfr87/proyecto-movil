import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useScenarios } from '../../hooks/useScenarios';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY!;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`;

const BOLIVIA_CENTER: [number, number] = [-65.0, -17.0];

export default function MapScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationLoading, setLocationLoading] = useState(true);

  const { data: scenarios, isLoading, error, refetch } = useScenarios();

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

        setUserLocation([location.coords.longitude, location.coords.latitude]);
      } catch {
        // Si falla la ubicacion, usar region por defecto (Bolivia)
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const cameraCenter = userLocation ?? BOLIVIA_CENTER;
  const cameraZoom = userLocation ? 14 : 5;

  if (isLoading || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

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

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>Escenarios deportivos</Text>
        <Text style={styles.webSubtitle}>
          {scenarios?.length ?? 0} escenarios encontrados
        </Text>
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

  return (
    <View style={styles.container}>
      <Map mapStyle={MAP_STYLE} style={styles.map}>
        <Camera
          initialViewState={{
            center: cameraCenter,
            zoom: cameraZoom,
          }}
        />

        {scenarios?.map((scenario) => (
          <Marker
            key={scenario.id}
            id={scenario.id}
            lngLat={[scenario.longitud, scenario.latitud]}
            onPress={() => router.push(`/scenario/${scenario.id}`)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot} />
            </View>
          </Marker>
        ))}

        {userLocation && (
          <Marker
            id="user-location"
            lngLat={userLocation}
            anchor="center"
          >
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerDot} />
              <View style={styles.userMarkerRing} />
            </View>
          </Marker>
        )}
      </Map>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {scenarios?.length ?? 0} escenarios encontrados
        </Text>
      </View>
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  userMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.white,
    zIndex: 2,
  },
  userMarkerRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${colors.secondary}30`,
    zIndex: 1,
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
