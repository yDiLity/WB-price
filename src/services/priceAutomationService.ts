/**
 * 🎯 СЕРВИС АВТОМАТИЧЕСКОГО РЕГУЛИРОВАНИЯ ЦЕН
 * 
 * Основная логика:
 * 1. Мониторинг цен конкурентов каждые 5 минут
 * 2. Применение стратегий ценообразования
 * 3. Автоматическое изменение цен на Ozon
 */

import { Product, CompetitorProduct } from '../types/product';
import { PricingStrategy } from '../components/product/StrategySelectionModal';
import { automationService } from './automationService';
import { ozonCompetitorService } from './ozonCompetitorService';
import { ozonApiService } from './ozonApi';

interface PriceAnalysisResult {
  currentPrice: number;
  competitorPrices: number[];
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  avgCompetitorPrice: number;
  recommendedPrice: number;
  priceChangeReason: string;
  shouldChangePrice: boolean;
}

class PriceAutomationService {
  private static instance: PriceAutomationService;
  private monitoringProducts: Map<string, {
    product: Product;
    competitors: CompetitorProduct[];
    strategy: PricingStrategy;
    lastCheck: Date;
  }> = new Map();

  private constructor() {
    this.startAutomaticMonitoring();
    console.log('🎯 PriceAutomationService initialized - automatic price regulation started');
  }

  public static getInstance(): PriceAutomationService {
    if (!PriceAutomationService.instance) {
      PriceAutomationService.instance = new PriceAutomationService();
    }
    return PriceAutomationService.instance;
  }

  /**
   * 🔗 Добавление товара в автоматический мониторинг
   */
  public addProductToMonitoring(
    product: Product,
    competitors: CompetitorProduct[],
    strategy: PricingStrategy
  ): void {
    console.log(`🔗 Adding product ${product.sku} to automatic monitoring with ${competitors.length} competitors`);
    
    this.monitoringProducts.set(product.id, {
      product,
      competitors,
      strategy,
      lastCheck: new Date()
    });

    // Включаем автоматическое обновление цен на Ozon
    automationService.toggleOzonAutoUpdate(product.id, true);

    // Сразу выполняем первую проверку
    this.checkProductPrice(product.id);

    console.log(`✅ Product ${product.sku} added to monitoring. Total monitored products: ${this.monitoringProducts.size}`);
  }

  /**
   * 🔍 Проверка и обновление цены конкретного товара
   */
  public async checkProductPrice(productId: string): Promise<void> {
    const monitoringData = this.monitoringProducts.get(productId);
    if (!monitoringData) {
      console.log(`❌ Product ${productId} not found in monitoring`);
      return;
    }

    const { product, competitors, strategy } = monitoringData;
    
    try {
      console.log(`🔍 Checking price for product ${product.sku}...`);

      // 1. Получаем актуальные цены конкурентов
      const updatedCompetitors = await this.updateCompetitorPrices(competitors);
      
      // 2. Анализируем цены и определяем рекомендуемую цену
      const analysis = this.analyzePrices(product, updatedCompetitors, strategy);
      
      // 3. Если нужно изменить цену - делаем это
      if (analysis.shouldChangePrice) {
        await this.applyPriceChange(product, analysis);
      }

      // 4. Обновляем время последней проверки
      monitoringData.lastCheck = new Date();
      
      console.log(`✅ Price check completed for ${product.sku}. Recommended: ${analysis.recommendedPrice}₽`);
      
    } catch (error) {
      console.error(`❌ Error checking price for product ${product.sku}:`, error);
    }
  }

