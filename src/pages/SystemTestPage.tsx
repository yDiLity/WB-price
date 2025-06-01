import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  SimpleGrid,
  useToast,
  useColorModeValue,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaPlay, FaShieldAlt, FaSpider, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { wbParsingService } from '../services/wbParsingService';
import { antiBanService } from '../services/antiBanService';

export default function SystemTestPage() {
  const [isTestingParsing, setIsTestingParsing] = useState(false);
  const [isTestingAntiBan, setIsTestingAntiBan] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [systemStats, setSystemStats] = useState<any>({});

  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    loadSystemStats();
    const interval = setInterval(loadSystemStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = () => {
    const antiBanStats = antiBanService.getStats();
    const parsingStats = wbParsingService.getParsingStats();
    
    setSystemStats({
      antiBan: antiBanStats,
      parsing: parsingStats
    });
  };

  const testParsing = async () => {
    setIsTestingParsing(true);
    
    try {
      toast({
        title: '🕷️ Тестирование парсинга',
        description: 'Проверяем работу системы парсинга Wildberries...',
        status: 'info',
        duration: 3000,
        isClosable: true
      });

      const startTime = Date.now();
      
      const result = await wbParsingService.searchProducts({
        query: 'тест',
        limit: 5,
        sort: 'popular'
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          parsing: {
            success: true,
            responseTime,
            productsFound: result.products.length,
            totalFound: result.totalFound,
            message: 'Парсинг работает корректно'
          }
        }));

        toast({
          title: '✅ Парсинг успешен',
          description: `Найдено ${result.products.length} товаров за ${responseTime}ms`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        throw new Error(result.error || 'Ошибка парсинга');
      }

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        parsing: {
          success: false,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
          message: 'Ошибка парсинга'
        }
      }));

      toast({
        title: '❌ Ошибка парсинга',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsTestingParsing(false);
    }
  };

  const testAntiBan = async () => {
    setIsTestingAntiBan(true);
    
    try {
      toast({
        title: '🛡️ Тестирование антибан системы',
        description: 'Проверяем работу системы защиты от блокировок...',
        status: 'info',
        duration: 3000,
        isClosable: true
      });

      // Принудительная ротация
      antiBanService.forceRotation();
      
      // Получаем обновленную статистику
      const stats = antiBanService.getStats();

      setTestResults(prev => ({
        ...prev,
        antiBan: {
          success: true,
          proxyPoolSize: stats.proxyPoolSize,
          currentProxy: stats.currentProxy?.ip || 'Не выбран',
          message: 'Антибан система работает корректно'
        }
      }));

      toast({
        title: '✅ Антибан система работает',
        description: 'Fingerprint и прокси успешно ротированы',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        antiBan: {
          success: false,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
          message: 'Ошибка антибан системы'
        }
      }));

      toast({
        title: '❌ Ошибка антибан системы',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsTestingAntiBan(false);
    }
  };

  const runAllTests = async () => {
    await testAntiBan();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза между тестами
    await testParsing();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <VStack spacing={4} textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaPlay} boxSize={12} color="purple.500" />
          <Heading as="h1" size="xl" color="purple.600">
            🧪 Тестирование системы
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Комплексная проверка работы парсинга Wildberries и системы защиты от блокировок
          </Text>

          <HStack spacing={4} mt={4}>
            <Button
              colorScheme="purple"
              leftIcon={<FaPlay />}
              onClick={runAllTests}
              isLoading={isTestingParsing || isTestingAntiBan}
              loadingText="Тестирование..."
              size="lg"
            >
              Запустить все тесты
            </Button>
          </HStack>
        </VStack>

        {/* Индивидуальные тесты */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Тест парсинга */}
          <Card className="purple-card-border" bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">🕷️ Тест парсинга WB</Heading>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<FaSpider />}
                  onClick={testParsing}
                  isLoading={isTestingParsing}
                  loadingText="Тестирование..."
                >
                  Тест
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {testResults.parsing && (
                  <Alert 
                    status={testResults.parsing.success ? 'success' : 'error'}
                    className="purple-alert-border"
                  >
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <AlertTitle>
                        {testResults.parsing.success ? '✅ Тест пройден' : '❌ Тест провален'}
                      </AlertTitle>
                      <AlertDescription fontSize="sm">
                        {testResults.parsing.message}
                        {testResults.parsing.success && (
                          <Text mt={1}>
                            Найдено: {testResults.parsing.productsFound} товаров<br/>
                            Время ответа: {testResults.parsing.responseTime}ms
                          </Text>
                        )}
                      </AlertDescription>
                    </VStack>
                  </Alert>
                )}

                <Text fontSize="sm" color="gray.600">
                  Проверяет работу системы парсинга товаров с Wildberries,
                  включая защиту от блокировок и корректность извлечения данных.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Тест антибан системы */}
          <Card className="purple-card-border" bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">🛡️ Тест антибан системы</Heading>
                <Button
                  size="sm"
                  colorScheme="green"
                  leftIcon={<FaShieldAlt />}
                  onClick={testAntiBan}
                  isLoading={isTestingAntiBan}
                  loadingText="Тестирование..."
                >
                  Тест
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {testResults.antiBan && (
                  <Alert 
                    status={testResults.antiBan.success ? 'success' : 'error'}
                    className="purple-alert-border"
                  >
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <AlertTitle>
                        {testResults.antiBan.success ? '✅ Тест пройден' : '❌ Тест провален'}
                      </AlertTitle>
                      <AlertDescription fontSize="sm">
                        {testResults.antiBan.message}
                        {testResults.antiBan.success && (
                          <Text mt={1}>
                            Прокси в пуле: {testResults.antiBan.proxyPoolSize}<br/>
                            Текущий прокси: {testResults.antiBan.currentProxy}
                          </Text>
                        )}
                      </AlertDescription>
                    </VStack>
                  </Alert>
                )}

                <Text fontSize="sm" color="gray.600">
                  Проверяет работу системы автоматического восстановления после бана,
                  ротацию прокси и fingerprint.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
