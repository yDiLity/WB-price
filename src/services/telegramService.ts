/**
 * Сервис для работы с Telegram-ботом
 */

import { Product, PriceChange, SuspiciousActivityAlert } from '../types';

// Типы уведомлений
export enum NotificationType {
  PRICE_CHANGE = 'price_change',
  COMPETITOR_PRICE_CHANGE = 'competitor_price_change',
  ANALYSIS_COMPLETE = 'analysis_complete',
  RECOMMENDATION = 'recommendation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ERROR = 'error'
}

// Интерфейс для уведомления
export interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

interface TelegramServiceConfig {
  botToken: string;
  baseUrl: string;
  chatIds: string[];
}

class TelegramService {
  private config: TelegramServiceConfig | null = null;
  private storageKey = 'ozon_price_optimizer_telegram_config';

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Загрузка конфигурации из localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const savedConfig = localStorage.getItem(this.storageKey);
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Error loading Telegram config from localStorage:', error);
      this.config = null;
    }
  }

  /**
   * Сохранение конфигурации в localStorage
   */
  private saveToLocalStorage(): void {
    try {
      if (this.config) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('Error saving Telegram config to localStorage:', error);
    }
  }

  /**
   * Инициализация сервиса с токеном бота и ID чата
   */
  initialize(botToken: string, chatId?: string) {
    this.config = {
      botToken,
      baseUrl: 'https://api.telegram.org/bot',
      chatIds: chatId ? [chatId] : []
    };

    this.saveToLocalStorage();
    console.log('Telegram Service initialized');
    return true;
  }

  /**
   * Проверка, инициализирован ли сервис
   */
  isInitialized(): boolean {
    return this.config !== null;
  }

  /**
   * Добавление нового ID чата
   * @param chatId ID чата для добавления
   * @returns true, если ID чата успешно добавлен
   */
  addChatId(chatId: string): boolean {
    if (!this.config) {
      console.error('Telegram Service not initialized');
      return false;
    }

    if (!this.config.chatIds.includes(chatId)) {
      this.config.chatIds.push(chatId);
      this.saveToLocalStorage();
      return true;
    }

    return false;
  }

  /**
   * Удаление ID чата
   * @param chatId ID чата для удаления
   * @returns true, если ID чата успешно удален
   */
  removeChatId(chatId: string): boolean {
    if (!this.config) {
      console.error('Telegram Service not initialized');
      return false;
    }

    const initialLength = this.config.chatIds.length;
    this.config.chatIds = this.config.chatIds.filter(id => id !== chatId);

    if (this.config.chatIds.length !== initialLength) {
      this.saveToLocalStorage();
      return true;
    }

    return false;
  }

  /**
   * Получение списка ID чатов
   * @returns Массив ID чатов или пустой массив, если сервис не инициализирован
   */
  getChatIds(): string[] {
    return this.config?.chatIds || [];
  }

  /**
   * Отправка сообщения в Telegram
   */
  private async sendMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.config) {
      throw new Error('Telegram Service not initialized');
    }

    try {
      // В реальном приложении здесь будет запрос к API Telegram
      // const response = await fetch(`${this.config.baseUrl}${this.config.botToken}/sendMessage`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     chat_id: chatId,
      //     text: text,
      //     parse_mode: parseMode
      //   })
      // });
      // const data = await response.json();

      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`Sending Telegram message to chat ${chatId}: ${text.substring(0, 50)}...`);

      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления через Telegram всем получателям
   * @param notification Уведомление для отправки
   * @returns Promise с результатом отправки
   */
  async sendNotification(notification: Notification): Promise<boolean> {
    if (!this.config) {
      console.error('Telegram Service not initialized');
      return false;
    }

    if (this.config.chatIds.length === 0) {
      console.warn('No chat IDs configured for Telegram notifications');
      return false;
    }

    try {
      const { type, title, message, data } = notification;

      // Формируем текст сообщения в HTML формате
      let text = `<b>${title}</b>\n\n${message}`;

      // Добавляем дополнительные данные в зависимости от типа уведомления
      if (data) {
        switch (type) {
          case NotificationType.PRICE_CHANGE:
            text += `\n\n<b>Товар:</b> ${data.productName}`;
            text += `\n<b>Старая цена:</b> ${data.oldPrice} ₽`;
            text += `\n<b>Новая цена:</b> ${data.newPrice} ₽`;
            text += `\n<b>Изменение:</b> ${data.changePercent}%`;
            break;

          case NotificationType.COMPETITOR_PRICE_CHANGE:
            text += `\n\n<b>Товар:</b> ${data.productName}`;
            text += `\n<b>Конкурент:</b> ${data.competitorName}`;
            text += `\n<b>Старая цена:</b> ${data.oldPrice} ₽`;
            text += `\n<b>Новая цена:</b> ${data.newPrice} ₽`;
            text += `\n<b>Изменение:</b> ${data.changePercent}%`;
            break;

          case NotificationType.ANALYSIS_COMPLETE:
            text += `\n\n<b>Товар:</b> ${data.productName}`;
            text += `\n<b>Рекомендуемая цена:</b> ${data.recommendedPrice} ₽`;
            break;

          case NotificationType.RECOMMENDATION:
            text += `\n\n<b>Товар:</b> ${data.productName}`;
            text += `\n<b>Рекомендуемая цена:</b> ${data.recommendedPrice} ₽`;
            text += `\n<b>Текущая цена:</b> ${data.currentPrice} ₽`;
            break;

          case NotificationType.SUSPICIOUS_ACTIVITY:
            text += `\n\n<b>Товар:</b> ${data.productName}`;
            text += `\n<b>Тип активности:</b> ${this.getAlertTypeName(data.activityType)}`;
            text += `\n<b>Конкурент:</b> ${data.competitorName}`;
            break;
        }
      }

      // Добавляем подпись
      text += `\n\n<i>Для подробной информации перейдите в личный кабинет Ozon Price Optimizer Pro</i>`;

      // Отправляем сообщение всем получателям
      const results = await Promise.all(
        this.config.chatIds.map(chatId => this.sendMessage(chatId, text))
      );

      // Если хотя бы одно сообщение отправлено успешно, считаем операцию успешной
      return results.some(result => result);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления о изменении цены
   */
  async sendPriceChangeNotification(product: Product, priceChange: PriceChange): Promise<boolean> {
    const changePercent = ((priceChange.newPrice - priceChange.oldPrice) / priceChange.oldPrice * 100).toFixed(2);

    return this.sendNotification({
      type: NotificationType.PRICE_CHANGE,
      title: 'Изменение цены товара',
      message: `Цена на товар "${product.name}" была изменена.`,
      data: {
        productName: product.name,
        oldPrice: priceChange.oldPrice.toLocaleString(),
        newPrice: priceChange.newPrice.toLocaleString(),
        changePercent,
        reason: priceChange.reason
      }
    });
  }

  /**
   * Отправка уведомления о подозрительной активности
   */
  async sendSuspiciousActivityAlert(alert: SuspiciousActivityAlert, product: Product): Promise<boolean> {
    return this.sendNotification({
      type: NotificationType.SUSPICIOUS_ACTIVITY,
      title: '⚠️ Обнаружена подозрительная активность!',
      message: `Обнаружена подозрительная активность конкурента для товара "${product.name}".`,
      data: {
        productName: product.name,
        competitorName: alert.competitorName,
        activityType: alert.type,
        description: alert.description,
        recommendedAction: alert.recommendedAction
      }
    });
  }

  /**
   * Отправка уведомления о рекомендованной цене
   */
  async sendRecommendedPriceNotification(product: Product, recommendedPrice: number): Promise<boolean> {
    const priceDiff = ((recommendedPrice - product.currentPrice) / product.currentPrice * 100).toFixed(2);
    const diffText = recommendedPrice > product.currentPrice ? `на ${priceDiff}% выше` : `на ${Math.abs(Number(priceDiff))}% ниже`;

    return this.sendNotification({
      type: NotificationType.RECOMMENDATION,
      title: '💡 Рекомендация по цене',
      message: `Получена новая рекомендация по цене для товара "${product.name}".`,
      data: {
        productName: product.name,
        currentPrice: product.currentPrice.toLocaleString(),
        recommendedPrice: recommendedPrice.toLocaleString(),
        diffText,
        changePercent: priceDiff
      }
    });
  }

  /**
   * Отправка уведомления о завершении анализа
   */
  async sendAnalysisCompleteNotification(product: Product, recommendedPrice: number): Promise<boolean> {
    return this.sendNotification({
      type: NotificationType.ANALYSIS_COMPLETE,
      title: '✅ Анализ завершен',
      message: `Анализ товара "${product.name}" успешно завершен.`,
      data: {
        productName: product.name,
        recommendedPrice: recommendedPrice.toLocaleString()
      }
    });
  }

  /**
   * Отправка уведомления об изменении цены конкурента
   */
  async sendCompetitorPriceChangeNotification(
    product: Product,
    competitorName: string,
    oldPrice: number,
    newPrice: number
  ): Promise<boolean> {
    const changePercent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
    const changeDirection = newPrice > oldPrice ? 'повысил' : 'снизил';

    return this.sendNotification({
      type: NotificationType.COMPETITOR_PRICE_CHANGE,
      title: '⚠️ Изменение цены конкурента',
      message: `Конкурент ${changeDirection} цену на товар "${product.name}".`,
      data: {
        productName: product.name,
        competitorName,
        oldPrice: oldPrice.toLocaleString(),
        newPrice: newPrice.toLocaleString(),
        changePercent,
        changeDirection
      }
    });
  }

  /**
   * Получение названия типа алерта
   */
  private getAlertTypeName(type: string): string {
    switch (type) {
      case 'fake_reviews':
        return 'Фейковые отзывы';
      case 'fake_shop':
        return 'Фейковый магазин';
      case 'dumping':
        return 'Демпинг';
      default:
        return 'Неизвестно';
    }
  }
}

// Экспортируем синглтон
export const telegramService = new TelegramService();
