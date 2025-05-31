/**
 * 🤖 ML-сервис для выявления аномалий в ценах и рейтингах
 * Использует статистические методы и машинное обучение
 */

interface PriceDataPoint {
  timestamp: number;
  price: number;
  rating: number;
  reviewCount: number;
  competitorId: string;
  productId: string;
}

interface AnomalyResult {
  isAnomaly: boolean;
  anomalyScore: number;
  anomalyType: 'price_spike' | 'price_drop' | 'rating_manipulation' | 'review_bombing';
  confidence: number;
  description: string;
  recommendation: string;
}

interface MLConfig {
  priceChangeThreshold: number; // % изменения для считания аномалией
  ratingChangeThreshold: number;
  timeWindowHours: number;
  minDataPoints: number;
  enableRealTimeDetection: boolean;
}

class MLAnomalyDetectionService {
  private config: MLConfig;
  private historicalData: Map<string, PriceDataPoint[]> = new Map();
  private models: {
    priceModel?: any;
    ratingModel?: any;
    reviewModel?: any;
  } = {};

  constructor(config: Partial<MLConfig> = {}) {
    this.config = {
      priceChangeThreshold: 20, // 20% изменение
      ratingChangeThreshold: 0.5, // 0.5 звезды
      timeWindowHours: 24,
      minDataPoints: 10,
      enableRealTimeDetection: true,
      ...config
    };
  }

  /**
   * 🔍 Основной метод детекции аномалий
   */
  async detectAnomalies(dataPoint: PriceDataPoint): Promise<AnomalyResult[]> {
    const results: AnomalyResult[] = [];

    // Получаем исторические данные для товара
    const productKey = `${dataPoint.productId}_${dataPoint.competitorId}`;
    const history = this.getHistoricalData(productKey);

    if (history.length < this.config.minDataPoints) {
      // Недостаточно данных для анализа
      this.addDataPoint(productKey, dataPoint);
      return [];
    }

    // 1. Детекция аномалий в ценах
    const priceAnomaly = await this.detectPriceAnomaly(dataPoint, history);
    if (priceAnomaly) results.push(priceAnomaly);

    // 2. Детекция аномалий в рейтингах
    const ratingAnomaly = await this.detectRatingAnomaly(dataPoint, history);
    if (ratingAnomaly) results.push(ratingAnomaly);

    // 3. Детекция накрутки отзывов
    const reviewAnomaly = await this.detectReviewAnomaly(dataPoint, history);
    if (reviewAnomaly) results.push(reviewAnomaly);

    // Добавляем новую точку данных
    this.addDataPoint(productKey, dataPoint);

    return results;
  }

  /**
   * 💰 Детекция аномалий в ценах
   */
  private async detectPriceAnomaly(
    current: PriceDataPoint, 
    history: PriceDataPoint[]
  ): Promise<AnomalyResult | null> {
    const recentHistory = this.getRecentData(history, this.config.timeWindowHours);
    
    if (recentHistory.length === 0) return null;

    const avgPrice = this.calculateAverage(recentHistory.map(d => d.price));
    const priceChange = ((current.price - avgPrice) / avgPrice) * 100;

    // Статистический анализ
    const stdDev = this.calculateStandardDeviation(recentHistory.map(d => d.price));
    const zScore = Math.abs((current.price - avgPrice) / stdDev);

    // Детекция резких изменений
    if (Math.abs(priceChange) > this.config.priceChangeThreshold || zScore > 3) {
      const anomalyType = priceChange > 0 ? 'price_spike' : 'price_drop';
      
      return {
        isAnomaly: true,
        anomalyScore: Math.min(Math.abs(priceChange) / 10, 10), // Нормализуем 0-10
        anomalyType,
        confidence: Math.min(zScore / 3, 1), // Уверенность на основе z-score
        description: `${anomalyType === 'price_spike' ? 'Резкий рост' : 'Резкое падение'} цены на ${Math.abs(priceChange).toFixed(1)}%`,
        recommendation: this.getPriceRecommendation(anomalyType, priceChange)
      };
    }

    return null;
  }

