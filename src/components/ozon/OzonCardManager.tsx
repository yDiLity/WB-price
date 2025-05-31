import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Flex,
  Badge,
  useColorModeValue,
  useToast,
  HStack,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  useDisclosure
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt, FaExclamationTriangle, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { Product, OzonCardData } from '../../types/product';
import OzonCardEditor from './OzonCardEditor';
import OzonCardPreview from './OzonCardPreview';
import OzonCardList from './OzonCardList';
import OzonCardImportModal from './OzonCardImportModal';
import HelpTooltip from '../common/HelpTooltip';

interface OzonCardManagerProps {
  product: Product;
  onSaveCard: (productId: string, cardData: OzonCardData) => Promise<boolean>;
  onDeleteCard: (productId: string, cardId: string) => Promise<boolean>;
  onPublishCard: (productId: string, cardId: string) => Promise<boolean>;
}

/**
 * Компонент для управления карточками товаров Ozon
 */
const OzonCardManager: React.FC<OzonCardManagerProps> = ({
  product,
  onSaveCard,
  onDeleteCard,
  onPublishCard
}) => {
  // Состояние
  const [activeCard, setActiveCard] = useState<OzonCardData | null>(product.ozonCardData || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Обновляем activeCard при изменении product.ozonCardData
  useEffect(() => {
    if (product.ozonCardData && JSON.stringify(product.ozonCardData) !== JSON.stringify(activeCard)) {
      setActiveCard(product.ozonCardData);
    }
  }, [product.ozonCardData]);

  // Модальное окно для импорта карточки
  const { isOpen: isImportModalOpen, onOpen: onImportModalOpen, onClose: onImportModalClose } = useDisclosure();

  // Toast для уведомлений
  const toast = useToast();

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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

  // Обработчик создания новой карточки
  const handleCreateCard = () => {
    const newCard: OzonCardData = {
      status: 'draft',
      title: product.title,
      description: product.description,
      brand: product.brand || '',
      barcode: product.barcode,
      images: product.images.map(img => img.url),
      attributes: [],
      specifications: [],
      categoryId: product.category,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setActiveCard(newCard);
    setIsEditing(true);
  };

  // Обработчик редактирования карточки
  const handleEditCard = () => {
    setIsEditing(true);
  };

  // Обработчик сохранения карточки
  const handleSaveCard = async (cardData: OzonCardData) => {
    setIsLoading(true);

    try {
      // Валидация карточки
      const errors = validateCard(cardData);

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: 'Ошибка валидации',
          description: 'Пожалуйста, исправьте ошибки в карточке товара',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Сохранение карточки
      const success = await onSaveCard(product.id, {
        ...cardData,
        updatedAt: new Date()
      });

      if (success) {
        setActiveCard({
          ...cardData,
          updatedAt: new Date()
        });

        setIsEditing(false);

        toast({
          title: 'Карточка сохранена',
          description: 'Карточка товара успешно сохранена',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка сохранения',
          description: 'Не удалось сохранить карточку товара',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Произошла ошибка при сохранении карточки товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик удаления карточки
  const handleDeleteCard = async () => {
    if (!activeCard || !activeCard.id) return;

    setIsLoading(true);

    try {
      const success = await onDeleteCard(product.id, activeCard.id);

      if (success) {
        setActiveCard(null);

        toast({
          title: 'Карточка удалена',
          description: 'Карточка товара успешно удалена',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка удаления',
          description: 'Не удалось удалить карточку товара',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Ошибка удаления',
        description: 'Произошла ошибка при удалении карточки товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик публикации карточки
  const handlePublishCard = async () => {
    if (!activeCard || !activeCard.id) return;

    setIsLoading(true);

    try {
      // Валидация карточки
      const errors = validateCard(activeCard);

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: 'Ошибка валидации',
          description: 'Пожалуйста, исправьте ошибки в карточке товара перед публикацией',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const success = await onPublishCard(product.id, activeCard.id);

      if (success) {
        setActiveCard({
          ...activeCard,
          status: 'pending',
          updatedAt: new Date()
        });

        toast({
          title: 'Карточка отправлена на модерацию',
          description: 'Карточка товара успешно отправлена на модерацию',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка публикации',
          description: 'Не удалось отправить карточку товара на модерацию',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error publishing card:', error);
      toast({
        title: 'Ошибка публикации',
        description: 'Произошла ошибка при отправке карточки товара на модерацию',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик импорта карточки
  const handleImportCard = (cardData: OzonCardData) => {
    setActiveCard({
      ...cardData,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    setIsEditing(true);
    onImportModalClose();

    toast({
      title: 'Карточка импортирована',
      description: 'Карточка товара успешно импортирована',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Валидация карточки товара
  const validateCard = (cardData: OzonCardData): string[] => {
    const errors: string[] = [];

    if (!cardData.title || cardData.title.trim() === '') {
      errors.push('Название товара не может быть пустым');
    }

    if (!cardData.description || cardData.description.trim() === '') {
      errors.push('Описание товара не может быть пустым');
    }

    if (!cardData.brand || cardData.brand.trim() === '') {
      errors.push('Бренд товара не может быть пустым');
    }

    if (!cardData.images || cardData.images.length === 0) {
      errors.push('Необходимо добавить хотя бы одно изображение товара');
    }

    if (!cardData.categoryId || cardData.categoryId.trim() === '') {
      errors.push('Необходимо выбрать категорию товара');
    }

    // Проверка обязательных атрибутов
    const requiredAttributes = cardData.attributes.filter(attr => attr.isRequired);
    for (const attr of requiredAttributes) {
      if (!attr.value || attr.value.trim() === '') {
        errors.push(`Атрибут "${attr.name}" является обязательным`);
      }
    }

    return errors;
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Heading size="md">Карточка товара Ozon</Heading>
          <Badge colorScheme="blue" fontSize="sm" p={1}>
            BETA
          </Badge>
          <HelpTooltip
            label="Карточка товара Ozon"
            description="Создание и редактирование карточки товара для Ozon Marketplace."
            steps={[
              "Создайте карточку товара с описанием, характеристиками и изображениями",
              "Предварительно просмотрите, как карточка будет выглядеть на Ozon",
              "Отправьте карточку на модерацию для публикации на Ozon"
            ]}
          />
        </HStack>

        <HStack>
          {!activeCard && (
            <Button
              leftIcon={<Icon as={FaPlus} />}
              colorScheme="blue"
              onClick={handleCreateCard}
              isLoading={isLoading}
            >
              Создать карточку
            </Button>
          )}

          {activeCard && !isEditing && (
            <>
              <Button
                leftIcon={<Icon as={FaEdit} />}
                colorScheme="blue"
                onClick={handleEditCard}
                isLoading={isLoading}
              >
                Редактировать
              </Button>

              <Button
                leftIcon={<Icon as={FaTrash} />}
                colorScheme="red"
                onClick={handleDeleteCard}
                isLoading={isLoading}
                isDisabled={!activeCard.id}
              >
                Удалить
              </Button>

              {activeCard.status === 'draft' && (
                <Button
                  leftIcon={<Icon as={FaCloudUploadAlt} />}
                  colorScheme="green"
                  onClick={handlePublishCard}
                  isLoading={isLoading}
                  isDisabled={!activeCard.id}
                >
                  Опубликовать
                </Button>
              )}
            </>
          )}

          {!isEditing && (
            <Button
              leftIcon={<Icon as={FaCloudUploadAlt} />}
              colorScheme="teal"
              onClick={onImportModalOpen}
              isLoading={isLoading}
            >
              Импорт
            </Button>
          )}
        </HStack>
      </Flex>

      {activeCard && (
        <HStack mb={4}>
          <Text fontWeight="medium">Статус:</Text>
          <Badge colorScheme={statusColors[activeCard.status]}>
            {statusLabels[activeCard.status]}
          </Badge>

          {activeCard.updatedAt && (
            <Text fontSize="sm" color={textColor}>
              Обновлено: {new Date(activeCard.updatedAt).toLocaleString()}
            </Text>
          )}
        </HStack>
      )}

      {validationErrors.length > 0 && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Ошибки валидации:</Text>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Box>
        </Alert>
      )}

      {!activeCard && !isEditing ? (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">У товара еще нет карточки на Ozon</Text>
            <Text>Создайте карточку товара для публикации на Ozon Marketplace</Text>
          </Box>
        </Alert>
      ) : (
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>Редактор</Tab>
            <Tab>Предпросмотр</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {isEditing ? (
                <OzonCardEditor
                  cardData={activeCard}
                  onSave={handleSaveCard}
                  onCancel={() => setIsEditing(false)}
                  isLoading={isLoading}
                />
              ) : (
                <OzonCardList cardData={activeCard} />
              )}
            </TabPanel>

            <TabPanel px={0}>
              <OzonCardPreview cardData={activeCard} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <OzonCardImportModal
        isOpen={isImportModalOpen}
        onClose={onImportModalClose}
        onImport={handleImportCard}
      />
    </Box>
  );
};

export default OzonCardManager;
