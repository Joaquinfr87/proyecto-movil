import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme';

interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({ message, fullscreen = true }: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
