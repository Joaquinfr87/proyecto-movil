import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

// ─── Componente ──────────────────────────────────────────────────────────────

export default function SplashScreen() {
  const router = useRouter();

  const handleComenzar = () => {
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Fondo con forma decorativa */}
      <View style={styles.gradientTop} />

      {/* Contenido central */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
            testID="splash-logo"
          />
        </View>

        {/* Nombre de la app */}
        <Text style={styles.appName} testID="splash-app-name">
          Lugares Interactivos
        </Text>
        <Text style={styles.tagline}>Descubre, explora y conecta</Text>
      </View>

      {/* Boton Comenzar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleComenzar}
          activeOpacity={0.85}
          testID="splash-comenzar-button"
        >
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.primaryLight,
    textAlign: 'center',
    fontWeight: fontWeight.normal,
  },
  footer: {
    width: '100%',
    zIndex: 1,
  },
  button: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
