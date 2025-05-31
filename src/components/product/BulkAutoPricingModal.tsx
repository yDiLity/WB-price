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
  VStack,
  HStack,
  Box,
  Text,
  Flex,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
  Icon,
  Tooltip,
  Progress
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon, WarningIcon, AddIcon } from '@chakra-ui/icons';
import { FaPercentage, FaRubleSign, FaFilter, FaSort, FaCheck } from 'react-icons/fa';
import { Product } from '../../types';

interface AutoPricingRule {
  id: string;
  name: string;
  isActive: boolean;
  condition: {
    type: 'below_competitor' | 'above_competitor' | 'price_change' | 'time_based';
    value: number;
    unit?: 'percent' | 'absolute';
    timeInterval?: number; // в часах
  };
  action: {
    type: 'adjust_price' | 'set_price' | 'notify';
    value: number;
    unit: 'percent' | 'absolute';
    minPrice?: number;
    maxPrice?: number;
  };
}

interface BulkAutoPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onApplyRules: (productIds: string[], rule: AutoPricingRule) => Promise<void>;
}

/**
 * Модальное окно для массового применения правил автоматического изменения цен
 */
const BulkAutoPricingModal: React.FC<BulkAutoPricingModalProps> = ({
  isOpen,
  onClose,
  products,
  onApplyRules
}) => {
  // Состояние для выбранных товаров
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  // Состояние для правила
  const [rule, setRule] = useState<Omit<AutoPricingRule, 'id'>>({
    name: 'Массовое правило',
    isActive: true,
    condition: {
      type: 'below_competitor',
      value: 5,
      unit: 'percent'
    },
    action: {
      type: 'adjust_price',
      value: 3,
      unit: 'percent',
      minPrice: 0,
      maxPrice: 0
    }
  });
  
  // Состояние для фильтрации товаров
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  // Состояние для применения правил
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Toast для уведомлений
  const toast = useToast();
  
  // Сброс выбранных товаров при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setSelectedProductIds([]);
      setSelectAll(false);
      setSearchTerm('');
      setCategoryFilter('');
      setProgress(0);
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
  
  // Получение уникальных категорий
  const getUniqueCategories = (): string[] => {
    const categories = new Set<string>();
    products.forEach(product => {
      categories.add(product.category);
    });
    return Array.from(categories).sort();
  };
  
  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Обработчик выбора/отмены выбора всех товаров
  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(product => product.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Обработчик выбора/отмены выбора товара
  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  
  // Обработчик применения правил
  const handleApplyRules = async () => {
    if (selectedProductIds.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы один товар',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Создаем правило с ID
    const ruleWithId: AutoPricingRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    
    setIsApplying(true);
    
    try {
      // Имитация прогресса
      const totalSteps = selectedProductIds.length;
      let currentStep = 0;
      
      const updateProgress = () => {
        currentStep++;
        setProgress(Math.round((currentStep / totalSteps) * 100));
      };
      
      // Применяем правила к выбранным товарам
      await onApplyRules(selectedProductIds, ruleWithId);
      
      // Имитация задержки для отображения прогресса
      for (let i = 0; i < totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateProgress();
      }
      
      toast({
        title: 'Правила применены',
        description: `Правила автоматического изменения цен применены к ${selectedProductIds.length} товарам`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('Ошибка при применении правил:', error);
      
      toast({
        title: 'Ошибка',
        description: 'Не удалось применить правила автоматического изменения цен',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsApplying(false);
      setProgress(0);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Массовое применение правил автоматического изменения цен</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Настройка правила */}
            <Box
              p={4}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              bg={headerBg}
            >
              <Heading size="sm" mb={3}>Настройка правила</Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Название правила</FormLabel>
                  <Input
                    value={rule.name}
                    onChange={(e) => setRule({ ...rule, name: e.target.value })}
                    placeholder="Например: Массовое снижение цены при конкуренции"
                  />
                </FormControl>
                
                <Divider />
                
                <Heading size="xs">Условие</Heading>
                
                <HStack>
                  <FormControl>
                    <FormLabel>Тип условия</FormLabel>
                    <Select
                      value={rule.condition.type}
                      onChange={(e) => setRule({
                        ...rule,
                        condition: {
                          ...rule.condition,
                          type: e.target.value as any
                        }
                      })}
                    >
                      <option value="below_competitor">Цена конкурента ниже</option>
                      <option value="above_competitor">Цена конкурента выше</option>
                      <option value="price_change">Изменение цены конкурента</option>
                      <option value="time_based">По времени</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Значение</FormLabel>
                    <NumberInput
                      value={rule.condition.value}
                      onChange={(_, value) => setRule({
                        ...rule,
                        condition: {
                          ...rule.condition,
                          value
                        }
                      })}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  {rule.condition.type !== 'time_based' && (
                    <FormControl>
                      <FormLabel>Единица измерения</FormLabel>
                      <Select
                        value={rule.condition.unit}
                        onChange={(e) => setRule({
                          ...rule,
                          condition: {
                            ...rule.condition,
                            unit: e.target.value as any
                          }
                        })}
                      >
                        <option value="percent">Процент</option>
                        <option value="absolute">Рубли</option>
                      </Select>
                    </FormControl>
                  )}
                </HStack>
                
                <Divider />
                
                <Heading size="xs">Действие</Heading>
                
                <HStack>
                  <FormControl>
                    <FormLabel>Тип действия</FormLabel>
                    <Select
                      value={rule.action.type}
                      onChange={(e) => setRule({
                        ...rule,
                        action: {
                          ...rule.action,
                          type: e.target.value as any
                        }
                      })}
                    >
                      <option value="adjust_price">Изменить цену</option>
                      <option value="set_price">Установить цену</option>
                      <option value="notify">Отправить уведомление</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Значение</FormLabel>
                    <NumberInput
                      value={rule.action.value}
                      onChange={(_, value) => setRule({
                        ...rule,
                        action: {
                          ...rule.action,
                          value
                        }
                      })}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Единица измерения</FormLabel>
                    <Select
                      value={rule.action.unit}
                      onChange={(e) => setRule({
                        ...rule,
                        action: {
                          ...rule.action,
                          unit: e.target.value as any
                        }
                      })}
                    >
                      <option value="percent">Процент</option>
                      <option value="absolute">Рубли</option>
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>
            
            {/* Фильтрация товаров */}
            <Box
              p={4}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              bg={headerBg}
            >
              <Heading size="sm" mb={3}>Фильтрация товаров</Heading>
              
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Поиск по названию или SKU</FormLabel>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Введите название или SKU"
                    leftElement={<Icon as={FaFilter} color="gray.500" ml={2} />}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    placeholder="Все категории"
                  >
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
            </Box>
            
            {/* Список товаров */}
            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              overflow="hidden"
            >
              <Flex justify="space-between" align="center" p={3} bg={headerBg}>
                <HStack>
                  <Checkbox
                    isChecked={selectAll}
                    onChange={handleToggleSelectAll}
                    colorScheme="blue"
                  />
                  <Text fontWeight="medium">Выбрать все товары ({filteredProducts.length})</Text>
                </HStack>
                
                <Badge colorScheme="blue">
                  Выбрано: {selectedProductIds.length}
                </Badge>
              </Flex>
              
              {filteredProducts.length === 0 ? (
                <Alert status="info" borderRadius="0">
                  <AlertIcon />
                  <Text>Нет товаров, соответствующих фильтрам</Text>
                </Alert>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th width="50px"></Th>
                      <Th>Название</Th>
                      <Th>Категория</Th>
                      <Th>Цена</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProducts.map(product => (
                      <Tr key={product.id}>
                        <Td>
                          <Checkbox
                            isChecked={selectedProductIds.includes(product.id)}
                            onChange={() => handleToggleSelectProduct(product.id)}
                            colorScheme="blue"
                          />
                        </Td>
                        <Td>
                          <Text fontWeight="medium">{product.title}</Text>
                          <Text fontSize="sm" color={textColor}>SKU: {product.sku}</Text>
                        </Td>
                        <Td>{product.category}</Td>
                        <Td>{formatPrice(product.price.current)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
            
            {/* Прогресс применения правил */}
            {isApplying && (
              <Box>
                <Text mb={2}>Применение правил: {progress}%</Text>
                <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
              </Box>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose} isDisabled={isApplying}>
            Отмена
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleApplyRules}
            isLoading={isApplying}
            isDisabled={selectedProductIds.length === 0}
            leftIcon={<Icon as={FaCheck} />}
          >
            Применить правила к {selectedProductIds.length} товарам
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkAutoPricingModal;
