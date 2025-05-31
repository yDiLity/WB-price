import { createContext, useContext, useState, ReactNode } from 'react';
import { Slot, SlotFilters, SlotType, Warehouse } from '../types';

// Временные данные для демонстрации (до интеграции с API)
const mockWarehouses: Warehouse[] = [
  { id: '1', name: 'Хоругвино', address: 'Московская область, Солнечногорский район', region: 'Москва' },
  { id: '2', name: 'Софьино', address: 'Московская область, Раменский район', region: 'Москва' },
  { id: '3', name: 'Санкт-Петербург', address: 'Ленинградская область, Пушкинский район', region: 'Санкт-Петербург' },
];

// Генерация тестовых слотов
const generateMockSlots = (): Slot[] => {
  const slots: Slot[] = [];
  const today = new Date();
  
  for (let i = 0; i < 20; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + Math.floor(i / 4));
    
    const warehouseIndex = i % mockWarehouses.length;
    const warehouse = mockWarehouses[warehouseIndex];
    
    const startHour = 8 + (i % 8);
    const endHour = startHour + 2;
    
    slots.push({
      id: `slot-${i}`,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      date: date.toISOString().split('T')[0],
      startTime: `${startHour}:00`,
      endTime: `${endHour}:00`,
      type: i % 2 === 0 ? SlotType.CROSSDOCKING : SlotType.DIRECT,
      available: Math.random() > 0.3, // 70% слотов доступны
    });
  }
  
  return slots;
};

interface SlotContextType {
  slots: Slot[];
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
  filters: SlotFilters;
  setFilters: (filters: SlotFilters) => void;
  fetchSlots: () => Promise<void>;
  bookSlot: (slotId: string) => Promise<boolean>;
}

const SlotContext = createContext<SlotContextType | undefined>(undefined);

export const SlotProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SlotFilters>({});

  const fetchSlots = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь будет запрос к API
      let mockSlots = generateMockSlots();
      
      // Применяем фильтры
      if (filters.warehouseIds && filters.warehouseIds.length > 0) {
        mockSlots = mockSlots.filter(slot => 
          filters.warehouseIds?.includes(slot.warehouseId)
        );
      }
      
      if (filters.types && filters.types.length > 0) {
        mockSlots = mockSlots.filter(slot => 
          filters.types?.includes(slot.type)
        );
      }
      
      if (filters.startDate) {
        mockSlots = mockSlots.filter(slot => 
          slot.date >= filters.startDate!
        );
      }
      
      if (filters.endDate) {
        mockSlots = mockSlots.filter(slot => 
          slot.date <= filters.endDate!
        );
      }
      
      setSlots(mockSlots);
    } catch (error) {
      console.error('Ошибка при получении слотов:', error);
      setError('Не удалось загрузить слоты. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const bookSlot = async (slotId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь будет запрос к API
      // Обновляем локальное состояние
      setSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === slotId ? { ...slot, available: false } : slot
        )
      );
      
      return true;
    } catch (error) {
      console.error('Ошибка при бронировании слота:', error);
      setError('Не удалось забронировать слот. Пожалуйста, попробуйте позже.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlotContext.Provider
      value={{
        slots,
        warehouses,
        isLoading,
        error,
        filters,
        setFilters,
        fetchSlots,
        bookSlot
      }}
    >
      {children}
    </SlotContext.Provider>
  );
};

export const useSlots = () => {
  const context = useContext(SlotContext);
  if (context === undefined) {
    throw new Error('useSlots must be used within a SlotProvider');
  }
  return context;
};
