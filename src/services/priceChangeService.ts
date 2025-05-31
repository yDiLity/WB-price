/**
 * Сервис для генерации и управления изменениями цен на основе стратегий и связанных конкурентов
 */

import { Product, CompetitorProduct } from '../types/product';
import { PricingStrategy, PricingStrategyType } from '../components/product/StrategySelectionModal';

// Интерфейс для изменения цены
export interface PriceChange {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  changeAmount: number;
  reason: string;
  strategyId?: string;
  strategyName?: string;
  timestamp: Date;
  status: 'pending' | 'applied' | 'rejected' | 'failed';
  competitorId?: string;
  competitorName?: string;
  competitorPrice?: number;
}

// Хранилище изменений цен
class PriceChangeService {
  private priceChanges: PriceChange[] = [];
  private deletedChangeIds: string[] = [];

  constructor() {
    // Загружаем удаленные ID из localStorage при инициализации
    const savedDeletedIds = localStorage.getItem('deletedRowIds');
    if (savedDeletedIds) {
      this.deletedChangeIds = JSON.parse(savedDeletedIds);
      console.log('Загружены удаленные ID из localStorage:', this.deletedChangeIds.length);
    }

    // Загружаем сохраненные изменения цен из localStorage
    const savedPriceChanges = localStorage.getItem('priceChanges');
    if (savedPriceChanges) {
      try {
        const parsedChanges = JSON.parse(savedPriceChanges);

        // Преобразуем строки дат обратно в объекты Date
        this.priceChanges = parsedChanges.map((change: any) => ({
          ...change,
          timestamp: new Date(change.timestamp)
        }));

        console.log('Загружены изменения цен из localStorage:', this.priceChanges.length);
      } catch (error) {
        console.error('Ошибка при загрузке изменений цен из localStorage:', error);
      }
    } else {
      console.log('Нет сохраненных изменений цен в localStorage');
    }
  }

