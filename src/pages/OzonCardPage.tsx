import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
  Flex,
  Badge,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductsNew } from '../context/ProductContextNew';
import OzonCardManager from '../components/ozon/OzonCardManager';
import { OzonCardData } from '../types/product';

/**
 * Страница для управления карточкой товара Ozon
 */
const OzonCardPage: React.FC = () => {
  // Получаем ID товара из URL
  const { productId } = useParams<{ productId: string }>();

  // Навигация
  const navigate = useNavigate();

  // Получаем данные о товарах из контекста
  const {
    products,
    selectedProduct,
    isLoading,
    error,
    loadProductById,
    updateProduct
  } = useProductsNew();

  // Toast для уведомлений
  const toast = useToast();

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Загружаем товар при монтировании компонента
  useEffect(() => {
    if (productId && !selectedProduct) {
      loadProductById(productId);
    }
  }, [productId, selectedProduct]);

  // Обработчик сохранения карточки товара
  const handleSaveCard = async (productId: string, cardData: OzonCardData): Promise<boolean> => {
    if (!selectedProduct) return false;

    try {
      // Обновляем товар с новыми данными карточки
      await updateProduct(productId, {
        ...selectedProduct,
        ozonCardData: cardData
      });

      return true;
    } catch (error) {
      console.error('Error saving card:', error);

      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить карточку товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    }
  };

  // Обработчик удаления карточки товара
  const handleDeleteCard = async (productId: string, cardId: string): Promise<boolean> => {
    if (!selectedProduct) return false;

    try {
      // Обновляем товар без данных карточки
      await updateProduct(productId, {
        ...selectedProduct,
        ozonCardData: undefined
      });

      return true;
    } catch (error) {
      console.error('Error deleting card:', error);

      toast({
        title: 'Ошибка удаления',
        description: 'Не удалось удалить карточку товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    }
  };

  // Обработчик публикации карточки товара
  const handlePublishCard = async (productId: string, cardId: string): Promise<boolean> => {
    if (!selectedProduct || !selectedProduct.ozonCardData) return false;

    try {
      // Обновляем статус карточки
      await updateProduct(productId, {
        ...selectedProduct,
        ozonCardData: {
          ...selectedProduct.ozonCardData,
          status: 'pending'
        }
      });

      return true;
    } catch (error) {
      console.error('Error publishing card:', error);

      toast({
        title: 'Ошибка публикации',
        description: 'Не удалось опубликовать карточку товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    }
  };

  // Обработчик возврата к списку товаров
  const handleBackToProducts = () => {
    navigate('/products');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        mb={4}
      >
        <BreadcrumbItem>
          <BreadcrumbLink onClick={handleBackToProducts}>Товары</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>
            {selectedProduct ? selectedProduct.title : 'Карточка товара Ozon'}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <HStack mb={6}>
        <Heading as="h1" size="xl">Карточка товара Ozon</Heading>
        <Badge colorScheme="blue" fontSize="md" p={1}>
          BETA
        </Badge>
      </HStack>

      <Text color={textColor} mb={6}>
        Создайте и настройте карточку товара для публикации на Ozon Marketplace
      </Text>

      {isLoading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Text>Ошибка загрузки товара: {error}</Text>
        </Alert>
      ) : !selectedProduct ? (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <Text>Товар не найден</Text>
        </Alert>
      ) : (
        <VStack spacing={6} align="stretch">
          <Box
            p={4}
            bg={bgColor}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>Информация о товаре</Heading>

            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="bold">Название:</Text>
                <Text>{selectedProduct.title}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Артикул:</Text>
                <Text>{selectedProduct.sku}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Категория:</Text>
                <Text>{selectedProduct.category}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Бренд:</Text>
                <Text>{selectedProduct.brand || 'Не указан'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Цена:</Text>
                <Text>{selectedProduct.price.current} ₽</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Штрих-код:</Text>
                <Text>{selectedProduct.barcode || 'Не указан'}</Text>
              </Box>
            </SimpleGrid>
          </Box>

          <Divider />

          <OzonCardManager
            product={selectedProduct}
            onSaveCard={handleSaveCard}
            onDeleteCard={handleDeleteCard}
            onPublishCard={handlePublishCard}
          />

          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Примечание:</Text>
              <Text>
                Функция создания карточек товаров для Ozon находится в бета-версии.
                В настоящее время данные сохраняются только локально и не отправляются на Ozon.
              </Text>
            </Box>
          </Alert>
        </VStack>
      )}
    </Container>
  );
};

export default OzonCardPage;
