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
  Text,
  VStack,
  HStack,
  Box,
  Checkbox,
  Select,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { Product } from '../../types';
import { useOzonProducts } from '../../context/OzonProductContext';
import { strategyService } from '../../services/strategyService';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
}

/**
 * Модальное окно для массового редактирования товаров
 */
const BulkEditModal: React.FC<BulkEditModalProps> = ({ isOpen, onClose, selectedProducts }) => {
  const { updateProduct, applyPricingStrategy } = useOzonProducts();
  const toast = useToast();
  
  // Состояние для выбранных опций
  const [applyStrategy, setApplyStrategy] = useState<boolean>(false);
  const [setMinPrice, setSetMinPrice] = useState<boolean>(false);
  
  // Состояние для значений
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [minPriceValue, setMinPriceValue] = useState<number>(0);
  const [minPriceType, setMinPriceType] = useState<'fixed' | 'percent'>('fixed');
  
  // Состояние для отслеживания прогресса
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Получаем все доступные стратегии
  const strategies = strategyService.getAllStrategies();
  
  // Сбрасываем состояние при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setApplyStrategy(false);
      setSetMinPrice(false);
      setSelectedStrategyId('');
      setMinPriceValue(0);
      setMinPriceType('fixed');
      setProcessedCount(0);
    }
  }, [isOpen]);
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Обработчик применения изменений
  const handleApplyChanges = async () => {
    if (!applyStrategy && !setMinPrice) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одно действие для выполнения',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (applyStrategy && !selectedStrategyId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите стратегию для применения',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessedCount(0);
    
    try {
      // Обрабатываем каждый товар последовательно
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        
        // Применяем стратегию, если выбрано
        if (applyStrategy && selectedStrategyId) {
          await applyPricingStrategy(product.id, selectedStrategyId);
        }
        
        // Устанавливаем минимальную цену, если выбрано
        if (setMinPrice) {
          const updatedProduct = { ...product };
          
          // Вычисляем минимальную цену в зависимости от типа
          if (minPriceType === 'fixed') {
            updatedProduct.price.minThreshold = minPriceValue;
          } else {
            // Процент от текущей цены
            updatedProduct.price.minThreshold = product.price.current * (minPriceValue / 100);
          }
          
          await updateProduct(product.id, updatedProduct);
        }
        
        // Обновляем счетчик обработанных товаров
        setProcessedCount(i + 1);
      }
      
      // Показываем уведомление об успешном выполнении
      toast({
        title: 'Изменения применены',
        description: `Обработано товаров: ${selectedProducts.length}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при массовом редактировании:', error);
      
      toast({
        title: 'Ошибка',
        description: 'Не удалось применить изменения ко всем товарам',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Массовое редактирование товаров</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                Выбрано товаров: <Badge colorScheme="blue">{selectedProducts.length}</Badge>
              </Text>
              
              {selectedProducts.length === 0 ? (
                <Alert status="warning">
                  <AlertIcon />
                  <Text>Не выбрано ни одного товара</Text>
                </Alert>
              ) : (
                <Box 
                  maxH="100px" 
                  overflowY="auto" 
                  p={2} 
                  borderWidth="1px" 
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  {selectedProducts.map(product => (
                    <Text key={product.id} fontSize="sm" noOfLines={1}>
                      {product.title}
                    </Text>
                  ))}
                </Box>
              )}
            </Box>
            
            <Divider />
            
            <Box>
              <Text fontWeight="bold" mb={2}>Выберите действия:</Text>
              
              <VStack align="stretch" spacing={4}>
                <Box 
                  p={3} 
                  borderWidth="1px" 
                  borderColor={applyStrategy ? 'blue.500' : borderColor}
                  borderRadius="md"
                  bg={applyStrategy ? 'blue.50' : bgColor}
                  _dark={{
                    bg: applyStrategy ? 'blue.900' : bgColor
                  }}
                >
                  <HStack mb={2}>
                    <Checkbox 
                      isChecked={applyStrategy} 
                      onChange={(e) => setApplyStrategy(e.target.checked)}
                      colorScheme="blue"
                    />
                    <Text fontWeight="medium">Применить стратегию ценообразования</Text>
                  </HStack>
                  
                  {applyStrategy && (
                    <FormControl>
                      <Select 
                        placeholder="Выберите стратегию" 
                        value={selectedStrategyId}
                        onChange={(e) => setSelectedStrategyId(e.target.value)}
                      >
                        {strategies.map(strategy => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
                
                <Box 
                  p={3} 
                  borderWidth="1px" 
                  borderColor={setMinPrice ? 'blue.500' : borderColor}
                  borderRadius="md"
                  bg={setMinPrice ? 'blue.50' : bgColor}
                  _dark={{
                    bg: setMinPrice ? 'blue.900' : bgColor
                  }}
                >
                  <HStack mb={2}>
                    <Checkbox 
                      isChecked={setMinPrice} 
                      onChange={(e) => setSetMinPrice(e.target.checked)}
                      colorScheme="blue"
                    />
                    <Text fontWeight="medium">Установить минимальную цену</Text>
                  </HStack>
                  
                  {setMinPrice && (
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Тип</FormLabel>
                        <Select 
                          size="sm"
                          value={minPriceType}
                          onChange={(e) => setMinPriceType(e.target.value as 'fixed' | 'percent')}
                        >
                          <option value="fixed">Фиксированная сумма</option>
                          <option value="percent">Процент от цены</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Значение</FormLabel>
                        <NumberInput 
                          size="sm"
                          value={minPriceValue} 
                          onChange={(_, value) => setMinPriceValue(value)}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </HStack>
                  )}
                </Box>
              </VStack>
            </Box>
            
            {isProcessing && (
              <Alert status="info">
                <AlertIcon />
                <Text>Обработано товаров: {processedCount} из {selectedProducts.length}</Text>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isProcessing}>
            Отмена
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleApplyChanges}
            isLoading={isProcessing}
            isDisabled={selectedProducts.length === 0 || (!applyStrategy && !setMinPrice)}
          >
            Применить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkEditModal;
