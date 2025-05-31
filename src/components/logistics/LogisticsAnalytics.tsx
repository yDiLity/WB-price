import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  Select,
  HStack,
  VStack,
  Icon,
  Spinner,
  useColorModeValue,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FaBoxOpen,
  FaTruck,
  FaChartLine,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaWarehouse,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaDownload,
  FaSync
} from 'react-icons/fa';

// Моковые данные для таблицы статистики
const statisticsData = {
  averageStock: 32.5,
  averageStockChange: -12.3,
  averageDeliveryTime: 8.2,
  averageDeliveryTimeChange: 5.7,
  inventoryTurnover: 4.8,
  inventoryTurnoverChange: 8.2,
  logisticsSavings: 15.3,
  logisticsSavingsChange: 3.1
};

// Моковые данные для таблицы
const topLowStockProducts = [
  { id: '345678', name: 'Ноутбук ASUS VivoBook', category: 'Компьютеры', stock: 3, nextDelivery: '2025-06-10' },
  { id: '789012', name: 'Наушники Apple AirPods Pro', category: 'Аксессуары', stock: 8, nextDelivery: '2025-05-25' },
  { id: '234567', name: 'Смартфон iPhone 13', category: 'Электроника', stock: 5, nextDelivery: null },
  { id: '890123', name: 'Клавиатура Logitech G Pro', category: 'Периферия', stock: 2, nextDelivery: '2025-06-05' },
  { id: '456789', name: 'Монитор Samsung Odyssey G5', category: 'Компьютеры', stock: 4, nextDelivery: '2025-05-30' },
];

const LogisticsAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('year');
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Нет опций для графиков, так как мы не используем Chart.js

  const handleRefresh = () => {
    setIsLoading(true);
    // Имитация загрузки данных
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Аналитика логистики</Heading>
        <HStack>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            w="150px"
          >
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </Select>
          <Button
            leftIcon={<FaSync />}
            colorScheme="blue"
            variant="outline"
            isLoading={isLoading}
            onClick={handleRefresh}
          >
            Обновить
          </Button>
          <Button
            leftIcon={<FaDownload />}
            colorScheme="green"
          >
            Экспорт
          </Button>
        </HStack>
      </Flex>

      {/* Статистика */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
            <Flex align="center">
              <Icon as={FaBoxOpen} boxSize={10} color="blue.500" mr={4} />
              <Stat>
                <StatLabel fontSize="sm">Средний остаток</StatLabel>
                <StatNumber>32.5</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  12.3% за год
                </StatHelpText>
              </Stat>
            </Flex>
          </Box>
        </GridItem>

        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
            <Flex align="center">
              <Icon as={FaTruck} boxSize={10} color="green.500" mr={4} />
              <Stat>
                <StatLabel fontSize="sm">Среднее время поставки</StatLabel>
                <StatNumber>8.2 дней</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5.7% за год
                </StatHelpText>
              </Stat>
            </Flex>
          </Box>
        </GridItem>

        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
            <Flex align="center">
              <Icon as={FaExchangeAlt} boxSize={10} color="purple.500" mr={4} />
              <Stat>
                <StatLabel fontSize="sm">Оборачиваемость запасов</StatLabel>
                <StatNumber>4.8</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8.2% за год
                </StatHelpText>
              </Stat>
            </Flex>
          </Box>
        </GridItem>

        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
            <Flex align="center">
              <Icon as={FaMoneyBillWave} boxSize={10} color="orange.500" mr={4} />
              <Stat>
                <StatLabel fontSize="sm">Экономия на логистике</StatLabel>
                <StatNumber>15.3%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  3.1% за год
                </StatHelpText>
              </Stat>
            </Flex>
          </Box>
        </GridItem>
      </Grid>

      {/* Графики (заменены на информационные карточки) */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }} gap={6} mb={8}>
        <GridItem>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="sm">Динамика остатков товаров</Heading>
            </CardHeader>
            <CardBody>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Графики временно недоступны</AlertTitle>
                  <AlertDescription>
                    Графики динамики остатков товаров будут доступны в следующем обновлении.
                  </AlertDescription>
                </Box>
              </Alert>
              <VStack mt={4} align="start" spacing={3}>
                <Text><strong>Средний остаток:</strong> {statisticsData.averageStock} шт.</Text>
                <Text><strong>Изменение за год:</strong> {statisticsData.averageStockChange}%</Text>
                <Text><strong>Товары с низким остатком:</strong> 15 из 120 (12.5%)</Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="sm">Распределение времени поставок</Heading>
            </CardHeader>
            <CardBody>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Графики временно недоступны</AlertTitle>
                  <AlertDescription>
                    Графики распределения времени поставок будут доступны в следующем обновлении.
                  </AlertDescription>
                </Box>
              </Alert>
              <VStack mt={4} align="start" spacing={3}>
                <Text><strong>Среднее время поставки:</strong> {statisticsData.averageDeliveryTime} дней</Text>
                <Text><strong>Изменение за год:</strong> +{statisticsData.averageDeliveryTimeChange}%</Text>
                <Text><strong>Поставки в ближайшие 7 дней:</strong> 8</Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="sm">Изменения цен на основе логистических правил</Heading>
            </CardHeader>
            <CardBody>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Графики временно недоступны</AlertTitle>
                  <AlertDescription>
                    Графики изменения цен на основе логистических правил будут доступны в следующем обновлении.
                  </AlertDescription>
                </Box>
              </Alert>
              <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4} mt={4}>
                <Box p={3} borderWidth="1px" borderRadius="md" borderColor="green.200" bg="green.50">
                  <Heading size="sm" color="green.600" mb={2}>Повышение цены</Heading>
                  <Text>12% товаров</Text>
                  <Text>Средний рост: +10%</Text>
                </Box>
                <Box p={3} borderWidth="1px" borderRadius="md" borderColor="red.200" bg="red.50">
                  <Heading size="sm" color="red.600" mb={2}>Снижение цены</Heading>
                  <Text>8% товаров</Text>
                  <Text>Среднее снижение: -5%</Text>
                </Box>
                <Box p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
                  <Heading size="sm" color="gray.600" mb={2}>Без изменений</Heading>
                  <Text>80% товаров</Text>
                  <Text>Оптимальный уровень</Text>
                </Box>
              </Grid>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Таблица товаров с низким остатком */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mb={8}>
        <CardHeader>
          <Heading size="sm">Товары с низким остатком</Heading>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Название товара</Th>
                  <Th>Категория</Th>
                  <Th isNumeric>Остаток</Th>
                  <Th>Следующая поставка</Th>
                  <Th>Статус</Th>
                </Tr>
              </Thead>
              <Tbody>
                {topLowStockProducts.map((product) => (
                  <Tr key={product.id}>
                    <Td>
                      <Text fontWeight="medium">{product.name}</Text>
                      <Text fontSize="xs" color="gray.500">ID: {product.id}</Text>
                    </Td>
                    <Td>{product.category}</Td>
                    <Td isNumeric>{product.stock}</Td>
                    <Td>
                      {product.nextDelivery
                        ? new Date(product.nextDelivery).toLocaleDateString()
                        : <Text color="red.500">Не запланирована</Text>}
                    </Td>
                    <Td>
                      {product.stock <= 3 ? (
                        <Badge colorScheme="red">Критический</Badge>
                      ) : (
                        <Badge colorScheme="orange">Низкий</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Рекомендации */}
      <Card bg={useColorModeValue('blue.50', 'blue.900')} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex align="center">
            <Icon as={FaInfoCircle} mr={2} color="blue.500" />
            <Heading size="sm">Рекомендации по оптимизации логистики</Heading>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={3}>
            <Text>
              <strong>1. Оптимизация остатков:</strong> Рекомендуется увеличить запас товаров категории "Компьютеры",
              так как 40% товаров этой категории имеют критически низкий остаток.
            </Text>
            <Text>
              <strong>2. Оптимизация поставок:</strong> Среднее время поставки увеличилось на 5.7%.
              Рекомендуется пересмотреть логистические маршруты или сменить поставщиков для товаров категории "Электроника".
            </Text>
            <Text>
              <strong>3. Ценовая оптимизация:</strong> Автоматическая корректировка цен на основе остатков
              позволила увеличить маржинальность на 8.2% для товаров с низким остатком.
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default LogisticsAnalytics;
