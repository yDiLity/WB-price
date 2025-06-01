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
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  Image,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  IconButton,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Switch,
  RadioGroup,
  Radio,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Heading
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, DeleteIcon, LinkIcon, ExternalLinkIcon, CheckIcon, RepeatIcon, InfoIcon } from '@chakra-ui/icons';
import { Product, Competitor, CompetitorProduct } from '../../types/product';
import { ozonCompetitorService } from '../../services/ozonCompetitorService';
import { useTrackedProductsSync } from '../../services/trackedProductsService';

// Импортируем типы для стратегий
import { PricingStrategy, PricingStrategyType, PricingStrategyNames, PricingStrategyDescriptions } from './StrategySelectionModal';

interface CompetitorLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (product: Product, linkedCompetitors: CompetitorProduct[], strategy?: PricingStrategy) => void;
}

export default function CompetitorLinkingModal({
  isOpen,
  onClose,
  product,
  onSave
}: CompetitorLinkingModalProps) {
  // Состояние для хранения связанных конкурентов
  const [linkedCompetitors, setLinkedCompetitors] = useState<CompetitorProduct[]>([]);

  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CompetitorProduct[]>([]);
  const [searchType, setSearchType] = useState<'name' | 'sku'>('name');
  const [showOnlyOzon, setShowOnlyOzon] = useState(true);

  // Состояние для ручного добавления
  const [manualCompetitor, setManualCompetitor] = useState({
    name: '',
    url: '',
    price: ''
  });

  // Состояние для стратегии ценообразования
  const [selectedStrategyType, setSelectedStrategyType] = useState<PricingStrategyType>(PricingStrategyType.MATCH_LOWEST);
  const [percentReduction, setPercentReduction] = useState<number>(5);
  const [amountReduction, setAmountReduction] = useState<number>(100);
  const [minPrice, setMinPrice] = useState<number>(product.price.minThreshold || Math.floor(product.price.current * 0.8));
  const [maxPrice, setMaxPrice] = useState<number>(Math.ceil(product.price.current * 1.2));
  const [checkFrequency, setCheckFrequency] = useState<number>(60); // 60 минут по умолчанию
  const [applyAutomatically, setApplyAutomatically] = useState<boolean>(true);
  const [customFormula, setCustomFormula] = useState<string>('min(competitors) - 100');

  // Состояние для отслеживания активной вкладки
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');

  // Toast для уведомлений
  const toast = useToast();

  // Сервис синхронизации с Excel-таблицей
  const { notifyCompetitorLinked, notifyStrategyApplied } = useTrackedProductsSync();

  // Загрузка связанных конкурентов при открытии модального окна
  useEffect(() => {
    if (isOpen && product) {
      // Здесь будет загрузка связанных конкурентов из API
      // Пока используем моковые данные
      const mockLinkedCompetitors: CompetitorProduct[] = product.price.competitorPrices?.map(cp => ({
        id: `cp-${cp.competitorId}`,
        competitorId: cp.competitorId,
        competitorName: cp.competitorName,
        productId: product.id,
        productTitle: product.title,
        price: cp.price,
        url: `https://example.com/competitor/${cp.competitorId}/product/${product.id}`,
        lastUpdated: cp.lastUpdated,
        isActive: true
      })) || [];

      setLinkedCompetitors(mockLinkedCompetitors);
    }
  }, [isOpen, product]);

  // Поиск конкурентов
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Введите поисковый запрос',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);

    try {
      let results: CompetitorProduct[] = [];

      // Используем сервис для поиска конкурентов
      if (searchType === 'name') {
        results = await ozonCompetitorService.searchCompetitors(product, {
          query: searchQuery,
          useRealApi: true
        });
      } else {
        results = await ozonCompetitorService.searchCompetitorsBySku(product, {
          useRealApi: true
        });
      }

      // Фильтруем результаты, если нужно показывать только конкурентов с Ozon
      if (showOnlyOzon) {
        results = results.filter(comp =>
          comp.competitorName.toLowerCase().includes('ozon') ||
          comp.url.toLowerCase().includes('ozon.ru')
        );
      }

      setSearchResults(results);

      toast({
        title: 'Поиск завершен',
        description: `Найдено ${results.length} конкурентов`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error searching competitors:', error);
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось найти конкурентов. Попробуйте позже.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Добавление конкурента из результатов поиска
  const handleAddCompetitor = (competitor: CompetitorProduct) => {
    // Проверяем, не добавлен ли уже этот конкурент
    if (linkedCompetitors.some(c => c.id === competitor.id)) {
      toast({
        title: 'Конкурент уже добавлен',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLinkedCompetitors([...linkedCompetitors, competitor]);

    // Уведомляем Excel-таблицу о добавлении конкурента
    notifyCompetitorLinked(product.id, {
      id: competitor.id,
      name: competitor.competitorName,
      price: competitor.price,
      url: competitor.url
    }, 'CompetitorLinkingModal');

    toast({
      title: 'Конкурент добавлен',
      description: `${competitor.competitorName} добавлен в список конкурентов`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Удаление конкурента из списка связанных
  const handleRemoveCompetitor = (competitorId: string) => {
    setLinkedCompetitors(linkedCompetitors.filter(c => c.id !== competitorId));

    toast({
      title: 'Конкурент удален',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Удаление всех связанных конкурентов
  const handleRemoveAllCompetitors = () => {
    if (linkedCompetitors.length === 0) {
      toast({
        title: 'Нет связанных конкурентов',
        description: 'Нет конкурентов для удаления',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLinkedCompetitors([]);

    toast({
      title: 'Все конкуренты удалены',
      description: `Удалено ${linkedCompetitors.length} конкурентов`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Ручное добавление конкурента
  const handleAddManualCompetitor = () => {
    if (!manualCompetitor.name || !manualCompetitor.price) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Название и цена обязательны для заполнения',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const price = parseFloat(manualCompetitor.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Некорректная цена',
        description: 'Введите положительное число',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newCompetitor: CompetitorProduct = {
      id: `manual-${Date.now()}`,
      competitorId: `manual-comp-${Date.now()}`,
      competitorName: manualCompetitor.name,
      productId: product.id,
      productTitle: product.title,
      price: price,
      url: manualCompetitor.url || '',
      lastUpdated: new Date(),
      isActive: true
    };

    setLinkedCompetitors([...linkedCompetitors, newCompetitor]);

    // Уведомляем Excel-таблицу о добавлении конкурента
    notifyCompetitorLinked(product.id, {
      id: newCompetitor.id,
      name: newCompetitor.competitorName,
      price: newCompetitor.price,
      url: newCompetitor.url
    }, 'CompetitorLinkingModal');

    // Сбрасываем форму
    setManualCompetitor({
      name: '',
      url: '',
      price: ''
    });

    toast({
      title: 'Конкурент добавлен',
      description: `${newCompetitor.competitorName} добавлен в список конкурентов`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Получение предварительного расчета новой цены
  const getEstimatedPrice = (): number => {
    // Предполагаем, что минимальная цена конкурентов равна текущей цене товара
    // В реальном приложении здесь будет логика для получения минимальной цены конкурентов
    const lowestCompetitorPrice = product.price.current;

    switch (selectedStrategyType) {
      case PricingStrategyType.MATCH_LOWEST:
        return lowestCompetitorPrice;
      case PricingStrategyType.UNDERCUT_BY_PERCENT:
        return lowestCompetitorPrice * (1 - percentReduction / 100);
      case PricingStrategyType.UNDERCUT_BY_AMOUNT:
        return lowestCompetitorPrice - amountReduction;
      case PricingStrategyType.AVERAGE_PRICE:
        // Предполагаем, что средняя цена конкурентов равна текущей цене товара
        return lowestCompetitorPrice;
      case PricingStrategyType.CUSTOM:
        // Здесь будет логика для вычисления цены по пользовательской формуле
        return lowestCompetitorPrice - 100;
      default:
        return product.price.current;
    }
  };

  // Проверка, не ниже ли расчетная цена минимальной
  const estimatedPrice = Math.max(getEstimatedPrice(), minPrice);

  // Создание объекта стратегии
  const createStrategy = (): PricingStrategy => {
    const strategyId = `strategy-${Date.now()}`;

    return {
      id: strategyId,
      type: selectedStrategyType,
      name: PricingStrategyNames[selectedStrategyType],
      description: PricingStrategyDescriptions[selectedStrategyType],
      parameters: {
        percentReduction: selectedStrategyType === PricingStrategyType.UNDERCUT_BY_PERCENT ? percentReduction : undefined,
        amountReduction: selectedStrategyType === PricingStrategyType.UNDERCUT_BY_AMOUNT ? amountReduction : undefined,
        minPrice,
        maxPrice,
        checkFrequency,
        applyAutomatically,
        customFormula: selectedStrategyType === PricingStrategyType.CUSTOM ? customFormula : undefined
      }
    };
  };

  // Сохранение изменений
  const handleSave = () => {
    const strategy = createStrategy();

    // Уведомляем Excel-таблицу о применении стратегии
    notifyStrategyApplied(product.id, {
      strategy: strategy,
      competitorsCount: linkedCompetitors.length,
      estimatedPrice: estimatedPrice
    }, 'CompetitorLinkingModal');

    onSave(product, linkedCompetitors, strategy);
    onClose();

    toast({
      title: 'Изменения сохранены',
      description: `Связано ${linkedCompetitors.length} конкурентов с товаром "${product.title}" и применена стратегия "${strategy.name}"`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Переход к связным конкурентам
  const handleGoToLinkedCompetitors = () => {
    // Переключаемся на вкладку "Связанные конкуренты" (индекс 1)
    setActiveTabIndex(1);

    // Сохраняем стратегию в состоянии, но не закрываем модальное окно
    const strategy = createStrategy();

    toast({
      title: 'Стратегия выбрана',
      description: `Выбрана стратегия "${strategy.name}". Теперь вы можете связать товар с конкурентами.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(5px)"
      />
      <ModalContent
        bg={bgColor}
        borderRadius="xl"
        mx={4}
      >
        <ModalHeader>Связывание товара с конкурентами</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Информация о товаре */}
            <Box
              p={4}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              bg={highlightColor}
            >
              <Flex align="center" gap={4}>
                <Image
                  src={product?.images[0]?.url || '/images/placeholders/default.svg'}
                  alt={product?.title}
                  boxSize="80px"
                  objectFit="contain"
                  borderRadius="md"
                  bg={useColorModeValue('white', 'gray.600')}
                  p={1}
                  borderWidth="1px"
                  borderColor={borderColor}
                />

                <Box flex="1">
                  <Text fontSize="lg" fontWeight="bold">{product?.title}</Text>
                  <HStack spacing={2} mt={1}>
                    <Badge colorScheme="blue">{product?.sku}</Badge>
                    <Badge colorScheme="purple">{product?.brand}</Badge>
                  </HStack>
                  <Text fontSize="sm" mt={1} noOfLines={2}>{product?.description}</Text>
                </Box>

                <Box textAlign="right">
                  <Text fontSize="sm">Ваша цена:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.500">
                    {formatPrice(product?.price.current)}
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Табы для разных способов добавления конкурентов */}
            <Tabs
              colorScheme="blue"
              variant="enclosed"
              index={activeTabIndex}
              onChange={setActiveTabIndex}
            >
              <TabList>
                <Tab>Стратегия</Tab>
                <Tab>Связанные конкуренты</Tab>
                <Tab>Управление конкурентами</Tab>
              </TabList>

              <TabPanels>
                {/* Вкладка с выбором стратегии */}
                <TabPanel>
                  <Box>
                    <Text fontWeight="bold" mb={3}>Выбор стратегии ценообразования</Text>

                    {/* Выбор типа стратегии */}
                    <FormControl mb={4}>
                      <FormLabel>Тип стратегии</FormLabel>
                      <RadioGroup value={selectedStrategyType} onChange={(value) => setSelectedStrategyType(value as PricingStrategyType)}>
                        <Stack spacing={3}>
                          {Object.values(PricingStrategyType).map((type) => (
                            <Box
                              key={type}
                              p={3}
                              borderWidth="1px"
                              borderRadius="md"
                              borderColor={selectedStrategyType === type ? 'blue.500' : borderColor}
                              bg={selectedStrategyType === type ? highlightColor : bgColor}
                              cursor="pointer"
                              onClick={() => setSelectedStrategyType(type)}
                            >
                              <Radio value={type} colorScheme="blue">
                                <Text fontWeight="medium">{PricingStrategyNames[type]}</Text>
                              </Radio>
                              <Text fontSize="sm" ml={6} mt={1} color="gray.500">
                                {PricingStrategyDescriptions[type]}
                              </Text>
                            </Box>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    {/* Параметры стратегии */}
                    <Box mt={4}>
                      <Text fontWeight="bold" mb={3}>Параметры стратегии</Text>

                      {/* Параметры в зависимости от типа стратегии */}
                      {selectedStrategyType === PricingStrategyType.UNDERCUT_BY_PERCENT && (
                        <FormControl mb={4}>
                          <FormLabel>Процент снижения</FormLabel>
                          <Flex>
                            <NumberInput
                              value={percentReduction}
                              onChange={(_, value) => setPercentReduction(value)}
                              min={1}
                              max={50}
                              step={1}
                              maxW="100px"
                              mr={4}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <Slider
                              flex="1"
                              value={percentReduction}
                              onChange={setPercentReduction}
                              min={1}
                              max={50}
                              step={1}
                              focusThumbOnChange={false}
                              colorScheme="blue"
                            >
                              <SliderTrack>
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb boxSize={6} />
                            </Slider>
                          </Flex>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            Цена будет снижена на {percentReduction}% от минимальной цены конкурентов
                          </Text>
                        </FormControl>
                      )}

                      {selectedStrategyType === PricingStrategyType.UNDERCUT_BY_AMOUNT && (
                        <FormControl mb={4}>
                          <FormLabel>Сумма снижения (₽)</FormLabel>
                          <NumberInput
                            value={amountReduction}
                            onChange={(_, value) => setAmountReduction(value)}
                            min={1}
                            max={10000}
                            step={50}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            Цена будет снижена на {formatPrice(amountReduction)} от минимальной цены конкурентов
                          </Text>
                        </FormControl>
                      )}

                      {selectedStrategyType === PricingStrategyType.CUSTOM && (
                        <FormControl mb={4}>
                          <FormLabel>Пользовательская формула</FormLabel>
                          <Select
                            value={customFormula}
                            onChange={(e) => setCustomFormula(e.target.value)}
                          >
                            <option value="min(competitors) - 100">Минимальная цена конкурентов - 100 ₽</option>
                            <option value="min(competitors) * 0.95">Минимальная цена конкурентов - 5%</option>
                            <option value="avg(competitors) * 0.97">Средняя цена конкурентов - 3%</option>
                            <option value="min(competitors) - 50">Минимальная цена конкурентов - 50 ₽</option>
                          </Select>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            Выберите предустановленную формулу или создайте свою
                          </Text>
                        </FormControl>
                      )}

                      {/* Общие параметры для всех стратегий */}
                      <FormControl mb={4}>
                        <FormLabel>Минимальная цена (₽)</FormLabel>
                        <NumberInput
                          value={minPrice}
                          onChange={(_, value) => setMinPrice(value)}
                          min={1}
                          max={product.price.current * 2}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Цена не будет опускаться ниже этого значения
                        </Text>
                      </FormControl>

                      <FormControl mb={4}>
                        <FormLabel>Частота проверки (минуты)</FormLabel>
                        <Select
                          value={checkFrequency}
                          onChange={(e) => setCheckFrequency(parseInt(e.target.value))}
                        >
                          <option value="15">Каждые 15 минут</option>
                          <option value="30">Каждые 30 минут</option>
                          <option value="60">Каждый час</option>
                          <option value="180">Каждые 3 часа</option>
                          <option value="360">Каждые 6 часов</option>
                          <option value="720">Каждые 12 часов</option>
                          <option value="1440">Раз в день</option>
                        </Select>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Как часто будут проверяться цены конкурентов
                        </Text>
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="auto-apply" mb="0">
                          Применять автоматически
                        </FormLabel>
                        <Switch
                          id="auto-apply"
                          colorScheme="blue"
                          isChecked={applyAutomatically}
                          onChange={(e) => setApplyAutomatically(e.target.checked)}
                        />
                      </FormControl>
                    </Box>

                    {/* Предварительный расчет */}
                    <Box p={4} bg={highlightColor} mt={4} borderRadius="md">
                      <Text fontWeight="bold" mb={3}>Предварительный расчет</Text>

                      <HStack spacing={4} mb={2}>
                        <Text>Текущая цена:</Text>
                        <Text fontWeight="bold">{formatPrice(product.price.current)}</Text>
                      </HStack>

                      <HStack spacing={4} mb={2}>
                        <Text>Расчетная цена:</Text>
                        <Text fontWeight="bold" color={estimatedPrice < product.price.current ? "green.500" : "blue.500"}>
                          {formatPrice(estimatedPrice)}
                        </Text>
                      </HStack>

                      <HStack spacing={4}>
                        <Text>Изменение:</Text>
                        <Badge
                          colorScheme={estimatedPrice < product.price.current ? "green" : "blue"}
                          fontSize="md"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {estimatedPrice < product.price.current ? "-" : "+"}
                          {Math.abs(estimatedPrice - product.price.current).toLocaleString('ru-RU')} ₽
                          ({Math.abs(((estimatedPrice / product.price.current) - 1) * 100).toFixed(1)}%)
                        </Badge>
                      </HStack>

                      {estimatedPrice <= minPrice && (
                        <Alert status="warning" mt={3} size="sm">
                          <AlertIcon />
                          Расчетная цена ограничена минимальной ценой
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </TabPanel>

                {/* Вкладка со связанными конкурентами */}
                <TabPanel>
                  {linkedCompetitors.length > 0 ? (
                    <Box overflowX="auto">
                      <HStack mb={2} justify="space-between">
                        <Text fontWeight="medium">Связано: {linkedCompetitors.length} конкурентов</Text>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="solid"
                          leftIcon={<DeleteIcon />}
                          onClick={handleRemoveAllCompetitors}
                        >
                          Удалить все
                        </Button>
                      </HStack>

                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Конкурент</Th>
                            <Th>Название товара</Th>
                            <Th isNumeric>Цена</Th>
                            <Th isNumeric>Разница</Th>
                            <Th>Обновлено</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {linkedCompetitors.map((competitor) => {
                            const priceDiff = ((competitor.price - product.price.current) / product.price.current) * 100;
                            const isOzonCompetitor = competitor.competitorName.toLowerCase().includes('ozon') ||
                                                    (competitor.url && competitor.url.toLowerCase().includes('ozon.ru'));

                            return (
                              <Tr key={competitor.id} bg={isOzonCompetitor ? 'blue.50' : undefined}>
                                <Td fontWeight="medium">
                                  <HStack>
                                    {isOzonCompetitor && (
                                      <Badge colorScheme="blue" variant="solid" fontSize="xs">
                                        Ozon
                                      </Badge>
                                    )}
                                    <Text>{competitor.competitorName}</Text>
                                  </HStack>
                                </Td>
                                <Td maxW="250px" isTruncated title={competitor.productTitle}>
                                  {competitor.productTitle}
                                </Td>
                                <Td isNumeric fontWeight="bold">{formatPrice(competitor.price)}</Td>
                                <Td isNumeric>
                                  <Badge
                                    colorScheme={priceDiff < 0 ? 'green' : priceDiff > 0 ? 'red' : 'gray'}
                                    variant="subtle"
                                    borderRadius="full"
                                  >
                                    {priceDiff < 0 ? '↓' : priceDiff > 0 ? '↑' : '='} {Math.abs(priceDiff).toFixed(1)}%
                                  </Badge>
                                </Td>
                                <Td fontSize="xs">{formatDate(competitor.lastUpdated)}</Td>
                                <Td>
                                  <HStack spacing={1}>
                                    {competitor.url && (
                                      <Tooltip label="Открыть страницу товара">
                                        <IconButton
                                          icon={<ExternalLinkIcon />}
                                          aria-label="Открыть страницу товара"
                                          size="xs"
                                          variant="ghost"
                                          colorScheme="blue"
                                          onClick={() => window.open(competitor.url, '_blank')}
                                        />
                                      </Tooltip>
                                    )}

                                    <Tooltip label="Удалить связь">
                                      <IconButton
                                        icon={<DeleteIcon />}
                                        aria-label="Удалить связь"
                                        size="xs"
                                        variant="solid"
                                        colorScheme="red"
                                        onClick={() => handleRemoveCompetitor(competitor.id)}
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">Нет связанных конкурентов</Text>
                      <Text fontSize="sm" mt={2}>
                        Добавьте конкурентов через поиск или вручную
                      </Text>
                    </Box>
                  )}
                </TabPanel>

                {/* Объединенная вкладка управления конкурентами */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Секция поиска конкурентов */}
                    <Box>
                      <Heading size="md" mb={4}>🔍 Поиск конкурентов</Heading>

                      <VStack spacing={4} align="stretch">
                        <HStack spacing={4} align="flex-end">
                          <FormControl flex="1">
                            <FormLabel>Тип поиска</FormLabel>
                            <Select
                              value={searchType}
                              onChange={(e) => setSearchType(e.target.value as 'name' | 'sku')}
                            >
                              <option value="name">По названию</option>
                              <option value="sku">По артикулу/SKU</option>
                            </Select>
                          </FormControl>

                          <FormControl display="flex" alignItems="center" width="auto">
                            <FormLabel htmlFor="only-wb" mb="0" whiteSpace="nowrap">
                              Только WB
                            </FormLabel>
                            <Switch
                              id="only-wb"
                              isChecked={showOnlyOzon}
                              onChange={(e) => setShowOnlyOzon(e.target.checked)}
                              colorScheme="blue"
                            />
                          </FormControl>
                        </HStack>

                        <InputGroup size="lg">
                          <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.300" />
                          </InputLeftElement>
                          <Input
                            placeholder={searchType === 'name'
                              ? "Введите название товара или конкурента"
                              : "Введите артикул или SKU товара"
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          />
                          <Button
                            ml={2}
                            colorScheme="blue"
                            onClick={handleSearch}
                            isLoading={isSearching}
                            leftIcon={<SearchIcon />}
                          >
                            Найти
                          </Button>
                        </InputGroup>

                        {/* Результаты поиска */}
                        {isSearching ? (
                          <Flex justify="center" py={8}>
                            <Spinner size="xl" color="blue.500" />
                          </Flex>
                        ) : searchResults.length > 0 ? (
                          <Box overflowX="auto">
                            <HStack mb={2} justify="space-between">
                              <Text fontWeight="medium">Найдено: {searchResults.length} конкурентов</Text>
                              <Button
                                size="sm"
                                leftIcon={<RepeatIcon />}
                                variant="outline"
                                onClick={handleSearch}
                                isDisabled={isSearching}
                              >
                                Обновить
                              </Button>
                            </HStack>

                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Конкурент</Th>
                                  <Th>Название товара</Th>
                                  <Th isNumeric>Цена</Th>
                                  <Th isNumeric>Разница</Th>
                                  <Th>Действия</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {searchResults.map((result) => {
                                  const priceDiff = ((result.price - product.price.current) / product.price.current) * 100;
                                  const isLinked = linkedCompetitors.some(c => c.id === result.id);
                                  const isOzonCompetitor = result.competitorName.toLowerCase().includes('ozon') ||
                                                          result.url.toLowerCase().includes('ozon.ru');

                                  return (
                                    <Tr key={result.id} bg={isOzonCompetitor ? 'blue.50' : undefined}>
                                      <Td fontWeight="medium">
                                        <HStack>
                                          {isOzonCompetitor && (
                                            <Badge colorScheme="blue" variant="solid" fontSize="xs">
                                              Ozon
                                            </Badge>
                                          )}
                                          <Text>{result.competitorName}</Text>
                                        </HStack>
                                      </Td>
                                      <Td maxW="250px" isTruncated title={result.productTitle}>
                                        {result.productTitle}
                                      </Td>
                                      <Td isNumeric fontWeight="bold">{formatPrice(result.price)}</Td>
                                      <Td isNumeric>
                                        <Badge
                                          colorScheme={priceDiff < 0 ? 'green' : priceDiff > 0 ? 'red' : 'gray'}
                                          variant="subtle"
                                          borderRadius="full"
                                        >
                                          {priceDiff < 0 ? '↓' : priceDiff > 0 ? '↑' : '='} {Math.abs(priceDiff).toFixed(1)}%
                                        </Badge>
                                      </Td>
                                      <Td>
                                        <HStack spacing={1}>
                                          {result.url && (
                                            <Tooltip label="Открыть страницу товара">
                                              <IconButton
                                                icon={<ExternalLinkIcon />}
                                                aria-label="Открыть страницу товара"
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => window.open(result.url, '_blank')}
                                              />
                                            </Tooltip>
                                          )}

                                          <Tooltip label={isLinked ? "Уже добавлен" : "Добавить конкурента"}>
                                            <IconButton
                                              icon={isLinked ? <CheckIcon /> : <AddIcon />}
                                              aria-label={isLinked ? "Уже добавлен" : "Добавить конкурента"}
                                              size="xs"
                                              colorScheme={isLinked ? "green" : "blue"}
                                              isDisabled={isLinked}
                                              onClick={() => handleAddCompetitor(result)}
                                            />
                                          </Tooltip>
                                        </HStack>
                                      </Td>
                                    </Tr>
                                  );
                                })}
                              </Tbody>
                            </Table>
                          </Box>
                        ) : searchQuery ? (
                          <Box textAlign="center" py={4}>
                            <Text color="gray.500">Ничего не найдено</Text>
                            <Text fontSize="sm" mt={1}>
                              Попробуйте изменить поисковый запрос
                            </Text>
                          </Box>
                        ) : null}
                      </VStack>
                    </Box>

                    <Divider />

                    {/* Секция ручного добавления */}
                    <Box>
                      <Heading size="md" mb={4}>✏️ Добавить конкурента вручную</Heading>

                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Название конкурента</FormLabel>
                          <Input
                        placeholder="Например: МегаМаркет"
                        value={manualCompetitor.name}
                        onChange={(e) => setManualCompetitor({...manualCompetitor, name: e.target.value})}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>URL товара конкурента</FormLabel>
                      <Input
                        placeholder="https://example.com/product/123"
                        value={manualCompetitor.url}
                        onChange={(e) => setManualCompetitor({...manualCompetitor, url: e.target.value})}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Цена конкурента</FormLabel>
                      <InputGroup>
                        <Input
                          placeholder="Например: 1999"
                          value={manualCompetitor.price}
                          onChange={(e) => setManualCompetitor({...manualCompetitor, price: e.target.value})}
                          type="number"
                          min="0"
                          step="0.01"
                        />
                        <Button
                          ml={2}
                          colorScheme="blue"
                          onClick={handleAddManualCompetitor}
                          leftIcon={<AddIcon />}
                        >
                          Добавить
                        </Button>
                      </InputGroup>
                    </FormControl>

                        <Alert status="info" mt={4}>
                          <AlertIcon />
                          <Box>
                            <Text fontWeight="bold">Совет</Text>
                            <Text fontSize="sm">
                              Добавляйте конкурентов вручную, если не можете найти их через поиск.
                              Укажите точную цену и URL товара для корректной работы стратегий ценообразования.
                            </Text>
                          </Box>
                        </Alert>
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          {activeTabIndex === 0 ? (
            <Button
              colorScheme="blue"
              onClick={handleGoToLinkedCompetitors}
              leftIcon={<LinkIcon />}
            >
              Перейти к связным конкурентам
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              onClick={handleSave}
              leftIcon={<CheckIcon />}
            >
              Сохранить изменения
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
