import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  useBreakpointValue,
  Badge,
  HStack,
  VStack,
  Icon,
  Tooltip,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Card,
  CardBody,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  FaFilter,
  FaSort,
  FaPlus,
  FaSync,
  FaEye,
  FaChartLine,
  FaBoxes,
  FaRubleSign,
  FaPercentage,
  FaLayerGroup,
  FaSearch,
  FaTh,
  FaList,
  FaDownload,
  FaUpload,
} from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { useProducts } from '../context/ProductContext';
import { useAnalytics } from '../services/analytics';
import { Product } from '../types';

export default function ProductsPage() {
  const { products, filteredProducts, isLoading, error, fetchProducts } = useProducts();
  const analytics = useAnalytics();
  const toast = useToast();
  const { isOpen: isFiltersOpen, onToggle: onFiltersToggle } = useDisclosure();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Цвета для темной/светлой темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Получаем количество колонок в зависимости от размера экрана
  const columnCount = useBreakpointValue({
    base: 1,
    md: viewMode === 'grid' ? 2 : 1,
    lg: viewMode === 'grid' ? 3 : 1,
    xl: viewMode === 'grid' ? 4 : 1
  });

  // Загружаем товары при монтировании компонента
  useEffect(() => {
    fetchProducts();

    // Трекинг посещения страницы товаров
    analytics.page('Products Page', {
      feature: 'products',
      section: 'management',
    });
  }, [analytics]);

  // Фильтруем и сортируем товары при изменении фильтров, поиска или сортировки
  useEffect(() => {
    let result = [...filteredProducts];

    // Применяем поиск
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.sku.toLowerCase().includes(lowerSearchTerm) ||
        product.ozonId.toLowerCase().includes(lowerSearchTerm) ||
        product.brand.toLowerCase().includes(lowerSearchTerm) ||
        product.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Применяем сортировку
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return a.currentPrice - b.currentPrice;
        case 'price_desc':
          return b.currentPrice - a.currentPrice;
        case 'stock_asc':
          return a.stock - b.stock;
        case 'stock_desc':
          return b.stock - a.stock;
        case 'margin_asc':
          const marginA = (a.currentPrice - a.costPrice) / a.currentPrice;
          const marginB = (b.currentPrice - b.costPrice) / b.currentPrice;
          return marginA - marginB;
        case 'margin_desc':
          const marginADesc = (a.currentPrice - a.costPrice) / a.currentPrice;
          const marginBDesc = (b.currentPrice - b.costPrice) / b.currentPrice;
          return marginBDesc - marginADesc;
        default:
          return 0;
      }
    });

    setDisplayProducts(result);
  }, [filteredProducts, searchTerm, sortBy]);

  // Обработчик обновления товаров
  const handleRefresh = async () => {
    setIsRefreshing(true);
    analytics.interaction('button_click', 'refresh_products');

    try {
      await fetchProducts();
      toast({
        title: 'Товары обновлены',
        description: `Загружено ${products.length} товаров`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка обновления',
        description: 'Не удалось обновить список товаров',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Функция для расчета статистики
  const getProductStats = () => {
    const totalValue = displayProducts.reduce((sum, product) => sum + (product.currentPrice * product.stock), 0);
    const avgPrice = displayProducts.length > 0 ? displayProducts.reduce((sum, product) => sum + product.currentPrice, 0) / displayProducts.length : 0;
    const lowStockCount = displayProducts.filter(product => product.stock < 10).length;
    const totalStock = displayProducts.reduce((sum, product) => sum + product.stock, 0);

    return {
      totalValue,
      avgPrice,
      lowStockCount,
      totalStock,
    };
  };

  const stats = getProductStats();

  return (
    <Container maxW="container.xl" py={8}>
      {/* Заголовок с кнопками действий */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <VStack align="start" spacing={1}>
          <Heading as="h1" size="lg" color="primary.600" _dark={{ color: 'primary.300' }}>
            📦 Управление товарами
          </Heading>
          <Text color={textColor} fontSize="sm">
            Управляйте вашим ассортиментом и отслеживайте остатки
          </Text>
        </VStack>

        <HStack spacing={3}>
          <Tooltip label="Экспорт товаров" hasArrow>
            <IconButton
              aria-label="Экспорт"
              icon={<Icon as={FaDownload} />}
              variant="outline"
              colorScheme="blue"
              onClick={() => analytics.interaction('button_click', 'export_products')}
            />
          </Tooltip>

          <Tooltip label="Импорт товаров" hasArrow>
            <IconButton
              aria-label="Импорт"
              icon={<Icon as={FaUpload} />}
              variant="outline"
              colorScheme="green"
              onClick={() => analytics.interaction('button_click', 'import_products')}
            />
          </Tooltip>

          <Button
            leftIcon={<Icon as={FaPlus} />}
            colorScheme="green"
            onClick={() => analytics.interaction('button_click', 'add_product')}
          >
            Добавить товар
          </Button>
        </HStack>
      </Flex>

      {/* Статистика товаров */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color={textColor}>
                <HStack spacing={1}>
                  <Icon as={FaBoxes} />
                  <Text>Всего товаров</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">
                {displayProducts.length}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                из {products.length} общих
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color={textColor}>
                <HStack spacing={1}>
                  <Icon as={FaRubleSign} />
                  <Text>Общая стоимость</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="2xl" color="green.500">
                ₽{(stats.totalValue / 1000000).toFixed(1)}M
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                средняя: ₽{stats.avgPrice.toFixed(0)}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color={textColor}>
                <HStack spacing={1}>
                  <Icon as={FaLayerGroup} />
                  <Text>Общий остаток</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {stats.totalStock.toLocaleString()}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                единиц товара
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color={textColor}>
                <HStack spacing={1}>
                  <Icon as={FaPercentage} />
                  <Text>Мало остатков</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="2xl" color={stats.lowStockCount > 0 ? "red.500" : "green.500"}>
                {stats.lowStockCount}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                товаров < 10 шт
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={6}
      >
        {/* Фильтры */}
        <Box
          width={{ base: '100%', lg: '300px' }}
          flexShrink={0}
        >
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <Heading size="sm" color="primary.600" _dark={{ color: 'primary.300' }}>
                  <HStack spacing={2}>
                    <Icon as={FaFilter} />
                    <Text>Фильтры</Text>
                  </HStack>
                </Heading>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={onFiltersToggle}
                  rightIcon={<ChevronDownIcon transform={isFiltersOpen ? 'rotate(180deg)' : 'none'} />}
                >
                  {isFiltersOpen ? 'Скрыть' : 'Показать'}
                </Button>
              </HStack>

              <Collapse in={isFiltersOpen} animateOpacity>
                <ProductFilters onApplyFilters={() => {}} />
              </Collapse>
            </CardBody>
          </Card>
        </Box>

        {/* Список товаров */}
        <Box flex="1">
          {/* Панель поиска и управления */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" mb={4}>
            <CardBody>
              <VStack spacing={4}>
                {/* Поиск */}
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Поиск по названию, SKU, бренду, категории..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      analytics.interaction('search', 'products', { query: e.target.value });
                    }}
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)' }}
                  />
                </InputGroup>

                {/* Панель управления */}
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  justify="space-between"
                  align={{ base: 'stretch', md: 'center' }}
                  w="100%"
                  gap={4}
                >
                  <HStack spacing={3} flex="1">
                    {/* Сортировка */}
                    <Menu>
                      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline" size="sm">
                        <HStack spacing={2}>
                          <Icon as={FaSort} />
                          <Text>Сортировка</Text>
                        </HStack>
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => setSortBy('name')}>По названию</MenuItem>
                        <MenuItem onClick={() => setSortBy('price_asc')}>Цена ↑</MenuItem>
                        <MenuItem onClick={() => setSortBy('price_desc')}>Цена ↓</MenuItem>
                        <MenuItem onClick={() => setSortBy('stock_asc')}>Остаток ↑</MenuItem>
                        <MenuItem onClick={() => setSortBy('stock_desc')}>Остаток ↓</MenuItem>
                        <MenuItem onClick={() => setSortBy('margin_asc')}>Маржа ↑</MenuItem>
                        <MenuItem onClick={() => setSortBy('margin_desc')}>Маржа ↓</MenuItem>
                      </MenuList>
                    </Menu>

                    {/* Переключатель вида */}
                    <HStack spacing={0} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md" p={1}>
                      <Tooltip label="Сетка" hasArrow>
                        <IconButton
                          aria-label="Вид сетки"
                          icon={<Icon as={FaTh} />}
                          size="sm"
                          variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                          colorScheme={viewMode === 'grid' ? 'primary' : 'gray'}
                          onClick={() => {
                            setViewMode('grid');
                            analytics.interaction('view_mode_change', 'grid');
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="Список" hasArrow>
                        <IconButton
                          aria-label="Вид списка"
                          icon={<Icon as={FaList} />}
                          size="sm"
                          variant={viewMode === 'list' ? 'solid' : 'ghost'}
                          colorScheme={viewMode === 'list' ? 'primary' : 'gray'}
                          onClick={() => {
                            setViewMode('list');
                            analytics.interaction('view_mode_change', 'list');
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>

                  {/* Кнопки действий */}
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<Icon as={FaSync} />}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      isLoading={isRefreshing || isLoading}
                      loadingText="Обновление..."
                    >
                      Обновить
                    </Button>

                    <Button
                      leftIcon={<Icon as={FaEye} />}
                      colorScheme="purple"
                      variant="outline"
                      size="sm"
                      onClick={() => analytics.interaction('button_click', 'bulk_actions')}
                    >
                      Массовые действия
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="medium">
              {isLoading
                ? 'Загрузка товаров...'
                : `Найдено товаров: ${displayProducts.length} из ${products.length}`}
            </Text>
            <Button
              colorScheme="green"
              size="sm"
            >
              Добавить товар
            </Button>
          </Flex>

          {isLoading ? (
            <Flex justify="center" align="center" height="300px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          ) : displayProducts.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text>
                По вашему запросу не найдено товаров. Попробуйте изменить параметры фильтрации или поиска.
              </Text>
            </Alert>
          ) : (
            <Grid
              templateColumns={`repeat(${columnCount}, 1fr)`}
              gap={4}
            >
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Grid>
          )}
        </Box>
      </Flex>
    </Container>
  );
}
