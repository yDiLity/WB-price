import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Image,
  Stack,
  Flex,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useSimpleProducts } from '../context/SimpleProductContext';
import { Product, ProductCategory, ProductStatus } from '../types/product';

// Вспомогательная функция для форматирования цены
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
};

// Компонент карточки товара
const SimpleProductCard = ({ product }: { product: Product }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
    >
      <Box height="200px" bg="gray.100" position="relative" overflow="hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            objectFit="contain"
            width="100%"
            height="100%"
            fallbackSrc="/images/placeholders/default.svg"
          />
        ) : (
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Нет изображения</Text>
          </Box>
        )}

        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={
            product.status === ProductStatus.ACTIVE ? 'green' :
            product.status === ProductStatus.PENDING ? 'yellow' :
            'red'
          }
          px={2}
          py={1}
          borderRadius="full"
        >
          {product.status}
        </Badge>
      </Box>

      <CardHeader pb={0}>
        <Heading size="md" noOfLines={2}>{product.title}</Heading>
      </CardHeader>

      <CardBody>
        <Stack spacing={3}>
          <Badge colorScheme="blue" width="fit-content">
            {product.category}
          </Badge>

          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {formatPrice(product.price.current)}
              </Text>
              {product.price.old && (
                <Text fontSize="sm" textDecoration="line-through" color="gray.500">
                  {formatPrice(product.price.old)}
                </Text>
              )}
            </Box>

            <Badge colorScheme={product.stock.available > 0 ? 'green' : 'red'}>
              {product.stock.available > 0 ? `В наличии: ${product.stock.available}` : 'Нет в наличии'}
            </Badge>
          </Flex>

          <Button colorScheme="blue" size="sm">
            Подробнее
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
};

// Основной компонент страницы
export default function SimpleProductsPage() {
  const { products, isLoading, error } = useSimpleProducts();

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Heading as="h1" size="xl" mb={6}>Товары (Упрощенная версия)</Heading>

        {isLoading ? (
          <Flex justify="center" align="center" height="300px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        ) : (
          <>
            <Text mb={6}>Отображается {products.length} товаров</Text>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {products.map(product => (
                <SimpleProductCard key={product.id} product={product} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Container>
    </Box>
  );
}
