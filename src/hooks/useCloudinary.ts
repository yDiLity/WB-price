import { useState, useCallback } from 'react';
import axios from 'axios';

// Интерфейс для конфигурации Cloudinary
interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

// Интерфейс для результата загрузки
interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

/**
 * Хук для работы с Cloudinary
 * @param config Конфигурация Cloudinary
 */
export const useCloudinary = (config: CloudinaryConfig) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Загрузка файла в Cloudinary
   * @param file Файл для загрузки
   * @param folder Папка в Cloudinary
   * @returns Результат загрузки
   */
  const uploadFile = useCallback(async (
    file: File,
    folder?: string
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);
      
      if (folder) {
        formData.append('folder', folder);
      }
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          }
        }
      );
      
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        resourceType: response.data.resource_type
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке файла';
      setError(errorMessage);
      console.error('Ошибка при загрузке в Cloudinary:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [config]);
  
  /**
   * Загрузка изображения из URL в Cloudinary
   * @param imageUrl URL изображения
   * @param folder Папка в Cloudinary
   * @returns Результат загрузки
   */
  const uploadFromUrl = useCallback(async (
    imageUrl: string,
    folder?: string
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/upload`,
        {
          file: imageUrl,
          upload_preset: config.uploadPreset,
          folder: folder || 'products'
        }
      );
      
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        resourceType: response.data.resource_type
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке файла';
      setError(errorMessage);
      console.error('Ошибка при загрузке в Cloudinary:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [config]);
  
  /**
   * Получение оптимизированного URL изображения
   * @param publicId ID изображения в Cloudinary
   * @param options Опции трансформации
   * @returns URL оптимизированного изображения
   */
  const getImageUrl = useCallback((
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb';
      quality?: number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
  ): string => {
    const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;
    
    let transformations = 'f_auto,q_auto';
    
    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
    if (crop) transformations += `,c_${crop}`;
    
    return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformations}/${publicId}`;
  }, [config]);
  
  return {
    uploadFile,
    uploadFromUrl,
    getImageUrl,
    isUploading,
    progress,
    error
  };
};
