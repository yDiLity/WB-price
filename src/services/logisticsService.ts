/**
 * Сервис для работы с логистическим API
 */
import axios from 'axios';
import {
  Delivery,
  StockData,
  OptimizePriceRequest,
  OptimizePriceResult,
  LogisticsSettings,
  LogisticsStats,
  CsvImportResult
} from '../types/logistics';

// Базовый URL для API
const API_BASE_URL = '/api/logistics';

/**
 * Сервис для работы с логистическим модулем
 */
class LogisticsService {
  /**
   * Получение оптимизированной цены для товара
   * @param request Данные для оптимизации цены
   */
  async optimizePrice(request: OptimizePriceRequest): Promise<OptimizePriceResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/optimize-price`, request);
      return response.data.data;
    } catch (error) {
      console.error('Error optimizing price:', error);
      throw new Error('Не удалось получить оптимизированную цену');
    }
  }

  /**
   * Получение данных об остатках товаров
   * @param productIds Массив ID товаров
   */
  async getStockData(productIds: string[]): Promise<StockData[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/get-stock`, { productIds });
      return response.data.data;
    } catch (error) {
      console.error('Error getting stock data:', error);
      throw new Error('Не удалось получить данные об остатках товаров');
    }
  }

  /**
   * Получение данных о поставках
   */
  async getDeliveries(): Promise<Delivery[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting deliveries:', error);
      throw new Error('Не удалось получить данные о поставках');
    }
  }

  /**
   * Добавление данных о поставке
   * @param delivery Данные о поставке
   */
  async addDelivery(delivery: Delivery): Promise<Delivery> {
    try {
      const response = await axios.post(`${API_BASE_URL}/deliveries`, delivery);
      return response.data.data;
    } catch (error) {
      console.error('Error adding delivery:', error);
      throw new Error('Не удалось добавить данные о поставке');
    }
  }

  /**
   * Импорт данных о поставках из CSV-файла
   * @param file CSV-файл с данными о поставках
   */
  async importCsv(file: File): Promise<CsvImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: response.data.success,
        message: response.data.message,
        importedCount: response.data.data.length,
        failedCount: 0,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw new Error('Не удалось импортировать данные из CSV-файла');
    }
  }

  /**
   * Получение статистики по логистике
   */
  async getLogisticsStats(): Promise<LogisticsStats> {
    // В реальном приложении здесь будет запрос к API
    // Для демонстрации возвращаем моковые данные
    return {
      totalProducts: 120,
      lowStockProducts: 15,
      outOfStockProducts: 5,
      upcomingDeliveries: 8,
      averageDeliveryTime: 5.3
    };
  }

  /**
   * Получение настроек логистического оптимизатора
   */
  async getLogisticsSettings(): Promise<LogisticsSettings> {
    // В реальном приложении здесь будет запрос к API
    // Для демонстрации возвращаем моковые данные
    return {
      enableAutomaticPriceAdjustment: true,
      lowStockThreshold: 10,
      criticalStockThreshold: 3,
      upcomingDeliveryThreshold: 7,
      rules: [
        {
          id: '1',
          name: 'Низкий остаток',
          description: 'Увеличение цены при низком остатке товара',
          condition: {
            type: 'stock',
            stockThreshold: 10
          },
          action: {
            type: 'increase',
            value: 10,
            isPercentage: true
          },
          isActive: true
        },
        {
          id: '2',
          name: 'Скорая поставка',
          description: 'Снижение цены при скорой поставке товара',
          condition: {
            type: 'delivery',
            deliveryDaysThreshold: 7
          },
          action: {
            type: 'decrease',
            value: 5,
            isPercentage: true
          },
          isActive: true
        }
      ]
    };
  }

  /**
   * Сохранение настроек логистического оптимизатора
   * @param settings Настройки логистического оптимизатора
   */
  async saveLogisticsSettings(settings: LogisticsSettings): Promise<boolean> {
    // В реальном приложении здесь будет запрос к API
    console.log('Saving logistics settings:', settings);
    return true;
  }
}

export default new LogisticsService();
