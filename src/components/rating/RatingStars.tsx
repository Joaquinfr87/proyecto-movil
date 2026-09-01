import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

const MAX_RATING = 5;

export interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  showValue?: boolean;
}

function starIconFor(value: number, index: number): keyof typeof Ionicons.glyphMap {
  const position = index + 1;
  if (value >= position) return 'star';
  if (value >= position - 0.5) return 'star-half';
  return 'star-outline';
}

export function RatingStars({ value, onChange, size = 20, showValue = false }: RatingStarsProps) {
  const interactive = typeof onChange === 'function';

  return (
    <View style={styles.row}>
      {Array.from({ length: MAX_RATING }, (_, index) =>
        interactive ? (
          <Pressable
            key={index}
            onPress={() => onChange!(index + 1)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityRole="button"
            accessibilityLabel={`${index + 1} estrella${index + 1 > 1 ? 's' : ''}`}
          >
            <Ionicons
              name={value >= index + 1 ? 'star' : 'star-outline'}
              size={size}
              color={value >= index + 1 ? colors.warning : colors.textSecondary}
            />
          </Pressable>
        ) : (
          <Ionicons
            key={index}
            name={starIconFor(value, index)}
            size={size}
            color={colors.warning}
          />
        ),
      )}
      {showValue && <Text style={styles.valueText}>{Number(value).toFixed(1)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  valueText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
