import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useColorModeValue,
  useToast,
  Divider,
  Link,
  Code
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaKey, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { wbApiService, WBApiCredentials } from '../../services/wbApi';

export default function WBApiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    loadApiStatus();
  }, []);

  const loadApiStatus = () => {
    const status = wbApiService.getStatus();
    setApiStatus(status);
  };

  const handleSaveCredentials = async () => {
    if (!apiKey.trim() || !supplierId.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);

    try {
      const credentials: WBApiCredentials = {
        apiKey: apiKey.trim(),
        supplierId: supplierId.trim(),
        isValid: true
      };

      wbApiService.initialize(credentials);
      loadApiStatus();

      toast({
        title: '✅ Настройки сохранены',
        description: 'API ключи Wildberries успешно настроены',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      // Автоматически тестируем подключение
      await handleTestConnection();

    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось сохранить настройки',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTest(null);

    try {
      const result = await wbApiService.testConnection();
      setConnectionTest(result);

      if (result.success) {
        toast({
          title: '✅ Подключение успешно',
          description: `Время ответа: ${result.responseTime}ms`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: '❌ Ошибка подключения',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }

    } catch (error) {
      setConnectionTest({
        success: false,
        message: 'Ошибка тестирования подключения'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleDisconnect = () => {
    wbApiService.disconnect();
    setApiKey('');
    setSupplierId('');
    setConnectionTest(null);
    loadApiStatus();

    toast({
      title: '🔌 API отключен',
      description: 'Подключение к Wildberries API разорвано',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <FaKey color="purple" />
            <Heading size="lg" color="purple.600">
              🔗 Настройка Wildberries API
            </Heading>
            {apiStatus?.isInitialized && (
              <Badge colorScheme="green" size="sm">
                Подключено
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Настройте подключение к официальному API Wildberries для автоматического управления ценами
          </Text>
        </CardHeader>
      </Card>

      {/* Инструкция */}
      <Alert status="info" className="purple-alert-border">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <AlertTitle>📋 Как получить API ключи Wildberries</AlertTitle>
          <AlertDescription>
            <VStack align="start" spacing={1} fontSize="sm">
              <Text>1. Перейдите в личный кабинет продавца Wildberries</Text>
              <Text>2. Откройте раздел "Настройки" → "Доступ к API"</Text>
              <Text>3. Создайте новый API ключ с правами на управление товарами</Text>
              <Text>4. Скопируйте API ключ и ID поставщика</Text>
              <Link 
                href="https://seller.wildberries.ru/supplier-settings/access-to-api" 
                isExternal 
                color="blue.500"
              >
                Открыть настройки API <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
              </Link>
            </VStack>
          </AlertDescription>
        </VStack>
      </Alert>

      {/* Форма настроек */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">🔑 API Credentials</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>API ключ</FormLabel>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите API ключ Wildberries..."
                className="purple-input-border"
              />
              <FormHelperText>
                Получите в личном кабинете WB в разделе "Доступ к API"
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>ID поставщика</FormLabel>
              <Input
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="Введите ID поставщика..."
                className="purple-input-border"
              />
              <FormHelperText>
                Ваш уникальный идентификатор поставщика в системе WB
              </FormHelperText>
            </FormControl>

            <HStack spacing={4}>
              <Button
                colorScheme="green"
                onClick={handleSaveCredentials}
                isLoading={isLoading}
                loadingText="Сохранение..."
                className="purple-button-border"
              >
                Сохранить настройки
              </Button>

              {apiStatus?.isInitialized && (
                <>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleTestConnection}
                    isLoading={isTestingConnection}
                    loadingText="Тестирование..."
                    className="purple-button-border"
                  >
                    Тест подключения
                  </Button>

                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={handleDisconnect}
                    className="purple-button-border"
                  >
                    Отключить
                  </Button>
                </>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Статус подключения */}
      {apiStatus && (
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">📊 Статус подключения</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold">Статус API:</Text>
                <Badge colorScheme={apiStatus.isInitialized ? 'green' : 'red'}>
                  {apiStatus.isInitialized ? (
                    <HStack spacing={1}>
                      <FaCheck />
                      <Text>Подключено</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={1}>
                      <FaTimes />
                      <Text>Не подключено</Text>
                    </HStack>
                  )}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold">Базовый URL:</Text>
                <Code fontSize="sm">{apiStatus.baseUrl}</Code>
              </HStack>

              {apiStatus.supplierId && (
                <HStack justify="space-between">
                  <Text fontWeight="bold">ID поставщика:</Text>
                  <Code fontSize="sm">{apiStatus.supplierId}</Code>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Результат тестирования */}
      {connectionTest && (
        <Alert 
          status={connectionTest.success ? 'success' : 'error'} 
          className="purple-alert-border"
        >
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>
              {connectionTest.success ? '✅ Тест пройден' : '❌ Тест не пройден'}
            </AlertTitle>
            <AlertDescription>
              <Text fontSize="sm">{connectionTest.message}</Text>
              {connectionTest.responseTime && (
                <Text fontSize="sm" color="gray.600">
                  Время ответа: {connectionTest.responseTime}ms
                </Text>
              )}
            </AlertDescription>
          </VStack>
        </Alert>
      )}

      {/* Возможности API */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">🚀 Возможности Wildberries API</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch" fontSize="sm">
            <Text>• 📦 Получение списка ваших товаров</Text>
            <Text>• 💰 Автоматическое обновление цен</Text>
            <Text>• 📊 Статистика продаж и остатков</Text>
            <Text>• 📈 Аналитика эффективности</Text>
            <Text>• 🔄 Синхронизация данных в реальном времени</Text>
            <Text>• 📋 Управление карточками товаров</Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Предупреждение */}
      <Alert status="warning" className="purple-alert-border">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <AlertTitle>⚠️ Важная информация</AlertTitle>
          <AlertDescription>
            <Text fontSize="sm">
              • <strong>Храните API ключи в безопасности</strong> - не передавайте их третьим лицам<br/>
              • <strong>Соблюдайте лимиты API</strong> - не превышайте разрешенное количество запросов<br/>
              • <strong>Мониторьте активность</strong> - регулярно проверяйте логи использования API<br/>
              • <strong>Обновляйте ключи</strong> - периодически генерируйте новые API ключи
            </Text>
          </AlertDescription>
        </VStack>
      </Alert>
    </VStack>
  );
}
