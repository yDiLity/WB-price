import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Progress,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useColorModeValue,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import { FaSearch, FaShieldAlt, FaRobot, FaChartLine, FaEye, FaDownload } from 'react-icons/fa';

interface WBProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount: number;
  rating: number;
  feedbacks: number;
  supplier: string;
  source: string;
  lastUpdated: string;
  parseMethod?: string;
  note?: string;
  isBlocked?: boolean;
}

interface AntibanStatus {
  status: string;
  mode: string;
  requestsLastMinute: number;
  maxRequestsPerMinute: number;
  remainingRequests: number;
  banDetectionCount: number;
  protection: any;
  stats: any;
}

const RealWBParsingPage: React.FC = () => {
  const [productId, setProductId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<WBProduct | null>(null);
  const [searchResults, setSearchResults] = useState<WBProduct[]>([]);
  const [antibanStatus, setAntibanStatus] = useState<AntibanStatus | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Загружаем статус защиты при загрузке страницы
  useEffect(() => {
    loadAntibanStatus();
    const interval = setInterval(loadAntibanStatus, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const loadAntibanStatus = async () => {
    try {
      const response = await fetch('/api/wb/antiban-status');
      if (response.ok) {
        const data = await response.json();
        setAntibanStatus(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса защиты:', error);
    }
  };

  const handleProductSearch = async () => {
    if (!productId.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите артикул товара',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setProduct(null);

    try {
      // Сначала пробуем прямой API
      let response = await fetch(`/api/wb/product/${productId.trim()}`);
      let data = null;

      if (response.ok) {
        data = await response.json();
        console.log('✅ Товар найден через прямой API');
      } else {
        // Если прямой API не работает, ищем через поиск по артикулу
        console.log('⚠️ Прямой API не сработал, пробуем поиск по артикулу...');

        const searchResponse = await fetch(`/api/wb/search?q=${productId.trim()}&limit=50`);

        if (searchResponse.status === 429) {
          toast({
            title: 'Лимит запросов',
            description: 'Превышен лимит запросов к Wildberries. Попробуйте позже.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        if (searchResponse.status === 503) {
          toast({
            title: 'Временная блокировка',
            description: 'Обнаружена блокировка Wildberries. Система переключилась в защитный режим.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          // Ищем товар с точным совпадением ID
          const exactMatch = searchData.products?.find((product: any) =>
            product.id.toString() === productId.trim()
          );

          if (exactMatch) {
            // Преобразуем данные из поиска в формат детального товара
            data = {
              ...exactMatch,
              source: 'SEARCH_BY_ARTICLE',
              parseMethod: 'search_fallback'
            };
            console.log('✅ Товар найден через поиск по артикулу');
          } else {
            console.log('❌ Товар с точным артикулом не найден');
          }
        }
      }

      if (data) {
        setProduct(data);

        // Проверяем, заблокированы ли данные
        if (data.isBlocked || data.source === 'FALLBACK_DATA') {
          toast({
            title: 'Данные временно недоступны',
            description: `Wildberries блокирует запросы. Артикул ${productId.trim()} существует, но данные недоступны.`,
            status: 'warning',
            duration: 7000,
            isClosable: true,
          });
        } else {
          const successMessage = data.source === 'SEARCH_BY_ARTICLE'
            ? `Товар найден через поиск: "${data.name}"`
            : `Товар найден: "${data.name}"`;

          toast({
            title: 'Товар найден!',
            description: successMessage,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }

      } else {
        toast({
          title: 'Товар не найден',
          description: `Товар с артикулом ${productId.trim()} не найден на Wildberries`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Ошибка поиска товара:', error);
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось подключиться к серверу',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      loadAntibanStatus(); // Обновляем статус после запроса
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите поисковый запрос',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/wb/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products || []);
        toast({
          title: 'Поиск завершен',
          description: `Найдено ${data.products?.length || 0} товаров`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось выполнить поиск',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      loadAntibanStatus();
    }
  };

  const runProtectionTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wb/test-protection');
      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
        toast({
          title: 'Тест завершен',
          description: `Результат: ${data.overall}`,
          status: data.overall === 'PASSED' ? 'success' : data.overall === 'WARNING' ? 'warning' : 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка теста',
        description: 'Не удалось выполнить тест защиты',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'green';
      case 'WARNING': return 'yellow';
      case 'FAILED': return 'red';
      case 'LIMITED': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            🌐 Реальный парсинг Wildberries
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Полнофункциональная система парсинга с защитой от блокировок
          </Text>
        </Box>

        {/* Статус системы защиты */}
        {antibanStatus && (
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <FaShieldAlt />
                <Heading size="md">Статус системы защиты</Heading>
                <Badge colorScheme={antibanStatus.status === 'emergency' ? 'red' : 'green'}>
                  {antibanStatus.mode}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Запросы/минуту</StatLabel>
                  <StatNumber>{antibanStatus.requestsLastMinute}/{antibanStatus.maxRequestsPerMinute}</StatNumber>
                  <StatHelpText>Осталось: {antibanStatus.remainingRequests}</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Обнаружено банов</StatLabel>
                  <StatNumber>{antibanStatus.banDetectionCount}</StatNumber>
                  <StatHelpText>Всего за сессию</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Кеш</StatLabel>
                  <StatNumber>{antibanStatus.stats?.cacheSize || 0}</StatNumber>
                  <StatHelpText>Записей в кеше</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Прокси</StatLabel>
                  <StatNumber>{antibanStatus.stats?.activeProxies || 0}/{antibanStatus.stats?.totalProxies || 0}</StatNumber>
                  <StatHelpText>Активных/Всего</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Основные функции */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab><FaSearch /> Поиск товара</Tab>
            <Tab><FaEye /> Поиск по запросу</Tab>
            <Tab><FaShieldAlt /> Тест защиты</Tab>
            <Tab><FaChartLine /> Аналитика</Tab>
          </TabList>

          <TabPanels>
            {/* Поиск товара по ID */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Артикул товара Wildberries</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Например: 244826784"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    />
                    <Button
                      colorScheme="blue"
                      onClick={handleProductSearch}
                      isLoading={loading}
                      leftIcon={<FaSearch />}
                    >
                      Найти
                    </Button>
                  </HStack>
                </FormControl>

                {product && (
                  <Card borderColor={product.isBlocked ? 'orange.300' : borderColor}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="md">{product.name}</Heading>
                        {product.isBlocked && (
                          <Badge colorScheme="orange">Заблокировано</Badge>
                        )}
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      {product.isBlocked ? (
                        <Alert status="warning">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Данные временно недоступны</AlertTitle>
                            <AlertDescription>
                              {product.note}
                              <br />
                              <Text mt={2} fontSize="sm">
                                <strong>Артикул:</strong> {product.id}
                                <br />
                                <strong>Источник:</strong> {product.source}
                                <br />
                                <strong>Метод:</strong> {product.parseMethod}
                              </Text>
                            </AlertDescription>
                          </Box>
                        </Alert>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <VStack align="start" spacing={2}>
                            <Text><strong>Бренд:</strong> {product.brand}</Text>
                            <Text><strong>Цена:</strong> {product.price} ₽</Text>
                            {product.originalPrice && (
                              <Text><strong>Старая цена:</strong> {product.originalPrice} ₽</Text>
                            )}
                            <Text><strong>Скидка:</strong> {product.discount}%</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text><strong>Рейтинг:</strong> {product.rating}</Text>
                            <Text><strong>Отзывы:</strong> {product.feedbacks}</Text>
                            <Text><strong>Продавец:</strong> {product.supplier}</Text>
                            <Badge colorScheme="green">{product.source}</Badge>
                          </VStack>
                        </SimpleGrid>
                      )}
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Поиск по запросу */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Поисковый запрос</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Например: iPhone 15"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      colorScheme="blue"
                      onClick={handleSearch}
                      isLoading={loading}
                      leftIcon={<FaSearch />}
                    >
                      Искать
                    </Button>
                  </HStack>
                </FormControl>

                {searchResults.length > 0 && (
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Название</Th>
                          <Th>Бренд</Th>
                          <Th>Цена</Th>
                          <Th>Рейтинг</Th>
                          <Th>Отзывы</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {searchResults.slice(0, 10).map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.name.substring(0, 50)}...</Td>
                            <Td>{item.brand}</Td>
                            <Td>{item.price} ₽</Td>
                            <Td>{item.rating}</Td>
                            <Td>{item.feedbacks}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </VStack>
            </TabPanel>

            {/* Тест защиты */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Button
                  colorScheme="purple"
                  onClick={runProtectionTest}
                  isLoading={loading}
                  leftIcon={<FaRobot />}
                  size="lg"
                >
                  Запустить полный тест системы защиты
                </Button>

                {testResults && (
                  <Card>
                    <CardHeader>
                      <HStack>
                        <Heading size="md">Результаты тестирования</Heading>
                        <Badge colorScheme={getStatusColor(testResults.overall)}>
                          {testResults.overall}
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {testResults.tests?.map((test: any, index: number) => (
                          <Box key={index} p={4} border="1px" borderColor={borderColor} borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="bold">{test.name}</Text>
                              <Badge colorScheme={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {JSON.stringify(test.details, null, 2)}
                            </Text>
                          </Box>
                        ))}
                        
                        {testResults.recommendations?.length > 0 && (
                          <Alert status="info">
                            <AlertIcon />
                            <Box>
                              <AlertTitle>Рекомендации:</AlertTitle>
                              <AlertDescription>
                                <VStack align="start" spacing={1}>
                                  {testResults.recommendations.map((rec: string, index: number) => (
                                    <Text key={index}>• {rec}</Text>
                                  ))}
                                </VStack>
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Аналитика */}
            <TabPanel>
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Система аналитики</AlertTitle>
                  <AlertDescription>
                    Здесь будет отображаться детальная аналитика парсинга, статистика успешности запросов,
                    анализ блокировок и рекомендации по оптимизации.
                  </AlertDescription>
                </Box>
              </Alert>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default RealWBParsingPage;
