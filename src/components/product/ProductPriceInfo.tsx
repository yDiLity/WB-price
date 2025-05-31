import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Badge,
  Divider,
  Tooltip,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Icon
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { ProductPrice, CompetitorPrice } from '../../types/product';

interface ProductPriceInfoProps {
  price: ProductPrice;
  showCompetitors?: boolean;
}

export default function ProductPriceInfo({ price, showCompetitors = true }: ProductPriceInfoProps) {
  // Отладочная информация
  console.log('ProductPriceInfo - price:', price);
  console.log('ProductPriceInfo - costPrice:', price.costPrice);
  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const priceColor = useColorModeValue('blue.600', 'blue.300');
  const oldPriceColor = useColorModeValue('gray.500', 'gray.400');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  const costPriceBg = useColorModeValue('red.50', 'red.900');
  const costPriceColor = useColorModeValue('red.600', 'red.300');
  const profitBg = useColorModeValue('green.50', 'green.900');
  const profitColor = useColorModeValue('green.600', 'green.300');

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Расчет маржи
  const calculateMargin = (currentPrice: number, costPrice: number) => {
    if (!costPrice) return 0;
    return ((currentPrice - costPrice) / costPrice) * 100;
  };

  // Расчет прибыли
  const calculateProfit = (currentPrice: number, costPrice: number) => {
    if (!costPrice) return 0;
    return currentPrice - costPrice;
  };

  // Получение цвета для маржи
  const getMarginColor = (margin: number) => {
    if (margin < 10) return 'red';
    if (margin < 20) return 'orange';
    if (margin < 30) return 'yellow';
    return 'green';
  };

  // Маржа и прибыль
  const margin = calculateMargin(price.current, price.costPrice || 0);
  const profit = calculateProfit(price.current, price.costPrice || 0);
  const marginColor = getMarginColor(margin);

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      p={4}
    >
      <VStack spacing={4} align="stretch">
        {/* Текущая цена */}
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="medium">Текущая цена:</Text>
          <Text fontSize="xl" fontWeight="bold" color={priceColor}>
            {formatPrice(price.current)}
          </Text>
        </Flex>

        {/* Старая цена (если есть) */}
        {price.old && (
          <Flex justify="space-between" align="center">
            <Text fontSize="md" color={textColor}>Старая цена:</Text>
            <Text fontSize="md" color={oldPriceColor} textDecoration="line-through">
              {formatPrice(price.old)}
            </Text>
          </Flex>
        )}

        <Divider />

        {/* Закупочная цена */}
        <Box
          bg={costPriceBg}
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="red.500"
        >
          <Flex justify="space-between" align="center">
            <Tooltip label="Цена, по которой вы закупаете товар">
              <Flex align="center">
                <Text fontSize="md" fontWeight="medium">Закупочная цена:</Text>
                <InfoIcon ml={1} color={textColor} boxSize={3.5} />
              </Flex>
            </Tooltip>
            <Text fontSize="md" fontWeight="bold" color={costPriceColor}>
              {price.costPrice ? formatPrice(price.costPrice) : "Не указана"}
            </Text>
          </Flex>
        </Box>

        {/* Маржа и прибыль */}
        <Box
          bg={profitBg}
          p={3}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="green.500"
        >
          <StatGroup>
            <Stat>
              <StatLabel>Маржа</StatLabel>
              {price.costPrice ? (
                <>
                  <StatNumber color={`${marginColor}.600`}>
                    {margin.toFixed(1)}%
                  </StatNumber>
                  <StatHelpText>
                    {margin > 0 ? (
                      <StatArrow type="increase" />
                    ) : (
                      <StatArrow type="decrease" />
                    )}
                    от закупочной
                  </StatHelpText>
                </>
              ) : (
                <StatNumber color="gray.500">Нет данных</StatNumber>
              )}
            </Stat>

            <Stat>
              <StatLabel>Прибыль</StatLabel>
              {price.costPrice ? (
                <>
                  <StatNumber color={profitColor}>
                    {formatPrice(profit)}
                  </StatNumber>
                  <StatHelpText>
                    с одной единицы
                  </StatHelpText>
                </>
              ) : (
                <StatNumber color="gray.500">Нет данных</StatNumber>
              )}
            </Stat>
          </StatGroup>
        </Box>

        <Divider />

        {/* Рекомендованная цена */}
        {price.recommended && (
          <Flex justify="space-between" align="center">
            <Tooltip label="Рекомендованная розничная цена от производителя">
              <Flex align="center">
                <Text fontSize="md" color={textColor}>Рекомендованная цена:</Text>
                <InfoIcon ml={1} color={textColor} boxSize={3.5} />
              </Flex>
            </Tooltip>
            <Text fontSize="md" fontWeight="medium">
              {formatPrice(price.recommended)}
            </Text>
          </Flex>
        )}

        {/* Минимальная и максимальная цены */}
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            {price.min && (
              <Tooltip label="Минимальная допустимая цена">
                <Badge colorScheme="red" p={1} borderRadius="md">
                  Мин: {formatPrice(price.min)}
                </Badge>
              </Tooltip>
            )}

            {price.max && (
              <Tooltip label="Максимальная рекомендуемая цена">
                <Badge colorScheme="green" p={1} borderRadius="md">
                  Макс: {formatPrice(price.max)}
                </Badge>
              </Tooltip>
            )}
          </HStack>
        </Flex>

        {/* Цены конкурентов */}
        {showCompetitors && price.competitorPrices && price.competitorPrices.length > 0 && (
          <>
            <Divider my={2} />

            <Box>
              <Text fontSize="md" fontWeight="medium" mb={2}>
                Цены конкурентов:
              </Text>

              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Конкурент</Th>
                      <Th isNumeric>Цена</Th>
                      <Th isNumeric>Разница</Th>
                      <Th>Обновлено</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {price.competitorPrices.map((competitor) => {
                      const diff = price.current - competitor.price;
                      const diffPercent = (diff / competitor.price) * 100;

                      return (
                        <Tr key={competitor.competitorId}>
                          <Td>{competitor.competitorName}</Td>
                          <Td isNumeric fontWeight="medium">
                            {formatPrice(competitor.price)}
                          </Td>
                          <Td isNumeric>
                            <Badge
                              colorScheme={diff < 0 ? 'green' : diff > 0 ? 'red' : 'gray'}
                              variant="subtle"
                              borderRadius="full"
                            >
                              {diff < 0 ? '↓' : diff > 0 ? '↑' : '='} {Math.abs(diffPercent).toFixed(1)}%
                            </Badge>
                          </Td>
                          <Td fontSize="xs" color={textColor}>
                            {formatDate(competitor.lastUpdated)}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
}
