import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Spinner,
  useColorModeValue,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Button,
  Badge,
  HStack,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaExchangeAlt, 
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle,
  FaChartBar,
  FaChartPie,
  FaChartArea,
  FaUsers,
  FaStore
} from 'react-icons/fa';
import { useOzonProducts } from '../context/OzonProductContext';
import { priceChangeService } from '../services/priceChangeService';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

/**
 * Страница дашборда с аналитикой
 */
export default function DashboardPage() {
  // Получаем данные из контекста
  const { products, isLoading, loadProducts, stats } = useOzonProducts();
  
  // Состояние для периода времени
  const [timeRange, setTimeRange] = useState<string>('week');
  
  // Получаем изменения цен
  const priceChanges = priceChangeService.getAllPriceChanges();
  
  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const chartLineColor = useColorModeValue('blue.500', 'blue.300');
  const chartFillColor = useColorModeValue('blue.100', 'blue.900');
  const chartGridColor = useColorModeValue('gray.200', 'gray.700');
  
  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadProducts();
  }, []);
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Получение данных для графика изменения цен
  const getPriceChangeChartData = () => {
    // Сортируем изменения цен по дате
    const sortedChanges = [...priceChanges].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Группируем изменения по дате
    const groupedByDate = sortedChanges.reduce((acc, change) => {
      const date = new Date(change.timestamp).toLocaleDateString('ru-RU');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(change);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Получаем даты и средние изменения цен
    const dates = Object.keys(groupedByDate);
    const averageChanges = dates.map(date => {
      const changes = groupedByDate[date];
      const totalPercent = changes.reduce((sum, change) => sum + change.changePercent, 0);
      return totalPercent / changes.length;
    });
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Среднее изменение цены (%)',
          data: averageChanges,
          borderColor: chartLineColor,
          backgroundColor: chartFillColor,
          fill: true,
          tension: 0.4
        }
      ]
    };
  };
  
  // Получение данных для графика распределения статусов изменений цен
  const getPriceChangeStatusChartData = () => {
    // Считаем количество изменений по статусам
    const statusCounts = priceChanges.reduce((acc, change) => {
      const status = change.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      labels: ['Ожидает', 'Применено', 'Отклонено'],
      datasets: [
        {
          data: [
            statusCounts['pending'] || 0,
            statusCounts['applied'] || 0,
            statusCounts['rejected'] || 0
          ],
          backgroundColor: [
            '#F6E05E', // yellow
            '#68D391', // green
            '#FC8181'  // red
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Получение данных для графика категорий товаров
  const getProductCategoriesChartData = () => {
    // Считаем количество товаров по категориям
    const categoryCounts = products.reduce((acc, product) => {
      const category = product.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categories = Object.keys(categoryCounts);
    const counts = categories.map(category => categoryCounts[category]);
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Количество товаров',
          data: counts,
          backgroundColor: [
            '#4299E1', // blue
            '#9F7AEA', // purple
            '#ED8936', // orange
            '#38B2AC', // teal
            '#F56565'  // red
          ]
        }
      ]
    };
  };
  
  // Опции для графиков
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
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
        }
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      }
    }
  };
  
  // Получение статистики
  const getStats = () => {
    // Считаем общую экономию/прибыль от изменений цен
    const appliedChanges = priceChanges.filter(change => change.status === 'applied');
    const totalSavings = appliedChanges.reduce((sum, change) => {
      // Если цена снизилась, это экономия для покупателя
      // Если цена повысилась, это дополнительная прибыль для продавца
      const priceDiff = change.newPrice - change.oldPrice;
      return sum + priceDiff;
    }, 0);
    
    // Считаем количество товаров с примененными стратегиями
    const productsWithStrategy = products.filter(p => p.appliedStrategyId).length;
    
    // Считаем количество товаров с связанными конкурентами
    const productsWithCompetitors = products.filter(p => 
      p.linkedCompetitors && p.linkedCompetitors.length > 0
    ).length;
    
    return {
      totalProducts: products.length,
      productsWithStrategy,
      productsWithCompetitors,
      totalPriceChanges: priceChanges.length,
      appliedChanges: appliedChanges.length,
      pendingChanges: priceChanges.filter(change => change.status === 'pending').length,
      rejectedChanges: priceChanges.filter(change => change.status === 'rejected').length,
      totalSavings
    };
  };
  
  const dashboardStats = getStats();
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading as="h1" size="xl">Дашборд</Heading>
          <Text color={textColor} fontSize="md">
            Аналитика и статистика по товарам и ценам
          </Text>
        </Box>
        
        <HStack spacing={4}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            width="auto"
          >
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="year">За год</option>
          </Select>
          
          <Button
            leftIcon={<Icon as={FaChartLine} />}
            colorScheme="blue"
            onClick={() => loadProducts()}
            isLoading={isLoading}
          >
            Обновить данные
          </Button>
        </HStack>
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      ) : (
        <>
          {/* Ключевые показатели */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Flex align="center" mb={2}>
                  <Icon as={FaShoppingCart} boxSize={6} color="blue.500" mr={2} />
                  <Stat>
                    <StatLabel>Всего товаров</StatLabel>
                    <StatNumber>{dashboardStats.totalProducts}</StatNumber>
                    <StatHelpText>
                      <HStack>
                        <Text>{dashboardStats.productsWithStrategy} со стратегией</Text>
                        <Tooltip label="Количество товаров с примененной стратегией ценообразования">
                          <Icon as={FaInfoCircle} boxSize={3} color="gray.500" />
                        </Tooltip>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Flex align="center" mb={2}>
                  <Icon as={FaExchangeAlt} boxSize={6} color="purple.500" mr={2} />
                  <Stat>
                    <StatLabel>Связанные товары</StatLabel>
                    <StatNumber>{dashboardStats.productsWithCompetitors}</StatNumber>
                    <StatHelpText>
                      <HStack>
                        <Text>{Math.round(dashboardStats.productsWithCompetitors / dashboardStats.totalProducts * 100)}% от общего числа</Text>
                        <Tooltip label="Количество товаров, связанных с конкурентами">
                          <Icon as={FaInfoCircle} boxSize={3} color="gray.500" />
                        </Tooltip>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Flex align="center" mb={2}>
                  <Icon as={FaChartLine} boxSize={6} color="green.500" mr={2} />
                  <Stat>
                    <StatLabel>Изменения цен</StatLabel>
                    <StatNumber>{dashboardStats.totalPriceChanges}</StatNumber>
                    <StatHelpText>
                      <HStack>
                        <Badge colorScheme="green">{dashboardStats.appliedChanges} применено</Badge>
                        <Badge colorScheme="yellow">{dashboardStats.pendingChanges} ожидает</Badge>
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Flex align="center" mb={2}>
                  <Icon as={FaMoneyBillWave} boxSize={6} color="red.500" mr={2} />
                  <Stat>
                    <StatLabel>Общий эффект</StatLabel>
                    <StatNumber>{formatPrice(Math.abs(dashboardStats.totalSavings))}</StatNumber>
                    <StatHelpText>
                      {dashboardStats.totalSavings > 0 ? (
                        <Flex align="center">
                          <StatArrow type="increase" />
                          <Text>Дополнительная прибыль</Text>
                        </Flex>
                      ) : (
                        <Flex align="center">
                          <StatArrow type="decrease" />
                          <Text>Экономия для покупателей</Text>
                        </Flex>
                      )}
                    </StatHelpText>
                  </Stat>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Графики */}
          <Tabs colorScheme="blue" variant="enclosed" mb={8}>
            <TabList>
              <Tab><Icon as={FaChartArea} mr={2} /> Динамика цен</Tab>
              <Tab><Icon as={FaChartPie} mr={2} /> Статусы изменений</Tab>
              <Tab><Icon as={FaChartBar} mr={2} /> Категории товаров</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                <Box height="400px">
                  <Line data={getPriceChangeChartData()} options={lineChartOptions} />
                </Box>
              </TabPanel>
              
              <TabPanel p={4}>
                <Box height="400px">
                  <Pie data={getPriceChangeStatusChartData()} options={pieChartOptions} />
                </Box>
              </TabPanel>
              
              <TabPanel p={4}>
                <Box height="400px">
                  <Bar 
                    data={getProductCategoriesChartData()} 
                    options={{
                      ...lineChartOptions,
                      indexAxis: 'y' as const,
                    }} 
                  />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </Container>
  );
}