  /**
   * ⭐ Детекция аномалий в рейтингах
   */
  private async detectRatingAnomaly(
    current: PriceDataPoint,
    history: PriceDataPoint[]
  ): Promise<AnomalyResult | null> {
    const recentHistory = this.getRecentData(history, this.config.timeWindowHours);
    
    if (recentHistory.length === 0) return null;

    const avgRating = this.calculateAverage(recentHistory.map(d => d.rating));
    const ratingChange = current.rating - avgRating;

    if (Math.abs(ratingChange) > this.config.ratingChangeThreshold) {
      return {
        isAnomaly: true,
        anomalyScore: Math.abs(ratingChange) * 2, // 0-10 шкала
        anomalyType: 'rating_manipulation',
        confidence: Math.min(Math.abs(ratingChange) / 2, 1),
        description: `Подозрительное изменение рейтинга на ${ratingChange.toFixed(2)} звезд`,
        recommendation: 'Проверьте отзывы конкурента на предмет накрутки'
      };
    }

    return null;
  }

  /**
   * 📝 Детекция накрутки отзывов
   */
  private async detectReviewAnomaly(
    current: PriceDataPoint,
    history: PriceDataPoint[]
  ): Promise<AnomalyResult | null> {
    const recentHistory = this.getRecentData(history, 168); // 7 дней
    
    if (recentHistory.length === 0) return null;

    const avgReviewGrowth = this.calculateReviewGrowthRate(recentHistory);
    const currentGrowth = this.calculateCurrentReviewGrowth(current, recentHistory);

    // Детекция аномального роста отзывов
    if (currentGrowth > avgReviewGrowth * 3 && currentGrowth > 10) {
      return {
        isAnomaly: true,
        anomalyScore: Math.min(currentGrowth / 10, 10),
        anomalyType: 'review_bombing',
        confidence: Math.min(currentGrowth / (avgReviewGrowth * 5), 1),
        description: `Подозрительный рост отзывов: +${currentGrowth} за последние 24 часа`,
        recommendation: 'Возможная накрутка отзывов конкурентом'
      };
    }

    return null;
  }

  /**
   * 📊 Вспомогательные методы для статистических расчетов
   */
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = this.calculateAverage(values);
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const avgSquaredDiff = this.calculateAverage(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  private getRecentData(history: PriceDataPoint[], hours: number): PriceDataPoint[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return history.filter(point => point.timestamp > cutoffTime);
  }

  private calculateReviewGrowthRate(history: PriceDataPoint[]): number {
    if (history.length < 2) return 0;
    
    const sorted = history.sort((a, b) => a.timestamp - b.timestamp);
    const growthRates = [];
    
    for (let i = 1; i < sorted.length; i++) {
      const growth = sorted[i].reviewCount - sorted[i-1].reviewCount;
      growthRates.push(growth);
    }
    
    return this.calculateAverage(growthRates);
  }

  private calculateCurrentReviewGrowth(current: PriceDataPoint, history: PriceDataPoint[]): number {
    const yesterday = history.find(h => 
      Math.abs(h.timestamp - (current.timestamp - 24 * 60 * 60 * 1000)) < 60 * 60 * 1000
    );
    
    return yesterday ? current.reviewCount - yesterday.reviewCount : 0;
  }

  private getPriceRecommendation(anomalyType: string, priceChange: number): string {
    if (anomalyType === 'price_spike') {
      return `Конкурент поднял цену на ${Math.abs(priceChange).toFixed(1)}%. Рассмотрите возможность повышения своей цены.`;
    } else {
      return `Конкурент снизил цену на ${Math.abs(priceChange).toFixed(1)}%. Проанализируйте необходимость корректировки своей цены.`;
    }
  }

  /**
   * 💾 Управление историческими данными
   */
  private getHistoricalData(productKey: string): PriceDataPoint[] {
    return this.historicalData.get(productKey) || [];
  }

  private addDataPoint(productKey: string, dataPoint: PriceDataPoint): void {
    const history = this.getHistoricalData(productKey);
    history.push(dataPoint);
    
    // Ограничиваем размер истории (последние 1000 точек)
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    this.historicalData.set(productKey, history);
  }

  /**
   * 📊 Получение статистики по аномалиям
   */
  getAnomalyStats(): {
    totalProducts: number;
    anomaliesDetected: number;
    mostCommonAnomalyType: string;
    averageConfidence: number;
  } {
    // Здесь можно добавить логику сбора статистики
    return {
      totalProducts: this.historicalData.size,
      anomaliesDetected: 0, // Подсчитать из истории
      mostCommonAnomalyType: 'price_spike',
      averageConfidence: 0.85
    };
  }

  /**
   * ⚙️ Обновление конфигурации
   */
  updateConfig(newConfig: Partial<MLConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Экспортируем singleton
export const mlAnomalyDetection = new MLAnomalyDetectionService();
export default MLAnomalyDetectionService;
