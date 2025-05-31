import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  useColorModeValue,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider
} from '@chakra-ui/react';
import {
  AddIcon,
  RepeatIcon,
  DownloadIcon,
  SettingsIcon,
  InfoIcon,
  ViewIcon
} from '@chakra-ui/icons';
import { FaDatabase } from 'react-icons/fa';
import {
  Product,
  ProductCategory,
  ProductStatus,
  ProductCategoryNames,
  ProductStatusNames
} from '../types/product';
import ProductFilters, { ProductFiltersState } from '../components/product/ProductFilters';
import { useProductService } from '../hooks/useProductService';
import { useApiMode } from '../hooks/useApiMode';
import ProductCard from '../components/product/ProductCard';
import ProductDetailModal from '../components/product/ProductDetailModal';
import PricingStrategyModal from '../components/pricing/PricingStrategyModal';
import { PricingStrategySettings, PricingStrategyType } from '../components/pricing/PricingStrategyModal';
import { formatPrice } from '../utils/formatters';
import CustomPagination from '../components/common/CustomPagination';

export default function EnhancedProductsPage() {
  // Сервисы и хуки
  const productService = useProductService();
  const { isApiMode, toggleApiMode } = useApiMode();

  // Состояния
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: '',
    status: '',
    category: '',
    priceRange: [0, 100000],
    stockRange: [0, 1000],
    page: 1,
    limit: 12,
    sortBy: 'price',
    sortOrder: 'asc'
  });
  const [stats, setStats] = useState<{
    totalProducts: number;
    byCategory: Record<ProductCategory, number>;
    byStatus: Record<ProductStatus, number>;
    withStrategy: number;
    outOfStock: number;
    averagePrice: number;
  } | null>(null);

  // Модальные окна
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onClose: onDetailModalClose
  } = useDisclosure();

  const {
    isOpen: isStrategyModalOpen,
    onOpen: onStrategyModalOpen,
    onClose: onStrategyModalClose
  } = useDisclosure();

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  // Загрузка товаров при монтировании компонента и изменении фильтров
  useEffect(() => {
    console.log('EnhancedProductsPage: filters changed, loading products');
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.search,
    filters.category,
    filters.status,
    filters.sortBy,
    filters.sortOrder
  ]);

  // Логирование состояния
  useEffect(() => {
    console.log('EnhancedProductsPage: state updated', {
      productsCount: products.length,
      isLoading,
      error,
      filters
    });
  }, [products, isLoading, error, filters]);

  // Загрузка статистики при монтировании компонента
  useEffect(() => {
    loadProductStats();
  }, []);

  // Загрузка товаров
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading products with filters:', filters);
      const result = await productService.getProducts({
        search: filters.search,
        category: filters.category,
        status: filters.status,
        minPrice: filters.priceRange?.[0],
        maxPrice: filters.priceRange?.[1],
        sortBy: filters.sortBy as any,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: filters.limit
      });
      console.log('Loaded products:', result);
      setProducts(result.items);
    } catch (err) {
      setError('Ошибка при загрузке товаров');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка статистики
  const loadProductStats = async () => {
    try {
      const result = await productService.getProductStats();
      setStats(result);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: ProductFiltersState) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Сбрасываем страницу при изменении фильтров
    }));
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'price',
      sortOrder: 'asc'
    });
  };

  // Обработчик выбора товара
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    onDetailModalOpen();
  };

  // Обработчик применения стратегии
  const handleApplyStrategy = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      onStrategyModalClose(); // Закрываем модальное окно с деталями товара, если оно открыто
      onStrategyModalOpen(); // Открываем модальное окно для применения стратегии
    }
  };

  // Обработчик сохранения стратегии
  const handleSaveStrategy = async (productId: string, strategy: PricingStrategySettings) => {
    try {
      await productService.applyPricingStrategy(productId, strategy);
      loadProducts(); // Перезагружаем товары после применения стратегии
    } catch (err) {
      console.error('Ошибка при применении стратегии:', err);
    }
  };

  // Обработчик обновления данных
  const handleRefresh = () => {
    loadProducts();
    loadProductStats();
  };

  // Обработчик переключения режима API
  const handleToggleApiMode = () => {
    toggleApiMode();
    loadProducts(); // Перезагружаем товары после переключения режима
  };

  return (
    <Container maxW="container.xl" py={8}>
      {/* Заголовок и кнопки */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        gap={4}
      >
        <VStack align="flex-start" spacing={1}>
          <Heading as="h1" size="xl">Все товары</Heading>
          <Text color="gray.500" fontSize="md">Управление товарами со всех маркетплейсов и вашего каталога</Text>
        </VStack>

        <HStack spacing={2}>
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="api-mode" mb="0" mr={2} fontSize="sm">
              Режим API
            </FormLabel>
            <Switch
              id="api-mode"
              isChecked={isApiMode}
              onChange={handleToggleApiMode}
              colorScheme="blue"
            />
          </FormControl>

          <Tooltip label="Обновить данные">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Обновить данные"
              variant="outline"
              onClick={handleRefresh}
              isLoading={isLoading}
            />
          </Tooltip>

          <Tooltip label="Экспорт товаров">
            <IconButton
              icon={<DownloadIcon />}
              aria-label="Экспорт товаров"
              variant="outline"
            />
          </Tooltip>

          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
          >
            Добавить товар
          </Button>
        </HStack>
      </Flex>

      {/* Статистика */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
          <Stat bg={statBg} p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Всего товаров</StatLabel>
            <StatNumber>{stats.totalProducts}</StatNumber>
            <StatHelpText>
              Со стратегией: {stats.withStrategy}
            </StatHelpText>
          </Stat>

          <Stat bg={statBg} p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Активные товары</StatLabel>
            <StatNumber>{stats.byStatus[ProductStatus.ACTIVE] || 0}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {Math.round((stats.byStatus[ProductStatus.ACTIVE] || 0) / stats.totalProducts * 100)}%
            </StatHelpText>
          </Stat>

          <Stat bg={statBg} p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Не в наличии</StatLabel>
            <StatNumber>{stats.outOfStock}</StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              {Math.round(stats.outOfStock / stats.totalProducts * 100)}%
            </StatHelpText>
          </Stat>

          <Stat bg={statBg} p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Средняя цена</StatLabel>
            <StatNumber>{formatPrice(stats.averagePrice)}</StatNumber>
            <StatHelpText>
              По всем товарам
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      {/* Фильтры */}
      <ProductFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Список товаров */}
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      ) : products.length === 0 ? (
        <Alert status="info" borderRadius="md" mb={4}>
          <AlertIcon />
          <Text>
            По вашему запросу не найдено товаров. Попробуйте изменить параметры фильтрации или поиска.
          </Text>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => handleSelectProduct(product)}
              onApplyStrategy={() => handleApplyStrategy(product.id)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Пагинация */}
      {!isLoading && !error && products.length > 0 && (
        <Flex justify="center" mt={6}>
          <CustomPagination
            currentPage={filters.page || 1}
            totalPages={Math.ceil(products.length / (filters.limit || 12))}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </Flex>
      )}

      {/* Модальное окно с деталями товара */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={onDetailModalClose}
        product={selectedProduct}
        onApplyStrategy={(productId) => handleApplyStrategy(productId)}
      />

      {/* Модальное окно для применения стратегии */}
      <PricingStrategyModal
        isOpen={isStrategyModalOpen}
        onClose={onStrategyModalClose}
        product={selectedProduct}
        onApplyStrategy={handleSaveStrategy}
      />
    </Container>
  );
}
