import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  useColorModeValue,
  Badge,
  Flex,
  SimpleGrid,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Card,
  CardBody,
  IconButton,
  Select
} from '@chakra-ui/react';
import { AddIcon, InfoIcon, CheckIcon } from '@chakra-ui/icons';

// Типы переменных для формулы
interface FormulaVariable {
  id: string;
  name: string;
  description: string;
  example: string;
}

// Типы операторов для формулы
interface FormulaOperator {
  id: string;
  symbol: string;
  name: string;
  description: string;
}

// Типы готовых формул
interface PredefinedFormula {
  id: string;
  name: string;
  formula: string;
  description: string;
}

// Доступные переменные для формулы
const formulaVariables: FormulaVariable[] = [
  {
    id: 'cost_price',
    name: 'Закупочная цена',
    description: 'Цена, по которой вы закупаете товар',
    example: 'cost_price'
  },
  {
    id: 'competitor_price',
    name: 'Цена конкурента',
    description: 'Текущая цена выбранного конкурента',
    example: 'competitor_price'
  },
  {
    id: 'market_min',
    name: 'Минимальная цена на рынке',
    description: 'Минимальная цена на этот товар среди всех продавцов',
    example: 'market_min'
  },
  {
    id: 'market_max',
    name: 'Максимальная цена на рынке',
    description: 'Максимальная цена на этот товар среди всех продавцов',
    example: 'market_max'
  },
  {
    id: 'market_avg',
    name: 'Средняя цена на рынке',
    description: 'Средняя цена на этот товар среди всех продавцов',
    example: 'market_avg'
  },
  {
    id: 'stock_level',
    name: 'Уровень запасов',
    description: 'Текущий уровень запасов товара на складе',
    example: 'stock_level'
  }
];

// Доступные операторы для формулы
const formulaOperators: FormulaOperator[] = [
  {
    id: 'multiply',
    symbol: '*',
    name: 'Умножить',
    description: 'Умножение двух значений'
  },
  {
    id: 'divide',
    symbol: '/',
    name: 'Разделить',
    description: 'Деление одного значения на другое'
  },
  {
    id: 'add',
    symbol: '+',
    name: 'Сложить',
    description: 'Сложение двух значений'
  },
  {
    id: 'subtract',
    symbol: '-',
    name: 'Вычесть',
    description: 'Вычитание одного значения из другого'
  },
  {
    id: 'min',
    symbol: 'Math.min',
    name: 'Минимум',
    description: 'Выбор минимального из двух значений'
  },
  {
    id: 'max',
    symbol: 'Math.max',
    name: 'Максимум',
    description: 'Выбор максимального из двух значений'
  }
];

// Готовые формулы для быстрого выбора
const predefinedFormulas: PredefinedFormula[] = [
  {
    id: 'margin_30',
    name: 'Наценка 30%',
    formula: 'cost_price * 1.3',
    description: 'Установить цену на 30% выше закупочной'
  },
  {
    id: 'competitor_minus_5',
    name: 'На 5% ниже конкурента',
    formula: 'competitor_price * 0.95',
    description: 'Установить цену на 5% ниже цены конкурента'
  },
  {
    id: 'competitor_plus_5',
    name: 'На 5% выше конкурента',
    formula: 'competitor_price * 1.05',
    description: 'Установить цену на 5% выше цены конкурента'
  },
  {
    id: 'min_margin',
    name: 'Минимальная наценка 10%',
    formula: 'Math.max(cost_price * 1.1, competitor_price * 0.95)',
    description: 'Цена на 5% ниже конкурента, но не ниже 10% наценки'
  },
  {
    id: 'market_position',
    name: 'Позиция на рынке (25%)',
    formula: 'market_min + (market_max - market_min) * 0.25',
    description: 'Установить цену в нижней четверти рыночного диапазона'
  },
  {
    id: 'stock_based',
    name: 'С учетом остатков',
    formula: 'stock_level > 10 ? competitor_price * 0.95 : competitor_price * 1.05',
    description: 'Если запасов много - снижаем цену, если мало - повышаем'
  }
];

