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
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Scenario } from '../../types';
import { ErrorState } from '../../components/common/ErrorState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

// react-native-maps solo funciona en plataformas nativas (iOS/Android)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
}

// Region inicial: centro de Bolivia
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
  const [initialRegion, setInitialRegion] = useState(BOLIVIA_CENTER);
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
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
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
      <ErrorState
        icon="map-outline"
        title="Error al cargar el mapa"
        message="No se pudieron cargar los escenarios deportivos. Toca para reintentar."
        onRetry={() => refetch()}
      />
    );
  }

  // --- Web fallback: lista de escenarios ---
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

  // --- Native: Mapa real ---
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Marcadores de escenarios */}
        {scenarios?.map((scenario) => (
          <Marker
            key={scenario.id}
            coordinate={{
              latitude: scenario.latitud,
              longitude: scenario.longitud,
            }}
            title={scenario.nombre}
            description={scenario.tipo}
            pinColor={colors.primary}
            onCalloutPress={() =>
              router.push(`/scenario/${scenario.id}`)
            }
          />
        ))}

        {/* T-024: Marcador de ubicacion del usuario */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Tu ubicacion"
            pinColor={colors.secondary}
          />
        )}
      </MapView>

      {/* Indicador de cantidad de escenarios */}
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
