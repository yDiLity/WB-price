const { query } = require('../database/config');
const { v4: uuidv4 } = require('uuid');

class AnalyticsService {
  constructor() {
    this.metricsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }

  // Запись метрики в базу данных
  async recordMetric(userId, productId, metricType, value, additionalData = {}) {
    try {
      await query(`
        INSERT INTO analytics_data (user_id, product_id, metric_type, metric_value, metric_date, additional_data)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
      `, [userId, productId, metricType, value, JSON.stringify(additionalData)]);

      // Очищаем кеш для этого пользователя
      this.clearUserCache(userId);
      
      return true;
    } catch (error) {
      console.error('Error recording metric:', error);
      return false;
    }
  }

  // Получение дашборда пользователя
  async getUserDashboard(userId, days = 30) {
    const cacheKey = `dashboard_${userId}_${days}`;
    
    // Проверяем кеш
    if (this.metricsCache.has(cacheKey)) {
      const cached = this.metricsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const dashboard = await this.generateDashboard(userId, days);
      
      // Сохраняем в кеш
      this.metricsCache.set(cacheKey, {
        data: dashboard,
        timestamp: Date.now()
      });

      return dashboard;
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      return null;
    }
  }

  // Генерация дашборда
  async generateDashboard(userId, days) {
    const [
      overview,
      salesTrend,
      profitTrend,
      topProducts,
      priceChanges,
      competitorAnalysis
    ] = await Promise.all([
      this.getOverviewMetrics(userId, days),
      this.getSalesTrend(userId, days),
      this.getProfitTrend(userId, days),
      this.getTopProducts(userId, days),
      this.getPriceChanges(userId, days),
      this.getCompetitorAnalysis(userId, days)
    ]);

    return {
      overview,
      trends: {
        sales: salesTrend,
        profit: profitTrend
      },
      topProducts,
      priceChanges,
      competitorAnalysis,
      generatedAt: new Date(),
      period: `${days} days`
    };
  }

  // Общие метрики
  async getOverviewMetrics(userId, days) {
    try {
      const result = await query(`
        SELECT 
          SUM(CASE WHEN metric_type = 'sales' THEN metric_value ELSE 0 END) as total_sales,
          SUM(CASE WHEN metric_type = 'profit' THEN metric_value ELSE 0 END) as total_profit,
          SUM(CASE WHEN metric_type = 'views' THEN metric_value ELSE 0 END) as total_views,
          SUM(CASE WHEN metric_type = 'conversions' THEN metric_value ELSE 0 END) as total_conversions,
          COUNT(DISTINCT product_id) as active_products,
          AVG(CASE WHEN metric_type = 'sales' THEN metric_value ELSE NULL END) as avg_daily_sales
        FROM analytics_data 
        WHERE user_id = $1 
        AND metric_date >= CURRENT_DATE - INTERVAL '${days} days'
      `, [userId]);

      const data = result.rows[0];
      
      // Рассчитываем дополнительные метрики
      const conversionRate = data.total_views > 0 ? 
        (parseFloat(data.total_conversions) / parseFloat(data.total_views)) * 100 : 0;
      
      const profitMargin = data.total_sales > 0 ? 
        (parseFloat(data.total_profit) / parseFloat(data.total_sales)) * 100 : 0;

      return {
        totalSales: parseFloat(data.total_sales) || 0,
        totalProfit: parseFloat(data.total_profit) || 0,
        totalViews: parseInt(data.total_views) || 0,
        totalConversions: parseInt(data.total_conversions) || 0,
        activeProducts: parseInt(data.active_products) || 0,
        avgDailySales: parseFloat(data.avg_daily_sales) || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100
      };
    } catch (error) {
      console.error('Error getting overview metrics:', error);
      return {};
    }
  }

  // Тренд продаж
  async getSalesTrend(userId, days) {
    try {
      const result = await query(`
        SELECT 
          metric_date,
          SUM(metric_value) as daily_sales
        FROM analytics_data 
        WHERE user_id = $1 
        AND metric_type = 'sales'
        AND metric_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY metric_date
        ORDER BY metric_date
      `, [userId]);

      return result.rows.map(row => ({
        date: row.metric_date,
        sales: parseFloat(row.daily_sales) || 0
      }));
    } catch (error) {
      console.error('Error getting sales trend:', error);
      return [];
    }
  }

  // Тренд прибыли
  async getProfitTrend(userId, days) {
    try {
      const result = await query(`
        SELECT 
          metric_date,
          SUM(metric_value) as daily_profit
        FROM analytics_data 
        WHERE user_id = $1 
        AND metric_type = 'profit'
        AND metric_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY metric_date
        ORDER BY metric_date
      `, [userId]);

      return result.rows.map(row => ({
        date: row.metric_date,
        profit: parseFloat(row.daily_profit) || 0
      }));
    } catch (error) {
      console.error('Error getting profit trend:', error);
      return [];
    }
  }

