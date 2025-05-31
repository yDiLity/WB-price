import {
  AutomationSettings,
  PriceChangeAttempt,
  MonitoringStatus,
  OzonApiStatus,
  DEFAULT_AUTOMATION_SETTINGS
} from '../types/automation';

class AutomationService {
  private static instance: AutomationService;
  private settings: Map<string, AutomationSettings> = new Map();
  private priceChangeAttempts: PriceChangeAttempt[] = [];
  private monitoringStatus: MonitoringStatus;
  private ozonApiStatus: OzonApiStatus;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.monitoringStatus = {
      isActive: true, // 24/7 мониторинг всегда активен
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Через 5 минут
      checksToday: 0,
      errorsToday: 0,
      successfulChangesToday: 0,
      totalChecks: 0,
      totalChanges: 0,
      totalErrors: 0,
      uptime: 99.5,
    };

    this.ozonApiStatus = {
      isConnected: false,
      hasValidKeys: false,
      lastError: 'API ключи не настроены',
    };

    // Загружаем данные из localStorage
    this.loadFromLocalStorage();

    this.startMonitoring();
    console.log('AutomationService initialized - 24/7 monitoring started');
  }

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  // Получение настроек автоматизации для продукта
  public getAutomationSettings(productId: string): AutomationSettings {
    const existing = this.settings.get(productId);
    if (existing) {
      return existing;
    }

    // Создаем настройки по умолчанию
    const defaultSettings: AutomationSettings = {
      id: `automation_${productId}_${Date.now()}`,
      userId: 'current_user',
      productId,
      ...DEFAULT_AUTOMATION_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as AutomationSettings;

    this.settings.set(productId, defaultSettings);
    return defaultSettings;
  }

  // Обновление настроек автоматизации
  public updateAutomationSettings(productId: string, updates: Partial<AutomationSettings>): AutomationSettings {
    const current = this.getAutomationSettings(productId);
    const updated = {
      ...current,
      ...updates,
      monitoring24x7: true, // Всегда принудительно включаем 24/7 мониторинг
      updatedAt: new Date().toISOString(),
    };

    this.settings.set(productId, updated);

    // Сохраняем в localStorage
    this.saveToLocalStorage();

    console.log(`Automation settings updated for product ${productId}:`, updates);
    return updated;
  }

  // Включение/выключение автоматического изменения цен на Ozon
  public toggleOzonAutoUpdate(productId: string, enabled: boolean): void {
    this.updateAutomationSettings(productId, {
      ozonAutoUpdate: enabled,
      requireConfirmation: !enabled // Если автообновление включено, подтверждение не требуется
    });
  }

  // Попытка изменения цены на Ozon
  public async attemptPriceChange(
    productId: string,
    oldPrice: number,
    newPrice: number,
    reason: string,
    triggeredBy: 'competitor_price' | 'strategy_rule' | 'manual' | 'schedule' = 'manual'
  ): Promise<PriceChangeAttempt> {
    const settings = this.getAutomationSettings(productId);
    const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

    const attempt: PriceChangeAttempt = {
      id: `attempt_${Date.now()}`,
      productId,
      automationSettingsId: settings.id,
      oldPrice,
      newPrice,
      changePercent,
      status: 'pending',
      reason,
      triggeredBy,
      attemptedAt: new Date().toISOString(),
    };

    // Проверяем ограничения
    if (Math.abs(changePercent) > settings.maxPriceChangePercent) {
      attempt.status = 'blocked';
      attempt.reason = `Изменение цены превышает лимит ${settings.maxPriceChangePercent}%`;
      attempt.completedAt = new Date().toISOString();
      this.priceChangeAttempts.push(attempt);
      return attempt;
    }

    // Проверяем количество изменений за день
    const today = new Date().toDateString();
    const todayAttempts = this.priceChangeAttempts.filter(
      a => a.productId === productId &&
           new Date(a.attemptedAt).toDateString() === today &&
           a.status === 'success'
    );

    if (todayAttempts.length >= settings.maxDailyChanges) {
      attempt.status = 'blocked';
      attempt.reason = `Превышен лимит изменений в день (${settings.maxDailyChanges})`;
      attempt.completedAt = new Date().toISOString();
      this.priceChangeAttempts.push(attempt);
      return attempt;
    }

    // Если автообновление включено, пытаемся изменить цену
    if (settings.ozonAutoUpdate && !settings.requireConfirmation) {
      try {
        const result = await this.callOzonAPI(productId, newPrice);
        if (result.success) {
          attempt.status = 'success';
          attempt.ozonRequestId = result.requestId;
          attempt.ozonResponse = result.response;
          this.monitoringStatus.successfulChangesToday++;
        } else {
          attempt.status = 'failed';
          attempt.ozonError = result.error;
          this.monitoringStatus.errorsToday++;
        }
      } catch (error) {
        attempt.status = 'failed';
        attempt.ozonError = error instanceof Error ? error.message : 'Неизвестная ошибка';
        this.monitoringStatus.errorsToday++;
      }
    } else {
      // Если автообновление выключено или требуется подтверждение
      attempt.status = 'pending';
      attempt.reason += ' (требуется подтверждение)';
    }

    attempt.completedAt = new Date().toISOString();
    this.priceChangeAttempts.push(attempt);

    // Сохраняем в localStorage
    this.saveToLocalStorage();

    return attempt;
  }

  // Мок вызова Ozon API
  private async callOzonAPI(productId: string, newPrice: number): Promise<{
    success: boolean;
    requestId?: string;
    response?: any;
    error?: string;
  }> {
    // Симуляция API вызова
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Проверяем статус API
    if (!this.ozonApiStatus.hasValidKeys) {
      throw new Error('Ozon API ключи не настроены');
    }

    // Симуляция успешного/неуспешного ответа
    const success = Math.random() > 0.1; // 90% успеха

    if (success) {
      return {
        success: true,
        requestId: `req_${Date.now()}`,
        response: {
          productId,
          newPrice,
          status: 'updated',
          timestamp: new Date().toISOString(),
        },
      };
    } else {
      return {
        success: false,
        error: 'Временная ошибка Ozon API. Повторите попытку позже.',
      };
    }
  }

  // Получение статуса мониторинга
  public getMonitoringStatus(): MonitoringStatus {
    return { ...this.monitoringStatus };
  }

  // Получение статуса Ozon API
  public getOzonApiStatus(): OzonApiStatus {
    return { ...this.ozonApiStatus };
  }

  // Настройка Ozon API ключей
  public setOzonApiKeys(apiKey: string, clientId: string): void {
    this.ozonApiStatus = {
      ...this.ozonApiStatus,
      hasValidKeys: !!(apiKey && clientId),
      isConnected: !!(apiKey && clientId),
      lastError: !!(apiKey && clientId) ? undefined : 'API ключи не настроены',
    };

    // Сохраняем в localStorage (в реальном приложении лучше использовать безопасное хранение)
    localStorage.setItem('ozonApiKey', apiKey);
    localStorage.setItem('ozonClientId', clientId);
  }

  // Получение истории изменений цен
  public getPriceChangeHistory(productId?: string): PriceChangeAttempt[] {
    if (productId) {
      return this.priceChangeAttempts.filter(attempt => attempt.productId === productId);
    }
    return [...this.priceChangeAttempts];
  }

  // Запуск 24/7 мониторинга
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performMonitoringCheck();
    }, 5 * 60 * 1000); // Каждые 5 минут

    console.log('24/7 monitoring started - checking every 5 minutes');
  }

  // Выполнение проверки мониторинга
  private performMonitoringCheck(): void {
    this.monitoringStatus.lastCheck = new Date().toISOString();
    this.monitoringStatus.nextCheck = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    this.monitoringStatus.checksToday++;
    this.monitoringStatus.totalChecks++;

    // Здесь будет логика проверки цен конкурентов и применения стратегий
    console.log('Monitoring check performed at', new Date().toLocaleString());
  }

  // Сохранение в localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('automationSettings', JSON.stringify(Array.from(this.settings.entries())));
      localStorage.setItem('priceChangeAttempts', JSON.stringify(this.priceChangeAttempts));
      localStorage.setItem('monitoringStatus', JSON.stringify(this.monitoringStatus));
    } catch (error) {
      console.error('Failed to save automation data to localStorage:', error);
    }
  }

  // Загрузка из localStorage
  private loadFromLocalStorage(): void {
    try {
      const settingsData = localStorage.getItem('automationSettings');
      if (settingsData) {
        const entries = JSON.parse(settingsData);
        this.settings = new Map(entries);
      }

      const attemptsData = localStorage.getItem('priceChangeAttempts');
      if (attemptsData) {
        this.priceChangeAttempts = JSON.parse(attemptsData);
      }

      const statusData = localStorage.getItem('monitoringStatus');
      if (statusData) {
        this.monitoringStatus = { ...this.monitoringStatus, ...JSON.parse(statusData) };
      }

      // Загружаем API ключи
      const apiKey = localStorage.getItem('ozonApiKey');
      const clientId = localStorage.getItem('ozonClientId');
      if (apiKey && clientId) {
        this.setOzonApiKeys(apiKey, clientId);
      }
    } catch (error) {
      console.error('Failed to load automation data from localStorage:', error);
    }
  }
}

export const automationService = AutomationService.getInstance();
