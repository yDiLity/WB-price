import axios from 'axios';
import { Product, ProductImage, ImageSource } from '../types/product';
import { searchImages, ImageSearchResult } from './imageSearchService';
import { ozonApiService } from './ozonApiService';

// Интерфейс для конфигурации сервиса изображений
interface ImageServiceConfig {
  apiKey: string;
  baseUrl: string;
  cloudName?: string;
  uploadPreset?: string;
}

/**
 * Сервис для работы с изображениями товаров
 * Поддерживает несколько источников изображений:
 * 1. API Ozon (через ozonApiService)
 * 2. Сервис Amazon Product Advertising API
 * 3. Сервис Google Custom Search API для поиска изображений
 * 4. Сервис Cloudinary для хранения и оптимизации изображений
 */
export class ProductImageService {
  private config: ImageServiceConfig;

  constructor(config: ImageServiceConfig) {
    this.config = config;
  }

  /**
   * Получение изображений товара по его названию и бренду
   * @param product Товар, для которого нужно найти изображения
   * @param source Источник изображений (ozon, amazon, google, cloudinary)
   * @param forceSource Принудительно использовать указанный источник, даже если есть изображения из Ozon
   * @returns Массив объектов ProductImage
   */
  async getProductImages(
    product: Product,
    source: 'ozon' | 'amazon' | 'google' | 'cloudinary' = 'google',
    forceSource: boolean = false
  ): Promise<ProductImage[]> {
    try {
      // Сначала пытаемся получить изображения из Ozon, если у товара есть ozonId
      if (product.ozonId && !forceSource) {
        const ozonImages = await this.getImagesFromOzon(product);

        // Если изображения из Ozon получены успешно, используем их
        if (ozonImages.length > 0) {
          console.log(`Найдены изображения в Ozon для товара ${product.title}`);
          return ozonImages;
        }
      }

      // Если изображений из Ozon нет или указан forceSource, используем указанный источник
      console.log(`Поиск изображений для товара ${product.title} из источника ${source}`);

      switch (source) {
        case 'ozon':
          return await this.getImagesFromOzon(product);
        case 'amazon':
          return await this.getImagesFromAmazon(product);
        case 'google':
          return await this.getImagesFromGoogle(product);
        case 'cloudinary':
          return await this.getImagesFromCloudinary(product);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Ошибка при получении изображений для товара ${product.id}:`, error);
      return [];
    }
  }

  /**
   * Получение изображений товара из API Ozon
   * @param product Товар, для которого нужно найти изображения
   * @returns Массив объектов ProductImage
   */
  private async getImagesFromOzon(product: Product): Promise<ProductImage[]> {
    if (!product.ozonId) {
      console.warn(`Товар ${product.id} не имеет ozonId, невозможно получить изображения из Ozon`);
      return [];
    }

    try {
      // Получаем изображения из API Ozon
      return await ozonApiService.getProductImages(product.ozonId);
    } catch (error) {
      console.error(`Ошибка при получении изображений из Ozon для товара ${product.id}:`, error);
      return [];
    }
  }

  /**
   * Получение изображений товара из Amazon Product Advertising API
   * @param product Товар, для которого нужно найти изображения
   * @returns Массив объектов ProductImage
   */
  private async getImagesFromAmazon(product: Product): Promise<ProductImage[]> {
    try {
      // В реальном приложении здесь будет запрос к Amazon Product Advertising API
      // Для демонстрации возвращаем заглушку
      console.log(`Получение изображений из Amazon для товара ${product.title}`);

      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));

      const urls = [
        `https://m.media-amazon.com/images/I/71${product.id.substring(0, 6)}XXX._AC_SL1500_.jpg`,
        `https://m.media-amazon.com/images/I/81${product.id.substring(0, 6)}XXX._AC_SL1500_.jpg`
      ];

      // Преобразуем URL в объекты ProductImage
      return urls.map((url, index) => ({
        id: `img-amazon-${product.id}-${index}`,
        url,
        isMain: index === 0,
        sortOrder: index,
        source: ImageSource.OTHER,
        title: `Изображение товара ${index + 1} (Amazon)`
      }));
    } catch (error) {
      console.error(`Ошибка при получении изображений из Amazon для товара ${product.id}:`, error);
      return [];
    }
  }

