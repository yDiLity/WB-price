import { useState, useEffect } from 'react';

// Типы данных
interface Slot {
  id: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'crossdocking' | 'direct';
  available: boolean;
}

interface Warehouse {
  id: string;
  name: string;
  region: string;
}

// Временные данные для демонстрации
const mockWarehouses: Warehouse[] = [
  { id: '1', name: 'Хоругвино', region: 'Москва' },
  { id: '2', name: 'Софьино', region: 'Москва' },
  { id: '3', name: 'Санкт-Петербург', region: 'Санкт-Петербург' },
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
      type: i % 2 === 0 ? 'crossdocking' : 'direct',
      available: Math.random() > 0.3, // 70% слотов доступны
    });
  }
  
  return slots;
};

export default function SlotDashboard() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Загрузка данных
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // В реальном приложении здесь будет запрос к API
        const mockSlots = generateMockSlots();
        setSlots(mockSlots);
        setFilteredSlots(mockSlots);
      } catch (error) {
        console.error('Ошибка при получении слотов:', error);
        setError('Не удалось загрузить слоты. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSlots();
  }, []);
  
  // Применение фильтров
  useEffect(() => {
    let result = [...slots];
    
    if (selectedWarehouses.length > 0) {
      result = result.filter(slot => selectedWarehouses.includes(slot.warehouseId));
    }
    
    if (selectedTypes.length > 0) {
      result = result.filter(slot => selectedTypes.includes(slot.type));
    }
    
    if (startDate) {
      result = result.filter(slot => slot.date >= startDate);
    }
    
    if (endDate) {
      result = result.filter(slot => slot.date <= endDate);
    }
    
    setFilteredSlots(result);
  }, [slots, selectedWarehouses, selectedTypes, startDate, endDate]);
  
  // Обработчики изменения фильтров
  const handleWarehouseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const warehouseId = e.target.value;
    setSelectedWarehouses(prev => 
      e.target.checked
        ? [...prev, warehouseId]
        : prev.filter(id => id !== warehouseId)
    );
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value;
    setSelectedTypes(prev => 
      e.target.checked
        ? [...prev, type]
        : prev.filter(t => t !== type)
    );
  };
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  // Обработчик бронирования слота
  const handleBookSlot = (slotId: string) => {
    setSlots(prev => 
      prev.map(slot => 
        slot.id === slotId ? { ...slot, available: false } : slot
      )
    );
    
    // В реальном приложении здесь будет запрос к API для бронирования
    alert(`Слот ${slotId} успешно забронирован!`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Поиск слотов</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Фильтры */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Склады</h3>
              <div className="space-y-2">
                {mockWarehouses.map(warehouse => (
                  <div key={warehouse.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`warehouse-${warehouse.id}`}
                      value={warehouse.id}
                      checked={selectedWarehouses.includes(warehouse.id)}
                      onChange={handleWarehouseChange}
                      className="mr-2"
                    />
                    <label htmlFor={`warehouse-${warehouse.id}`}>
                      {warehouse.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Тип поставки</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="type-crossdocking"
                    value="crossdocking"
                    checked={selectedTypes.includes('crossdocking')}
                    onChange={handleTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="type-crossdocking">Кроссдокинг</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="type-direct"
                    value="direct"
                    checked={selectedTypes.includes('direct')}
                    onChange={handleTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="type-direct">Прямая поставка</label>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Период</h3>
              <div className="space-y-2">
                <div>
                  <label htmlFor="start-date" className="block text-sm mb-1">С</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm mb-1">По</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
            
            <button
              className="btn btn-secondary w-full"
              onClick={() => {
                setSelectedWarehouses([]);
                setSelectedTypes([]);
                setStartDate('');
                setEndDate('');
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
        
        {/* Список слотов */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isLoading ? 'Загрузка слотов...' : `Найдено слотов: ${filteredSlots.length}`}
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setSlots(generateMockSlots());
                  setIsLoading(false);
                }, 1000);
              }}
            >
              Обновить
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p className="font-bold">Ошибка</p>
              <p>{error}</p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
              <p className="font-bold">Нет доступных слотов</p>
              <p>По вашему запросу не найдено доступных слотов. Попробуйте изменить параметры фильтрации или проверить позже.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSlots.map(slot => (
                <div key={slot.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{slot.warehouseName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      slot.type === 'crossdocking' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {slot.type === 'crossdocking' ? 'Кроссдокинг' : 'Прямая поставка'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{formatDate(slot.date)}</p>
                  <p className="text-gray-600 mb-3">Время: {slot.startTime} - {slot.endTime}</p>
                  {slot.available ? (
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => handleBookSlot(slot.id)}
                    >
                      Забронировать
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Недоступен
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
