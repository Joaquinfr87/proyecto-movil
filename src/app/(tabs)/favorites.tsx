import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Favoritos</Text>
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
});