  /**
   * Получение изображений товара из Google Custom Search API
   * @param product Товар, для которого нужно найти изображения
   * @returns Массив объектов ProductImage
   */
  private async getImagesFromGoogle(product: Product): Promise<ProductImage[]> {
    try {
      // Формируем поисковый запрос
      const query = `${product.brand || ''} ${product.title} product image`;

      console.log(`Получение изображений из Google для запроса "${query}"`);

      // Используем наш новый сервис поиска изображений
      const results = await searchImages({
        query,
        maxResults: 5
      });

      // Преобразуем результаты в объекты ProductImage
      return results.map((image, index) => ({
        id: `img-google-${product.id}-${Date.now()}-${index}`,
        url: image.url,
        isMain: index === 0,
        sortOrder: index,
        source: ImageSource.GOOGLE,
        title: image.title || `Изображение товара ${index + 1} (Google)`
      }));
    } catch (error) {
      console.error(`Ошибка при получении изображений из Google для товара ${product.id}:`, error);
      return [];
    }
  }

  /**
   * Получение изображений товара из Cloudinary
   * @param product Товар, для которого нужно найти изображения
   * @returns Массив объектов ProductImage
   */
  private async getImagesFromCloudinary(product: Product): Promise<ProductImage[]> {
    try {
      console.log(`Получение изображений из Cloudinary для товара ${product.title}`);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
      const folder = 'products';

      // В реальном приложении здесь будет запрос к Cloudinary API для получения списка изображений
      // Например, с использованием Admin API Cloudinary

      // Для демонстрации возвращаем заглушку
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 300));

      // Проверяем, настроен ли Cloudinary
      if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
        console.warn('Cloudinary не настроен. Используйте переменные окружения VITE_CLOUDINARY_CLOUD_NAME и VITE_CLOUDINARY_UPLOAD_PRESET');
        return [];
      }

      // В реальном приложении здесь будет запрос к Cloudinary API
      // Для демонстрации возвращаем заглушку с использованием настроенного cloudName
      const urls = [
        `https://res.cloudinary.com/${cloudName}/image/upload/v1/${folder}/${product.id}-1.jpg`,
        `https://res.cloudinary.com/${cloudName}/image/upload/v1/${folder}/${product.id}-2.jpg`
      ];

      // Преобразуем URL в объекты ProductImage
      return urls.map((url, index) => ({
        id: `img-cloudinary-${product.id}-${index}`,
        url,
        isMain: index === 0,
        sortOrder: index,
        source: ImageSource.OTHER,
        title: `Изображение товара ${index + 1} (Cloudinary)`
      }));
    } catch (error) {
      console.error(`Ошибка при получении изображений из Cloudinary для товара ${product.id}:`, error);
      return [];
    }
  }

  /**
   * Загрузка изображения в Cloudinary
   * @param imageUrl URL изображения для загрузки
   * @param productId ID товара
   * @returns URL загруженного изображения в Cloudinary
   */
  async uploadImageToCloudinary(imageUrl: string, productId: string): Promise<string> {
    try {
      console.log(`Загрузка изображения ${imageUrl} в Cloudinary для товара ${productId}`);

      // Проверяем, настроен ли Cloudinary
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        console.warn('Cloudinary не настроен. Используйте переменные окружения VITE_CLOUDINARY_CLOUD_NAME и VITE_CLOUDINARY_UPLOAD_PRESET');
        return imageUrl; // Возвращаем исходный URL, если Cloudinary не настроен
      }

      // В реальном приложении здесь будет запрос к Cloudinary API для загрузки изображения
      // Например, с использованием Fetch API или axios

      // Для демонстрации возвращаем заглушку с использованием настроенного cloudName
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));

      const folder = 'products';
      const timestamp = Date.now();

      return `https://res.cloudinary.com/${cloudName}/image/upload/v1/${folder}/${productId}-${timestamp}.jpg`;
    } catch (error) {
      console.error(`Ошибка при загрузке изображения в Cloudinary:`, error);
      return imageUrl; // Возвращаем исходный URL в случае ошибки
    }
  }
}

// Экспорт экземпляра сервиса с конфигурацией по умолчанию
export const productImageService = new ProductImageService({
  apiKey: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || 'AIzaSyAg2bnrkNNhxoU2QSmOZJt3h7Q0uaZ4dec',
  baseUrl: 'https://customsearch.googleapis.com/customsearch/v1',
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
});
