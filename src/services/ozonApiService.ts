import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OzonApiCredentials } from '../types/auth';
import { Product, ProductFilters, ProductSearchResult, ProductImage, ImageSource } from '../types/product';

// Базовый URL для API Ozon
const OZON_API_BASE_URL = 'https://api-seller.ozon.ru';

// Класс для работы с API Ozon
export class OzonApiService {
  private api: AxiosInstance;
  private credentials: OzonApiCredentials;

  constructor(credentials: OzonApiCredentials) {
    this.credentials = credentials;
    this.api = axios.create({
      baseURL: OZON_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': credentials.clientId,
        'Api-Key': credentials.apiKey
      }
    });

    // Добавляем перехватчик для обработки ошибок
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('Ошибка API Ozon:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Метод для проверки валидности учетных данных API
  async validateCredentials(): Promise<boolean> {
    try {
      // Делаем тестовый запрос к API для проверки учетных данных
      const response = await this.api.post('/v1/product/info/list', {
        limit: 1,
        offset: 0
      });
      return response.status === 200;
    } catch (error) {
      console.error('Ошибка при проверке учетных данных API Ozon:', error);
      return false;
    }
  }

  // Метод для получения списка товаров продавца
  async getProducts(filters: ProductFilters): Promise<ProductSearchResult> {
    try {
      const { page, limit, sortBy, sortOrder, search, category, status, minPrice, maxPrice, inStock, withStrategy } = filters;

      // Формируем параметры запроса к API Ozon
      const requestData: any = {
        limit: limit,
        offset: (page - 1) * limit,
        filter: {
          visibility: 'ALL'
        }
      };

      // Добавляем поиск, если указан
      if (search) {
        requestData.filter.name_or_sku = search;
      }

      // Добавляем фильтр по категории, если указан
      if (category) {
        requestData.filter.category_id = [category];
      }

      // Добавляем фильтр по статусу, если указан
      if (status) {
        requestData.filter.status = status;
      }

      // Добавляем фильтр по цене, если указаны минимальная или максимальная цена
      if (minPrice || maxPrice) {
        requestData.filter.price = {};
        if (minPrice) requestData.filter.price.min = minPrice;
        if (maxPrice) requestData.filter.price.max = maxPrice;
      }

      // Добавляем фильтр по наличию на складе, если указан
      if (inStock !== undefined) {
        requestData.filter.in_stock = inStock;
      }

      // Добавляем сортировку, если указана
      if (sortBy && sortOrder) {
        requestData.sort = {
          [sortBy]: sortOrder === 'asc' ? 'ASC' : 'DESC'
        };
      }

      // Выполняем запрос к API Ozon
      const response = await this.api.post('/v2/product/list', requestData);

      // Преобразуем ответ API в формат, ожидаемый приложением
      const items = this.mapOzonProductsToAppFormat(response.data.result.items);
      const total = response.data.result.total;
      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Ошибка при получении списка товаров из API Ozon:', error);
      throw new Error('Не удалось получить список товаров из API Ozon');
    }
  }

  // Метод для получения детальной информации о товаре по ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const response = await this.api.post('/v2/product/info', {
        product_id: productId,
        sku: 0
      });

      if (response.data.result) {
        return this.mapOzonProductToAppFormat(response.data.result);
      }

      return null;
    } catch (error) {
      console.error(`Ошибка при получении информации о товаре ${productId} из API Ozon:`, error);
      throw new Error(`Не удалось получить информацию о товаре ${productId} из API Ozon`);
    }
  }

  // Метод для преобразования товаров из формата Ozon в формат приложения
  private mapOzonProductsToAppFormat(ozonProducts: any[]): Product[] {
    return ozonProducts.map(product => this.mapOzonProductToAppFormat(product));
  }

  // Метод для получения изображений товара
  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      // Запрос к API Ozon для получения информации о товаре, включая изображения
      const response = await this.api.post('/v2/product/info', {
        product_id: productId,
        sku: 0
      });

      if (response.data.result && response.data.result.images) {
        // Преобразуем URL изображений в объекты ProductImage
        return response.data.result.images.map((url: string, index: number) => ({
          id: `img-ozon-${productId}-${index}`,
          url: url,
          isMain: index === 0,
          sortOrder: index,
          source: ImageSource.OZON,
          title: `Изображение товара ${index + 1} (Ozon)`
        }));
      }

      return [];
    } catch (error) {
      console.error(`Ошибка при получении изображений товара ${productId}:`, error);
      return [];
    }
  }

  // Метод для преобразования товара из формата Ozon в формат приложения
  private mapOzonProductToAppFormat(ozonProduct: any): Product {
    // Здесь реализуем маппинг полей из API Ozon в формат нашего приложения
    // Это примерная реализация, которую нужно адаптировать под реальную структуру данных API Ozon

    // Преобразуем массив URL изображений в формат приложения
    const images = (ozonProduct.images || []).map((url: string, index: number) => ({
      id: `img-${ozonProduct.product_id}-${index}`,
      url: url,
      isMain: index === 0,
      sortOrder: index,
      source: ImageSource.OZON,
      title: `Изображение товара ${index + 1} (Ozon)`
    }));

    return {
      id: ozonProduct.product_id.toString(),
      title: ozonProduct.name || 'Без названия',
      description: ozonProduct.description || '',
      category: this.mapOzonCategoryToAppCategory(ozonProduct.category_id),
      status: this.mapOzonStatusToAppStatus(ozonProduct.status),
      price: {
        current: ozonProduct.price.price || 0,
        old: ozonProduct.price.old_price || null,
        min: ozonProduct.price.min_price || 0,
        max: ozonProduct.price.max_price || 0
      },
      stock: {
        available: ozonProduct.stock || 0,
        reserved: ozonProduct.reserved_stock || 0,
        total: (ozonProduct.stock || 0) + (ozonProduct.reserved_stock || 0)
      },
      sales: {
        total: ozonProduct.sales?.total || 0,
        lastMonth: ozonProduct.sales?.last_month || 0,
        lastWeek: ozonProduct.sales?.last_week || 0
      },
      rating: {
        value: ozonProduct.rating?.rating || 0,
        count: ozonProduct.rating?.review_count || 0
      },
      images: images,
      imageUrl: ozonProduct.images?.[0] || '',
      createdAt: new Date(ozonProduct.created_at || Date.now()),
      updatedAt: new Date(ozonProduct.updated_at || Date.now()),
      strategyId: null, // Стратегия ценообразования не хранится в API Ozon, нужно получать из нашей БД
      competitors: [] // Информация о конкурентах также должна быть получена отдельно
    };
  }

  // Метод для преобразования категории из формата Ozon в формат приложения
  private mapOzonCategoryToAppCategory(ozonCategoryId: number): string {
    // Здесь должна быть логика маппинга категорий Ozon в категории приложения
    // Для простоты возвращаем ID категории как строку
    return ozonCategoryId?.toString() || 'unknown';
  }

  // Метод для преобразования статуса из формата Ozon в формат приложения
  private mapOzonStatusToAppStatus(ozonStatus: string): string {
    // Маппинг статусов Ozon в статусы приложения
    const statusMap: Record<string, string> = {
      'published': 'active',
      'processing': 'pending',
      'moderating': 'pending',
      'rejected': 'rejected',
      'disabled': 'inactive',
      'archived': 'archived'
    };

    return statusMap[ozonStatus] || 'unknown';
  }
}
