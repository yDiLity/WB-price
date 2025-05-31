/**
 * Сервис для работы со стратегиями ценообразования
 */

import { Product, CompetitorProduct } from '../types/product';
import { PricingStrategy, PricingStrategyType } from '../components/product/StrategySelectionModal';
import { priceChangeService } from './priceChangeService';

class StrategyService {
  private strategies: Map<string, PricingStrategy> = new Map();
  private storageKey = 'ozon_price_optimizer_strategies';

  constructor() {
    // Загружаем стратегии из localStorage
    this.loadFromLocalStorage();
    // Инициализируем базовые стратегии
    this.initializeDefaultStrategies();
  }

  /**
   * Загрузка стратегий из localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const savedStrategies = localStorage.getItem(this.storageKey);
      if (savedStrategies) {
        const parsedStrategies = JSON.parse(savedStrategies);
        parsedStrategies.forEach((strategy: PricingStrategy) => {
          this.strategies.set(strategy.id, strategy);
        });
        console.log('Загружены стратегии из localStorage:', this.strategies.size);
      }
    } catch (error) {
      console.error('Error loading strategies from localStorage:', error);
    }
  }

  /**
   * Сохранение стратегий в localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const strategiesArray = Array.from(this.strategies.values());
      localStorage.setItem(this.storageKey, JSON.stringify(strategiesArray));
      console.log('Стратегии сохранены в localStorage:', strategiesArray.length);
    } catch (error) {
      console.error('Error saving strategies to localStorage:', error);
    }
  }

  /**
   * Инициализация базовых стратегий
   */
  private initializeDefaultStrategies(): void {
    // Стратегия "Соответствие минимальной цене"
    const matchLowestStrategy: PricingStrategy = {
      id: 'strategy-match-lowest',
      name: 'Соответствие минимальной цене',
      type: PricingStrategyType.MATCH_LOWEST,
      description: 'Устанавливает цену равной минимальной цене конкурентов',
      parameters: {
        checkFrequency: 60, // в минутах
        applyAutomatically: true
      }
    };

    // Стратегия "Снижение на 5%"
    const undercut5PercentStrategy: PricingStrategy = {
      id: 'strategy-undercut-5-percent',
      name: 'Снижение на 5%',
      type: PricingStrategyType.UNDERCUT_BY_PERCENT,
      description: 'Устанавливает цену на 5% ниже минимальной цены конкурентов',
      parameters: {
        percentReduction: 5,
        checkFrequency: 60,
        applyAutomatically: true
      }
    };

    // Стратегия "Снижение на 100 рублей"
    const undercut100Strategy: PricingStrategy = {
      id: 'strategy-undercut-100',
      name: 'Снижение на 100 рублей',
      type: PricingStrategyType.UNDERCUT_BY_AMOUNT,
      description: 'Устанавливает цену на 100 рублей ниже минимальной цены конкурентов',
      parameters: {
        amountReduction: 100,
        checkFrequency: 60,
        applyAutomatically: true
      }
    };

    // Стратегия "Средняя цена конкурентов"
    const averagePriceStrategy: PricingStrategy = {
      id: 'strategy-average-price',
      name: 'Средняя цена конкурентов',
      type: PricingStrategyType.AVERAGE_PRICE,
      description: 'Устанавливает цену равной средней цене конкурентов',
      parameters: {
        checkFrequency: 60,
        applyAutomatically: true
      }
    };

    // Добавляем стратегии в Map
    this.strategies.set(matchLowestStrategy.id, matchLowestStrategy);
    this.strategies.set(undercut5PercentStrategy.id, undercut5PercentStrategy);
    this.strategies.set(undercut100Strategy.id, undercut100Strategy);
    this.strategies.set(averagePriceStrategy.id, averagePriceStrategy);
  }

  /**
   * Получение стратегии по ID
   */
  getStrategyById(strategyId: string): PricingStrategy | undefined {
    return this.strategies.get(strategyId);
  }

  /**
   * Получение всех стратегий
   */
  getAllStrategies(): PricingStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Создание новой стратегии
   */
  createStrategy(strategy: PricingStrategy): PricingStrategy {
    this.strategies.set(strategy.id, strategy);
    this.saveToLocalStorage();
    return strategy;
  }

  /**
   * Обновление стратегии
   */
  updateStrategy(strategy: PricingStrategy): PricingStrategy | undefined {
    if (!this.strategies.has(strategy.id)) {
      return undefined;
    }

    this.strategies.set(strategy.id, strategy);
    return strategy;
  }

  /**
   * Удаление стратегии
   */
  deleteStrategy(strategyId: string): boolean {
    return this.strategies.delete(strategyId);
  }

  /**
   * Применение стратегии к товару
   */
  applyStrategy(product: Product, strategyId: string, competitors: CompetitorProduct[]): void {
    console.log('applyStrategy вызван с параметрами:', {
      productId: product.id,
      productTitle: product.title,
      strategyId,
      competitorsCount: competitors.length
    });

    // Проверяем, есть ли стратегия с указанным ID
    const strategy = this.getStrategyById(strategyId);
    console.log('Найдена стратегия:', strategy);

    if (!strategy) {
      console.error(`Стратегия с ID ${strategyId} не найдена`);
      // Если стратегия не найдена, создаем моковую стратегию
      const mockStrategy = {
        id: strategyId,
        name: 'Снижение на 5%',
        type: 'undercut_by_percent' as any,
        parameters: {
          percentReduction: 5
        }
      };
      console.log('Создана моковая стратегия:', mockStrategy);

      // Генерируем изменение цены на основе моковой стратегии
      console.log('Генерируем изменение цены на основе моковой стратегии и конкурентов');
      const priceChange = priceChangeService.generatePriceChange(product, mockStrategy as any, competitors);
      console.log('Результат генерации изменения цены с моковой стратегией:', priceChange);

      if (priceChange) {
        // Добавляем изменение цены в сервис
        priceChangeService.addPriceChange(priceChange);
        console.log(`Сгенерировано изменение цены для товара ${product.title} на основе моковой стратегии`);
        console.log('Все изменения цен:', priceChangeService.getAllPriceChanges());
      }

      return;
    }

    if (!competitors || competitors.length === 0) {
      console.error('Нет связанных конкурентов для применения стратегии');
      return;
    }

    console.log('Генерируем изменение цены на основе стратегии и конкурентов');
    // Генерируем изменение цены на основе стратегии и конкурентов
    const priceChange = priceChangeService.generatePriceChange(product, strategy, competitors);
    console.log('Результат генерации изменения цены:', priceChange);

    if (priceChange) {
      // Добавляем изменение цены в сервис
      priceChangeService.addPriceChange(priceChange);

      console.log(`Сгенерировано изменение цены для товара ${product.title} на основе стратегии ${strategy.name}`);
      console.log('Все изменения цен:', priceChangeService.getAllPriceChanges().length);
      console.log('Первое изменение цены:', priceChangeService.getAllPriceChanges()[0]);
    } else {
      console.log(`Не удалось сгенерировать изменение цены для товара ${product.title}`);
    }
  }
}

// Экспортируем экземпляр сервиса
export const strategyService = new StrategyService();
