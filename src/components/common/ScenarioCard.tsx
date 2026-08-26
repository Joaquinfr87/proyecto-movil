import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import type { Scenario } from '../../types';
import type { ScenarioImage } from '../../hooks/useScenarios';

export interface ScenarioCardProps {
  scenario: Scenario & { scenario_images?: ScenarioImage[] };
  onPress: (id: string) => void;
}

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  const images = (scenario.scenario_images ?? [])
    .filter((img) => img.url)
    .sort((a, b) => a.display_order - b.display_order);
  const hasMultipleImages = (images?.length ?? 0) > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<any>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
    setActiveIndex(index);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(scenario.id)}
      activeOpacity={0.85}
    >
      {/* Imagen / Carrusel */}
      <View style={styles.imageContainer}>
        {images && images.length > 0 ? (
          <>
            <Image
              source={{ uri: images[activeIndex]?.url ?? images[0].url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />

            {hasMultipleImages && (
              <View style={styles.imageCountBadge}>
                <Ionicons name="images-outline" size={12} color={colors.white} />
                <Text style={styles.imageCountText}>{images.length}</Text>
              </View>
            )}

            {hasMultipleImages && (
              <View style={styles.dotsContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.dot, index === activeIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </>
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
          <Text style={styles.infoText}>{scenario.capacidad?.toLocaleString() ?? '—'} personas</Text>
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
  imageCountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  imageCountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 8,
    height: 8,
    borderRadius: 4,
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
