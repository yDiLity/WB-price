import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface MockDataDisplayProps {
  type: 'competitors' | 'history' | 'strategy';
  productTitle: string;
  currentPrice: number;
  onAction?: () => void;
}

export const MockDataDisplay: React.FC<MockDataDisplayProps> = ({
  type,
  productTitle,
  currentPrice,
  onAction,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const helperTextColor = useColorModeValue('gray.500', 'gray.200');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  const generateMockCompetitors = () => [
    {
      id: '1',
      name: 'Wildberries',
      price: currentPrice * 0.95,
      url: 'https://wildberries.ru/...',
      lastUpdated: '2 часа назад',
    },
    {
      id: '2',
      name: 'Яндекс.Маркет',
      price: currentPrice * 1.05,
      url: 'https://market.yandex.ru/...',
      lastUpdated: '1 час назад',
    },
    {
      id: '3',
      name: 'AliExpress',
      price: currentPrice * 0.88,
      url: 'https://aliexpress.ru/...',
      lastUpdated: '30 минут назад',
    },
  ];

  const generateMockHistory = () => [
    { date: '27.01.2025', price: currentPrice, change: 0 },
    { date: '26.01.2025', price: currentPrice * 1.02, change: 2 },
    { date: '25.01.2025', price: currentPrice * 0.98, change: -2 },
    { date: '24.01.2025', price: currentPrice * 1.01, change: 1 },
    { date: '23.01.2025', price: currentPrice * 0.99, change: -1 },
  ];

  if (type === 'competitors') {
    const competitors = generateMockCompetitors();
    const avgPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;
    const minPrice = Math.min(...competitors.map(comp => comp.price));
    const maxPrice = Math.max(...competitors.map(comp => comp.price));

    return (
      <VStack spacing={6} align="stretch">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Демонстрационные данные</AlertTitle>
            <AlertDescription fontSize="xs">
              Это примеры цен конкурентов. Для получения реальных данных свяжите товар с конкурентами.
            </AlertDescription>
          </Box>
        </Alert>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat>
            <StatLabel>Средняя цена</StatLabel>
            <StatNumber>{formatPrice(avgPrice)}</StatNumber>
            <StatHelpText>
              <StatArrow type={currentPrice > avgPrice ? 'increase' : 'decrease'} />
              {Math.abs(((currentPrice - avgPrice) / avgPrice) * 100).toFixed(1)}% от вашей цены
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Минимальная</StatLabel>
            <StatNumber color="green.500">{formatPrice(minPrice)}</StatNumber>
            <StatHelpText>Самая низкая цена</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Максимальная</StatLabel>
            <StatNumber color="red.500">{formatPrice(maxPrice)}</StatNumber>
            <StatHelpText>Самая высокая цена</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Маркетплейс</Th>
                <Th isNumeric>Цена</Th>
                <Th isNumeric>Разница</Th>
                <Th>Обновлено</Th>
              </Tr>
            </Thead>
            <Tbody>
              {competitors.map((competitor) => {
                const priceDiff = ((competitor.price - currentPrice) / currentPrice) * 100;
                return (
                  <Tr key={competitor.id}>
                    <Td>
                      <Badge colorScheme={
                        competitor.name.includes('Wildberries') ? 'purple' :
                        competitor.name.includes('Яндекс') ? 'yellow' :
                        competitor.name.includes('AliExpress') ? 'orange' : 'gray'
                      }>
                        {competitor.name}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold">{formatPrice(competitor.price)}</Td>
                    <Td isNumeric>
                      <HStack justify="flex-end">
                        {priceDiff > 0 ? <FiTrendingUp color="red" /> :
                         priceDiff < 0 ? <FiTrendingDown color="green" /> : <FiMinus />}
                        <Text color={priceDiff > 0 ? 'red.500' : priceDiff < 0 ? 'green.500' : 'gray.500'}>
                          {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                        </Text>
                      </HStack>
                    </Td>
                    <Td color={helperTextColor} fontSize="sm">{competitor.lastUpdated}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        <Button colorScheme="blue" onClick={onAction}>
          Связать с реальными конкурентами
        </Button>
      </VStack>
    );
  }

  if (type === 'history') {
    const history = generateMockHistory();

    return (
      <VStack spacing={6} align="stretch">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Демонстрационные данные</AlertTitle>
            <AlertDescription fontSize="xs">
              Это примеры истории изменения цен. Реальная история будет отображаться после настройки мониторинга.
            </AlertDescription>
          </Box>
        </Alert>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Дата</Th>
                <Th isNumeric>Цена</Th>
                <Th isNumeric>Изменение</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((entry, index) => (
                <Tr key={index}>
                  <Td>{entry.date}</Td>
                  <Td isNumeric fontWeight="bold">{formatPrice(entry.price)}</Td>
                  <Td isNumeric>
                    <HStack justify="flex-end">
                      {entry.change > 0 ? <FiTrendingUp color="green" /> :
                       entry.change < 0 ? <FiTrendingDown color="red" /> : <FiMinus />}
                      <Text color={entry.change > 0 ? 'green.500' : entry.change < 0 ? 'red.500' : 'gray.500'}>
                        {entry.change > 0 ? '+' : ''}{entry.change}%
                      </Text>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Text fontSize="sm" color={helperTextColor} textAlign="center">
          📈 График истории цен будет доступен после накопления данных мониторинга
        </Text>
      </VStack>
    );
  }

  if (type === 'strategy') {
    return (
      <VStack spacing={6} align="stretch">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Стратегия не применена</AlertTitle>
            <AlertDescription fontSize="xs">
              Для автоматического ценообразования необходимо выбрать и применить стратегию.
            </AlertDescription>
          </Box>
        </Alert>

        <Box p={4} borderWidth="1px" borderColor={borderColor} borderRadius="md">
          <Text fontWeight="bold" mb={2} color={textColor}>Доступные стратегии:</Text>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>🎯 Соответствие минимальной цене</Text>
              <Badge colorScheme="blue">Популярная</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>📉 Снижение на процент</Text>
              <Badge colorScheme="green">Агрессивная</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>📊 Средняя цена конкурентов</Text>
              <Badge colorScheme="purple">Сбалансированная</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>⚙️ Пользовательская стратегия</Text>
              <Badge colorScheme="orange">Гибкая</Badge>
            </HStack>
          </VStack>
        </Box>

        <Button colorScheme="blue" onClick={onAction}>
          Выбрать стратегию ценообразования
        </Button>

        <Text fontSize="sm" color={helperTextColor} textAlign="center">
          💡 После применения стратегии здесь будут отображаться детали автоматического ценообразования
        </Text>
      </VStack>
    );
  }

  return null;
};
