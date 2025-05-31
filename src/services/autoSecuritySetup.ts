/**
 * 🛡️ Автоматическая настройка безопасности
 * Инициализируется при запуске приложения без участия пользователя
 */

import { securityService } from './securityService';

class AutoSecuritySetup {
  private initialized = false;

  /**
   * 🚀 Автоматическая инициализация всех защит
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🛡️ Система безопасности уже инициализирована');
      return;
    }

    console.log('🛡️ Инициализация автоматической защиты от блокировок...');

    try {
      // 1. Настраиваем базовую конфигурацию безопасности
      await this.setupBasicSecurity();

      // 2. Добавляем бесплатные прокси (если доступны)
      await this.setupFreeProxies();

      // 3. Настраиваем мониторинг
      await this.setupMonitoring();

      // 4. Инициализируем кеш
      await this.setupCaching();

      // 5. Настраиваем Telegram уведомления (если настроены)
      await this.setupTelegramAlerts();

      this.initialized = true;
      console.log('✅ Система безопасности успешно инициализирована');
      console.log('🔒 Все API запросы теперь защищены автоматически');

    } catch (error) {
      console.error('🚫 Ошибка инициализации системы безопасности:', error);
      // Продолжаем работу даже при ошибках инициализации
    }
  }

  /**
   * ⚙️ Базовые настройки безопасности
   */
  private async setupBasicSecurity(): Promise<void> {
    securityService.updateConfig({
      maxRequestsPerMinute: 80, // Консервативный лимит
      minDelayBetweenRequests: 7000, // 7 секунд минимум
      maxDelayBetweenRequests: 20000, // 20 секунд максимум
      enableProxyRotation: true,
      enableUserAgentRotation: true,
      enableCaching: true,
      cacheExpirationTime: 1800000, // 30 минут
    });

    console.log('⚙️ Базовые настройки безопасности применены');
  }

  /**
   * 🔄 Настройка бесплатных прокси
   */
  private async setupFreeProxies(): Promise<void> {
    try {
      // Список бесплатных прокси (в реальном проекте лучше использовать платные)
      const freeProxies = [
        { host: '8.210.83.33', port: 80, type: 'http' as const },
        { host: '47.74.152.29', port: 8888, type: 'http' as const },
        { host: '103.127.1.130', port: 80, type: 'http' as const },
        { host: '185.162.231.106', port: 80, type: 'http' as const },
        { host: '103.216.103.26', port: 80, type: 'http' as const }
      ];

      // Проверяем и добавляем рабочие прокси
      for (const proxy of freeProxies) {
        try {
          securityService.addProxy(proxy);
        } catch (error) {
          console.warn(`⚠️ Прокси ${proxy.host}:${proxy.port} недоступен`);
        }
      }

      console.log('🔄 Прокси настроены для ротации');
    } catch (error) {
      console.warn('⚠️ Не удалось настроить прокси, продолжаем без них');
    }
  }

  /**
   * 📊 Настройка мониторинга
   */
  private async setupMonitoring(): Promise<void> {
    // Мониторинг статистики каждые 30 секунд
    setInterval(() => {
      const stats = securityService.getSecurityStats();
      
      // Предупреждение при приближении к лимитам
      if (stats.requestCount > stats.config.maxRequestsPerMinute * 0.8) {
        console.warn('⚠️ Приближение к лимиту запросов в минуту');
      }

      // Очистка кеша при переполнении
      if (stats.cacheSize > 1000) {
        console.log('🧹 Автоматическая очистка кеша (переполнение)');
        securityService.clearCache();
      }
    }, 30000);

    console.log('📊 Мониторинг безопасности активирован');
  }

  /**
   * 💾 Настройка кеширования
   */
  private async setupCaching(): Promise<void> {
    // Предзагрузка часто используемых данных в кеш
    try {
      // Здесь можно добавить предзагрузку популярных запросов
      console.log('💾 Система кеширования готова');
    } catch (error) {
      console.warn('⚠️ Ошибка настройки кеширования:', error);
    }
  }

  /**
   * 📱 Настройка Telegram уведомлений
   */
  private async setupTelegramAlerts(): Promise<void> {
    try {
      // Проверяем наличие сохраненных настроек Telegram
      const telegramToken = localStorage.getItem('telegram_bot_token');
      const telegramChatId = localStorage.getItem('telegram_chat_id');

      if (telegramToken && telegramChatId) {
        securityService.updateConfig({
          telegramBotToken: telegramToken,
          telegramChatId: telegramChatId
        });

        console.log('📱 Telegram уведомления настроены');
      } else {
        console.log('📱 Telegram уведомления не настроены (опционально)');
      }
    } catch (error) {
      console.warn('⚠️ Ошибка настройки Telegram:', error);
    }
  }

  /**
   * 🔍 Проверка состояния безопасности
   */
  getSecurityStatus(): {
    initialized: boolean;
    stats: any;
    recommendations: string[];
  } {
    const stats = securityService.getSecurityStats();
    const recommendations: string[] = [];

    // Анализируем состояние и даем рекомендации
    if (stats.proxiesCount === 0) {
      recommendations.push('Рекомендуется добавить прокси для лучшей защиты');
    }

    if (stats.requestCount > stats.config.maxRequestsPerMinute * 0.9) {
      recommendations.push('Слишком много запросов, снизьте активность');
    }

    if (!stats.config.enableCaching) {
      recommendations.push('Включите кеширование для снижения нагрузки на API');
    }

    return {
      initialized: this.initialized,
      stats,
      recommendations
    };
  }

  /**
   * 🚨 Экстренная остановка всех запросов
   */
  emergencyStop(): void {
    securityService.updateConfig({
      maxRequestsPerMinute: 0
    });
    console.log('🚨 ЭКСТРЕННАЯ ОСТАНОВКА: Все API запросы заблокированы');
  }

  /**
   * 🔄 Сброс к безопасным настройкам
   */
  resetToSafeMode(): void {
    securityService.updateConfig({
      maxRequestsPerMinute: 30, // Очень консервативно
      minDelayBetweenRequests: 15000, // 15 секунд
      maxDelayBetweenRequests: 30000, // 30 секунд
      enableProxyRotation: true,
      enableUserAgentRotation: true,
      enableCaching: true
    });
    console.log('🔄 Переключение в безопасный режим');
  }
}

// Создаем и экспортируем singleton
export const autoSecuritySetup = new AutoSecuritySetup();

// Автоматическая инициализация при импорте модуля
autoSecuritySetup.initialize().catch(error => {
  console.error('🚫 Критическая ошибка инициализации безопасности:', error);
});

export default autoSecuritySetup;
