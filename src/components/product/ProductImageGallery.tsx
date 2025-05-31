import React, { useState } from 'react';
import {
  Box,
  Image,
  Flex,
  IconButton,
  useColorModeValue,
  AspectRatio,
  HStack,
  VStack,
  Text
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { ProductImage } from '../../types/product';

interface ProductImageGalleryProps {
  images: ProductImage[];
  size?: 'sm' | 'md' | 'lg';
  showThumbnails?: boolean;
}

/**
 * Компонент для отображения галереи изображений товара
 */
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  size = 'md',
  showThumbnails = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBg = useColorModeValue('white', 'gray.700');
  
  // Размеры галереи в зависимости от параметра size
  const gallerySize = {
    sm: { width: '100%', height: '200px' },
    md: { width: '100%', height: '300px' },
    lg: { width: '100%', height: '400px' }
  }[size];
  
  // Размеры миниатюр
  const thumbnailSize = {
    sm: { width: '40px', height: '40px' },
    md: { width: '60px', height: '60px' },
    lg: { width: '80px', height: '80px' }
  }[size];
  
  // Если нет изображений, показываем заглушку
  if (!images || images.length === 0) {
    return (
      <Box
        width={gallerySize.width}
        height={gallerySize.height}
        bg="gray.100"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">Нет изображений</Text>
      </Box>
    );
  }
  
  // Текущее изображение
  const currentImage = images[currentIndex];
  
  // Обработчик перехода к предыдущему изображению
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  // Обработчик перехода к следующему изображению
  const handleNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Обработчик выбора изображения по миниатюре
  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };
  
  return (
    <VStack spacing={4} align="stretch">
      {/* Основное изображение */}
      <Box
        position="relative"
        width={gallerySize.width}
        height={gallerySize.height}
        bg={bgColor}
        borderRadius="md"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <AspectRatio ratio={1} width="100%" height="100%">
          <Image
            src={currentImage.url}
            alt="Изображение товара"
            objectFit="contain"
            width="100%"
            height="100%"
            fallbackSrc="/images/placeholders/default.svg"
          />
        </AspectRatio>
        
        {/* Кнопки навигации */}
        {images.length > 1 && (
          <>
            <IconButton
              icon={<ChevronLeftIcon boxSize={6} />}
              aria-label="Предыдущее изображение"
              position="absolute"
              left="10px"
              top="50%"
              transform="translateY(-50%)"
              borderRadius="full"
              bg={buttonBg}
              opacity={0.8}
              _hover={{ opacity: 1 }}
              onClick={handlePrev}
            />
            
            <IconButton
              icon={<ChevronRightIcon boxSize={6} />}
              aria-label="Следующее изображение"
              position="absolute"
              right="10px"
              top="50%"
              transform="translateY(-50%)"
              borderRadius="full"
              bg={buttonBg}
              opacity={0.8}
              _hover={{ opacity: 1 }}
              onClick={handleNext}
            />
          </>
        )}
        
        {/* Индикатор количества изображений */}
        {images.length > 1 && (
          <Box
            position="absolute"
            bottom="10px"
            right="10px"
            bg="blackAlpha.600"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="sm"
          >
            {currentIndex + 1} / {images.length}
          </Box>
        )}
      </Box>
      
      {/* Миниатюры */}
      {showThumbnails && images.length > 1 && (
        <HStack spacing={2} justify="center" wrap="wrap">
          {images.map((image, index) => (
            <Box
              key={image.id}
              width={thumbnailSize.width}
              height={thumbnailSize.height}
              borderWidth="2px"
              borderColor={index === currentIndex ? 'blue.500' : borderColor}
              borderRadius="md"
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleThumbnailClick(index)}
              opacity={index === currentIndex ? 1 : 0.7}
              transition="all 0.2s"
              _hover={{ opacity: 1 }}
            >
              <Image
                src={image.url}
                alt={`Миниатюра ${index + 1}`}
                objectFit="cover"
                width="100%"
                height="100%"
                fallbackSrc="/images/placeholders/default.svg"
              />
            </Box>
          ))}
        </HStack>
      )}
    </VStack>
  );
};
