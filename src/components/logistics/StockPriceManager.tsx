import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  HStack,
  Icon,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  VStack,
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaSync, 
  FaBoxOpen, 
  FaExclamationTriangle, 
  FaArrowUp, 
  FaArrowDown, 
  FaEquals,
  FaInfoCircle,
  FaEdit,
  FaCheck,
  FaTimes,
  FaFilter,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import logisticsService from '../../services/logisticsService';
import { StockData, OptimizePriceResult } from '../../types/logistics';

// Моковые данные о товарах
const mockProducts = [
  { id: '123456', name: 'Смартфон Samsung Galaxy A53', category: 'Электроника', price: 29990, stock: 15 },
  { id: '789012', name: 'Наушники Apple AirPods Pro', category: 'Аксессуары', price: 19990, stock: 8 },
  { id: '345678', name: 'Ноутбук ASUS VivoBook', category: 'Компьютеры', price: 59990, stock: 3 },
  { id: '901234', name: 'Умные часы Xiaomi Mi Band 7', category: 'Гаджеты', price: 3990, stock: 25 },
  { id: '567890', name: 'Планшет Lenovo Tab M10', category: 'Электроника', price: 15990, stock: 12 },
];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface OptimizedProduct extends Product {
  optimizedPrice?: number;
  priceChange?: number;
  recommendation?: string;
  nextDeliveryDate?: string | null;
  isOptimizing?: boolean;
  isOptimized?: boolean;
}

