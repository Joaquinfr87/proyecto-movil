import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares Interactivos</Text>
      <Text style={styles.subtitle}>Explora escenarios deportivos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
