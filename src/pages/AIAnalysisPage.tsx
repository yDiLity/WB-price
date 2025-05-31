import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Spinner,
  Flex,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Spacer
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import { analysisHistoryService } from '../services/analysisHistoryService';
import { FaHistory, FaChartLine, FaCheck, FaRobot, FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import { AnalysisHistory } from '../types';

// Интерфейсы для данных
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  currentPrice: number;
  costPrice: number;
  rating: number;
  reviewCount: number;
  stock?: number;
}

interface Competitor {
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
}

interface MarketData {
  categoryAvgPrice: number;
  minPrice: number;
  maxPrice: number;
  competitors: Competitor[];
}

interface PriceRecommendation {
  recommendedPrice: number;
  minPrice: number;
  marketAverage?: number;
  explanation: string;
  aiGenerated?: boolean;
}

export default function AIAnalysisPage() {
  const { user } = useAuth();
  const toast = useToast();

  // Модальные окна
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isApplyPriceOpen, onOpen: onApplyPriceOpen, onClose: onApplyPriceClose } = useDisclosure();

  // Состояния
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isFetchingCompetitors, setIsFetchingCompetitors] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isApplyingPrice, setIsApplyingPrice] = useState(false);
  const [product, setProduct] = useState<Product>({
    id: 'product-1',
    name: 'Смартфон Samsung Galaxy S21',
    category: 'Электроника',
    brand: 'Samsung',
    currentPrice: 59990,
    costPrice: 35000,
    rating: 4.7,
    reviewCount: 128
  });
  const [marketData, setMarketData] = useState<MarketData>({
    categoryAvgPrice: 55000,
    minPrice: 45000,
    maxPrice: 75000,
    competitors: [
      { name: 'Конкурент 1', price: 57990, rating: 4.5, reviewCount: 98 },
      { name: 'Конкурент 2', price: 54990, rating: 4.3, reviewCount: 76 },
      { name: 'Конкурент 3', price: 61990, rating: 4.8, reviewCount: 112 }
    ]
  });
  const [targetProfit, setTargetProfit] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [scheduleFrequency, setScheduleFrequency] = useState<string>('daily');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null);

  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Обработчики изменения полей формы
  const handleProductChange = (field: keyof Product, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleMarketDataChange = (field: keyof MarketData, value: any) => {
    setMarketData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompetitorChange = (index: number, field: keyof Competitor, value: any) => {
    setMarketData(prev => {
      const newCompetitors = [...prev.competitors];
      newCompetitors[index] = { ...newCompetitors[index], [field]: value };
      return { ...prev, competitors: newCompetitors };
    });
  };

  const addCompetitor = () => {
    setMarketData(prev => ({
      ...prev,
      competitors: [
        ...prev.competitors,
        { name: `Конкурент ${prev.competitors.length + 1}`, price: 0, rating: 4.0, reviewCount: 0 }
      ]
    }));
  };

  const removeCompetitor = (index: number) => {
    setMarketData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  // Загрузка истории анализа
  const loadAnalysisHistory = () => {
    const history = analysisHistoryService.getProductAnalysisHistory(product.id);
    setAnalysisHistory(history);
  };

  // Анализ товара с помощью ИИ
  const analyzeProduct = async () => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Используем локальный сервис aiService вместо запроса к серверу
      const result = await aiService.analyzeProduct(product, marketData.competitors);

      if (result.success) {
        setAnalysisResult(result.analysis);

        // Сохраняем результат анализа в историю
        if (result.analysis) {
          const historyEntry = analysisHistoryService.addAnalysis(product.id, result);
          if (historyEntry) {
            setAnalysisHistory(prev => [historyEntry, ...prev]);
          }
        }

        toast({
          title: 'Анализ завершен',
          description: 'ИИ успешно проанализировал товар',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: result.message || 'Не удалось выполнить анализ товара',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить анализ товара',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Получение рекомендации по оптимизации цены
  const optimizePrice = async () => {
    setIsLoading(true);
    setRecommendation(null);

    try {
      // Используем локальный сервис aiService вместо запроса к серверу
      const result = await aiService.analyzeProduct(product, marketData.competitors);

      if (result.success && result.analysis) {
        // Парсим результат анализа для получения рекомендуемой цены
        const analysisText = result.analysis;

        // Ищем рекомендуемую цену в тексте анализа
        const recommendedPriceMatch = analysisText.match(/Рекомендуемая оптимальная цена: (\d+)/);
        const minPriceMatch = analysisText.match(/Минимально допустимая цена: (\d+)/);

        const recommendedPrice = recommendedPriceMatch ? parseInt(recommendedPriceMatch[1]) : product.currentPrice;
        const minPrice = minPriceMatch ? parseInt(minPriceMatch[1]) : product.costPrice * 1.2;

        // Создаем объект рекомендации
        const recommendation: PriceRecommendation = {
          recommendedPrice,
          minPrice,
          marketAverage: marketData.categoryAvgPrice,
          explanation: analysisText,
          aiGenerated: true
        };

        setRecommendation(recommendation);

        toast({
          title: 'Оптимизация завершена',
          description: 'Получена рекомендация по оптимальной цене',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: result.message || 'Не удалось получить рекомендацию по цене',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error optimizing price:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить рекомендацию по цене',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Расчет процента изменения цены
  const calculatePriceChange = (newPrice: number, oldPrice: number) => {
    return ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
  };

  // Загрузка списка товаров и истории анализа
  useEffect(() => {
    fetchProductList();
    loadAnalysisHistory();
  }, [product.id]);

  const fetchProductList = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();

      if (data.success) {
        setProductList(data.products);
      } else {
        console.error('Failed to fetch product list:', data.message);
      }
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  };

  // Импорт товара из списка
  const importProduct = async () => {
    if (!selectedProductId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите товар для импорта',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/products/${selectedProductId}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product);
        toast({
          title: 'Товар импортирован',
          description: `Данные о товаре "${data.product.name}" успешно загружены`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось импортировать товар',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error importing product:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось импортировать товар',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Автоматический сбор данных о конкурентах
  const fetchCompetitors = async () => {
    if (!product.name || !product.category) {
      toast({
        title: 'Недостаточно данных',
        description: 'Укажите название и категорию товара',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsFetchingCompetitors(true);

    try {
      const response = await fetch('http://localhost:3000/api/fetch-competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          brand: product.brand
        })
      });

      const data = await response.json();

      if (data.success) {
        setMarketData(prev => ({
          ...prev,
          competitors: data.competitors,
          categoryAvgPrice: data.categoryAvgPrice,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice
        }));

        toast({
          title: 'Данные получены',
          description: `Найдено ${data.competitors.length} конкурентов`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось получить данные о конкурентах',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить данные о конкурентах',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsFetchingCompetitors(false);
    }
  };

  // Планирование регулярного анализа
  const scheduleAnalysis = async () => {
    setIsScheduling(true);

    try {
      const response = await fetch('http://localhost:3000/api/schedule-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          frequency: scheduleFrequency,
          time: scheduleTime,
          userId: user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Анализ запланирован',
          description: `Регулярный анализ товара "${product.name}" настроен (${scheduleFrequency}, ${scheduleTime})`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось запланировать анализ',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error scheduling analysis:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось запланировать анализ',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsScheduling(false);
    }
  };

  // Применение рекомендуемой цены
  const applyRecommendedPrice = async (analysisId?: string) => {
    if (!recommendation && !selectedAnalysis) {
      toast({
        title: 'Нет рекомендации',
        description: 'Сначала получите рекомендацию по цене',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsApplyingPrice(true);

    try {
      // Определяем, какую цену применять
      const priceToApply = selectedAnalysis
        ? selectedAnalysis.recommendedPrice
        : recommendation?.recommendedPrice || 0;

      // Обновляем цену товара
      setProduct(prev => ({
        ...prev,
        currentPrice: priceToApply
      }));

      // Если указан ID анализа, отмечаем его как примененный
      if (analysisId) {
        analysisHistoryService.markAnalysisAsApplied(analysisId);
        loadAnalysisHistory(); // Обновляем историю
      }

      // Закрываем модальное окно, если оно открыто
      onApplyPriceClose();

      toast({
        title: 'Цена обновлена',
        description: `Цена товара изменена на ${priceToApply} ₽`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error applying recommended price:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось применить рекомендуемую цену',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApplyingPrice(false);
    }
  };

  // Выбор анализа из истории
  const selectAnalysisFromHistory = (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis);
    setAnalysisResult(analysis.analysis);
    onHistoryClose();
  };

  // Пакетный анализ нескольких товаров
  const batchAnalyze = async () => {
    if (productList.length === 0) {
      toast({
        title: 'Нет товаров',
        description: 'Список товаров пуст',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Имитируем запуск пакетного анализа
      // В реальном приложении здесь будет запрос к серверу или обработка в фоновом режиме
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Пакетный анализ запущен',
        description: `Анализ ${productList.length} товаров выполняется в фоновом режиме. Результаты будут доступны в разделе "Отчеты"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error batch analyzing products:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось запустить пакетный анализ',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex align="center" mb={6}>
        <Heading as="h1">ИИ-анализ товаров</Heading>
        <Spacer />
        <Button
          as={Link}
          to="/analysis-history"
          leftIcon={<Icon as={FaHistory} />}
          colorScheme="blue"
          variant="outline"
        >
          История анализа
        </Button>
      </Flex>

      {/* Модальное окно истории анализа */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>История анализа товара</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {analysisHistory.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Дата</Th>
                    <Th>Рекомендуемая цена</Th>
                    <Th>Применено</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {analysisHistory.map(item => (
                    <Tr key={item.id}>
                      <Td>{new Date(item.date).toLocaleString()}</Td>
                      <Td>{item.recommendedPrice} ₽</Td>
                      <Td>
                        {item.appliedToProduct ? (
                          <Badge colorScheme="green">Да</Badge>
                        ) : (
                          <Badge colorScheme="gray">Нет</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button size="sm" onClick={() => selectAnalysisFromHistory(item)}>
                            Просмотр
                          </Button>
                          {!item.appliedToProduct && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => {
                                setSelectedAnalysis(item);
                                onHistoryClose();
                                onApplyPriceOpen();
                              }}
                            >
                              Применить
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>Нет данных</AlertTitle>
                <AlertDescription>
                  История анализа для этого товара пуста. Выполните анализ, чтобы сохранить результаты.
                </AlertDescription>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onHistoryClose}>Закрыть</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно применения цены */}
      <Modal isOpen={isApplyPriceOpen} onClose={onApplyPriceClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Применить рекомендуемую цену</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Предварительный просмотр</AlertTitle>
                  <AlertDescription>
                    Вы собираетесь изменить цену товара "{product.name}".
                  </AlertDescription>
                </Box>
              </Alert>

              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontWeight="bold">Текущая цена:</Text>
                  <Text fontSize="xl">{product.currentPrice} ₽</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Новая цена:</Text>
                  <Text fontSize="xl" color="blue.500">
                    {selectedAnalysis ? selectedAnalysis.recommendedPrice : recommendation?.recommendedPrice} ₽
                  </Text>
                </Box>
              </SimpleGrid>

              <Box>
                <Text fontWeight="bold">Изменение:</Text>
                <Text
                  fontSize="lg"
                  color={
                    (selectedAnalysis?.recommendedPrice || recommendation?.recommendedPrice || 0) > product.currentPrice
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {calculatePriceChange(
                    selectedAnalysis?.recommendedPrice || recommendation?.recommendedPrice || 0,
                    product.currentPrice
                  )}%
                </Text>
              </Box>

              <Divider />

              <Text>
                После применения новой цены, она будет сохранена в системе. Вы всегда можете вернуться к предыдущей цене.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onApplyPriceClose}>
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => applyRecommendedPrice(selectedAnalysis?.id)}
              isLoading={isApplyingPrice}
            >
              Применить цену
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue" mb={6}>
        <TabList>
          <Tab>Анализ товара</Tab>
          <Tab>Оптимизация цены</Tab>
          <Tab>Автоматизация</Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка анализа товара */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Форма ввода данных */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Heading size="md">Данные о товаре и конкурентах</Heading>
                </CardHeader>

                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Название товара</FormLabel>
                      <Input
                        value={product.name}
                        onChange={(e) => handleProductChange('name', e.target.value)}
                      />
                    </FormControl>

                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Категория</FormLabel>
                        <Input
                          value={product.category}
                          onChange={(e) => handleProductChange('category', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Бренд</FormLabel>
                        <Input
                          value={product.brand}
                          onChange={(e) => handleProductChange('brand', e.target.value)}
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Текущая цена (₽)</FormLabel>
                        <NumberInput
                          value={product.currentPrice}
                          onChange={(_, value) => handleProductChange('currentPrice', value)}
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
                        <FormLabel>Себестоимость (₽)</FormLabel>
                        <NumberInput
                          value={product.costPrice}
                          onChange={(_, value) => handleProductChange('costPrice', value)}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Рейтинг</FormLabel>
                        <NumberInput
                          value={product.rating}
                          onChange={(_, value) => handleProductChange('rating', value)}
                          min={0}
                          max={5}
                          step={0.1}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Количество отзывов</FormLabel>
                        <NumberInput
                          value={product.reviewCount}
                          onChange={(_, value) => handleProductChange('reviewCount', value)}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <Divider my={2} />

                    <Heading size="sm" mb={2}>Конкуренты</Heading>

                    {marketData.competitors.map((competitor, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                        <SimpleGrid columns={2} spacing={4} mb={2}>
                          <FormControl>
                            <FormLabel>Название</FormLabel>
                            <Input
                              value={competitor.name}
                              onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Цена (₽)</FormLabel>
                            <NumberInput
                              value={competitor.price}
                              onChange={(_, value) => handleCompetitorChange(index, 'price', value)}
                              min={0}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4}>
                          <FormControl>
                            <FormLabel>Рейтинг</FormLabel>
                            <NumberInput
                              value={competitor.rating}
                              onChange={(_, value) => handleCompetitorChange(index, 'rating', value)}
                              min={0}
                              max={5}
                              step={0.1}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Отзывы</FormLabel>
                            <NumberInput
                              value={competitor.reviewCount}
                              onChange={(_, value) => handleCompetitorChange(index, 'reviewCount', value)}
                              min={0}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        </SimpleGrid>

                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          mt={2}
                          onClick={() => removeCompetitor(index)}
                        >
                          Удалить
                        </Button>
                      </Box>
                    ))}

                    <Button
                      colorScheme="blue"
                      variant="ghost"
                      onClick={addCompetitor}
                    >
                      Добавить конкурента
                    </Button>
                  </VStack>
                </CardBody>

                <CardFooter>
                  <Button
                    colorScheme="blue"
                    onClick={analyzeProduct}
                    isLoading={isLoading}
                    loadingText="Анализ..."
                    width="full"
                  >
                    Анализировать с помощью ИИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Результаты анализа */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Результаты ИИ-анализа</Heading>
                    <HStack>
                      <Tooltip label="История анализа">
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FaHistory} />}
                          onClick={onHistoryOpen}
                          variant="outline"
                        >
                          История
                        </Button>
                      </Tooltip>
                      {analysisResult && (
                        <Menu>
                          <MenuButton
                            as={Button}
                            size="sm"
                            rightIcon={<Icon as={FaChevronDown} />}
                            colorScheme="blue"
                          >
                            Действия
                          </MenuButton>
                          <MenuList>
                            <MenuItem
                              icon={<Icon as={FaCheck} />}
                              onClick={onApplyPriceOpen}
                            >
                              Применить рекомендуемую цену
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem icon={<Icon as={FaChartLine} />}>
                              Визуализировать данные
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </HStack>
                  </Flex>
                </CardHeader>

                <CardBody>
                  {isLoading ? (
                    <Flex justify="center" align="center" py={10}>
                      <Spinner size="xl" color="blue.500" />
                    </Flex>
                  ) : analysisResult ? (
                    <Box whiteSpace="pre-wrap">
                      {selectedAnalysis && (
                        <Alert status="info" mb={4}>
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Просмотр из истории</AlertTitle>
                            <AlertDescription>
                              Вы просматриваете результаты анализа от {new Date(selectedAnalysis.date).toLocaleString()}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      {analysisResult}
                    </Box>
                  ) : (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Нет данных</AlertTitle>
                        <AlertDescription>
                          Заполните данные о товаре и конкурентах, затем нажмите кнопку "Анализировать с помощью ИИ".
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Вкладка оптимизации цены */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Форма оптимизации цены */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Heading size="md">Оптимизация цены</Heading>
                </CardHeader>

                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Как это работает</AlertTitle>
                        <AlertDescription>
                          ИИ анализирует данные о товаре, конкурентах и рынке, чтобы предложить оптимальную цену для максимизации прибыли.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl>
                      <FormLabel>Целевая прибыль (%)</FormLabel>
                      <NumberInput
                        value={targetProfit || ''}
                        onChange={(_, value) => setTargetProfit(value)}
                        min={0}
                        max={100}
                      >
                        <NumberInputField placeholder="Оставьте пустым для максимизации прибыли" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </CardBody>

                <CardFooter>
                  <Button
                    colorScheme="blue"
                    onClick={optimizePrice}
                    isLoading={isLoading}
                    loadingText="Оптимизация..."
                    width="full"
                  >
                    Получить рекомендацию по цене
                  </Button>
                </CardFooter>
              </Card>

              {/* Результаты оптимизации */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Рекомендация по цене</Heading>
                    {recommendation && (
                      <Button
                        size="sm"
                        colorScheme="green"
                        leftIcon={<Icon as={FaCheck} />}
                        onClick={onApplyPriceOpen}
                      >
                        Применить цену
                      </Button>
                    )}
                  </Flex>
                </CardHeader>

                <CardBody>
                  {isLoading ? (
                    <Flex justify="center" align="center" py={10}>
                      <Spinner size="xl" color="blue.500" />
                    </Flex>
                  ) : recommendation ? (
                    <VStack spacing={4} align="stretch">
                      <StatGroup>
                        <Stat>
                          <StatLabel>Рекомендуемая цена</StatLabel>
                          <StatNumber>{recommendation.recommendedPrice.toLocaleString()} ₽</StatNumber>
                          <StatHelpText>
                            <StatArrow type={recommendation.recommendedPrice > product.currentPrice ? 'increase' : 'decrease'} />
                            {calculatePriceChange(recommendation.recommendedPrice, product.currentPrice)}%
                          </StatHelpText>
                        </Stat>

                        <Stat>
                          <StatLabel>Минимальная цена</StatLabel>
                          <StatNumber>{recommendation.minPrice.toLocaleString()} ₽</StatNumber>
                          <StatHelpText>
                            Маржа: {((recommendation.minPrice - product.costPrice) / recommendation.minPrice * 100).toFixed(0)}%
                          </StatHelpText>
                        </Stat>

                        {recommendation.marketAverage && (
                          <Stat>
                            <StatLabel>Средняя цена на рынке</StatLabel>
                            <StatNumber>{recommendation.marketAverage.toLocaleString()} ₽</StatNumber>
                          </Stat>
                        )}
                      </StatGroup>

                      <Divider />

                      <Box>
                        <Heading size="sm" mb={2}>Объяснение</Heading>
                        <Text whiteSpace="pre-wrap">{recommendation.explanation}</Text>
                      </Box>

                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Автоматическое применение</AlertTitle>
                          <AlertDescription>
                            Вы можете автоматически применить рекомендуемую цену к товару, нажав кнопку "Применить цену".
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  ) : (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Нет данных</AlertTitle>
                        <AlertDescription>
                          Нажмите кнопку "Получить рекомендацию по цене", чтобы ИИ проанализировал данные и предложил оптимальную цену.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Вкладка автоматизации */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {/* Импорт товаров */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Heading size="md">Импорт товаров</Heading>
                </CardHeader>

                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Автоматический импорт</AlertTitle>
                        <AlertDescription>
                          Выберите товар из вашего каталога для автоматического заполнения данных.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl>
                      <FormLabel>Выберите товар</FormLabel>
                      <Select
                        placeholder="Выберите товар из каталога"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                      >
                        {productList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.currentPrice.toLocaleString()} ₽)
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      onClick={importProduct}
                      isLoading={isImporting}
                      loadingText="Импорт..."
                      width="full"
                    >
                      Импортировать товар
                    </Button>

                    <Divider my={2} />

                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={fetchCompetitors}
                      isLoading={isFetchingCompetitors}
                      loadingText="Поиск..."
                      width="full"
                    >
                      Найти конкурентов автоматически
                    </Button>

                    <Text fontSize="sm" color="gray.500">
                      Система автоматически найдет конкурентов на основе названия, категории и бренда товара.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Пакетный анализ */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Heading size="md">Пакетный анализ</Heading>
                </CardHeader>

                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Массовый анализ товаров</AlertTitle>
                        <AlertDescription>
                          Запустите анализ всех товаров из вашего каталога одним нажатием.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Stat>
                      <StatLabel>Товаров в каталоге</StatLabel>
                      <StatNumber>{productList.length}</StatNumber>
                      <StatHelpText>
                        Доступно для анализа
                      </StatHelpText>
                    </Stat>

                    <Button
                      colorScheme="blue"
                      onClick={batchAnalyze}
                      isLoading={isLoading}
                      loadingText="Запуск..."
                      width="full"
                    >
                      Запустить пакетный анализ
                    </Button>

                    <Text fontSize="sm" color="gray.500">
                      Анализ будет выполнен в фоновом режиме. Результаты будут доступны в разделе "Отчеты".
                    </Text>

                    <Accordion allowToggle>
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" fontSize="sm">
                              Дополнительные настройки
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack spacing={3} align="stretch">
                            <FormControl>
                              <FormLabel fontSize="sm">Глубина анализа</FormLabel>
                              <Select size="sm" defaultValue="standard">
                                <option value="basic">Базовый</option>
                                <option value="standard">Стандартный</option>
                                <option value="deep">Глубокий</option>
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm">Приоритет</FormLabel>
                              <Select size="sm" defaultValue="normal">
                                <option value="low">Низкий</option>
                                <option value="normal">Обычный</option>
                                <option value="high">Высокий</option>
                              </Select>
                            </FormControl>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </VStack>
                </CardBody>
              </Card>

              {/* Планирование анализа */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                <CardHeader>
                  <Heading size="md">Планирование анализа</Heading>
                </CardHeader>

                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Регулярный анализ</AlertTitle>
                        <AlertDescription>
                          Настройте расписание для автоматического анализа товаров.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl>
                      <FormLabel>Товар</FormLabel>
                      <Input
                        value={product.name}
                        isReadOnly
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Частота</FormLabel>
                      <Select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value)}
                      >
                        <option value="hourly">Каждый час</option>
                        <option value="daily">Ежедневно</option>
                        <option value="weekly">Еженедельно</option>
                        <option value="monthly">Ежемесячно</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Время</FormLabel>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      onClick={scheduleAnalysis}
                      isLoading={isScheduling}
                      loadingText="Настройка..."
                      width="full"
                    >
                      Настроить расписание
                    </Button>

                    <Text fontSize="sm" color="gray.500">
                      Система будет автоматически анализировать товар по заданному расписанию и отправлять уведомления при значительных изменениях.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
