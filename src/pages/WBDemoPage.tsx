import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
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
  useColorModeValue,
  Progress,
  Spinner,
  Code,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { FaRocket, FaShieldAlt, FaRobot, FaChartLine, FaPlay, FaCheckCircle } from 'react-icons/fa';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  payload?: any;
  completed: boolean;
  result?: any;
  loading: boolean;
}

const WBDemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([
    {
      id: 'search',
      title: '🔍 Поиск товаров',
      description: 'Демонстрация реального поиска товаров на Wildberries',
      endpoint: '/api/wb/search?q=iPhone&limit=5',
      method: 'GET',
      completed: false,
      loading: false
    },
    {
      id: 'product',
      title: '📦 Получение товара',
      description: 'Получение детальной информации о конкретном товаре',
      endpoint: '/api/wb/product/432018439',
      method: 'GET',
      completed: false,
      loading: false
    },
    {
      id: 'competitors',
      title: '🎯 Поиск конкурентов',
      description: 'Анализ конкурентов для выбранного товара',
      endpoint: '/api/wb/competitors/432018439?limit=5',
      method: 'GET',
      completed: false,
      loading: false
    },
    {
      id: 'auto-pricing',
      title: '🤖 Автоматическое ценообразование',
      description: 'Демонстрация автоматического расчета оптимальной цены',
      endpoint: '/api/wb/auto-price-update',
      method: 'POST',
      payload: {
        productId: '432018439',
        strategy: 'follow_min',
        parameters: {
          minPrice: 80000,
          maxPrice: 120000
        }
      },
      completed: false,
      loading: false
    },
    {
      id: 'protection-test',
      title: '🛡️ Тест системы защиты',
      description: 'Проверка всех систем защиты от блокировок',
      endpoint: '/api/wb/test-protection',
      method: 'GET',
      completed: false,
      loading: false
    }
  ]);

  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const runSingleStep = async (stepIndex: number) => {
    const step = demoSteps[stepIndex];
    
    setDemoSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, loading: true } : s
    ));

    try {
      let response;
      
      if (step.method === 'GET') {
        response = await fetch(step.endpoint);
      } else {
        response = await fetch(step.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step.payload)
        });
      }

      if (response.ok) {
        const result = await response.json();
        
        setDemoSteps(prev => prev.map((s, i) => 
          i === stepIndex ? { 
            ...s, 
            loading: false, 
            completed: true, 
            result: result 
          } : s
        ));

        toast({
          title: `${step.title} - Успешно`,
          description: 'Шаг демонстрации выполнен успешно',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setDemoSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { 
          ...s, 
          loading: false, 
          result: { error: 'Ошибка выполнения запроса' }
        } : s
      ));

      toast({
        title: `${step.title} - Ошибка`,
        description: 'Не удалось выполнить шаг демонстрации',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const runFullDemo = async () => {
    setIsRunningDemo(true);
    setDemoProgress(0);

    // Сбрасываем все шаги
    setDemoSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      loading: false,
      result: undefined
    })));

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      setDemoProgress((i / demoSteps.length) * 100);
      
      await runSingleStep(i);
      
      // Пауза между шагами
      if (i < demoSteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setDemoProgress(100);
    setIsRunningDemo(false);
    setCurrentStep(-1);

    toast({
      title: 'Демонстрация завершена!',
      description: 'Все функции реального парсинга Wildberries протестированы',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const formatResult = (result: any) => {
    if (!result) return 'Нет данных';
    if (result.error) return `Ошибка: ${result.error}`;
    
    return JSON.stringify(result, null, 2);
  };

  const getStepIcon = (step: DemoStep, index: number) => {
    if (step.loading) return <Spinner size="sm" />;
    if (step.completed) return <FaCheckCircle color="green" />;
    if (currentStep === index) return <FaPlay color="blue" />;
    return <Box w="16px" h="16px" bg="gray.300" borderRadius="50%" />;
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            🚀 Демонстрация реального парсинга Wildberries
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Полная демонстрация всех возможностей системы с реальными данными
          </Text>
        </Box>

        {/* Кнопки управления */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <HStack justify="center" spacing={4}>
              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<FaRocket />}
                onClick={runFullDemo}
                isLoading={isRunningDemo}
                loadingText="Выполняется демонстрация..."
              >
                🎬 Запустить полную демонстрацию
              </Button>
              
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={() => window.open('/real-wb-parsing', '_blank')}
              >
                🌐 Открыть интерактивный парсинг
              </Button>
              
              <Button
                colorScheme="purple"
                variant="outline"
                onClick={() => window.open('/automation', '_blank')}
              >
                🤖 Открыть автоматизацию
              </Button>
            </HStack>

            {isRunningDemo && (
              <Box mt={4}>
                <Text mb={2} textAlign="center">
                  Прогресс демонстрации: {Math.round(demoProgress)}%
                </Text>
                <Progress value={demoProgress} colorScheme="green" />
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Шаги демонстрации */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {demoSteps.map((step, index) => (
            <Card key={step.id} bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    {getStepIcon(step, index)}
                    <Heading size="md">{step.title}</Heading>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => runSingleStep(index)}
                    isLoading={step.loading}
                    isDisabled={isRunningDemo}
                  >
                    Запустить
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color="gray.600">
                    {step.description}
                  </Text>
                  
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1}>
                      Endpoint:
                    </Text>
                    <Code fontSize="xs" p={2} borderRadius="md" w="100%">
                      {step.method} {step.endpoint}
                    </Code>
                  </Box>

                  {step.payload && (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" mb={1}>
                        Payload:
                      </Text>
                      <Code fontSize="xs" p={2} borderRadius="md" w="100%">
                        {JSON.stringify(step.payload, null, 2)}
                      </Code>
                    </Box>
                  )}

                  {step.result && (
                    <Accordion allowToggle>
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontSize="xs" fontWeight="bold">
                              Результат {step.completed ? '✅' : '❌'}
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Code 
                            fontSize="xs" 
                            p={2} 
                            borderRadius="md" 
                            w="100%" 
                            maxH="200px" 
                            overflowY="auto"
                            whiteSpace="pre-wrap"
                          >
                            {formatResult(step.result).substring(0, 1000)}
                            {formatResult(step.result).length > 1000 && '...'}
                          </Code>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Статистика демонстрации */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">📊 Статистика демонстрации</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Stat>
                <StatLabel>Всего шагов</StatLabel>
                <StatNumber>{demoSteps.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Выполнено</StatLabel>
                <StatNumber color="green.500">
                  {demoSteps.filter(s => s.completed).length}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>В процессе</StatLabel>
                <StatNumber color="blue.500">
                  {demoSteps.filter(s => s.loading).length}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Успешность</StatLabel>
                <StatNumber color="green.500">
                  {demoSteps.length > 0 
                    ? Math.round((demoSteps.filter(s => s.completed).length / demoSteps.length) * 100)
                    : 0}%
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Информация о возможностях */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>🎯 Что демонстрирует эта страница:</AlertTitle>
            <AlertDescription>
              <VStack align="start" spacing={1} mt={2}>
                <Text>• Реальный парсинг товаров с Wildberries без mock данных</Text>
                <Text>• Продвинутую систему защиты от блокировок с интеллектуальными задержками</Text>
                <Text>• Автоматическое ценообразование на основе анализа конкурентов</Text>
                <Text>• Кеширование и оптимизацию запросов для повышения производительности</Text>
                <Text>• Мониторинг и аналитику всех операций парсинга</Text>
              </VStack>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Container>
  );
};

export default WBDemoPage;