  /**
   * Генерация изменения цены на основе стратегии и конкурентов
   */
  generatePriceChange(
    product: Product,
    strategy: PricingStrategy,
    competitors: CompetitorProduct[]
  ): PriceChange | null {
    console.log('generatePriceChange вызван с параметрами:', {
      productId: product.id,
      productTitle: product.title,
      strategyId: strategy.id,
      strategyType: strategy.type,
      competitorsCount: competitors.length
    });

    if (!product || !strategy || !competitors || competitors.length === 0) {
      console.error('Недостаточно данных для генерации изменения цены');
      return null;
    }

    // Получаем текущую цену товара
    const currentPrice = product.price.current;
    console.log('Текущая цена товара:', currentPrice);

    // Получаем минимальную цену товара (если задана)
    const minPrice = product.price.minThreshold || product.price.costPrice ?
      (product.price.costPrice as number) * 1.1 : // Минимальная цена = себестоимость + 10%
      currentPrice * 0.7; // Если себестоимость не задана, то минимальная цена = 70% от текущей
    console.log('Минимальная цена товара:', minPrice);

    // Получаем цены конкурентов
    const competitorPrices = competitors.map(comp => comp.price);
    console.log('Цены конкурентов:', competitorPrices);

    // Находим минимальную цену конкурентов
    const minCompetitorPrice = Math.min(...competitorPrices);
    console.log('Минимальная цена конкурентов:', minCompetitorPrice);

    // Находим конкурента с минимальной ценой
    const cheapestCompetitor = competitors.find(comp => comp.price === minCompetitorPrice);
    console.log('Конкурент с минимальной ценой:', cheapestCompetitor);

    // Рассчитываем новую цену в зависимости от стратегии
    let newPrice = currentPrice;
    let reason = '';

    console.log('Применяем стратегию:', strategy.type);

    switch (strategy.type) {
      case PricingStrategyType.MATCH_LOWEST:
        // Соответствие минимальной цене конкурента
        newPrice = minCompetitorPrice;
        reason = 'Соответствие минимальной цене конкурента';
        break;

      case PricingStrategyType.UNDERCUT_BY_PERCENT:
        // Снижение на процент от минимальной цены конкурента
        const percentReduction = strategy.parameters.percentReduction || 5;
        newPrice = minCompetitorPrice * (1 - percentReduction / 100);
        reason = `Снижение на ${percentReduction}% от цены конкурента`;
        break;

      case PricingStrategyType.UNDERCUT_BY_AMOUNT:
        // Снижение на фиксированную сумму от минимальной цены конкурента
        const amountReduction = strategy.parameters.amountReduction || 100;
        newPrice = minCompetitorPrice - amountReduction;
        reason = `Снижение на ${amountReduction} ₽ от цены конкурента`;
        break;

      case PricingStrategyType.AVERAGE_PRICE:
        // Установка средней цены конкурентов
        const avgPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
        newPrice = avgPrice;
        reason = 'Установка средней цены конкурентов';
        break;

      case PricingStrategyType.CUSTOM:
        // Пользовательская стратегия (используем формулу)
        try {
          const formula = strategy.parameters.customFormula || 'min(competitors)';
          console.log('Применяем пользовательскую формулу:', formula);

          // Простая реализация для базовых формул
          if (formula === 'min(competitors)') {
            newPrice = minCompetitorPrice;
          } else if (formula === 'min(competitors) - 100') {
            newPrice = minCompetitorPrice - 100;
          } else if (formula === 'min(competitors) * 0.95') {
            newPrice = minCompetitorPrice * 0.95;
          } else {
            // Для более сложных формул можно использовать библиотеку для парсинга и вычисления выражений
            newPrice = minCompetitorPrice * 0.95;
          }

          reason = 'Применение пользовательской формулы';
        } catch (error) {
          console.error('Ошибка при вычислении пользовательской формулы:', error);
          return null;
        }
        break;

      default:
        console.error('Неизвестный тип стратегии:', strategy.type);
        return null;
    }

    console.log('Рассчитанная новая цена:', newPrice);

    // Проверяем, что новая цена не ниже минимальной
    if (newPrice < minPrice) {
      newPrice = minPrice;
      reason += ' (ограничено минимальной ценой)';
      console.log('Цена ограничена минимальной:', newPrice);
    }

    // Округляем новую цену до целого числа
    newPrice = Math.round(newPrice);
    console.log('Округленная новая цена:', newPrice);

    // Если новая цена равна текущей, не создаем изменение
    if (newPrice === currentPrice) {
      console.log('Новая цена равна текущей, изменение не создается');
      return null;
    }

    // Рассчитываем процент и сумму изменения
    const changeAmount = newPrice - currentPrice;
    const changePercent = Math.round((changeAmount / currentPrice) * 100);
    console.log('Изменение цены:', { changeAmount, changePercent });

    // Создаем уникальный ID для изменения
    const changeId = `change-${Date.now()}-${product.id}`;

    // Создаем объект изменения цены
    const priceChange: PriceChange = {
      id: changeId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
      oldPrice: currentPrice,
      newPrice,
      changePercent,
      changeAmount,
      reason,
      strategyId: strategy.id,
      strategyName: strategy.name,
      timestamp: new Date(),
      status: 'pending',
      competitorId: cheapestCompetitor?.competitorId,
      competitorName: cheapestCompetitor?.competitorName,
      competitorPrice: minCompetitorPrice
    };

    console.log('Создан объект изменения цены:', priceChange);

    // Добавляем изменение цены в хранилище сразу
    this.addPriceChange(priceChange);
    console.log('Изменение цены добавлено в хранилище автоматически');
    console.log('Текущее количество изменений в хранилище:', this.priceChanges.length);

    return priceChange;
  }

