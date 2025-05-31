import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useToast,
  useColorModeValue,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Spinner,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FaTruck,
  FaRocket,
  FaChartLine,
  FaCog,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaGithub,
  FaBook,
  FaBell,
  FaPlay,
  FaStop,
} from 'react-icons/fa';
import { FiActivity, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import SlotFinderDashboard from '../components/slot-finder/SlotFinderDashboard';
import SlotList from '../components/slot-finder/SlotList';
import { slotService } from '../services/slotService';
import { DeliverySlot as NewDeliverySlot, SlotStatistics, SlotAlert } from '../types/slot';

// Интерфейс для слота
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

const SlotFinderPage: React.FC = () => {
  // ВСЕ ХУКИ В НАЧАЛЕ - ИСПРАВЛЯЕМ ПОРЯДОК
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [newSlots, setNewSlots] = useState<NewDeliverySlot[]>([]);
  const [statistics, setStatistics] = useState<SlotStatistics | null>(null);
  const [alerts, setAlerts] = useState<SlotAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoBooking, setAutoBooking] = useState(false);

  const toast = useToast();
  const gradientBg = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.600, purple.700)'
  );

  // Возвращаемся к useColorModeValue с правильными цветами
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Загрузка данных при монтировании
  useEffect(() => {
    loadSlotData();
    loadNewSlotData();
    // Автообновление каждые 30 секунд
    const interval = setInterval(() => {
      if (isMonitoring) {
        loadNewSlotData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Загрузка данных о слотах (старая версия)
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
        },
        {
          id: 'slot-4',
          warehouseId: 'wh-4',
          warehouseName: 'Екатеринбург',
          warehouseRegion: 'Свердловская область',
          date: '2025-02-18',
          timeSlot: '12:00-14:00',
          type: 'FBS',
          available: true,
          capacity: 60,
          used: 30,
          price: 120,
          priority: 'high',
          lastUpdated: new Date()
        },
        {
          id: 'slot-5',
          warehouseId: 'wh-5',
          warehouseName: 'Новосибирск',
          warehouseRegion: 'Новосибирская область',
          date: '2025-02-19',
          timeSlot: '16:00-18:00',
          type: 'FBO',
          available: true,
          capacity: 90,
          used: 60,
          price: 160,
          priority: 'medium',
          lastUpdated: new Date()
        }
      ];

      setSlots(mockSlots);

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

  // Загрузка новых данных через сервис
  const loadNewSlotData = async () => {
    try {
      const [statsData, alertsData, slotsData] = await Promise.all([
        slotService.getStatistics(),
        slotService.getAlerts(),
        slotService.getSlots({
          query: '',
          filters: { onlyAvailable: true },
          sortBy: 'aiRating',
          sortOrder: 'desc',
          page: 1,
          limit: 20,
        }),
      ]);

      setStatistics(statsData);
      setAlerts(alertsData);
      setNewSlots(slotsData.slots);
    } catch (error) {
      console.error('Ошибка загрузки новых данных:', error);
    }
  };

  // Переключение мониторинга
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? 'Мониторинг остановлен' : 'Мониторинг запущен',
      description: isMonitoring
        ? 'Автоматический поиск слотов отключен'
        : 'Система начала поиск оптимальных слотов каждые 5 минут',
      status: isMonitoring ? 'warning' : 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработка алертов
  const handleAlertAction = async (alert: SlotAlert) => {
    await slotService.markAlertAsRead(alert.id);
    setAlerts(alerts.filter(a => a.id !== alert.id));

    toast({
      title: 'Переход к слоту',
      description: 'Открываем детали слота...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Бронирование слота
  const handleBookSlot = (slotId: string) => {
    setSlots(prev => prev.map(slot =>
      slot.id === slotId
        ? { ...slot, available: false, used: slot.capacity }
        : slot
    ));
  };

  // Статистика (старая + новая)
  const availableSlots = slots.filter(s => s.available).length;
  const totalSlots = slots.length;
  const bookedSlots = totalSlots - availableSlots;

  // Новая статистика
  const newAvailableSlots = statistics?.availableSlots || 0;
  const newTotalSlots = statistics?.totalSlots || 0;
  const averageAiRating = statistics?.averageAiRating || 0;
  const averageCost = statistics?.averageCost || 0;

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.800', 'white')}
      minH="100vh"
      w="100%"
    >
      <Container
        maxW="container.xl"
        py={8}
      >
      <VStack spacing={8} align="stretch">
        {/* Заголовок проекта */}
        <Box
          bgGradient={gradientBg}
          borderRadius="xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
        >
          <VStack align="start" spacing={4}>
            <HStack>
              <Icon as={FaTruck} boxSize={10} />
              <VStack align="start" spacing={1}>
                <Heading size="2xl">Ozon Slot Finder</Heading>
                <Badge colorScheme="whiteAlpha" fontSize="md" px={3} py={1}>
                  Мини-проект v1.0 BETA
                </Badge>
              </VStack>
            </HStack>

            <Text fontSize="xl" maxW="600px">
              Автоматический мониторинг и бронирование слотов поставок на склады Ozon
              с AI-предсказанием и интеграцией через API
            </Text>

            <HStack spacing={4} mt={4}>
              <Button
                leftIcon={<FaBook />}
                colorScheme="whiteAlpha"
                variant="outline"
                size="lg"
              >
                Документация
              </Button>
              <Button
                leftIcon={<FaGithub />}
                colorScheme="whiteAlpha"
                variant="outline"
                size="lg"
              >
                GitHub
              </Button>
              <Button
                leftIcon={<FaExternalLinkAlt />}
                colorScheme="whiteAlpha"
                variant="solid"
                size="lg"
              >
                API Docs
              </Button>
            </HStack>
          </VStack>

          {/* Декоративные элементы */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            width="200px"
            height="200px"
            borderRadius="full"
            bg="whiteAlpha.100"
          />
          <Box
            position="absolute"
            bottom="-30px"
            right="100px"
            width="100px"
            height="100px"
            borderRadius="full"
            bg="whiteAlpha.200"
          />
        </Box>

        {/* Панель управления мониторингом */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Icon as={FiActivity} color={isMonitoring ? 'green.500' : 'gray.400'} />
                  <Text fontWeight="semibold">
                    Статус мониторинга: {isMonitoring ? 'Активен' : 'Остановлен'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  {isMonitoring
                    ? `Последнее обновление: ${new Date().toLocaleTimeString('ru-RU')}`
                    : 'Нажмите "Запустить" для начала автоматического поиска слотов'
                  }
                </Text>
              </VStack>

              <HStack spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="auto-booking" mb="0" fontSize="sm">
                    Автобронирование
                  </FormLabel>
                  <Switch
                    id="auto-booking"
                    isChecked={autoBooking}
                    onChange={(e) => setAutoBooking(e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>

                <Button
                  leftIcon={isMonitoring ? <FaStop /> : <FaPlay />}
                  colorScheme={isMonitoring ? 'red' : 'green'}
                  onClick={toggleMonitoring}
                  size="sm"
                >
                  {isMonitoring ? 'Остановить' : 'Запустить'}
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Алерты */}
        {alerts.length > 0 && (
          <VStack spacing={3} align="stretch">
            <HStack>
              <Icon as={FaBell} color="orange.500" />
              <Heading size="md">Активные уведомления ({alerts.length})</Heading>
            </HStack>
            {alerts.slice(0, 3).map((alert) => (
              <Alert
                key={alert.id}
                status={alert.priority === 'critical' ? 'error' : alert.priority === 'high' ? 'warning' : 'info'}
                borderRadius="md"
              >
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize="sm">{alert.title}</AlertTitle>
                  <AlertDescription fontSize="xs">{alert.message}</AlertDescription>
                </Box>
                {alert.actionRequired && (
                  <Button
                    size="xs"
                    colorScheme={alert.priority === 'critical' ? 'red' : 'blue'}
                    onClick={() => handleAlertAction(alert)}
                  >
                    Действие
                  </Button>
                )}
              </Alert>
            ))}
            {alerts.length > 3 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                И еще {alerts.length - 3} уведомлений...
              </Text>
            )}
          </VStack>
        )}

        {/* Расширенная статистика */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Всего слотов</StatLabel>
                <StatNumber color="blue.500">{newTotalSlots || totalSlots}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% за неделю
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Доступно сейчас</StatLabel>
                <StatNumber color="green.500">{newAvailableSlots || availableSlots}</StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} />
                  Готовы к бронированию
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>AI-рейтинг</StatLabel>
                <StatNumber color="purple.500">{averageAiRating}%</StatNumber>
                <StatHelpText>
                  <Icon as={FiActivity} />
                  Средняя оценка
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Средняя стоимость</StatLabel>
                <StatNumber color="orange.500">{averageCost} ₽</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  -5% за день
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Информация о проекте */}
        <Alert status="info" borderRadius="lg" p={6}>
          <AlertIcon boxSize={6} />
          <Box>
            <AlertTitle fontSize="lg" mb={2}>
              🚀 Инновационный подход к логистике
            </AlertTitle>
            <AlertDescription fontSize="md">
              Этот мини-проект демонстрирует современные технологии автоматизации логистики:
              парсинг данных в реальном времени, AI-предсказания, автоматическое бронирование
              и интеграция с API Ozon. Идеально подходит для масштабирования и коммерциализации.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Основной интерфейс */}
        <Tabs
          index={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          colorScheme="blue"
        >
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FaChartLine} />
                <Text>Дашборд</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiActivity} />
                <Text>Мониторинг</Text>
                {isMonitoring && <Badge colorScheme="green" ml={1}>Live</Badge>}
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FaTruck} />
                <Text>Слоты поставок</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FaCog} />
                <Text>Настройки</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={6}>
              <SlotFinderDashboard />
            </TabPanel>

            {/* Новая вкладка мониторинга */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                {/* Статус и управление */}
                <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">🔍 Автоматический мониторинг</Heading>
                      <Badge colorScheme={isMonitoring ? 'green' : 'gray'}>
                        {isMonitoring ? 'Активен' : 'Остановлен'}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Text>
                        Система автоматически сканирует доступные слоты каждые 5 минут и
                        уведомляет о новых возможностях с высоким AI-рейтингом.
                      </Text>

                      {statistics && (
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box p={4} bg="blue.50" borderRadius="md">
                            <Text fontSize="sm" color="blue.600">FBS слотов</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                              {statistics.slotsByType.FBS}
                            </Text>
                          </Box>
                          <Box p={4} bg="purple.50" borderRadius="md">
                            <Text fontSize="sm" color="purple.600">FBO слотов</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="purple.700">
                              {statistics.slotsByType.FBO}
                            </Text>
                          </Box>
                          <Box p={4} bg="green.50" borderRadius="md">
                            <Text fontSize="sm" color="green.600">Высокий приоритет</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="green.700">
                              {statistics.slotsByPriority.high + statistics.slotsByPriority.critical}
                            </Text>
                          </Box>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Топ складов */}
                {statistics?.topWarehouses && (
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">🏭 Топ складов</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {statistics.topWarehouses.slice(0, 5).map((warehouse, index) => (
                          <HStack key={warehouse.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                            <HStack>
                              <Badge colorScheme="blue">{index + 1}</Badge>
                              <Text fontWeight="medium">{warehouse.name}</Text>
                            </HStack>
                            <HStack>
                              <Text fontSize="sm" color="gray.600">{warehouse.slotsCount} слотов</Text>
                              <Badge colorScheme="green">{warehouse.averageRating}% AI</Badge>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Последняя активность */}
                {statistics?.recentActivity && (
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">📈 Последняя активность</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {statistics.recentActivity.map((activity, index) => (
                          <HStack key={index} p={3} bg={useColorModeValue('gray.50', 'gray.600')} borderRadius="md">
                            <Icon as={FiActivity} color="blue.500" />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontSize="sm" fontWeight="medium">{activity.description}</Text>
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.300')}>
                                {new Date(activity.timestamp).toLocaleString('ru-RU')}
                              </Text>
                            </VStack>
                            <Badge
                              colorScheme={
                                activity.type === 'slot_found' ? 'green' :
                                activity.type === 'slot_booked' ? 'blue' : 'red'
                              }
                            >
                              {activity.type === 'slot_found' ? 'Найден' :
                               activity.type === 'slot_booked' ? 'Забронирован' : 'Отменен'}
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0} pt={6}>
              <SlotList
                slots={slots}
                isLoading={isLoading}
                onBookSlot={handleBookSlot}
                onRefresh={loadSlotData}
              />
            </TabPanel>

            <TabPanel p={0} pt={6}>
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">⚙️ Настройки мониторинга</Heading>
                </CardHeader>
                <CardBody>
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>В разработке</AlertTitle>
                      <AlertDescription>
                        Настройки автоматического мониторинга, фильтры складов,
                        интеграция с Telegram-ботом и другие функции будут добавлены в следующих версиях.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
      </Container>
    </Box>
  );
};

export default SlotFinderPage;
