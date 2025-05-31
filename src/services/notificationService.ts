/**
 * 🚨 Сервис уведомлений о банах и критических событиях
 * Поддерживает Telegram, Email и внутренние уведомления
 */

interface NotificationConfig {
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    cooldown: number; // минуты между уведомлениями
  };
  email: {
    enabled: boolean;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
    };
    from: string;
    to: string;
    cooldown: number;
  };
  internal: {
    enabled: boolean;
    maxAlerts: number;
  };
}

interface BanAlert {
  type: 'ban' | 'unban' | 'critical' | 'warning';
  ip: string;
  proxy?: string;
  userAgent?: string;
  statusCode: number;
  url: string;
  timestamp: Date;
  retryCount: number;
  fingerprint?: string;
  reason?: string;
}

interface AlertStats {
  totalAlerts: number;
  banAlerts: number;
  criticalAlerts: number;
  lastAlert: Date | null;
  alertsPerHour: number;
}

class NotificationService {
  private config: NotificationConfig;
  private alertHistory: BanAlert[] = [];
  private lastNotificationTime: Map<string, Date> = new Map();
  private alertStats: AlertStats = {
    totalAlerts: 0,
    banAlerts: 0,
    criticalAlerts: 0,
    lastAlert: null,
    alertsPerHour: 0
  };

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfig();
  }

  /**
   * 🔧 Конфигурация по умолчанию
   */
  private getDefaultConfig(): NotificationConfig {
    return {
      telegram: {
        enabled: false,
        botToken: '',
        chatId: '',
        cooldown: 5 // 5 минут между уведомлениями
      },
      email: {
        enabled: false,
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: '',
          pass: ''
        },
        from: '',
        to: '',
        cooldown: 10 // 10 минут между email
      },
      internal: {
        enabled: true,
        maxAlerts: 1000
      }
    };
  }

  /**
   * 📝 Загрузка конфигурации из localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('wb-notification-config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Ошибка загрузки конфигурации уведомлений:', error);
    }
  }

  /**
   * 💾 Сохранение конфигурации
   */
  public saveConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('wb-notification-config', JSON.stringify(this.config));
    console.log('✅ Конфигурация уведомлений сохранена');
  }

  /**
   * 🚨 Основной метод отправки уведомления о бане
   */
  public async sendBanAlert(alert: BanAlert): Promise<void> {
    try {
      // Добавляем в историю
      this.addToHistory(alert);

      // Проверяем cooldown
      if (!this.shouldSendNotification(alert.type)) {
        console.log(`⏳ Уведомление пропущено из-за cooldown: ${alert.type}`);
        return;
      }

      // Формируем сообщение
      const message = this.formatAlertMessage(alert);

      // Отправляем уведомления
      const promises: Promise<void>[] = [];

      if (this.config.telegram.enabled) {
        promises.push(this.sendTelegramAlert(message, alert));
      }

      if (this.config.email.enabled) {
        promises.push(this.sendEmailAlert(message, alert));
      }

      await Promise.allSettled(promises);

      // Обновляем время последнего уведомления
      this.lastNotificationTime.set(alert.type, new Date());

      console.log(`✅ Уведомление отправлено: ${alert.type} - ${alert.ip}`);

    } catch (error) {
      console.error('❌ Ошибка отправки уведомления:', error);
    }
  }

  /**
   * 📱 Отправка в Telegram
   */
  private async sendTelegramAlert(message: string, alert: BanAlert): Promise<void> {
    if (!this.config.telegram.botToken || !this.config.telegram.chatId) {
      throw new Error('Telegram не настроен');
    }

    const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;
    
    const payload = {
      chat_id: this.config.telegram.chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    console.log('📱 Telegram уведомление отправлено');
  }

  /**
   * 📧 Отправка по Email
   */
  private async sendEmailAlert(message: string, alert: BanAlert): Promise<void> {
    // В браузере нельзя отправлять email напрямую
    // Отправляем запрос на backend
    try {
      const response = await fetch('/api/send-email-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: this.getEmailSubject(alert),
          message: message,
          alert: alert
        })
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }

      console.log('📧 Email уведомление отправлено');

    } catch (error) {
      console.warn('⚠️ Email уведомление не отправлено:', error);
    }
  }

  /**
   * 📝 Форматирование сообщения
   */
  private formatAlertMessage(alert: BanAlert): string {
    const emoji = this.getAlertEmoji(alert.type);
    const timestamp = alert.timestamp.toLocaleString('ru-RU');

    let message = `${emoji} <b>WB Парсинг - ${alert.type.toUpperCase()}</b>\n\n`;
    
    message += `🕐 <b>Время:</b> ${timestamp}\n`;
    message += `🌐 <b>IP:</b> <code>${alert.ip}</code>\n`;
    message += `📊 <b>Код:</b> ${alert.statusCode}\n`;
    message += `🔗 <b>URL:</b> ${this.truncateUrl(alert.url)}\n`;

    if (alert.proxy) {
      message += `🔄 <b>Прокси:</b> <code>${alert.proxy}</code>\n`;
    }

    if (alert.userAgent) {
      message += `🤖 <b>UA:</b> ${this.truncateUserAgent(alert.userAgent)}\n`;
    }

    if (alert.retryCount > 0) {
      message += `🔁 <b>Попытка:</b> ${alert.retryCount}\n`;
    }

    if (alert.reason) {
      message += `❗ <b>Причина:</b> ${alert.reason}\n`;
    }

    // Добавляем статистику
    message += `\n📈 <b>Статистика:</b>\n`;
    message += `• Всего алертов: ${this.alertStats.totalAlerts}\n`;
    message += `• Банов: ${this.alertStats.banAlerts}\n`;
    message += `• В час: ${this.alertStats.alertsPerHour.toFixed(1)}`;

    return message;
  }

  /**
   * 🎭 Получение emoji для типа алерта
   */
  private getAlertEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'ban': '🚨',
      'unban': '✅',
      'critical': '💥',
      'warning': '⚠️'
    };
    return emojis[type] || '📢';
  }

  /**
   * 📧 Тема для email
   */
  private getEmailSubject(alert: BanAlert): string {
    const emoji = this.getAlertEmoji(alert.type);
    return `${emoji} WB Парсинг - ${alert.type.toUpperCase()} - ${alert.ip}`;
  }

  /**
   * ✂️ Обрезка URL для читаемости
   */
  private truncateUrl(url: string): string {
    if (url.length <= 50) return url;
    return url.substring(0, 47) + '...';
  }

  /**
   * ✂️ Обрезка User-Agent
   */
  private truncateUserAgent(ua: string): string {
    if (ua.length <= 60) return ua;
    return ua.substring(0, 57) + '...';
  }

  /**
   * ⏰ Проверка cooldown
   */
  private shouldSendNotification(type: string): boolean {
    const lastTime = this.lastNotificationTime.get(type);
    if (!lastTime) return true;

    const cooldownMinutes = type === 'ban' ? 
      this.config.telegram.cooldown : 
      this.config.email.cooldown;

    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - lastTime.getTime() > cooldownMs;
  }

  /**
   * 📊 Добавление в историю и обновление статистики
   */
  private addToHistory(alert: BanAlert): void {
    this.alertHistory.unshift(alert);

    // Ограничиваем размер истории
    if (this.alertHistory.length > this.config.internal.maxAlerts) {
      this.alertHistory = this.alertHistory.slice(0, this.config.internal.maxAlerts);
    }

    // Обновляем статистику
    this.alertStats.totalAlerts++;
    this.alertStats.lastAlert = alert.timestamp;

    if (alert.type === 'ban') {
      this.alertStats.banAlerts++;
    }
    if (alert.type === 'critical') {
      this.alertStats.criticalAlerts++;
    }

    // Считаем алерты за последний час
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.alertStats.alertsPerHour = this.alertHistory.filter(
      a => a.timestamp > hourAgo
    ).length;
  }

  /**
   * 🧪 Тестирование уведомлений
   */
  public async testNotifications(): Promise<{
    telegram: boolean;
    email: boolean;
    errors: string[];
  }> {
    const results = { telegram: false, email: false, errors: [] };

    const testAlert: BanAlert = {
      type: 'warning',
      ip: '127.0.0.1',
      proxy: 'test-proxy:8080',
      userAgent: 'Test User Agent',
      statusCode: 403,
      url: 'https://wildberries.ru/test',
      timestamp: new Date(),
      retryCount: 0,
      reason: 'Тестовое уведомление'
    };

    // Тест Telegram
    if (this.config.telegram.enabled) {
      try {
        await this.sendTelegramAlert('🧪 Тест уведомлений WB Парсинг', testAlert);
        results.telegram = true;
      } catch (error) {
        results.errors.push(`Telegram: ${error}`);
      }
    }

    // Тест Email
    if (this.config.email.enabled) {
      try {
        await this.sendEmailAlert('🧪 Тест уведомлений WB Парсинг', testAlert);
        results.email = true;
      } catch (error) {
        results.errors.push(`Email: ${error}`);
      }
    }

    return results;
  }

  /**
   * 📊 Получение статистики
   */
  public getStats(): AlertStats {
    return { ...this.alertStats };
  }

  /**
   * 📜 Получение истории алертов
   */
  public getHistory(limit: number = 50): BanAlert[] {
    return this.alertHistory.slice(0, limit);
  }

  /**
   * 🧹 Очистка истории
   */
  public clearHistory(): void {
    this.alertHistory = [];
    this.alertStats = {
      totalAlerts: 0,
      banAlerts: 0,
      criticalAlerts: 0,
      lastAlert: null,
      alertsPerHour: 0
    };
    console.log('🧹 История алертов очищена');
  }

  /**
   * ⚙️ Получение текущей конфигурации
   */
  public getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

// Экспортируем singleton
export const notificationService = new NotificationService();
export default NotificationService;
export type { NotificationConfig, BanAlert, AlertStats };
