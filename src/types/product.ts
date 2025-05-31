// Типы категорий товаров
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME = 'home',
  BEAUTY = 'beauty',
  SPORTS = 'sports',
  TOYS = 'toys',
  BOOKS = 'books',
  FOOD = 'food',
  HEALTH = 'health',
  AUTO = 'auto',
  PETS = 'pets',
  JEWELRY = 'jewelry',
  OFFICE = 'office',
  GARDEN = 'garden',
  OTHER = 'other'
}

// Названия категорий на русском
export const ProductCategoryNames: Record<ProductCategory, string> = {
  [ProductCategory.ELECTRONICS]: 'Электроника',
  [ProductCategory.CLOTHING]: 'Одежда и обувь',
  [ProductCategory.HOME]: 'Дом и интерьер',
  [ProductCategory.BEAUTY]: 'Красота и уход',
  [ProductCategory.SPORTS]: 'Спорт и отдых',
  [ProductCategory.TOYS]: 'Игрушки и игры',
  [ProductCategory.BOOKS]: 'Книги и канцтовары',
  [ProductCategory.FOOD]: 'Продукты питания',
  [ProductCategory.HEALTH]: 'Здоровье',
  [ProductCategory.AUTO]: 'Автотовары',
  [ProductCategory.PETS]: 'Товары для животных',
  [ProductCategory.JEWELRY]: 'Ювелирные изделия',
  [ProductCategory.OFFICE]: 'Офис и бизнес',
  [ProductCategory.GARDEN]: 'Сад и огород',
  [ProductCategory.OTHER]: 'Прочее'
};

// Статус товара
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

// Названия статусов на русском
export const ProductStatusNames: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'Активен',
  [ProductStatus.INACTIVE]: 'Неактивен',
  [ProductStatus.PENDING]: 'На модерации',
  [ProductStatus.REJECTED]: 'Отклонен',
  [ProductStatus.ARCHIVED]: 'В архиве'
};

// Интерфейс для цены товара
export interface ProductPrice {
  current: number;
  old?: number;
  min?: number;
  max?: number;
  recommended?: number;
  costPrice?: number; // Себестоимость
  minThreshold?: number; // Минимальный порог цены, ниже которого нельзя опускаться
  competitorPrices?: CompetitorPrice[]; // Цены конкурентов
}

// Интерфейс для конкурента
export interface Competitor {
  id: string;
  name: string;
  website?: string;
  description?: string;
  isActive: boolean;
}

// Интерфейс для товара конкурента
export interface CompetitorProduct {
  id: string;
  competitorId: string;
  competitorName: string;
  productId?: string;
  productTitle: string;
  price: number;
  url?: string;
  lastUpdated: Date;
  isActive?: boolean;
  imageUrl?: string;
}

// Интерфейс для цены конкурента
export interface CompetitorPrice {
  competitorId: string;
  competitorName: string;
  price: number;
  url?: string;
  lastUpdated: Date;
}

// Интерфейс для информации о складе
export interface StockInfo {
  available: number;
  reserved: number;
  inbound?: number; // Ожидается поступление
  nextDeliveryDate?: Date; // Дата следующей поставки
  warehouseId?: string;
  warehouseName?: string;
}

// Интерфейс для статистики продаж
export interface SalesStats {
  totalSold: number;
  lastMonthSold: number;
  lastWeekSold: number;
  averageRating?: number;
  reviewsCount?: number;
}

// Интерфейс для атрибута товара
export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

// Источник товара
export enum ProductSource {
  OZON = 'ozon',
  WILDBERRIES = 'wildberries',
  YANDEX_MARKET = 'yandex_market',
  MANUAL = 'manual',
  OTHER = 'other'
}

// Названия источников товаров на русском
export const ProductSourceNames: Record<ProductSource, string> = {
  [ProductSource.OZON]: 'Ozon',
  [ProductSource.WILDBERRIES]: 'Wildberries',
  [ProductSource.YANDEX_MARKET]: 'Яндекс.Маркет',
  [ProductSource.MANUAL]: 'Добавлен вручную',
  [ProductSource.OTHER]: 'Другой источник'
};

