import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#6b6bff', '#ff8fb1'];

export default function App() {
  const [count, setCount] = useState(0);
  const color = COLORS[Math.floor(count / 10) % COLORS.length];

  return (
    <View style={styles.container}>
      <View style={[styles.box, { backgroundColor: color }]}>
        <Text style={styles.count}>{count}</Text>
      </View>
      <Text style={styles.hint}>El color cambia cada 10 pulsaciones</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => setCount((c) => c + 1)}
      >
        <Text style={styles.buttonText}>Incrementar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  box: {
    width: 160,
    height: 160,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1e1e2e',
  },
  hint: {
    color: '#cdd6f4',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#89b4fa',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#1e1e2e',
    fontSize: 18,
    fontWeight: '600',
  },
});
