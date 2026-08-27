import { useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../services/supabase';

export interface UploadResult {
  url: string;
  storage_path: string;
}

export interface UseUploadImageReturn {
  pickImage: () => Promise<string | null>;
  uploadImageUri: (scenarioId: string, fileUri: string) => Promise<UploadResult | null>;
  uploadImage: (scenarioId: string) => Promise<UploadResult | null>;
  deleteScenarioImage: (imageId: string, storagePath: string) => Promise<boolean>;
  isUploading: boolean;
  error: string | null;
}

export function useUploadImage(): UseUploadImageReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (): Promise<string | null> => {
    setError(null);
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setError('Se necesita permiso para acceder a las fotos.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al seleccionar imagen';
      setError(message);
      return null;
    }
  };

  const uploadImageUri = async (
    scenarioId: string,
    fileUri: string,
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const ext = fileUri.split('.').pop()?.toLowerCase().split('?')[0] ?? 'jpg';
      const cleanExt = ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? ext : 'jpg';
      const contentType = `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`;
      const storagePath = `${scenarioId}/image-${Date.now()}-${Math.floor(Math.random() * 1000)}.${cleanExt}`;

      let fileData: Uint8Array | Blob | ArrayBuffer;

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        fileData = await response.blob();
      } else {
        // En Android / iOS: Leer Base64 desde el sistema de archivos real y convertir a Uint8Array
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const binaryString = atob(fileBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileData = bytes;
      }

      // Subir a Supabase Storage con los bytes reales
      const { error: uploadError } = await supabase.storage
        .from('scenario-images')
        .upload(storagePath, fileData, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        setError(`Error al subir: ${uploadError.message}`);
        return null;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('scenario-images')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // Determinar orden
      const { count } = await supabase
        .from('scenario_images')
        .select('*', { count: 'exact', head: true })
        .eq('scenario_id', scenarioId);

      const displayOrder = count ?? 0;

      // Insertar registro en scenario_images
      const { error: dbError } = await supabase.from('scenario_images').insert({
        scenario_id: scenarioId,
        storage_path: storagePath,
        url: publicUrl,
        is_primary: displayOrder === 0,
        display_order: displayOrder,
      });

      if (dbError) {
        setError(`Error al guardar registro: ${dbError.message}`);
        return null;
      }

      return { url: publicUrl, storage_path: storagePath };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al subir imagen';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImage = async (scenarioId: string): Promise<UploadResult | null> => {
    const uri = await pickImage();
    if (!uri) return null;
    return uploadImageUri(scenarioId, uri);
  };

  const deleteScenarioImage = async (
    imageId: string,
    storagePath: string,
  ): Promise<boolean> => {
    try {
      if (storagePath) {
        await supabase.storage.from('scenario-images').remove([storagePath]);
      }
      const { error: delError } = await supabase
        .from('scenario_images')
        .delete()
        .eq('id', imageId);

      if (delError) {
        setError(delError.message);
        return false;
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar imagen';
      setError(message);
      return false;
    }
  };

  return {
    pickImage,
    uploadImageUri,
    uploadImage,
    deleteScenarioImage,
    isUploading,
    error,
  };
}
