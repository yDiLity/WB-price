import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Text,
  Box,
  Flex,
  Link,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { ExternalLinkIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { CompetitorPrice } from '../../types/product';
import { formatPrice } from '../../utils/formatters';

interface CompetitorPricesTableProps {
  competitorPrices: CompetitorPrice[];
  currentPrice: number;
}

const CompetitorPricesTable: React.FC<CompetitorPricesTableProps> = ({ 
  competitorPrices,
  currentPrice
}) => {
  // Сортировка цен конкурентов по возрастанию
  const sortedPrices = [...competitorPrices].sort((a, b) => a.price - b.price);
  
  // Цвета для светлой/темной темы
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const lowerPriceColor = useColorModeValue('red.500', 'red.300');
  const higherPriceColor = useColorModeValue('green.500', 'green.300');
  const samePriceColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Box>
      <Text fontSize="lg" fontWeight="medium" mb={4}>
        Цены конкурентов
      </Text>
      
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Конкурент</Th>
              <Th isNumeric>Цена</Th>
              <Th>Разница</Th>
              <Th>Рейтинг</Th>
              <Th>Отзывы</Th>
              <Th>Ссылка</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedPrices.map((competitor, index) => {
              // Расчет разницы в цене
              const priceDiff = competitor.price - currentPrice;
              const priceDiffPercent = (priceDiff / currentPrice) * 100;
              
              // Определение цвета для разницы в цене
              let diffColor;
              let diffIcon;
              
              if (priceDiff < 0) {
                diffColor = lowerPriceColor;
                diffIcon = <TriangleDownIcon />;
              } else if (priceDiff > 0) {
                diffColor = higherPriceColor;
                diffIcon = <TriangleUpIcon />;
              } else {
                diffColor = samePriceColor;
                diffIcon = null;
              }
              
              return (
                <Tr key={index}>
                  <Td>
                    <Flex align="center">
                      <Text fontWeight={competitor.isMain ? "bold" : "normal"}>
                        {competitor.name}
                      </Text>
                      {competitor.isMain && (
                        <Badge ml={2} colorScheme="blue" size="sm">
                          Основной
                        </Badge>
                      )}
                    </Flex>
                  </Td>
                  <Td isNumeric>{formatPrice(competitor.price)}</Td>
                  <Td>
                    <Flex align="center" color={diffColor}>
                      {diffIcon}
                      <Text ml={1}>
                        {priceDiff !== 0 ? (
                          <>
                            {priceDiff > 0 ? '+' : ''}
                            {formatPrice(priceDiff)} ({priceDiffPercent.toFixed(1)}%)
                          </>
                        ) : (
                          'Равная цена'
                        )}
                      </Text>
                    </Flex>
                  </Td>
                  <Td>
                    {competitor.rating ? (
                      <Flex align="center">
                        <Text>{competitor.rating.toFixed(1)}</Text>
                        <Icon viewBox="0 0 24 24" color="yellow.400" ml={1}>
                          <path
                            fill="currentColor"
                            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                          />
                        </Icon>
                      </Flex>
                    ) : (
                      <Text color={textColor}>—</Text>
                    )}
                  </Td>
                  <Td>{competitor.reviewsCount || '—'}</Td>
                  <Td>
                    {competitor.url ? (
                      <Link href={competitor.url} isExternal color="blue.500">
                        <ExternalLinkIcon />
                      </Link>
                    ) : (
                      <Text color={textColor}>—</Text>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CompetitorPricesTable;
