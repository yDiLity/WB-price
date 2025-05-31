import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Select,
  HStack,
  VStack,
  Badge,
  Tooltip,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button
} from '@chakra-ui/react';
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ru } from 'date-fns/locale';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
);

interface PriceMonitoringChartProps {
  product: Product;
  competitors: CompetitorProduct[];
  onRunMonitoring?: () => void;
}

/**
 * Компонент для визуализации изменений цен
 */
const PriceMonitoringChart: React.FC<PriceMonitoringChartProps> = ({
  product,
  competitors,
  onRunMonitoring
}) => {
  // Состояние для периода отображения
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Инициализация выбранных конкурентов
  useEffect(() => {
    if (competitors.length > 0) {
      // По умолчанию выбираем первых 3 конкурентов или всех, если их меньше 3
      setSelectedCompetitors(competitors.slice(0, Math.min(3, competitors.length)).map(c => c.id));
    }
  }, [competitors]);
  
  // Получение данных для графика
  const getChartData = () => {
    // Генерируем историю цен для продукта и конкурентов
    const now = new Date();
    const history: { date: Date; prices: Record<string, number> }[] = [];
    
    // Определяем период в зависимости от выбранного диапазона
    let days = 7; // По умолчанию неделя
    if (timeRange === 'day') days = 1;
    if (timeRange === 'month') days = 30;
    if (timeRange === 'all') days = 90;
    
    // Генерируем точки данных
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const prices: Record<string, number> = {
        product: product.price.current * (0.95 + Math.random() * 0.1) // Небольшие колебания цены продукта
      };
      
      // Добавляем цены конкурентов
      competitors.forEach(competitor => {
        if (selectedCompetitors.includes(competitor.id)) {
          // Генерируем случайные колебания цен конкурентов
          prices[competitor.id] = competitor.price * (0.9 + Math.random() * 0.2);
        }
      });
      
      history.push({ date, prices });
    }
    
    return history;
  };
  
  // Подготовка данных для графика Chart.js
  const prepareChartData = () => {
    const history = getChartData();
    
    // Цвета для линий
    const colors = [
      'rgb(54, 162, 235)', // Синий для продукта
      'rgb(255, 99, 132)', // Красный
      'rgb(75, 192, 192)', // Зеленый
      'rgb(255, 159, 64)', // Оранжевый
      'rgb(153, 102, 255)', // Фиолетовый
      'rgb(255, 205, 86)', // Желтый
      'rgb(201, 203, 207)' // Серый
    ];
    
    const datasets = [
      {
        label: `${product.title} (Ваш товар)`,
        data: history.map(h => ({ x: h.date, y: h.prices.product })),
        borderColor: colors[0],
        backgroundColor: colors[0],
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.1
      }
    ];
    
    // Добавляем данные конкурентов
    competitors.forEach((competitor, index) => {
      if (selectedCompetitors.includes(competitor.id)) {
        datasets.push({
          label: competitor.competitorName,
          data: history.map(h => ({ x: h.date, y: h.prices[competitor.id] || null })),
          borderColor: colors[(index + 1) % colors.length],
          backgroundColor: colors[(index + 1) % colors.length],
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.1
        });
      }
    });
    
    return { datasets };
  };
  
  // Опции для графика Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatPrice(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: timeRange === 'day' ? 'hour' : 'day',
          displayFormats: {
            hour: 'HH:mm',
            day: 'dd.MM'
          },
          tooltipFormat: 'dd.MM.yyyy HH:mm'
        },
        adapters: {
          date: {
            locale: ru
          }
        },
        ticks: {
          color: textColor
        },
        grid: {
          color: borderColor
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: textColor,
          callback: (value: number) => formatPrice(value)
        },
        grid: {
          color: borderColor
        }
      }
    }
  };
  
  // Обработчик запуска мониторинга
  const handleRunMonitoring = () => {
    setIsLoading(true);
    
    // Имитация запроса к API
    setTimeout(() => {
      setIsLoading(false);
      if (onRunMonitoring) onRunMonitoring();
    }, 1500);
  };
  
  // Обработчик выбора/отмены выбора конкурента
  const handleToggleCompetitor = (competitorId: string) => {
    setSelectedCompetitors(prev => {
      if (prev.includes(competitorId)) {
        return prev.filter(id => id !== competitorId);
      } else {
        return [...prev, competitorId];
      }
    });
  };
  
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
        <Heading size="md">Динамика цен</Heading>
        
        <HStack spacing={2}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            size="sm"
            width="150px"
          >
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="all">За всё время</option>
          </Select>
          
          <Button
            colorScheme="blue"
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={handleRunMonitoring}
            isLoading={isLoading}
          >
            Обновить данные
          </Button>
        </HStack>
      </Flex>
      
      {competitors.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>У выбранного товара нет связанных конкурентов. Добавьте конкурентов для сравнения цен.</Text>
        </Alert>
      ) : (
        <>
          <Box height="400px" mb={4}>
            {isLoading ? (
              <Flex justify="center" align="center" height="100%">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
              <Line data={prepareChartData()} options={chartOptions} />
            )}
          </Box>
          
          <Heading size="sm" mb={2}>Конкуренты на графике</Heading>
          <Flex wrap="wrap" gap={2}>
            {competitors.map(competitor => (
              <Badge
                key={competitor.id}
                px={3}
                py={1}
                borderRadius="full"
                cursor="pointer"
                colorScheme={selectedCompetitors.includes(competitor.id) ? 'blue' : 'gray'}
                onClick={() => handleToggleCompetitor(competitor.id)}
              >
                {competitor.competitorName} ({formatPrice(competitor.price)})
              </Badge>
            ))}
          </Flex>
          
          <Text fontSize="sm" color={textColor} mt={4}>
            <InfoIcon mr={1} />
            Нажмите на название конкурента, чтобы показать/скрыть его на графике
          </Text>
        </>
      )}
    </Box>
  );
};

export default PriceMonitoringChart;
