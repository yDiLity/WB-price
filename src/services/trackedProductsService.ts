/**
 * Сервис для синхронизации данных отслеживаемых товаров
 * Обеспечивает автоматическое обновление Excel-таблицы при изменениях в других компонентах
 */

// Интерфейс для событий синхронизации
export interface SyncEvent {
  type: 'competitor_linked' | 'price_changed' | 'strategy_applied' | 'monitoring_updated';
  productId: string;
  data: any;
  timestamp: Date;
  source: string; // Источник события (компонент)
}

// Класс для управления синхронизацией данных
export class TrackedProductsService {
  private static instance: TrackedProductsService;
  private listeners: ((event: SyncEvent) => void)[] = [];

  private constructor() {
    // Слушаем события из localStorage для синхронизации между вкладками
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
  }

  public static getInstance(): TrackedProductsService {
    if (!TrackedProductsService.instance) {
      TrackedProductsService.instance = new TrackedProductsService();
    }
    return TrackedProductsService.instance;
  }

  // Добавление слушателя событий
  public addListener(listener: (event: SyncEvent) => void): void {
    this.listeners.push(listener);
  }

  // Удаление слушателя событий
  public removeListener(listener: (event: SyncEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Отправка события о связывании конкурента
  public notifyCompetitorLinked(productId: string, competitor: any, source: string = 'unknown'): void {
    const event: SyncEvent = {
      type: 'competitor_linked',
      productId,
      data: { competitor },
      timestamp: new Date(),
      source
    };

    this.broadcastEvent(event);
  }

  // Отправка события об изменении цены
  public notifyPriceChanged(productId: string, oldPrice: number, newPrice: number, reason?: string, source: string = 'unknown'): void {
    const event: SyncEvent = {
      type: 'price_changed',
      productId,
      data: { oldPrice, newPrice, reason },
      timestamp: new Date(),
      source
    };

    this.broadcastEvent(event);
  }

  // Отправка события о применении стратегии
  public notifyStrategyApplied(productId: string, strategy: any, source: string = 'unknown'): void {
    const event: SyncEvent = {
      type: 'strategy_applied',
      productId,
      data: { strategy },
      timestamp: new Date(),
      source
    };

    this.broadcastEvent(event);
  }

  // Отправка события об обновлении мониторинга
  public notifyMonitoringUpdated(productId: string, updates: any, source: string = 'unknown'): void {
    const event: SyncEvent = {
      type: 'monitoring_updated',
      productId,
      data: updates,
      timestamp: new Date(),
      source
    };

    this.broadcastEvent(event);
  }

  // Рассылка события всем слушателям
  private broadcastEvent(event: SyncEvent): void {
    // Уведомляем локальных слушателей
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Ошибка в слушателе события:', error);
      }
    });

    // Сохраняем в localStorage для синхронизации между вкладками
    try {
      localStorage.setItem(`sync_event_${event.type}`, JSON.stringify(event));
      
      // Удаляем событие через небольшой промежуток времени
      setTimeout(() => {
        localStorage.removeItem(`sync_event_${event.type}`);
      }, 1000);
    } catch (error) {
      console.error('Ошибка сохранения события в localStorage:', error);
    }
  }

  // Обработка событий из localStorage
  private handleStorageEvent(e: StorageEvent): void {
    if (e.key && e.key.startsWith('sync_event_') && e.newValue) {
      try {
        const event: SyncEvent = JSON.parse(e.newValue);
        
        // Уведомляем слушателей о событии из другой вкладки
        this.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error('Ошибка в слушателе события из localStorage:', error);
          }
        });
      } catch (error) {
        console.error('Ошибка парсинга события из localStorage:', error);
      }
    }
  }

  // Получение истории событий
  public getEventHistory(): SyncEvent[] {
    try {
      const history = localStorage.getItem('sync_events_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Ошибка загрузки истории событий:', error);
      return [];
    }
  }

  // Сохранение события в историю
  private saveEventToHistory(event: SyncEvent): void {
    try {
      const history = this.getEventHistory();
      history.unshift(event);
      
      // Храним только последние 100 событий
      const trimmedHistory = history.slice(0, 100);
      
      localStorage.setItem('sync_events_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Ошибка сохранения события в историю:', error);
    }
  }

  // Очистка истории событий
  public clearEventHistory(): void {
    try {
      localStorage.removeItem('sync_events_history');
    } catch (error) {
      console.error('Ошибка очистки истории событий:', error);
    }
  }
}

// Экспортируем singleton instance
export const trackedProductsService = TrackedProductsService.getInstance();

// Хелперы для интеграции с компонентами

// Хук для использования в React компонентах
export const useTrackedProductsSync = () => {
  const service = TrackedProductsService.getInstance();

  return {
    // Методы для отправки событий
    notifyCompetitorLinked: (productId: string, competitor: any, source?: string) => 
      service.notifyCompetitorLinked(productId, competitor, source),
    
    notifyPriceChanged: (productId: string, oldPrice: number, newPrice: number, reason?: string, source?: string) => 
      service.notifyPriceChanged(productId, oldPrice, newPrice, reason, source),
    
    notifyStrategyApplied: (productId: string, strategy: any, source?: string) => 
      service.notifyStrategyApplied(productId, strategy, source),
    
    notifyMonitoringUpdated: (productId: string, updates: any, source?: string) => 
      service.notifyMonitoringUpdated(productId, updates, source),

    // Методы для подписки на события
    addListener: (listener: (event: SyncEvent) => void) => service.addListener(listener),
    removeListener: (listener: (event: SyncEvent) => void) => service.removeListener(listener),

    // Утилиты
    getEventHistory: () => service.getEventHistory(),
    clearEventHistory: () => service.clearEventHistory()
  };
};

// Функция для интеграции с существующими компонентами
export const integrateWithComponent = (componentName: string) => {
  const service = TrackedProductsService.getInstance();

  return {
    // Обертка для функций сохранения конкурентов
    wrapSaveCompetitors: (originalFunction: Function) => {
      return (...args: any[]) => {
        const result = originalFunction(...args);
        
        // Если функция возвращает Promise
        if (result && typeof result.then === 'function') {
          return result.then((data: any) => {
            // Извлекаем информацию о продукте и конкуренте
            if (data && data.productId && data.competitor) {
              service.notifyCompetitorLinked(data.productId, data.competitor, componentName);
            }
            return data;
          });
        }
        
        return result;
      };
    },

    // Обертка для функций изменения цены
    wrapPriceChange: (originalFunction: Function) => {
      return (...args: any[]) => {
        const result = originalFunction(...args);
        
        if (result && typeof result.then === 'function') {
          return result.then((data: any) => {
            if (data && data.productId && data.newPrice !== undefined) {
              service.notifyPriceChanged(
                data.productId, 
                data.oldPrice || 0, 
                data.newPrice, 
                data.reason,
                componentName
              );
            }
            return data;
          });
        }
        
        return result;
      };
    }
  };
};

// Экспорт для использования в других файлах
export default trackedProductsService;
