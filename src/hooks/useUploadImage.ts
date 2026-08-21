import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../services/supabase';

interface UploadResult {
  url: string;
  storage_path: string;
}

interface UseUploadImageReturn {
  uploadImage: (scenarioId: string) => Promise<UploadResult | null>;
  isUploading: boolean;
  error: string | null;
}

export function useUploadImage(): UseUploadImageReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (scenarioId: string): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. Seleccionar imagen
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

      const asset = result.assets[0];

      // 2. Leer el archivo como base64
      const fileUri = asset.uri;
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Determinar extensión y content type
      const ext = fileUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const storagePath = `${scenarioId}/image-${Date.now()}.${ext}`;

      // 4. Subir a Supabase Storage
      const binaryString = atob(fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('scenario-images')
        .upload(storagePath, bytes, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        setError(`Error al subir: ${uploadError.message}`);
        return null;
      }

      // 5. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('scenario-images')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // 6. Determinar orden (contar imágenes existentes)
      const { count } = await supabase
        .from('scenario_images')
        .select('*', { count: 'exact', head: true })
        .eq('scenario_id', scenarioId);

      const displayOrder = count ?? 0;

      // 7. Insertar registro en scenario_images
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
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading, error };
}
