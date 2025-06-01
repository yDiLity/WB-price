import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  useToast,
  Spinner,
  Badge,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Divider
} from '@chakra-ui/react';
import { useState } from 'react';
import { wildberriesApi } from '../services/wildberriesApi';
import { useAuth } from '../context/AuthContext';

export default function WildberriesApiTestPage() {
  const [apiKey, setApiKey] = useState('');
  const [productId, setProductId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.500', 'blue.300');
  const { user, updateUser } = useAuth();

  // Функция для принудительного исправления роли
  const fixUserRole = async () => {
    if (user && user.username === 'demo' && user.role !== 'seller') {
      try {
        await updateUser({ role: 'seller' });
        toast({
          title: 'Роль исправлена!',
          description: 'Роль demo пользователя изменена на "Продавец"',
          status: 'success',
          duration: 3000,
        });
        window.location.reload();
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось исправить роль',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  // Функция для смены роли на админа
  const makeAdmin = async () => {
    if (user) {
      try {
        await updateUser({ role: 'admin' });
        toast({
          title: 'Роль изменена!',
          description: `Пользователь ${user.username} теперь администратор`,
          status: 'success',
          duration: 3000,
        });
        window.location.reload();
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось изменить роль',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите API ключ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    wildberriesApi.setApiKey(apiKey);
    toast({
      title: 'API ключ установлен',
      description: 'Теперь можно тестировать методы API',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const testApiMethod = async (methodName: string, method: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log(`🧪 Тестируем метод: ${methodName}`);
      const result = await method();
      setResults({ method: methodName, data: result });

      toast({
        title: 'Успех!',
        description: `Метод ${methodName} выполнен успешно`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);

      toast({
        title: 'Ошибка API',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const apiMethods = [
    // Методы с API ключом
    {
      name: 'getCategories',
      label: '📂 Получить категории (TNVED)',
      description: 'Получение списка категорий товаров',
      method: () => wildberriesApi.getCategories(),
      requiresApiKey: true
    },
    {
      name: 'getSubjects',
      label: '📋 Получить предметы',
      description: 'Получение списка предметов (subjects)',
      method: () => wildberriesApi.getSubjects(),
      requiresApiKey: true
    },
    {
      name: 'getProducts',
      label: '🛒 Получить товары',
      description: 'Получение списка ваших товаров',
      method: () => wildberriesApi.getProducts(10, 0),
      requiresApiKey: true
    },
    {
      name: 'getPrices',
      label: '💰 Получить цены',
      description: 'Получение информации о ценах',
      method: () => wildberriesApi.getPrices(),
      requiresApiKey: true
    },
    {
      name: 'getStocks',
      label: '📦 Получить остатки',
      description: 'Получение остатков товаров',
      method: () => wildberriesApi.getStocks(),
      requiresApiKey: true
    },
    {
      name: 'getWarehouses',
      label: '🏪 Получить склады',
      description: 'Получение информации о складах',
      method: () => wildberriesApi.getWarehouses(),
      requiresApiKey: true
    }
  ];

  const publicApiMethods = [
    // Публичные методы (без API ключа)
    {
      name: 'getPublicProductById',
      label: '🌐 Получить товар по ID',
      description: 'Публичное API: данные о товаре без ключа',
      method: () => {
        if (!productId) {
          throw new Error('Введите ID товара');
        }
        return wildberriesApi.getPublicProductById(parseInt(productId));
      },
      requiresApiKey: false
    },
    {
      name: 'publicSearchProducts',
      label: '🔍 Поиск товаров',
      description: 'Публичное API: поиск товаров без ключа',
      method: () => {
        if (!searchQuery) {
          throw new Error('Введите поисковый запрос');
        }
        return wildberriesApi.publicSearchProducts(searchQuery, 1);
      },
      requiresApiKey: false
    },
    {
      name: 'getPublicPriceHistory',
      label: '💰 История цен',
      description: 'Публичное API: история цен товара',
      method: () => {
        if (!productId) {
          throw new Error('Введите ID товара');
        }
        return wildberriesApi.getPublicPriceHistory(parseInt(productId));
      },
      requiresApiKey: false
    },
    {
      name: 'getPublicSellerInfo',
      label: '🏪 Информация о продавце',
      description: 'Публичное API: данные о продавце',
      method: () => {
        if (!productId) {
          throw new Error('Введите ID товара');
        }
        return wildberriesApi.getPublicSellerInfo(parseInt(productId));
      },
      requiresApiKey: false
    }
  ];

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box textAlign="center">
          <Heading size="xl" color="blue.600" mb={2}>
            🧪 Тестирование Wildberries API
          </Heading>
          <Text color="gray.600">
            Проверьте работу методов API Wildberries
          </Text>
        </Box>

        {/* Предупреждение о неправильной роли */}
        {user && user.username === 'demo' && user.role !== 'seller' && (
          <Alert status="warning">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Неправильная роль пользователя!</AlertTitle>
              <AlertDescription>
                У demo пользователя роль "{user.role}", а должна быть "seller" для доступа к функциям.
              </AlertDescription>
            </Box>
            <Button colorScheme="orange" size="sm" onClick={fixUserRole}>
              Исправить роль
            </Button>
          </Alert>
        )}

        {/* Панель управления ролями */}
        {user && (
          <Card bg={bgColor} borderWidth="2px" borderColor="purple.300">
            <CardHeader>
              <Heading size="md">👑 Управление ролями</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Alert status="info">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Текущий пользователь:</AlertTitle>
                    <AlertDescription>
                      <strong>{user.username}</strong> с ролью <strong>"{user.role}"</strong>
                    </AlertDescription>
                  </Box>
                </Alert>

                <HStack spacing={4}>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={makeAdmin}
                    isDisabled={user.role === 'admin'}
                  >
                    👑 Стать администратором
                  </Button>

                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => updateUser({ role: 'seller' })}
                    isDisabled={user.role === 'seller'}
                  >
                    🛒 Стать продавцом
                  </Button>

                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => updateUser({ role: 'manager' })}
                    isDisabled={user.role === 'manager'}
                  >
                    📊 Стать менеджером
                  </Button>
                </HStack>

                <Text fontSize="sm" color="gray.500">
                  Нажмите кнопку для смены роли. Страница перезагрузится автоматически.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Настройка API ключа */}
        <Card bg={bgColor} borderWidth="2px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">🔑 Настройка и параметры</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>API ключ Wildberries (для приватных методов)</FormLabel>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Введите ваш API ключ"
                  type="password"
                />
              </FormControl>
              <Button colorScheme="blue" onClick={handleSetApiKey}>
                Установить API ключ
              </Button>

              <Divider />

              <FormControl>
                <FormLabel>ID товара (для публичных методов)</FormLabel>
                <Input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Например: 123456789"
                  type="number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Поисковый запрос</FormLabel>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Например: iPhone 15"
                />
              </FormControl>

              {wildberriesApi.hasApiKey() && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle>API ключ установлен!</AlertTitle>
                  <AlertDescription>
                    Можно тестировать приватные методы API
                  </AlertDescription>
                </Alert>
              )}

              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  Публичные методы работают без API ключа!
                </AlertDescription>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Публичные методы API */}
        <Card bg={bgColor} borderWidth="2px" borderColor="green.300">
          <CardHeader>
            <Heading size="md">🌐 Публичное API (без ключа)</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {publicApiMethods.map((apiMethod) => (
                <Card key={apiMethod.name} variant="outline" borderColor="green.200">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Text fontWeight="bold" color="green.600">{apiMethod.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {apiMethod.description}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="green"
                        isLoading={isLoading}
                        onClick={() => testApiMethod(apiMethod.name, apiMethod.method)}
                      >
                        Тестировать
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Приватные методы API */}
        <Card bg={bgColor} borderWidth="2px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">🔐 Приватное API (с ключом)</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {apiMethods.map((apiMethod) => (
                <Card key={apiMethod.name} variant="outline">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Text fontWeight="bold">{apiMethod.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {apiMethod.description}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        isLoading={isLoading}
                        isDisabled={!wildberriesApi.hasApiKey()}
                        onClick={() => testApiMethod(apiMethod.name, apiMethod.method)}
                      >
                        Тестировать
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Результаты */}
        {(results || error) && (
          <Card bg={bgColor} borderWidth="2px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">📊 Результаты</Heading>
                {isLoading && <Spinner size="sm" />}
              </HStack>
            </CardHeader>
            <CardBody>
              {error && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  <AlertTitle>Ошибка!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {results && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Badge colorScheme="green">Метод:</Badge>
                    <Code>{results.method}</Code>
                  </HStack>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={2}>Данные:</Text>
                    <Box
                      bg="gray.50"
                      p={4}
                      borderRadius="md"
                      maxH="400px"
                      overflowY="auto"
                    >
                      <Code display="block" whiteSpace="pre-wrap">
                        {JSON.stringify(results.data, null, 2)}
                      </Code>
                    </Box>
                  </Box>
                </VStack>
              )}
            </CardBody>
          </Card>
        )}

        {/* Инструкции */}
        <Card bg={bgColor} borderWidth="2px" borderColor="orange.300">
          <CardHeader>
            <Heading size="md">📖 Инструкции</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text fontWeight="bold" color="green.600">
                🌐 Публичное API (работает сразу):
              </Text>
              <Text>
                <strong>1.</strong> Введите ID товара (например: 123456789 из URL https://www.wildberries.ru/catalog/123456789/detail.aspx)
              </Text>
              <Text>
                <strong>2.</strong> Или введите поисковый запрос (например: "iPhone 15")
              </Text>
              <Text>
                <strong>3.</strong> Нажмите зеленые кнопки для тестирования публичных методов
              </Text>

              <Divider />

              <Text fontWeight="bold" color="blue.600">
                🔐 Приватное API (требует ключ):
              </Text>
              <Text>
                <strong>1.</strong> Получите API ключ в личном кабинете Wildberries
              </Text>
              <Text>
                <strong>2.</strong> Введите API ключ в поле выше
              </Text>
              <Text>
                <strong>3.</strong> Нажмите синие кнопки для тестирования приватных методов
              </Text>

              <Alert status="success">
                <AlertIcon />
                <AlertDescription>
                  <strong>Публичное API</strong> позволяет получать данные о товарах без регистрации!
                </AlertDescription>
              </Alert>

              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  Все запросы выполняются через безопасный сервис с защитой от блокировок
                </AlertDescription>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
