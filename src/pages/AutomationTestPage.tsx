import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import { AutomationToggle } from '../components/automation/AutomationToggle';
import { AutomationSettings } from '../components/automation/AutomationSettings';

const AutomationTestPage: React.FC = () => {
  // Тестовые данные
  const testProducts = [
    {
      id: 'test-product-1',
      title: 'iPhone 15 Pro Max 256GB',
      currentPrice: 129990,
    },
    {
      id: 'test-product-2', 
      title: 'Samsung Galaxy S24 Ultra 512GB',
      currentPrice: 119990,
    },
    {
      id: 'test-product-3',
      title: 'MacBook Pro 14" M3 Pro',
      currentPrice: 249990,
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            🧪 Тестирование автоматизации Ozon
          </Heading>
          <Text color="gray.600">
            Эта страница для тестирования галочек автоматического изменения цен
          </Text>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>
            📱 Компактные переключатели (для карточек товаров)
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {testProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" fontSize="sm">
                      {product.title}
                    </Text>
                    <Badge colorScheme="blue">
                      {product.currentPrice.toLocaleString()} ₽
                    </Badge>
                  </VStack>
                </CardHeader>
                <CardBody pt={0}>
                  <AutomationToggle
                    productId={product.id}
                    productTitle={product.title}
                    currentPrice={product.currentPrice}
                    compact={true}
                  />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>
            ⚙️ Полные переключатели
          </Heading>
          <VStack spacing={6}>
            {testProducts.map((product) => (
              <AutomationToggle
                key={product.id}
                productId={product.id}
                productTitle={product.title}
                currentPrice={product.currentPrice}
                compact={false}
              />
            ))}
          </VStack>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>
            🔧 Полные настройки автоматизации
          </Heading>
          <AutomationSettings
            productId={testProducts[0].id}
            productTitle={testProducts[0].title}
            currentPrice={testProducts[0].currentPrice}
          />
        </Box>
      </VStack>
    </Container>
  );
};

export default AutomationTestPage;
