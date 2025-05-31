/**
 * 🔗 Сервис для работы с API Wildberries
 * Обертка для официального API WB
 */

interface WBApiCredentials {
  apiKey: string;
  supplierId: string;
  isValid: boolean;
}

interface WBApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

class WBApiService {
  private credentials: WBApiCredentials | null = null;
  private config: WBApiConfig = {
    baseUrl: 'https://suppliers-api.wildberries.ru',
    timeout: 30000,
    retryAttempts: 3
  };

  /**
   * 🔑 Инициализация API с учетными данными
   */
  initialize(credentials: WBApiCredentials): void {
    this.credentials = credentials;
    console.log('🔗 WB API инициализирован');
  }

  /**
   * ✅ Проверка инициализации API
   */
  isInitialized(): boolean {
    return this.credentials !== null && this.credentials.isValid;
  }

  /**
   * 🔍 Получение информации о товарах
   */
  async getProducts(): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('WB API не инициализирован');
    }

    try {
      const response = await this.makeRequest('/api/v1/supplier/incomes');
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения товаров:', error);
      return [];
    }
  }

  /**
   * 💰 Получение цен товаров
   */
  async getPrices(articleNumbers: string[]): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('WB API не инициализирован');
    }

    try {
      const response = await this.makeRequest('/public/api/v1/info', {
        method: 'POST',
        body: JSON.stringify({ quantity: 0 })
      });
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения цен:', error);
      return [];
    }
  }

  /**
   * 📊 Получение статистики продаж
   */
  async getSalesStats(dateFrom: string, dateTo: string): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('WB API не инициализирован');
    }

    try {
      const response = await this.makeRequest(`/api/v1/supplier/sales?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return [];
    }
  }

  /**
   * 🔄 Обновление цены товара
   */
  async updatePrice(articleNumber: string, price: number): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('WB API не инициализирован');
    }

    try {
      const response = await this.makeRequest('/public/api/v1/prices', {
        method: 'POST',
        body: JSON.stringify([{
          nmId: articleNumber,
          price: price
        }])
      });
      
      return response.success || false;
    } catch (error) {
      console.error('Ошибка обновления цены:', error);
      return false;
    }
  }

  /**
   * 🌐 Выполнение запроса к API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.credentials) {
      throw new Error('API не инициализирован');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Authorization': this.credentials.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      timeout: this.config.timeout
    };

    let lastError: Error | null = null;

    // Повторные попытки
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`🔗 WB API запрос (попытка ${attempt}): ${endpoint}`);
        
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ WB API успешный ответ: ${endpoint}`);
        
        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Неизвестная ошибка');
        console.warn(`⚠️ WB API ошибка (попытка ${attempt}):`, lastError.message);
        
        if (attempt < this.config.retryAttempts) {
          // Экспоненциальная задержка между попытками
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Все попытки запроса исчерпаны');
  }

  /**
   * 🔧 Обновление конфигурации
   */
  updateConfig(newConfig: Partial<WBApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 📊 Получение статуса API
   */
  getStatus(): {
    isInitialized: boolean;
    hasCredentials: boolean;
    baseUrl: string;
    supplierId?: string;
  } {
    return {
      isInitialized: this.isInitialized(),
      hasCredentials: this.credentials !== null,
      baseUrl: this.config.baseUrl,
      supplierId: this.credentials?.supplierId
    };
  }

  /**
   * 🧪 Тестирование подключения
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    if (!this.isInitialized()) {
      return {
        success: false,
        message: 'API не инициализирован'
      };
    }

    const startTime = Date.now();

    try {
      // Простой тестовый запрос
      await this.makeRequest('/ping');
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: 'Подключение успешно',
        responseTime
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка подключения'
      };
    }
  }

  /**
   * 🚪 Отключение от API
   */
  disconnect(): void {
    this.credentials = null;
    console.log('🔗 WB API отключен');
  }
}

// Экспортируем singleton
export const wbApiService = new WBApiService();
export default WBApiService;
export type { WBApiCredentials, WBApiConfig };
