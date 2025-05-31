import React from 'react';
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Link,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';
import { FaStore, FaStar, FaShippingFast, FaCommentDots, FaThumbsUp } from 'react-icons/fa';
import { Product, CompetitorProduct } from '../../types';

interface CompetitorInsightsProps {
  product: Product;
  competitors: CompetitorProduct[];
}

/**
 * Компонент для отображения аналитики по конкурентам
 */
const CompetitorInsights: React.FC<CompetitorInsightsProps> = ({
  product,
  competitors
}) => {
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Получение цвета для разницы в цене
  const getPriceDiffColor = (diff: number) => {
    if (diff > 10) return 'green.500';
    if (diff > 0) return 'green.300';
    if (diff < -10) return 'red.500';
    if (diff < 0) return 'red.300';
    return 'gray.500';
  };
  
  // Вычисление статистики по конкурентам
  const getCompetitorStats = () => {
    if (!competitors || competitors.length === 0) {
      return {
        avgPrice: product.price.current,
        minPrice: product.price.current,
        maxPrice: product.price.current,
        priceRange: 0,
        competitorsBelow: 0,
        competitorsAbove: 0,
        avgRating: 0,
        bestRating: 0
      };
    }
    
    const prices = competitors.map(comp => comp.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = maxPrice - minPrice;
    
    const competitorsBelow = competitors.filter(comp => comp.price < product.price.current).length;
    const competitorsAbove = competitors.filter(comp => comp.price > product.price.current).length;
    
    // Рейтинги (моковые данные)
    const ratings = competitors.map(comp => comp.rating || Math.random() * 2 + 3);
    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const bestRating = Math.max(...ratings);
    
    return {
      avgPrice,
      minPrice,
      maxPrice,
      priceRange,
      competitorsBelow,
      competitorsAbove,
      avgRating,
      bestRating
    };
  };
  
  // Получение моковых данных о продавце
  const getSellerInfo = (competitor: CompetitorProduct) => {
    // В реальном приложении здесь будет запрос к API для получения информации о продавце
    // Для демонстрации используем моковые данные
    
    const sellerRating = competitor.rating || (Math.random() * 2 + 3).toFixed(1);
    const reviewsCount = Math.floor(Math.random() * 1000);
    const ordersCount = Math.floor(Math.random() * 10000);
    const deliveryDays = Math.floor(Math.random() * 5) + 1;
    
    return {
      sellerRating,
      reviewsCount,
      ordersCount,
      deliveryDays
    };
  };
  
  // Получаем статистику
  const stats = getCompetitorStats();
  
  // Если нет конкурентов, показываем сообщение
  if (!competitors || competitors.length === 0) {
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
          Аналитика по конкурентам
        </Text>
        <Text color={textColor} textAlign="center">
          Нет связанных конкурентов для анализа
        </Text>
      </Box>
    );
  }
  
  // Сортируем конкурентов по цене (от низкой к высокой)
  const sortedCompetitors = [...competitors].sort((a, b) => a.price - b.price);
  
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
        Аналитика по конкурентам
      </Text>
      
      <SimpleGrid columns={2} spacing={6} mb={6}>
        <Stat>
          <StatLabel>Средняя цена конкурентов</StatLabel>
          <StatNumber>{formatPrice(stats.avgPrice)}</StatNumber>
          <StatHelpText>
            <StatArrow 
              type={product.price.current > stats.avgPrice ? 'increase' : 'decrease'} 
            />
            {Math.abs(((product.price.current - stats.avgPrice) / stats.avgPrice) * 100).toFixed(1)}% от вашей цены
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Диапазон цен</StatLabel>
          <StatNumber>{formatPrice(stats.minPrice)} - {formatPrice(stats.maxPrice)}</StatNumber>
          <StatHelpText>
            Разброс: {formatPrice(stats.priceRange)}
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Позиция по цене</StatLabel>
          <HStack>
            <Progress 
              value={(product.price.current - stats.minPrice) / (stats.maxPrice - stats.minPrice) * 100} 
              colorScheme="blue"
              size="sm"
              width="100%"
              borderRadius="full"
            />
          </HStack>
          <StatHelpText>
            {stats.competitorsBelow} конкурентов дешевле, {stats.competitorsAbove} дороже
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Средний рейтинг</StatLabel>
          <StatNumber>
            <HStack>
              <Text>{stats.avgRating.toFixed(1)}</Text>
              <Icon as={FaStar} color="yellow.400" />
            </HStack>
          </StatNumber>
          <StatHelpText>
            Лучший рейтинг: {stats.bestRating.toFixed(1)}
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Divider mb={6} />
      
      <Text fontWeight="medium" mb={3}>Сравнение с конкурентами:</Text>
      
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg={headerBg}>
            <Tr>
              <Th>Продавец</Th>
              <Th>Товар</Th>
              <Th isNumeric>Цена</Th>
              <Th isNumeric>Разница</Th>
              <Th>Рейтинг</Th>
              <Th>Доставка</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedCompetitors.map(competitor => {
              const priceDiff = ((product.price.current - competitor.price) / competitor.price) * 100;
              const sellerInfo = getSellerInfo(competitor);
              
              return (
                <Tr key={competitor.id}>
                  <Td>
                    <HStack>
                      <Icon as={FaStore} color="blue.500" />
                      <Text fontWeight="medium">{competitor.competitorName}</Text>
                    </HStack>
                  </Td>
                  <Td maxW="200px" isTruncated>
                    <Tooltip label={competitor.productTitle}>
                      <Text>{competitor.productTitle}</Text>
                    </Tooltip>
                  </Td>
                  <Td isNumeric fontWeight="bold">
                    {formatPrice(competitor.price)}
                  </Td>
                  <Td isNumeric>
                    <Text color={getPriceDiffColor(priceDiff)}>
                      {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                    </Text>
                  </Td>
                  <Td>
                    <HStack>
                      <Text>{sellerInfo.sellerRating}</Text>
                      <Icon as={FaStar} color="yellow.400" size="sm" />
                      <Text color={textColor} fontSize="xs">
                        ({sellerInfo.reviewsCount})
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <Icon as={FaShippingFast} color="green.500" size="sm" />
                      <Text>{sellerInfo.deliveryDays} {sellerInfo.deliveryDays === 1 ? 'день' : sellerInfo.deliveryDays < 5 ? 'дня' : 'дней'}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      {competitor.url && (
                        <Tooltip label="Открыть страницу товара">
                          <IconButton
                            icon={<ExternalLinkIcon />}
                            aria-label="Открыть страницу товара"
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => window.open(competitor.url, '_blank')}
                          />
                        </Tooltip>
                      )}
                      <Tooltip label="Подробная информация">
                        <IconButton
                          icon={<InfoIcon />}
                          aria-label="Подробная информация"
                          size="xs"
                          variant="ghost"
                          colorScheme="purple"
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

// Вспомогательный компонент для сетки
const SimpleGrid: React.FC<{
  columns: number;
  spacing: number;
  mb: number;
  children: React.ReactNode;
}> = ({ columns, spacing, mb, children }) => {
  return (
    <Flex 
      flexWrap="wrap" 
      gap={`${spacing}px`} 
      mb={`${mb}px`}
    >
      {React.Children.map(children, (child) => (
        <Box flex={`0 0 calc(${100 / columns}% - ${spacing * (columns - 1) / columns}px)`}>
          {child}
        </Box>
      ))}
    </Flex>
  );
};

export default CompetitorInsights;
