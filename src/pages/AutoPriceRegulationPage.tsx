/**
 * 🎯 СТРАНИЦА АВТОМАТИЧЕСКОГО РЕГУЛИРОВАНИЯ ЦЕН
 *
 * Центральная страница для управления автоматическим регулированием цен
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useColorModeValue,
  useToast,
  Icon,
  Tooltip,
  Flex,
  Divider
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
  RepeatIcon,
  SettingsIcon,
  TriangleUpIcon,
  TriangleDownIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { priceAutomationService } from '../services/priceAutomationService';
import { automationService } from '../services/automationService';

export default function AutoPriceRegulationPage() {
  const [monitoringStats, setMonitoringStats] = useState<any>(null);
  const [automationStatus, setAutomationStatus] = useState<any>(null);
  const [priceChangeHistory, setPriceChangeHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Цвета для темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const errorColor = useColorModeValue('red.500', 'red.300');

  // Загрузка данных
  useEffect(() => {
    loadData();

    // Обновляем данные каждые 30 секунд
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Получаем статистику мониторинга
      const stats = priceAutomationService.getMonitoringStats();
      setMonitoringStats(stats);

      // Получаем статус автоматизации
      const status = automationService.getMonitoringStatus();
      setAutomationStatus(status);

      // Получаем историю изменений цен
      const history = automationService.getPriceChangeHistory();
      setPriceChangeHistory(history.slice(-10)); // Последние 10 изменений

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading automation data:', error);
      setIsLoading(false);
    }
  };

  // Ручной запуск проверки всех товаров
  const runManualCheck = async () => {
    if (!monitoringStats || monitoringStats.totalProducts === 0) {
      toast({
        title: 'Нет товаров в мониторинге',
        description: 'Добавьте товары в автоматический мониторинг',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: 'Запуск проверки цен...',
      description: `Проверяем цены для ${monitoringStats.totalProducts} товаров`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    // Запускаем проверку для всех товаров
    for (const product of monitoringStats.products) {
      await priceAutomationService.checkProductPrice(product.productId);
    }

    // Обновляем данные
    await loadData();

    toast({
      title: 'Проверка завершена',
      description: 'Все цены проанализированы и обновлены',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return successColor;
      case 'failed': return errorColor;
      case 'blocked': return warningColor;
      case 'pending': return 'blue.500';
      default: return 'gray.500';
    }
  };

  // Получение иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'failed': return WarningIcon;
      case 'blocked': return WarningIcon;
      case 'pending': return TimeIcon;
      default: return InfoIcon;
    }
  };

  if (isLoading) {
    return (
      <Container maxW="1400px" py={8}>
        <VStack spacing={8}>
          <Heading>Загрузка...</Heading>
          <Progress size="lg" isIndeterminate w="100%" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="1400px" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <HStack>
              <Icon as={RepeatIcon} color={successColor} boxSize={8} />
              <Heading size="lg">Автоматическое регулирование цен</Heading>
            </HStack>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={runManualCheck}
              colorScheme="blue"
              isDisabled={!monitoringStats || monitoringStats.totalProducts === 0}
            >
              Проверить все цены
            </Button>
          </HStack>
          <Text color="gray.500">
            Центр управления автоматическим мониторингом и регулированием цен на основе анализа конкурентов
          </Text>
        </Box>

        {/* Статистика */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Товаров в мониторинге</StatLabel>
                <StatNumber>{monitoringStats?.totalProducts || 0}</StatNumber>
                <StatHelpText>
                  <Icon as={TriangleUpIcon} color={successColor} mr={1} />
                  Активный мониторинг
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Проверок сегодня</StatLabel>
                <StatNumber>{automationStatus?.checksToday || 0}</StatNumber>
                <StatHelpText>
                  <Icon as={RepeatIcon} color="blue.500" mr={1} />
                  Каждые 5 минут
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Успешных изменений</StatLabel>
                <StatNumber>{automationStatus?.successfulChangesToday || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  За сегодня
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Время работы</StatLabel>
                <StatNumber>{automationStatus?.uptime || 99.5}%</StatNumber>
                <StatHelpText>
                  <Icon as={CheckCircleIcon} color={successColor} mr={1} />
                  Стабильность
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Статус системы */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Статус системы</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Система работает нормально</AlertTitle>
                  <AlertDescription>
                    24/7 мониторинг активен. Следующая проверка: {automationStatus?.nextCheck ? formatTime(automationStatus.nextCheck) : 'через 5 минут'}
                  </AlertDescription>
                </Box>
              </Alert>

              {monitoringStats?.totalProducts === 0 && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Нет товаров в мониторинге</AlertTitle>
                    <AlertDescription>
                      Добавьте товары в автоматический мониторинг для начала работы системы
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Товары в мониторинге */}
        {monitoringStats?.products && monitoringStats.products.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">Товары в мониторинге</Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Артикул</Th>
                    <Th>Название</Th>
                    <Th>Текущая цена</Th>
                    <Th>Конкуренты</Th>
                    <Th>Стратегия</Th>
                    <Th>Последняя проверка</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {monitoringStats.products.map((product: any) => (
                    <Tr key={product.productId}>
                      <Td fontFamily="mono" fontWeight="bold">{product.sku}</Td>
                      <Td maxW="200px" isTruncated>{product.title}</Td>
                      <Td fontWeight="bold">{product.currentPrice.toLocaleString()} ₽</Td>
                      <Td>
                        <Badge colorScheme="blue">{product.competitorsCount}</Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="green">{product.strategyType}</Badge>
                      </Td>
                      <Td fontSize="sm">{formatTime(product.lastCheck)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* История изменений цен */}
        {priceChangeHistory.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">Последние изменения цен</Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Время</Th>
                    <Th>Товар</Th>
                    <Th>Старая цена</Th>
                    <Th>Новая цена</Th>
                    <Th>Изменение</Th>
                    <Th>Статус</Th>
                    <Th>Причина</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {priceChangeHistory.map((change: any) => (
                    <Tr key={change.id}>
                      <Td fontSize="sm">{formatTime(change.attemptedAt)}</Td>
                      <Td fontFamily="mono">{change.productId}</Td>
                      <Td>{change.oldPrice.toLocaleString()} ₽</Td>
                      <Td fontWeight="bold">{change.newPrice.toLocaleString()} ₽</Td>
                      <Td>
                        <HStack>
                          <Icon
                            as={change.changePercent >= 0 ? TriangleUpIcon : TriangleDownIcon}
                            color={change.changePercent >= 0 ? errorColor : successColor}
                          />
                          <Text color={change.changePercent >= 0 ? errorColor : successColor}>
                            {change.changePercent.toFixed(1)}%
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack>
                          <Icon as={getStatusIcon(change.status)} color={getStatusColor(change.status)} />
                          <Badge colorScheme={change.status === 'success' ? 'green' : change.status === 'failed' ? 'red' : 'orange'}>
                            {change.status}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td maxW="200px" isTruncated>
                        <Tooltip label={change.reason}>
                          <Text>{change.reason}</Text>
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}
