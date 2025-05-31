import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Image,
  Input,
  Select,
  IconButton,
  Tooltip,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  TableContainer,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Editable,
  EditableInput,
  EditablePreview,
  useEditableControls,
  ButtonGroup,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiEye,
  FiSettings,
  FiAlertTriangle,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { useOzonProducts } from '../context/OzonProductContext';
import { Product } from '../types/product';
import { AutoExportSettings } from '../components/excel/AutoExportSettings';

// Интерфейс для строки таблицы отслеживания
interface TrackedProductRow {
  id: string;
  product: Product;
  competitors: {
    id: string;
    name: string;
    price: number;
    priceChange: number;
    priceChangePercent: number;
    lastUpdated: Date;
    status: 'active' | 'inactive' | 'error';
    url?: string;
    linkedAt: Date;
  }[];
  ourPrice: number;
  ourPriceChange: number;
  ourPriceChangePercent: number;
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  avgCompetitorPrice: number;
  pricePosition: 'lowest' | 'middle' | 'highest';
  lastMonitoringUpdate: Date;
  monitoringStatus: 'active' | 'paused' | 'error';
  alertsCount: number;
  strategyName?: string;
  isEditing?: boolean;
  hasUnsavedChanges?: boolean;
}

// Интерфейс для событий изменения данных
interface DataChangeEvent {
  type: 'competitor_linked' | 'price_changed' | 'strategy_applied' | 'monitoring_updated';
  productId: string;
  data: any;
  timestamp: Date;
}

// Интерфейс для Excel-экспорта
interface ExcelRow {
  'ID товара': string;
  'Название товара': string;
  'Категория': string;
  'Наша цена': number;
  'Изменение цены': string;
  'Конкуренты': string;
  'Мин. цена конкурентов': number;
  'Макс. цена конкурентов': number;
  'Средняя цена': number;
  'Позиция': string;
  'Стратегия': string;
  'Статус мониторинга': string;
  'Алерты': number;
  'Последнее обновление': string;
}

