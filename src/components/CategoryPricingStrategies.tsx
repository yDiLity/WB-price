import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Icon,
  List,
  ListItem,
  ListIcon,
  Divider,
  useColorModeValue,
  Tooltip,
  Spinner
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon, StarIcon, WarningIcon } from '@chakra-ui/icons';
import { getCategoryPath } from '../data/categories';

// Интерфейс для стратегии ценообразования
interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  recommendedFor: string[];
  notRecommendedFor?: string[];
  expectedResult: string;
  complexity: 'low' | 'medium' | 'high';
  aiAssisted: boolean;
  recommended?: boolean;
}

// Специфические стратегии для разных категорий
const categoryPricingStrategies: Record<string, PricingStrategy[]> = {
  // Электроника
  electronics: [
    {
      id: 'tech_lifecycle',
      name: 'Жизненный цикл технологии',
      description: 'Стратегия, учитывающая стадию жизненного цикла технологии и скорость её устаревания',
      benefits: [
        'Максимизация прибыли на каждом этапе жизненного цикла',
        'Автоматическая корректировка цен при выходе новых моделей',
        'Оптимизация складских запасов'
      ],
      recommendedFor: [
        'Смартфоны и гаджеты',
        'Ноутбуки и компьютеры',
        'Телевизоры и аудиотехника'
      ],
      expectedResult: 'Увеличение маржинальности на 15-20% и ускорение оборота товаров',
      complexity: 'high',
      aiAssisted: true,
      recommended: true
    },
    {
      id: 'accessory_bundling',
      name: 'Связанные аксессуары',
      description: 'Стратегия, оптимизирующая цены основных товаров и аксессуаров к ним как единой экосистемы',
      benefits: [
        'Увеличение среднего чека',
        'Повышение лояльности клиентов',
        'Конкурентное преимущество'
      ],
      recommendedFor: [
        'Смартфоны и аксессуары',
        'Ноутбуки и периферия',
        'Фототехника и объективы'
      ],
      expectedResult: 'Рост продаж аксессуаров на 25-30% и основных товаров на 10-15%',
      complexity: 'medium',
      aiAssisted: true
    }
  ],
  
  // Одежда и обувь
  clothing: [
    {
      id: 'seasonal_pricing',
      name: 'Сезонное ценообразование',
      description: 'Динамическое изменение цен в зависимости от сезона и актуальности товара',
      benefits: [
        'Максимизация прибыли в пиковые сезоны',
        'Эффективная распродажа товаров в конце сезона',
        'Оптимизация складских запасов'
      ],
      recommendedFor: [
        'Сезонная одежда и обувь',
        'Аксессуары',
        'Спортивная одежда'
      ],
      expectedResult: 'Увеличение годовой прибыли на 20-25% и снижение остатков на 30%',
      complexity: 'medium',
      aiAssisted: true,
      recommended: true
    },
    {
      id: 'fashion_trend',
      name: 'Трендовое ценообразование',
      description: 'Корректировка цен на основе анализа модных тенденций и популярности товаров',
      benefits: [
        'Быстрая реакция на изменение трендов',
        'Премиальные цены на трендовые товары',
        'Своевременное снижение цен на уходящие тренды'
      ],
      recommendedFor: [
        'Модная одежда',
        'Дизайнерские аксессуары',
        'Молодежные бренды'
      ],
      notRecommendedFor: [
        'Базовая одежда',
        'Классические модели'
      ],
      expectedResult: 'Повышение маржинальности на 15-20% для трендовых товаров',
      complexity: 'high',
      aiAssisted: true
    }
  ],
  
  // Красота и здоровье
  beauty: [
    {
      id: 'ingredient_trend',
      name: 'Ингредиентный тренд',
      description: 'Стратегия, учитывающая популярность ингредиентов и их восприятие потребителями',
      benefits: [
        'Премиальные цены на товары с трендовыми ингредиентами',
        'Автоматическая корректировка при изменении трендов',
        'Оптимизация маркетинговых расходов'
      ],
      recommendedFor: [
        'Уходовая косметика',
        'Декоративная косметика',
        'Парфюмерия'
      ],
      expectedResult: 'Увеличение маржинальности на 20-25% для товаров с популярными ингредиентами',
      complexity: 'medium',
      aiAssisted: true,
      recommended: true
    },
    {
      id: 'eco_premium',
      name: 'Эко-премиум',
      description: 'Стратегия премиального ценообразования для экологичных и натуральных товаров',
      benefits: [
        'Высокая маржинальность',
        'Привлечение экологически сознательных потребителей',
        'Укрепление имиджа бренда'
      ],
      recommendedFor: [
        'Натуральная косметика',
        'Органические продукты',
        'Эко-товары'
      ],
      expectedResult: 'Премиум-наценка 30-40% при сохранении объема продаж',
      complexity: 'low',
      aiAssisted: false
    }
  ],
  
  // Продукты питания
  food: [
    {
      id: 'freshness_pricing',
      name: 'Ценообразование по свежести',
      description: 'Динамическое изменение цен в зависимости от срока годности и свежести продуктов',
      benefits: [
        'Минимизация списаний',
        'Оптимизация оборачиваемости',
        'Максимизация прибыли'
      ],
      recommendedFor: [
        'Скоропортящиеся продукты',
        'Фрукты и овощи',
        'Молочные продукты'
      ],
      expectedResult: 'Снижение списаний на 40-50% и увеличение общей прибыли на 15-20%',
      complexity: 'medium',
      aiAssisted: true,
      recommended: true
    },
    {
      id: 'bundle_meal',
      name: 'Комплексные наборы',
      description: 'Стратегия формирования и оптимизации цен на наборы продуктов для приготовления блюд',
      benefits: [
        'Увеличение среднего чека',
        'Ускорение продаж медленно оборачиваемых товаров',
        'Повышение лояльности клиентов'
      ],
      recommendedFor: [
        'Ингредиенты для блюд',
        'Готовые наборы',
        'Тематические продукты'
      ],
      expectedResult: 'Рост продаж на 25-30% для товаров в наборах',
      complexity: 'low',
      aiAssisted: false
    }
  ]
};

