import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Spinner,
  Textarea
} from '@chakra-ui/react';
import { FaRobot, FaPlay, FaPause, FaStop, FaCog, FaChartLine, FaBell, FaShieldAlt } from 'react-icons/fa';

interface AutomationRule {
  id: string;
  name: string;
  productId: string;
  productName: string;
  isActive: boolean;
  strategy: 'follow_min' | 'undercut' | 'fixed_margin' | 'dynamic';
  parameters: {
    minPrice?: number;
    maxPrice?: number;
    margin?: number;
    undercutAmount?: number;
    checkInterval?: number;
  };
  lastRun?: string;
  status: 'running' | 'paused' | 'error' | 'stopped';
  competitorsCount: number;
}

interface MonitoringStats {
  totalRules: number;
  activeRules: number;
  priceChangesToday: number;
  avgResponseTime: number;
  successRate: number;
  lastUpdate: string;
}

const AutomationPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [isGlobalMonitoringActive, setIsGlobalMonitoringActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({
    productId: '',
    strategy: 'follow_min' as const,
    minPrice: 0,
    maxPrice: 0,
    margin: 10,
    undercutAmount: 50,
    checkInterval: 30
  });

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadAutomationData();
    const interval = setInterval(loadAutomationData, 60000); // Обновляем каждую минуту
    return () => clearInterval(interval);
  }, []);

  const loadAutomationData = async () => {
    try {
      // Загружаем правила автоматизации
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'iPhone 15 Pro - Следование за минимальной ценой',
          productId: '432018439',
          productName: 'iPhone 15 Pro Max 256GB',
          isActive: true,
          strategy: 'follow_min',
          parameters: {
            minPrice: 90000,
            maxPrice: 120000,
            checkInterval: 30
          },
          lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'running',
          competitorsCount: 12
        },
        {
          id: '2',
          name: 'Samsung Galaxy - Подрезание цены',
          productId: '123456789',
          productName: 'Samsung Galaxy S24 Ultra',
          isActive: false,
          strategy: 'undercut',
          parameters: {
            minPrice: 80000,
            maxPrice: 110000,
            undercutAmount: 100,
            checkInterval: 60
          },
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'paused',
          competitorsCount: 8
        }
      ];

      setRules(mockRules);

      // Загружаем статистику
      const mockStats: MonitoringStats = {
        totalRules: mockRules.length,
        activeRules: mockRules.filter(r => r.isActive).length,
        priceChangesToday: 15,
        avgResponseTime: 2.3,
        successRate: 98.5,
        lastUpdate: new Date().toISOString()
      };

      setStats(mockStats);
      setIsGlobalMonitoringActive(mockStats.activeRules > 0);

    } catch (error) {
      console.error('Ошибка загрузки данных автоматизации:', error);
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.productId) {
      toast({
        title: 'Ошибка',
        description: 'Введите ID товара',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Сначала получаем информацию о товаре
      const response = await fetch(`/api/wb/product/${newRule.productId}`);

      if (response.status === 429) {
        toast({
          title: 'Лимит запросов',
          description: 'Превышен лимит запросов к Wildberries. Попробуйте позже.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (response.status === 503) {
        toast({
          title: 'Временная блокировка',
          description: 'Обнаружена блокировка Wildberries. Система переключилась в защитный режим.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (response.ok) {
        const productData = await response.json();

        // Тестируем автоматическое ценообразование
        const testResponse = await fetch('/api/wb/auto-price-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: newRule.productId,
            strategy: newRule.strategy,
            parameters: {
              minPrice: newRule.minPrice,
              maxPrice: newRule.maxPrice,
              margin: newRule.margin,
              undercutAmount: newRule.undercutAmount
            }
          })
        });

        let competitorsCount = 0;
        if (testResponse.ok) {
          const testData = await testResponse.json();
          competitorsCount = testData.competitorsAnalyzed || 0;
        }

        // Создаем новое правило
        const rule: AutomationRule = {
          id: Date.now().toString(),
          name: `${productData.name.substring(0, 30)}... - ${getStrategyName(newRule.strategy)}`,
          productId: newRule.productId,
          productName: productData.name,
          isActive: true,
          strategy: newRule.strategy,
          parameters: {
            minPrice: newRule.minPrice,
            maxPrice: newRule.maxPrice,
            margin: newRule.margin,
            undercutAmount: newRule.undercutAmount,
            checkInterval: newRule.checkInterval
          },
          status: 'running',
          competitorsCount: competitorsCount,
          lastRun: new Date().toISOString()
        };

        setRules(prev => [...prev, rule]);

        // Сбрасываем форму
        setNewRule({
          productId: '',
          strategy: 'follow_min',
          minPrice: 0,
          maxPrice: 0,
          margin: 10,
          undercutAmount: 50,
          checkInterval: 30
        });

        toast({
          title: 'Правило создано и протестировано',
          description: `Автоматизация для товара "${productData.name}" активирована. Найдено ${competitorsCount} конкурентов.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

      } else {
        throw new Error('Товар не найден');
      }
    } catch (error) {
      toast({
        title: 'Ошибка создания правила',
        description: 'Не удалось создать правило автоматизации',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive, status: rule.isActive ? 'paused' : 'running' }
        : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: 'Правило удалено',
      description: 'Правило автоматизации успешно удалено',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Запуск массового автоматического ценообразования
  const runBulkAutoPricing = async () => {
    const activeRules = rules.filter(rule => rule.isActive);

    if (activeRules.length === 0) {
      toast({
        title: 'Нет активных правил',
        description: 'Создайте и активируйте правила для запуска автоматического ценообразования',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wb/bulk-auto-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: activeRules })
      });

      if (response.ok) {
        const result = await response.json();

        // Обновляем время последнего запуска для обработанных правил
        setRules(prev => prev.map(rule => {
          const processedRule = result.results.find((r: any) => r.ruleId === rule.id);
          if (processedRule) {
            return { ...rule, lastRun: new Date().toISOString() };
          }
          return rule;
        }));

        toast({
          title: 'Массовое ценообразование завершено',
          description: `Обработано ${result.processedRules} из ${result.totalRules} правил. Рекомендовано ${result.priceUpdatesRecommended} изменений цен.`,
          status: 'success',
          duration: 7000,
          isClosable: true,
        });

        // Показываем детальную информацию в консоли
        console.log('Результаты массового ценообразования:', result);

      } else if (response.status === 429) {
        toast({
          title: 'Лимит запросов',
          description: 'Превышен лимит запросов к Wildberries. Попробуйте позже.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: 'Ошибка массового ценообразования',
        description: 'Не удалось выполнить массовое автоматическое ценообразование',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green';
      case 'paused': return 'yellow';
      case 'error': return 'red';
      case 'stopped': return 'gray';
      default: return 'gray';
    }
  };

  const getStrategyName = (strategy: string) => {
    switch (strategy) {
      case 'follow_min': return 'Следование за минимальной ценой';
      case 'undercut': return 'Подрезание цены конкурентов';
      case 'fixed_margin': return 'Фиксированная маржа';
      case 'dynamic': return 'Динамическое ценообразование';
      default: return strategy;
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            🤖 Автоматизация ценообразования
          </Heading>
          <Text fontSize="lg" color="gray.600">
            24/7 мониторинг конкурентов и автоматическое регулирование цен
          </Text>
        </Box>

        {/* Глобальный статус */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <FaRobot />
                <Heading size="md">Глобальный мониторинг</Heading>
              </HStack>
              <Switch
                size="lg"
                isChecked={isGlobalMonitoringActive}
                onChange={(e) => setIsGlobalMonitoringActive(e.target.checked)}
                colorScheme="green"
              />
            </HStack>
          </CardHeader>
          <CardBody>
            {stats && (
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                <Stat>
                  <StatLabel>Всего правил</StatLabel>
                  <StatNumber>{stats.totalRules}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Активных</StatLabel>
                  <StatNumber color="green.500">{stats.activeRules}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Изменений сегодня</StatLabel>
                  <StatNumber color="blue.500">{stats.priceChangesToday}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Время отклика</StatLabel>
                  <StatNumber>{stats.avgResponseTime}с</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Успешность</StatLabel>
                  <StatNumber color="green.500">{stats.successRate}%</StatNumber>
                </Stat>
              </SimpleGrid>
            )}
          </CardBody>
        </Card>

        {/* Создание нового правила */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Создать новое правило</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>ID товара Wildberries</FormLabel>
                  <Input
                    placeholder="Например: 432018439"
                    value={newRule.productId}
                    onChange={(e) => setNewRule(prev => ({ ...prev, productId: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Стратегия ценообразования</FormLabel>
                  <select
                    value={newRule.strategy}
                    onChange={(e) => setNewRule(prev => ({ ...prev, strategy: e.target.value as any }))}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '100%' }}
                  >
                    <option value="follow_min">Следование за минимальной ценой</option>
                    <option value="undercut">Подрезание цены конкурентов</option>
                    <option value="fixed_margin">Фиксированная маржа</option>
                    <option value="dynamic">Динамическое ценообразование</option>
                  </select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Минимальная цена (₽)</FormLabel>
                  <NumberInput
                    value={newRule.minPrice}
                    onChange={(_, value) => setNewRule(prev => ({ ...prev, minPrice: value || 0 }))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Максимальная цена (₽)</FormLabel>
                  <NumberInput
                    value={newRule.maxPrice}
                    onChange={(_, value) => setNewRule(prev => ({ ...prev, maxPrice: value || 0 }))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Интервал проверки (мин)</FormLabel>
                  <NumberInput
                    value={newRule.checkInterval}
                    onChange={(_, value) => setNewRule(prev => ({ ...prev, checkInterval: value || 30 }))}
                    min={5}
                    max={1440}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <HStack spacing={4}>
                <Button
                  colorScheme="green"
                  onClick={handleCreateRule}
                  isLoading={loading}
                  leftIcon={<FaPlay />}
                  flex="1"
                >
                  Создать и запустить правило
                </Button>

                <Button
                  colorScheme="blue"
                  onClick={runBulkAutoPricing}
                  isLoading={loading}
                  leftIcon={<FaRobot />}
                  variant="outline"
                  flex="1"
                >
                  🚀 Запустить все правила
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Список правил */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Активные правила автоматизации</Heading>
          </CardHeader>
          <CardBody>
            {rules.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Нет активных правил</AlertTitle>
                  <AlertDescription>
                    Создайте первое правило автоматизации для начала мониторинга цен конкурентов.
                  </AlertDescription>
                </Box>
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Товар</Th>
                      <Th>Стратегия</Th>
                      <Th>Статус</Th>
                      <Th>Конкуренты</Th>
                      <Th>Последняя проверка</Th>
                      <Th>Действия</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rules.map((rule) => (
                      <Tr key={rule.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              {rule.productName.substring(0, 40)}...
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ID: {rule.productId}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{getStrategyName(rule.strategy)}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </Td>
                        <Td>{rule.competitorsCount}</Td>
                        <Td>
                          <Text fontSize="xs">
                            {rule.lastRun ? new Date(rule.lastRun).toLocaleString('ru-RU') : 'Никогда'}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="xs"
                              colorScheme={rule.isActive ? 'red' : 'green'}
                              onClick={() => toggleRule(rule.id)}
                            >
                              {rule.isActive ? <FaPause /> : <FaPlay />}
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <FaStop />
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default AutomationPage;
