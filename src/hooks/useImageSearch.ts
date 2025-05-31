import { useState, useCallback } from 'react';
import { searchImages, ImageSearchResult } from '../services/imageSearchService';

interface UseImageSearchReturn {
  images: ImageSearchResult[];
  loading: boolean;
  error: string | null;
  searchForImages: (query: string, maxResults?: number) => Promise<void>;
}

/**
 * Хук для поиска изображений
 * @returns Объект с состоянием поиска и функцией для выполнения поиска
 */
export function useImageSearch(): UseImageSearchReturn {
  const [images, setImages] = useState<ImageSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchForImages = useCallback(async (query: string, maxResults: number = 10) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchImages({ query, maxResults });
      setImages(results);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при поиске изображений');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    images,
    loading,
    error,
    searchForImages
  };
}
