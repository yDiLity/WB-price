import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Heading,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Select,
  FormControl,
  FormLabel,
  Switch,
  Badge,
  Icon,
  Input
} from '@chakra-ui/react';
import { 
  InfoIcon, 
  CheckIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WarningIcon
} from '@chakra-ui/icons';
import { Competitor } from '../../types/strategy';

interface VisualStrategyBuilderProps {
  competitors: Competitor[];
  onChange: (formula: string, description: string) => void;
  initialFormula?: string;
  initialDescription?: string;
}

// Типы стратегий для визуального конструктора
enum VisualStrategyType {
  COMPETITOR_PRICE = 'competitor_price',
  MARGIN = 'margin',
  MARKET_POSITION = 'market_position',
  STOCK_BASED = 'stock_based',
  CUSTOM = 'custom'
}

// Названия типов стратегий
const strategyTypeNames: Record<VisualStrategyType, string> = {
  [VisualStrategyType.COMPETITOR_PRICE]: 'Относительно конкурента',
  [VisualStrategyType.MARGIN]: 'По наценке',
  [VisualStrategyType.MARKET_POSITION]: 'Позиция на рынке',
  [VisualStrategyType.STOCK_BASED]: 'С учетом остатков',
  [VisualStrategyType.CUSTOM]: 'Своя формула'
};

// Подтипы стратегий относительно конкурента
enum CompetitorPriceType {
  LOWER = 'lower',
  HIGHER = 'higher',
  MATCH = 'match'
}

// Названия подтипов стратегий относительно конкурента
const competitorPriceTypeNames: Record<CompetitorPriceType, string> = {
  [CompetitorPriceType.LOWER]: 'Ниже конкурента',
  [CompetitorPriceType.HIGHER]: 'Выше конкурента',
  [CompetitorPriceType.MATCH]: 'Соответствие цене конкурента'
};

