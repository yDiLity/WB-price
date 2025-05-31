// Типы для автоматизации ценообразования и мониторинга

export interface AutomationSettings {
  id: string;
  userId: string;
  productId: string;

  // Автоматическое изменение цен на Wildberries
  wbAutoUpdate: boolean; // Главная галочка - изменять цены на Wildberries автоматически
  requireConfirmation: boolean; // Требовать подтверждение (по умолчанию false)

  // 24/7 мониторинг (всегда включен)
  monitoring24x7: boolean; // Всегда true
  monitoringInterval: number; // Интервал в минутах (по умолчанию 5)

  // Настройки безопасности
  maxPriceChangePercent: number; // Максимальное изменение цены за раз (%)
  maxDailyChanges: number; // Максимальное количество изменений в день
  minTimeBetweenChanges: number; // Минимальное время между изменениями (минуты)

  // API настройки
  ozonApiKey?: string; // API ключ Ozon (если есть)
  ozonClientId?: string; // Client ID Ozon (если есть)

  // Уведомления
  notifyOnPriceChange: boolean; // Уведомлять об изменениях цен
  notifyOnErrors: boolean; // Уведомлять об ошибках

  createdAt: string;
  updatedAt: string;
}

export interface PriceChangeAttempt {
  id: string;
  productId: string;
  automationSettingsId: string;

  oldPrice: number;
  newPrice: number;
  changePercent: number;

  status: 'pending' | 'success' | 'failed' | 'blocked';
  reason: string; // Причина изменения или ошибки

  // Данные о попытке изменения на Ozon
  ozonRequestId?: string;
  ozonResponse?: any;
  ozonError?: string;

  attemptedAt: string;
  completedAt?: string;

  // Метаданные
  triggeredBy: 'competitor_price' | 'strategy_rule' | 'manual' | 'schedule';
  competitorId?: string;
  competitorPrice?: number;
  strategyId?: string;
}

export interface MonitoringStatus {
  isActive: boolean; // Всегда true для 24/7
  lastCheck: string;
  nextCheck: string;
  checksToday: number;
  errorsToday: number;
  successfulChangesToday: number;

  // Статистика
  totalChecks: number;
  totalChanges: number;
  totalErrors: number;
  uptime: number; // Процент времени работы
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;

  // Условия срабатывания
  conditions: {
    competitorPriceChange?: {
      enabled: boolean;
      minChangePercent: number; // Минимальное изменение цены конкурента для реакции
    };
    timeBasedRules?: {
      enabled: boolean;
      schedule: string; // Cron-like расписание
    };
    marketConditions?: {
      enabled: boolean;
      demandThreshold: number;
      competitionLevel: 'low' | 'medium' | 'high';
    };
  };

  // Действия
  actions: {
    priceAdjustment: {
      type: 'percentage' | 'fixed' | 'competitive';
      value: number;
      respectMinMax: boolean;
    };
    notifications: {
      telegram: boolean;
      email: boolean;
      webhook?: string;
    };
  };

  createdAt: string;
  updatedAt: string;
}

export interface WBApiStatus {
  isConnected: boolean;
  hasValidKeys: boolean;
  lastSuccessfulCall?: string;
  lastError?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
}

// Константы
export const DEFAULT_AUTOMATION_SETTINGS: Partial<AutomationSettings> = {
  wbAutoUpdate: false, // По умолчанию выключено для безопасности
  requireConfirmation: true, // По умолчанию требуем подтверждение
  monitoring24x7: true, // Всегда включен
  monitoringInterval: 5, // Каждые 5 минут
  maxPriceChangePercent: 10, // Максимум 10% изменение за раз
  maxDailyChanges: 5, // Максимум 5 изменений в день
  minTimeBetweenChanges: 30, // Минимум 30 минут между изменениями
  notifyOnPriceChange: true,
  notifyOnErrors: true,
};

export const MONITORING_INTERVALS = [
  { value: 1, label: 'Каждую минуту' },
  { value: 5, label: 'Каждые 5 минут' },
  { value: 10, label: 'Каждые 10 минут' },
  { value: 15, label: 'Каждые 15 минут' },
  { value: 30, label: 'Каждые 30 минут' },
  { value: 60, label: 'Каждый час' },
];

// Утилиты
export const getAutomationStatusColor = (status: string): string => {
  switch (status) {
    case 'success': return 'green';
    case 'pending': return 'yellow';
    case 'failed': return 'red';
    case 'blocked': return 'orange';
    default: return 'gray';
  }
};

export const getAutomationStatusText = (status: string): string => {
  switch (status) {
    case 'success': return 'Успешно';
    case 'pending': return 'Выполняется';
    case 'failed': return 'Ошибка';
    case 'blocked': return 'Заблокировано';
    default: return 'Неизвестно';
  }
};

export const formatPriceChange = (oldPrice: number, newPrice: number): string => {
  const change = newPrice - oldPrice;
  const changePercent = ((change / oldPrice) * 100).toFixed(1);
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} ₽ (${sign}${changePercent}%)`;
};
