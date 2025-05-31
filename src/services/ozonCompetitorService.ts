/**
 * Сервис для поиска и работы с конкурентами на Wildberries
 */

import { Product, CompetitorProduct } from '../types/product';
import { wbApiService } from './wbApi';
import { wbParsingService } from './wbParsingService';

interface SearchCompetitorsOptions {
  query?: string;
  category?: string;
  limit?: number;
  useRealApi?: boolean;
}

class WBCompetitorService {
  /**
   * Поиск конкурентов на Wildberries по названию товара
   * @param product Товар, для которого ищем конкурентов
   * @param options Опции поиска
   * @returns Список найденных конкурентов
   */
  async searchCompetitors(
    product: Product,
    options: SearchCompetitorsOptions = {}
  ): Promise<CompetitorProduct[]> {
    const {
      query = product.title,
      category = product.category,
      limit = 10,
      useRealApi = false
    } = options;

    try {
      console.log(`Searching competitors for product: ${product.title}`);

      // Если API не настроен или useRealApi=false, используем моковые данные
      if (!wbApiService.isInitialized() || !useRealApi) {
        console.log('Using mock data for competitors');
        return this.getMockCompetitors(product);
      }

      // Используем реальный парсинг Wildberries
      console.log('🕷️ Поиск конкурентов через парсинг WB...');
      const wbProducts = await wbParsingService.getCompetitorPrices(
        options.query || product.name,
        options.limit || 20
      );

      // Конвертируем в формат CompetitorProduct
      const competitors: CompetitorProduct[] = wbProducts.map(wbProduct => ({
        id: `wb-${wbProduct.id}`,
        competitorId: wbProduct.sellerId,
        competitorName: wbProduct.seller,
        productTitle: wbProduct.name,
        price: wbProduct.price,
        url: wbProduct.url,
        lastUpdated: wbProduct.lastUpdated,
        isActive: wbProduct.inStock,
        imageUrl: wbProduct.images[0] || '',
        rating: wbProduct.rating,
        reviewCount: wbProduct.reviewCount,
        position: wbProduct.position || 0,
        category: wbProduct.category,
        brand: wbProduct.brand
      }));

      console.log(`✅ Найдено ${competitors.length} реальных конкурентов`);
      return competitors;
      // Например:
      // const response = await ozonApiService.searchProducts({
      //   query,
      //   category,
      //   limit
      // });

      // Пока возвращаем моковые данные, но в будущем здесь будет реальный API-запрос
      return this.getMockCompetitors(product);
    } catch (error) {
      console.error('Error searching competitors:', error);
      throw error;
    }
  }

  /**
   * Поиск конкурентов на Ozon по SKU или артикулу
   * @param product Товар, для которого ищем конкурентов
   * @param options Опции поиска
   * @returns Список найденных конкурентов
   */
  async searchCompetitorsBySku(
    product: Product,
    options: SearchCompetitorsOptions = {}
  ): Promise<CompetitorProduct[]> {
    const {
      limit = 10,
      useRealApi = false
    } = options;

    try {
      console.log(`Searching competitors by SKU for product: ${product.sku}`);

      // Если API не настроен или useRealApi=false, используем моковые данные
      if (!ozonApiService.isInitialized() || !useRealApi) {
        console.log('Using mock data for competitors');
        return this.getMockCompetitors(product);
      }

      // В реальном приложении здесь будет запрос к API Ozon
      // Например:
      // const response = await ozonApiService.searchProductsBySku({
      //   sku: product.sku,
      //   limit
      // });

      // Пока возвращаем моковые данные, но в будущем здесь будет реальный API-запрос
      return this.getMockCompetitors(product);
    } catch (error) {
      console.error('Error searching competitors by SKU:', error);
      throw error;
    }
  }

  /**
   * Получение моковых данных о конкурентах
   * @param product Товар, для которого генерируем конкурентов
   * @returns Список сгенерированных конкурентов
   */
  private getMockCompetitors(product: Product): CompetitorProduct[] {
    // Реальные конкуренты с Ozon
    const ozonCompetitors = [
      {
        id: 'comp-ozon-1',
        competitorId: 'seller-ozon-1',
        competitorName: 'OzonSeller Pro',
        productId: `${product.id}-ozon1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.95),
        url: `https://ozon.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-ozon-2',
        competitorId: 'seller-ozon-2',
        competitorName: 'MarketMaster Ozon',
        productId: `${product.id}-ozon2`,
        productTitle: `${product.title} (аналог)`,
        price: Math.round(product.price.current * 1.02),
        url: `https://ozon.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-ozon-3',
        competitorId: 'seller-ozon-3',
        competitorName: 'TopSeller Ozon',
        productId: `${product.id}-ozon3`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.98),
        url: `https://ozon.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-ozon-4',
        competitorId: 'seller-ozon-4',
        competitorName: 'OzonExpert',
        productId: `${product.id}-ozon4`,
        productTitle: `${product.title} (оригинал)`,
        price: Math.round(product.price.current * 1.05),
        url: `https://ozon.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-ozon-5',
        competitorId: 'seller-ozon-5',
        competitorName: 'MegaShop Ozon',
        productId: `${product.id}-ozon5`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.93),
        url: `https://ozon.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      }
    ];

    // Другие маркетплейсы
    const otherCompetitors = [
      {
        id: 'comp-wb-1',
        competitorId: 'seller-wb-1',
        competitorName: 'Wildberries',
        productId: `${product.id}-wb1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.9),
        url: `https://wildberries.ru/catalog/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-ali-1',
        competitorId: 'seller-ali-1',
        competitorName: 'AliExpress',
        productId: `${product.id}-ali1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.85),
        url: `https://aliexpress.ru/item/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-ym-1',
        competitorId: 'seller-ym-1',
        competitorName: 'Яндекс.Маркет',
        productId: `${product.id}-ym1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 1.03),
        url: `https://market.yandex.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-mm-1',
        competitorId: 'seller-mm-1',
        competitorName: 'МегаМаркет',
        productId: `${product.id}-mm1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.97),
        url: `https://megamarket.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-dns-1',
        competitorId: 'seller-dns-1',
        competitorName: 'DNS',
        productId: `${product.id}-dns1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 1.04),
        url: `https://dns-shop.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'comp-el-1',
        competitorId: 'seller-el-1',
        competitorName: 'Эльдорадо',
        productId: `${product.id}-el1`,
        productTitle: product.title,
        price: Math.round(product.price.current * 0.96),
        url: `https://eldorado.ru/product/${Math.floor(Math.random() * 1000000)}`,
        lastUpdated: new Date(),
        isActive: true
      }
    ];

    // Возвращаем комбинацию конкурентов с Ozon и других маркетплейсов
    return [...ozonCompetitors, ...otherCompetitors];
  }
}

// Экспортируем синглтон
export const ozonCompetitorService = new OzonCompetitorService();
