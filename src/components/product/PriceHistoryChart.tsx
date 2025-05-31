import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Select,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { useProductService } from '../../hooks/useProductService';

// Регистрация компонентов Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistoryChartProps {
  productId: string;
}

type TimeRange = '7days' | '30days' | '90days' | '1year' | 'all';

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ productId }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [loading, setLoading] = useState<boolean>(true);
  const [priceHistory, setPriceHistory] = useState<{ date: string; price: number }[]>([]);
  const productService = useProductService();
  
  // Цвета для светлой/темной темы
  const lineColor = useColorModeValue('rgba(49, 130, 206, 1)', 'rgba(99, 179, 237, 1)');
  const bgColor = useColorModeValue('rgba(49, 130, 206, 0.1)', 'rgba(99, 179, 237, 0.1)');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  useEffect(() => {
    const fetchPriceHistory = async () => {
      setLoading(true);
      try {
        // В реальном приложении здесь будет запрос к API
        // Для демонстрации используем моковые данные
        const mockData = generateMockPriceHistory(timeRange);
        setPriceHistory(mockData);
      } catch (error) {
        console.error('Error fetching price history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriceHistory();
  }, [productId, timeRange, productService]);
  
  // Генерация моковых данных для истории цен
  const generateMockPriceHistory = (range: TimeRange) => {
    const today = new Date();
    const data: { date: string; price: number }[] = [];
    
    let daysCount: number;
    switch (range) {
      case '7days':
        daysCount = 7;
        break;
      case '30days':
        daysCount = 30;
        break;
      case '90days':
        daysCount = 90;
        break;
      case '1year':
        daysCount = 365;
        break;
      case 'all':
        daysCount = 500;
        break;
      default:
        daysCount = 30;
    }
    
    // Начальная цена
    let price = Math.floor(Math.random() * 5000) + 1000;
    
    for (let i = daysCount; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Случайное изменение цены в пределах ±5%
      const change = price * (Math.random() * 0.1 - 0.05);
      price += Math.round(change);
      
      // Гарантируем, что цена не станет отрицательной
      if (price < 100) price = 100;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price
      });
    }
    
    return data;
  };
  
  // Подготовка данных для графика
  const chartData = {
    labels: priceHistory.map(item => item.date),
    datasets: [
      {
        label: 'Цена',
        data: priceHistory.map(item => item.price),
        borderColor: lineColor,
        backgroundColor: bgColor,
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Опции графика
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return value + ' ₽';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="medium">История изменения цены</Text>
        <Select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          width="150px"
          size="sm"
        >
          <option value="7days">7 дней</option>
          <option value="30days">30 дней</option>
          <option value="90days">90 дней</option>
          <option value="1year">1 год</option>
          <option value="all">Все время</option>
        </Select>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : priceHistory.length > 0 ? (
        <Box height="300px">
          <Line data={chartData} options={chartOptions} />
        </Box>
      ) : (
        <Flex justify="center" align="center" height="300px">
          <Text color={textColor}>Нет данных об истории цен</Text>
        </Flex>
      )}
    </Box>
  );
};

export default PriceHistoryChart;
