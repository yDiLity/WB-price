import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Button,
  Divider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types';

interface PricingRecommendationsProps {
  product: Product;
  competitors: CompetitorProduct[];
  onApplyPrice?: (newPrice: number) => void;
}

/**
 * Компонент для отображения рекомендаций по ценообразованию
 */
const PricingRecommendations: React.FC<PricingRecommendationsProps> = ({
  product,
  competitors,
  onApplyPrice
}) => {
  const [sliderValue, setSliderValue] = useState<number>(product.price.current);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const sliderBgColor = useColorModeValue('blue.100', 'blue.900');
  
  // Toast для уведомлений
  const toast = useToast();
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Вычисление рекомендуемой цены
  const calculateRecommendedPrice = () => {
    if (!competitors || competitors.length === 0) {
      return product.price.current;
    }
    
    // Сортируем конкурентов по цене (от низкой к высокой)
    const sortedCompetitors = [...competitors].sort((a, b) => a.price - b.price);
    
    // Находим минимальную цену конкурентов
    const minCompetitorPrice = sortedCompetitors[0].price;
    
    // Находим среднюю цену конкурентов
    const avgCompetitorPrice = sortedCompetitors.reduce((sum, comp) => sum + comp.price, 0) / sortedCompetitors.length;
    
    // Вычисляем рекомендуемую цену (немного ниже средней цены конкурентов)
    let recommendedPrice = avgCompetitorPrice * 0.95;
    
    // Проверяем, что рекомендуемая цена не ниже минимальной цены товара
    if (product.price.minThreshold && recommendedPrice < product.price.minThreshold) {
      recommendedPrice = product.price.minThreshold;
    }
    
    // Проверяем, что рекомендуемая цена не ниже себестоимости
    if (product.price.costPrice && recommendedPrice < product.price.costPrice * 1.1) {
      recommendedPrice = product.price.costPrice * 1.1;
    }
    
    return Math.round(recommendedPrice);
  };
  
  // Получение минимальной и максимальной цены для слайдера
  const getSliderRange = () => {
    let minPrice = product.price.current * 0.7;
    let maxPrice = product.price.current * 1.3;
    
    // Учитываем минимальную цену товара
    if (product.price.minThreshold) {
      minPrice = Math.max(minPrice, product.price.minThreshold);
    }
    
    // Учитываем себестоимость
    if (product.price.costPrice) {
      minPrice = Math.max(minPrice, product.price.costPrice);
    }
    
    // Учитываем цены конкурентов
    if (competitors && competitors.length > 0) {
      const competitorPrices = competitors.map(comp => comp.price);
      const minCompetitorPrice = Math.min(...competitorPrices);
      const maxCompetitorPrice = Math.max(...competitorPrices);
      
      minPrice = Math.min(minPrice, minCompetitorPrice * 0.9);
      maxPrice = Math.max(maxPrice, maxCompetitorPrice * 1.1);
    }
    
    return {
      min: Math.floor(minPrice),
      max: Math.ceil(maxPrice)
    };
  };
  
  // Вычисление процента изменения цены
  const calculatePriceChangePercent = (newPrice: number) => {
    return ((newPrice - product.price.current) / product.price.current) * 100;
  };
  
  // Получение цвета для процента изменения цены
  const getPriceChangeColor = (percent: number) => {
    if (percent > 0) {
      return 'green.500';
    } else if (percent < 0) {
      return 'red.500';
    }
    return 'gray.500';
  };
  
  // Обработчик применения новой цены
  const handleApplyPrice = () => {
    if (onApplyPrice) {
      onApplyPrice(sliderValue);
    }
    
    toast({
      title: 'Цена обновлена',
      description: `Новая цена: ${formatPrice(sliderValue)}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Получаем рекомендуемую цену
  const recommendedPrice = calculateRecommendedPrice();
  
  // Получаем диапазон цен для слайдера
  const sliderRange = getSliderRange();
  
  // Вычисляем процент изменения цены
  const priceChangePercent = calculatePriceChangePercent(sliderValue);
  
  // Проверяем, является ли текущая цена оптимальной
  const isPriceOptimal = Math.abs(priceChangePercent) < 2;
  
  // Проверяем, не слишком ли низкая цена
  const isTooLow = product.price.minThreshold && sliderValue < product.price.minThreshold;
  
  // Проверяем, не слишком ли высокая цена
  const isTooHigh = competitors && competitors.length > 0 && 
    sliderValue > Math.max(...competitors.map(comp => comp.price)) * 1.1;
  
  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Text fontWeight="bold" fontSize="lg" mb={4}>
        Рекомендации по ценообразованию
      </Text>
      
      {competitors && competitors.length > 0 ? (
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Text>Текущая цена:</Text>
            <Text fontWeight="bold">{formatPrice(product.price.current)}</Text>
          </Flex>
          
          <Flex justify="space-between" align="center">
            <Text>Рекомендуемая цена:</Text>
            <HStack>
              <Text fontWeight="bold">{formatPrice(recommendedPrice)}</Text>
              <Badge 
                colorScheme={calculatePriceChangePercent(recommendedPrice) > 0 ? 'green' : 'red'}
                variant="subtle"
              >
                {calculatePriceChangePercent(recommendedPrice) > 0 ? '+' : ''}
                {calculatePriceChangePercent(recommendedPrice).toFixed(1)}%
              </Badge>
            </HStack>
          </Flex>
          
          {product.price.minThreshold && (
            <Flex justify="space-between" align="center">
              <Text>Минимальная цена:</Text>
              <Text fontWeight="bold">{formatPrice(product.price.minThreshold)}</Text>
            </Flex>
          )}
          
          {product.price.costPrice && (
            <Flex justify="space-between" align="center">
              <Text>Себестоимость:</Text>
              <Text fontWeight="bold">{formatPrice(product.price.costPrice)}</Text>
            </Flex>
          )}
          
          <Divider />
          
          <Box pt={6} pb={2}>
            <Text mb={2}>Выберите новую цену:</Text>
            <Slider
              min={sliderRange.min}
              max={sliderRange.max}
              step={10}
              value={sliderValue}
              onChange={(val) => setSliderValue(val)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <SliderMark value={sliderRange.min} mt={2} ml={-2.5} fontSize="sm">
                {formatPrice(sliderRange.min)}
              </SliderMark>
              {product.price.minThreshold && (
                <SliderMark 
                  value={product.price.minThreshold} 
                  mt={2} 
                  ml={-2.5} 
                  fontSize="sm"
                  color="red.500"
                >
                  Мин
                </SliderMark>
              )}
              <SliderMark 
                value={recommendedPrice} 
                mt={2} 
                ml={-2.5} 
                fontSize="sm"
                color="green.500"
              >
                Реком.
              </SliderMark>
              <SliderMark value={sliderRange.max} mt={2} ml={-2.5} fontSize="sm">
                {formatPrice(sliderRange.max)}
              </SliderMark>
              <SliderTrack bg={sliderBgColor}>
                <SliderFilledTrack bg="blue.500" />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg="blue.500"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={`${formatPrice(sliderValue)} (${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(1)}%)`}
              >
                <SliderThumb boxSize={6}>
                  {isPriceOptimal && <CheckIcon color="green.500" />}
                </SliderThumb>
              </Tooltip>
            </Slider>
          </Box>
          
          <Flex justify="space-between" align="center">
            <HStack>
              <Text>Новая цена:</Text>
              <Text fontWeight="bold">{formatPrice(sliderValue)}</Text>
              <Badge 
                colorScheme={priceChangePercent > 0 ? 'green' : priceChangePercent < 0 ? 'red' : 'gray'}
                variant="subtle"
              >
                {priceChangePercent > 0 ? '+' : ''}
                {priceChangePercent.toFixed(1)}%
              </Badge>
            </HStack>
            
            <Button
              colorScheme="blue"
              onClick={handleApplyPrice}
              isDisabled={sliderValue === product.price.current}
            >
              Применить
            </Button>
          </Flex>
          
          {isTooLow && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Внимание!</AlertTitle>
              <AlertDescription>
                Выбранная цена ниже установленного минимального порога ({formatPrice(product.price.minThreshold!)})
              </AlertDescription>
            </Alert>
          )}
          
          {isTooHigh && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Внимание!</AlertTitle>
              <AlertDescription>
                Выбранная цена значительно выше цен конкурентов, что может снизить конкурентоспособность
              </AlertDescription>
            </Alert>
          )}
        </VStack>
      ) : (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Нет данных о конкурентах</AlertTitle>
          <AlertDescription>
            Для получения рекомендаций по ценообразованию необходимо связать товар с конкурентами
          </AlertDescription>
        </Alert>
      )}
    </Box>
  );
};

export default PricingRecommendations;
