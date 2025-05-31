import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  Flex,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Product, CompetitorProduct } from '../../types';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface PriceComparisonChartProps {
  product: Product;
  competitors: CompetitorProduct[];
}

/**
 * Компонент для визуального сравнения цен товара и его конкурентов
 */
const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ product, competitors }) => {
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const chartGridColor = useColorModeValue('gray.200', 'gray.700');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Получение данных для графика
  const getChartData = () => {
    // Сортируем конкурентов по цене (от низкой к высокой)
    const sortedCompetitors = [...competitors].sort((a, b) => a.price - b.price);
    
    // Создаем массив меток (названия конкурентов)
    const labels = ['Ваш товар', ...sortedCompetitors.map(comp => comp.competitorName || 'Конкурент')];
    
    // Создаем массив цен
    const prices = [product.price.current, ...sortedCompetitors.map(comp => comp.price)];
    
    // Создаем массив цветов (ваш товар - синий, конкуренты - серые)
    const backgroundColor = [
      '#4299E1', // blue.400
      ...Array(sortedCompetitors.length).fill('#A0AEC0') // gray.400
    ];
    
    // Создаем массив цветов границ
    const borderColors = [
      '#3182CE', // blue.500
      ...Array(sortedCompetitors.length).fill('#718096') // gray.500
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Цена',
          data: prices,
          backgroundColor,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    };
  };
  
  // Опции для графика
  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return formatPrice(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: chartGridColor,
        }
      },
      x: {
        grid: {
          color: chartGridColor,
        },
        ticks: {
          callback: function(value: any) {
            return formatPrice(value);
          }
        }
      }
    }
  };
  
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
        <Text color={textColor} textAlign="center">
          Нет связанных конкурентов для сравнения цен
        </Text>
      </Box>
    );
  }
  
  // Находим минимальную и максимальную цену
  const prices = [product.price.current, ...competitors.map(comp => comp.price)];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Находим самого дешевого и самого дорогого конкурента
  const cheapestCompetitor = competitors.reduce((prev, current) => 
    (prev.price < current.price) ? prev : current, competitors[0]);
  
  const mostExpensiveCompetitor = competitors.reduce((prev, current) => 
    (prev.price > current.price) ? prev : current, competitors[0]);
  
  // Определяем, является ли наш товар самым дешевым или самым дорогим
  const isOurProductCheapest = product.price.current <= cheapestCompetitor.price;
  const isOurProductMostExpensive = product.price.current >= mostExpensiveCompetitor.price;
  
  // Вычисляем разницу в процентах между нашим товаром и самым дешевым конкурентом
  const priceDifferencePercent = isOurProductCheapest 
    ? 0 
    : Math.round((product.price.current - cheapestCompetitor.price) / cheapestCompetitor.price * 100);
  
  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontWeight="bold" fontSize="lg">
          Сравнение цен
        </Text>
        <Tooltip label="Визуальное сравнение цен вашего товара с конкурентами">
          <Icon as={FaInfoCircle} color="gray.500" />
        </Tooltip>
      </Flex>
      
      <Box height="300px" mb={4}>
        <Bar data={getChartData()} options={chartOptions} />
      </Box>
      
      <Flex direction="column" gap={2}>
        <Text fontSize="sm" color={textColor}>
          <strong>Диапазон цен:</strong> {formatPrice(minPrice)} - {formatPrice(maxPrice)} 
          (разница: {formatPrice(priceRange)})
        </Text>
        
        {isOurProductCheapest ? (
          <Text fontSize="sm" color="green.500" fontWeight="medium">
            Ваш товар имеет самую низкую цену среди конкурентов
          </Text>
        ) : (
          <Text fontSize="sm" color={textColor}>
            <strong>Самая низкая цена:</strong> {formatPrice(cheapestCompetitor.price)} 
            ({cheapestCompetitor.competitorName || 'Конкурент'})
            {priceDifferencePercent > 0 && (
              <Text as="span" color="orange.500" ml={1}>
                (ваш товар дороже на {priceDifferencePercent}%)
              </Text>
            )}
          </Text>
        )}
        
        {isOurProductMostExpensive ? (
          <Text fontSize="sm" color="orange.500" fontWeight="medium">
            Ваш товар имеет самую высокую цену среди конкурентов
          </Text>
        ) : (
          <Text fontSize="sm" color={textColor}>
            <strong>Самая высокая цена:</strong> {formatPrice(mostExpensiveCompetitor.price)} 
            ({mostExpensiveCompetitor.competitorName || 'Конкурент'})
          </Text>
        )}
      </Flex>
    </Box>
  );
};

export default PriceComparisonChart;
