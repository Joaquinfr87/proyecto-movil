# Propuesta de Módulo Adicional: Mapa Interactivo de Sectores y Visor 360°

## Proyecto: Lugares Interactivos (DeporteYa)

> **Documento de Propuesta Técnica**: Incorporación del módulo de visualización interactiva por sectores y experiencia panorámica 360° como extensión post-MVP (Opción Intermedia).

---

## 1. Resumen Ejecutivo

Para alcanzar una experiencia interactiva avanzada inspirada en plataformas como *3D Digital Venue*, pero manteniendo la viabilidad técnica y optimizando los recursos de modelado, se propone una **Opción Intermedia**.

En lugar de renderizar modelos 3D poligonales pesados con cámaras dinámicas, utilizaremos un **Mapa 2D Interactivo (SVG)** del estadio. Al tocar un sector específico (ej. "Curva Sur", "General", "Cancha"), el usuario abrirá un **Visor Panorámico 360°** con una foto equirectangular real o renderizada desde Blender correspondiente a ese sector.

### Ventajas clave de la Opción Intermedia:
* **Fotorrealismo y Precisión**: Cada sector tiene su propia vista inmersiva 360°.
* **Alto Rendimiento en Móviles**: Carga liviana de SVGs interactivos e imágenes equirectangulares mediante WebView (Pannellum.js). No satura la GPU.
* **Viabilidad de Assets**: Renderizar 4-6 fotos 360° en Blender por estadio (ej. Félix Capriles) es mucho más viable en tiempo y costo que exportar y mapear las coordenadas (X, Y, Z) de miles de asientos individuales en WebGL.
* **Impacto Modular**: Se implementa como un componente aislado, sin riesgo de alterar el MVP actual.

---

## 2. Plan de Tareas (Extensión al Sprint Backlog)

Estas tareas están diseñadas para ejecutarse como parte de un **Sprint 4 (Post-MVP)**:

| ID | Tarea | Asignado Sugerido | Dependencias | Herramienta IA |
|---|---|---|---|---|
| **T-057** | Crear migración SQL para tabla `scenario_sectors` y políticas RLS | Nicolas | MVP Base | Supabase Dashboard |
| **T-058** | Instalar `react-native-svg` y `react-native-webview` | Nicolas | T-057 | CLI |
| **T-059** | Crear componente `InteractiveStadiumMap.tsx` con SVG interactivo | Angel / David | T-058 | opencode |
| **T-060** | Crear componente reutilizable `Visor360Modal.tsx` con Pannellum | Angel / David | T-058 | opencode |
| **T-061** | Integrar mapa interactivo y modal en `scenario/[id].tsx` | Angel | T-059, T-060 | opencode |
| **T-062** | Renderizar fotos 360° en Blender (Félix Capriles) y cargar a Storage | David | T-057 | Manual/Blender |
| **T-063** | Cargar SVG paths y datos de sectores en BD (Félix Capriles) | David | T-057, T-062 | Manual |
| **T-064** | QA: Pruebas de navegación, toque en SVG y gestos 360° | David + Angel | T-061, T-063 | Manual |

**Entregable del Módulo:** En el detalle de un escenario (ej. Félix Capriles), el usuario verá un mapa vectorial. Al tocar "Curva Sur", se abrirá una vista 360° inmersiva renderizada desde esa ubicación.

---

## 3. Especificación Técnica de Implementación

### 3.1. Extensión de la Base de Datos (Supabase SQL)

Para soportar múltiples sectores por escenario, creamos una tabla dedicada `scenario_sectors`:

```sql
-- Migración SQL en Supabase (ej. 008_create_scenario_sectors.sql)

CREATE TABLE public.scenario_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,           -- Ej: "Curva Sur", "Cancha"
  svg_path TEXT NOT NULL,         -- Atributo 'd' del <path> SVG para dibujar la zona interactiva
  foto_360_url TEXT,              -- URL de la imagen equirectangular en Supabase Storage
  color_hex TEXT DEFAULT '#cccccc', -- Color para dibujar el sector en el SVG
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scenario_sectors ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Sectores visibles para todos"
  ON public.scenario_sectors FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Gestión de sectores para admin y gestor"
  ON public.scenario_sectors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('gestor', 'admin')
    )
  );
```

