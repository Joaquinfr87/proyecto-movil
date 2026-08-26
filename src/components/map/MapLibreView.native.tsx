import React from 'react';
import { View } from 'react-native';

let NativeMap: any = View;
let NativeCamera: any = () => null;
let NativeMarker: any = View;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MapLibre = require('@maplibre/maplibre-react-native');
  if (MapLibre && MapLibre.Map) {
    NativeMap = MapLibre.Map;
    NativeCamera = MapLibre.Camera;
    NativeMarker = MapLibre.Marker;
  }
} catch {
  // Fallback si corre en Expo Go sin binarios nativos de MapLibre
}

export const Map = NativeMap;
export const Camera = NativeCamera;
export const Marker = NativeMarker;

export interface CameraRef {
  flyTo: (options: any) => void;
  fitBounds: (bounds: any, padding?: any, duration?: any) => void;
}
