import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getRole } from '../../utils/permissions';
import { useMyRegistrations } from '../../hooks/useEventRegistration';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  asistente: 'Asistente',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#7C3AED',
  gestor: '#2563EB',
  asistente: '#059669',
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const role = getRole(user);
  const fullName = user?.user_metadata?.full_name || 'Usuario';
  const email = user?.email || '';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar y nombre */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[role] + '20' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[role] }]}>
            {ROLE_LABELS[role] || role}
          </Text>
        </View>
      </View>

      {/* Información de la cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la cuenta</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nombre completo</Text>
              <Text style={styles.infoValue}>{fullName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{ROLE_LABELS[role] || role}</Text>
            </View>
          </View>

          {createdAt && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Miembro desde</Text>
                  <Text style={styles.infoValue}>{createdAt}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Permisos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus permisos</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name={role === 'asistente' ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={18}
              color={role === 'asistente' ? colors.textSecondary : colors.success}
            />
            <Text style={styles.permissionText}>Ver escenarios deportivos</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name={role === 'asistente' ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={18}
              color={role === 'asistente' ? colors.textSecondary : colors.success}
            />
            <Text style={styles.permissionText}>Gestionar escenarios</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name={role === 'admin' ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={18}
              color={role === 'admin' ? colors.success : colors.textSecondary}
            />
            <Text style={styles.permissionText}>Eliminar escenarios</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name={role === 'admin' ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={18}
              color={role === 'admin' ? colors.success : colors.textSecondary}
            />
            <Text style={styles.permissionText}>Gestionar usuarios</Text>
          </View>
        </View>
      </View>

      {/* Mis inscripciones a eventos */}
      <MyRegistrationsSection userId={user?.id} />

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SportApp v1.0</Text>
    </ScrollView>
  );
}

// ─── Sección de inscripciones del usuario ─────────────────────────────────
function MyRegistrationsSection({ userId }: { userId: string | undefined }) {
  const { data: registrations, isLoading } = useMyRegistrations(userId);

  if (!userId) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mis inscripciones a eventos</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando inscripciones...</Text>
        </View>
      ) : registrations && registrations.length > 0 ? (
        <View style={styles.infoCard}>
          {registrations.map((reg, index) => (
            <View key={reg.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.registrationRow}>
                <View style={styles.registrationIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View style={styles.registrationContent}>
                  <Text style={styles.registrationEventId}>Evento</Text>
                  <Text style={styles.registrationDate}>
                    Inscrito el {new Date(reg.registered_at).toLocaleDateString('es-BO')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyRegistrations}>
          <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.emptyRegistrationsText}>No tienes inscripciones aún</Text>
          <Text style={styles.emptyRegistrationsHint}>Inscríbete en eventos desde los detalles de cada escenario</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontSize: fontSize.md,
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  registrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  registrationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registrationContent: {
    flex: 1,
  },
  registrationEventId: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  registrationDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyRegistrations: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyRegistrationsText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
    marginTop: spacing.sm,
  },
  emptyRegistrationsHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
