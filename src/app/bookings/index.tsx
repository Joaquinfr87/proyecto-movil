/**
 * src/app/bookings/index.tsx
 * Pantalla principal: "Mis Reservas"
 * Muestra las reservas del usuario divididas en Próximas e Historial.
 * Soporta modo offline mediante AsyncStorage.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useUserBookings, useCancelBooking } from '../../hooks/useBookings';
import { getCachedActiveBookings } from '../../services/bookingStorage';
import { BookingCard } from '../../components/bookings/BookingCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { ScenarioBooking } from '../../types';

type Tab = 'proximas' | 'historial';

export default function BookingsIndexScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('proximas');
  const [offlineData, setOfflineData] = useState<ScenarioBooking[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useUserBookings(user?.id ?? '');

  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking();

  // Cargar datos desde AsyncStorage si no hay conexión
  useEffect(() => {
    if (isError) {
      setIsOffline(true);
      getCachedActiveBookings().then(setOfflineData);
    } else {
      setIsOffline(false);
    }
  }, [isError]);

  const today = new Date().toISOString().split('T')[0];

  const source = isOffline ? offlineData : (bookings ?? []);
  const proximas = source.filter(
    (b) => b.status === 'confirmada' && b.booking_date >= today,
  );
  const historial = source.filter(
    (b) => b.status !== 'confirmada' || b.booking_date < today,
  );

  const displayList = activeTab === 'proximas' ? proximas : historial;

  const handleCancel = useCallback(
    (booking: ScenarioBooking) => {
      if (Platform.OS === 'web') {
        const reason = prompt(`¿Motivo de cancelación de "${booking.booking_code}"?`) ?? '';
        cancelBooking({ id: booking.id, cancellation_reason: reason }).catch((e) =>
          alert(e.message),
        );
      } else {
        Alert.alert(
          'Cancelar Reserva',
          `¿Estás seguro de cancelar la reserva ${booking.booking_code}?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Sí, cancelar',
              style: 'destructive',
              onPress: () =>
                cancelBooking({ id: booking.id, cancellation_reason: 'Cancelada por el usuario' }).catch(
                  (e) => Alert.alert('Error', e.message),
                ),
            },
          ],
        );
      }
    },
    [cancelBooking],
  );

  if (isLoading) return <LoadingSpinner message="Cargando tus reservas..." />;

  return (
    <View style={styles.container}>
      {/* Banner Offline */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#92400E" />
          <Text style={styles.offlineText}>
            Modo sin conexión — mostrando comprobantes guardados
          </Text>
        </View>
      )}

      {/* Tabs: Próximas / Historial */}
      <View style={styles.tabBar}>
        {(['proximas', 'historial'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'proximas' ? `Próximas (${proximas.length})` : `Historial (${historial.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Reservas */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'proximas' ? 'calendar-outline' : 'time-outline'}
            title={
              activeTab === 'proximas'
                ? 'Sin reservas próximas'
                : 'Sin historial de reservas'
            }
            subtitle={
              activeTab === 'proximas'
                ? 'Reserva una cancha en el detalle de cualquier escenario deportivo.'
                : 'Aquí aparecerán tus reservas completadas y canceladas.'
            }
            actionButton={
              activeTab === 'proximas'
                ? { label: 'Ver Escenarios', onPress: () => router.push('/(tabs)/search') }
                : undefined
            }
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push(`/bookings/${item.id}`)}
            onCancel={item.status === 'confirmada' ? () => handleCancel(item) : undefined}
          />
        )}
      />

      {/* FAB: Nueva Reserva */}
      {!isOffline && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/bookings/create')}
          disabled={isCancelling}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  offlineText: {
    fontSize: fontSize.xs,
    color: '#92400E',
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
