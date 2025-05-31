import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Collapse,
  Divider
} from '@chakra-ui/react';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { ozonCategories, getAllCategories, getCategoryPath } from '../data/categories';

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  showSearch?: boolean;
}

export default function CategorySelector({
  selectedCategories = [],
  onChange,
  maxSelections = 5,
  placeholder = 'Выберите категории',
  showSearch = true
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Цвета
  const menuBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const tagBg = useColorModeValue('blue.50', 'blue.800');
  
  // Получаем плоский список всех категорий для поиска
  const allCategories = getAllCategories();
  
  // Фильтрация категорий по поисковому запросу
  const filteredCategories = searchTerm
    ? allCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Обработчик выбора категории
  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Если категория уже выбрана, удаляем её
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else if (selectedCategories.length < maxSelections) {
      // Если лимит не превышен, добавляем категорию
      onChange([...selectedCategories, categoryId]);
    }
  };
  
  // Обработчик удаления категории
  const handleRemoveCategory = (categoryId: string) => {
    onChange(selectedCategories.filter(id => id !== categoryId));
  };
  
  // Обработчик переключения раскрытия категории
  const handleToggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  // Получаем имена выбранных категорий
  const getSelectedCategoryNames = () => {
    return selectedCategories.map(id => {
      const category = allCategories.find(c => c.id === id);
      return category ? category.name : id;
    });
  };
  
  // Проверяем, выбрана ли категория
  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };
  
  // Проверяем, раскрыта ли категория
  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories.includes(categoryId);
  };
  
  return (
    <Box>
      <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} closeOnSelect={false}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          width="100%"
          textAlign="left"
          variant="outline"
        >
          {selectedCategories.length > 0 
            ? `Выбрано: ${selectedCategories.length}`
            : placeholder
          }
        </MenuButton>
        
        <MenuList maxH="350px" overflowY="auto" minW="300px" bg={menuBg}>
          {showSearch && (
            <Box px={3} py={2}>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Поиск категорий..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="md"
                />
              </InputGroup>
            </Box>
          )}
          
          <MenuDivider />
          
          {searchTerm ? (
            // Результаты поиска
            <Box>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <MenuItem
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id)}
                    bg={isCategorySelected(category.id) ? selectedBg : undefined}
                    _hover={{ bg: hoverBg }}
                  >
                    <Flex justify="space-between" width="100%">
                      <Text>{category.name}</Text>
                      {isCategorySelected(category.id) && (
                        <Text color="blue.500" fontWeight="bold">✓</Text>
                      )}
                    </Flex>
                  </MenuItem>
                ))
              ) : (
                <Box px={3} py={2} textAlign="center" color="gray.500">
                  Ничего не найдено
                </Box>
              )}
            </Box>
          ) : (
            // Обычное отображение категорий
            <Box>
              {ozonCategories.map(category => (
                <Box key={category.id}>
                  <MenuItem
                    onClick={() => handleToggleCategory(category.id)}
                    fontWeight="medium"
                  >
                    <Flex justify="space-between" width="100%">
                      <Text>{category.name}</Text>
                      <Text>{isCategoryExpanded(category.id) ? '▲' : '▼'}</Text>
                    </Flex>
                  </MenuItem>
                  
                  <Collapse in={isCategoryExpanded(category.id)}>
                    <Box pl={4} pr={2} pb={2}>
                      {category.subcategories?.map(subcategory => (
                        <MenuItem
                          key={subcategory.id}
                          onClick={() => handleSelectCategory(subcategory.id)}
                          bg={isCategorySelected(subcategory.id) ? selectedBg : undefined}
                          _hover={{ bg: hoverBg }}
                          size="sm"
                        >
                          <Flex justify="space-between" width="100%">
                            <Text fontSize="sm">{subcategory.name}</Text>
                            {isCategorySelected(subcategory.id) && (
                              <Text color="blue.500" fontWeight="bold">✓</Text>
                            )}
                          </Flex>
                        </MenuItem>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </Box>
          )}
        </MenuList>
      </Menu>
      
      {selectedCategories.length > 0 && (
        <Flex wrap="wrap" mt={2} gap={2}>
          {selectedCategories.map(categoryId => {
            const category = allCategories.find(c => c.id === categoryId);
            return (
              <Tag
                key={categoryId}
                size="md"
                borderRadius="full"
                variant="solid"
                bg={tagBg}
                color="blue.600"
              >
                <TagLabel>{category?.name || categoryId}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveCategory(categoryId)} />
              </Tag>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
