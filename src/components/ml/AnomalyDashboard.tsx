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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Button,
  Tooltip,
  Flex,
  Divider
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaBrain, FaExclamationTriangle, FaChartLine, FaRobot } from 'react-icons/fa';
import { mlAnomalyDetection } from '../../services/mlAnomalyDetection';

interface AnomalyAlert {
  id: string;
  productName: string;
  competitorName: string;
  anomalyType: string;
  anomalyScore: number;
  confidence: number;
  description: string;
  recommendation: string;
  timestamp: number;
  isNew: boolean;
}

export default function AnomalyDashboard() {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    anomaliesDetected: 0,
    mostCommonAnomalyType: '',
    averageConfidence: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadAnomalyData();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(loadAnomalyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnomalyData = async () => {
    try {
      // Получаем статистику ML-сервиса
      const mlStats = mlAnomalyDetection.getAnomalyStats();
      setStats(mlStats);

      // Здесь должен быть запрос к API для получения последних аномалий
      // Пока используем моковые данные
      const mockAnomalies: AnomalyAlert[] = [
        {
          id: '1',
          productName: 'iPhone 15 Pro',
          competitorName: 'TechStore',
          anomalyType: 'price_spike',
          anomalyScore: 8.5,
          confidence: 0.92,
          description: 'Резкий рост цены на 25.3%',
          recommendation: 'Конкурент поднял цену на 25.3%. Рассмотрите возможность повышения своей цены.',
          timestamp: Date.now() - 300000, // 5 минут назад
          isNew: true
        },
        {
          id: '2',
          productName: 'Samsung Galaxy S24',
          competitorName: 'MobileWorld',
          anomalyType: 'rating_manipulation',
          anomalyScore: 6.2,
          confidence: 0.78,
          description: 'Подозрительное изменение рейтинга на 1.2 звезд',
          recommendation: 'Проверьте отзывы конкурента на предмет накрутки',
          timestamp: Date.now() - 1800000, // 30 минут назад
          isNew: false
        },
        {
          id: '3',
          productName: 'MacBook Air M3',
          competitorName: 'AppleStore',
          anomalyType: 'review_bombing',
          anomalyScore: 9.1,
          confidence: 0.95,
          description: 'Подозрительный рост отзывов: +47 за последние 24 часа',
          recommendation: 'Возможная накрутка отзывов конкурентом',
          timestamp: Date.now() - 3600000, // 1 час назад
          isNew: false
        }
      ];

      setAnomalies(mockAnomalies);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных аномалий:', error);
      setIsLoading(false);
    }
  };

  const getAnomalyTypeColor = (type: string) => {
    switch (type) {
      case 'price_spike': return 'red';
      case 'price_drop': return 'orange';
      case 'rating_manipulation': return 'yellow';
      case 'review_bombing': return 'purple';
      default: return 'gray';
    }
  };

  const getAnomalyTypeIcon = (type: string) => {
    switch (type) {
      case 'price_spike': return '📈';
      case 'price_drop': return '📉';
      case 'rating_manipulation': return '⭐';
      case 'review_bombing': return '📝';
      default: return '🔍';
    }
  };

  const getAnomalyTypeName = (type: string) => {
    switch (type) {
      case 'price_spike': return 'Рост цены';
      case 'price_drop': return 'Падение цены';
      case 'rating_manipulation': return 'Манипуляция рейтингом';
      case 'review_bombing': return 'Накрутка отзывов';
      default: return 'Неизвестная аномалия';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}ч назад`;
    return `${minutes}м назад`;
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <Icon as={FaBrain} color="purple.500" boxSize={6} />
            <Heading size="lg" color="purple.600">
              🤖 ML-Детекция аномалий
            </Heading>
            <Badge colorScheme="green" size="sm">
              Real-time
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Автоматическое выявление подозрительных изменений в ценах и рейтингах конкурентов
          </Text>
        </CardHeader>
      </Card>

      {/* Статистика */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={cardBg}>
          <StatLabel>Отслеживаемые товары</StatLabel>
          <StatNumber color="blue.500">{stats.totalProducts}</StatNumber>
          <StatHelpText>активных</StatHelpText>
        </Stat>

        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={cardBg}>
          <StatLabel>Аномалии за сегодня</StatLabel>
          <StatNumber color="red.500">{anomalies.length}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            +23% за неделю
          </StatHelpText>
        </Stat>

        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={cardBg}>
          <StatLabel>Точность ML</StatLabel>
          <StatNumber color="green.500">{(stats.averageConfidence * 100).toFixed(1)}%</StatNumber>
          <StatHelpText>средняя уверенность</StatHelpText>
        </Stat>

        <Stat className="purple-stat-border" p={4} borderRadius="md" bg={cardBg}>
          <StatLabel>Частая аномалия</StatLabel>
          <StatNumber color="orange.500">📈 Рост цен</StatNumber>
          <StatHelpText>45% от всех</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Список аномалий */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">🚨 Обнаруженные аномалии</Heading>
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<Icon as={FaRobot} />}
              className="purple-button-border"
              onClick={loadAnomalyData}
              isLoading={isLoading}
            >
              Обновить
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {anomalies.length === 0 ? (
              <Alert status="info" className="purple-alert-border">
                <AlertIcon />
                <AlertDescription>
                  Аномалий не обнаружено. ML-система продолжает мониторинг.
                </AlertDescription>
              </Alert>
            ) : (
              anomalies.map((anomaly) => (
                <Alert
                  key={anomaly.id}
                  status={anomaly.anomalyScore > 7 ? 'error' : 'warning'}
                  variant="left-accent"
                  className="purple-alert-border"
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box flex="1">
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <AlertTitle fontSize="sm">
                          {getAnomalyTypeIcon(anomaly.anomalyType)} {anomaly.productName}
                        </AlertTitle>
                        <Badge 
                          colorScheme={getAnomalyTypeColor(anomaly.anomalyType)} 
                          size="sm"
                        >
                          {getAnomalyTypeName(anomaly.anomalyType)}
                        </Badge>
                        {anomaly.isNew && (
                          <Badge colorScheme="red" size="sm">
                            NEW
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {formatTimestamp(anomaly.timestamp)}
                      </Text>
                    </HStack>
                    
                    <AlertDescription fontSize="sm" mb={3}>
                      <Text><strong>Конкурент:</strong> {anomaly.competitorName}</Text>
                      <Text><strong>Описание:</strong> {anomaly.description}</Text>
                      <Text><strong>Рекомендация:</strong> {anomaly.recommendation}</Text>
                    </AlertDescription>

                    <HStack spacing={4}>
                      <Tooltip label="Серьезность аномалии (0-10)">
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="bold">Серьезность:</Text>
                          <Progress
                            value={anomaly.anomalyScore * 10}
                            size="sm"
                            colorScheme={anomaly.anomalyScore > 7 ? 'red' : 'orange'}
                            width="60px"
                          />
                          <Text fontSize="xs">{anomaly.anomalyScore.toFixed(1)}</Text>
                        </HStack>
                      </Tooltip>

                      <Tooltip label="Уверенность ML-модели">
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="bold">Уверенность:</Text>
                          <Progress
                            value={anomaly.confidence * 100}
                            size="sm"
                            colorScheme="green"
                            width="60px"
                          />
                          <Text fontSize="xs">{(anomaly.confidence * 100).toFixed(0)}%</Text>
                        </HStack>
                      </Tooltip>
                    </HStack>
                  </Box>
                </Alert>
              ))
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Настройки ML */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">⚙️ Настройки ML-детекции</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Порог изменения цены</Text>
              <HStack>
                <Progress value={20} size="lg" colorScheme="blue" flex={1} />
                <Text fontSize="sm">20%</Text>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Порог изменения рейтинга</Text>
              <HStack>
                <Progress value={50} size="lg" colorScheme="yellow" flex={1} />
                <Text fontSize="sm">0.5★</Text>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Окно анализа</Text>
              <HStack>
                <Progress value={100} size="lg" colorScheme="green" flex={1} />
                <Text fontSize="sm">24ч</Text>
              </HStack>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  );
}
