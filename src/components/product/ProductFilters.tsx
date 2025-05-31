import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  HStack,
  VStack,
  Text,
  FormControl,
  FormLabel,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Collapse,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon } from '@chakra-ui/icons';
import { ProductStatus, ProductCategory } from '../../types/product';

export interface ProductFiltersState {
  search: string;
  status: ProductStatus | '';
  category: ProductCategory | '';
  priceRange: [number, number];
  stockRange: [number, number];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export { ProductFiltersState as ProductFilters };

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFiltersState) => void;
  initialFilters?: Partial<ProductFiltersState>;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  onFilterChange,
  initialFilters,
  minPrice = 0,
  maxPrice = 100000,
  minStock = 0,
  maxStock = 1000
}) => {
  // Состояние для хранения фильтров
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || '',
    category: initialFilters?.category || '',
    priceRange: initialFilters?.priceRange || [minPrice, maxPrice],
    stockRange: initialFilters?.stockRange || [minStock, maxStock],
    sortBy: initialFilters?.sortBy || 'price',
    sortOrder: initialFilters?.sortOrder || 'asc'
  });

  // Состояние для отображения расширенных фильтров
  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure({
    defaultIsOpen: false
  });

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Обработчик изменения фильтров
  const handleFilterChange = <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      priceRange: [minPrice, maxPrice],
      stockRange: [minStock, maxStock],
      sortBy: 'price',
      sortOrder: 'asc'
    });
  };

  // Применение фильтров при их изменении
  useEffect(() => {
    console.log('ProductFilters: filters changed, applying filters', filters);
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Логирование при инициализации
  useEffect(() => {
    console.log('ProductFilters: initialized with filters', filters);
  }, []);

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      mb={4}
    >
      {/* Основные фильтры */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        align={{ base: 'stretch', md: 'flex-end' }}
      >
        <FormControl flex="2">
          <FormLabel>Поиск</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Поиск по названию товара..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </InputGroup>
        </FormControl>

        <FormControl flex="1">
          <FormLabel>Статус</FormLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value as ProductStatus | '')}
          >
            <option value="">Все статусы</option>
            <option value={ProductStatus.ACTIVE}>Активные</option>
            <option value={ProductStatus.INACTIVE}>Неактивные</option>
            <option value={ProductStatus.PENDING}>Ожидающие</option>
            <option value={ProductStatus.REJECTED}>Отклоненные</option>
            <option value={ProductStatus.ARCHIVED}>Архивные</option>
          </Select>
        </FormControl>

        <FormControl flex="1">
          <FormLabel>Категория</FormLabel>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value as ProductCategory | '')}
          >
            <option value="">Все категории</option>
            <option value={ProductCategory.HEALTH}>Здоровье</option>
            <option value={ProductCategory.BEAUTY}>Красота</option>
            <option value={ProductCategory.ELECTRONICS}>Электроника</option>
            <option value={ProductCategory.HOME}>Дом</option>
            <option value={ProductCategory.SPORTS}>Спорт</option>
            <option value={ProductCategory.TOYS}>Игрушки</option>
            <option value={ProductCategory.FASHION}>Мода</option>
            <option value={ProductCategory.FOOD}>Еда</option>
          </Select>
        </FormControl>

        <Button
          onClick={onAdvancedToggle}
          variant="ghost"
          rightIcon={isAdvancedOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        >
          Расширенные фильтры
        </Button>
      </Flex>

      {/* Расширенные фильтры */}
      <Collapse in={isAdvancedOpen} animateOpacity>
        <Box mt={4}>
          <Divider mb={4} />

          <VStack spacing={6} align="stretch">
            {/* Фильтр по цене */}
            <FormControl>
              <FormLabel>Диапазон цен</FormLabel>
              <Flex align="center">
                <NumberInput
                  min={minPrice}
                  max={filters.priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(_, value) =>
                    handleFilterChange('priceRange', [value, filters.priceRange[1]])
                  }
                  mr={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>

                <Text mx={2}>—</Text>

                <NumberInput
                  min={filters.priceRange[0]}
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(_, value) =>
                    handleFilterChange('priceRange', [filters.priceRange[0], value])
                  }
                  ml={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>

              <RangeSlider
                min={minPrice}
                max={maxPrice}
                step={100}
                value={filters.priceRange}
                onChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                mt={2}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
              </RangeSlider>
            </FormControl>

            {/* Фильтр по наличию */}
            <FormControl>
              <FormLabel>Наличие на складе</FormLabel>
              <Flex align="center">
                <NumberInput
                  min={minStock}
                  max={filters.stockRange[1]}
                  value={filters.stockRange[0]}
                  onChange={(_, value) =>
                    handleFilterChange('stockRange', [value, filters.stockRange[1]])
                  }
                  mr={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>

                <Text mx={2}>—</Text>

                <NumberInput
                  min={filters.stockRange[0]}
                  max={maxStock}
                  value={filters.stockRange[1]}
                  onChange={(_, value) =>
                    handleFilterChange('stockRange', [filters.stockRange[0], value])
                  }
                  ml={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>

              <RangeSlider
                min={minStock}
                max={maxStock}
                step={10}
                value={filters.stockRange}
                onChange={(value) => handleFilterChange('stockRange', value as [number, number])}
                mt={2}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
              </RangeSlider>
            </FormControl>

            {/* Сортировка */}
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Сортировать по</FormLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="price">Цене</option>
                  <option value="title">Названию</option>
                  <option value="stock">Наличию</option>
                  <option value="createdAt">Дате создания</option>
                  <option value="updatedAt">Дате обновления</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Порядок</FormLabel>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </Select>
              </FormControl>
            </HStack>
          </VStack>

          <Flex justify="flex-end" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              leftIcon={<CloseIcon />}
              onClick={handleResetFilters}
              size="sm"
            >
              Сбросить фильтры
            </Button>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProductFilters;
