import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { mockProducts } from '../services/mockData';
import { Product } from '../types/product';

export default function SimpleEnhancedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка товаров при монтировании компонента
  useEffect(() => {
    console.log('SimpleEnhancedProductsPage: Component mounted');
    loadProducts();
  }, []);

  // Функция загрузки товаров
  const loadProducts = async () => {
    console.log('SimpleEnhancedProductsPage: Loading products');
    setIsLoading(true);
    setError(null);

    try {
      // Имитация задержки загрузки
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Загрузка товаров из mockData
      console.log('SimpleEnhancedProductsPage: mockProducts length:', mockProducts.length);
      setProducts(mockProducts.slice(0, 10)); // Берем только первые 10 товаров для простоты
    } catch (err) {
      console.error('SimpleEnhancedProductsPage: Error loading products:', err);
      setError('Ошибка при загрузке товаров');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик обновления данных
  const handleRefresh = () => {
    console.log('SimpleEnhancedProductsPage: Refreshing products');
    loadProducts();
  };

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">Простая страница товаров</Heading>
        <Button onClick={handleRefresh} isLoading={isLoading}>
          Обновить
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      ) : products.length === 0 ? (
        <Alert status="info" borderRadius="md" mb={4}>
          <AlertIcon />
          <Text>
            Товары не найдены.
          </Text>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
          {products.map(product => (
            <Box
              key={product.id}
              p={4}
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              boxShadow="md"
            >
              <Heading size="md" mb={2} noOfLines={2}>
                {product.title}
              </Heading>
              <Text mb={2} noOfLines={2}>
                {product.description}
              </Text>
              <Text fontWeight="bold">
                Цена: {product.price.current.toLocaleString('ru-RU')} ₽
              </Text>
              <Text>
                Категория: {product.category}
              </Text>
              <Text>
                Статус: {product.status}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
