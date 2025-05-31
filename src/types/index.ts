// Типы данных для приложения Ozon Price Optimizer Pro

// Тип пользователя
export interface User {
  id: string;
  email: string;
  name?: string;
  apiKey?: string;
  role: UserRole;
  settings: UserSettings;
}

// Роли пользователей
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

// Настройки пользователя
export interface UserSettings {
  telegramChatId?: string;
  emailNotifications: boolean;
  telegramNotifications: boolean;
  autoApplyPriceChanges: boolean;
  defaultPricingStrategy: PricingStrategyType;
}

// Товар
export interface Product {
  id: string;
  ozonId: string;
  name: string;
  sku: string;
  currentPrice: number;
  costPrice: number;
  recommendedPrice?: number;
  category: string;
  brand: string;
  productType: ProductType;
  stock: number;
  nextDeliveryDate?: string;
  aiModulesEnabled: AIModule[];
  competitorProducts: CompetitorProduct[];
  priceHistory: PriceChange[];
}

// Тип товара для стратегии ценообразования
export enum ProductType {
  HIT = 'hit',           // Хит продаж
  OUTDATED = 'outdated', // Устаревший товар
  PREMIUM = 'premium',   // Премиум товар
  STANDARD = 'standard'  // Стандартный товар
}

// Модули ИИ
export enum AIModule {
  DEMAND_FORECAST = 'demand_forecast',   // Прогнозирование спроса
  REINFORCEMENT_LEARNING = 'rl',         // Reinforcement Learning
  REVIEW_ANALYSIS = 'review_analysis',   // Анализ отзывов (NLP)
  ANOMALY_DETECTION = 'anomaly_detection', // Обнаружение аномалий
  PERSONALIZATION = 'personalization'    // Персонализация
}

// Товар конкурента
export interface CompetitorProduct {
  id: string;
  competitorName: string;
  productName: string;
  currentPrice: number;
  priceHistory: PriceChange[];
  rating: number;
  reviewCount: number;
  isSuspicious: boolean;
}

// Изменение цены
export interface PriceChange {
  id: string;
  oldPrice: number;
  newPrice: number;
  date: string;
  reason: string;
  appliedStrategy?: PricingStrategyType;
  isAutomatic: boolean;
}

// Стратегия ценообразования
export interface PricingStrategy {
  id: string;
  name: string;
  type: PricingStrategyType;
  rules: PricingRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Тип стратегии ценообразования
export enum PricingStrategyType {
  AGGRESSIVE = 'aggressive',     // Агрессивная
  PREMIUM = 'premium',           // Премиум
  STOCK_CLEARANCE = 'clearance', // Очистка склада
  CUSTOM = 'custom'              // Кастомная
}

// Правило ценообразования
export interface PricingRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
}

// Прогноз спроса
export interface DemandForecast {
  productId: string;
  date: string;
  expectedSales: {
    min: number;
    max: number;
  };
  margin: {
    min: number;
    max: number;
  };
  risks: string[];
}

// Алерт о подозрительной активности
export interface SuspiciousActivityAlert {
  id: string;
  type: SuspiciousActivityType;
  competitorName: string;
  productId: string;
  description: string;
  date: string;
  isResolved: boolean;
  recommendedAction: string;
}

// Тип подозрительной активности
export enum SuspiciousActivityType {
  FAKE_REVIEWS = 'fake_reviews',
  FAKE_SHOP = 'fake_shop',
  DUMPING = 'dumping'
}

// Фильтры для поиска товаров
export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  productTypes?: ProductType[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  stockRange?: {
    min?: number;
    max?: number;
  };
  aiModules?: AIModule[];
}

// История анализа товара
export interface AnalysisHistory {
  id: string;
  productId: string;
  date: string;
  recommendedPrice: number;
  minPrice: number;
  competitorsCount: number;
  avgCompetitorPrice: number;
  analysis: string;
  appliedToProduct: boolean;
  appliedDate?: string;
}

// Результат анализа товара
export interface ProductAnalysis {
  success: boolean;
  analysis?: string;
  recommendedPrice?: number;
  minPrice?: number;
  competitorsData?: {
    count: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  };
  message?: string;
}

// Типы для слотов поставок
export enum SlotType {
  CROSSDOCKING = 'crossdocking',
  DIRECT = 'direct'
}

export interface Slot {
  id: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SlotType;
  available: boolean;
}

export interface SlotFilters {
  warehouseIds?: string[];
  types?: SlotType[];
  startDate?: string;
  endDate?: string;
  availableOnly?: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  region: string;
}
