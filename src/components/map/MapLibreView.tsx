import React from 'react';
import { View } from 'react-native';

export const Map: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const Camera: React.FC<any> = () => null;

export const Marker: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export interface CameraRef {
  flyTo: (options: any) => void;
  fitBounds: (bounds: any, padding?: any, duration?: any) => void;
}
