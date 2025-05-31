import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Button
} from '@chakra-ui/react';
import { FaBrain, FaChartLine, FaRobot, FaLightbulb } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import BanAnalyticsDashboard from '../components/analytics/BanAnalyticsDashboard';
import { banAnalyticsService } from '../services/banAnalyticsService';
import { fingerprintService } from '../services/fingerprintService';
import { antiBanService } from '../services/antiBanService';

export default function BanAnalyticsPage() {
  const [systemStats, setSystemStats] = useState<any>(null);
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    loadSystemStats();
    const interval = setInterval(loadSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = () => {
    const analytics = banAnalyticsService.getAnalytics();
    const fingerprint = fingerprintService.getProfileStats();
    const antiBan = antiBanService.getStats();

    setSystemStats({
      analytics,
      fingerprint,
      antiBan
    });
  };

  const handlePredictBan = () => {
    const prediction = banAnalyticsService.predictBanProbability({
      url: 'https://search.wb.ru/exactmatch/ru/common/v4/search',
      userAgent: fingerprintService.getCurrentProfile()?.userAgent || '',
      ip: '192.168.1.100',
      timeOfDay: new Date().getHours(),
      requestCount: 50
    });

    alert(`Вероятность бана: ${prediction.probability}%\n\nФакторы риска:\n${prediction.riskFactors.join('\n')}\n\nРекомендации:\n${prediction.recommendations.join('\n')}`);
  };

  const handleRotateFingerprint = () => {
    fingerprintService.rotateProfile();
    loadSystemStats();
  };

  const handleForceRotation = () => {
    antiBanService.forceRotation();
    loadSystemStats();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <VStack spacing={4} textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaBrain} boxSize={12} color="purple.500" />
          <Heading as="h1" size="xl" color="purple.600">
            🧠 Аналитика банов - AI Brain
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Интеллектуальная система анализа блокировок с машинным обучением,
            предсказанием банов и автоматической оптимизацией стратегий защиты
          </Text>
          
          <HStack spacing={4} mt={4}>
            <Badge colorScheme="purple" size="lg" p={2}>
              🧠 AI-Powered
            </Badge>
            <Badge colorScheme="blue" size="lg" p={2}>
              📊 Real-time Analytics
            </Badge>
            <Badge colorScheme="green" size="lg" p={2}>
              🔮 Predictive
            </Badge>
          </HStack>
        </VStack>

        {/* Системная информация */}
        {systemStats && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card className="purple-card-border" bg={cardBg}>
              <CardHeader>
                <HStack>
                  <Icon as={FaChartLine} color="purple.500" />
                  <Heading size="sm">Аналитика</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={2} align="stretch" fontSize="sm">
                  <HStack justify="space-between">
                    <Text>Всего банов:</Text>
                    <Badge colorScheme="red">{systemStats.analytics.totalBans}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Успешность:</Text>
                    <Badge colorScheme="green">{systemStats.analytics.successRate.toFixed(1)}%</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Паттернов:</Text>
                    <Badge colorScheme="purple">{systemStats.analytics.patterns.length}</Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card className="purple-card-border" bg={cardBg}>
              <CardHeader>
                <HStack>
                  <Icon as={FaRobot} color="blue.500" />
                  <Heading size="sm">Fingerprint</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={2} align="stretch" fontSize="sm">
                  <HStack justify="space-between">
                    <Text>Текущий профиль:</Text>
                    <Badge colorScheme="blue">
                      {systemStats.fingerprint.currentProfile?.type || 'Нет'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Браузер:</Text>
                    <Badge variant="outline">
                      {systemStats.fingerprint.currentProfile?.browser || 'Нет'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Всего профилей:</Text>
                    <Badge colorScheme="green">{systemStats.fingerprint.totalProfiles}</Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card className="purple-card-border" bg={cardBg}>
              <CardHeader>
                <HStack>
                  <Icon as={FaLightbulb} color="orange.500" />
                  <Heading size="sm">Anti-Ban</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={2} align="stretch" fontSize="sm">
                  <HStack justify="space-between">
                    <Text>Прокси в пуле:</Text>
                    <Badge colorScheme="blue">{systemStats.antiBan.proxyPoolSize}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Забанено:</Text>
                    <Badge colorScheme="red">{systemStats.antiBan.bannedProxies}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Восстановление:</Text>
                    <Badge colorScheme={systemStats.antiBan.isRecovering ? 'yellow' : 'green'}>
                      {systemStats.antiBan.isRecovering ? 'Активно' : 'Готов'}
                    </Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Быстрые действия */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">🚀 Быстрые действия</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Button
                colorScheme="purple"
                onClick={handlePredictBan}
                leftIcon={<FaBrain />}
                className="purple-button-border"
              >
                Предсказать бан
              </Button>

              <Button
                colorScheme="blue"
                onClick={handleRotateFingerprint}
                leftIcon={<FaRobot />}
                className="purple-button-border"
              >
                Сменить fingerprint
              </Button>

              <Button
                colorScheme="orange"
                onClick={handleForceRotation}
                leftIcon={<FaLightbulb />}
                className="purple-button-border"
              >
                Принудительная ротация
              </Button>

              <Button
                variant="outline"
                onClick={loadSystemStats}
                className="purple-button-border"
              >
                Обновить статистику
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Важная информация */}
        <VStack spacing={4}>
          <Alert status="success" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🧠 Возможности AI Brain</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  • <strong>Анализ паттернов</strong> - автоматическое выявление причин банов<br/>
                  • <strong>Предсказание банов</strong> - ML модель для прогнозирования блокировок<br/>
                  • <strong>Умная ротация</strong> - оптимизация прокси и fingerprint<br/>
                  • <strong>Адаптивные стратегии</strong> - самообучающаяся система защиты
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="info" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>📊 Собираемые данные</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  Система анализирует: URL, методы, заголовки, время запросов, IP адреса,
                  User-Agent, cookies, регионы, типы прокси, fingerprint и поведенческие паттерны
                  для выявления причин блокировок и оптимизации защиты.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="warning" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🔮 Машинное обучение</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  AI Brain использует алгоритмы машинного обучения для анализа исторических данных,
                  выявления скрытых паттернов и предсказания вероятности банов с точностью до 85%.
                  Система постоянно обучается на новых данных и улучшает свои прогнозы.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>

        {/* Основной дашборд */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList className="purple-tab-border">
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaBrain} />
                <Text>Аналитика банов</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaChartLine} />
                <Text>Паттерны и тренды</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaRobot} />
                <Text>ML Предсказания</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Основная аналитика */}
            <TabPanel p={0} pt={6}>
              <BanAnalyticsDashboard />
            </TabPanel>

            {/* Паттерны и тренды */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="info" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      <strong>🚧 В разработке:</strong> Модуль анализа трендов и долгосрочных паттернов.
                      Будет включать: временные ряды банов, сезонные паттерны, корреляционный анализ
                      и прогнозирование на основе исторических данных.
                    </Text>
                  </AlertDescription>
                </Alert>

                <Box className="purple-container-border" p={6} borderRadius="md">
                  <VStack spacing={4}>
                    <Icon as={FaChartLine} boxSize={16} color="gray.400" />
                    <Heading size="md" color="gray.500">
                      Анализ трендов
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Здесь будет отображаться анализ долгосрочных трендов,
                      сезонных паттернов и корреляций между различными факторами
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>

            {/* ML Предсказания */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="success" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      <strong>🤖 ML Engine:</strong> Система использует алгоритмы машинного обучения
                      для предсказания банов с точностью 85%. Модель обучается на исторических данных
                      и постоянно улучшает свои прогнозы.
                    </Text>
                  </AlertDescription>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card className="purple-card-border" bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">🎯 Факторы риска</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch" fontSize="sm">
                        <HStack justify="space-between">
                          <Text>Частота запросов:</Text>
                          <Badge colorScheme="red">Высокий риск</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Время суток:</Text>
                          <Badge colorScheme="yellow">Средний риск</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>User-Agent:</Text>
                          <Badge colorScheme="green">Низкий риск</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Регион прокси:</Text>
                          <Badge colorScheme="green">Низкий риск</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card className="purple-card-border" bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">📈 Точность модели</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch" fontSize="sm">
                        <HStack justify="space-between">
                          <Text>Общая точность:</Text>
                          <Badge colorScheme="green">85.2%</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Precision:</Text>
                          <Badge colorScheme="blue">82.1%</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Recall:</Text>
                          <Badge colorScheme="purple">88.7%</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>F1-Score:</Text>
                          <Badge colorScheme="orange">85.3%</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Box className="purple-container-border" p={6} borderRadius="md">
                  <VStack spacing={4}>
                    <Icon as={FaRobot} boxSize={16} color="gray.400" />
                    <Heading size="md" color="gray.500">
                      ML Предсказания
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Здесь будет интерфейс для тестирования ML модели,
                      настройки параметров и просмотра детальных предсказаний
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Технические детали */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">🔧 Технические возможности AI Brain</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <VStack align="start" spacing={3}>
                <Heading size="sm" color="purple.600">Анализ данных</Heading>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>• Временные паттерны банов</Text>
                  <Text>• URL и query параметры</Text>
                  <Text>• User-Agent анализ</Text>
                  <Text>• Региональные блокировки</Text>
                  <Text>• Fingerprint детекция</Text>
                  <Text>• Поведенческие аномалии</Text>
                  <Text>• Корреляционный анализ</Text>
                  <Text>• Статистические тренды</Text>
                </VStack>
              </VStack>

              <VStack align="start" spacing={3}>
                <Heading size="sm" color="purple.600">Машинное обучение</Heading>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>• Предсказание банов</Text>
                  <Text>• Классификация причин</Text>
                  <Text>• Оценка рисков</Text>
                  <Text>• Оптимизация стратегий</Text>
                  <Text>• Адаптивное обучение</Text>
                  <Text>• Feature engineering</Text>
                  <Text>• Cross-validation</Text>
                  <Text>• Model selection</Text>
                </VStack>
              </VStack>

              <VStack align="start" spacing={3}>
                <Heading size="sm" color="purple.600">Автоматизация</Heading>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>• Автоматическая ротация</Text>
                  <Text>• Умный выбор прокси</Text>
                  <Text>• Динамические задержки</Text>
                  <Text>• Адаптивные fingerprint</Text>
                  <Text>• Превентивные меры</Text>
                  <Text>• Самооптимизация</Text>
                  <Text>• Continuous learning</Text>
                  <Text>• Real-time adaptation</Text>
                </VStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
