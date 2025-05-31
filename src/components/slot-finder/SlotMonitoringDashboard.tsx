import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Button,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FiActivity, FiTruck, FiClock, FiTrendingUp, FiAlertTriangle, FiSettings } from 'react-icons/fi';
import { slotService } from '../../services/slotService';
import { SlotStatistics, SlotAlert } from '../../types/slot';

export const SlotMonitoringDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<SlotStatistics | null>(null);
  const [alerts, setAlerts] = useState<SlotAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadData();
    // Симуляция реального времени - обновление каждые 30 секунд
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, alertsData] = await Promise.all([
        slotService.getStatistics(),
        slotService.getAlerts(),
      ]);
      setStatistics(statsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные мониторинга',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? 'Мониторинг остановлен' : 'Мониторинг запущен',
      description: isMonitoring 
        ? 'Автоматический поиск слотов отключен' 
        : 'Система начала поиск оптимальных слотов',
      status: isMonitoring ? 'warning' : 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAlertAction = async (alert: SlotAlert) => {
    await slotService.markAlertAsRead(alert.id);
    setAlerts(alerts.filter(a => a.id !== alert.id));
    
    if (alert.actionUrl) {
      // Здесь можно добавить навигацию к конкретному слоту
      toast({
        title: 'Переход к слоту',
        description: 'Открываем детали слота...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Загрузка данных мониторинга...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок и управление */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">🚚 Мониторинг слотов поставок</Heading>
            <Text color="gray.500">
              Автоматический поиск и бронирование оптимальных слотов доставки
            </Text>
          </VStack>
          <HStack>
            <Button
              leftIcon={<FiSettings />}
              variant="outline"
              size="sm"
            >
              Настройки
            </Button>
            <Button
              leftIcon={<FiActivity />}
              colorScheme={isMonitoring ? 'red' : 'green'}
              onClick={toggleMonitoring}
              size="sm"
            >
              {isMonitoring ? 'Остановить' : 'Запустить'} мониторинг
            </Button>
          </HStack>
        </HStack>

        {/* Статус мониторинга */}
        {isMonitoring && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Мониторинг активен!</AlertTitle>
              <AlertDescription>
                Система автоматически ищет новые слоты каждые 5 минут. 
                Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Алерты */}
        {alerts.length > 0 && (
          <VStack spacing={3} align="stretch">
            <Heading size="md">🚨 Активные уведомления</Heading>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                status={alert.priority === 'critical' ? 'error' : alert.priority === 'high' ? 'warning' : 'info'}
                borderRadius="md"
              >
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Box>
                {alert.actionRequired && (
                  <Button
                    size="sm"
                    colorScheme={alert.priority === 'critical' ? 'red' : 'blue'}
                    onClick={() => handleAlertAction(alert)}
                  >
                    Действие
                  </Button>
                )}
              </Alert>
            ))}
          </VStack>
        )}

        {/* Основная статистика */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Всего слотов</StatLabel>
                <StatNumber>{statistics?.totalSlots || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% за неделю
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Доступно сейчас</StatLabel>
                <StatNumber color="green.500">{statistics?.availableSlots || 0}</StatNumber>
                <StatHelpText>
                  <FiTruck style={{ display: 'inline', marginRight: '4px' }} />
                  Готовы к бронированию
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>AI-рейтинг</StatLabel>
                <StatNumber>{statistics?.averageAiRating || 0}%</StatNumber>
                <StatHelpText>
                  <FiTrendingUp style={{ display: 'inline', marginRight: '4px' }} />
                  Средняя оценка
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Средняя стоимость</StatLabel>
                <StatNumber>{statistics?.averageCost || 0} ₽</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  -5% за день
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Детальная информация */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab>📊 Аналитика</Tab>
            <Tab>🏭 Склады</Tab>
            <Tab>📈 Активность</Tab>
          </TabList>

          <TabPanels>
            {/* Аналитика */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                <Card>
                  <CardHeader>
                    <Heading size="md">Распределение по типам</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text>FBS (Fulfillment by Seller)</Text>
                        <Badge colorScheme="blue">{statistics?.slotsByType.FBS || 0}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>FBO (Fulfillment by Ozon)</Text>
                        <Badge colorScheme="purple">{statistics?.slotsByType.FBO || 0}</Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Приоритеты слотов</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text>Критические</Text>
                        <Badge colorScheme="red">{statistics?.slotsByPriority.critical || 0}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Высокие</Text>
                        <Badge colorScheme="orange">{statistics?.slotsByPriority.high || 0}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Средние</Text>
                        <Badge colorScheme="yellow">{statistics?.slotsByPriority.medium || 0}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Низкие</Text>
                        <Badge colorScheme="green">{statistics?.slotsByPriority.low || 0}</Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Склады */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Топ складов по количеству слотов</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {statistics?.topWarehouses.map((warehouse, index) => (
                      <HStack key={warehouse.id} justify="space-between" p={3} bg={bgColor} borderRadius="md">
                        <HStack>
                          <Badge colorScheme="blue">{index + 1}</Badge>
                          <Text fontWeight="medium">{warehouse.name}</Text>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" color="gray.500">{warehouse.slotsCount} слотов</Text>
                          <Badge colorScheme="green">{warehouse.averageRating}% AI</Badge>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Активность */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Последняя активность</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {statistics?.recentActivity.map((activity, index) => (
                      <HStack key={index} p={3} bg={bgColor} borderRadius="md">
                        <FiClock />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">{activity.description}</Text>
                          <Text fontSize="xs" color="gray.500">
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
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};