  /**
   * 📊 Анализ цен и определение рекомендуемой цены
   */
  private analyzePrices(
    product: Product,
    competitors: CompetitorProduct[],
    strategy: PricingStrategy
  ): PriceAnalysisResult {
    const competitorPrices = competitors.map(c => c.price).filter(p => p > 0);
    
    if (competitorPrices.length === 0) {
      return {
        currentPrice: product.price.current,
        competitorPrices: [],
        minCompetitorPrice: 0,
        maxCompetitorPrice: 0,
        avgCompetitorPrice: 0,
        recommendedPrice: product.price.current,
        priceChangeReason: 'Нет данных о ценах конкурентов',
        shouldChangePrice: false
      };
    }

    const minPrice = Math.min(...competitorPrices);
    const maxPrice = Math.max(...competitorPrices);
    const avgPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;

    let recommendedPrice = product.price.current;
    let reason = '';

    // Применяем стратегию ценообразования
    switch (strategy.type) {
      case 'MATCH_LOWEST':
        recommendedPrice = minPrice;
        reason = `Соответствие минимальной цене конкурента (${minPrice}₽)`;
        break;

      case 'UNDERCUT':
        const reduction = strategy.parameters.percentReduction || 5;
        recommendedPrice = minPrice * (1 - reduction / 100);
        reason = `Подрезание минимальной цены на ${reduction}% (${recommendedPrice}₽)`;
        break;

      case 'PREMIUM':
        const premium = strategy.parameters.percentReduction || 10;
        recommendedPrice = avgPrice * (1 + premium / 100);
        reason = `Премиум стратегия: +${premium}% к средней цене (${recommendedPrice}₽)`;
        break;

      case 'CUSTOM':
        // Здесь можно реализовать кастомную формулу
        recommendedPrice = avgPrice;
        reason = 'Кастомная стратегия: средняя цена конкурентов';
        break;
    }

    // Применяем ограничения
    const minThreshold = strategy.parameters.minPrice || product.price.minThreshold || product.price.current * 0.8;
    const maxThreshold = strategy.parameters.maxPrice || product.price.current * 1.2;

    recommendedPrice = Math.max(minThreshold, Math.min(maxThreshold, recommendedPrice));

    // Определяем нужно ли менять цену
    const priceChangePercent = Math.abs((recommendedPrice - product.price.current) / product.price.current) * 100;
    const shouldChangePrice = priceChangePercent >= 1; // Меняем если разница больше 1%

    return {
      currentPrice: product.price.current,
      competitorPrices,
      minCompetitorPrice: minPrice,
      maxCompetitorPrice: maxPrice,
      avgCompetitorPrice: avgPrice,
      recommendedPrice: Math.round(recommendedPrice),
      priceChangeReason: reason,
      shouldChangePrice
    };
  }

  /**
   * 💰 Применение изменения цены
   */
  private async applyPriceChange(product: Product, analysis: PriceAnalysisResult): Promise<void> {
    try {
      console.log(`💰 Applying price change for ${product.sku}: ${analysis.currentPrice}₽ → ${analysis.recommendedPrice}₽`);

      // Используем automationService для изменения цены
      const attempt = await automationService.attemptPriceChange(
        product.id,
        analysis.currentPrice,
        analysis.recommendedPrice,
        analysis.priceChangeReason,
        'competitor_price'
      );

      if (attempt.status === 'success') {
        console.log(`✅ Price successfully changed for ${product.sku} to ${analysis.recommendedPrice}₽`);
        
        // Обновляем цену в продукте (в реальном приложении это будет через API)
        product.price.current = analysis.recommendedPrice;
        
      } else if (attempt.status === 'blocked') {
        console.log(`🚫 Price change blocked for ${product.sku}: ${attempt.reason}`);
        
      } else if (attempt.status === 'failed') {
        console.log(`❌ Price change failed for ${product.sku}: ${attempt.ozonError}`);
      }

    } catch (error) {
      console.error(`❌ Error applying price change for ${product.sku}:`, error);
    }
  }

  /**
   * 🔄 Обновление цен конкурентов
   */
  private async updateCompetitorPrices(competitors: CompetitorProduct[]): Promise<CompetitorProduct[]> {
    // В реальном приложении здесь будет парсинг цен с сайтов конкурентов
    // Пока симулируем небольшие изменения цен
    return competitors.map(competitor => ({
      ...competitor,
      price: competitor.price + (Math.random() - 0.5) * 100, // ±50₽ случайное изменение
      lastUpdated: new Date()
    }));
  }

  /**
   * ⏰ Запуск автоматического мониторинга
   */
  private startAutomaticMonitoring(): void {
    setInterval(() => {
      this.performMonitoringCycle();
    }, 5 * 60 * 1000); // Каждые 5 минут

    console.log('⏰ Automatic monitoring started - checking every 5 minutes');
  }

  /**
   * 🔄 Выполнение цикла мониторинга
   */
  private async performMonitoringCycle(): Promise<void> {
    if (this.monitoringProducts.size === 0) {
      return;
    }

    console.log(`🔄 Starting monitoring cycle for ${this.monitoringProducts.size} products...`);

    for (const [productId] of this.monitoringProducts) {
      await this.checkProductPrice(productId);
      
      // Небольшая задержка между проверками
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Monitoring cycle completed');
  }

  /**
   * 📊 Получение статистики мониторинга
   */
  public getMonitoringStats() {
    return {
      totalProducts: this.monitoringProducts.size,
      products: Array.from(this.monitoringProducts.values()).map(data => ({
        productId: data.product.id,
        sku: data.product.sku,
        title: data.product.title,
        currentPrice: data.product.price.current,
        competitorsCount: data.competitors.length,
        strategyType: data.strategy.type,
        lastCheck: data.lastCheck
      }))
    };
  }

  /**
   * 🗑️ Удаление товара из мониторинга
   */
  public removeProductFromMonitoring(productId: string): void {
    if (this.monitoringProducts.delete(productId)) {
      automationService.toggleOzonAutoUpdate(productId, false);
      console.log(`🗑️ Product ${productId} removed from monitoring`);
    }
  }
}

export const priceAutomationService = PriceAutomationService.getInstance();
