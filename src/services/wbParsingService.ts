/**
 * 🕷️ Сервис парсинга Wildberries с защитой от блокировок
 * Реализует все методы безопасного извлечения данных
 */

import { wbAntiBlockService } from './wbAntiBlockService';

interface WBProduct {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  seller: string;
  sellerId: string;
  category: string;
  brand: string;
  images: string[];
  url: string;
  inStock: boolean;
  position?: number;
  lastUpdated: Date;
}

interface WBSearchParams {
  query: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new';
}

interface WBParsingResult {
  products: WBProduct[];
  totalFound: number;
  currentPage: number;
  totalPages: number;
  searchTime: number;
  success: boolean;
  error?: string;
}

class WBParsingService {
  private baseUrls = {
    search: 'https://search.wb.ru/exactmatch/ru/common/v4/search',
    catalog: 'https://catalog.wb.ru/catalog',
    card: 'https://card.wb.ru/cards/detail',
    mobile: 'https://mobile-api.wildberries.ru/api/v1',
    content: 'https://wbx-content-v2.wbstatic.net'
  };

  private requestCount = 0;
  private lastRequestTime = 0;

  /**
   * 🔍 Поиск товаров на Wildberries
   */
  async searchProducts(params: WBSearchParams): Promise<WBParsingResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Начинаем поиск товаров на WB:', params.query);

      // Проверяем защиту от блокировок
      await this.ensureSafeRequest();

      // Формируем параметры запроса
      const searchParams = this.buildSearchParams(params);
      const url = `${this.baseUrls.search}?${searchParams}`;

      // Выполняем защищенный запрос
      const response = await this.makeSecureRequest(url, {
        method: 'GET',
        headers: this.getSearchHeaders()
      });

