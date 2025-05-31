import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Box,
  Image,
  Text,
  Flex,
  Spinner,
  useToast,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { searchImages, ImageSearchResult } from '../../services/imageSearchService';
import { Product, ImageSource } from '../../types/product';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, source?: ImageSource, title?: string) => void;
  product?: Product;
  initialQuery?: string;
}

/**
 * Модальное окно для поиска и выбора изображений
 */
export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  product,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<ImageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageSearchResult | null>(null);

  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.400');

  // При открытии модального окна формируем запрос на основе данных товара
  useEffect(() => {
    if (isOpen && product && !initialQuery) {
      const newQuery = `${product.brand || ''} ${product.title} product image`.trim();
      setQuery(newQuery);

      // Автоматически выполняем поиск при открытии с данными товара
      if (newQuery) {
        handleSearch(newQuery);
      }
    } else if (isOpen && initialQuery) {
      handleSearch(initialQuery);
    }
  }, [isOpen, product, initialQuery]);

  // Обработчик изменения поискового запроса
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Обработчик нажатия Enter в поле поиска
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query);
    }
  };

  // Обработчик поиска изображений
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedImage(null);

    try {
      const results = await searchImages({ query: searchQuery, maxResults: 20 });
      setImages(results);

      if (results.length === 0) {
        setError('Изображения не найдены. Попробуйте изменить запрос.');
      }
    } catch (err: any) {
      console.error('Ошибка при поиске изображений:', err);
      setError(err.message || 'Произошла ошибка при поиске изображений');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик выбора изображения
  const handleImageSelect = (image: ImageSearchResult) => {
    setSelectedImage(image);
  };

  // Обработчик подтверждения выбора изображения
  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelectImage(
        selectedImage.url,
        selectedImage.source || ImageSource.GOOGLE,
        selectedImage.title
      );
      onClose();

      toast({
        title: 'Изображение выбрано',
        description: `Источник: ${selectedImage.source || 'Google'}`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } else {
      toast({
        title: 'Выберите изображение',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>Поиск изображений</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* Поисковая строка */}
          <InputGroup mb={4}>
            <Input
              placeholder="Введите запрос для поиска изображений"
              value={query}
              onChange={handleQueryChange}
              onKeyPress={handleKeyPress}
            />
            <InputRightElement>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSearch(query)}
                isDisabled={!query.trim() || loading}
              >
                <SearchIcon />
              </Button>
            </InputRightElement>
          </InputGroup>

          {/* Индикатор загрузки */}
          {loading && (
            <Flex justify="center" my={8}>
              <Spinner size="xl" />
            </Flex>
          )}

          {/* Сообщение об ошибке */}
          {error && !loading && (
            <Text color="red.500" textAlign="center" my={4}>
              {error}
            </Text>
          )}

          {/* Сетка изображений */}
          {!loading && images.length > 0 && (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} mb={4}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  borderWidth="2px"
                  borderColor={selectedImage?.url === image.url ? selectedBorderColor : borderColor}
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => handleImageSelect(image)}
                  transition="all 0.2s"
                  _hover={{ shadow: 'md' }}
                  position="relative"
                >
                  {/* Бейдж с источником изображения */}
                  {image.source && (
                    <Badge
                      position="absolute"
                      top={1}
                      right={1}
                      colorScheme={
                        image.source === ImageSource.OZON ? 'blue' :
                        image.source === ImageSource.GOOGLE ? 'green' : 'gray'
                      }
                      fontSize="xs"
                      px={1}
                    >
                      {image.source}
                    </Badge>
                  )}

                  <Image
                    src={image.thumbnail || image.url}
                    alt={image.title}
                    objectFit="cover"
                    width="100%"
                    height="120px"
                    fallbackSrc="/images/placeholders/default.svg"
                  />
                  <Text p={2} fontSize="xs" noOfLines={1}>
                    {image.title}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}

          {/* Сообщение, если ничего не найдено */}
          {!loading && !error && images.length === 0 && (
            <Text color="gray.500" textAlign="center" my={8}>
              Введите запрос для поиска изображений
            </Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleConfirmSelection}
            isDisabled={!selectedImage}
          >
            Выбрать
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