// Источник изображения товара
export enum ImageSource {
  OZON = 'ozon',
  GOOGLE = 'google',
  UPLOAD = 'upload',
  OTHER = 'other'
}

// Интерфейс для изображения товара
export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
  source?: ImageSource; // Источник изображения
  title?: string; // Название изображения (для отображения)
}

// Основной интерфейс товара
export interface Product {
  id: string;
  ozonId?: string; // ID товара в Ozon
  title: string;
  description: string;
  sku: string;
  barcode?: string;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  price: ProductPrice;
  stock: StockInfo;
  status: ProductStatus;
  images: ProductImage[];
  attributes?: ProductAttribute[];
  salesStats?: SalesStats;
  createdAt: Date;
  updatedAt: Date;
  appliedStrategyId?: string; // ID применяемой стратегии ценообразования
  source?: ProductSource; // Источник товара (Ozon, Wildberries, добавлен вручную и т.д.)
  linkedCompetitors?: CompetitorProduct[]; // Связанные товары конкурентов
  autoPricingRules?: any[]; // Правила автоматического изменения цен
  autoPricingEnabled?: boolean; // Включено ли автоматическое изменение цен
  priceAlerts?: any[]; // Уведомления о ценах
  monitoringSchedule?: any[]; // Расписание мониторинга цен
  ozonCardData?: OzonCardData; // Данные карточки товара Ozon
}

// Интерфейс для карточки товара Ozon
export interface OzonCardData {
  id?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  title: string;
  description: string;
  shortDescription?: string;
  brand: string;
  barcode?: string;
  images: string[];
  primaryImage?: string;
  attributes: OzonCardAttribute[];
  specifications: OzonCardSpecification[];
  dimensions?: {
    weight: number; // в граммах
    length: number; // в мм
    width: number; // в мм
    height: number; // в мм
  };
  packageQuantity?: number;
  categoryId: string;
  categoryPath?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isDigital?: boolean;
  isAdult?: boolean;
  vat?: number; // НДС в процентах
  manufacturer?: string;
  manufacturerCountry?: string;
  warranty?: number; // в месяцах
  customFields?: {
    [key: string]: string;
  };
}

// Интерфейс для атрибута карточки товара Ozon
export interface OzonCardAttribute {
  id: string;
  name: string;
  value: string;
  isRequired: boolean;
}

// Интерфейс для характеристики карточки товара Ozon
export interface OzonCardSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
}

// Интерфейс для фильтров товаров
export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  withStrategy?: boolean;
  sortBy?: 'title' | 'price' | 'stock' | 'sales' | 'rating' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Интерфейс для результатов поиска товаров
export interface ProductSearchResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Статус изменения цены
export enum PriceChangeStatus {
  APPLIED = 'applied',
  PENDING = 'pending',
  REJECTED = 'rejected',
  FAILED = 'failed'
}

// Названия статусов изменения цены на русском
export const PriceChangeStatusNames: Record<PriceChangeStatus, string> = {
  [PriceChangeStatus.APPLIED]: 'Применено',
  [PriceChangeStatus.PENDING]: 'Ожидает',
  [PriceChangeStatus.REJECTED]: 'Отклонено',
  [PriceChangeStatus.FAILED]: 'Ошибка'
};

// Интерфейс для изменения цены
export interface PriceChange {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  oldPrice: number;
  newPrice: number;
  changePercent?: number;
  changeAmount?: number;
  reason: string;
  strategyId?: string;
  strategyName?: string;
  date: string;
  timestamp?: Date;
  status: PriceChangeStatus | string;
  competitorId?: string;
  competitorName?: string;
  competitorPrice?: number;
  appliedStrategy?: string;
  isAutomatic?: boolean;
}
