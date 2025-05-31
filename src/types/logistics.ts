/**
 * Типы для логистического модуля
 */

// Тип для данных о поставке
export interface Delivery {
  product_id: string;
  quantity: number;
  expected_date: string;
}

// Тип для данных об остатках товара
export interface StockData {
  product_id: string;
  stock: number;
  reserved: number;
}

// Тип для запроса оптимизации цены
export interface OptimizePriceRequest {
  productId: string;
  currentPrice: number;
  stock: number;
}

// Тип для результата оптимизации цены
export interface OptimizePriceResult {
  originalPrice: number;
  optimizedPrice: number;
  priceChange: number;
  recommendation: string;
  nextDeliveryDate: string | null;
}

// Тип для правил логистической оптимизации
export interface LogisticsRule {
  id: string;
  name: string;
  description: string;
  condition: {
    type: 'stock' | 'delivery' | 'both';
    stockThreshold?: number;
    deliveryDaysThreshold?: number;
  };
  action: {
    type: 'increase' | 'decrease' | 'set';
    value: number;
    isPercentage: boolean;
  };
  isActive: boolean;
}

// Тип для настроек логистического оптимизатора
export interface LogisticsSettings {
  enableAutomaticPriceAdjustment: boolean;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  upcomingDeliveryThreshold: number; // в днях
  rules: LogisticsRule[];
}

// Тип для статистики логистики
export interface LogisticsStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  upcomingDeliveries: number;
  averageDeliveryTime: number; // в днях
}

// Тип для CSV-импорта
export interface CsvImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  data: Delivery[];
}
