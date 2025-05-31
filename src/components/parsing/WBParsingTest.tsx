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
  Select,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Image,
  Tooltip,
  Flex,
  Divider,
  Spinner
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaSearch, FaShoppingCart, FaStar, FaEye, FaDownload } from 'react-icons/fa';
import { wbParsingService, WBProduct, WBSearchParams } from '../../services/wbParsingService';

export default function WBParsingTest() {
  const [searchQuery, setSearchQuery] = useState('iPhone 15');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WBProduct[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<WBProduct | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите поисковый запрос',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setSearchStats(null);

    try {
      const searchParams: WBSearchParams = {
        query: searchQuery,
        limit: 20,
        sort: 'popular'
      };

      const result = await wbParsingService.searchProducts(searchParams);

      if (result.success) {
        setResults(result.products);
        setSearchStats({
          totalFound: result.totalFound,
          searchTime: result.searchTime,
          currentPage: result.currentPage,
          totalPages: result.totalPages
        });

        toast({
          title: '✅ Поиск завершен',
          description: `Найдено ${result.products.length} товаров за ${result.searchTime}ms`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        throw new Error(result.error || 'Ошибка поиска');
      }

    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast({
        title: '❌ Ошибка поиска',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDetails = async (productId: string) => {
    setIsLoadingDetails(true);

    try {
      const product = await wbParsingService.getProductDetails(productId);

      if (product) {
        setSelectedProduct(product);
        toast({
          title: '✅ Детали получены',
          description: `Загружена информация о товаре: ${product.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Товар не найден');
      }

    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось получить детали товара',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStockBadge = (inStock: boolean) => {
    return (
      <Badge colorScheme={inStock ? 'green' : 'red'} size="sm">
        {inStock ? '✅ В наличии' : '❌ Нет в наличии'}
      </Badge>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="lg" color="purple.600">
            🕷️ Тестирование парсинга Wildberries
          </Heading>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Проверка работы системы парсинга с защитой от блокировок
          </Text>
        </CardHeader>
      </Card>

      {/* Форма поиска */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">🔍 Поиск товаров</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Поисковый запрос</FormLabel>
              <HStack>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите название товара..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  colorScheme="blue"
                  leftIcon={<FaSearch />}
                  onClick={handleSearch}
                  isLoading={isLoading}
                  loadingText="Поиск..."
                  className="purple-button-border"
                >
                  Найти
                </Button>
              </HStack>
            </FormControl>

            {isLoading && (
              <Alert status="info" className="purple-alert-border">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <AlertTitle>🔍 Выполняется поиск...</AlertTitle>
                  <AlertDescription>
                    Система применяет защиту от блокировок и ищет товары на Wildberries
                  </AlertDescription>
                  <Progress size="sm" isIndeterminate colorScheme="blue" width="100%" />
                </VStack>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Статистика поиска */}
      {searchStats && (
        <Card className="purple-card-border" bg={cardBg}>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {searchStats.totalFound}
                </Text>
                <Text fontSize="sm" color="gray.600">Найдено товаров</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {searchStats.searchTime}ms
                </Text>
                <Text fontSize="sm" color="gray.600">Время поиска</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {searchStats.currentPage}
                </Text>
                <Text fontSize="sm" color="gray.600">Текущая страница</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {results.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Загружено</Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Результаты поиска */}
      {results.length > 0 && (
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">📦 Результаты поиска</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {results.map((product, index) => (
                <Card
                  key={product.id}
                  className="purple-card-border"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => handleGetDetails(product.id)}
                >
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                      {/* Изображение */}
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          height="150px"
                          objectFit="cover"
                          borderRadius="md"
                          fallback={
                            <Flex
                              height="150px"
                              align="center"
                              justify="center"
                              bg="gray.100"
                              borderRadius="md"
                            >
                              <Text color="gray.500">Нет фото</Text>
                            </Flex>
                          }
                        />
                      )}

                      {/* Информация о товаре */}
                      <VStack spacing={2} align="stretch">
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          noOfLines={2}
                          title={product.name}
                        >
                          {product.name}
                        </Text>

                        <HStack justify="space-between">
                          <VStack spacing={0} align="start">
                            <Text fontSize="lg" fontWeight="bold" color="green.500">
                              {formatPrice(product.price)}
                            </Text>
                            {product.oldPrice && (
                              <Text fontSize="sm" as="s" color="gray.500">
                                {formatPrice(product.oldPrice)}
                              </Text>
                            )}
                          </VStack>
                          <Badge colorScheme="blue" size="sm">
                            #{index + 1}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between" fontSize="sm">
                          <HStack>
                            <FaStar color="orange" />
                            <Text>{product.rating.toFixed(1)}</Text>
                            <Text color="gray.500">({product.reviewCount})</Text>
                          </HStack>
                          {getStockBadge(product.inStock)}
                        </HStack>

                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {product.seller}
                        </Text>

                        <Button
                          size="sm"
                          colorScheme="purple"
                          leftIcon={<FaEye />}
                          isLoading={isLoadingDetails}
                          className="purple-button-border"
                        >
                          Подробнее
                        </Button>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Детали выбранного товара */}
      {selectedProduct && (
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">🔍 Детали товара</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Изображения */}
              <VStack spacing={4}>
                {selectedProduct.images[0] && (
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    maxHeight="300px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                )}

                {selectedProduct.images.length > 1 && (
                  <HStack spacing={2} overflowX="auto" width="100%">
                    {selectedProduct.images.slice(1, 5).map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`${selectedProduct.name} ${index + 2}`}
                        height="60px"
                        width="60px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                      />
                    ))}
                  </HStack>
                )}
              </VStack>

              {/* Информация */}
              <VStack spacing={4} align="stretch">
                <Heading size="md">{selectedProduct.name}</Heading>

                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {formatPrice(selectedProduct.price)}
                    </Text>
                    {selectedProduct.oldPrice && (
                      <Text fontSize="lg" as="s" color="gray.500">
                        {formatPrice(selectedProduct.oldPrice)}
                      </Text>
                    )}
                  </VStack>
                  {getStockBadge(selectedProduct.inStock)}
                </HStack>

                <Divider />

                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Рейтинг:</Text>
                    <HStack>
                      <FaStar color="orange" />
                      <Text>{selectedProduct.rating.toFixed(1)}</Text>
                      <Text color="gray.500">({selectedProduct.reviewCount} отзывов)</Text>
                    </HStack>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">Продавец:</Text>
                    <Text>{selectedProduct.seller}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">Бренд:</Text>
                    <Text>{selectedProduct.brand}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">Категория:</Text>
                    <Text>{selectedProduct.category}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="bold">ID товара:</Text>
                    <Text fontFamily="mono">{selectedProduct.id}</Text>
                  </HStack>
                </VStack>

                <Button
                  as="a"
                  href={selectedProduct.url}
                  target="_blank"
                  colorScheme="blue"
                  leftIcon={<FaShoppingCart />}
                  className="purple-button-border"
                >
                  Открыть на WB
                </Button>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Информация о защите */}
      <Alert status="info" className="purple-alert-border">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <AlertTitle>🛡️ Система защиты активна</AlertTitle>
          <AlertDescription>
            <Text fontSize="sm">
              Все запросы выполняются с применением 7-уровневой защиты от блокировок:
              эмуляция мобильных устройств, ротация прокси, человеческие паттерны,
              деконструкция API, анти-отладка, гео-распределение и экстренные протоколы.
            </Text>
          </AlertDescription>
        </VStack>
      </Alert>
    </VStack>
  );
}
