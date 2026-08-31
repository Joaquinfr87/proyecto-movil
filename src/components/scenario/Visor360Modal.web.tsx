import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing } from '../../theme';

interface Visor360ModalProps {
  visible: boolean;
  onClose: () => void;
  foto360Url: string;
  titulo: string;
}

export function Visor360Modal({
  visible,
  onClose,
  foto360Url,
  titulo,
}: Visor360ModalProps) {
  if (!visible) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>${titulo}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
      <style>
        * { box-sizing: border-box; }
        body, html, #panorama {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #000;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .pnlm-load-button {
          background-color: #3b82f6 !important;
          border-radius: 8px;
        }
        .custom-badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          pointer-events: none;
          z-index: 100;
        }
      </style>
    </head>
    <body>
      <div id="panorama"></div>
      <div class="custom-badge">🔄 Arrastra para girar 360°</div>
      <script>
        try {
          pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": "${foto360Url}",
            "autoLoad": true,
            "autoRotate": -2,
            "compass": false,
            "showZoomCtrl": true,
            "mouseZoom": true,
            "hfov": 100,
            "minHfov": 50,
            "maxHfov": 120,
            "crossOrigin": "anonymous"
          });
        } catch (e) {
          console.error("Error al cargar visor 360:", e);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Cabecera del visor */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <Text style={styles.title} numberOfLines={1}>
              {titulo}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={26} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Visor 360 en Web */}
        <View style={styles.viewerContainer}>
          <iframe
            srcDoc={htmlContent}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#000',
            }}
            title={titulo}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 60,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