### 3.2. Frontend: Componente Mapa Interactivo (SVG)

Se utilizará `react-native-svg` para renderizar el mapa desde los datos de Supabase:

```tsx
// src/components/scenario/InteractiveStadiumMap.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ScenarioSector } from '../../types';

interface MapProps {
  sectors: ScenarioSector[];
  onSectorPress: (sector: ScenarioSector) => void;
}

export function InteractiveStadiumMap({ sectors, onSectorPress }: MapProps) {
  const width = Dimensions.get('window').width - 32;
  const height = 300; // Aspect ratio ajustado al estadio

  return (
    <View style={{ width, height, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
      <Svg width="100%" height="100%" viewBox="0 0 800 600">
        {sectors.map((sector) => (
          <Path
            key={sector.id}
            d={sector.svg_path}
            fill={sector.color_hex}
            stroke="#ffffff"
            strokeWidth="2"
            onPress={() => onSectorPress(sector)}
          />
        ))}
      </Svg>
    </View>
  );
}
```

### 3.3. Frontend: Componente Visor 360° Reutilizable

El visor encapsulado mediante `react-native-webview` y Pannellum.js:

```tsx
// src/components/scenario/Visor360Modal.tsx
import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface Visor360ModalProps {
  visible: boolean;
  onClose: () => void;
  foto360Url: string;
  titulo: string;
}

export function Visor360Modal({ visible, onClose, foto360Url, titulo }: Visor360ModalProps) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
      <style>body, html, #panorama { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #000; }</style>
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
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={styles.header}>
          <Text style={styles.title}>{titulo}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
        </View>
        <WebView originWhitelist={['*']} source={{ html: htmlContent }} style={{ flex: 1 }} javaScriptEnabled />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
```

### 3.4. Integración en el Detalle del Escenario

En `src/app/scenario/[id].tsx`, si el escenario cuenta con sectores mapeados, se mostrará el mapa. Al hacer clic en un sector, se almacena el sector activo y se abre el modal:

```tsx
const [selectedSector, setSelectedSector] = useState<ScenarioSector | null>(null);

// Dentro del render principal:
{scenario.sectors && scenario.sectors.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Mapa Interactivo de Sectores</Text>
    <InteractiveStadiumMap 
      sectors={scenario.sectors} 
      onSectorPress={(sector) => {
        if (sector.foto_360_url) {
          setSelectedSector(sector);
        } else {
          Alert.alert("Aviso", "Este sector aún no tiene vista 360° disponible.");
        }
      }} 
    />
  </View>
)}

{/* Renderizar Modal si hay un sector seleccionado */}
{selectedSector && (
  <Visor360Modal
    visible={!!selectedSector}
    onClose={() => setSelectedSector(null)}
    foto360Url={selectedSector.foto_360_url!}
    titulo={`Vista desde ${selectedSector.nombre}`}
  />
)}
```

---

## 4. Criterios de Aceptación del Módulo

- [ ] La base de datos soporta múltiples sectores por escenario asociados a paths SVG y URLs 360°.
- [ ] La pantalla de detalle renderiza correctamente el SVG vectorial en `react-native-svg` (mapeando correctamente las zonas sobre el `<Svg viewBox="...">`).
- [ ] Al tocar un `<Path>` SVG, se dispara el modal de Pannellum cargando la imagen equirectangular correspondiente.
- [ ] El mapa 2D permite identificar qué sectores tienen vista inmersiva.
- [ ] El escenario "Félix Capriles" sirve como prueba de concepto (PoC) con al menos 4 sectores renderizados desde Blender.