interface CategoryPricingStrategiesProps {
  categoryId: string;
  onSelectStrategy?: (strategyId: string) => void;
}

export default function CategoryPricingStrategies({ 
  categoryId, 
  onSelectStrategy 
}: CategoryPricingStrategiesProps) {
  const [strategies, setStrategies] = useState<PricingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const recommendedBg = useColorModeValue('blue.50', 'blue.900');
  
  // Загружаем стратегии при изменении категории
  useEffect(() => {
    const loadStrategies = async () => {
      setIsLoading(true);
      
      // В реальном приложении здесь был бы запрос к API
      // Для демонстрации используем заготовленные данные
      setTimeout(() => {
        // Находим родительскую категорию, если передана подкатегория
        const categoryPath = getCategoryPath(categoryId);
        const parentCategory = categoryPath.length > 1 ? categoryPath[0].id : categoryId;
        
        setStrategies(categoryPricingStrategies[parentCategory] || []);
        setIsLoading(false);
      }, 500);
    };
    
    loadStrategies();
  }, [categoryId]);
  
  // Получение цвета для уровня сложности
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'gray';
    }
  };
  
  // Получение текста для уровня сложности
  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      default: return 'Неизвестно';
    }
  };
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" p={8}>
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }
  
  if (strategies.length === 0) {
    return (
      <Box 
        p={4} 
        bg={cardBg} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Heading size="md" mb={4}>Стратегии ценообразования</Heading>
        <Text color="gray.500">
          Для данной категории специализированные стратегии не определены
        </Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading size="md" mb={4}>Специализированные стратегии ценообразования</Heading>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        {strategies.map(strategy => (
          <Card 
            key={strategy.id} 
            bg={strategy.recommended ? recommendedBg : cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <CardHeader pb={2}>
              <Flex justify="space-between" align="start">
                <Heading size="md">
                  {strategy.name}
                  {strategy.recommended && (
                    <Tooltip label="Рекомендуемая стратегия для данной категории">
                      <Badge ml={2} colorScheme="blue">Рекомендуется</Badge>
                    </Tooltip>
                  )}
                </Heading>
                {strategy.aiAssisted && (
                  <Tooltip label="Использует ИИ для оптимизации цен">
                    <Badge colorScheme="purple">ИИ</Badge>
                  </Tooltip>
                )}
              </Flex>
            </CardHeader>
            
            <CardBody py={2}>
              <Text mb={3}>{strategy.description}</Text>
              
              <Heading size="xs" mb={1}>Преимущества:</Heading>
              <List spacing={1} mb={3}>
                {strategy.benefits.map((benefit, index) => (
                  <ListItem key={index} fontSize="sm">
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    {benefit}
                  </ListItem>
                ))}
              </List>
              
              <Heading size="xs" mb={1}>Рекомендуется для:</Heading>
              <List spacing={1} mb={3}>
                {strategy.recommendedFor.map((item, index) => (
                  <ListItem key={index} fontSize="sm">
                    <ListIcon as={StarIcon} color="blue.500" />
                    {item}
                  </ListItem>
                ))}
              </List>
              
              {strategy.notRecommendedFor && (
                <>
                  <Heading size="xs" mb={1}>Не рекомендуется для:</Heading>
                  <List spacing={1} mb={3}>
                    {strategy.notRecommendedFor.map((item, index) => (
                      <ListItem key={index} fontSize="sm">
                        <ListIcon as={WarningIcon} color="red.500" />
                        {item}
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              <Flex justify="space-between" align="center" mt={2}>
                <Text fontSize="sm">
                  <strong>Ожидаемый результат:</strong> {strategy.expectedResult}
                </Text>
                <Badge colorScheme={getComplexityColor(strategy.complexity)}>
                  Сложность: {getComplexityText(strategy.complexity)}
                </Badge>
              </Flex>
            </CardBody>
            
            <CardFooter pt={2}>
              <Button 
                colorScheme="blue" 
                width="100%"
                onClick={() => onSelectStrategy && onSelectStrategy(strategy.id)}
              >
                Применить стратегию
              </Button>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
