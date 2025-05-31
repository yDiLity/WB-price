import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Text,
  Box,
  Divider,
  Radio,
  RadioGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  useColorModeValue,
  Badge,
  Flex,
  HStack,
  Alert,
  AlertIcon,
  Switch
} from '@chakra-ui/react';
import { InfoIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Product } from '../../types/product';

// Типы стратегий ценообразования
export enum PricingStrategyType {
  MATCH_LOWEST = 'match_lowest',
  UNDERCUT_BY_PERCENT = 'undercut_by_percent',
  UNDERCUT_BY_AMOUNT = 'undercut_by_amount',
  AVERAGE_PRICE = 'average_price',
  CUSTOM = 'custom'
}

// Названия стратегий на русском
export const PricingStrategyNames: Record<PricingStrategyType, string> = {
  [PricingStrategyType.MATCH_LOWEST]: 'Соответствие минимальной цене',
  [PricingStrategyType.UNDERCUT_BY_PERCENT]: 'Снижение на процент',
  [PricingStrategyType.UNDERCUT_BY_AMOUNT]: 'Снижение на сумму',
  [PricingStrategyType.AVERAGE_PRICE]: 'Средняя цена конкурентов',
  [PricingStrategyType.CUSTOM]: 'Пользовательская стратегия'
};

// Описания стратегий
export const PricingStrategyDescriptions: Record<PricingStrategyType, string> = {
  [PricingStrategyType.MATCH_LOWEST]: 'Устанавливает цену равной минимальной цене конкурентов',
  [PricingStrategyType.UNDERCUT_BY_PERCENT]: 'Устанавливает цену ниже минимальной цены конкурентов на указанный процент',
  [PricingStrategyType.UNDERCUT_BY_AMOUNT]: 'Устанавливает цену ниже минимальной цены конкурентов на указанную сумму',
  [PricingStrategyType.AVERAGE_PRICE]: 'Устанавливает цену равной средней цене конкурентов',
  [PricingStrategyType.CUSTOM]: 'Настраиваемая стратегия ценообразования'
};

// Интерфейс для стратегии ценообразования
export interface PricingStrategy {
  id: string;
  type: PricingStrategyType;
  name: string;
  description?: string;
  parameters: {
    percentReduction?: number;
    amountReduction?: number;
    minPrice?: number;
    maxPrice?: number;
    checkFrequency?: number; // в минутах
    applyAutomatically?: boolean;
    customFormula?: string;
  };
}

// Интерфейс для пропсов модального окна
interface StrategySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSelectStrategy: (strategy: PricingStrategy) => void;
  onProceedToCompetitors: (strategy: PricingStrategy) => void;
}

/**
 * Модальное окно для выбора стратегии ценообразования
 */