  // Топ товары
  async getTopProducts(userId, days) {
    try {
      const result = await query(`
        SELECT 
          p.id,
          p.name,
          p.current_price,
          SUM(CASE WHEN ad.metric_type = 'sales' THEN ad.metric_value ELSE 0 END) as total_sales,
          SUM(CASE WHEN ad.metric_type = 'profit' THEN ad.metric_value ELSE 0 END) as total_profit,
          SUM(CASE WHEN ad.metric_type = 'views' THEN ad.metric_value ELSE 0 END) as total_views
        FROM products p
        LEFT JOIN analytics_data ad ON p.id = ad.product_id
        WHERE p.user_id = $1 
        AND p.is_active = true
        AND (ad.metric_date IS NULL OR ad.metric_date >= CURRENT_DATE - INTERVAL '${days} days')
        GROUP BY p.id, p.name, p.current_price
        ORDER BY total_sales DESC
        LIMIT 10
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        currentPrice: parseFloat(row.current_price) || 0,
        totalSales: parseFloat(row.total_sales) || 0,
        totalProfit: parseFloat(row.total_profit) || 0,
        totalViews: parseInt(row.total_views) || 0,
        conversionRate: row.total_views > 0 ? 
          ((parseFloat(row.total_sales) / parseInt(row.total_views)) * 100) : 0
      }));
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }

  // Изменения цен
  async getPriceChanges(userId, days) {
    try {
      const result = await query(`
        SELECT 
          p.name,
          ph.old_price,
          ph.new_price,
          ph.change_reason,
          ph.change_type,
          ph.created_at,
          (ph.new_price - ph.old_price) as price_diff,
          ((ph.new_price - ph.old_price) / ph.old_price * 100) as price_change_percent
        FROM price_history ph
        INNER JOIN products p ON ph.product_id = p.id
        WHERE p.user_id = $1 
        AND ph.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY ph.created_at DESC
        LIMIT 20
      `, [userId]);

      return result.rows.map(row => ({
        productName: row.name,
        oldPrice: parseFloat(row.old_price) || 0,
        newPrice: parseFloat(row.new_price) || 0,
        priceDiff: parseFloat(row.price_diff) || 0,
        priceChangePercent: parseFloat(row.price_change_percent) || 0,
        changeReason: row.change_reason,
        changeType: row.change_type,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting price changes:', error);
      return [];
    }
  }

  // Анализ конкурентов
  async getCompetitorAnalysis(userId, days) {
    try {
      const result = await query(`
        SELECT 
          p.name as product_name,
          c.name as competitor_name,
          c.price as competitor_price,
          p.current_price as our_price,
          (p.current_price - c.price) as price_diff,
          ((p.current_price - c.price) / c.price * 100) as price_diff_percent,
          c.rating as competitor_rating,
          p.rating as our_rating
        FROM products p
        INNER JOIN competitors c ON p.id = c.product_id
        WHERE p.user_id = $1 
        AND p.is_active = true 
        AND c.is_active = true
        ORDER BY ABS(p.current_price - c.price) DESC
        LIMIT 15
      `, [userId]);

      return result.rows.map(row => ({
        productName: row.product_name,
        competitorName: row.competitor_name,
        competitorPrice: parseFloat(row.competitor_price) || 0,
        ourPrice: parseFloat(row.our_price) || 0,
        priceDiff: parseFloat(row.price_diff) || 0,
        priceDiffPercent: parseFloat(row.price_diff_percent) || 0,
        competitorRating: parseFloat(row.competitor_rating) || 0,
        ourRating: parseFloat(row.our_rating) || 0,
        competitivePosition: this.getCompetitivePosition(
          parseFloat(row.price_diff_percent) || 0,
          parseFloat(row.our_rating) || 0,
          parseFloat(row.competitor_rating) || 0
        )
      }));
    } catch (error) {
      console.error('Error getting competitor analysis:', error);
      return [];
    }
  }

  // Определение конкурентной позиции
  getCompetitivePosition(priceDiffPercent, ourRating, competitorRating) {
    if (priceDiffPercent > 10 && ourRating >= competitorRating) {
      return 'premium';
    } else if (priceDiffPercent < -10) {
      return 'aggressive';
    } else if (Math.abs(priceDiffPercent) <= 10) {
      return 'competitive';
    } else {
      return 'expensive';
    }
  }

  // Прогноз продаж на основе исторических данных
  async getSalesForecast(userId, days = 7) {
    try {
      const result = await query(`
        SELECT 
          metric_date,
          SUM(metric_value) as daily_sales
        FROM analytics_data 
        WHERE user_id = $1 
        AND metric_type = 'sales'
        AND metric_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY metric_date
        ORDER BY metric_date
      `, [userId]);

      const salesData = result.rows.map(row => parseFloat(row.daily_sales) || 0);
      
      if (salesData.length < 7) {
        return { forecast: [], confidence: 0 };
      }

      // Простой прогноз на основе скользящего среднего
      const forecast = this.calculateMovingAverageForecast(salesData, days);
      
      return {
        forecast,
        confidence: Math.min(salesData.length / 30 * 100, 100) // Уверенность зависит от количества данных
      };
    } catch (error) {
      console.error('Error getting sales forecast:', error);
      return { forecast: [], confidence: 0 };
    }
  }

  // Расчет прогноза на основе скользящего среднего
  calculateMovingAverageForecast(data, forecastDays, windowSize = 7) {
    const forecast = [];
    
    for (let i = 0; i < forecastDays; i++) {
      const window = data.slice(-windowSize);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      
      forecast.push({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        predictedSales: Math.round(average * 100) / 100
      });
      
      // Добавляем прогнозное значение в данные для следующей итерации
      data.push(average);
    }
    
    return forecast;
  }

  // Очистка кеша для пользователя
  clearUserCache(userId) {
    for (const [key] of this.metricsCache) {
      if (key.includes(`_${userId}_`)) {
        this.metricsCache.delete(key);
      }
    }
  }

  // Очистка всего кеша
  clearCache() {
    this.metricsCache.clear();
  }

  // Получение статистики кеша
  getCacheStats() {
    return {
      size: this.metricsCache.size,
      timeout: this.cacheTimeout,
      keys: Array.from(this.metricsCache.keys())
    };
  }
}

// Создаем единственный экземпляр сервиса
const analyticsService = new AnalyticsService();

module.exports = analyticsService;
