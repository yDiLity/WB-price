import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaWarehouse, FaTools } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Основной компонент страницы логистического оптимизатора
const LogisticsOptimizerPage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const navigate = useNavigate();

  return (
    <Box bg={bgColor} minH="calc(100vh - 80px)">
      <Container maxW="container.xl" py={8}>
        <HStack mb={6}>
          <Icon as={FaWarehouse} boxSize={8} color="blue.500" />
          <Heading as="h1" size="xl">Логистический оптимизатор</Heading>
        </HStack>

        <Text mb={8} fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
          Оптимизируйте цены на основе данных о запасах и поставках для максимизации прибыли и эффективного управления складом.
        </Text>

        <Alert status="info" borderRadius="md" mb={8}>
          <AlertIcon />
          <Box>
            <AlertTitle>Модуль в разработке</AlertTitle>
            <AlertDescription>
              Логистический оптимизатор находится в стадии разработки и будет доступен в ближайшее время.
            </AlertDescription>
          </Box>
        </Alert>

        <VStack spacing={6} align="stretch">
          <Box p={6} borderWidth="1px" borderRadius="lg" bg={useColorModeValue('white', 'gray.800')}>
            <HStack mb={4}>
              <Icon as={FaTools} color="blue.500" boxSize={6} />
              <Heading size="md">Функции логистического оптимизатора</Heading>
            </HStack>
            <VStack align="start" spacing={3}>
              <Text>• Автоматическая оптимизация цен на основе остатков товаров</Text>
              <Text>• Управление поставками и отслеживание сроков</Text>
              <Text>• Аналитика логистических данных и рекомендации</Text>
              <Text>• Настройка правил оптимизации цен</Text>
            </VStack>
          </Box>

          <Button
            colorScheme="blue"
            size="lg"
            alignSelf="center"
            mt={4}
            onClick={() => navigate('/')}
          >
            Перейти на главную страницу
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default LogisticsOptimizerPage;
