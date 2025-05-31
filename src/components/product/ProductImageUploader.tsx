import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  IconButton,
  VStack,
  HStack,
  Progress,
  useToast,
  useColorModeValue,
  Tooltip,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, StarIcon, DownloadIcon, SearchIcon } from '@chakra-ui/icons';
import { useCloudinary } from '../../hooks/useCloudinary';
import { productImageService } from '../../services/productImageService';
import { Product, ProductImage, ImageSource } from '../../types/product';
import { ImageSearchModal } from './ImageSearchModal';

interface ProductImageUploaderProps {
  product: Product;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

/**
 * Компонент для загрузки и управления изображениями товара
 */
export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  product,
  images,
  onImagesChange,
  maxImages = 10
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Инициализация Cloudinary
  const cloudinary = useCloudinary({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY
  });

  // Обработчик клика по кнопке добавления изображения
  const handleAddClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Обработчик загрузки файла
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Проверяем, не превышено ли максимальное количество изображений
    if (images.length + files.length > maxImages) {
      toast({
        title: 'Превышено максимальное количество изображений',
        description: `Вы можете загрузить максимум ${maxImages} изображений`,
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    // Загружаем каждый файл
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверяем, что файл является изображением
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Неверный формат файла',
          description: 'Пожалуйста, загрузите изображение',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        continue;
      }

      try {
        let imageUrl = '';
        let imageId = `img-${product.id}-${Date.now()}-${i}`;

        // Пытаемся загрузить в Cloudinary, если настроено
        if (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
          const result = await cloudinary.uploadFile(file, `products/${product.id}`);

          if (result) {
            imageUrl = result.url;
            imageId = `cloudinary-${result.publicId}`;
          } else {
            // Если загрузка в Cloudinary не удалась, используем локальный URL
            imageUrl = URL.createObjectURL(file);
          }
        } else {
          // Если Cloudinary не настроен, используем локальный URL
          imageUrl = URL.createObjectURL(file);
        }

        // Создаем новое изображение
        const newImage: ProductImage = {
          id: imageId,
          url: imageUrl,
          isMain: images.length === 0, // Первое изображение становится основным
          sortOrder: images.length + i,
          source: ImageSource.UPLOAD,
          title: file.name || `Изображение товара ${images.length + i + 1}`
        };

        // Обновляем список изображений
        onImagesChange([...images, newImage]);

        toast({
          title: 'Изображение загружено',
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
        toast({
          title: 'Ошибка при загрузке изображения',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    }

    // Очищаем input для возможности повторной загрузки того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Обработчик удаления изображения
  const handleDeleteImage = (imageId: string) => {
    const newImages = images.filter(img => img.id !== imageId);

    // Если удалили основное изображение, делаем основным первое из оставшихся
    if (newImages.length > 0 && !newImages.some(img => img.isMain)) {
      newImages[0].isMain = true;
    }

    onImagesChange(newImages);

    toast({
      title: 'Изображение удалено',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  // Обработчик установки основного изображения
  const handleSetMainImage = (imageId: string) => {
    const newImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));

    onImagesChange(newImages);

    toast({
      title: 'Основное изображение установлено',
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  };

  // Обработчик открытия модального окна поиска изображений
  const handleSearchImages = () => {
    setIsSearchModalOpen(true);
  };

  // Обработчик выбора изображения из модального окна
  const handleSelectImage = async (imageUrl: string, source: ImageSource = ImageSource.GOOGLE, title?: string) => {
    setIsSearching(true);

    try {
      let finalImageUrl = imageUrl;
      let imageId = `img-${product.id}-search-${Date.now()}`;

      // Пытаемся загрузить в Cloudinary, если настроено
      if (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
        const result = await cloudinary.uploadFromUrl(imageUrl, `products/${product.id}`);

        if (result) {
          finalImageUrl = result.url;
          imageId = `cloudinary-${result.publicId}`;
        }
      }

      // Создаем новое изображение
      const newImage: ProductImage = {
        id: imageId,
        url: finalImageUrl,
        isMain: images.length === 0, // Первое изображение становится основным
        sortOrder: images.length,
        source,
        title: title || `Изображение товара (${source})`
      };

      // Обновляем список изображений
      onImagesChange([...images, newImage]);

      toast({
        title: 'Изображение добавлено',
        description: `Источник: ${source}`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Ошибка при добавлении изображения:', error);
      toast({
        title: 'Ошибка при добавлении изображения',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Заголовок и кнопки */}
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold">Изображения товара ({images.length}/{maxImages})</Text>
          <HStack>
            <Tooltip label="Найти изображения в интернете">
              <Button
                leftIcon={<SearchIcon />}
                size="sm"
                isLoading={isSearching}
                onClick={handleSearchImages}
                isDisabled={images.length >= maxImages}
              >
                Найти
              </Button>
            </Tooltip>
            <Tooltip label="Загрузить изображение">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                onClick={handleAddClick}
                isDisabled={images.length >= maxImages}
              >
                Загрузить
              </Button>
            </Tooltip>
          </HStack>
        </Flex>

        {/* Прогресс загрузки */}
        {cloudinary.isUploading && (
          <Progress value={cloudinary.progress} size="sm" colorScheme="blue" />
        )}

        {/* Сетка изображений */}
        {images.length > 0 ? (
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
            {images.map(image => (
              <Box
                key={image.id}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
                position="relative"
              >
                <Image
                  src={image.url}
                  alt="Изображение товара"
                  objectFit="cover"
                  width="100%"
                  height="120px"
                  fallbackSrc="/images/placeholders/default.svg"
                />

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

                <Flex
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  bg="blackAlpha.600"
                  p={1}
                  justify="space-between"
                >
                  <Tooltip label="Сделать основным">
                    <IconButton
                      icon={<StarIcon color={image.isMain ? 'yellow.400' : 'gray.300'} />}
                      size="xs"
                      variant="ghost"
                      aria-label="Сделать основным"
                      onClick={() => handleSetMainImage(image.id)}
                      isDisabled={image.isMain}
                    />
                  </Tooltip>

                  <Tooltip label="Удалить">
                    <IconButton
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Удалить"
                      onClick={() => handleDeleteImage(image.id)}
                    />
                  </Tooltip>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            bg={bgColor}
            borderWidth="1px"
            borderStyle="dashed"
            borderColor={borderColor}
            borderRadius="md"
            p={6}
          >
            <Text color="gray.500" mb={4}>
              У товара нет изображений. Загрузите изображения или найдите их в интернете.
            </Text>
            <HStack>
              <Button
                leftIcon={<SearchIcon />}
                size="sm"
                onClick={handleSearchImages}
                isLoading={isSearching}
              >
                Найти
              </Button>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                onClick={handleAddClick}
              >
                Загрузить
              </Button>
            </HStack>
          </Flex>
        )}
      </VStack>

      {/* Скрытый input для загрузки файлов */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      {/* Модальное окно поиска изображений */}
      <ImageSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectImage={handleSelectImage}
        product={product}
      />
    </Box>
  );
};