      if (!response.ok) {
        throw new Error(`WB API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Парсим результаты
      const products = await this.parseSearchResults(data, params.query);
      
      const result: WBParsingResult = {
        products,
        totalFound: data.metadata?.total || products.length,
        currentPage: params.page || 1,
        totalPages: Math.ceil((data.metadata?.total || products.length) / (params.limit || 20)),
        searchTime: Date.now() - startTime,
        success: true
      };

      console.log(`✅ Найдено ${products.length} товаров за ${result.searchTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Ошибка поиска товаров:', error);
      
      return {
        products: [],
        totalFound: 0,
        currentPage: params.page || 1,
        totalPages: 0,
        searchTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * 📦 Получение детальной информации о товаре
   */
  async getProductDetails(productId: string): Promise<WBProduct | null> {
    try {
      console.log('📦 Получаем детали товара:', productId);

      await this.ensureSafeRequest();

      // Запрос к API карточек товаров
      const url = `${this.baseUrls.card}?appType=1&curr=rub&dest=-1257786&regions=80,64,83,4,38,115,30,33,70,69,68,86,75,40,1,66,48,110,31,22,71,114&spp=27&nm=${productId}`;
      
      const response = await this.makeSecureRequest(url, {
        method: 'GET',
        headers: this.getCardHeaders()
      });

      if (!response.ok) {
        throw new Error(`WB Card API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.products?.[0]) {
        console.warn('⚠️ Товар не найден:', productId);
        return null;
      }

      const product = await this.parseProductCard(data.data.products[0]);
      console.log('✅ Получены детали товара:', product.name);
      
      return product;

    } catch (error) {
      console.error('❌ Ошибка получения деталей товара:', error);
      return null;
    }
  }

  /**
   * 💰 Получение цен конкурентов
   */
  async getCompetitorPrices(query: string, limit = 20): Promise<WBProduct[]> {
    try {
      console.log('💰 Ищем цены конкурентов для:', query);

      const searchResult = await this.searchProducts({
        query,
        limit,
        sort: 'popular'
      });

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Ошибка поиска конкурентов');
      }

      // Добавляем позиции в поиске
      const competitors = searchResult.products.map((product, index) => ({
        ...product,
        position: index + 1
      }));

      console.log(`✅ Найдено ${competitors.length} конкурентов`);
      return competitors;

    } catch (error) {
      console.error('❌ Ошибка получения цен конкурентов:', error);
      return [];
    }
  }

  /**
   * 🛡️ Безопасный запрос с защитой от блокировок
   */
  private async makeSecureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Используем систему защиты от блокировок
    const secureOptions = await wbAntiBlockService.makeSecureRequest(url, options);
    
    // Добавляем специфичные для WB заголовки
    const headers = {
      ...options.headers,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'X-Requested-With': 'XMLHttpRequest'
    };

    // Выполняем запрос
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Логируем запрос для мониторинга
    this.logRequest(url, response.status, response.ok);

    return response;
  }

  /**
   * ⏱️ Обеспечение безопасных интервалов между запросами
   */
  private async ensureSafeRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Минимальная задержка между запросами (5 секунд)
    const minDelay = 5000;
    
    if (timeSinceLastRequest < minDelay) {
      const waitTime = minDelay - timeSinceLastRequest;
      console.log(`⏱️ Ожидание ${waitTime}ms для безопасности...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    // Каждые 100 запросов делаем длинную паузу
    if (this.requestCount % 100 === 0) {
      console.log('☕ Длинная пауза для безопасности (2 минуты)...');
      await new Promise(resolve => setTimeout(resolve, 120000));
    }
  }

  /**
   * 🔧 Формирование параметров поиска
   */
  private buildSearchParams(params: WBSearchParams): string {
    const searchParams = new URLSearchParams();
    
    searchParams.append('query', params.query);
    searchParams.append('resultset', 'catalog');
    searchParams.append('limit', (params.limit || 20).toString());
    searchParams.append('offset', ((params.page || 1) - 1) * (params.limit || 20)).toString());
    
    if (params.category) {
      searchParams.append('cat', params.category);
    }
    
    if (params.priceMin) {
      searchParams.append('priceU', (params.priceMin * 100).toString());
    }
    
    if (params.priceMax) {
      searchParams.append('priceU', (params.priceMax * 100).toString());
    }

    // Сортировка
    switch (params.sort) {
      case 'price_asc':
        searchParams.append('sort', 'priceup');
        break;
      case 'price_desc':
        searchParams.append('sort', 'pricedown');
        break;
      case 'rating':
        searchParams.append('sort', 'rate');
        break;
      case 'new':
        searchParams.append('sort', 'newly');
        break;
      default:
        searchParams.append('sort', 'popular');
    }

    return searchParams.toString();
  }

  /**
   * 📋 Заголовки для поиска
   */
  private getSearchHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ru-RU,ru;q=0.9',
      'Origin': 'https://www.wildberries.ru',
      'Referer': 'https://www.wildberries.ru/',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not A(Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    };
  }

  /**
   * 🃏 Заголовки для карточек товаров
   */
  private getCardHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ru-RU,ru;q=0.9',
      'Origin': 'https://www.wildberries.ru',
      'Referer': 'https://www.wildberries.ru/catalog/',
      'Sec-Ch-Ua': '"Chromium";v="120", "Not A(Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    };
  }

  /**
   * 🔍 Парсинг результатов поиска
   */
  private async parseSearchResults(data: any, query: string): Promise<WBProduct[]> {
    const products: WBProduct[] = [];
    
    if (!data.data?.products) {
      console.warn('⚠️ Нет товаров в результатах поиска');
      return products;
    }

    for (const item of data.data.products) {
      try {
        const product = await this.parseProductItem(item, query);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.warn('⚠️ Ошибка парсинга товара:', error);
      }
    }

    return products;
  }

  /**
   * 📦 Парсинг отдельного товара
   */
  private async parseProductItem(item: any, query: string): Promise<WBProduct | null> {
    try {
      const id = item.id?.toString();
      if (!id) return null;

      const price = item.priceU ? Math.round(item.priceU / 100) : 0;
      const oldPrice = item.salePriceU ? Math.round(item.salePriceU / 100) : undefined;

      const product: WBProduct = {
        id,
        name: item.name || 'Без названия',
        price,
        oldPrice,
        rating: item.rating || 0,
        reviewCount: item.feedbacks || 0,
        seller: item.supplier || 'Неизвестный продавец',
        sellerId: item.supplierId?.toString() || '',
        category: item.subj_name || 'Без категории',
        brand: item.brand || 'Без бренда',
        images: this.extractImages(item),
        url: `https://www.wildberries.ru/catalog/${id}/detail.aspx`,
        inStock: (item.totalQuantity || 0) > 0,
        lastUpdated: new Date()
      };

      return product;

    } catch (error) {
      console.error('❌ Ошибка парсинга товара:', error);
      return null;
    }
  }

  /**
   * 🃏 Парсинг карточки товара
   */
  private async parseProductCard(item: any): Promise<WBProduct> {
    const id = item.id?.toString() || '';
    const price = item.priceU ? Math.round(item.priceU / 100) : 0;
    const oldPrice = item.salePriceU ? Math.round(item.salePriceU / 100) : undefined;

    return {
      id,
      name: item.name || 'Без названия',
      price,
      oldPrice,
      rating: item.rating || 0,
      reviewCount: item.feedbacks || 0,
      seller: item.supplier || 'Неизвестный продавец',
      sellerId: item.supplierId?.toString() || '',
      category: item.subj_name || 'Без категории',
      brand: item.brand || 'Без бренда',
      images: this.extractImages(item),
      url: `https://www.wildberries.ru/catalog/${id}/detail.aspx`,
      inStock: (item.totalQuantity || 0) > 0,
      lastUpdated: new Date()
    };
  }

  /**
   * 🖼️ Извлечение изображений
   */
  private extractImages(item: any): string[] {
    const images: string[] = [];
    
    if (item.pics && Array.isArray(item.pics)) {
      item.pics.forEach((pic: number) => {
        const vol = Math.floor(pic / 100000);
        const part = Math.floor(pic / 1000);
        const imageUrl = `https://images.wbstatic.net/c516x688/${vol}/${part}/${pic}/1.jpg`;
        images.push(imageUrl);
      });
    }

    return images;
  }

  /**
   * 📊 Логирование запросов
   */
  private logRequest(url: string, status: number, success: boolean): void {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] ${success ? '✅' : '❌'} ${status} ${url}`);
    
    // Здесь можно добавить отправку в систему мониторинга
    if (!success) {
      console.warn(`⚠️ Неуспешный запрос: ${status} ${url}`);
    }
  }

  /**
   * 📈 Получение статистики парсинга
   */
  getParsingStats(): {
    totalRequests: number;
    requestsPerMinute: number;
    lastRequestTime: Date | null;
  } {
    return {
      totalRequests: this.requestCount,
      requestsPerMinute: this.requestCount / ((Date.now() - this.lastRequestTime) / 60000) || 0,
      lastRequestTime: this.lastRequestTime ? new Date(this.lastRequestTime) : null
    };
  }
}

// Экспортируем singleton
export const wbParsingService = new WBParsingService();
export default WBParsingService;
export type { WBProduct, WBSearchParams, WBParsingResult };
