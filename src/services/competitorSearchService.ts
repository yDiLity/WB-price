import { CompetitorProduct } from '../types/product';
import { mockCompetitors } from './mockData';
import axios from 'axios';
import { securityService } from './securityService';

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
    console.log('Поиск конкурентов:', { searchTerm, productId, currentPrice, showOnlyOzon, productName, useMockData: this.useMockData });

    if (this.useMockData) {
      const results = await this.getMockCompetitors(searchTerm, currentPrice, showOnlyOzon, productName);
      console.log('Моковые результаты:', results);
      return results;
    } else {
      try {
        console.log('🛡️ Безопасный поиск конкурентов через securityService')

        // Формируем URL с параметрами
        const params = new URLSearchParams({
          query: searchTerm,
          limit: '10',
          only_ozon: showOnlyOzon ? '1' : '0',
          product_name: productName
        });

        const url = `${this.apiUrl}?${params.toString()}`;

        // Запрос к реальному API через безопасный сервис
        const response = await securityService.secureRequest(url);

        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();

        // Преобразуем результаты в формат CompetitorProduct
        return data.products.map((product: any) => ({
          id: `wb-${product.id}`,
          competitorId: product.seller.id,
          competitorName: product.seller.name || 'Wildberries',
          productTitle: product.title,
          price: product.price,
          url: product.url || `https://wildberries.ru/catalog/${product.id}/detail.aspx`,
          lastUpdated: new Date(),
          isActive: true,
          imageUrl: product.image_url
        }));
      } catch (error) {
        console.error('Ошибка при поиске конкурентов:', error);
        // В случае ошибки возвращаем моковые данные
        return this.getMockCompetitors(searchTerm, currentPrice, showOnlyWB);
      }
    }
  }

  // Получение моковых данных о конкурентах
  private getMockCompetitors(
    searchTerm: string,
    currentPrice: number,
    showOnlyOzon: boolean = false,
    productName: string = ''
  ): Promise<CompetitorProduct[]> {
    return new Promise(resolve => {
      // Имитация задержки API
      setTimeout(() => {
        // Генерация случайных результатов поиска
        const results: CompetitorProduct[] = [];

        // Фильтруем конкурентов, если нужно только Ozon
        let availableCompetitors = [...mockCompetitors];
        if (showOnlyOzon) {
          availableCompetitors = availableCompetitors.filter(
            c => c.name.toLowerCase().includes('ozon') || c.url.toLowerCase().includes('ozon.ru')
          );
        }

        // Если после фильтрации не осталось конкурентов, добавляем Ozon
        if (availableCompetitors.length === 0) {
          availableCompetitors.push({
            id: 'comp-ozon',
            name: 'Ozon',
            url: 'https://ozon.ru'
          });
        }

        // Добавляем 5-10 случайных конкурентов
        const numberOfResults = Math.floor(Math.random() * 6) + 5;

        for (let i = 0; i < numberOfResults; i++) {
          const competitor = availableCompetitors[Math.floor(Math.random() * availableCompetitors.length)];
          const price = Math.round(currentPrice * (0.85 + Math.random() * 0.3));

          // Создаем объект конкурента
          const competitorProduct = {
            id: `comp-${Date.now()}-${i}`,
            competitorId: competitor.id,
            competitorName: competitor.name,
            productTitle: `${searchTerm} (${competitor.name})`,
            price,
            url: competitor.url + '/product/' + Math.floor(Math.random() * 1000000),
            lastUpdated: new Date(),
            isActive: true,
            imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(searchTerm.substring(0, 10))}`
          };

          console.log('Добавляем конкурента:', competitorProduct);

          results.push(competitorProduct);
        }

        resolve(results);
      }, 1000);
    });
  }
}

// Экспортируем единственный экземпляр сервиса
export const competitorSearchService = new CompetitorSearchService();
