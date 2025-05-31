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
  InputLeftElement,
  VStack,
  Box,
  Text,
  Flex,
  Image,
  Badge,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useProductsNew } from '../../context/ProductContextNew';
import { Product, ProductCategory, ProductStatus } from '../../types/product';

interface ProductSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

/**
 * Модальное окно для выбора товара
 */
const ProductSelectModal: React.FC<ProductSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  // Состояния
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Контекст товаров
  const { products, isLoading, loadProducts } = useProductsNew();
  
  // Цвета
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Загрузка товаров при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, loadProducts]);
  
  // Фильтрация товаров при изменении поискового запроса
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);
  
  // Обработчик выбора товара
  const handleSelect = () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        onSelect(product);
      }
    }
  };
  
  // Получение статуса товара в виде бейджа
  const getStatusBadge = (status: ProductStatus) => {
    const statusColors: Record<ProductStatus, string> = {
      active: 'green',
      inactive: 'red',
      archived: 'gray',
      pending: 'yellow',
      draft: 'blue'
    };
    
    const statusLabels: Record<ProductStatus, string> = {
      active: 'Активен',
      inactive: 'Неактивен',
      archived: 'В архиве',
      pending: 'Ожидает',
      draft: 'Черновик'
    };
    
    return (
      <Badge colorScheme={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Выбор товара</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Поиск товара по названию, бренду или SKU"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            {isLoading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : filteredProducts.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <Text>Товары не найдены. Попробуйте изменить поисковый запрос.</Text>
              </Alert>
            ) : (
              <RadioGroup value={selectedProductId || ''} onChange={setSelectedProductId}>
                <Stack spacing={3}>
                  {filteredProducts.map(product => (
                    <Box
                      key={product.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={selectedProductId === product.id ? 'blue.500' : borderColor}
                      bg={selectedProductId === product.id ? 'blue.50' : bgColor}
                      _hover={{ bg: hoverBgColor }}
                      cursor="pointer"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <Flex gap={3}>
                        <Radio value={product.id} isChecked={selectedProductId === product.id} />
                        
                        <Box flexGrow={1}>
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontWeight="bold" noOfLines={1}>
                              {product.title}
                            </Text>
                            {getStatusBadge(product.status)}
                          </Flex>
                          
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color="gray.500">
                              {product.brand || 'Бренд не указан'} • SKU: {product.sku || 'Не указан'}
                            </Text>
                            <Text fontWeight="bold">
                              {product.price.current.toLocaleString()} ₽
                            </Text>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSelect}
            isDisabled={!selectedProductId}
          >
            Выбрать
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductSelectModal;