export default function StrategySelectionModal({
  isOpen,
  onClose,
  product,
  onSelectStrategy,
  onProceedToCompetitors
}: StrategySelectionModalProps) {
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  
  // Состояние для выбранной стратегии
  const [selectedStrategyType, setSelectedStrategyType] = useState<PricingStrategyType>(PricingStrategyType.MATCH_LOWEST);
  
  // Состояние для параметров стратегии
  const [percentReduction, setPercentReduction] = useState<number>(5);
  const [amountReduction, setAmountReduction] = useState<number>(100);
  const [minPrice, setMinPrice] = useState<number>(product.price.minThreshold || Math.floor(product.price.current * 0.8));
  const [maxPrice, setMaxPrice] = useState<number>(Math.ceil(product.price.current * 1.2));
  const [checkFrequency, setCheckFrequency] = useState<number>(60); // 60 минут по умолчанию
  const [applyAutomatically, setApplyAutomatically] = useState<boolean>(true);
  const [customFormula, setCustomFormula] = useState<string>('min(competitors) - 100');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Получение предварительного расчета новой цены
  const getEstimatedPrice = (): number => {
    // Предполагаем, что минимальная цена конкурентов равна текущей цене товара
    // В реальном приложении здесь будет логика для получения минимальной цены конкурентов
    const lowestCompetitorPrice = product.price.current;
    
    switch (selectedStrategyType) {
      case PricingStrategyType.MATCH_LOWEST:
        return lowestCompetitorPrice;
      case PricingStrategyType.UNDERCUT_BY_PERCENT:
        return lowestCompetitorPrice * (1 - percentReduction / 100);
      case PricingStrategyType.UNDERCUT_BY_AMOUNT:
        return lowestCompetitorPrice - amountReduction;
      case PricingStrategyType.AVERAGE_PRICE:
        // Предполагаем, что средняя цена конкурентов равна текущей цене товара
        return lowestCompetitorPrice;
      case PricingStrategyType.CUSTOM:
        // Здесь будет логика для вычисления цены по пользовательской формуле
        return lowestCompetitorPrice - 100;
      default:
        return product.price.current;
    }
  };
  
  // Проверка, не ниже ли расчетная цена минимальной
  const estimatedPrice = Math.max(getEstimatedPrice(), minPrice);
  
  // Создание объекта стратегии
  const createStrategy = (): PricingStrategy => {
    const strategyId = `strategy-${Date.now()}`;
    
    return {
      id: strategyId,
      type: selectedStrategyType,
      name: PricingStrategyNames[selectedStrategyType],
      description: PricingStrategyDescriptions[selectedStrategyType],
      parameters: {
        percentReduction: selectedStrategyType === PricingStrategyType.UNDERCUT_BY_PERCENT ? percentReduction : undefined,
        amountReduction: selectedStrategyType === PricingStrategyType.UNDERCUT_BY_AMOUNT ? amountReduction : undefined,
        minPrice,
        maxPrice,
        checkFrequency,
        applyAutomatically,
        customFormula: selectedStrategyType === PricingStrategyType.CUSTOM ? customFormula : undefined
      }
    };
  };
  
  // Обработчик сохранения стратегии
  const handleSaveStrategy = () => {
    const strategy = createStrategy();
    onSelectStrategy(strategy);
    onClose();
  };
  
  // Обработчик перехода к связыванию конкурентов
  const handleProceedToCompetitors = () => {
    const strategy = createStrategy();
    onProceedToCompetitors(strategy);
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg={headerBg} borderTopRadius="md">
          Выбор стратегии ценообразования
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          {/* Информация о товаре */}
          <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontWeight="bold">{product.title}</Text>
            <Flex justify="space-between" align="center" mt={2}>
              <Text>Текущая цена: <strong>{formatPrice(product.price.current)}</strong></Text>
              {product.price.minThreshold && (
                <Badge colorScheme="orange">
                  Мин. цена: {formatPrice(product.price.minThreshold)}
                </Badge>
              )}
            </Flex>
          </Box>
          
          {/* Выбор типа стратегии */}
          <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
            <FormControl>
              <FormLabel fontWeight="bold">Тип стратегии</FormLabel>
              <RadioGroup value={selectedStrategyType} onChange={(value) => setSelectedStrategyType(value as PricingStrategyType)}>
                <Stack spacing={3}>
                  {Object.values(PricingStrategyType).map((type) => (
                    <Box
                      key={type}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={selectedStrategyType === type ? 'blue.500' : borderColor}
                      bg={selectedStrategyType === type ? selectedBg : bgColor}
                      cursor="pointer"
                      onClick={() => setSelectedStrategyType(type)}
                    >
                      <Radio value={type} colorScheme="blue">
                        <Text fontWeight="medium">{PricingStrategyNames[type]}</Text>
                      </Radio>
                      <Text fontSize="sm" ml={6} mt={1} color="gray.500">
                        {PricingStrategyDescriptions[type]}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
            </FormControl>
          </Box>
          
          {/* Параметры стратегии */}
          <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontWeight="bold" mb={3}>Параметры стратегии</Text>
            
            {/* Параметры в зависимости от типа стратегии */}
            {selectedStrategyType === PricingStrategyType.UNDERCUT_BY_PERCENT && (
              <FormControl mb={4}>
                <FormLabel>Процент снижения</FormLabel>
                <Flex>
                  <NumberInput
                    value={percentReduction}
                    onChange={(_, value) => setPercentReduction(value)}
                    min={1}
                    max={50}
                    step={1}
                    maxW="100px"
                    mr={4}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    flex="1"
                    value={percentReduction}
                    onChange={setPercentReduction}
                    min={1}
                    max={50}
                    step={1}
                    focusThumbOnChange={false}
                    colorScheme="blue"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Flex>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Цена будет снижена на {percentReduction}% от минимальной цены конкурентов
                </Text>
              </FormControl>
            )}
            
            {selectedStrategyType === PricingStrategyType.UNDERCUT_BY_AMOUNT && (
              <FormControl mb={4}>
                <FormLabel>Сумма снижения (₽)</FormLabel>
                <NumberInput
                  value={amountReduction}
                  onChange={(_, value) => setAmountReduction(value)}
                  min={1}
                  max={10000}
                  step={50}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Цена будет снижена на {formatPrice(amountReduction)} от минимальной цены конкурентов
                </Text>
              </FormControl>
            )}
            
            {selectedStrategyType === PricingStrategyType.CUSTOM && (
              <FormControl mb={4}>
                <FormLabel>Пользовательская формула</FormLabel>
                <Select
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                >
                  <option value="min(competitors) - 100">Минимальная цена конкурентов - 100 ₽</option>
                  <option value="min(competitors) * 0.95">Минимальная цена конкурентов - 5%</option>
                  <option value="avg(competitors) * 0.97">Средняя цена конкурентов - 3%</option>
                  <option value="min(competitors) - 50">Минимальная цена конкурентов - 50 ₽</option>
                </Select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Выберите предустановленную формулу или создайте свою
                </Text>
              </FormControl>
            )}
            
            {/* Общие параметры для всех стратегий */}
            <FormControl mb={4}>
              <FormLabel>Минимальная цена (₽)</FormLabel>
              <NumberInput
                value={minPrice}
                onChange={(_, value) => setMinPrice(value)}
                min={1}
                max={product.price.current * 2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Цена не будет опускаться ниже этого значения
              </Text>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Максимальная цена (₽)</FormLabel>
              <NumberInput
                value={maxPrice}
                onChange={(_, value) => setMaxPrice(value)}
                min={product.price.current}
                max={product.price.current * 3}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Цена не будет подниматься выше этого значения
              </Text>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Частота проверки (минуты)</FormLabel>
              <Select
                value={checkFrequency}
                onChange={(e) => setCheckFrequency(parseInt(e.target.value))}
              >
                <option value="15">Каждые 15 минут</option>
                <option value="30">Каждые 30 минут</option>
                <option value="60">Каждый час</option>
                <option value="180">Каждые 3 часа</option>
                <option value="360">Каждые 6 часов</option>
                <option value="720">Каждые 12 часов</option>
                <option value="1440">Раз в день</option>
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Как часто будут проверяться цены конкурентов
              </Text>
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="auto-apply" mb="0">
                Применять автоматически
              </FormLabel>
              <Switch
                id="auto-apply"
                colorScheme="blue"
                isChecked={applyAutomatically}
                onChange={(e) => setApplyAutomatically(e.target.checked)}
              />
            </FormControl>
          </Box>
          
          {/* Предварительный расчет */}
          <Box p={4} bg={headerBg}>
            <Text fontWeight="bold" mb={3}>Предварительный расчет</Text>
            
            <HStack spacing={4} mb={2}>
              <Text>Текущая цена:</Text>
              <Text fontWeight="bold">{formatPrice(product.price.current)}</Text>
            </HStack>
            
            <HStack spacing={4} mb={2}>
              <Text>Расчетная цена:</Text>
              <Text fontWeight="bold" color={estimatedPrice < product.price.current ? "green.500" : "blue.500"}>
                {formatPrice(estimatedPrice)}
              </Text>
            </HStack>
            
            <HStack spacing={4}>
              <Text>Изменение:</Text>
              <Badge
                colorScheme={estimatedPrice < product.price.current ? "green" : "blue"}
                fontSize="md"
                px={2}
                py={1}
                borderRadius="md"
              >
                {estimatedPrice < product.price.current ? "-" : "+"}
                {Math.abs(estimatedPrice - product.price.current).toLocaleString('ru-RU')} ₽
                ({Math.abs(((estimatedPrice / product.price.current) - 1) * 100).toFixed(1)}%)
              </Badge>
            </HStack>
            
            {estimatedPrice <= minPrice && (
              <Alert status="warning" mt={3} size="sm">
                <AlertIcon />
                Расчетная цена ограничена минимальной ценой
              </Alert>
            )}
          </Box>
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button colorScheme="blue" mr={3} onClick={handleSaveStrategy}>
            Сохранить стратегию
          </Button>
          <Button
            colorScheme="teal"
            rightIcon={<ChevronRightIcon />}
            onClick={handleProceedToCompetitors}
          >
            Связать с конкурентами
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
