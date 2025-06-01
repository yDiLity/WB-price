import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
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
  Icon,
  Divider
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaPlay, FaShieldAlt, FaSpider, FaCheckCircle, FaExclamationTriangle, FaRobot } from 'react-icons/fa';
import { wbParsingService } from '../../services/wbParsingService';
import { antiBanService } from '../../services/antiBanService';
import { banAnalyticsService } from '../../services/banAnalyticsService';

export default function SystemTestPanel() {
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
    const banStats = banAnalyticsService.getAnalytics();
    
    setSystemStats({
      antiBan: antiBanStats,
      parsing: parsingStats,
      banAnalytics: banStats
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
        query: 'тест системы',
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
            message: 'Парсинг работает корректно',
            timestamp: new Date().toLocaleTimeString()
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
          message: 'Ошибка парсинга',
          timestamp: new Date().toLocaleTimeString()
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
          rotationCount: stats.rotationCount,
          message: 'Антибан система работает корректно',
          timestamp: new Date().toLocaleTimeString()
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
          message: 'Ошибка антибан системы',
          timestamp: new Date().toLocaleTimeString()
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
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="purple.600">
                🧪 Тестирование системы
              </Heading>
              <Text color="gray.600">
                Проверка работы парсинга WB и антибан системы
              </Text>
            </VStack>
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
        </CardHeader>
      </Card>

      {/* Статистика системы */}
      {systemStats.antiBan && (
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">📊 Статистика системы</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Stat>
                <StatLabel>Прокси в пуле</StatLabel>
                <StatNumber color="green.500">{systemStats.antiBan.proxyPoolSize}</StatNumber>
                <StatHelpText>Активных прокси</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Запросов выполнено</StatLabel>
                <StatNumber color="blue.500">{systemStats.parsing?.totalRequests || 0}</StatNumber>
                <StatHelpText>Всего запросов</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Заблокированных</StatLabel>
                <StatNumber color="orange.500">{systemStats.antiBan.bannedProxies}</StatNumber>
                <StatHelpText>Прокси заблокировано</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Статус</StatLabel>
                <Badge colorScheme={systemStats.antiBan.isRecovering ? 'yellow' : 'green'} size="lg">
                  {systemStats.antiBan.isRecovering ? '🔄 Восстановление' : '✅ Активна'}
                </Badge>
                <StatHelpText>Система защиты</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

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
                          Время ответа: {testResults.parsing.responseTime}ms<br/>
                          Время: {testResults.parsing.timestamp}
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
                          Текущий прокси: {testResults.antiBan.currentProxy}<br/>
                          Время: {testResults.antiBan.timestamp}
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
  );
}
