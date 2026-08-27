import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import type { Scenario } from '../../types';

export interface WebMapLibreRef {
  flyTo: (coords: [number, number], zoom?: number) => void;
}

interface WebMapLibreProps {
  scenarios: Scenario[];
  apiKey: string;
  onScenarioSelect: (scenario: Scenario) => void;
  onMarkerClick?: (scenario: Scenario) => void;
}

declare global {
  interface Window {
    maplibregl?: any;
  }
}

export const WebMapLibre = forwardRef<WebMapLibreRef, WebMapLibreProps>(
  ({ scenarios, apiKey, onScenarioSelect, onMarkerClick }, ref) => {
    const mapContainerRef = useRef<any>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    useImperativeHandle(ref, () => ({
      flyTo: (coords: [number, number], zoom = 14) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: coords, zoom, duration: 1500 });
        }
      },
    }));

    useEffect(() => {
      // 1. Cargar CSS de MapLibre GL
      if (typeof document !== 'undefined' && !document.getElementById('maplibre-gl-css')) {
        const link = document.createElement('link');
        link.id = 'maplibre-gl-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
        document.head.appendChild(link);
      }

      // 2. Cargar Script de MapLibre GL
      const initMap = () => {
        if (!window.maplibregl || !mapContainerRef.current || mapInstanceRef.current) return;

        const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`;

        const map = new window.maplibregl.Map({
          container: mapContainerRef.current,
          style: styleUrl,
          center: [-65.0, -17.0], // Centro de Bolivia
          zoom: 5.5,
        });

        map.addControl(new window.maplibregl.NavigationControl(), 'top-right');

        mapInstanceRef.current = map;
      };

      if (typeof window !== 'undefined' && window.maplibregl) {
        initMap();
      } else if (typeof document !== 'undefined' && !document.getElementById('maplibre-gl-js')) {
        const script = document.createElement('script');
        script.id = 'maplibre-gl-js';
        script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
        script.onload = () => {
          initMap();
        };
        document.head.appendChild(script);
      }

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, [apiKey]);

    // Actualizar marcadores cuando cargan los escenarios
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || typeof window === 'undefined' || !window.maplibregl || !scenarios || scenarios.length === 0) return;

      // Limpiar marcadores anteriores
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds = new window.maplibregl.LngLatBounds();

      scenarios.forEach((sc) => {
        if (!sc.longitud || !sc.latitud) return;

        bounds.extend([sc.longitud, sc.latitud]);

        // Elemento HTML visual idéntico al pin de Android
        const el = document.createElement('div');
        el.className = 'custom-maptiler-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#1e3a8a';
        el.style.border = '2px solid #ffffff';
        el.style.boxShadow = '0 3px 8px rgba(0,0,0,0.35)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#ffffff';
        el.style.fontSize = '16px';
        el.innerHTML = '📍';

        el.addEventListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(sc);
          }
        });

        // Crear Popup descriptivo
        const popup = new window.maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${sc.nombre}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb; font-weight: 600;">${sc.tipo}</p>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">${sc.direccion || ''}</p>
            <button id="btn-sc-${sc.id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">
              Ver detalle y 360° →
            </button>
          </div>
        `);

        popup.on('open', () => {
          const btn = document.getElementById(`btn-sc-${sc.id}`);
          if (btn) {
            btn.onclick = () => onScenarioSelect(sc);
          }
        });

        const marker = new window.maplibregl.Marker({ element: el })
          .setLngLat([sc.longitud, sc.latitud])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      if (scenarios.length > 0) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
      }
    }, [scenarios, onScenarioSelect, onMarkerClick]);

    return (
      <View style={styles.container}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
});
