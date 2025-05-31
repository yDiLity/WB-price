// Типы для системы мониторинга слотов поставок

export interface DeliverySlot {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseType: 'FBS' | 'FBO';
  date: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  availableCapacity: number;
  totalCapacity: number;
  isAvailable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  aiRating: number; // 0-100, AI оценка оптимальности слота
  estimatedDeliveryTime: string;
  cost: number;
  region: string;
  city: string;
  address: string;
  restrictions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SlotFilter {
  warehouseType?: 'FBS' | 'FBO' | 'all';
  region?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  minCapacity?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical' | 'all';
  minAiRating?: number;
  maxCost?: number;
  onlyAvailable?: boolean;
}

export interface SlotBooking {
  id: string;
  slotId: string;
  userId: string;
  productIds: string[];
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingTime: string;
  confirmationTime?: string;
  cancellationTime?: string;
  cancellationReason?: string;
  autoBooked: boolean;
  priority: number;
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
}

export interface SlotMonitoringSettings {
  id: string;
  userId: string;
  isEnabled: boolean;
  autoBooking: boolean;
  filters: SlotFilter;
  notifications: {
    telegram: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  autoBookingRules: {
    minAiRating: number;
    maxCost: number;
    preferredWarehouses: string[];
    preferredTimeSlots: string[];
    maxBookingsPerDay: number;
    requireConfirmation: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SlotAlert {
  id: string;
  slotId: string;
  userId: string;
  type: 'new_slot' | 'price_drop' | 'capacity_increase' | 'urgent' | 'ai_recommendation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SlotStatistics {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  averageAiRating: number;
  averageCost: number;
  topWarehouses: Array<{
    id: string;
    name: string;
    slotsCount: number;
    averageRating: number;
  }>;
  slotsByType: {
    FBS: number;
    FBO: number;
  };
  slotsByPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentActivity: Array<{
    type: 'slot_found' | 'slot_booked' | 'slot_cancelled';
    timestamp: string;
    description: string;
  }>;
}

export interface AISlotPrediction {
  slotId: string;
  predictedOptimalBookingTime: string;
  confidenceScore: number; // 0-1
  reasoning: string[];
  alternativeSlots: string[];
  riskFactors: string[];
  expectedDemand: 'low' | 'medium' | 'high';
  priceVolatility: 'stable' | 'increasing' | 'decreasing';
  recommendations: string[];
}

export interface SlotBookingHistory {
  id: string;
  slotId: string;
  slot: DeliverySlot;
  booking: SlotBooking;
  outcome: 'successful' | 'failed' | 'cancelled';
  deliveryTime?: string;
  actualCost?: number;
  rating?: number;
  feedback?: string;
  createdAt: string;
}

// Утилитарные типы
export type SlotSortBy = 
  | 'date' 
  | 'aiRating' 
  | 'cost' 
  | 'capacity' 
  | 'priority' 
  | 'warehouseName'
  | 'createdAt';

export type SlotSortOrder = 'asc' | 'desc';

export interface SlotSearchParams {
  query?: string;
  filters: SlotFilter;
  sortBy: SlotSortBy;
  sortOrder: SlotSortOrder;
  page: number;
  limit: number;
}

export interface SlotSearchResult {
  slots: DeliverySlot[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Константы
export const WAREHOUSE_TYPES = ['FBS', 'FBO'] as const;
export const SLOT_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export const ALERT_TYPES = ['new_slot', 'price_drop', 'capacity_increase', 'urgent', 'ai_recommendation'] as const;

// Валидация
export const isValidWarehouseType = (type: string): type is 'FBS' | 'FBO' => {
  return WAREHOUSE_TYPES.includes(type as any);
};

export const isValidPriority = (priority: string): priority is 'low' | 'medium' | 'high' | 'critical' => {
  return SLOT_PRIORITIES.includes(priority as any);
};

export const isValidBookingStatus = (status: string): status is 'pending' | 'confirmed' | 'cancelled' | 'completed' => {
  return BOOKING_STATUSES.includes(status as any);
};

// Хелперы
export const getSlotDisplayName = (slot: DeliverySlot): string => {
  return `${slot.warehouseName} (${slot.warehouseType}) - ${slot.date} ${slot.timeSlot}`;
};

export const getSlotPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'medium': return 'yellow';
    case 'low': return 'green';
    default: return 'gray';
  }
};

export const getAiRatingColor = (rating: number): string => {
  if (rating >= 90) return 'green';
  if (rating >= 70) return 'yellow';
  if (rating >= 50) return 'orange';
  return 'red';
};

export const formatSlotCapacity = (available: number, total: number): string => {
  const percentage = Math.round((available / total) * 100);
  return `${available}/${total} (${percentage}%)`;
};
