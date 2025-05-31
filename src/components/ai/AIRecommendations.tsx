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
  Button,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Flex,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaBrain, FaLightbulb, FaBullseye, FaChartLine, FaRocket } from 'react-icons/fa';
import { aiCompetitorAnalysis } from '../../services/aiCompetitorAnalysis';

interface AIRecommendationsProps {
  productId: string;
  currentPrice: number;
  competitors: any[];
}

export default function AIRecommendations({
  productId,
  currentPrice,
  competitors
}: AIRecommendationsProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    loadAIAnalysis();
  }, [productId, currentPrice, competitors]);

  const loadAIAnalysis = async () => {
    try {
      setIsLoading(true);
      const result = await aiCompetitorAnalysis.analyzeCompetitors(
        productId,
        competitors,
        currentPrice
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Ошибка загрузки AI-анализа:', error);
      toast({
        title: 'Ошибка AI-анализа',
        description: 'Не удалось загрузить рекомендации',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyRecommendedPrice = async () => {
    if (!analysis?.pricingRecommendation) return;

    try {
      setIsApplying(true);

      // Здесь будет API вызов для изменения цены
      await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация

      toast({
        title: '✅ Цена обновлена',
        description: `Новая цена: ${analysis.pricingRecommendation.recommendedPrice} руб.`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить цену',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return FaBullseye;
      case 'positioning': return FaChartLine;
      case 'marketing': return FaRocket;
      case 'product': return FaLightbulb;
      default: return FaBrain;
    }
  };

  if (isLoading) {
    return (
      <Card className="purple-card-border" bg={cardBg}>
        <CardBody>
          <VStack spacing={4}>
            <Icon as={FaBrain} boxSize={12} color="purple.500" />
            <Text>🤖 AI анализирует конкурентов...</Text>
            <Progress size="lg" isIndeterminate colorScheme="purple" width="100%" />
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Alert status="error" className="purple-alert-border">
        <AlertIcon />
        <AlertDescription>
          Не удалось получить AI-рекомендации. Попробуйте позже.
        </AlertDescription>
      </Alert>
    );
  }

  const { marketAnalysis, pricingRecommendation, insights } = analysis;

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <Icon as={FaBrain} color="purple.500" boxSize={6} />
            <Heading size="lg" color="purple.600">
              🤖 AI-Рекомендации
            </Heading>
            <Badge colorScheme="green" size="sm">
              Уверенность: {(pricingRecommendation.confidence * 100).toFixed(0)}%
            </Badge>
          </HStack>
        </CardHeader>
      </Card>

      {/* Рекомендация по цене */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">💰 Рекомендация по ценообразованию</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat className="purple-stat-border" p={4} borderRadius="md">
                <StatLabel>Текущая цена</StatLabel>
                <StatNumber color="blue.500">{currentPrice} ₽</StatNumber>
              </Stat>

              <Stat className="purple-stat-border" p={4} borderRadius="md">
                <StatLabel>Рекомендуемая цена</StatLabel>
                <StatNumber color="green.500">
                  {pricingRecommendation.recommendedPrice} ₽
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={pricingRecommendation.recommendedPrice > currentPrice ? 'increase' : 'decrease'}
                  />
                  {((pricingRecommendation.recommendedPrice - currentPrice) / currentPrice * 100).toFixed(1)}%
                </StatHelpText>
              </Stat>

              <Stat className="purple-stat-border" p={4} borderRadius="md">
                <StatLabel>Ожидаемая позиция</StatLabel>
                <StatNumber color="purple.500">#{pricingRecommendation.expectedPosition}</StatNumber>
                <StatHelpText>в поиске</StatHelpText>
              </Stat>
            </SimpleGrid>

            <Alert
              status={pricingRecommendation.riskLevel === 'low' ? 'success' :
                     pricingRecommendation.riskLevel === 'medium' ? 'warning' : 'error'}
              className="purple-alert-border"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>Обоснование:</AlertTitle>
                <AlertDescription fontSize="sm">
                  {pricingRecommendation.reasoning}
                </AlertDescription>
              </Box>
            </Alert>

            <HStack spacing={4}>
              <Button
                colorScheme="green"
                leftIcon={<Icon as={FaBullseye} />}
                onClick={applyRecommendedPrice}
                isLoading={isApplying}
                loadingText="Применяем..."
                className="purple-button-border"
              >
                Применить рекомендуемую цену
              </Button>

              <Badge colorScheme={getPriorityColor(pricingRecommendation.riskLevel)} size="lg" p={2}>
                Риск: {pricingRecommendation.riskLevel}
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Анализ рынка */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">📊 Анализ рынка</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Средняя цена</StatLabel>
              <StatNumber color="blue.500">{marketAnalysis.averagePrice} ₽</StatNumber>
            </Stat>

            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Диапазон цен</StatLabel>
              <StatNumber color="orange.500">
                {marketAnalysis.priceRange.min} - {marketAnalysis.priceRange.max} ₽
              </StatNumber>
            </Stat>

            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Тренд цен</StatLabel>
              <StatNumber color="purple.500">
                {marketAnalysis.marketTrends.priceDirection === 'up' ? '📈 Рост' :
                 marketAnalysis.marketTrends.priceDirection === 'down' ? '📉 Падение' : '➡️ Стабильно'}
              </StatNumber>
            </Stat>

            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Конкуренция</StatLabel>
              <StatNumber color="red.500">
                {marketAnalysis.marketTrends.competitionLevel === 'high' ? '🔥 Высокая' :
                 marketAnalysis.marketTrends.competitionLevel === 'medium' ? '⚡ Средняя' : '✅ Низкая'}
              </StatNumber>
            </Stat>
          </SimpleGrid>

          {marketAnalysis.opportunities.length > 0 && (
            <Alert status="success" className="purple-alert-border" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>🎯 Возможности:</AlertTitle>
                <AlertDescription fontSize="sm">
                  {marketAnalysis.opportunities.map((opp: string, i: number) => (
                    <Text key={i}>• {opp}</Text>
                  ))}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {marketAnalysis.threats.length > 0 && (
            <Alert status="warning" className="purple-alert-border">
              <AlertIcon />
              <Box>
                <AlertTitle>⚠️ Угрозы:</AlertTitle>
                <AlertDescription fontSize="sm">
                  {marketAnalysis.threats.map((threat: string, i: number) => (
                    <Text key={i}>• {threat}</Text>
                  ))}
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* AI-Инсайты */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">💡 AI-Инсайты и рекомендации</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {insights.map((insight: any, index: number) => (
              <Alert
                key={index}
                status={insight.priority === 'critical' ? 'error' :
                       insight.priority === 'high' ? 'warning' : 'info'}
                variant="left-accent"
                className="purple-alert-border"
              >
                <AlertIcon as={getTypeIcon(insight.type)} />
                <Box flex="1">
                  <HStack justify="space-between" mb={2}>
                    <AlertTitle fontSize="sm">{insight.title}</AlertTitle>
                    <HStack spacing={2}>
                      <Badge colorScheme={getPriorityColor(insight.priority)} size="sm">
                        {insight.priority}
                      </Badge>
                      <Tooltip label="Влияние на бизнес">
                        <Badge colorScheme="blue" size="sm">
                          Impact: {insight.impact}/10
                        </Badge>
                      </Tooltip>
                      <Tooltip label="Сложность реализации">
                        <Badge colorScheme="orange" size="sm">
                          Effort: {insight.effort}/10
                        </Badge>
                      </Tooltip>
                    </HStack>
                  </HStack>

                  <AlertDescription fontSize="sm" mb={3}>
                    {insight.description}
                  </AlertDescription>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1}>Действия:</Text>
                    {insight.actionItems.map((action: string, i: number) => (
                      <Text key={i} fontSize="xs" color="gray.600">
                        • {action}
                      </Text>
                    ))}
                  </Box>
                </Box>
              </Alert>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Альтернативные стратегии */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">🎯 Альтернативные стратегии</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {pricingRecommendation.alternatives.map((alt: any, index: number) => (
              <Box key={index} className="purple-container-border" p={4} borderRadius="md">
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" width="100%">
                    <Heading size="sm">{alt.strategy} стратегия</Heading>
                    <Badge colorScheme="purple" size="lg">
                      {alt.price} ₽
                    </Badge>
                  </HStack>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="green.600" mb={1}>
                      ✅ Преимущества:
                    </Text>
                    {alt.pros.map((pro: string, i: number) => (
                      <Text key={i} fontSize="xs" color="gray.600">• {pro}</Text>
                    ))}
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="red.600" mb={1}>
                      ❌ Недостатки:
                    </Text>
                    {alt.cons.map((con: string, i: number) => (
                      <Text key={i} fontSize="xs" color="gray.600">• {con}</Text>
                    ))}
                  </Box>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  );
}
