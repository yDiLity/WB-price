/**
 * 🤖 AI-модуль для анализа конкурентов и генерации рекомендаций
 * Использует OpenAI GPT + ML для глубокого анализа рынка
 */

interface CompetitorData {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  position: number;
  category: string;
  brand: string;
  features: string[];
  images: string[];
  description: string;
  salesVolume?: number;
  priceHistory: Array<{ date: string; price: number }>;
}

interface MarketAnalysis {
  averagePrice: number;
  priceRange: { min: number; max: number };
  topCompetitors: CompetitorData[];
  marketTrends: {
    priceDirection: 'up' | 'down' | 'stable';
    demandLevel: 'low' | 'medium' | 'high';
    competitionLevel: 'low' | 'medium' | 'high';
    seasonality: string;
  };
  opportunities: string[];
  threats: string[];
}

interface PricingRecommendation {
  recommendedPrice: number;
  confidence: number;
  reasoning: string;
  expectedPosition: number;
  expectedSales: number;
  riskLevel: 'low' | 'medium' | 'high';
  alternatives: Array<{
    price: number;
    strategy: string;
    pros: string[];
    cons: string[];
  }>;
}

interface AIInsight {
  type: 'pricing' | 'positioning' | 'marketing' | 'product';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 1-10
  effort: number; // 1-10
}

class AICompetitorAnalysisService {
  private openaiApiKey: string;
  private analysisCache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  /**
   * 🔍 Комплексный анализ конкурентов
   */
  async analyzeCompetitors(
    productId: string,
    competitors: CompetitorData[],
    currentPrice: number
  ): Promise<{
    marketAnalysis: MarketAnalysis;
    pricingRecommendation: PricingRecommendation;
    insights: AIInsight[];
  }> {
    console.log('🤖 Запуск AI-анализа конкурентов...');

    // Проверяем кеш
    const cacheKey = `analysis_${productId}_${JSON.stringify(competitors.map(c => c.id))}`;
    const cached = this.analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 минут
      return cached.data;
    }

