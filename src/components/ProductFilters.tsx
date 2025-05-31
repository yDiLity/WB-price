import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { ProductFilters as ProductFiltersType, ProductType, AIModule } from '../types';
import { useProducts } from '../context/ProductContext';
import CategorySelector from './CategorySelector';

interface ProductFiltersProps {
  onApplyFilters: () => void;
}

export default function ProductFilters({ onApplyFilters }: ProductFiltersProps) {
  const { products, filters, setFilters } = useProducts();
  const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters);

  // Извлекаем уникальные категории и бренды из товаров
  const categories = [...new Set(products.map(product => product.category))];
  const brands = [...new Set(products.map(product => product.brand))];

  // Находим минимальную и максимальную цену
  const minPrice = Math.min(...products.map(product => product.currentPrice));
  const maxPrice = Math.max(...products.map(product => product.currentPrice));

  // Находим минимальный и максимальный остаток
  const minStock = Math.min(...products.map(product => product.stock));
  const maxStock = Math.max(...products.map(product => product.stock));

  // Локальные состояния для слайдеров
  const [priceRange, setPriceRange] = useState<[number, number]>([
    localFilters.priceRange?.min || minPrice,
    localFilters.priceRange?.max || maxPrice
  ]);

  const [stockRange, setStockRange] = useState<[number, number]>([
    localFilters.stockRange?.min || minStock,
    localFilters.stockRange?.max || maxStock
  ]);

  // Обновляем локальные фильтры при изменении глобальных
  useEffect(() => {
    setLocalFilters(filters);

    // Обновляем локальные состояния слайдеров
    setPriceRange([
      filters.priceRange?.min || minPrice,
      filters.priceRange?.max || maxPrice
    ]);

    setStockRange([
      filters.stockRange?.min || minStock,
      filters.stockRange?.max || maxStock
    ]);
  }, [filters, minPrice, maxPrice, minStock, maxStock]);

  // Обработчики изменения фильтров
  const handleCategoryChange = (selectedCategories: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined
    }));
  };

  const handleBrandChange = (selectedBrands: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined
    }));
  };

  const handleProductTypeChange = (selectedTypes: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      productTypes: selectedTypes.length > 0
        ? selectedTypes as ProductType[]
        : undefined
    }));
  };

  const handleAIModuleChange = (selectedModules: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      aiModules: selectedModules.length > 0
        ? selectedModules as AIModule[]
        : undefined
    }));
  };

  const handlePriceRangeChange = (newRange: number[]) => {
    setPriceRange([newRange[0], newRange[1]]);
  };

  const handlePriceRangeChangeEnd = (newRange: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: {
        min: newRange[0],
        max: newRange[1]
      }
    }));
  };

  const handleStockRangeChange = (newRange: number[]) => {
    setStockRange([newRange[0], newRange[1]]);
  };

  const handleStockRangeChangeEnd = (newRange: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      stockRange: {
        min: newRange[0],
        max: newRange[1]
      }
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    const emptyFilters: ProductFiltersType = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
    setPriceRange([minPrice, maxPrice]);
    setStockRange([minStock, maxStock]);
    onApplyFilters();
  };

  // Цвета для компонента
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md" mb={2}>Фильтры</Heading>

        <Accordion allowMultiple defaultIndex={[0, 1]}>
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Категории и бренды
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Категории</FormLabel>
                  <CategorySelector
                    selectedCategories={localFilters.categories || []}
                    onChange={handleCategoryChange}
                    maxSelections={5}
                    placeholder="Выберите категории товаров"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Бренды</FormLabel>
                  <CheckboxGroup
                    colorScheme="blue"
                    value={localFilters.brands || []}
                    onChange={handleBrandChange}
                  >
                    <VStack align="start" spacing={1} maxH="150px" overflowY="auto">
                      {brands.map(brand => (
                        <Checkbox key={brand} value={brand} size="sm">
                          {brand}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Цена и остаток
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Диапазон цен</FormLabel>
                  <RangeSlider
                    min={minPrice}
                    max={maxPrice}
                    step={100}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    onChangeEnd={handlePriceRangeChangeEnd}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                  <Flex justify="space-between" mt={1}>
                    <Text fontSize="xs">{priceRange[0].toLocaleString()} ₽</Text>
                    <Text fontSize="xs">{priceRange[1].toLocaleString()} ₽</Text>
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Остаток на складе</FormLabel>
                  <RangeSlider
                    min={minStock}
                    max={maxStock}
                    step={1}
                    value={stockRange}
                    onChange={handleStockRangeChange}
                    onChangeEnd={handleStockRangeChangeEnd}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                  <Flex justify="space-between" mt={1}>
                    <Text fontSize="xs">{stockRange[0]} шт.</Text>
                    <Text fontSize="xs">{stockRange[1]} шт.</Text>
                  </Flex>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Тип товара и ИИ-модули
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Тип товара</FormLabel>
                  <CheckboxGroup
                    colorScheme="blue"
                    value={localFilters.productTypes || []}
                    onChange={handleProductTypeChange}
                  >
                    <VStack align="start" spacing={1}>
                      <Checkbox value={ProductType.HIT} size="sm">
                        Хит продаж
                      </Checkbox>
                      <Checkbox value={ProductType.PREMIUM} size="sm">
                        Премиум
                      </Checkbox>
                      <Checkbox value={ProductType.STANDARD} size="sm">
                        Стандартный
                      </Checkbox>
                      <Checkbox value={ProductType.OUTDATED} size="sm">
                        Устаревший
                      </Checkbox>
                    </VStack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">ИИ-модули</FormLabel>
                  <CheckboxGroup
                    colorScheme="blue"
                    value={localFilters.aiModules || []}
                    onChange={handleAIModuleChange}
                  >
                    <VStack align="start" spacing={1}>
                      <Checkbox value={AIModule.DEMAND_FORECAST} size="sm">
                        Прогноз спроса
                      </Checkbox>
                      <Checkbox value={AIModule.REVIEW_ANALYSIS} size="sm">
                        Анализ отзывов
                      </Checkbox>
                      <Checkbox value={AIModule.ANOMALY_DETECTION} size="sm">
                        Обнаружение аномалий
                      </Checkbox>
                      <Checkbox value={AIModule.REINFORCEMENT_LEARNING} size="sm">
                        Reinforcement Learning
                      </Checkbox>
                      <Checkbox value={AIModule.PERSONALIZATION} size="sm">
                        Персонализация
                      </Checkbox>
                    </VStack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Flex gap={2} mt={2}>
          <Button
            colorScheme="blue"
            onClick={handleApplyFilters}
            flexGrow={1}
            size="sm"
          >
            Применить
          </Button>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            size="sm"
          >
            Сбросить
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
