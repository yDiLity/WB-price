/**
 * 🎯 ПАНЕЛЬ АВТОМАТИЧЕСКОГО РЕГУЛИРОВАНИЯ ЦЕН
 *
 * Главный компонент для настройки и управления автоматическим регулированием цен
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
  RepeatIcon,
  SettingsIcon,
  TriangleUpIcon,
  TriangleDownIcon
} from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types/product';
import { PricingStrategy } from './StrategySelectionModal';
import { priceAutomationService } from '../../services/priceAutomationService';
import { automationService } from '../../services/automationService';

interface AutoPriceRegulationPanelProps {
  product: Product;
  competitors: CompetitorProduct[];
  strategy: PricingStrategy;
  onConfigureStrategy: () => void;
  onManageCompetitors: () => void;
}

export default function AutoPriceRegulationPanel({
  product,
  competitors,
  strategy,
  onConfigureStrategy,
  onManageCompetitors
}: AutoPriceRegulationPanelProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState<any>(null);
  const [automationSettings, setAutomationSettings] = useState<any>(null);
  const toast = useToast();

  // Цвета для темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  // Загрузка данных при монтировании
  useEffect(() => {
    loadMonitoringData();
  }, [product.id]);

  const loadMonitoringData = () => {
    // Получаем статистику мониторинга
    const stats = priceAutomationService.getMonitoringStats();
    setMonitoringStats(stats);

    // Проверяем включен ли мониторинг для этого товара
    const isProductMonitored = stats.products.some(p => p.productId === product.id);
    setIsMonitoring(isProductMonitored);

    // Получаем настройки автоматизации
    const settings = automationService.getAutomationSettings(product.id);
    setAutomationSettings(settings);
  };

  // Включение/выключение автоматического регулирования
  const toggleAutoRegulation = async () => {
    if (!isMonitoring) {
      // Проверяем что есть конкуренты и стратегия
      if (competitors.length === 0) {
        toast({
          title: 'Нет конкурентов',
          description: 'Сначала добавьте конкурентов для мониторинга цен',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!strategy) {
        toast({
          title: 'Нет стратегии',
          description: 'Сначала выберите стратегию ценообразования',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Включаем мониторинг
      priceAutomationService.addProductToMonitoring(product, competitors, strategy);
      setIsMonitoring(true);

      toast({
        title: 'Автоматическое регулирование включено',
        description: `Товар ${product.sku} добавлен в мониторинг. Цены будут проверяться каждые 5 минут.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

    } else {
      // Выключаем мониторинг
      priceAutomationService.removeProductFromMonitoring(product.id);
      setIsMonitoring(false);

      toast({
        title: 'Автоматическое регулирование выключено',
        description: `Товар ${product.sku} удален из мониторинга`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }

    loadMonitoringData();
  };

  // Ручная проверка цены
  const manualPriceCheck = async () => {
    if (!isMonitoring) {
      toast({
        title: 'Мониторинг выключен',
        description: 'Включите автоматическое регулирование для проверки цен',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: 'Проверка цен...',
      description: 'Выполняется анализ цен конкурентов',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    await priceAutomationService.checkProductPrice(product.id);
    loadMonitoringData();

    toast({
      title: 'Проверка завершена',
      description: 'Цены проанализированы и при необходимости обновлены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Получение минимальной цены конкурента
  const getMinCompetitorPrice = () => {
    if (competitors.length === 0) return null;
    return Math.min(...competitors.map(c => c.price));
  };

  // Расчет разницы с конкурентами
  const getPriceDifference = () => {
    const minPrice = getMinCompetitorPrice();
    if (!minPrice) return null;
    return ((product.price.current - minPrice) / minPrice) * 100;
  };

  const minCompetitorPrice = getMinCompetitorPrice();
  const priceDifference = getPriceDifference();

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Icon as={RepeatIcon} color={isMonitoring ? successColor : 'gray.400'} />
            <Heading size="md">Автоматическое регулирование цен</Heading>
          </HStack>
          <Badge colorScheme={isMonitoring ? 'green' : 'gray'}>
            {isMonitoring ? 'Активно' : 'Выключено'}
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Основные настройки */}
          <Box>
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel htmlFor="auto-regulation" mb="0" fontWeight="medium">
                Включить автоматическое регулирование
              </FormLabel>
              <Switch
                id="auto-regulation"
                isChecked={isMonitoring}
                onChange={toggleAutoRegulation}
                colorScheme="green"
                size="lg"
              />
            </FormControl>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Система будет автоматически отслеживать цены конкурентов и корректировать вашу цену согласно выбранной стратегии
            </Text>
          </Box>

          <Divider />

          {/* Статистика */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Текущая цена</StatLabel>
              <StatNumber>{product.price.current.toLocaleString()} ₽</StatNumber>
              {minCompetitorPrice && (
                <StatHelpText>
                  <StatArrow type={priceDifference! >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(priceDifference!).toFixed(1)}% от мин. конкурента
                </StatHelpText>
              )}
            </Stat>

            <Stat>
              <StatLabel>Конкуренты</StatLabel>
              <StatNumber>{competitors.length}</StatNumber>
              <StatHelpText>
                {minCompetitorPrice ? `Мин: ${minCompetitorPrice.toLocaleString()} ₽` : 'Нет данных'}
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel>Стратегия</StatLabel>
              <StatNumber fontSize="md">{strategy?.name || 'Не выбрана'}</StatNumber>
              <StatHelpText>
                {strategy?.type || 'Настройте стратегию'}
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          <Divider />

          {/* Предупреждения и статус */}
          {!isMonitoring && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Автоматическое регулирование выключено</AlertTitle>
                <AlertDescription>
                  Включите мониторинг для автоматического отслеживания цен конкурентов и корректировки вашей цены
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {isMonitoring && competitors.length === 0 && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Нет конкурентов</AlertTitle>
                <AlertDescription>
                  Добавьте конкурентов для эффективного мониторинга цен
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {isMonitoring && !strategy && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Не выбрана стратегия</AlertTitle>
                <AlertDescription>
                  Настройте стратегию ценообразования для автоматического регулирования
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {isMonitoring && competitors.length > 0 && strategy && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Мониторинг активен</AlertTitle>
                <AlertDescription>
                  Цены проверяются каждые 5 минут. Следующая проверка через {automationSettings?.monitoring24x7 ? '5 минут' : 'неизвестно'}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Кнопки управления */}
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={manualPriceCheck}
              isDisabled={!isMonitoring}
              colorScheme="blue"
              variant="outline"
            >
              Проверить сейчас
            </Button>

            <Button
              leftIcon={<SettingsIcon />}
              onClick={onConfigureStrategy}
              variant="outline"
            >
              Настроить стратегию
            </Button>

            <Button
              leftIcon={<Icon as={TriangleUpIcon} />}
              onClick={onManageCompetitors}
              variant="outline"
            >
              Управление конкурентами
            </Button>
          </HStack>

          {/* Прогресс бар для следующей проверки */}
          {isMonitoring && (
            <Box>
              <Text fontSize="sm" color="gray.500" mb={2}>
                До следующей проверки цен
              </Text>
              <Progress value={60} colorScheme="green" size="sm" borderRadius="md" />
              <Text fontSize="xs" color="gray.400" mt={1}>
                Проверка каждые 5 минут
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