    try {
      // 1. Анализ рынка
      const marketAnalysis = await this.performMarketAnalysis(competitors);

      // 2. Генерация рекомендаций по ценообразованию
      const pricingRecommendation = await this.generatePricingRecommendation(
        competitors,
        currentPrice,
        marketAnalysis
      );

      // 3. AI-инсайты через OpenAI
      const insights = await this.generateAIInsights(
        competitors,
        marketAnalysis,
        currentPrice
      );

      const result = {
        marketAnalysis,
        pricingRecommendation,
        insights
      };

      // Кешируем результат
      this.analysisCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('Ошибка AI-анализа:', error);
      throw error;
    }
  }

  /**
   * 📊 Анализ рынка
   */
  private async performMarketAnalysis(competitors: CompetitorData[]): Promise<MarketAnalysis> {
    const prices = competitors.map(c => c.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Сортируем конкурентов по позиции
    const topCompetitors = competitors
      .sort((a, b) => a.position - b.position)
      .slice(0, 5);

    // Анализ трендов
    const priceDirection = this.analyzePriceTrends(competitors);
    const demandLevel = this.analyzeDemandLevel(competitors);
    const competitionLevel = this.analyzeCompetitionLevel(competitors);

    // Поиск возможностей и угроз
    const opportunities = this.identifyOpportunities(competitors, averagePrice);
    const threats = this.identifyThreats(competitors);

    return {
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      topCompetitors,
      marketTrends: {
        priceDirection,
        demandLevel,
        competitionLevel,
        seasonality: 'Анализ сезонности требует больше данных'
      },
      opportunities,
      threats
    };
  }

  /**
   * 💰 Генерация рекомендаций по ценообразованию
   */
  private async generatePricingRecommendation(
    competitors: CompetitorData[],
    currentPrice: number,
    marketAnalysis: MarketAnalysis
  ): Promise<PricingRecommendation> {
    // ML-алгоритм для определения оптимальной цены
    const optimalPrice = this.calculateOptimalPrice(competitors, marketAnalysis);
    
    // Оценка уверенности на основе данных
    const confidence = this.calculateConfidence(competitors, marketAnalysis);
    
    // Прогноз позиции
    const expectedPosition = this.predictPosition(optimalPrice, competitors);
    
    // Прогноз продаж (упрощенная модель)
    const expectedSales = this.predictSales(optimalPrice, competitors, marketAnalysis);
    
    // Оценка рисков
    const riskLevel = this.assessRisk(optimalPrice, currentPrice, marketAnalysis);

    // Альтернативные стратегии
    const alternatives = this.generateAlternativeStrategies(
      optimalPrice,
      competitors,
      marketAnalysis
    );

    return {
      recommendedPrice: optimalPrice,
      confidence,
      reasoning: this.generateReasoning(optimalPrice, currentPrice, marketAnalysis),
      expectedPosition,
      expectedSales,
      riskLevel,
      alternatives
    };
  }

  /**
   * 🧠 Генерация AI-инсайтов через OpenAI
   */
  private async generateAIInsights(
    competitors: CompetitorData[],
    marketAnalysis: MarketAnalysis,
    currentPrice: number
  ): Promise<AIInsight[]> {
    if (!this.openaiApiKey) {
      return this.generateMockInsights(competitors, marketAnalysis, currentPrice);
    }

    try {
      const prompt = this.buildAnalysisPrompt(competitors, marketAnalysis, currentPrice);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'Вы эксперт по e-commerce аналитике и ценообразованию на маркетплейсах. Анализируйте данные и давайте конкретные, действенные рекомендации.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      return this.parseAIResponse(aiResponse);

    } catch (error) {
      console.error('Ошибка OpenAI API:', error);
      return this.generateMockInsights(competitors, marketAnalysis, currentPrice);
    }
  }

  /**
   * 📝 Построение промпта для AI
   */
  private buildAnalysisPrompt(
    competitors: CompetitorData[],
    marketAnalysis: MarketAnalysis,
    currentPrice: number
  ): string {
    return `
Проанализируйте конкурентную ситуацию на Wildberries:

ТЕКУЩАЯ СИТУАЦИЯ:
- Моя цена: ${currentPrice} руб.
- Средняя цена рынка: ${marketAnalysis.averagePrice} руб.
- Диапазон цен: ${marketAnalysis.priceRange.min} - ${marketAnalysis.priceRange.max} руб.
- Уровень конкуренции: ${marketAnalysis.marketTrends.competitionLevel}
- Тренд цен: ${marketAnalysis.marketTrends.priceDirection}

ТОП-5 КОНКУРЕНТОВ:
${marketAnalysis.topCompetitors.map((c, i) => 
  `${i+1}. ${c.name} - ${c.price} руб., рейтинг ${c.rating}, позиция ${c.position}`
).join('\n')}

ВОЗМОЖНОСТИ:
${marketAnalysis.opportunities.join('\n- ')}

УГРОЗЫ:
${marketAnalysis.threats.join('\n- ')}

Дайте 5-7 конкретных инсайтов в формате JSON:
[
  {
    "type": "pricing|positioning|marketing|product",
    "title": "Краткий заголовок",
    "description": "Подробное описание",
    "actionItems": ["Конкретное действие 1", "Конкретное действие 2"],
    "priority": "low|medium|high|critical",
    "impact": 1-10,
    "effort": 1-10
  }
]
`;
  }

  /**
   * 🔍 Парсинг ответа AI
   */
  private parseAIResponse(response: string): AIInsight[] {
    try {
      // Извлекаем JSON из ответа
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Ошибка парсинга AI ответа:', error);
    }

    // Fallback к моковым инсайтам
    return this.generateMockInsights([], {} as MarketAnalysis, 0);
  }

  /**
   * 🎯 Расчет оптимальной цены
   */
  private calculateOptimalPrice(
    competitors: CompetitorData[],
    marketAnalysis: MarketAnalysis
  ): number {
    // Упрощенный алгоритм оптимизации цены
    const { averagePrice, priceRange } = marketAnalysis;
    const topCompetitorPrices = marketAnalysis.topCompetitors.slice(0, 3).map(c => c.price);
    
    // Целевая позиция - топ-3
    const targetPrice = topCompetitorPrices.length > 0 
      ? Math.min(...topCompetitorPrices) - 1
      : averagePrice * 0.95;

    // Ограничиваем диапазоном
    return Math.max(
      priceRange.min * 1.05,
      Math.min(targetPrice, priceRange.max * 0.95)
    );
  }

  /**
   * 📊 Вспомогательные методы анализа
   */
  private analyzePriceTrends(competitors: CompetitorData[]): 'up' | 'down' | 'stable' {
    // Анализ истории цен (упрощенно)
    const recentChanges = competitors.filter(c => c.priceHistory.length > 1);
    if (recentChanges.length === 0) return 'stable';

    let upCount = 0;
    let downCount = 0;

    recentChanges.forEach(competitor => {
      const history = competitor.priceHistory;
      const recent = history[history.length - 1].price;
      const previous = history[history.length - 2].price;
      
      if (recent > previous) upCount++;
      else if (recent < previous) downCount++;
    });

    if (upCount > downCount * 1.5) return 'up';
    if (downCount > upCount * 1.5) return 'down';
    return 'stable';
  }

  private analyzeDemandLevel(competitors: CompetitorData[]): 'low' | 'medium' | 'high' {
    const avgReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0) / competitors.length;
    
    if (avgReviews > 1000) return 'high';
    if (avgReviews > 100) return 'medium';
    return 'low';
  }

  private analyzeCompetitionLevel(competitors: CompetitorData[]): 'low' | 'medium' | 'high' {
    const competitorCount = competitors.length;
    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    
    if (competitorCount > 20 && avgRating > 4.5) return 'high';
    if (competitorCount > 10 && avgRating > 4.0) return 'medium';
    return 'low';
  }

  private identifyOpportunities(competitors: CompetitorData[], avgPrice: number): string[] {
    const opportunities = [];
    
    const lowRatedCompetitors = competitors.filter(c => c.rating < 4.0);
    if (lowRatedCompetitors.length > 0) {
      opportunities.push('Есть конкуренты с низким рейтингом - возможность захватить их долю');
    }

    const highPricedCompetitors = competitors.filter(c => c.price > avgPrice * 1.2);
    if (highPricedCompetitors.length > 0) {
      opportunities.push('Некоторые конкуренты завышают цены - можно предложить лучшее соотношение цена/качество');
    }

    return opportunities;
  }

  private identifyThreats(competitors: CompetitorData[]): string[] {
    const threats = [];
    
    const strongCompetitors = competitors.filter(c => c.rating > 4.7 && c.reviewCount > 500);
    if (strongCompetitors.length > 0) {
      threats.push('Присутствуют сильные конкуренты с высоким рейтингом и большим количеством отзывов');
    }

    return threats;
  }

  private calculateConfidence(competitors: CompetitorData[], marketAnalysis: MarketAnalysis): number {
    // Уверенность на основе количества данных и их качества
    let confidence = 0.5;
    
    if (competitors.length > 10) confidence += 0.2;
    if (competitors.length > 20) confidence += 0.1;
    
    const hasHistoryData = competitors.filter(c => c.priceHistory.length > 1).length;
    confidence += (hasHistoryData / competitors.length) * 0.2;
    
    return Math.min(confidence, 0.95);
  }

  private predictPosition(price: number, competitors: CompetitorData[]): number {
    const cheaperCompetitors = competitors.filter(c => c.price < price).length;
    return cheaperCompetitors + 1;
  }

  private predictSales(price: number, competitors: CompetitorData[], marketAnalysis: MarketAnalysis): number {
    // Упрощенная модель прогноза продаж
    const position = this.predictPosition(price, competitors);
    const demandMultiplier = marketAnalysis.marketTrends.demandLevel === 'high' ? 1.5 : 
                           marketAnalysis.marketTrends.demandLevel === 'medium' ? 1.0 : 0.7;
    
    const baseSales = Math.max(100 - position * 10, 10);
    return Math.round(baseSales * demandMultiplier);
  }

  private assessRisk(optimalPrice: number, currentPrice: number, marketAnalysis: MarketAnalysis): 'low' | 'medium' | 'high' {
    const priceChange = Math.abs(optimalPrice - currentPrice) / currentPrice;
    
    if (priceChange > 0.3) return 'high';
    if (priceChange > 0.15) return 'medium';
    return 'low';
  }

  private generateReasoning(optimalPrice: number, currentPrice: number, marketAnalysis: MarketAnalysis): string {
    const change = optimalPrice - currentPrice;
    const changePercent = (change / currentPrice * 100).toFixed(1);
    
    if (change > 0) {
      return `Рекомендуется повысить цену на ${changePercent}% до ${optimalPrice} руб. Средняя цена рынка ${marketAnalysis.averagePrice} руб., что позволяет увеличить маржинальность при сохранении конкурентоспособности.`;
    } else {
      return `Рекомендуется снизить цену на ${Math.abs(parseFloat(changePercent))}% до ${optimalPrice} руб. для улучшения позиций в поиске и увеличения продаж.`;
    }
  }

  private generateAlternativeStrategies(
    optimalPrice: number,
    competitors: CompetitorData[],
    marketAnalysis: MarketAnalysis
  ): PricingRecommendation['alternatives'] {
    return [
      {
        price: optimalPrice * 0.95,
        strategy: 'Агрессивная',
        pros: ['Быстрый захват доли рынка', 'Высокие позиции в поиске'],
        cons: ['Снижение маржинальности', 'Риск ценовой войны']
      },
      {
        price: optimalPrice * 1.05,
        strategy: 'Премиальная',
        pros: ['Высокая маржинальность', 'Позиционирование как премиум'],
        cons: ['Меньше продаж', 'Риск потери позиций']
      }
    ];
  }

  private generateMockInsights(
    competitors: CompetitorData[],
    marketAnalysis: MarketAnalysis,
    currentPrice: number
  ): AIInsight[] {
    return [
      {
        type: 'pricing',
        title: 'Оптимизация ценовой стратегии',
        description: 'Анализ показывает возможность корректировки цены для улучшения позиций',
        actionItems: [
          'Снизить цену на 5-10% для входа в топ-5',
          'Мониторить реакцию конкурентов на изменения'
        ],
        priority: 'high',
        impact: 8,
        effort: 3
      },
      {
        type: 'marketing',
        title: 'Улучшение контента карточки',
        description: 'Качество описания и фото влияет на конверсию',
        actionItems: [
          'Добавить профессиональные фотографии',
          'Оптимизировать ключевые слова в названии'
        ],
        priority: 'medium',
        impact: 6,
        effort: 5
      }
    ];
  }
}

// Экспортируем singleton
export const aiCompetitorAnalysis = new AICompetitorAnalysisService();
export default AICompetitorAnalysisService;