  /**
   * Добавление изменения цены в хранилище
   */
  addPriceChange(priceChange: PriceChange): void {
    console.log('addPriceChange вызван с параметрами:', {
      id: priceChange.id,
      productId: priceChange.productId,
      oldPrice: priceChange.oldPrice,
      newPrice: priceChange.newPrice
    });

    // Проверяем, не было ли это изменение удалено ранее
    if (this.deletedChangeIds.includes(priceChange.id)) {
      console.log('Изменение было удалено ранее, не добавляем');
      return;
    }

    // Проверяем, не существует ли уже изменение с таким ID
    const existingIndex = this.priceChanges.findIndex(change => change.id === priceChange.id);
    if (existingIndex !== -1) {
      console.log('Изменение с таким ID уже существует, обновляем');
      this.priceChanges[existingIndex] = priceChange;
    } else {
      // Добавляем новое изменение
      this.priceChanges.push(priceChange);
      console.log('Новое изменение добавлено в хранилище');
    }

    // Сортируем изменения по времени (сначала новые)
    this.priceChanges.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    console.log('Всего изменений в хранилище:', this.priceChanges.length);

    // Сохраняем изменения в localStorage для отладки
    try {
      localStorage.setItem('priceChanges', JSON.stringify(this.priceChanges));
      console.log('Изменения сохранены в localStorage');
    } catch (error) {
      console.error('Ошибка при сохранении изменений в localStorage:', error);
    }
  }

  /**
   * Получение всех изменений цен
   */
  getAllPriceChanges(): PriceChange[] {
    console.log('getAllPriceChanges вызван, возвращаем', this.priceChanges.length, 'изменений');

    // Если изменений нет, пытаемся загрузить их из localStorage
    if (this.priceChanges.length === 0) {
      const savedPriceChanges = localStorage.getItem('priceChanges');
      if (savedPriceChanges) {
        try {
          const parsedChanges = JSON.parse(savedPriceChanges);

          // Преобразуем строки дат обратно в объекты Date
          this.priceChanges = parsedChanges.map((change: any) => ({
            ...change,
            timestamp: new Date(change.timestamp)
          }));

          console.log('Загружены изменения цен из localStorage:', this.priceChanges.length);
        } catch (error) {
          console.error('Ошибка при загрузке изменений цен из localStorage:', error);
        }
      }
    }

    return this.priceChanges;
  }

  /**
   * Получение изменений цен для конкретного товара
   */
  getPriceChangesForProduct(productId: string): PriceChange[] {
    return this.priceChanges.filter(change => change.productId === productId);
  }

  /**
   * Применение изменения цены
   */
  applyPriceChange(changeId: string): void {
    this.priceChanges = this.priceChanges.map(change =>
      change.id === changeId ? { ...change, status: 'applied' } : change
    );
  }

  /**
   * Отклонение изменения цены
   */
  rejectPriceChange(changeId: string): void {
    this.priceChanges = this.priceChanges.map(change =>
      change.id === changeId ? { ...change, status: 'rejected' } : change
    );
  }

  /**
   * Удаление изменения цены
   */
  deletePriceChange(changeId: string): void {
    this.priceChanges = this.priceChanges.filter(change => change.id !== changeId);

    // Добавляем ID в список удаленных
    this.deletedChangeIds.push(changeId);

    // Сохраняем список удаленных ID в localStorage
    localStorage.setItem('deletedRowIds', JSON.stringify(this.deletedChangeIds));
  }

  /**
   * Очистка всех изменений цен
   */
  clearAllPriceChanges(): void {
    // Добавляем все ID в список удаленных
    const allIds = this.priceChanges.map(change => change.id);
    this.deletedChangeIds = [...this.deletedChangeIds, ...allIds];

    // Сохраняем список удаленных ID в localStorage
    localStorage.setItem('deletedRowIds', JSON.stringify(this.deletedChangeIds));

    // Очищаем список изменений
    this.priceChanges = [];
  }
}

// Экспортируем экземпляр сервиса
export const priceChangeService = new PriceChangeService();
