# Propuesta de Módulo Adicional: Visor de Asientos y Escenarios en 360°

## Proyecto: Lugares Interactivos (DeporteYa)

> **Documento de Propuesta Técnica**: Incorporación del módulo de visualización panorámica 360° de escenarios deportivos y experiencia de asiento como extensión post-MVP (Opción A).

---

## 1. Resumen Ejecutivo

Para alcanzar una experiencia interactiva avanzada similar a las plataformas globales de ticketing deportivo (*3D Digital Venue*), se propone la incorporación del **Módulo de Visor Panorámico 360°**.

Basado en el análisis de factibilidad técnica, se ha seleccionado la **Opción A (Fotos Panorámicas Equirectangulares 360° mediante WebView y Pannellum.js)** frente a la reconstrucción en modelos 3D poligonales.

### Ventajas clave de la Opción A:
* **Fotorrealismo Real**: Muestra la vista exacta y real desde la tribuna/asiento o centro de la cancha.
* **Alto Rendimiento en Móviles**: Carga liviana de imágenes equirectangulares sin consumo excesivo de GPU.
* **Impacto Cero en el Código Base**: Se implementa como un componente modal modular aislado, sin riesgo de alterar las pantallas existentes ni romper el mapa o autenticación del MVP.
* **Compatibilidad Total**: No requiere dependencias nativas complejas en Expo SDK 57.

---

## 2. Plan de Tareas (Extensión al Sprint Backlog)

Estas tareas están diseñadas para ejecutarse inmediatamente al finalizar el **Sprint Backlog principal (Sprint 3)** o como parte de un **Sprint 4 (Extensión)**:

### Módulo Opcional: Visor 360° de Asientos y Escenarios (Sprint 4 / Post-MVP)

| ID | Tarea | Asignado Sugerido | Dependencias | Herramienta IA |
|---|---|---|---|---|
| **T-057** | Agregar campo `foto_360_url` en esquema de Supabase (`escenarios`) | Nicolas | T-038 | Supabase Dashboard |
| **T-058** | Instalar y verificar `react-native-webview` en Expo SDK 57 | Nicolas | T-057 | CLI |
| **T-059** | Crear componente reutilizable `Visor360Modal.tsx` con Pannellum | Angel / David | T-058 | opencode |
| **T-060** | Integrar botón "Ver vista 360° del asiento" en `scenario/[id].tsx` | Angel | T-028, T-059 | opencode |
| **T-061** | Cargar imágenes panorámicas 360° de prueba en Supabase Storage | Nicolas / Angel | T-034, T-057 | Manual |
| **T-062** | Pruebas de navegación y gestos táctiles (zoom, rotación arrastre) | David + Angel | T-060 | Manual |

**Entregable del Módulo:** Experiencia interactiva 360° en la vista de detalle del escenario con vista inmersiva del campo/asiento.

---

## 3. Especificación Técnica de Implementación

### 3.1. Extensión de la Base de Datos (Supabase SQL)

Se añade una columna opcional a la tabla `escenarios` (o a una tabla secundaria de sectores):

```sql
-- Migración SQL en Supabase
ALTER TABLE escenarios 
ADD COLUMN IF NOT EXISTS foto_360_url TEXT;

COMMENT ON COLUMN escenarios.foto_360_url IS 'URL pública de la imagen equirectangular 360 en Supabase Storage';
```

### 3.2. Componente Reutilizable (`src/components/scenario/Visor360Modal.tsx`)

Componente aislado que encapsula el visor 360° usando Pannellum.js embebido:

```tsx
import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface Visor360ModalProps {
  visible: boolean;
  onClose: () => void;
  foto360Url: string;
  titulo?: string;
}

export function Visor360Modal({ visible, onClose, foto360Url, titulo }: Visor360ModalProps) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
      <style>
        body, html, #panorama { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #000; }
      </style>
    </head>
    <body>
      <div id="panorama"></div>
      <script>
        pannellum.viewer('panorama', {
          "type": "equirectangular",
          "panorama": "${foto360Url}",
          "autoLoad": true,
          "compass": false,
          "showZoomCtrl": true
        });
      </script>
    </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{titulo || 'Vista 360° del Escenario'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    height: 60,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeButton: { padding: 4 },
});
```

### 3.3. Integración en `src/app/scenario/[id].tsx`

En la pantalla de detalle del escenario:

```tsx
// Se agrega un botón condicional
{scenario?.foto_360_url && (
  <TouchableOpacity 
    style={styles.btn360} 
    onPress={() => setModal360Visible(true)}
  >
    <Ionicons name="eye-outline" size={20} color="#fff" />
    <Text style={styles.btn360Text}>Ver Asiento en 360°</Text>
  </TouchableOpacity>
)}

{/* Modal aislado */}
{scenario?.foto_360_url && (
  <Visor360Modal
    visible={modal360Visible}
    onClose={() => setModal360Visible(false)}
    foto360Url={scenario.foto_360_url}
    titulo={scenario.nombre}
  />
)}
```

---

## 4. Criterios de Aceptación del Módulo

- [ ] Si un escenario posee `foto_360_url` cargado en Supabase, se renderiza el botón **"Ver Asiento en 360°"**.
- [ ] Si el escenario no cuenta con URL de foto 360°, el botón no se muestra y la interfaz de detalle funciona exactamente igual que en el MVP base.
- [ ] El modal permite rotar 360° horizontal y verticalmente con gestos táctiles fluidos.
- [ ] La aplicación no sufre degradación de rendimiento ni caídas de frames en el mapa principal o catálogo.
