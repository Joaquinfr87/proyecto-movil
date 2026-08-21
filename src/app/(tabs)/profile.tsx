import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Cerrar sesión: ¿Estás seguro?')) {
        signOut();
      }
    } else {
      Alert.alert('Cerrar sesión', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
      </View>

      <Text style={styles.name}>{user?.user_metadata?.full_name || 'Usuario'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.xl,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
});
