import { CompetitorProduct } from '../types/product';
import axios from 'axios';
import { securityService } from './securityService';

// Реальные конкуренты на маркетплейсах
const realCompetitors = [
  { id: 'wb', name: 'Wildberries', url: 'https://wildberries.ru' },
  { id: 'ozon', name: 'Ozon', url: 'https://ozon.ru' },
  { id: 'yandex', name: 'Яндекс.Маркет', url: 'https://market.yandex.ru' },
  { id: 'megamarket', name: 'МегаМаркет', url: 'https://megamarket.ru' },
  { id: 'aliexpress', name: 'AliExpress', url: 'https://aliexpress.ru' }
];

// Интерфейс для результатов поиска товаров на Ozon
interface OzonSearchResult {
  products: {
    id: string;
    title: string;
    price: number;
    seller: {
      id: string;
      name: string;
    };
    url: string;
    image_url?: string;
  }[];
  total: number;
}

class CompetitorSearchService {
  private apiUrl = '/api/competitors/search';
  private useMockData = true; // По умолчанию используем моковые данные

  // Установка режима работы (моковый или реальный API)
  public setMockMode(useMockData: boolean): void {
    this.useMockData = useMockData;
    console.log(`Режим поиска конкурентов: ${useMockData ? 'моковый' : 'реальный'}`);
  }

  // Получение режима работы
  public getMockMode(): boolean {
    return this.useMockData;
  }

  // Поиск конкурентов по запросу
  public async searchCompetitors(
    searchTerm: string,
    productId: string,
    currentPrice: number,
    showOnlyOzon: boolean = false,
    productName: string = ''
  ): Promise<CompetitorProduct[]> {
    console.log('🌐 РЕАЛЬНЫЙ поиск конкурентов на Wildberries:', { searchTerm, productId, currentPrice, showOnlyOzon, productName });

    // ВСЕГДА используем реальные данные с Wildberries
    return this.getRealCompetitors(searchTerm, currentPrice, showOnlyOzon, productName);
  }

  // РЕАЛЬНЫЙ поиск конкурентов через Wildberries API
  private async getRealCompetitors(
    searchTerm: string,
    currentPrice: number,
    showOnlyOzon: boolean = false,
    productName: string = ''
  ): Promise<CompetitorProduct[]> {
    try {
      console.log('🌐 Ищем РЕАЛЬНЫХ конкурентов на Wildberries:', searchTerm);

      // Используем наш серверный прокси для поиска конкурентов
      const response = await fetch(`/api/wb/search?q=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        throw new Error(`Ошибка поиска конкурентов: ${response.status}`);
      }

      const wbProducts = await response.json();

      // Конвертируем товары WB в формат конкурентов
      const competitors: CompetitorProduct[] = wbProducts.slice(0, 10).map((product: any) => ({
        id: `wb-comp-${product.id}`,
        competitorId: `wb-seller-${product.supplierId || product.id}`,
        competitorName: product.supplier || 'WB Продавец',
        productId: product.id.toString(),
        productTitle: product.name,
        price: Math.round(product.price * 100), // Конвертируем в копейки
        url: `https://www.wildberries.ru/catalog/${product.id}/detail.aspx`,
        lastUpdated: new Date(),
        isActive: true,
        source: 'REAL_WILDBERRIES' // Маркер реальных данных
      }));

      console.log(`✅ Найдено ${competitors.length} РЕАЛЬНЫХ конкурентов на WB`);
      return competitors;

    } catch (error) {
      console.error('🚫 Ошибка поиска реальных конкурентов:', error);
      throw new Error('Не удалось найти конкурентов на Wildberries');
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const competitorSearchService = new CompetitorSearchService();
