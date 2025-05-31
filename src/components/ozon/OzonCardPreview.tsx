import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Badge,
  Divider,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Flex,
  useColorModeValue,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { StarIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaShoppingCart, FaHeart, FaShare, FaTag, FaTruck, FaShieldAlt, FaStore } from 'react-icons/fa';
import { OzonCardData } from '../../types/product';

interface OzonCardPreviewProps {
  cardData: OzonCardData | null;
}

/**
 * Компонент для предпросмотра карточки товара Ozon
 */
const OzonCardPreview: React.FC<OzonCardPreviewProps> = ({ cardData }) => {
  // Состояние
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryBg = useColorModeValue('gray.50', 'gray.700');

  // Если нет данных карточки
  if (!cardData) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>Нет данных для предпросмотра карточки товара</Text>
      </Alert>
    );
  }

  // Получаем основное изображение
  const primaryImage = cardData.primaryImage || (cardData.images.length > 0 ? cardData.images[0] : '');

  // Получаем выбранное изображение
  const selectedImage = cardData.images[selectedImageIndex] || primaryImage;

  // Категории для хлебных крошек
  const categoryPath = cardData.categoryPath || ['Главная', 'Каталог', cardData.categoryId];

  // Форматирование цены
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Генерация случайной цены для демонстрации
  const generateRandomPrice = (): number => {
    return Math.floor(Math.random() * 10000) + 1000;
  };

  // Случайная цена для демонстрации
  const price = generateRandomPrice();
  const oldPrice = price * 1.2;

  return (
    <Box>
      <Box
        p={4}
        bg={bgColor}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
          fontSize="sm"
          mb={4}
        >
          {categoryPath.map((category, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbLink href="#" color={textColor}>
                {category}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Блок с изображениями */}
          <Box>
            <Box
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              p={2}
              mb={4}
              height="400px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={useColorModeValue('white', 'gray.700')}
            >
              <Image
                src={selectedImage}
                alt={cardData.title}
                maxHeight="380px"
                objectFit="contain"
              />
            </Box>

            <SimpleGrid columns={5} spacing={2}>
              {cardData.images.map((image, index) => (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={selectedImageIndex === index ? primaryColor : borderColor}
                  p={1}
                  cursor="pointer"
                  onClick={() => setSelectedImageIndex(index)}
                  height="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={useColorModeValue('white', 'gray.700')}
                >
                  <Image
                    src={image}
                    alt={`${cardData.title} - изображение ${index + 1}`}
                    maxHeight="50px"
                    objectFit="contain"
                  />
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Блок с информацией о товаре */}
          <Box>
            <Badge colorScheme="blue" mb={2}>
              {cardData.brand}
            </Badge>

            <Heading as="h1" size="lg" mb={2}>
              {cardData.title}
            </Heading>

            <HStack mb={4}>
              <HStack>
                {Array(5)
                  .fill('')
                  .map((_, i) => (
                    <StarIcon
                      key={i}
                      color={i < 4 ? 'yellow.400' : 'gray.300'}
                    />
                  ))}
              </HStack>
              <Text color={textColor}>4.0 (42 отзыва)</Text>
              <Text color={primaryColor}>Код товара: {cardData.id || '12345678'}</Text>
            </HStack>

            <HStack mb={4}>
              <Heading size="xl" color={primaryColor}>
                {formatPrice(price)}
              </Heading>
              <Text as="s" color={textColor}>
                {formatPrice(oldPrice)}
              </Text>
              <Badge colorScheme="red" fontSize="md" p={1}>
                -{Math.round((1 - price / oldPrice) * 100)}%
              </Badge>
            </HStack>

            <HStack mb={6}>
              <Button
                colorScheme="blue"
                size="lg"
                leftIcon={<Icon as={FaShoppingCart} />}
                flex={1}
              >
                В корзину
              </Button>

              <Button
                variant="outline"
                colorScheme="blue"
                leftIcon={<Icon as={FaHeart} />}
              >
                В избранное
              </Button>

              <Button
                variant="outline"
                colorScheme="blue"
                leftIcon={<Icon as={FaShare} />}
              >
                Поделиться
              </Button>
            </HStack>

            <Box
              p={4}
              bg={secondaryBg}
              borderRadius="md"
              mb={4}
            >
              <HStack mb={2}>
                <Icon as={FaTag} color={primaryColor} />
                <Text fontWeight="bold">Акция:</Text>
                <Text>Скидка 10% при покупке от 2 штук</Text>
              </HStack>

              <HStack mb={2}>
                <Icon as={FaTruck} color={primaryColor} />
                <Text fontWeight="bold">Доставка:</Text>
                <Text>Завтра, бесплатно</Text>
              </HStack>

              <HStack>
                <Icon as={FaShieldAlt} color={primaryColor} />
                <Text fontWeight="bold">Гарантия:</Text>
                <Text>{cardData.warranty ? `${cardData.warranty} мес.` : 'Не указана'}</Text>
              </HStack>
            </Box>

            <Box mb={4}>
              <Heading size="sm" mb={2}>Краткое описание:</Heading>
              <Text color={textColor}>
                {cardData.shortDescription || cardData.description.substring(0, 150) + '...'}
              </Text>
            </Box>

            <HStack>
              <Icon as={FaStore} color={primaryColor} />
              <Text fontWeight="bold">Продавец:</Text>
              <Text>{cardData.manufacturer || 'ООО "Компания"'}</Text>
            </HStack>
          </Box>
        </SimpleGrid>

        <Divider my={6} />

        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>Описание</Tab>
            <Tab>Характеристики</Tab>
            <Tab>Отзывы</Tab>
            <Tab>Вопросы и ответы</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Описание товара</Heading>
                <Text whiteSpace="pre-line">{cardData.description}</Text>

                {cardData.dimensions && (
                  <Box mt={4}>
                    <Heading size="sm" mb={2}>Размеры и вес:</Heading>
                    <SimpleGrid columns={2} spacing={4}>
                      <HStack>
                        <Text fontWeight="bold">Вес:</Text>
                        <Text>{cardData.dimensions.weight} г</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Габариты (Д×Ш×В):</Text>
                        <Text>
                          {cardData.dimensions.length} × {cardData.dimensions.width} × {cardData.dimensions.height} мм
                        </Text>
                      </HStack>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Характеристики товара</Heading>

                {cardData.specifications.length === 0 ? (
                  <Text color={textColor}>Характеристики не указаны</Text>
                ) : (
                  <Accordion allowMultiple defaultIndex={[0]}>
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Heading size="sm">Основные характеристики</Heading>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <SimpleGrid columns={1} spacing={2}>
                          {cardData.specifications.map((spec) => (
                            <SimpleGrid key={spec.id} columns={2} spacing={4} py={1} borderBottomWidth="1px" borderColor={borderColor}>
                              <Text color={textColor}>{spec.name}</Text>
                              <Text>{spec.value} {spec.unit}</Text>
                            </SimpleGrid>
                          ))}
                        </SimpleGrid>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                )}

                {cardData.attributes.length > 0 && (
                  <Box mt={4}>
                    <Heading size="sm" mb={2}>Дополнительные атрибуты:</Heading>
                    <SimpleGrid columns={2} spacing={4}>
                      {cardData.attributes.map((attr) => (
                        <HStack key={attr.id}>
                          <Text fontWeight="bold">{attr.name}:</Text>
                          <Text>{attr.value}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Отзывы о товаре</Heading>
                <Text color={textColor}>
                  Отзывы будут доступны после публикации товара на Ozon
                </Text>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Вопросы и ответы</Heading>
                <Text color={textColor}>
                  Вопросы и ответы будут доступны после публикации товара на Wildberries
                </Text>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <Alert status="info" mt={4}>
        <AlertIcon />
        <Text>
          Это предварительный просмотр карточки товара. Реальный вид может отличаться после публикации на Wildberries.
        </Text>
      </Alert>
    </Box>
  );
};

export default OzonCardPreview;
