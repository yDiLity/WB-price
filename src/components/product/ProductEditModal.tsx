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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import { Product, ProductCategory, ProductStatus, ProductImage } from '../../types/product';
import { ProductImageUploader } from './ProductImageUploader';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => Promise<void>;
}

/**
 * Модальное окно для редактирования товара
 */
export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [images, setImages] = useState<ProductImage[]>([]);
  
  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (product) {
      setFormData({
        ...product
      });
      setImages(product.images || []);
    } else {
      setFormData({
        title: '',
        description: '',
        category: ProductCategory.OTHER,
        status: ProductStatus.INACTIVE,
        price: {
          current: 0,
          old: undefined,
          costPrice: 0
        },
        stock: {
          available: 0,
          reserved: 0
        },
        images: []
      });
      setImages([]);
    }
  }, [product, isOpen]);
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Обработка вложенных полей (например, price.current)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Product],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Обработчик изменения числовых полей
  const handleNumberChange = (name: string, value: number) => {
    // Обработка вложенных полей (например, price.current)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Product],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Обработчик изменения изображений
  const handleImagesChange = (newImages: ProductImage[]) => {
    setImages(newImages);
  };
  
  // Обработчик сохранения товара
  const handleSave = async () => {
    if (!formData.title) {
      toast({
        title: 'Ошибка',
        description: 'Название товара обязательно для заполнения',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Объединяем данные формы и изображения
      const updatedProduct = {
        ...product,
        ...formData,
        images
      } as Product;
      
      await onSave(updatedProduct);
      
      toast({
        title: 'Товар сохранен',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      toast({
        title: 'Ошибка при сохранении товара',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {product ? `Редактирование товара: ${product.title}` : 'Создание нового товара'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Основная информация</Tab>
              <Tab>Изображения</Tab>
              <Tab>Цены и наличие</Tab>
            </TabList>
            
            <TabPanels>
              {/* Вкладка с основной информацией */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Название товара</FormLabel>
                    <Input
                      name="title"
                      value={formData.title || ''}
                      onChange={handleChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Описание</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={5}
                    />
                  </FormControl>
                  
                  <HStack>
                    <FormControl>
                      <FormLabel>Категория</FormLabel>
                      <Select
                        name="category"
                        value={formData.category || ProductCategory.OTHER}
                        onChange={handleChange}
                      >
                        {Object.values(ProductCategory).map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Статус</FormLabel>
                      <Select
                        name="status"
                        value={formData.status || ProductStatus.INACTIVE}
                        onChange={handleChange}
                      >
                        {Object.values(ProductStatus).map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel>Артикул (SKU)</FormLabel>
                    <Input
                      name="sku"
                      value={formData.sku || ''}
                      onChange={handleChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Бренд</FormLabel>
                    <Input
                      name="brand"
                      value={formData.brand || ''}
                      onChange={handleChange}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Вкладка с изображениями */}
              <TabPanel>
                <ProductImageUploader
                  product={product as Product}
                  images={images}
                  onImagesChange={handleImagesChange}
                />
              </TabPanel>
              
              {/* Вкладка с ценами и наличием */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Текущая цена</FormLabel>
                    <NumberInput
                      min={0}
                      value={formData.price?.current || 0}
                      onChange={(_, value) => handleNumberChange('price.current', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Старая цена (для скидки)</FormLabel>
                    <NumberInput
                      min={0}
                      value={formData.price?.old || 0}
                      onChange={(_, value) => handleNumberChange('price.old', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Себестоимость</FormLabel>
                    <NumberInput
                      min={0}
                      value={formData.price?.costPrice || 0}
                      onChange={(_, value) => handleNumberChange('price.costPrice', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Количество в наличии</FormLabel>
                    <NumberInput
                      min={0}
                      value={formData.stock?.available || 0}
                      onChange={(_, value) => handleNumberChange('stock.available', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isLoading}
          >
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
