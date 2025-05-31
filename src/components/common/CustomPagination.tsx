import React from 'react';
import {
  Flex,
  Button,
  ButtonGroup,
  IconButton,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CustomPagination({
  currentPage,
  totalPages,
  onPageChange
}: CustomPaginationProps) {
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  
  // Функция для генерации массива страниц с учетом эллипсиса
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 7) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pageNumbers.push(1);
      
      // Определяем, нужен ли эллипсис в начале
      if (currentPage > 3) {
        pageNumbers.push(-1); // -1 означает эллипсис
      }
      
      // Определяем диапазон страниц вокруг текущей
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Корректируем, если текущая страница близка к началу или концу
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 4);
      }
      
      // Добавляем страницы в диапазоне
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Определяем, нужен ли эллипсис в конце
      if (currentPage < totalPages - 2) {
        pageNumbers.push(-2); // -2 означает эллипсис в конце
      }
      
      // Всегда показываем последнюю страницу
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <Flex justify="center" align="center">
      <ButtonGroup variant="outline" spacing="1">
        <IconButton
          aria-label="Предыдущая страница"
          icon={<ChevronLeftIcon />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          size="sm"
        />
        
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber < 0) {
            // Эллипсис
            return (
              <Box key={`ellipsis-${index}`} px={2} display="flex" alignItems="center">
                ...
              </Box>
            );
          }
          
          return (
            <Button
              key={pageNumber}
              size="sm"
              variant={currentPage === pageNumber ? "solid" : "outline"}
              colorScheme={currentPage === pageNumber ? "blue" : "gray"}
              onClick={() => onPageChange(pageNumber)}
              _hover={{ bg: currentPage !== pageNumber ? hoverBg : undefined }}
            >
              {pageNumber}
            </Button>
          );
        })}
        
        <IconButton
          aria-label="Следующая страница"
          icon={<ChevronRightIcon />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          size="sm"
        />
      </ButtonGroup>
    </Flex>
  );
}
