import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionButton?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, subtitle, actionButton }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={56} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionButton ? (
        <TouchableOpacity style={styles.button} onPress={actionButton.onPress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionButton.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
