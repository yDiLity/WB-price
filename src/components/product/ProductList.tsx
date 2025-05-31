import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Flex,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  Select,
  HStack,
  Tooltip
} from '@chakra-ui/react';
import { ChevronDownIcon, SettingsIcon, InfoIcon } from '@chakra-ui/icons';
import { Product, ProductFilters } from '../../types/product';
import ProductCard from './ProductCard';
import { useProductsNew } from '../../context/ProductContextNew';
import CustomPagination from '../common/CustomPagination';

interface ProductListProps {
  onSelectProduct?: (product: Product) => void;
  onApplyStrategy?: (productId: string) => void;
  showPagination?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  maxItems?: number;
}

export default function ProductList({
  onSelectProduct,
  onApplyStrategy,
  showPagination = true,
  showFilters = true,
  compact = false,
  maxItems
}: ProductListProps) {
  const {
    products,
    searchResult,
    isLoading,
    error,
    filters,
    setFilters
  } = useProductsNew();

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Обработчик выбора товара
  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Обработчик выбора/отмены выбора товара
  const handleToggleSelect = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Обработчик выбора всех товаров
  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(product => product.id));
    }
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setFilters({ page });
    setSelectedProductIds([]);
  };

  // Обработчик изменения количества товаров на странице
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = parseInt(e.target.value);
    setFilters({ limit, page: 1 });
    setSelectedProductIds([]);
  };

  // Обработчик изменения сортировки
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters({ sortBy, sortOrder });
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="300px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  // Отображение пустого списка
  if (products.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text>Товары не найдены. Попробуйте изменить параметры поиска.</Text>
      </Alert>
    );
  }

  // Ограничение количества отображаемых товаров (если указано)
  const displayProducts = maxItems ? products.slice(0, maxItems) : products;

  // Количество колонок в зависимости от размера экрана и режима отображения
  const columns = compact ? { base: 1, sm: 2, md: 3, lg: 4, xl: 5 } : { base: 1, md: 2, lg: 3 };

  return (
    <Box>
      {/* Панель фильтров и сортировки */}
      {showFilters && (
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          p={3}
          bg={bgColor}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          flexWrap="wrap"
          gap={2}
        >
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
            >
              {selectedProductIds.length === products.length ? 'Отменить все' : 'Выбрать все'}
            </Button>

            {selectedProductIds.length > 0 && (
              <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                Выбрано: {selectedProductIds.length}
              </Badge>
            )}
          </HStack>

          <HStack spacing={2}>
            <Menu>
              <Tooltip label="Сортировка">
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  rightIcon={<ChevronDownIcon />}
                >
                  {filters.sortBy === 'title' ? 'По названию' :
                   filters.sortBy === 'price' ? 'По цене' :
                   filters.sortBy === 'stock' ? 'По остаткам' :
                   filters.sortBy === 'sales' ? 'По продажам' :
                   filters.sortBy === 'rating' ? 'По рейтингу' :
                   filters.sortBy === 'created' ? 'По дате создания' :
                   filters.sortBy === 'updated' ? 'По дате обновления' :
                   'Сортировка'}
                  {filters.sortOrder === 'desc' ? ' ↓' : ' ↑'}
                </MenuButton>
              </Tooltip>
              <MenuList>
                <MenuItem onClick={() => handleSortChange('title', 'asc')}>
                  По названию (А-Я)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('title', 'desc')}>
                  По названию (Я-А)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('price', 'asc')}>
                  По цене (возрастание)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('price', 'desc')}>
                  По цене (убывание)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('stock', 'desc')}>
                  По остаткам (больше)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('stock', 'asc')}>
                  По остаткам (меньше)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('sales', 'desc')}>
                  По продажам (больше)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('rating', 'desc')}>
                  По рейтингу (выше)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('created', 'desc')}>
                  По дате создания (новые)
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('updated', 'desc')}>
                  По дате обновления (новые)
                </MenuItem>
              </MenuList>
            </Menu>

            {selectedProductIds.length > 0 && (
              <Menu>
                <Tooltip label="Действия с выбранными">
                  <MenuButton
                    as={IconButton}
                    size="sm"
                    variant="outline"
                    icon={<SettingsIcon />}
                    aria-label="Действия с выбранными товарами"
                  />
                </Tooltip>
                <MenuList>
                  {onApplyStrategy && (
                    <MenuItem onClick={() => onApplyStrategy(selectedProductIds[0])}>
                      Применить стратегию
                    </MenuItem>
                  )}
                  <MenuItem>
                    Экспортировать
                  </MenuItem>
                  <MenuItem>
                    Архивировать
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </Flex>
      )}

      {/* Список товаров */}
      <SimpleGrid columns={columns} spacing={4}>
        {displayProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProductIds.includes(product.id)}
            onSelect={handleSelectProduct}
            onToggleSelect={handleToggleSelect}
            compact={compact}
          />
        ))}
      </SimpleGrid>

      {/* Пагинация */}
      {showPagination && searchResult && (
        <Flex justify="space-between" align="center" mt={6} flexWrap="wrap" gap={4}>
          <HStack>
            <Text fontSize="sm">Показано {products.length} из {searchResult.total} товаров</Text>
            <Select
              size="sm"
              width="auto"
              value={filters.limit}
              onChange={handleLimitChange}
            >
              <option value="10">10 на странице</option>
              <option value="20">20 на странице</option>
              <option value="50">50 на странице</option>
              <option value="100">100 на странице</option>
            </Select>
          </HStack>

          <CustomPagination
            currentPage={searchResult.page}
            totalPages={searchResult.totalPages}
            onPageChange={handlePageChange}
          />
        </Flex>
      )}
    </Box>
  );
}
