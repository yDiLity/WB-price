import React, { useState, useEffect } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

interface CompetitorImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
}

/**
 * Компонент для отображения изображения конкурента
 */
export const CompetitorImage: React.FC<CompetitorImageProps> = ({
  src,
  alt,
  width = '40px',
  height = '40px'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Обновляем src при изменении props
  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    console.log('Изображение загружено:', imageSrc);
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('Ошибка загрузки изображения:', imageSrc);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Box position="relative" width={width} height={height}>
      {isLoading && (
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="sm" />
        </Box>
      )}

      {hasError ? (
        <Box
          width="100%"
          height="100%"
          bg="gray.100"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          color="gray.500"
        >
          Нет фото
        </Box>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            display: isLoading ? 'none' : 'block'
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </Box>
  );
};
