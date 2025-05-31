import { OzonApiService } from './ozonApiService';
import { OzonApiCredentials } from '../types/auth';
import { productService } from './productService'; // Импортируем моковый сервис для использования в режиме разработки
import { ozonProductService } from './ozonProductService'; // Импортируем моковый сервис для товаров Ozon

// Класс-фабрика для создания экземпляров OzonApiService
export class OzonApiServiceFactory {
  private static instance: OzonApiServiceFactory;
  private serviceInstances: Map<string, OzonApiService> = new Map();
  private mockMode: boolean = true; // По умолчанию используем моковый режим в браузере

  private constructor() {}

  // Получение единственного экземпляра фабрики (Singleton)
  public static getInstance(): OzonApiServiceFactory {
    if (!OzonApiServiceFactory.instance) {
      OzonApiServiceFactory.instance = new OzonApiServiceFactory();
    }
    return OzonApiServiceFactory.instance;
  }

  // Создание или получение существующего экземпляра сервиса API для пользователя
  public getServiceForUser(userId: string, credentials: OzonApiCredentials): OzonApiService {
    // Если сервис для этого пользователя уже создан, возвращаем его
    if (this.serviceInstances.has(userId)) {
      return this.serviceInstances.get(userId)!;
    }

    // Создаем новый экземпляр сервиса
    const service = new OzonApiService(credentials);
    this.serviceInstances.set(userId, service);
    return service;
  }

  // Проверка валидности учетных данных API
  public async validateCredentials(credentials: OzonApiCredentials): Promise<boolean> {
    // В режиме разработки всегда возвращаем true
    if (this.mockMode) {
      console.log('Работаем в режиме разработки, пропускаем проверку учетных данных API');
      return true;
    }

    // Создаем временный экземпляр сервиса для проверки
    const tempService = new OzonApiService(credentials);
    return await tempService.validateCredentials();
  }

  // Удаление экземпляра сервиса для пользователя (например, при выходе из системы)
  public removeServiceForUser(userId: string): void {
    if (this.serviceInstances.has(userId)) {
      this.serviceInstances.delete(userId);
    }
  }

  // Получение сервиса товаров (реальный API или моковый в зависимости от режима)
  public getProductService(userId: string, credentials: OzonApiCredentials | null, serviceType: 'general' | 'ozon' = 'general'): any {
    // В режиме разработки или если нет учетных данных, используем моковый сервис
    if (this.mockMode || !credentials) {
      console.log(`Используем моковый сервис товаров (тип: ${serviceType})`);

      // Возвращаем соответствующий сервис в зависимости от типа
      if (serviceType === 'ozon') {
        return ozonProductService;
      } else {
        return productService;
      }
    }

    // Иначе используем реальный API Ozon
    return this.getServiceForUser(userId, credentials);
  }

  // Установка режима работы (моковый или реальный API)
  public setMockMode(mockMode: boolean): void {
    this.mockMode = mockMode;
    console.log(`Режим работы с API: ${mockMode ? 'моковый' : 'реальный'}`);
  }
}
