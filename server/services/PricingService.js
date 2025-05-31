const Product = require('../models/Product');
const User = require('../models/User');

// Переменная для хранения ссылки на базу данных
let dbConfig = null;

class PricingService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.updateInterval = 5 * 60 * 1000; // 5 минут
    this.lastUpdateTime = null;
    this.stats = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      lastRunTime: null,
      averageUpdateTime: 0
    };
  }

  // Инициализация базы данных
  setDatabase(database) {
    dbConfig = database;
  }

  // Запуск автоматического мониторинга цен
  start() {
    if (this.isRunning) {
      console.log('⚠️  Pricing service is already running');
      return;
    }

    console.log('🚀 Starting automatic pricing service...');
    this.isRunning = true;

    // Запускаем первое обновление сразу
    this.runPriceUpdate();

    // Устанавливаем интервал для регулярных обновлений
    this.intervalId = setInterval(() => {
      this.runPriceUpdate();
    }, this.updateInterval);

    console.log(`✅ Pricing service started with ${this.updateInterval / 1000}s interval`);
  }

  // Остановка автоматического мониторинга
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Pricing service is not running');
      return;
    }

    console.log('🛑 Stopping automatic pricing service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('✅ Pricing service stopped');
  }

  // Основная функция обновления цен
  async runPriceUpdate() {
    const startTime = Date.now();
    console.log('🔄 Running automatic price update...');

    try {
      // Получаем всех активных пользователей с включенным автоценообразованием
      const users = await this.getActiveUsers();
      console.log(`Found ${users.length} active users`);

      let totalUpdated = 0;
      let totalErrors = 0;

      for (const user of users) {
        try {
          const userUpdates = await this.updateUserPrices(user);
          totalUpdated += userUpdates.updated;
          totalErrors += userUpdates.errors;
        } catch (error) {
          console.error(`Error updating prices for user ${user.id}:`, error);
          totalErrors++;
        }
      }

      // Обновляем статистику
      const duration = Date.now() - startTime;
      this.updateStats(totalUpdated, totalErrors, duration);

      console.log(`✅ Price update completed: ${totalUpdated} updated, ${totalErrors} errors, ${duration}ms`);
      this.lastUpdateTime = new Date();

    } catch (error) {
      console.error('❌ Error in automatic price update:', error);
      this.stats.failedUpdates++;
    }
  }

  // Получение активных пользователей
  async getActiveUsers() {
    try {
      if (!dbConfig || !dbConfig.query) {
        console.log('Database not initialized, returning empty users list');
        return [];
      }

      const result = await dbConfig.query(`
        SELECT DISTINCT u.*
        FROM users u
        INNER JOIN products p ON u.id = p.user_id
        WHERE u.is_active = true
        AND p.auto_pricing_enabled = true
        AND p.is_active = true
      `);

      return result.rows.map(row => new User(row));
    } catch (error) {
      console.error('Error getting active users:', error);
      return [];
    }
  }

  // Обновление цен для конкретного пользователя
  async updateUserPrices(user) {
    try {
      // Получаем товары пользователя с включенным автоценообразованием
      const products = await Product.findByUserId(user.id, {
        limit: 1000 // Обрабатываем до 1000 товаров за раз
      });

      const autoPricingProducts = products.filter(p =>
        p.auto_pricing_enabled && p.is_active
      );

      console.log(`Processing ${autoPricingProducts.length} products for user ${user.name || user.id}`);

      let updated = 0;
      let errors = 0;

      for (const product of autoPricingProducts) {
        try {
          const wasUpdated = await this.updateProductPrice(product, user);
          if (wasUpdated) {
            updated++;

            // Отправляем уведомление пользователю если у него есть Telegram
            if (user.telegram_chat_id && user.notifications_enabled) {
              await this.sendPriceUpdateNotification(user, product);
            }
          }
        } catch (error) {
          console.error(`Error updating product ${product.id}:`, error);
          errors++;
        }
      }

      return { updated, errors };
    } catch (error) {
      console.error('Error updating user prices:', error);
      return { updated: 0, errors: 1 };
    }
  }

  // Обновление цены конкретного товара
  async updateProductPrice(product, user) {
    try {
      // Рассчитываем рекомендуемую цену
      const recommendedPrice = await product.calculateRecommendedPrice();

      if (!recommendedPrice || recommendedPrice <= 0) {
        return false;
      }

      // Проверяем, нужно ли обновлять цену
      if (!product.needsPriceUpdate()) {
        return false;
      }

      // Дополнительные проверки безопасности
      if (!this.isPriceSafe(product, recommendedPrice)) {
        console.log(`Skipping unsafe price update for product ${product.id}: ${product.current_price} -> ${recommendedPrice}`);
        return false;
      }

      // Обновляем цену
      await product.updatePrice(
        recommendedPrice,
        'automatic_optimization',
        user.id
      );

      console.log(`Updated price for ${product.name}: ${product.current_price} -> ${recommendedPrice}`);
      return true;

    } catch (error) {
      console.error(`Error updating product price ${product.id}:`, error);
      return false;
    }
  }

  // Проверка безопасности изменения цены
  isPriceSafe(product, newPrice) {
    // Проверяем минимальную и максимальную цену
    if (product.min_price > 0 && newPrice < product.min_price) {
      return false;
    }

    if (product.max_price > 0 && newPrice > product.max_price) {
      return false;
    }

    // Проверяем, что изменение не слишком резкое (не более 30% за раз)
    const currentPrice = product.current_price;
    const changePercent = Math.abs((newPrice - currentPrice) / currentPrice) * 100;

    if (changePercent > 30) {
      return false;
    }

    // Проверяем минимальную маржу (не менее 5%)
    if (product.cost_price > 0) {
      const margin = ((newPrice - product.cost_price) / newPrice) * 100;
      if (margin < 5) {
        return false;
      }
    }

    return true;
  }

  // Отправка уведомления о изменении цены
  async sendPriceUpdateNotification(user, product) {
    try {
      // Здесь должна быть интеграция с Telegram Bot
      // Для демонстрации просто логируем
      console.log(`📱 Notification sent to ${user.telegram_chat_id}: Price updated for ${product.name}`);

      // В реальном приложении здесь будет:
      // await telegramBot.sendMessage(user.telegram_chat_id, message);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Обновление статистики
  updateStats(updated, errors, duration) {
    this.stats.totalUpdates += updated;
    this.stats.successfulUpdates += updated;
    this.stats.failedUpdates += errors;
    this.stats.lastRunTime = new Date();

    // Рассчитываем среднее время обновления
    if (this.stats.totalUpdates > 0) {
      this.stats.averageUpdateTime = (this.stats.averageUpdateTime + duration) / 2;
    } else {
      this.stats.averageUpdateTime = duration;
    }
  }

  // Получение статистики сервиса
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastUpdateTime: this.lastUpdateTime,
      updateInterval: this.updateInterval,
      nextUpdateTime: this.isRunning && this.lastUpdateTime ?
        new Date(this.lastUpdateTime.getTime() + this.updateInterval) : null
    };
  }

  // Принудительное обновление цен для конкретного пользователя
  async forceUpdateUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`🔄 Force updating prices for user ${user.name || user.id}`);
      const result = await this.updateUserPrices(user);

      return {
        success: true,
        updated: result.updated,
        errors: result.errors,
        user: user.name || user.id
      };
    } catch (error) {
      console.error('Error in force update:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Анализ эффективности ценообразования
  async analyzeEffectiveness(userId, days = 30) {
    try {
      if (!dbConfig || !dbConfig.query) {
        console.log('Database not initialized');
        return null;
      }

      const result = await dbConfig.query(`
        SELECT
          COUNT(*) as total_changes,
          AVG(new_price - old_price) as avg_price_change,
          SUM(CASE WHEN new_price > old_price THEN 1 ELSE 0 END) as price_increases,
          SUM(CASE WHEN new_price < old_price THEN 1 ELSE 0 END) as price_decreases
        FROM price_history ph
        INNER JOIN products p ON ph.product_id = p.id
        WHERE p.user_id = $1
        AND ph.change_type = 'automatic'
        AND ph.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error analyzing effectiveness:', error);
      return null;
    }
  }

  // Настройка интервала обновления
  setUpdateInterval(intervalMs) {
    this.updateInterval = intervalMs;

    if (this.isRunning) {
      this.stop();
      this.start();
    }

    console.log(`Update interval set to ${intervalMs / 1000}s`);
  }
}

// Создаем единственный экземпляр сервиса
const pricingService = new PricingService();

module.exports = pricingService;
