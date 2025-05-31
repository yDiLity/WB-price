/**
 * Сервис для поиска изображений с использованием Google Custom Search API
 */
import { ImageSource } from '../types/product';

// Интерфейс для результатов поиска изображений
export interface ImageSearchResult {
  url: string;
  title: string;
  thumbnail?: string;
  height?: number;
  width?: number;
  source?: ImageSource;
}

// Интерфейс для параметров поиска
export interface SearchImageParams {
  query: string;
  maxResults?: number;
}

/**
 * Поиск изображений по запросу с использованием Google Custom Search API
 * @param params Параметры поиска
 * @returns Массив найденных изображений
 */
export async function searchImages(params: SearchImageParams): Promise<ImageSearchResult[]> {
  const { query, maxResults = 5 } = params;

  if (!query) {
    throw new Error('Query parameter is required');
  }

  try {
    // Получаем значения из переменных окружения
    const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const cx = import.meta.env.VITE_GOOGLE_SEARCH_CX;

    if (!apiKey) {
      console.error('API key is missing');
      throw new Error('API key is missing');
    }

    if (!cx) {
      console.warn('CX is missing, please create a Programmable Search Engine and add the CX to .env.local');
      // Для демонстрации можно использовать заглушку, но в реальном приложении нужно требовать CX
      throw new Error('Search Engine ID (CX) is missing. Please create a Programmable Search Engine and add the CX to .env.local');
    }

    const url = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=${maxResults}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch images');
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Извлекаем URL изображений из результатов
      return data.items.map((item: any) => ({
        url: item.link,
        title: item.title,
        thumbnail: item.image?.thumbnailLink || item.link,
        height: item.image?.height,
        width: item.image?.width,
        source: ImageSource.GOOGLE
      }));
    } else {
      console.warn('No images found for query:', query);
      return [];
    }
  } catch (error) {
    console.error('Error searching for images:', error);
    throw error;
  }
}
