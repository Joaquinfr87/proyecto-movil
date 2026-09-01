import { Stack } from 'expo-router';
import { colors } from '../../theme';

export default function BookingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mis Reservas' }} />
      <Stack.Screen name="create" options={{ title: 'Nueva Reserva' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Detalle de Reserva' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Reprogramar Turno' }} />
    </Stack>
  );
}
