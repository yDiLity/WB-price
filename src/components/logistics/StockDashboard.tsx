import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaSearch,
  FaSync,
  FaBell,
  FaWarehouse,
  FaTruck,
  FaChartLine,
  FaFilter,
  FaCog,
  FaEye,
  FaEdit,
  FaPlus,
} from 'react-icons/fa';
import logisticsService from '../../services/logisticsService';
import { StockData } from '../../types/logistics';

// Интерфейс для товара с остатками
interface StockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: {
    available: number;
    reserved: number;
    inbound?: number;
    warehouseId?: string;
    warehouseName?: string;
  };
  nextDeliveryDate?: Date;
  salesVelocity?: number; // товаров в день
  daysUntilStockout?: number; // дней до исчерпания запаса
  status: 'normal' | 'low' | 'critical' | 'out_of_stock';
}

// Интерфейс для статистики остатков
interface StockStats {
  totalProducts: number;
  normalStock: number;
  lowStock: number;
  criticalStock: number;
  outOfStock: number;
  totalValue: number;
  averageStockDays: number;
}

const StockDashboard: React.FC = () => {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [criticalStockAlerts, setCriticalStockAlerts] = useState(true);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const headerBg = useColorModeValue('gray.100', 'gray.600');

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadStockData();
  }, []);

  // Загрузка данных об остатках
  const loadStockData = async () => {
    setIsLoading(true);
    try {
      // Генерируем моковые данные для демонстрации
      const mockProducts: StockProduct[] = [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          sku: 'IPH15PRO-256',
          category: 'Смартфоны',
          price: 89990,
          stock: { available: 5, reserved: 2, inbound: 20, warehouseName: 'Хоругвино' },
          nextDeliveryDate: new Date('2025-02-15'),
          salesVelocity: 2.5,
          daysUntilStockout: 2,
          status: 'critical'
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24',
          sku: 'SGS24-128',
          category: 'Смартфоны',
          price: 79990,
          stock: { available: 15, reserved: 5, warehouseName: 'Софьино' },
          salesVelocity: 1.8,
          daysUntilStockout: 8,
          status: 'low'
        },
        {
          id: '3',
          name: 'MacBook Air M3',
          sku: 'MBA-M3-256',
          category: 'Ноутбуки',
          price: 129990,
          stock: { available: 25, reserved: 3, warehouseName: 'Хоругвино' },
          salesVelocity: 0.8,
          daysUntilStockout: 31,
          status: 'normal'
        },
        {
          id: '4',
          name: 'AirPods Pro 2',
          sku: 'APP2-USB',
          category: 'Аксессуары',
          price: 24990,
          stock: { available: 0, reserved: 0, inbound: 50, warehouseName: 'Софьино' },
          nextDeliveryDate: new Date('2025-02-10'),
          salesVelocity: 3.2,
          daysUntilStockout: 0,
          status: 'out_of_stock'
        },
        {
          id: '5',
          name: 'iPad Air 5',
          sku: 'IPA5-256',
          category: 'Планшеты',
          price: 69990,
          stock: { available: 8, reserved: 1, warehouseName: 'Хоругвино' },
          salesVelocity: 1.2,
          daysUntilStockout: 6,
          status: 'low'
        }
      ];

      setProducts(mockProducts);

      // Вычисляем статистику
      const totalProducts = mockProducts.length;
      const normalStock = mockProducts.filter(p => p.status === 'normal').length;
      const lowStock = mockProducts.filter(p => p.status === 'low').length;
      const criticalStock = mockProducts.filter(p => p.status === 'critical').length;
      const outOfStock = mockProducts.filter(p => p.status === 'out_of_stock').length;
      const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock.available), 0);
      const averageStockDays = mockProducts.reduce((sum, p) => sum + (p.daysUntilStockout || 0), 0) / totalProducts;

      setStats({
        totalProducts,
        normalStock,
        lowStock,
        criticalStock,
        outOfStock,
        totalValue,
        averageStockDays
      });

      // Показываем уведомления о критических остатках
      if (criticalStockAlerts) {
        const criticalProducts = mockProducts.filter(p => p.status === 'critical');
        if (criticalProducts.length > 0) {
          toast({
            title: 'Критические остатки!',
            description: `${criticalProducts.length} товаров требуют срочного пополнения`,
            status: 'error',
            duration: 8000,
            isClosable: true,
          });
        }
      }

    } catch (error) {
      console.error('Error loading stock data:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные об остатках',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'low': return 'orange';
      case 'critical': return 'red';
      case 'out_of_stock': return 'gray';
      default: return 'gray';
    }
  };

  // Получение текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Нормальный';
      case 'low': return 'Низкий';
      case 'critical': return 'Критический';
      case 'out_of_stock': return 'Нет в наличии';
      default: return 'Неизвестно';
    }
  };

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Сортировка товаров
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField as keyof StockProduct];
    let bValue: any = b[sortField as keyof StockProduct];
    
    if (sortField === 'available') {
      aValue = a.stock.available;
      bValue = b.stock.available;
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <Box p={6}>
      {/* Заголовок и кнопки управления */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">📦 Управление складскими остатками</Heading>
          <Text color="gray.500">Мониторинг и контроль товарных запасов</Text>
        </VStack>
        
        <HStack spacing={3}>
          <Tooltip label="Настройки уведомлений">
            <Button leftIcon={<FaCog />} variant="outline" size="sm">
              Настройки
            </Button>
          </Tooltip>
          
          <Button 
            leftIcon={<FaSync />} 
            colorScheme="blue" 
            variant="outline"
            isLoading={isLoading}
            onClick={loadStockData}
          >
            Обновить
          </Button>
          
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="green"
          >
            Добавить товар
          </Button>
        </HStack>
      </Flex>
