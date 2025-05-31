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
  Progress,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FaTruck,
  FaWarehouse,
  FaBell,
  FaRocket,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaCog,
  FaPlay,
  FaPause,
} from 'react-icons/fa';

// Интерфейсы для слотов
interface DeliverySlot {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseRegion: string;
  date: string;
  timeSlot: string;
  type: 'FBS' | 'FBO' | 'Crossdocking';
  available: boolean;
  capacity: number;
  used: number;
  price: number;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

interface SlotStats {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  monitoringActive: boolean;
  lastUpdate: Date;
  avgResponseTime: number;
}

const SlotFinderDashboard: React.FC = () => {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [stats, setStats] = useState<SlotStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoBooking, setAutoBooking] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const toast = useToast();

  // Возвращаемся к useColorModeValue с правильными цветами
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.600');
  const successBg = useColorModeValue('green.50', 'green.900');
  const warningBg = useColorModeValue('orange.50', 'orange.900');

  // Загрузка данных при монтировании
  useEffect(() => {
    loadSlotData();
    // Запускаем мониторинг каждые 5 минут
    const interval = setInterval(() => {
      if (isMonitoring) {
        loadSlotData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Загрузка данных о слотах
  const loadSlotData = async () => {
    setIsLoading(true);
    try {
      // Моковые данные для демонстрации
      const mockSlots: DeliverySlot[] = [
        {
          id: 'slot-1',
          warehouseId: 'wh-1',
          warehouseName: 'Хоругвино',
          warehouseRegion: 'Московская область',
          date: '2025-02-15',
          timeSlot: '10:00-12:00',
          type: 'FBS',
          available: true,
          capacity: 100,
          used: 75,
          price: 150,
          priority: 'high',
          lastUpdated: new Date()
        },
        {
          id: 'slot-2',
          warehouseId: 'wh-2',
          warehouseName: 'Софьино',
          warehouseRegion: 'Московская область',
          date: '2025-02-16',
          timeSlot: '14:00-16:00',
          type: 'FBO',
          available: true,
          capacity: 80,
          used: 45,
          price: 200,
          priority: 'medium',
          lastUpdated: new Date()
        },
        {
          id: 'slot-3',
          warehouseId: 'wh-3',
          warehouseName: 'Санкт-Петербург',
          warehouseRegion: 'Ленинградская область',
          date: '2025-02-17',
          timeSlot: '08:00-10:00',
          type: 'Crossdocking',
          available: false,
          capacity: 120,
          used: 120,
          price: 180,
          priority: 'low',
          lastUpdated: new Date()
        }
      ];

      setSlots(mockSlots);

      // Статистика
      const totalSlots = mockSlots.length;
      const availableSlots = mockSlots.filter(s => s.available).length;
      const bookedSlots = totalSlots - availableSlots;

      setStats({
        totalSlots,
        availableSlots,
        bookedSlots,
        monitoringActive: isMonitoring,
        lastUpdate: new Date(),
        avgResponseTime: 2.3
      });

      // Уведомления о новых слотах
      if (notifications && availableSlots > 0) {
        toast({
          title: 'Найдены свободные слоты!',
          description: `Доступно ${availableSlots} слотов для бронирования`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

    } catch (error) {
      console.error('Error loading slot data:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные о слотах',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Переключение мониторинга
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? 'Мониторинг остановлен' : 'Мониторинг запущен',
      description: isMonitoring
        ? 'Автоматический поиск слотов приостановлен'
        : 'Начат автоматический поиск свободных слотов каждые 5 минут',
      status: isMonitoring ? 'warning' : 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Бронирование слота
  const bookSlot = async (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    toast({
      title: 'Слот забронирован!',
      description: `Слот ${slot.warehouseName} на ${slot.date} ${slot.timeSlot} успешно забронирован`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    // Обновляем статус слота
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, available: false, used: s.capacity } : s
    ));
  };

  // Получение цвета приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Получение цвета типа слота
  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'FBS': return 'blue';
      case 'FBO': return 'purple';
      case 'Crossdocking': return 'teal';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      {/* Заголовок проекта */}
      <VStack align="start" spacing={2} mb={8}>
        <HStack>
          <Icon as={FaTruck} color="blue.500" boxSize={8} />
          <Heading size="xl" color="blue.500">Ozon Slot Finder</Heading>
          <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>BETA</Badge>
        </HStack>
        <Text color={useColorModeValue('gray.500', 'gray.300')} fontSize="lg">
          Автоматический мониторинг и бронирование слотов поставок на склады Ozon
        </Text>
        <Alert status="info" borderRadius="md" maxW="800px">
          <AlertIcon />
          <Box>
            <AlertTitle>Мини-проект внутри Ozon Price Optimizer Pro</AlertTitle>
            <AlertDescription>
              Специализированный сервис для поиска и бронирования слотов поставок с AI-предсказанием и автоматизацией
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>

      {/* Панель управления */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">🎛️ Панель управления</Heading>
            <HStack>
              <Badge colorScheme={isMonitoring ? 'green' : 'gray'}>
                {isMonitoring ? 'Активен' : 'Остановлен'}
              </Badge>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="monitoring" mb="0" mr={4}>
                <HStack>
                  <Icon as={isMonitoring ? FaPlay : FaPause} />
                  <Text>Мониторинг слотов</Text>
                </HStack>
              </FormLabel>
              <Switch
                id="monitoring"
                colorScheme="blue"
                size="lg"
                isChecked={isMonitoring}
                onChange={toggleMonitoring}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="auto-booking" mb="0" mr={4}>
                <HStack>
                  <Icon as={FaRocket} />
                  <Text>Автобронирование</Text>
                </HStack>
              </FormLabel>
              <Switch
                id="auto-booking"
                colorScheme="green"
                size="lg"
                isChecked={autoBooking}
                onChange={(e) => setAutoBooking(e.target.checked)}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="notifications" mb="0" mr={4}>
                <HStack>
                  <Icon as={FaBell} />
                  <Text>Уведомления</Text>
                </HStack>
              </FormLabel>
              <Switch
                id="notifications"
                colorScheme="orange"
                size="lg"
                isChecked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Статистика */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Всего слотов</StatLabel>
                <StatNumber>{stats.totalSlots}</StatNumber>
                <StatHelpText>
                  <Icon as={FaWarehouse} mr={1} />
                  Мониторинг активен
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={successBg} borderWidth="1px" borderColor="green.200">
            <CardBody>
              <Stat>
                <StatLabel>Доступные слоты</StatLabel>
                <StatNumber color="green.500">{stats.availableSlots}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Готовы к бронированию
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={warningBg} borderWidth="1px" borderColor="orange.200">
            <CardBody>
              <Stat>
                <StatLabel>Забронированные</StatLabel>
                <StatNumber color="orange.500">{stats.bookedSlots}</StatNumber>
                <StatHelpText>
                  <Icon as={FaCheckCircle} mr={1} />
                  Недоступны
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Время отклика</StatLabel>
                <StatNumber>{stats.avgResponseTime}с</StatNumber>
                <StatHelpText>
                  <Icon as={FaClock} mr={1} />
                  Среднее время
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default SlotFinderDashboard;
