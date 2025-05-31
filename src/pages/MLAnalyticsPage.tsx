import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
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
  Box
} from '@chakra-ui/react';
import { FaBrain, FaRobot, FaChartLine, FaCog } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import AnomalyDashboard from '../components/ml/AnomalyDashboard';
import AIRecommendations from '../components/ai/AIRecommendations';

export default function MLAnalyticsPage() {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <VStack spacing={4} textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaBrain} boxSize={12} color="purple.500" />
          <Heading as="h1" size="xl" color="purple.600">
            🤖 ML-Аналитика и ИИ
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Машинное обучение для автоматического выявления аномалий,
            прогнозирования трендов и оптимизации ценовых стратегий
          </Text>

          <HStack spacing={4} mt={4}>
            <Badge colorScheme="green" size="lg" p={2}>
              ✅ ML-модели активны
            </Badge>
            <Badge colorScheme="blue" size="lg" p={2}>
              🔄 Real-time анализ
            </Badge>
            <Badge colorScheme="purple" size="lg" p={2}>
              🎯 85% точность
            </Badge>
          </HStack>
        </VStack>

        {/* Информационные блоки */}
        <VStack spacing={4}>
          <Alert status="success" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🚀 Новые возможности ML!</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  • <strong>Детекция аномалий</strong> - автоматическое выявление подозрительных изменений<br/>
                  • <strong>Прогнозирование</strong> - предсказание трендов на основе исторических данных<br/>
                  • <strong>AutoML</strong> - автоматический подбор оптимальных параметров<br/>
                  • <strong>Конкурентная разведка</strong> - анализ стратегий конкурентов
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="info" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>💡 Как это работает</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  ML-система анализирует данные в реальном времени, выявляет паттерны и аномалии,
                  предоставляет рекомендации по оптимизации цен и стратегий продаж.
                  Все происходит автоматически без вашего участия.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>

        {/* Основной контент */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList className="purple-tab-border">
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaBrain} />
                <Text>AI-Рекомендации</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaRobot} />
                <Text>Детекция аномалий</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaChartLine} />
                <Text>Прогнозирование</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaCog} />
                <Text>AutoML настройки</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* AI-Рекомендации */}
            <TabPanel p={0} pt={6}>
              <AIRecommendations
                productId="demo-product-123"
                currentPrice={2990}
                competitors={[
                  {
                    id: '1',
                    name: 'iPhone 15 Pro Max',
                    price: 3200,
                    rating: 4.8,
                    reviewCount: 1250,
                    position: 1,
                    category: 'Смартфоны',
                    brand: 'Apple',
                    features: ['128GB', 'Titanium', 'Pro Camera'],
                    images: [],
                    description: 'Флагманский смартфон Apple',
                    priceHistory: [
                      { date: '2024-01-01', price: 3300 },
                      { date: '2024-01-15', price: 3200 }
                    ]
                  },
                  {
                    id: '2',
                    name: 'Samsung Galaxy S24 Ultra',
                    price: 2850,
                    rating: 4.7,
                    reviewCount: 890,
                    position: 2,
                    category: 'Смартфоны',
                    brand: 'Samsung',
                    features: ['256GB', 'S Pen', 'AI Camera'],
                    images: [],
                    description: 'Премиальный Android смартфон',
                    priceHistory: [
                      { date: '2024-01-01', price: 2900 },
                      { date: '2024-01-15', price: 2850 }
                    ]
                  }
                ]}
              />
            </TabPanel>

            {/* Детекция аномалий */}
            <TabPanel p={0} pt={6}>
              <AnomalyDashboard />
            </TabPanel>

            {/* Прогнозирование */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="warning" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      <strong>🚧 В разработке:</strong> Модуль прогнозирования находится в стадии разработки.
                      Ожидаемый релиз - Q1 2024. Будет включать:
                    </Text>
                    <Text fontSize="sm" mt={2}>
                      • Прогноз спроса на 30-90 дней<br/>
                      • Оптимальное ценообразование с учетом сезонности<br/>
                      • Рекомендации по ассортименту<br/>
                      • Анализ жизненного цикла товара
                    </Text>
                  </AlertDescription>
                </Alert>

                <Box className="purple-container-border" p={6} borderRadius="md">
                  <VStack spacing={4}>
                    <Icon as={FaChartLine} boxSize={16} color="gray.400" />
                    <Heading size="md" color="gray.500">
                      Модуль прогнозирования
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Здесь будут отображаться прогнозы цен, спроса и трендов
                      на основе машинного обучения
                    </Text>
                    <Button
                      as={RouterLink}
                      to="/roadmap"
                      colorScheme="purple"
                      variant="outline"
                      className="purple-button-border"
                    >
                      Посмотреть roadmap
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>

            {/* AutoML настройки */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="info" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      <strong>🤖 AutoML:</strong> Автоматический подбор оптимальных параметров
                      для каждого товара без необходимости настройки вручную.
                    </Text>
                  </AlertDescription>
                </Alert>

                <Box className="purple-container-border" p={6} borderRadius="md">
                  <VStack spacing={4}>
                    <Icon as={FaCog} boxSize={16} color="gray.400" />
                    <Heading size="md" color="gray.500">
                      AutoML платформа
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Автоматический выбор лучшей модели, гиперпараметр-тюнинг,
                      A/B тестирование стратегий и непрерывное обучение
                    </Text>
                    <Button
                      colorScheme="purple"
                      variant="outline"
                      className="purple-button-border"
                      isDisabled
                    >
                      Скоро доступно
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Дополнительная информация */}
        <VStack spacing={4} p={6} className="purple-container-border" borderRadius="md">
          <Heading size="md" color="purple.600">🔮 Будущие возможности</Heading>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Text fontSize="sm" color="gray.600">
                🎯 <strong>Персонализированные рекомендации</strong> - индивидуальные стратегии для каждого товара
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="gray.600">
                📊 <strong>Конкурентная разведка</strong> - автоматический анализ стратегий конкурентов
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="gray.600">
                🌍 <strong>Мультимаркетплейс ML</strong> - единые модели для всех площадок
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="gray.600">
                🤝 <strong>Интеграция с CRM</strong> - ML-аналитика в ваших бизнес-процессах
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  );
}
