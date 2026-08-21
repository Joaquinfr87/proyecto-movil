import { StatusBar } from 'expo-status-bar';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PALETA = {
  fondo: '#0B3D2E',
  fondoClaro: '#0F4C3A',
  acento: '#27AE60',
  acentoClaro: '#6FCF97',
  texto: '#FFFFFF',
  textoSuave: 'rgba(255, 255, 255, 0.82)',
  dorado: '#F2C94C',
};

export default function App() {
  return (
    <View style={styles.contenedor}>
      <StatusBar style="light" />

      {/* Decoración de fondo */}
      <View style={[styles.circulo, styles.circuloIzquierdo]} />
      <View style={[styles.circulo, styles.circuloDerecho]} />
      <View style={[styles.circulo, styles.circuloInferior]} />

      {/* Logo */}
      <View style={styles.areaLogo}>
        <View style={styles.circuloLogo}>
          <View style={styles.pin}>
            <View style={styles.pinCirculo}>
              <Text style={styles.pinTexto}>D</Text>
            </View>
            <View style={styles.pinPunta} />
          </View>
        </View>
      </View>

      {/* Título */}
      <View style={styles.areaTitulo}>
        <Text style={styles.titulo}>
          Deporte<Text style={styles.tituloAcento}>Ya</Text>
        </Text>
        <Text style={styles.eslogan}>
          Encuentra los escenarios deportivos de todo el pa\u00eds
        </Text>
      </View>

      {/* Acción */}
      <Pressable
        style={({ pressed }) => [
          styles.boton,
          pressed && styles.botonPresionado,
        ]}
      >
        <Text style={styles.botonTexto}>Explorar escenarios</Text>
      </Pressable>

      {/* Pie */}
      <Text style={styles.pie}>Equipo Sudoers \u00b7 Aplicaciones M\u00f3viles I</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: PALETA.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  circulo: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circuloIzquierdo: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    top: -SCREEN_WIDTH * 0.4,
    left: -SCREEN_WIDTH * 0.3,
  },
  circuloDerecho: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    top: SCREEN_WIDTH * 0.35,
    right: -SCREEN_WIDTH * 0.25,
    backgroundColor: 'rgba(242, 201, 76, 0.06)',
  },
  circuloInferior: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    bottom: -SCREEN_WIDTH * 0.45,
    left: -SCREEN_WIDTH * 0.25,
    backgroundColor: 'rgba(39, 174, 96, 0.10)',
  },
  areaLogo: {
    marginBottom: 28,
  },
  circuloLogo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: PALETA.fondoClaro,
    borderWidth: 3,
    borderColor: PALETA.acentoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCirculo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PALETA.acento,
    borderWidth: 2,
    borderColor: PALETA.acentoClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPunta: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: PALETA.acento,
  },
  pinTexto: {
    color: PALETA.texto,
    fontSize: 26,
    fontWeight: '800',
  },
  areaTitulo: {
    alignItems: 'center',
    marginBottom: 44,
  },
  titulo: {
    fontSize: 46,
    fontWeight: '800',
    color: PALETA.texto,
    letterSpacing: 1,
  },
  tituloAcento: {
    color: PALETA.acentoClaro,
  },
  eslogan: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: PALETA.textoSuave,
    textAlign: 'center',
    maxWidth: 300,
  },
  boton: {
    backgroundColor: PALETA.dorado,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  botonPresionado: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  botonTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: PALETA.fondo,
  },
  pie: {
    position: 'absolute',
    bottom: 32,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
  },
});