const StockPriceManager: React.FC = () => {
  const [products, setProducts] = useState<OptimizedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<OptimizedProduct | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setProducts(mockProducts);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Фильтрация и сортировка товаров
  const filteredProducts = products
    .filter(product => {
      // Поиск по названию
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.id.includes(searchTerm);
      
      // Фильтр по категории
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      // Фильтр по остаткам
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.stock <= 10 && product.stock > 0;
      } else if (stockFilter === 'out') {
        matchesStock = product.stock === 0;
      } else if (stockFilter === 'normal') {
        matchesStock = product.stock > 10;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      // Сортировка
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'price') {
        return sortDirection === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else if (sortField === 'stock') {
        return sortDirection === 'asc' 
          ? a.stock - b.stock 
          : b.stock - a.stock;
      }
      return 0;
    });
  
  // Получение уникальных категорий для фильтра
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Оптимизация цены товара
  const optimizePrice = async (product: OptimizedProduct) => {
    try {
      // Обновляем состояние товара
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, isOptimizing: true } 
            : p
        )
      );
      
      // Запрос к API для оптимизации цены
      const result = await logisticsService.optimizePrice({
        productId: product.id,
        currentPrice: product.price,
        stock: product.stock
      });
      
      // Обновляем товар с оптимизированной ценой
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { 
                ...p, 
                isOptimizing: false,
                isOptimized: true,
                optimizedPrice: result.optimizedPrice,
                priceChange: result.priceChange,
                recommendation: result.recommendation,
                nextDeliveryDate: result.nextDeliveryDate
              } 
            : p
        )
      );
      
      toast({
        title: 'Цена оптимизирована',
        description: `Рекомендуемая цена для товара "${product.name}": ${result.optimizedPrice} ₽`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error optimizing price:', error);
      
      // Сбрасываем состояние оптимизации
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, isOptimizing: false } 
            : p
        )
      );
      
      toast({
        title: 'Ошибка',
        description: 'Не удалось оптимизировать цену товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Оптимизация цен всех товаров
  const optimizeAllPrices = async () => {
    toast({
      title: 'Оптимизация цен',
      description: 'Запущена оптимизация цен для всех товаров',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Оптимизируем цены последовательно
    for (const product of filteredProducts) {
      await optimizePrice(product);
    }
  };
  
  // Открытие модального окна с деталями товара
  const openProductDetails = (product: OptimizedProduct) => {
    setSelectedProduct(product);
    onOpen();
  };
  
  // Применение оптимизированной цены
  const applyOptimizedPrice = (product: OptimizedProduct) => {
    if (!product.optimizedPrice) return;
    
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id 
          ? { ...p, price: product.optimizedPrice, isOptimized: false, optimizedPrice: undefined } 
          : p
      )
    );
    
    toast({
      title: 'Цена обновлена',
      description: `Цена товара "${product.name}" обновлена до ${product.optimizedPrice} ₽`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Отклонение оптимизированной цены
  const rejectOptimizedPrice = (product: OptimizedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id 
          ? { ...p, isOptimized: false, optimizedPrice: undefined } 
          : p
      )
    );
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Управление остатками и ценами</Heading>
        <HStack>
          <Button 
            leftIcon={<FaSync />} 
            colorScheme="blue" 
            variant="outline"
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            Обновить
          </Button>
          <Button 
            leftIcon={<FaArrowUp />} 
            colorScheme="green"
            onClick={optimizeAllPrices}
            isDisabled={isLoading || filteredProducts.length === 0}
          >
            Оптимизировать все цены
          </Button>
        </HStack>
      </Flex>
      
      {/* Фильтры и поиск */}
      <Flex 
        mb={6} 
        direction={{ base: 'column', md: 'row' }} 
        gap={4}
        p={4}
        bg={bgColor}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Поиск по названию или ID" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW={{ base: '100%', md: '200px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Все категории</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </Select>
        
        <Select 
          maxW={{ base: '100%', md: '200px' }}
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="all">Все остатки</option>
          <option value="normal">Нормальный запас (&gt;10)</option>
          <option value="low">Низкий запас (≤10)</option>
          <option value="out">Нет в наличии</option>
        </Select>
        
        <Select 
          maxW={{ base: '100%', md: '200px' }}
          value={`${sortField}-${sortDirection}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            setSortField(field);
            setSortDirection(direction as 'asc' | 'desc');
          }}
        >
          <option value="name-asc">По названию (А-Я)</option>
          <option value="name-desc">По названию (Я-А)</option>
          <option value="price-asc">По цене (возр.)</option>
          <option value="price-desc">По цене (убыв.)</option>
          <option value="stock-asc">По остаткам (возр.)</option>
          <option value="stock-desc">По остаткам (убыв.)</option>
        </Select>
      </Flex>
      
      {/* Таблица товаров */}
      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4}>Загрузка данных о товарах...</Text>
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Товары не найдены</AlertTitle>
          <AlertDescription>Измените параметры поиска или фильтрации</AlertDescription>
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" bg={bgColor} borderRadius="md">
            <Thead>
              <Tr>
                <Th>Название товара</Th>
                <Th>Категория</Th>
                <Th isNumeric>Текущая цена</Th>
                <Th isNumeric>Остаток</Th>
                <Th isNumeric>Оптимизированная цена</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.map((product) => (
                <Tr 
                  key={product.id}
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onClick={() => openProductDetails(product)}
                >
                  <Td>
                    <Text fontWeight="medium">{product.name}</Text>
                    <Text fontSize="xs" color="gray.500">ID: {product.id}</Text>
                  </Td>
                  <Td>{product.category}</Td>
                  <Td isNumeric>{product.price.toLocaleString()} ₽</Td>
                  <Td isNumeric>
                    <HStack justify="flex-end">
                      <Text>{product.stock}</Text>
                      {product.stock <= 3 ? (
                        <Badge colorScheme="red">Критический</Badge>
                      ) : product.stock <= 10 ? (
                        <Badge colorScheme="orange">Низкий</Badge>
                      ) : (
                        <Badge colorScheme="green">Нормальный</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    {product.isOptimizing ? (
                      <Spinner size="sm" />
                    ) : product.isOptimized && product.optimizedPrice ? (
                      <HStack justify="flex-end">
                        <Text fontWeight="bold">{product.optimizedPrice.toLocaleString()} ₽</Text>
                        {product.priceChange && product.priceChange > 0 ? (
                          <Badge colorScheme="green">+{product.priceChange}%</Badge>
                        ) : product.priceChange && product.priceChange < 0 ? (
                          <Badge colorScheme="red">{product.priceChange}%</Badge>
                        ) : (
                          <Badge colorScheme="gray">0%</Badge>
                        )}
                      </HStack>
                    ) : (
                      <Text color="gray.500">—</Text>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
                      {product.isOptimized && product.optimizedPrice ? (
                        <>
                          <Tooltip label="Применить оптимизированную цену">
                            <Button 
                              size="sm" 
                              colorScheme="green" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                applyOptimizedPrice(product);
                              }}
                            >
                              <Icon as={FaCheck} />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Отклонить оптимизированную цену">
                            <Button 
                              size="sm" 
                              colorScheme="red" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectOptimizedPrice(product);
                              }}
                            >
                              <Icon as={FaTimes} />
                            </Button>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip label="Оптимизировать цену">
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            variant="ghost"
                            isLoading={product.isOptimizing}
                            onClick={(e) => {
                              e.stopPropagation();
                              optimizePrice(product);
                            }}
                          >
                            <Icon as={FaArrowUp} />
                          </Button>
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Модальное окно с деталями товара */}
      {selectedProduct && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Детали товара</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="md">{selectedProduct.name}</Heading>
                  <Text color="gray.500">ID: {selectedProduct.id}</Text>
                </Box>
                
                <Divider />
                
                <Flex justify="space-between">
                  <Stat>
                    <StatLabel>Текущая цена</StatLabel>
                    <StatNumber>{selectedProduct.price.toLocaleString()} ₽</StatNumber>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Остаток</StatLabel>
                    <StatNumber>{selectedProduct.stock}</StatNumber>
                    <StatHelpText>
                      {selectedProduct.stock <= 3 ? (
                        <Badge colorScheme="red">Критический</Badge>
                      ) : selectedProduct.stock <= 10 ? (
                        <Badge colorScheme="orange">Низкий</Badge>
                      ) : (
                        <Badge colorScheme="green">Нормальный</Badge>
                      )}
                    </StatHelpText>
                  </Stat>
                  
                  {selectedProduct.nextDeliveryDate && (
                    <Stat>
                      <StatLabel>Следующая поставка</StatLabel>
                      <StatNumber>
                        {new Date(selectedProduct.nextDeliveryDate).toLocaleDateString()}
                      </StatNumber>
                    </Stat>
                  )}
                </Flex>
                
                {selectedProduct.isOptimized && selectedProduct.optimizedPrice && (
                  <>
                    <Divider />
                    
                    <Box p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                      <Heading size="sm" mb={2}>Рекомендация по оптимизации цены</Heading>
                      <Text mb={4}>{selectedProduct.recommendation}</Text>
                      
                      <Flex justify="space-between" align="center">
                        <Stat>
                          <StatLabel>Оптимизированная цена</StatLabel>
                          <StatNumber>{selectedProduct.optimizedPrice.toLocaleString()} ₽</StatNumber>
                          <StatHelpText>
                            {selectedProduct.priceChange && selectedProduct.priceChange > 0 ? (
                              <><StatArrow type="increase" /> +{selectedProduct.priceChange}%</>
                            ) : selectedProduct.priceChange && selectedProduct.priceChange < 0 ? (
                              <><StatArrow type="decrease" /> {selectedProduct.priceChange}%</>
                            ) : (
                              <><StatArrow type="decrease" /> 0%</>
                            )}
                          </StatHelpText>
                        </Stat>
                        
                        <HStack>
                          <Button 
                            colorScheme="green" 
                            onClick={() => {
                              applyOptimizedPrice(selectedProduct);
                              onClose();
                            }}
                          >
                            Применить
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              rejectOptimizedPrice(selectedProduct);
                              onClose();
                            }}
                          >
                            Отклонить
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                  </>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Закрыть
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default StockPriceManager;
