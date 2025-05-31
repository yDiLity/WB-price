import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Tooltip
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaBrain, FaChartLine, FaExclamationTriangle, FaLightbulb, FaShieldAlt } from 'react-icons/fa';
import { banAnalyticsService, BanAnalytics, BanPattern } from '../../services/banAnalyticsService';

export default function BanAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<BanAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.600');

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    try {
      const data = banAnalyticsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = () => {
    banAnalyticsService.cleanup();
    loadAnalytics();
  };

  if (isLoading) {
    return <Text>Загрузка аналитики...</Text>;
  }

  if (!analytics) {
    return <Text>Нет данных для отображения</Text>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <FaBrain color="purple" />
            <Heading size="lg" color="purple.600">
              🧠 Аналитика банов - "Мозг" системы
            </Heading>
            <Badge colorScheme="blue" size="sm">
              AI-Powered
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Интеллектуальный анализ причин блокировок и автоматическое выявление паттернов
          </Text>
        </CardHeader>
      </Card>

      {/* Основная статистика */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={statBg}>
          <StatLabel>Всего банов</StatLabel>
          <StatNumber color="red.500">{analytics.totalBans}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            {analytics.bansToday} сегодня
          </StatHelpText>
        </Stat>

        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={statBg}>
          <StatLabel>Успешность</StatLabel>
          <StatNumber color="green.500">{analytics.successRate.toFixed(1)}%</StatNumber>
          <StatHelpText>
            <Progress 
              value={analytics.successRate} 
              colorScheme="green" 
              size="sm" 
              mt={2}
            />
          </StatHelpText>
        </Stat>

        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={statBg}>
          <StatLabel>Среднее время ответа</StatLabel>
          <StatNumber color="blue.500">{analytics.averageResponseTime.toFixed(0)}ms</StatNumber>
          <StatHelpText>
            {analytics.averageResponseTime < 1000 ? 'Быстро' : 'Медленно'}
          </StatHelpText>
        </Stat>

        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={statBg}>
          <StatLabel>Паттернов найдено</StatLabel>
          <StatNumber color="purple.500">{analytics.patterns.length}</StatNumber>
          <StatHelpText>
            {analytics.patterns.filter(p => p.severity === 'critical').length} критичных
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Критические паттерны */}
      {analytics.patterns.filter(p => p.severity === 'critical' || p.severity === 'high').length > 0 && (
        <Alert status="error" className="purple-alert-border">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>🚨 Обнаружены критические паттерны!</AlertTitle>
            <AlertDescription>
              <VStack align="start" spacing={1} fontSize="sm">
                {analytics.patterns
                  .filter(p => p.severity === 'critical' || p.severity === 'high')
                  .slice(0, 3)
                  .map((pattern, index) => (
                    <HStack key={index}>
                      <Badge colorScheme={getSeverityColor(pattern.severity)} size="sm">
                        {pattern.severity.toUpperCase()}
                      </Badge>
                      <Text>{pattern.description}</Text>
                    </HStack>
                  ))}
              </VStack>
            </AlertDescription>
          </VStack>
        </Alert>
      )}

      {/* Детальная аналитика */}
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList className="purple-tab-border">
          <Tab>
            <HStack spacing={2}>
              <FaChartLine />
              <Text>Статистика</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FaExclamationTriangle />
              <Text>Паттерны банов</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FaLightbulb />
              <Text>Рекомендации</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FaShieldAlt />
              <Text>Топ URL</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Статистика по времени и регионам */}
          <TabPanel p={0} pt={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card className="purple-card-border" bg={cardBg}>
                <CardHeader>
                  <Heading size="md">📊 Баны по часам</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    {analytics.bansByHour.map((count, hour) => (
                      <HStack key={hour} justify="space-between">
                        <Text fontSize="sm">{hour}:00</Text>
                        <HStack>
                          <Progress 
                            value={(count / Math.max(...analytics.bansByHour)) * 100} 
                            colorScheme="red" 
                            size="sm" 
                            width="100px"
                          />
                          <Text fontSize="sm" minW="30px">{count}</Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              <Card className="purple-card-border" bg={cardBg}>
                <CardHeader>
                  <Heading size="md">🌍 Баны по регионам</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2} align="stretch">
                    {Object.entries(analytics.bansByRegion)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([region, count]) => (
                        <HStack key={region} justify="space-between">
                          <Text fontSize="sm">{region}</Text>
                          <Badge colorScheme="red">{count}</Badge>
                        </HStack>
                      ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Паттерны банов */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={4} align="stretch">
              {analytics.patterns.length === 0 ? (
                <Alert status="success" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    Критических паттернов не обнаружено. Система работает стабильно.
                  </AlertDescription>
                </Alert>
              ) : (
                analytics.patterns.map((pattern, index) => (
                  <Card key={index} className="purple-card-border" bg={cardBg}>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <HStack>
                            <Badge colorScheme={getSeverityColor(pattern.severity)} size="lg">
                              {pattern.severity.toUpperCase()}
                            </Badge>
                            <Heading size="sm">{pattern.pattern}</Heading>
                          </HStack>
                          <HStack>
                            <Text fontSize="sm" color="gray.500">
                              Частота: {pattern.frequency}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {pattern.lastSeen.toLocaleString('ru-RU')}
                            </Text>
                          </HStack>
                        </HStack>

                        <Text fontSize="sm">{pattern.description}</Text>

                        {pattern.triggers.length > 0 && (
                          <HStack spacing={2}>
                            <Text fontSize="xs" fontWeight="bold">Триггеры:</Text>
                            {pattern.triggers.map((trigger, i) => (
                              <Badge key={i} size="sm" variant="outline">
                                {trigger}
                              </Badge>
                            ))}
                          </HStack>
                        )}

                        {pattern.recommendations.length > 0 && (
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs" fontWeight="bold" color="green.600">
                              💡 Рекомендации:
                            </Text>
                            {pattern.recommendations.map((rec, i) => (
                              <Text key={i} fontSize="xs" color="green.600">
                                • {rec}
                              </Text>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>
          </TabPanel>

          {/* Рекомендации */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="info" className="purple-alert-border">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <AlertTitle>💡 Общие рекомендации по оптимизации</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={1} fontSize="sm">
                      <Text>• Используйте мобильные User-Agent для лучшей маскировки</Text>
                      <Text>• Распределяйте запросы равномерно по времени</Text>
                      <Text>• Избегайте пиковых часов (10:00-18:00 МСК)</Text>
                      <Text>• Ротируйте прокси каждые 50-100 запросов</Text>
                      <Text>• Добавляйте случайные задержки 5-15 секунд</Text>
                      <Text>• Мониторьте успешность по регионам</Text>
                    </VStack>
                  </AlertDescription>
                </VStack>
              </Alert>

              {/* Персонализированные рекомендации */}
              {analytics.successRate < 80 && (
                <Alert status="warning" className="purple-alert-border">
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <AlertTitle>⚠️ Низкая успешность запросов</AlertTitle>
                    <AlertDescription>
                      <VStack align="start" spacing={1} fontSize="sm">
                        <Text>Ваша успешность {analytics.successRate.toFixed(1)}% ниже рекомендуемых 80%</Text>
                        <Text>• Увеличьте интервалы между запросами</Text>
                        <Text>• Смените пул прокси</Text>
                        <Text>• Обновите User-Agent базу</Text>
                      </VStack>
                    </AlertDescription>
                  </VStack>
                </Alert>
              )}

              {analytics.averageResponseTime > 2000 && (
                <Alert status="warning" className="purple-alert-border">
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <AlertTitle>🐌 Медленные ответы</AlertTitle>
                    <AlertDescription>
                      <VStack align="start" spacing={1} fontSize="sm">
                        <Text>Среднее время ответа {analytics.averageResponseTime.toFixed(0)}ms</Text>
                        <Text>• Проверьте качество прокси</Text>
                        <Text>• Используйте более быстрые серверы</Text>
                        <Text>• Оптимизируйте размер запросов</Text>
                      </VStack>
                    </AlertDescription>
                  </VStack>
                </Alert>
              )}
            </VStack>
          </TabPanel>

          {/* Топ забаненных URL */}
          <TabPanel p={0} pt={6}>
            <Card className="purple-card-border" bg={cardBg}>
              <CardHeader>
                <Heading size="md">🎯 Топ забаненных URL</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>URL</Th>
                        <Th isNumeric>Количество банов</Th>
                        <Th>Статус</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {analytics.topBannedUrls.map((item, index) => (
                        <Tr key={index}>
                          <Td>
                            <Tooltip label={item.url}>
                              <Code fontSize="xs">
                                {item.url.length > 50 
                                  ? item.url.substring(0, 47) + '...' 
                                  : item.url
                                }
                              </Code>
                            </Tooltip>
                          </Td>
                          <Td isNumeric>
                            <Badge colorScheme="red">{item.count}</Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={item.count > 5 ? 'red' : 'yellow'} size="sm">
                              {item.count > 5 ? 'Избегать' : 'Осторожно'}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Управление */}
      <HStack spacing={4}>
        <Button
          variant="outline"
          onClick={loadAnalytics}
          className="purple-button-border"
        >
          Обновить данные
        </Button>

        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleCleanup}
          className="purple-button-border"
        >
          Очистить старые данные
        </Button>
      </HStack>
    </VStack>
  );
}
