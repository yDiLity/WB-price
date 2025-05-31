import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  SimpleGrid,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
  Tooltip,
  Icon,
  Progress
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { getCategoryPath } from '../data/categories';

// Интерфейс для метрик, специфичных для категории
interface CategoryMetrics {
  [key: string]: {
    name: string;
    value: number | string;
    change?: number;
    description?: string;
    format?: 'number' | 'percent' | 'currency' | 'rating' | 'text';
    status?: 'positive' | 'negative' | 'neutral';
  };
}

// Специфические метрики для разных категорий
const categorySpecificMetrics: Record<string, CategoryMetrics> = {
  // Электроника
  electronics: {
    techRelevance: {
      name: 'Актуальность технологии',
      value: 87,
      change: 2.3,
      description: 'Показывает, насколько актуальны технические характеристики товара по сравнению с новинками рынка',
      format: 'percent',
      status: 'positive'
    },
    warrantyImpact: {
      name: 'Влияние гарантии',
      value: 15,
      change: 3.1,
      description: 'Показывает, насколько гарантийные условия влияют на решение о покупке',
      format: 'percent',
      status: 'positive'
    },
    techObsolescence: {
      name: 'Скорость устаревания',
      value: 'Средняя',
      description: 'Оценка скорости морального устаревания товара',
      format: 'text'
    }
  },
  
  // Одежда и обувь
  clothing: {
    seasonalDemand: {
      name: 'Сезонный спрос',
      value: 92,
      change: 18.5,
      description: 'Показывает, насколько товар соответствует текущему сезону',
      format: 'percent',
      status: 'positive'
    },
    fashionTrend: {
      name: 'Соответствие трендам',
      value: 76,
      change: -4.2,
      description: 'Оценка соответствия товара текущим модным тенденциям',
      format: 'percent',
      status: 'negative'
    },
    returnRate: {
      name: 'Частота возвратов',
      value: 8.3,
      change: -1.2,
      description: 'Процент возвратов товара из-за несоответствия размеру или ожиданиям',
      format: 'percent',
      status: 'positive'
    }
  },
  
  // Красота и здоровье
  beauty: {
    ingredientTrend: {
      name: 'Популярность ингредиентов',
      value: 94,
      change: 7.8,
      description: 'Показывает, насколько популярны ингредиенты товара среди потребителей',
      format: 'percent',
      status: 'positive'
    },
    ecoFriendly: {
      name: 'Экологичность',
      value: 82,
      change: 12.5,
      description: 'Оценка экологичности товара и упаковки',
      format: 'percent',
      status: 'positive'
    },
    shelfLife: {
      name: 'Срок годности',
      value: '18 месяцев',
      description: 'Средний срок годности товара',
      format: 'text'
    }
  },
  
  // Продукты питания
  food: {
    nutritionalValue: {
      name: 'Пищевая ценность',
      value: 78,
      change: 5.2,
      description: 'Оценка пищевой ценности продукта',
      format: 'percent',
      status: 'positive'
    },
    organicRating: {
      name: 'Органический рейтинг',
      value: 4.2,
      change: 0.3,
      description: 'Рейтинг органичности и натуральности продукта',
      format: 'rating',
      status: 'positive'
    },
    shelfLife: {
      name: 'Срок хранения',
      value: '6 месяцев',
      description: 'Средний срок хранения продукта',
      format: 'text'
    }
  },
  
  // Детские товары
  kids: {
    safetyRating: {
      name: 'Рейтинг безопасности',
      value: 4.8,
      change: 0.2,
      description: 'Оценка безопасности товара для детей',
      format: 'rating',
      status: 'positive'
    },
    ageRelevance: {
      name: 'Соответствие возрасту',
      value: 95,
      change: 0,
      description: 'Показывает, насколько товар соответствует указанной возрастной группе',
      format: 'percent',
      status: 'neutral'
    },
    educationalValue: {
      name: 'Образовательная ценность',
      value: 87,
      change: 5.5,
      description: 'Оценка образовательной ценности товара',
      format: 'percent',
      status: 'positive'
    }
  }
};

interface CategorySpecificMetricsProps {
  categoryId: string;
  productId?: string;
}

export default function CategorySpecificMetrics({ categoryId, productId }: CategorySpecificMetricsProps) {
  const [metrics, setMetrics] = useState<CategoryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Загружаем метрики при изменении категории
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // В реальном приложении здесь был бы запрос к API
      // Для демонстрации используем заготовленные данные
      setTimeout(() => {
        // Находим родительскую категорию, если передана подкатегория
        const categoryPath = getCategoryPath(categoryId);
        const parentCategory = categoryPath.length > 1 ? categoryPath[0].id : categoryId;
        
        setMetrics(categorySpecificMetrics[parentCategory] || null);
        setIsLoading(false);
      }, 500);
    };
    
    loadMetrics();
  }, [categoryId]);
  
  // Форматирование значения в зависимости от типа
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percent':
        return `${value}%`;
      case 'currency':
        return `${value.toLocaleString()} ₽`;
      case 'rating':
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };
  
  if (!metrics) {
    return (
      <Box 
        p={4} 
        bg={cardBg} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Heading size="md" mb={4}>Специфические метрики</Heading>
        <Text color="gray.500">
          Для данной категории специфические метрики не определены
        </Text>
      </Box>
    );
  }
  
  return (
    <Box 
      p={4} 
      bg={cardBg} 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Heading size="md" mb={4}>Специфические метрики категории</Heading>
      
      {isLoading ? (
        <Flex justify="center" align="center" py={4}>
          <Progress size="xs" isIndeterminate width="100%" />
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {Object.entries(metrics).map(([key, metric]) => (
            <Stat key={key} px={2} py={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
              <Flex align="center">
                <StatLabel>{metric.name}</StatLabel>
                {metric.description && (
                  <Tooltip label={metric.description} placement="top">
                    <Box display="inline-block" ml={1}>
                      <InfoIcon boxSize={3} color="gray.400" />
                    </Box>
                  </Tooltip>
                )}
              </Flex>
              
              <StatNumber fontSize="2xl">
                {formatValue(metric.value, metric.format)}
              </StatNumber>
              
              {metric.change !== undefined && (
                <StatHelpText>
                  <StatArrow type={metric.change > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(metric.change).toFixed(1)}%
                </StatHelpText>
              )}
              
              {metric.status && (
                <Badge 
                  colorScheme={
                    metric.status === 'positive' ? 'green' : 
                    metric.status === 'negative' ? 'red' : 'gray'
                  }
                  mt={1}
                >
                  {metric.status === 'positive' ? 'Хорошо' : 
                   metric.status === 'negative' ? 'Требует внимания' : 'Нейтрально'}
                </Badge>
              )}
            </Stat>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
