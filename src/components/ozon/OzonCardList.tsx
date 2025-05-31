import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Badge,
  Divider,
  Image,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  Spacer
} from '@chakra-ui/react';
import { OzonCardData } from '../../types/product';

interface OzonCardListProps {
  cardData: OzonCardData | null;
}

/**
 * Компонент для отображения данных карточки товара в виде списка
 */
const OzonCardList: React.FC<OzonCardListProps> = ({ cardData }) => {
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Статусы карточки
  const statusColors = {
    draft: 'gray',
    pending: 'yellow',
    published: 'green',
    rejected: 'red'
  };

  const statusLabels = {
    draft: 'Черновик',
    pending: 'На модерации',
    published: 'Опубликована',
    rejected: 'Отклонена'
  };

  // Если нет данных карточки
  if (!cardData) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>Нет данных карточки товара</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <Accordion defaultIndex={[0, 1, 2, 3, 4]} allowMultiple>
        <AccordionItem>
          <AccordionButton bg={headerBg} _hover={{ bg: headerBg }}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Основная информация</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="bold">Название товара:</Text>
                <Text>{cardData.title}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Бренд:</Text>
                <Text>{cardData.brand}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Категория:</Text>
                <Text>{cardData.categoryId}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Штрих-код:</Text>
                <Text>{cardData.barcode || 'Не указан'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Статус:</Text>
                <Badge colorScheme={statusColors[cardData.status]}>
                  {statusLabels[cardData.status]}
                </Badge>
              </Box>

              <Box>
                <Text fontWeight="bold">Производитель:</Text>
                <Text>{cardData.manufacturer || 'Не указан'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Страна производства:</Text>
                <Text>{cardData.manufacturerCountry || 'Не указана'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">НДС:</Text>
                <Text>{cardData.vat ? `${cardData.vat}%` : 'Не указан'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Гарантия:</Text>
                <Text>{cardData.warranty ? `${cardData.warranty} мес.` : 'Не указана'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Цифровой товар:</Text>
                <Text>{cardData.isDigital ? 'Да' : 'Нет'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Товар для взрослых:</Text>
                <Text>{cardData.isAdult ? 'Да' : 'Нет'}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold">Количество в упаковке:</Text>
                <Text>{cardData.packageQuantity || 1}</Text>
              </Box>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton bg={headerBg} _hover={{ bg: headerBg }}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Описание</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Box mb={4}>
              <Text fontWeight="bold">Полное описание:</Text>
              <Text whiteSpace="pre-line">{cardData.description}</Text>
            </Box>

            {cardData.shortDescription && (
              <Box>
                <Text fontWeight="bold">Краткое описание:</Text>
                <Text>{cardData.shortDescription}</Text>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton bg={headerBg} _hover={{ bg: headerBg }}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Атрибуты</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {cardData.attributes.length === 0 ? (
              <Text color={textColor}>Атрибуты не добавлены</Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {cardData.attributes.map((attr) => (
                  <HStack key={attr.id} p={2} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">{attr.name}:</Text>
                    <Text>{attr.value}</Text>
                    {attr.isRequired && (
                      <Badge colorScheme="red">Обязательный</Badge>
                    )}
                  </HStack>
                ))}
              </VStack>
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton bg={headerBg} _hover={{ bg: headerBg }}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Характеристики</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {cardData.specifications.length === 0 ? (
              <Text color={textColor}>Характеристики не добавлены</Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {cardData.specifications.map((spec) => (
                  <HStack key={spec.id} p={2} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">{spec.name}:</Text>
                    <Text>{spec.value} {spec.unit}</Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton bg={headerBg} _hover={{ bg: headerBg }}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Изображения</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {cardData.images.length === 0 ? (
              <Text color={textColor}>Изображения не добавлены</Text>
            ) : (
              <SimpleGrid columns={3} spacing={4}>
                {cardData.images.map((url, index) => (
                  <Box
                    key={index}
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={cardData.primaryImage === url ? 'blue.500' : borderColor}
                  >
                    <Image
                      src={url}
                      alt={`Изображение товара ${index + 1}`}
                      maxHeight="150px"
                      objectFit="contain"
                      mx="auto"
                      mb={2}
                    />

                    <HStack justify="center">
                      <Text fontSize="sm">
                        {cardData.primaryImage === url ? 'Основное изображение' : `Изображение ${index + 1}`}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton bg={headerBg} _hover={{ bg: headerBg }}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Размеры и упаковка</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {cardData.dimensions ? (
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontWeight="bold">Вес:</Text>
                  <Text>{cardData.dimensions.weight} г</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Длина:</Text>
                  <Text>{cardData.dimensions.length} мм</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Ширина:</Text>
                  <Text>{cardData.dimensions.width} мм</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Высота:</Text>
                  <Text>{cardData.dimensions.height} мм</Text>
                </Box>
              </SimpleGrid>
            ) : (
              <Text color={textColor}>Размеры не указаны</Text>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default OzonCardList;