const VisualStrategyBuilder: React.FC<VisualStrategyBuilderProps> = ({
  competitors,
  onChange,
  initialFormula = '',
  initialDescription = ''
}) => {
  // Состояние для хранения выбранного типа стратегии
  const [strategyType, setStrategyType] = useState<VisualStrategyType>(VisualStrategyType.COMPETITOR_PRICE);
  
  // Состояние для стратегии относительно конкурента
  const [competitorPriceType, setCompetitorPriceType] = useState<CompetitorPriceType>(CompetitorPriceType.LOWER);
  const [competitorId, setCompetitorId] = useState<string>(competitors[0]?.id || '');
  const [percentageValue, setPercentageValue] = useState<number>(5);
  
  // Состояние для стратегии по наценке
  const [marginPercentage, setMarginPercentage] = useState<number>(30);
  const [minMarginPercentage, setMinMarginPercentage] = useState<number>(10);
  const [useMinMargin, setUseMinMargin] = useState<boolean>(false);
  
  // Состояние для стратегии позиции на рынке
  const [marketPosition, setMarketPosition] = useState<number>(25);
  
  // Состояние для стратегии с учетом остатков
  const [stockThreshold, setStockThreshold] = useState<number>(10);
  const [lowStockPercentage, setLowStockPercentage] = useState<number>(5);
  const [highStockPercentage, setHighStockPercentage] = useState<number>(5);
  
  // Состояние для пользовательской формулы
  const [customFormula, setCustomFormula] = useState<string>(initialFormula);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  // Генерация формулы на основе выбранных параметров
  const generateFormula = (): string => {
    switch (strategyType) {
      case VisualStrategyType.COMPETITOR_PRICE:
        switch (competitorPriceType) {
          case CompetitorPriceType.LOWER:
            return `competitor_price * ${(100 - percentageValue) / 100}`;
          case CompetitorPriceType.HIGHER:
            return `competitor_price * ${(100 + percentageValue) / 100}`;
          case CompetitorPriceType.MATCH:
            return 'competitor_price';
        }
        break;
      
      case VisualStrategyType.MARGIN:
        if (useMinMargin) {
          return `Math.max(cost_price * ${1 + minMarginPercentage / 100}, competitor_price * ${(100 - percentageValue) / 100})`;
        } else {
          return `cost_price * ${1 + marginPercentage / 100}`;
        }
      
      case VisualStrategyType.MARKET_POSITION:
        return `market_min + (market_max - market_min) * ${marketPosition / 100}`;
      
      case VisualStrategyType.STOCK_BASED:
        return `stock_level > ${stockThreshold} ? competitor_price * ${(100 - highStockPercentage) / 100} : competitor_price * ${(100 + lowStockPercentage) / 100}`;
      
      case VisualStrategyType.CUSTOM:
        return customFormula;
      
      default:
        return '';
    }
  };
  
  // Генерация описания стратегии
  const generateDescription = (): string => {
    const competitor = competitors.find(c => c.id === competitorId)?.name || 'конкурента';
    
    switch (strategyType) {
      case VisualStrategyType.COMPETITOR_PRICE:
        switch (competitorPriceType) {
          case CompetitorPriceType.LOWER:
            return `Установить цену на ${percentageValue}% ниже, чем у ${competitor}`;
          case CompetitorPriceType.HIGHER:
            return `Установить цену на ${percentageValue}% выше, чем у ${competitor}`;
          case CompetitorPriceType.MATCH:
            return `Установить точно такую же цену, как у ${competitor}`;
        }
        break;
      
      case VisualStrategyType.MARGIN:
        if (useMinMargin) {
          return `Цена на ${percentageValue}% ниже конкурента, но не ниже ${minMarginPercentage}% наценки`;
        } else {
          return `Установить цену на ${marginPercentage}% выше закупочной`;
        }
      
      case VisualStrategyType.MARKET_POSITION:
        if (marketPosition <= 25) {
          return `Установить цену в нижней части рыночного диапазона (${marketPosition}%)`;
        } else if (marketPosition <= 50) {
          return `Установить цену в средней части рыночного диапазона (${marketPosition}%)`;
        } else if (marketPosition <= 75) {
          return `Установить цену в верхней части рыночного диапазона (${marketPosition}%)`;
        } else {
          return `Установить цену в премиальном сегменте рыночного диапазона (${marketPosition}%)`;
        }
      
      case VisualStrategyType.STOCK_BASED:
        return `Если запасов больше ${stockThreshold} шт. - снижаем цену на ${highStockPercentage}%, если меньше - повышаем на ${lowStockPercentage}%`;
      
      case VisualStrategyType.CUSTOM:
        return 'Пользовательская формула расчета цены';
      
      default:
        return '';
    }
  };
  
  // Обработчик изменения параметров
  const handleChange = () => {
    const formula = generateFormula();
    const description = generateDescription();
    onChange(formula, description);
  };
  
  // Обновление при изменении любого параметра
  React.useEffect(() => {
    handleChange();
  }, [
    strategyType, 
    competitorPriceType, 
    competitorId, 
    percentageValue, 
    marginPercentage, 
    minMarginPercentage, 
    useMinMargin, 
    marketPosition, 
    stockThreshold, 
    lowStockPercentage, 
    highStockPercentage, 
    customFormula
  ]);
  
  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Выбор типа стратегии */}
      <Box>
        <Heading size="sm" mb={3}>Выберите тип стратегии</Heading>
        <RadioGroup onChange={(value) => setStrategyType(value as VisualStrategyType)} value={strategyType}>
          <Stack direction="row" spacing={4} flexWrap="wrap">
            {Object.values(VisualStrategyType).map((type) => (
              <Radio 
                key={type} 
                value={type}
                colorScheme="blue"
                size="lg"
              >
                {strategyTypeNames[type]}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </Box>
      
      <Divider />
      
      {/* Настройки для выбранного типа стратегии */}
      <Box>
        <Heading size="sm" mb={4}>Настройте параметры стратегии</Heading>
        
        {/* Стратегия относительно конкурента */}
        {strategyType === VisualStrategyType.COMPETITOR_PRICE && (
          <VStack spacing={4} align="stretch">
            <RadioGroup onChange={(value) => setCompetitorPriceType(value as CompetitorPriceType)} value={competitorPriceType}>
              <Stack direction="row" spacing={4}>
                {Object.values(CompetitorPriceType).map((type) => (
                  <Radio 
                    key={type} 
                    value={type}
                    colorScheme="blue"
                  >
                    {competitorPriceTypeNames[type]}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            
            <FormControl>
              <FormLabel>Выберите конкурента</FormLabel>
              <Select 
                value={competitorId} 
                onChange={(e) => setCompetitorId(e.target.value)}
              >
                {competitors.map(competitor => (
                  <option key={competitor.id} value={competitor.id}>
                    {competitor.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            {competitorPriceType !== CompetitorPriceType.MATCH && (
              <Box>
                <FormLabel>
                  {competitorPriceType === CompetitorPriceType.LOWER ? 'На сколько % ниже' : 'На сколько % выше'}
                </FormLabel>
                <Flex align="center">
                  <Slider
                    value={percentageValue}
                    min={1}
                    max={50}
                    step={1}
                    onChange={(val) => setPercentageValue(val)}
                    flex="1"
                    mr={4}
                    colorScheme={competitorPriceType === CompetitorPriceType.LOWER ? 'green' : 'blue'}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                  <Badge 
                    fontSize="lg" 
                    colorScheme={competitorPriceType === CompetitorPriceType.LOWER ? 'green' : 'blue'}
                    p={2}
                    borderRadius="md"
                  >
                    {percentageValue}%
                  </Badge>
                </Flex>
              </Box>
            )}
          </VStack>
        )}
        
        {/* Стратегия по наценке */}
        {strategyType === VisualStrategyType.MARGIN && (
          <VStack spacing={4} align="stretch">
            <Box>
              <FormLabel>Наценка от закупочной цены</FormLabel>
              <Flex align="center">
                <Slider
                  value={marginPercentage}
                  min={1}
                  max={100}
                  step={1}
                  onChange={(val) => setMarginPercentage(val)}
                  flex="1"
                  mr={4}
                  colorScheme="blue"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <Badge fontSize="lg" colorScheme="blue" p={2} borderRadius="md">
                  {marginPercentage}%
                </Badge>
              </Flex>
            </Box>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Учитывать цену конкурента
              </FormLabel>
              <Switch 
                colorScheme="blue" 
                isChecked={useMinMargin}
                onChange={(e) => setUseMinMargin(e.target.checked)}
              />
            </FormControl>
            
            {useMinMargin && (
              <VStack spacing={4} align="stretch" pl={4} borderLeftWidth="2px" borderLeftColor="blue.200">
                <Box>
                  <FormLabel>Минимальная наценка</FormLabel>
                  <Flex align="center">
                    <Slider
                      value={minMarginPercentage}
                      min={1}
                      max={50}
                      step={1}
                      onChange={(val) => setMinMarginPercentage(val)}
                      flex="1"
                      mr={4}
                      colorScheme="red"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Badge fontSize="lg" colorScheme="red" p={2} borderRadius="md">
                      {minMarginPercentage}%
                    </Badge>
                  </Flex>
                </Box>
                
                <Box>
                  <FormLabel>На сколько % ниже конкурента</FormLabel>
                  <Flex align="center">
                    <Slider
                      value={percentageValue}
                      min={1}
                      max={30}
                      step={1}
                      onChange={(val) => setPercentageValue(val)}
                      flex="1"
                      mr={4}
                      colorScheme="green"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <Badge fontSize="lg" colorScheme="green" p={2} borderRadius="md">
                      {percentageValue}%
                    </Badge>
                  </Flex>
                </Box>
              </VStack>
            )}
          </VStack>
        )}
        
        {/* Стратегия позиции на рынке */}
        {strategyType === VisualStrategyType.MARKET_POSITION && (
          <VStack spacing={4} align="stretch">
            <Box>
              <FormLabel>Позиция в рыночном диапазоне</FormLabel>
              <Flex direction="column">
                <Slider
                  value={marketPosition}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(val) => setMarketPosition(val)}
                  colorScheme="purple"
                >
                  <SliderMark value={0} mt={2} ml={-2} fontSize="sm">
                    Мин
                  </SliderMark>
                  <SliderMark value={25} mt={2} ml={-2} fontSize="sm">
                    25%
                  </SliderMark>
                  <SliderMark value={50} mt={2} ml={-2} fontSize="sm">
                    50%
                  </SliderMark>
                  <SliderMark value={75} mt={2} ml={-2} fontSize="sm">
                    75%
                  </SliderMark>
                  <SliderMark value={100} mt={2} ml={-2} fontSize="sm">
                    Макс
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                
                <Flex justify="space-between" mt={8}>
                  <Badge colorScheme="green" p={2} borderRadius="md">
                    Эконом
                  </Badge>
                  <Badge colorScheme="blue" p={2} borderRadius="md">
                    Средний
                  </Badge>
                  <Badge colorScheme="purple" p={2} borderRadius="md">
                    Высокий
                  </Badge>
                  <Badge colorScheme="red" p={2} borderRadius="md">
                    Премиум
                  </Badge>
                </Flex>
                
                <Box 
                  mt={4} 
                  p={3} 
                  bg={highlightColor} 
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor="purple.500"
                >
                  <Text>
                    Ваша цена будет установлена на уровне <Badge colorScheme="purple">{marketPosition}%</Badge> от рыночного диапазона цен на этот товар.
                  </Text>
                </Box>
              </Flex>
            </Box>
          </VStack>
        )}
        
        {/* Стратегия с учетом остатков */}
        {strategyType === VisualStrategyType.STOCK_BASED && (
          <VStack spacing={4} align="stretch">
            <Box>
              <FormLabel>Пороговое значение остатков</FormLabel>
              <Flex align="center">
                <Slider
                  value={stockThreshold}
                  min={1}
                  max={50}
                  step={1}
                  onChange={(val) => setStockThreshold(val)}
                  flex="1"
                  mr={4}
                  colorScheme="teal"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <Badge fontSize="lg" colorScheme="teal" p={2} borderRadius="md">
                  {stockThreshold} шт.
                </Badge>
              </Flex>
            </Box>
            
            <Divider />
            
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <Box flex="1">
                <FormLabel>
                  <Flex align="center">
                    <ArrowDownIcon mr={2} color="green.500" />
                    Если запасов много (больше {stockThreshold} шт.)
                  </Flex>
                </FormLabel>
                <Flex align="center">
                  <Slider
                    value={highStockPercentage}
                    min={1}
                    max={30}
                    step={1}
                    onChange={(val) => setHighStockPercentage(val)}
                    flex="1"
                    mr={4}
                    colorScheme="green"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                  <Badge fontSize="lg" colorScheme="green" p={2} borderRadius="md">
                    -{highStockPercentage}%
                  </Badge>
                </Flex>
                <Text fontSize="sm" color={textColor} mt={1}>
                  Снижаем цену для ускорения продаж
                </Text>
              </Box>
              
              <Box flex="1">
                <FormLabel>
                  <Flex align="center">
                    <ArrowUpIcon mr={2} color="red.500" />
                    Если запасов мало (меньше {stockThreshold} шт.)
                  </Flex>
                </FormLabel>
                <Flex align="center">
                  <Slider
                    value={lowStockPercentage}
                    min={1}
                    max={30}
                    step={1}
                    onChange={(val) => setLowStockPercentage(val)}
                    flex="1"
                    mr={4}
                    colorScheme="red"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                  <Badge fontSize="lg" colorScheme="red" p={2} borderRadius="md">
                    +{lowStockPercentage}%
                  </Badge>
                </Flex>
                <Text fontSize="sm" color={textColor} mt={1}>
                  Повышаем цену для увеличения маржи
                </Text>
              </Box>
            </Flex>
          </VStack>
        )}
        
        {/* Пользовательская формула */}
        {strategyType === VisualStrategyType.CUSTOM && (
          <VStack spacing={4} align="stretch">
            <Box 
              p={3} 
              bg="orange.50" 
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="orange.500"
            >
              <Flex align="center">
                <WarningIcon color="orange.500" mr={2} />
                <Text color="orange.700">
                  Режим для опытных пользователей. Рекомендуем использовать готовые стратегии.
                </Text>
              </Flex>
            </Box>
            
            <FormControl>
              <FormLabel>Введите формулу расчета цены</FormLabel>
              <Input
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
                placeholder="Например: cost_price * 1.3 или competitor_price * 0.95"
                fontFamily="monospace"
              />
              <Text fontSize="sm" color={textColor} mt={1}>
                Доступные переменные: cost_price, competitor_price, market_min, market_max, market_avg, stock_level
              </Text>
            </FormControl>
          </VStack>
        )}
      </Box>
      
      {/* Предпросмотр формулы */}
      <Box 
        p={4} 
        bg={highlightColor} 
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={2}>Итоговая формула</Heading>
        <Text fontFamily="monospace" fontSize="md">
          {generateFormula()}
        </Text>
        
        <Divider my={3} />
        
        <Heading size="sm" mb={2}>Описание стратегии</Heading>
        <Text>
          {generateDescription()}
        </Text>
      </Box>
    </VStack>
  );
};

export default VisualStrategyBuilder;
