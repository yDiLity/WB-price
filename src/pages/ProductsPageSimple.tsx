import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
  useColorModeValue
} from '@chakra-ui/react';
import { mockProducts } from '../services/mockData';

export default function ProductsPageSimple() {
  // Используем моковые данные напрямую, без контекста
  const products = mockProducts.slice(0, 10); // Берем только первые 10 товаров для примера
  
  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Товары (Упрощенная версия)</Heading>
      
      <Text mb={4}>Отображаются первые 10 товаров из моковых данных</Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {products.map(product => (
          <Card 
            key={product.id} 
            bg={cardBg} 
            borderWidth="1px" 
            borderColor={borderColor} 
            borderRadius="lg"
            overflow="hidden"
            boxShadow="sm"
          >
            <CardHeader>
              <Heading size="md">{product.title}</Heading>
            </CardHeader>
            
            <CardBody>
              <Stack divider={<StackDivider />} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">Категория</Text>
                  <Text>{product.category}</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.500">Цена</Text>
                  <Text fontWeight="bold" color="blue.500">
                    {formatPrice(product.price.current)}
                  </Text>
                  {product.price.old && (
                    <Text fontSize="sm" textDecoration="line-through" color="gray.500">
                      {formatPrice(product.price.old)}
                    </Text>
                  )}
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.500">Наличие</Text>
                  <Text>{product.stock.available} шт.</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.500">Статус</Text>
                  <Text>{product.status}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