// Фильтры для таблицы
interface TableFilters {
  search: string;
  category: string;
  pricePosition: string;
  monitoringStatus: string;
  hasAlerts: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const TrackedProductsPage: React.FC = () => {
  // Хуки
  const { products, isLoading, error, refreshProducts } = useOzonProducts();
  const toast = useToast();

  // Состояния
  const [trackedRows, setTrackedRows] = useState<TrackedProductRow[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    category: '',
    pricePosition: '',
    monitoringStatus: '',
    hasAlerts: false,
    sortBy: 'lastMonitoringUpdate',
    sortOrder: 'desc'
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [changeEvents, setChangeEvents] = useState<DataChangeEvent[]>([]);

  // Цвета для темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Функция для сохранения данных в localStorage
  const saveToLocalStorage = useCallback((data: TrackedProductRow[]) => {
    try {
      localStorage.setItem('tracked_products_data', JSON.stringify(data));
      localStorage.setItem('tracked_products_last_saved', new Date().toISOString());
      setLastSaved(new Date());
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  }, []);

  // Функция для загрузки данных из localStorage
  const loadFromLocalStorage = useCallback((): TrackedProductRow[] | null => {
    try {
      const saved = localStorage.getItem('tracked_products_data');
      if (saved) {
        const data = JSON.parse(saved);
        const lastSavedStr = localStorage.getItem('tracked_products_last_saved');
        if (lastSavedStr) {
          setLastSaved(new Date(lastSavedStr));
        }
        return data;
      }
    } catch (error) {
      console.error('Ошибка загрузки из localStorage:', error);
    }
    return null;
  }, []);

  // Функция для добавления события изменения
  const addChangeEvent = useCallback((event: DataChangeEvent) => {
    setChangeEvents(prev => [event, ...prev.slice(0, 99)]); // Храним последние 100 событий

    // Автосохранение при изменениях
    if (autoSaveEnabled) {
      setTimeout(() => {
        setTrackedRows(current => {
          saveToLocalStorage(current);
          return current;
        });
      }, 1000); // Сохраняем через 1 секунду после изменения
    }
  }, [autoSaveEnabled, saveToLocalStorage]);

  // Функция для обновления данных товара
  const updateProductData = useCallback((productId: string, updates: Partial<TrackedProductRow>) => {
    setTrackedRows(prev => prev.map(row => {
      if (row.id === productId) {
        const updated = { ...row, ...updates, hasUnsavedChanges: true };

        // Добавляем событие изменения
        addChangeEvent({
          type: 'monitoring_updated',
          productId,
          data: updates,
          timestamp: new Date()
        });

        return updated;
      }
      return row;
    }));
  }, [addChangeEvent]);

  // Функция для добавления конкурента
  const addCompetitorToProduct = useCallback((productId: string, competitor: any) => {
    setTrackedRows(prev => prev.map(row => {
      if (row.id === productId) {
        const newCompetitor = {
          id: `comp-${productId}-${Date.now()}`,
          name: competitor.name || competitor.competitorName,
          price: competitor.price || competitor.currentPrice,
          priceChange: 0,
          priceChangePercent: 0,
          lastUpdated: new Date(),
          status: 'active' as const,
          url: competitor.url,
          linkedAt: new Date()
        };

        const updatedCompetitors = [...row.competitors, newCompetitor];
        const competitorPrices = updatedCompetitors.map(c => c.price);
        const minPrice = Math.min(...competitorPrices);
        const maxPrice = Math.max(...competitorPrices);
        const avgPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;

        // Определяем новую позицию цены
        let pricePosition: 'lowest' | 'middle' | 'highest' = 'middle';
        if (row.ourPrice <= minPrice) pricePosition = 'lowest';
        else if (row.ourPrice >= maxPrice) pricePosition = 'highest';

        const updated = {
          ...row,
          competitors: updatedCompetitors,
          minCompetitorPrice: minPrice,
          maxCompetitorPrice: maxPrice,
          avgCompetitorPrice: Math.round(avgPrice),
          pricePosition,
          lastMonitoringUpdate: new Date(),
          hasUnsavedChanges: true
        };

        // Добавляем событие
        addChangeEvent({
          type: 'competitor_linked',
          productId,
          data: { competitor: newCompetitor },
          timestamp: new Date()
        });

        return updated;
      }
      return row;
    }));

    toast({
      title: 'Конкурент добавлен',
      description: `Конкурент "${competitor.name}" успешно привязан к товару`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [addChangeEvent, toast]);

  // Функция для изменения цены товара
  const updateProductPrice = useCallback((productId: string, newPrice: number, reason?: string) => {
    setTrackedRows(prev => prev.map(row => {
      if (row.id === productId) {
        const oldPrice = row.ourPrice;
        const priceChange = newPrice - oldPrice;
        const priceChangePercent = ((newPrice - oldPrice) / oldPrice) * 100;

        // Определяем новую позицию цены
        let pricePosition: 'lowest' | 'middle' | 'highest' = 'middle';
        if (newPrice <= row.minCompetitorPrice) pricePosition = 'lowest';
        else if (newPrice >= row.maxCompetitorPrice) pricePosition = 'highest';

        const updated = {
          ...row,
          ourPrice: newPrice,
          ourPriceChange: priceChange,
          ourPriceChangePercent: priceChangePercent,
          pricePosition,
          lastMonitoringUpdate: new Date(),
          hasUnsavedChanges: true
        };

        // Добавляем событие
        addChangeEvent({
          type: 'price_changed',
          productId,
          data: { oldPrice, newPrice, reason },
          timestamp: new Date()
        });

        return updated;
      }
      return row;
    }));

    toast({
      title: 'Цена обновлена',
      description: `Цена товара изменена на ${newPrice.toLocaleString()} ₽`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [addChangeEvent, toast]);

  // Генерация данных для отслеживания (моковые данные)
  const generateTrackedData = (products: Product[]): TrackedProductRow[] => {
    return products.map(product => {
      // Генерируем конкурентов для каждого товара
      const competitors = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => {
        const basePrice = product.price.current;
        const priceVariation = (Math.random() - 0.5) * 0.3; // ±15%
        const currentPrice = Math.round(basePrice * (1 + priceVariation));
        const oldPrice = Math.round(currentPrice * (1 + (Math.random() - 0.5) * 0.1)); // ±5% изменение

        return {
          id: `comp-${product.id}-${i}`,
          name: `Конкурент ${i + 1}`,
          price: currentPrice,
          priceChange: currentPrice - oldPrice,
          priceChangePercent: ((currentPrice - oldPrice) / oldPrice) * 100,
          lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Последние 24 часа
          status: Math.random() > 0.1 ? 'active' : 'error' as 'active' | 'inactive' | 'error',
          linkedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Последние 7 дней
        };
      });

      const competitorPrices = competitors.map(c => c.price);
      const minPrice = Math.min(...competitorPrices);
      const maxPrice = Math.max(...competitorPrices);
      const avgPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;

      // Определяем позицию нашей цены
      let pricePosition: 'lowest' | 'middle' | 'highest' = 'middle';
      if (product.price.current <= minPrice) pricePosition = 'lowest';
      else if (product.price.current >= maxPrice) pricePosition = 'highest';

      // Генерируем изменение нашей цены
      const ourOldPrice = product.price.old || product.price.current;
      const ourPriceChange = product.price.current - ourOldPrice;
      const ourPriceChangePercent = ((product.price.current - ourOldPrice) / ourOldPrice) * 100;

      return {
        id: product.id,
        product,
        competitors,
        ourPrice: product.price.current,
        ourPriceChange,
        ourPriceChangePercent,
        minCompetitorPrice: minPrice,
        maxCompetitorPrice: maxPrice,
        avgCompetitorPrice: Math.round(avgPrice),
        pricePosition,
        lastMonitoringUpdate: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Последние 2 часа
        monitoringStatus: Math.random() > 0.05 ? 'active' : 'error' as 'active' | 'paused' | 'error',
        alertsCount: Math.floor(Math.random() * 3),
        strategyName: ['Агрессивная', 'Консервативная', 'Сбалансированная'][Math.floor(Math.random() * 3)]
      };
    });
  };





  // Загрузка данных
  useEffect(() => {
    // Сначала пытаемся загрузить сохраненные данные
    const savedData = loadFromLocalStorage();

    if (savedData && savedData.length > 0) {
      setTrackedRows(savedData);
      toast({
        title: 'Данные восстановлены',
        description: 'Загружены сохраненные данные отслеживания',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } else if (products.length > 0) {
      // Если нет сохраненных данных, генерируем новые
      const tracked = generateTrackedData(products);
      setTrackedRows(tracked);
      saveToLocalStorage(tracked);
    }
  }, [products, loadFromLocalStorage, saveToLocalStorage, toast]);

  // Автосохранение при изменениях
  useEffect(() => {
    if (trackedRows.length > 0 && autoSaveEnabled) {
      const hasUnsavedChanges = trackedRows.some(row => row.hasUnsavedChanges);
      if (hasUnsavedChanges) {
        const timeoutId = setTimeout(() => {
          saveToLocalStorage(trackedRows);
          setTrackedRows(prev => prev.map(row => ({ ...row, hasUnsavedChanges: false })));
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [trackedRows, autoSaveEnabled, saveToLocalStorage]);

  // Слушатель событий для синхронизации с другими компонентами
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'competitor_linked' || e.key === 'price_changed') {
        try {
          const eventData = JSON.parse(e.newValue || '{}');

          if (eventData.type === 'competitor_linked') {
            addCompetitorToProduct(eventData.productId, eventData.competitor);
          } else if (eventData.type === 'price_changed') {
            updateProductPrice(eventData.productId, eventData.newPrice, eventData.reason);
          }
        } catch (error) {
          console.error('Ошибка обработки события:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [addCompetitorToProduct, updateProductPrice]);

  // Фильтрация и сортировка данных
  const filteredAndSortedRows = useMemo(() => {
    let filtered = trackedRows.filter(row => {
      const matchesSearch = !filters.search ||
        row.product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        row.competitors.some(c => c.name.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesCategory = !filters.category || row.product.category === filters.category;
      const matchesPricePosition = !filters.pricePosition || row.pricePosition === filters.pricePosition;
      const matchesMonitoringStatus = !filters.monitoringStatus || row.monitoringStatus === filters.monitoringStatus;
      const matchesAlerts = !filters.hasAlerts || row.alertsCount > 0;

      return matchesSearch && matchesCategory && matchesPricePosition && matchesMonitoringStatus && matchesAlerts;
    });

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'productName':
          aValue = a.product.title;
          bValue = b.product.title;
          break;
        case 'ourPrice':
          aValue = a.ourPrice;
          bValue = b.ourPrice;
          break;
        case 'competitorsCount':
          aValue = a.competitors.length;
          bValue = b.competitors.length;
          break;
        case 'pricePosition':
          aValue = a.pricePosition;
          bValue = b.pricePosition;
          break;
        case 'lastMonitoringUpdate':
          aValue = new Date(a.lastMonitoringUpdate).getTime();
          bValue = new Date(b.lastMonitoringUpdate).getTime();
          break;
        default:
          aValue = new Date(a.lastMonitoringUpdate).getTime();
          bValue = new Date(b.lastMonitoringUpdate).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [trackedRows, filters]);

  // Функция экспорта в настоящий Excel
  const exportToExcel = useCallback(async () => {
    try {
      const { excelService } = await import('../services/excelService');

      // Подготавливаем данные для основного листа
      const productsData = filteredAndSortedRows.map(row => ({
        'ID товара': row.product.id,
        'Название товара': row.product.title,
        'Категория': row.product.category,
        'Наша цена': row.ourPrice,
        'Изменение цены': row.ourPriceChange !== 0
          ? `${row.ourPriceChange > 0 ? '+' : ''}${row.ourPriceChange} ₽ (${row.ourPriceChangePercent.toFixed(1)}%)`
          : 'Без изменений',
        'Конкуренты': row.competitors.map(c => `${c.name}: ${c.price} ₽`).join('; '),
        'Мин. цена конкурентов': row.minCompetitorPrice,
        'Макс. цена конкурентов': row.maxCompetitorPrice,
        'Средняя цена': row.avgCompetitorPrice,
        'Позиция': row.pricePosition === 'lowest' ? 'Лучшая' :
                   row.pricePosition === 'highest' ? 'Высокая' : 'Средняя',
        'Стратегия': row.strategyName || 'Не задана',
        'Статус мониторинга': row.monitoringStatus === 'active' ? 'Активен' :
                             row.monitoringStatus === 'paused' ? 'Пауза' : 'Ошибка',
        'Алерты': row.alertsCount,
        'Последнее обновление': new Date(row.lastMonitoringUpdate).toLocaleString('ru-RU')
      }));

      // Подготавливаем данные конкурентов
      const competitorsData = filteredAndSortedRows.flatMap(row =>
        row.competitors.map(competitor => ({
          'ID товара': row.product.id,
          'Название товара': row.product.title,
          'ID конкурента': competitor.id,
          'Название конкурента': competitor.name,
          'Цена конкурента': competitor.price,
          'Изменение цены': competitor.priceChange ?
            `${competitor.priceChange > 0 ? '+' : ''}${competitor.priceChange} ₽` : 'Нет данных',
          'URL конкурента': competitor.url || 'Не указан',
          'Статус': competitor.status === 'active' ? 'Активен' : 'Неактивен',
          'Дата добавления': new Date().toLocaleDateString('ru-RU'),
          'Последнее обновление': new Date().toLocaleString('ru-RU')
        }))
      );

      // Подготавливаем данные изменений цен (пока пустые, можно добавить позже)
      const priceChangesData = [
        {
          'Дата и время': new Date().toLocaleString('ru-RU'),
          'ID товара': 'Пример',
          'Название товара': 'Пример изменения цены',
          'Старая цена': 1000,
          'Новая цена': 950,
          'Изменение': '-50 ₽',
          'Процент изменения': '-5%',
          'Причина': 'Автоматическая корректировка',
          'Источник': 'Система мониторинга'
        }
      ];

      // Создаем Excel файл
      excelService.createExcelFile(
        productsData,
        competitorsData,
        priceChangesData,
        `ozon_tracking_${new Date().toISOString().split('T')[0]}.xlsx`
      );

      toast({
        title: '📊 Excel файл создан!',
        description: `Экспортировано ${productsData.length} товаров с ${competitorsData.length} конкурентами`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Ошибка экспорта в Excel:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать Excel файл',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [filteredAndSortedRows, toast]);

  // Статистика
  const stats = useMemo(() => {
    const total = trackedRows.length;
    const active = trackedRows.filter(r => r.monitoringStatus === 'active').length;
    const withAlerts = trackedRows.filter(r => r.alertsCount > 0).length;
    const lowestPrice = trackedRows.filter(r => r.pricePosition === 'lowest').length;

    return { total, active, withAlerts, lowestPrice };
  }, [trackedRows]);

  // Обработчики
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      toast({
        title: 'Данные обновлены',
        description: 'Информация о товарах и ценах конкурентов обновлена',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка обновления',
        description: 'Не удалось обновить данные',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportToExcel = () => {
    exportToExcel();
  };

  const handleRowSelect = (rowId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows(prev => [...prev, rowId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows(filteredAndSortedRows.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Функция для получения цвета изменения цены
  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'red.500';
    if (change < 0) return 'green.500';
    return 'gray.500';
  };

  // Функция для получения иконки изменения цены
  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <FiTrendingUp />;
    if (change < 0) return <FiTrendingDown />;
    return <FiMinus />;
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text>Загрузка отслеживаемых товаров...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  return (
    <Box p={6}>
      {/* Заголовок и статистика */}
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">📊 Отслеживаемые товары</Heading>
            <Text color="gray.500">
              Мониторинг цен и конкурентов в реальном времени
            </Text>
          </VStack>

          <HStack>
            <VStack align="end" spacing={1}>
              <HStack>
                <Switch
                  isChecked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  size="sm"
                />
                <Text fontSize="sm" color="gray.500">
                  Автосохранение
                </Text>
              </HStack>
              {lastSaved && (
                <Text fontSize="xs" color="gray.400">
                  Сохранено: {lastSaved.toLocaleTimeString()}
                </Text>
              )}
            </VStack>

            <Button
              leftIcon={<FiRefreshCw />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
              colorScheme="blue"
              variant="outline"
            >
              Обновить
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={handleExportToExcel}
              colorScheme="green"
              size="md"
            >
              📊 Скачать Excel
            </Button>
          </HStack>
        </HStack>

        {/* Статистика */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Всего товаров</StatLabel>
            <StatNumber>{stats.total}</StatNumber>
            <StatHelpText>в отслеживании</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Активный мониторинг</StatLabel>
            <StatNumber color="green.500">{stats.active}</StatNumber>
            <StatHelpText>товаров</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>С алертами</StatLabel>
            <StatNumber color="orange.500">{stats.withAlerts}</StatNumber>
            <StatHelpText>требуют внимания</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Лучшая цена</StatLabel>
            <StatNumber color="blue.500">{stats.lowestPrice}</StatNumber>
            <StatHelpText>товаров</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Настройки Excel экспорта */}
        <AutoExportSettings onExportNow={handleExportToExcel} />

        <Divider />

        {/* Фильтры и поиск */}
        <Card>
          <CardHeader pb={2}>
            <HStack>
              <FiFilter />
              <Text fontWeight="semibold">Фильтры и поиск</Text>
            </HStack>
          </CardHeader>
          <CardBody pt={2}>
            <SimpleGrid columns={{ base: 1, md: 3, lg: 6 }} spacing={4}>
              <Input
                placeholder="🔍 Поиск товаров..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />

              <Select
                placeholder="Категория"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="electronics">Электроника</option>
                <option value="clothing">Одежда</option>
                <option value="home">Дом и сад</option>
              </Select>

              <Select
                placeholder="Позиция цены"
                value={filters.pricePosition}
                onChange={(e) => setFilters(prev => ({ ...prev, pricePosition: e.target.value }))}
              >
                <option value="lowest">Самая низкая</option>
                <option value="middle">Средняя</option>
                <option value="highest">Самая высокая</option>
              </Select>

              <Select
                placeholder="Статус мониторинга"
                value={filters.monitoringStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, monitoringStatus: e.target.value }))}
              >
                <option value="active">Активный</option>
                <option value="paused">Приостановлен</option>
                <option value="error">Ошибка</option>
              </Select>

              <Checkbox
                isChecked={filters.hasAlerts}
                onChange={(e) => setFilters(prev => ({ ...prev, hasAlerts: e.target.checked }))}
              >
                Только с алертами
              </Checkbox>

              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
                }}
              >
                <option value="lastMonitoringUpdate-desc">Последнее обновление ↓</option>
                <option value="lastMonitoringUpdate-asc">Последнее обновление ↑</option>
                <option value="productName-asc">Название А-Я</option>
                <option value="productName-desc">Название Я-А</option>
                <option value="ourPrice-asc">Цена ↑</option>
                <option value="ourPrice-desc">Цена ↓</option>
                <option value="competitorsCount-desc">Больше конкурентов</option>
              </Select>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Основная таблица */}
        <Card>
          <CardBody p={0}>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>
                      <Checkbox
                        isChecked={selectedRows.length === filteredAndSortedRows.length && filteredAndSortedRows.length > 0}
                        isIndeterminate={selectedRows.length > 0 && selectedRows.length < filteredAndSortedRows.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </Th>
                    <Th>Товар</Th>
                    <Th>Наша цена</Th>
                    <Th>Конкуренты</Th>
                    <Th>Мин/Макс/Сред</Th>
                    <Th>Позиция</Th>
                    <Th>Стратегия</Th>
                    <Th>Статус</Th>
                    <Th>Алерты</Th>
                    <Th>Обновлено</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredAndSortedRows.map((row) => (
                    <Tr key={row.id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <Checkbox
                          isChecked={selectedRows.includes(row.id)}
                          onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                        />
                      </Td>

                      {/* Товар */}
                      <Td>
                        <HStack>
                          <Image
                            src={row.product.imageUrl || '/images/placeholders/product.jpg'}
                            alt={row.product.title}
                            boxSize="40px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                              {row.product.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {row.product.category}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>

                      {/* Наша цена */}
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">
                            {row.ourPrice.toLocaleString()} ₽
                          </Text>
                          {row.ourPriceChange !== 0 && (
                            <HStack spacing={1}>
                              <Box color={getPriceChangeColor(row.ourPriceChange)}>
                                {getPriceChangeIcon(row.ourPriceChange)}
                              </Box>
                              <Text fontSize="xs" color={getPriceChangeColor(row.ourPriceChange)}>
                                {row.ourPriceChange > 0 ? '+' : ''}{row.ourPriceChange.toLocaleString()} ₽
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Td>

                      {/* Конкуренты */}
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {row.competitors.length} конкурентов
                          </Text>
                          <HStack spacing={1}>
                            {row.competitors.slice(0, 3).map((comp, i) => (
                              <Tooltip key={i} label={`${comp.name}: ${comp.price.toLocaleString()} ₽`}>
                                <Badge
                                  size="sm"
                                  colorScheme={comp.status === 'active' ? 'green' : 'red'}
                                >
                                  {comp.price.toLocaleString()}
                                </Badge>
                              </Tooltip>
                            ))}
                            {row.competitors.length > 3 && (
                              <Text fontSize="xs" color="gray.500">
                                +{row.competitors.length - 3}
                              </Text>
                            )}
                          </HStack>
                        </VStack>
                      </Td>

                      {/* Мин/Макс/Средняя цена */}
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="green.500">
                            Мин: {row.minCompetitorPrice.toLocaleString()} ₽
                          </Text>
                          <Text fontSize="xs" color="red.500">
                            Макс: {row.maxCompetitorPrice.toLocaleString()} ₽
                          </Text>
                          <Text fontSize="xs" color="blue.500">
                            Сред: {row.avgCompetitorPrice.toLocaleString()} ₽
                          </Text>
                        </VStack>
                      </Td>

                      {/* Позиция цены */}
                      <Td>
                        <Badge
                          colorScheme={
                            row.pricePosition === 'lowest' ? 'green' :
                            row.pricePosition === 'highest' ? 'red' : 'yellow'
                          }
                        >
                          {row.pricePosition === 'lowest' ? 'Лучшая' :
                           row.pricePosition === 'highest' ? 'Высокая' : 'Средняя'}
                        </Badge>
                      </Td>

                      {/* Стратегия */}
                      <Td>
                        <Text fontSize="sm">{row.strategyName || 'Не задана'}</Text>
                      </Td>

                      {/* Статус мониторинга */}
                      <Td>
                        <Badge
                          colorScheme={
                            row.monitoringStatus === 'active' ? 'green' :
                            row.monitoringStatus === 'paused' ? 'yellow' : 'red'
                          }
                        >
                          {row.monitoringStatus === 'active' ? 'Активен' :
                           row.monitoringStatus === 'paused' ? 'Пауза' : 'Ошибка'}
                        </Badge>
                      </Td>

                      {/* Алерты */}
                      <Td>
                        {row.alertsCount > 0 ? (
                          <Badge colorScheme="orange">
                            {row.alertsCount}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.500">—</Text>
                        )}
                      </Td>

                      {/* Время обновления */}
                      <Td>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(row.lastMonitoringUpdate).toLocaleTimeString()}
                        </Text>
                      </Td>

                      {/* Действия */}
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="Просмотр деталей">
                            <IconButton
                              aria-label="Просмотр"
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                            />
                          </Tooltip>
                          <Tooltip label="Настройки мониторинга">
                            <IconButton
                              aria-label="Настройки"
                              icon={<FiSettings />}
                              size="sm"
                              variant="ghost"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {filteredAndSortedRows.length === 0 && (
              <Flex justify="center" py={10}>
                <VStack>
                  <Text color="gray.500">Нет товаров для отображения</Text>
                  <Text fontSize="sm" color="gray.400">
                    Попробуйте изменить фильтры или добавить товары в отслеживание
                  </Text>
                </VStack>
              </Flex>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default TrackedProductsPage;