interface FormulaBuilderProps {
  initialValue?: string;
  onChange: (formula: string) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ initialValue = '', onChange }) => {
  const [formula, setFormula] = useState(initialValue);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Обработчик изменения формулы
  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula);
    onChange(newFormula);

    // Симуляция предпросмотра результата
    try {
      // В реальном приложении здесь был бы расчет на основе тестовых данных
      setPreviewResult('Формула корректна');
    } catch (error) {
      setPreviewResult('Ошибка в формуле');
    }
  };

  // Добавление переменной в формулу
  const addVariable = (variable: FormulaVariable) => {
    const newFormula = formula ? `${formula} ${variable.id}` : variable.id;
    handleFormulaChange(newFormula);
  };

  // Добавление оператора в формулу
  const addOperator = (operator: FormulaOperator) => {
    const newFormula = formula ? `${formula} ${operator.symbol} ` : '';
    handleFormulaChange(newFormula);
  };

  // Добавление числа в формулу
  const addNumber = (number: number) => {
    const newFormula = formula ? `${formula} ${number}` : `${number}`;
    handleFormulaChange(newFormula);
  };

  // Применение готовой формулы
  const applyPredefinedFormula = (predefinedFormula: PredefinedFormula) => {
    handleFormulaChange(predefinedFormula.formula);
  };

  // Очистка формулы
  const clearFormula = () => {
    handleFormulaChange('');
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Поле ввода формулы */}
      <FormControl>
        <FormLabel fontWeight="bold">Формула расчета цены</FormLabel>
        <Input
          value={formula}
          onChange={(e) => handleFormulaChange(e.target.value)}
          placeholder="Например: cost_price * 1.3 или competitor_price * 0.95"
          size="lg"
          bg={bgColor}
          borderColor={borderColor}
          borderWidth="2px"
          borderRadius="md"
          p={4}
          fontFamily="monospace"
          _focus={{
            borderColor: accentColor,
            boxShadow: `0 0 0 1px ${accentColor}`
          }}
          className="purple-form-border"
        />
        <FormHelperText>
          Введите формулу для расчета цены или используйте конструктор ниже
        </FormHelperText>
      </FormControl>

      {/* Готовые формулы */}
      <Box>
        <Heading size="sm" mb={3}>Готовые формулы</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
          {predefinedFormulas.map((predefined) => (
            <Card
              key={predefined.id}
              bg={cardBg}
              cursor="pointer"
              onClick={() => applyPredefinedFormula(predefined)}
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
              transition="all 0.2s"
              size="sm"
            >
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Heading size="xs">{predefined.name}</Heading>
                  <Text fontSize="xs" color={textColor}>{predefined.description}</Text>
                  <Badge colorScheme="blue" mt={1} fontFamily="monospace">
                    {predefined.formula}
                  </Badge>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Конструктор формулы */}
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem border="1px" borderColor={borderColor} borderRadius="md">
          <AccordionButton py={3}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Конструктор формулы</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              {/* Переменные */}
              <Box>
                <Text fontWeight="medium" mb={2}>Переменные</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {formulaVariables.map((variable) => (
                    <Tooltip key={variable.id} label={variable.description}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => addVariable(variable)}
                      >
                        {variable.name}
                      </Button>
                    </Tooltip>
                  ))}
                </Flex>
              </Box>

              {/* Операторы */}
              <Box>
                <Text fontWeight="medium" mb={2}>Операторы</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {formulaOperators.map((operator) => (
                    <Tooltip key={operator.id} label={operator.description}>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => addOperator(operator)}
                      >
                        {operator.name} ({operator.symbol})
                      </Button>
                    </Tooltip>
                  ))}
                </Flex>
              </Box>

              {/* Числа */}
              <Box>
                <Text fontWeight="medium" mb={2}>Числа и проценты</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {[0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3, 1.5, 2].map((number) => (
                    <Button
                      key={number}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => addNumber(number)}
                    >
                      {number}
                    </Button>
                  ))}
                </Flex>
              </Box>

              {/* Скобки и другие элементы */}
              <Box>
                <Text fontWeight="medium" mb={2}>Дополнительно</Text>
                <Flex flexWrap="wrap" gap={2}>
                  <Button size="sm" colorScheme="orange" variant="outline" onClick={() => handleFormulaChange(`${formula} (`)}>
                    (
                  </Button>
                  <Button size="sm" colorScheme="orange" variant="outline" onClick={() => handleFormulaChange(`${formula} )`)}>
                    )
                  </Button>
                  <Button size="sm" colorScheme="red" variant="outline" onClick={clearFormula}>
                    Очистить
                  </Button>
                </Flex>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Предпросмотр результата */}
      {previewResult && (
        <Box p={3} bg={previewResult === 'Формула корректна' ? 'green.50' : 'red.50'} borderRadius="md">
          <Flex align="center">
            {previewResult === 'Формула корректна' ? (
              <CheckIcon color="green.500" mr={2} />
            ) : (
              <InfoIcon color="red.500" mr={2} />
            )}
            <Text color={previewResult === 'Формула корректна' ? 'green.600' : 'red.600'}>
              {previewResult}
            </Text>
          </Flex>
        </Box>
      )}
    </VStack>
  );
};

export default FormulaBuilder;
