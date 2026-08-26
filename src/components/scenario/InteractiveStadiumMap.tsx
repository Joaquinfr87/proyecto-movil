import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Svg, { Path, G, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { ScenarioSector } from '../../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

interface InteractiveStadiumMapProps {
  sectors: ScenarioSector[];
  onSectorPress: (sector: ScenarioSector) => void;
}

export function InteractiveStadiumMap({ sectors, onSectorPress }: InteractiveStadiumMapProps) {
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = Math.min(screenWidth - 32, 600);
  const mapHeight = Math.round((mapWidth * 3) / 4); // 4:3 aspect ratio

  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);

  const activeSector = sectors.find((s) => s.id === activeSectorId);

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="map-outline" size={18} color={colors.primary} />
          <Text style={styles.title}>Mapa Interactivo de Sectores</Text>
        </View>
        <Text style={styles.subtitle}>
          Toca un sector para ver la panorámica 360°
        </Text>
      </View>

      {/* Contenedor del Mapa SVG */}
      <View style={[styles.svgContainer, { width: mapWidth, height: mapHeight }]}>
        <Svg width="100%" height="100%" viewBox="0 0 800 600">
          {/* Fondo del estadio / pista */}
          <Rect x={50} y={30} width={700} height={540} rx={200} fill="#1e293b" fillOpacity={0.1} />
          <Rect x={90} y={60} width={620} height={480} rx={160} fill="#cbd5e1" fillOpacity={0.4} />

          {/* Sectores mapeados */}
          {sectors.map((sector) => {
            const isSelected = sector.id === activeSectorId;
            return (
              <G key={sector.id}>
                <Path
                  d={sector.svg_path}
                  fill={sector.color_hex || colors.primary}
                  fillOpacity={isSelected ? 0.95 : 0.75}
                  stroke={isSelected ? colors.white : '#ffffffaa'}
                  strokeWidth={isSelected ? 4 : 2}
                  onPress={() => {
                    setActiveSectorId(sector.id);
                    onSectorPress(sector);
                  }}
                  onPressIn={() => setActiveSectorId(sector.id)}
                />
              </G>
            );
          })}
        </Svg>

        {/* Indicador de ayuda */}
        <View style={styles.hintBadge}>
          <Ionicons name="navigate-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.hintText}>Sectores interactivos</Text>
        </View>
      </View>

      {/* Lista de sectores / Leyenda */}
      <View style={styles.legendContainer}>
        {sectors.map((sector) => {
          const isSelected = sector.id === activeSectorId;
          const has360 = Boolean(sector.foto_360_url);
          return (
            <TouchableOpacity
              key={sector.id}
              style={[
                styles.legendChip,
                isSelected && styles.legendChipActive,
                !has360 && styles.legendChipDisabled,
              ]}
              onPress={() => {
                setActiveSectorId(sector.id);
                onSectorPress(sector);
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.legendColorDot,
                  { backgroundColor: sector.color_hex || colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.legendText,
                  isSelected && styles.legendTextActive,
                ]}
              >
                {sector.nombre}
              </Text>
              {has360 && (
                <Ionicons
                  name="eye-outline"
                  size={14}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  mapHeader: {
    marginBottom: spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  svgContainer: {
    alignSelf: 'center',
    backgroundColor: '#0f172a08',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hintBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  legendChipDisabled: {
    opacity: 0.6,
  },
  legendColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  legendTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
