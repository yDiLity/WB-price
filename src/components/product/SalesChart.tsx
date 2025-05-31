import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Select,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  productId: string;
}

type TimeRange = '7days' | '30days' | '90days' | '1year' | 'all';

const SalesChart: React.FC<SalesChartProps> = ({ productId }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [loading, setLoading] = useState<boolean>(true);
  const [salesData, setSalesData] = useState<{ date: string; sales: number; revenue: number }[]>([]);
  const [chartType, setChartType] = useState<'sales' | 'revenue'>('sales');
  const productService = useProductService();
  
  // Цвета для светлой/темной темы
  const barColor = useColorModeValue('rgba(49, 130, 206, 0.8)', 'rgba(99, 179, 237, 0.8)');
  const revenueColor = useColorModeValue('rgba(72, 187, 120, 0.8)', 'rgba(72, 187, 120, 0.8)');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // В реальном приложении здесь будет запрос к API
        // Для демонстрации используем моковые данные
        const mockData = generateMockSalesData(timeRange);
        setSalesData(mockData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalesData();
  }, [productId, timeRange, productService]);
  
  // Генерация моковых данных для продаж
  const generateMockSalesData = (range: TimeRange) => {
    const today = new Date();
    const data: { date: string; sales: number; revenue: number }[] = [];
    
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
    
    // Базовая цена товара для расчета выручки
    const basePrice = Math.floor(Math.random() * 5000) + 1000;
    
    for (let i = daysCount; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Случайное количество продаж
      const sales = Math.floor(Math.random() * 10);
      
      // Выручка = количество продаж * цена
      const revenue = sales * basePrice;
      
      data.push({
        date: date.toISOString().split('T')[0],
        sales,
        revenue
      });
    }
    
    return data;
  };
  
  // Подготовка данных для графика
  const chartData = {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: chartType === 'sales' ? 'Продажи (шт.)' : 'Выручка (₽)',
        data: chartType === 'sales' 
          ? salesData.map(item => item.sales)
          : salesData.map(item => item.revenue),
        backgroundColor: chartType === 'sales' ? barColor : revenueColor,
      }
    ]
  };
  
  // Опции графика
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (chartType === 'revenue') {
                label += new Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  maximumFractionDigits: 0
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y + ' шт.';
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (chartType === 'revenue') {
              return value + ' ₽';
            }
            return value + ' шт.';
          }
        }
      }
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="medium">Статистика продаж</Text>
        <Flex gap={2}>
          <Select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as 'sales' | 'revenue')}
            width="150px"
            size="sm"
          >
            <option value="sales">Продажи (шт.)</option>
            <option value="revenue">Выручка (₽)</option>
          </Select>
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
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : salesData.length > 0 ? (
        <Box height="300px">
          <Bar data={chartData} options={chartOptions} />
        </Box>
      ) : (
        <Flex justify="center" align="center" height="300px">
          <Text color={textColor}>Нет данных о продажах</Text>
        </Flex>
      )}
    </Box>
  );
};

export default SalesChart;
