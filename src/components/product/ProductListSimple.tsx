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
  Badge,
  Select,
  HStack
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Product } from '../../types/product';
import ProductCard from './ProductCard';
import CustomPagination from '../common/CustomPagination';
import { mockProducts } from '../../services/mockData';
import { useSimpleProducts } from '../../context/SimpleProductContext';

interface ProductListSimpleProps {
  onSelectProduct?: (product: Product) => void;
  onApplyStrategy?: (productId: string) => void;
  onLinkCompetitors?: (productId: string) => void;
  showPagination?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  maxItems?: number;
}

export default function ProductListSimple({
  onSelectProduct,
  onApplyStrategy,
  onLinkCompetitors,
  showPagination = true,
  showFilters = true,
  compact = false,
  maxItems
}: ProductListSimpleProps) {
  // Используем данные из контекста SimpleProductContext
  const { products, filters, setFilters } = useSimpleProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
    if (selectedProductIds.length === paginatedProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(paginatedProducts.map(product => product.id));
    }
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters({ page });
    setSelectedProductIds([]);
  };

  // Обработчик изменения количества товаров на странице
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = parseInt(e.target.value);
    setItemsPerPage(limit);
    setCurrentPage(1);
    setFilters({ limit, page: 1 });
    setSelectedProductIds([]);
  };

  // Вычисляем пагинированные товары
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Ограничение количества отображаемых товаров (если указано)
  const displayProducts = maxItems ? paginatedProducts.slice(0, maxItems) : paginatedProducts;

  // Количество колонок в зависимости от размера экрана и режима отображения
  const columns = compact ? { base: 1, sm: 2, md: 3, lg: 4, xl: 5 } : { base: 1, md: 2, lg: 3 };

  return (
    <Box>
      {/* Панель фильтров и сортировки */}
      {showFilters && (
        <Flex
          justify="space-between"
          align="center"
          mb={5}
          p={4}
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          flexWrap="wrap"
          gap={3}
        >
          <HStack spacing={3}>
            <Button
              size="md"
              variant="outline"
              colorScheme="blue"
              borderRadius="full"
              fontWeight="medium"
              leftIcon={selectedProductIds.length === paginatedProducts.length ?
                <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={handleSelectAll}
              _hover={{
                bg: useColorModeValue('blue.50', 'blue.900'),
              }}
            >
              {selectedProductIds.length === paginatedProducts.length ? 'Отменить все' : 'Выбрать все'}
            </Button>

            {selectedProductIds.length > 0 && (
              <Badge
                colorScheme="blue"
                borderRadius="full"
                px={3}
                py={1.5}
                fontSize="0.9rem"
                fontWeight="medium"
                boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              >
                Выбрано: {selectedProductIds.length}
              </Badge>
            )}
          </HStack>
        </Flex>
      )}

      {/* Список товаров */}
      <SimpleGrid
        columns={columns}
        spacing={6}
        sx={{
          '& > div': {
            height: '100%'
          }
        }}
      >
        {displayProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProductIds.includes(product.id)}
            onSelect={handleSelectProduct}
            onToggleSelect={handleToggleSelect}
            onApplyStrategy={onApplyStrategy}
            onLinkCompetitors={onLinkCompetitors}
            compact={compact}
          />
        ))}
      </SimpleGrid>

      {/* Пагинация */}
      {showPagination && (
        <Flex
          justify="space-between"
          align="center"
          mt={8}
          mb={4}
          flexWrap="wrap"
          gap={4}
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          p={4}
        >
          <HStack spacing={4}>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={useColorModeValue('gray.600', 'gray.300')}
            >
              Показано <strong>{displayProducts.length}</strong> из <strong>{products.length}</strong> товаров
            </Text>
            <Select
              size="sm"
              width="auto"
              value={itemsPerPage}
              onChange={handleLimitChange}
              borderRadius="md"
              bg={useColorModeValue('gray.50', 'gray.700')}
              _hover={{
                borderColor: 'blue.300',
              }}
            >
              <option value="10">10 на странице</option>
              <option value="20">20 на странице</option>
              <option value="50">50 на странице</option>
              <option value="100">100 на странице</option>
            </Select>
          </HStack>

          <CustomPagination
            currentPage={currentPage}
            totalPages={Math.ceil(products.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </Flex>
      )}
    </Box>
  );
}
