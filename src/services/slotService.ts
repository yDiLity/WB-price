import { 
  DeliverySlot, 
  SlotFilter, 
  SlotBooking, 
  SlotMonitoringSettings, 
  SlotAlert, 
  SlotStatistics,
  AISlotPrediction,
  SlotSearchParams,
  SlotSearchResult,
  SlotBookingHistory
} from '../types/slot';

// Моковые данные для демонстрации
const generateMockSlots = (): DeliverySlot[] => {
  const warehouses = [
    { id: 'wh1', name: 'Тверь', type: 'FBS' as const, region: 'Тверская область', city: 'Тверь' },
    { id: 'wh2', name: 'Подольск', type: 'FBO' as const, region: 'Московская область', city: 'Подольск' },
    { id: 'wh3', name: 'Екатеринбург', type: 'FBS' as const, region: 'Свердловская область', city: 'Екатеринбург' },
    { id: 'wh4', name: 'Казань', type: 'FBO' as const, region: 'Республика Татарстан', city: 'Казань' },
    { id: 'wh5', name: 'Новосибирск', type: 'FBS' as const, region: 'Новосибирская область', city: 'Новосибирск' },
  ];

  const timeSlots = [
    '09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'
  ];

  const priorities = ['low', 'medium', 'high', 'critical'] as const;

  const slots: DeliverySlot[] = [];
  
  for (let i = 0; i < 50; i++) {
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    const [startTime, endTime] = timeSlot.split('-');
    
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 14)); // Следующие 2 недели
    
    const totalCapacity = Math.floor(Math.random() * 100) + 20;
    const availableCapacity = Math.floor(Math.random() * totalCapacity);
    
    slots.push({
      id: `slot_${i + 1}`,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      warehouseType: warehouse.type,
      date: date.toISOString().split('T')[0],
      timeSlot,
      startTime,
      endTime,
      availableCapacity,
      totalCapacity,
      isAvailable: availableCapacity > 0,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      aiRating: Math.floor(Math.random() * 100),
      estimatedDeliveryTime: `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 3} дня`,
      cost: Math.floor(Math.random() * 500) + 100,
      region: warehouse.region,
      city: warehouse.city,
      address: `ул. Складская, ${Math.floor(Math.random() * 100) + 1}`,
      restrictions: Math.random() > 0.7 ? ['Негабаритные товары', 'Хрупкие товары'] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return slots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

class SlotService {
  private static instance: SlotService;
  private slots: DeliverySlot[] = [];
  private bookings: SlotBooking[] = [];
  private alerts: SlotAlert[] = [];
  private monitoringSettings: SlotMonitoringSettings | null = null;

  private constructor() {
    this.slots = generateMockSlots();
    this.generateMockAlerts();
    console.log('SlotService initialized with', this.slots.length, 'slots');
  }

  public static getInstance(): SlotService {
    if (!SlotService.instance) {
      SlotService.instance = new SlotService();
    }
    return SlotService.instance;
  }

  // Получение слотов с фильтрацией
  public async getSlots(params: SlotSearchParams): Promise<SlotSearchResult> {
    let filteredSlots = [...this.slots];

    // Применяем фильтры
    const { filters } = params;
    
    if (filters.warehouseType && filters.warehouseType !== 'all') {
      filteredSlots = filteredSlots.filter(slot => slot.warehouseType === filters.warehouseType);
    }

    if (filters.region) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.region.toLowerCase().includes(filters.region!.toLowerCase())
      );
    }

    if (filters.city) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filteredSlots = filteredSlots.filter(slot => slot.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredSlots = filteredSlots.filter(slot => slot.date <= filters.dateTo!);
    }

    if (filters.minCapacity) {
      filteredSlots = filteredSlots.filter(slot => slot.availableCapacity >= filters.minCapacity!);
    }

    if (filters.priority && filters.priority !== 'all') {
      filteredSlots = filteredSlots.filter(slot => slot.priority === filters.priority);
    }

    if (filters.minAiRating) {
      filteredSlots = filteredSlots.filter(slot => slot.aiRating >= filters.minAiRating!);
    }

    if (filters.maxCost) {
      filteredSlots = filteredSlots.filter(slot => slot.cost <= filters.maxCost!);
    }

    if (filters.onlyAvailable) {
      filteredSlots = filteredSlots.filter(slot => slot.isAvailable);
    }

    // Поиск по запросу
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredSlots = filteredSlots.filter(slot =>
        slot.warehouseName.toLowerCase().includes(query) ||
        slot.city.toLowerCase().includes(query) ||
        slot.region.toLowerCase().includes(query)
      );
    }

    // Сортировка
    filteredSlots.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (params.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'aiRating':
          aValue = a.aiRating;
          bValue = b.aiRating;
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'capacity':
          aValue = a.availableCapacity;
          bValue = b.availableCapacity;
          break;
        case 'warehouseName':
          aValue = a.warehouseName;
          bValue = b.warehouseName;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (params.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Пагинация
    const total = filteredSlots.length;
    const totalPages = Math.ceil(total / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedSlots = filteredSlots.slice(startIndex, endIndex);

    return {
      slots: paginatedSlots,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    };
  }

  // Получение статистики
  public async getStatistics(): Promise<SlotStatistics> {
    const availableSlots = this.slots.filter(slot => slot.isAvailable);
    const bookedSlots = this.bookings.length;

    const warehouseCounts = this.slots.reduce((acc, slot) => {
      const key = `${slot.warehouseId}_${slot.warehouseName}`;
      if (!acc[key]) {
        acc[key] = { id: slot.warehouseId, name: slot.warehouseName, count: 0, totalRating: 0 };
      }
      acc[key].count++;
      acc[key].totalRating += slot.aiRating;
      return acc;
    }, {} as Record<string, any>);

    const topWarehouses = Object.values(warehouseCounts)
      .map((wh: any) => ({
        id: wh.id,
        name: wh.name,
        slotsCount: wh.count,
        averageRating: Math.round(wh.totalRating / wh.count),
      }))
      .sort((a, b) => b.slotsCount - a.slotsCount)
      .slice(0, 5);

    return {
      totalSlots: this.slots.length,
      availableSlots: availableSlots.length,
      bookedSlots,
      averageAiRating: Math.round(this.slots.reduce((sum, slot) => sum + slot.aiRating, 0) / this.slots.length),
      averageCost: Math.round(this.slots.reduce((sum, slot) => sum + slot.cost, 0) / this.slots.length),
      topWarehouses,
      slotsByType: {
        FBS: this.slots.filter(slot => slot.warehouseType === 'FBS').length,
        FBO: this.slots.filter(slot => slot.warehouseType === 'FBO').length,
      },
      slotsByPriority: {
        low: this.slots.filter(slot => slot.priority === 'low').length,
        medium: this.slots.filter(slot => slot.priority === 'medium').length,
        high: this.slots.filter(slot => slot.priority === 'high').length,
        critical: this.slots.filter(slot => slot.priority === 'critical').length,
      },
      recentActivity: [
        { type: 'slot_found', timestamp: new Date().toISOString(), description: 'Найден новый слот в Твери' },
        { type: 'slot_booked', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Забронирован слот в Подольске' },
        { type: 'slot_cancelled', timestamp: new Date(Date.now() - 7200000).toISOString(), description: 'Отменено бронирование в Казани' },
      ],
    };
  }

  // Бронирование слота
  public async bookSlot(slotId: string, productIds: string[], quantity: number, autoBooked = false): Promise<SlotBooking> {
    const slot = this.slots.find(s => s.id === slotId);
    if (!slot) {
      throw new Error('Слот не найден');
    }

    if (!slot.isAvailable || slot.availableCapacity < quantity) {
      throw new Error('Недостаточно свободных мест в слоте');
    }

    const booking: SlotBooking = {
      id: `booking_${Date.now()}`,
      slotId,
      userId: 'current_user',
      productIds,
      quantity,
      status: 'pending',
      bookingTime: new Date().toISOString(),
      autoBooked,
      priority: slot.priority === 'critical' ? 1 : slot.priority === 'high' ? 2 : 3,
      estimatedCost: slot.cost * quantity,
    };

    this.bookings.push(booking);

    // Обновляем доступность слота
    slot.availableCapacity -= quantity;
    if (slot.availableCapacity <= 0) {
      slot.isAvailable = false;
    }

    return booking;
  }

  // Получение алертов
  public async getAlerts(): Promise<SlotAlert[]> {
    return this.alerts.filter(alert => !alert.isRead);
  }

  // Отметка алерта как прочитанного
  public async markAlertAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  // Генерация моковых алертов
  private generateMockAlerts(): void {
    this.alerts = [
      {
        id: 'alert_1',
        slotId: 'slot_1',
        userId: 'current_user',
        type: 'new_slot',
        title: '🚀 Новый слот в Твери!',
        message: 'Найден оптимальный слот для доставки на завтра 14:00-16:00. AI-рейтинг: 95%',
        priority: 'high',
        isRead: false,
        actionRequired: true,
        actionUrl: '/slots/slot_1',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      {
        id: 'alert_2',
        slotId: 'slot_5',
        userId: 'current_user',
        type: 'price_drop',
        title: '💰 Снижение стоимости',
        message: 'Стоимость слота в Подольске снизилась на 20%. Рекомендуем забронировать.',
        priority: 'medium',
        isRead: false,
        actionRequired: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
  }

  // AI предсказания (мок)
  public async getAIPrediction(slotId: string): Promise<AISlotPrediction> {
    return {
      slotId,
      predictedOptimalBookingTime: new Date(Date.now() + 1800000).toISOString(),
      confidenceScore: 0.85,
      reasoning: [
        'Исторически этот склад освобождает дополнительные места через 30 минут',
        'Низкая конкуренция в данном временном слоте',
        'Оптимальное соотношение цена/качество'
      ],
      alternativeSlots: ['slot_2', 'slot_3'],
      riskFactors: ['Возможно повышение цены в пиковые часы'],
      expectedDemand: 'medium',
      priceVolatility: 'stable',
      recommendations: [
        'Рекомендуем забронировать в течение 30 минут',
        'Подготовьте товары к отправке заранее'
      ],
    };
  }
}

export const slotService = SlotService.getInstance();
