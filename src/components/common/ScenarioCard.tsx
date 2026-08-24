import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { Scenario } from '../../types';
import type { ScenarioImage } from '../../hooks/useScenarios';

export interface ScenarioCardProps {
  scenario: Scenario & { scenario_images?: ScenarioImage[] };
  onPress: (id: string) => void;
}

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  const primaryImage = scenario.scenario_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage?.url ?? scenario.scenario_images?.[0]?.url ?? null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(scenario.id)}
      activeOpacity={0.85}
    >
      {/* Imagen */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
          </View>
        )}

        {/* Badge tipo */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{scenario.tipo}</Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {scenario.nombre}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{scenario.capacidad.toLocaleString()} personas</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {scenario.direccion}
          </Text>
        </View>

        {/* Estado */}
        <View style={styles.footer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  scenario.estado === 'activo' ? colors.success : colors.textSecondary,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {scenario.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
