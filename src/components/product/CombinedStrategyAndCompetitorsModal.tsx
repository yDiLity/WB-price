import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Badge,
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Select,
  Switch,
  HStack,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Spinner
} from '@chakra-ui/react';
import {
  SearchIcon,
  ExternalLinkIcon,
  AddIcon,
  DeleteIcon
} from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types/product';
import { PricingStrategy, PricingStrategyType, PricingStrategyNames, PricingStrategyDescriptions } from './StrategySelectionModal';
import { competitorSearchService } from '../../services/competitorSearchService';
import { CompetitorImage } from './CompetitorImage';
import { priceAutomationService } from '../../services/priceAutomationService';

interface CombinedStrategyAndCompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (product: Product, competitors: CompetitorProduct[], strategy: PricingStrategy) => void;
}

/**
 * Объединенное модальное окно для выбора стратегии и связывания с конкурентами
 */
export default function CombinedStrategyAndCompetitorsModal({
  isOpen,
  onClose,
  product,
  onSave
}: CombinedStrategyAndCompetitorsModalProps) {
  // Состояние для выбранной стратегии
  const [selectedStrategyType, setSelectedStrategyType] = useState<PricingStrategyType>(PricingStrategyType.MATCH_LOWEST);

  // Состояние для параметров стратегии
  const [percentReduction, setPercentReduction] = useState<number>(5);
  const [amountReduction, setAmountReduction] = useState<number>(100);
  const [minPrice, setMinPrice] = useState<number>(product.price.minThreshold || Math.floor(product.price.current * 0.8));
  const [maxPrice, setMaxPrice] = useState<number>(Math.ceil(product.price.current * 1.2));
  const [checkFrequency, setCheckFrequency] = useState<number>(60); // 60 минут по умолчанию
  const [applyAutomatically, setApplyAutomatically] = useState<boolean>(true);
  const [customFormula, setCustomFormula] = useState<string>('min(competitors) - 100');

  // Состояние для поиска конкурентов
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<CompetitorProduct[]>([]);

  // Состояние для выбранных конкурентов
  const [selectedCompetitors, setSelectedCompetitors] = useState<CompetitorProduct[]>(product.linkedCompetitors || []);

  // Состояние для фильтрации
  const [showOnlyOzon, setShowOnlyOzon] = useState<boolean>(false);

  // Состояние для режима поиска (моковый или реальный)
  const [useMockData, setUseMockData] = useState<boolean>(competitorSearchService.getMockMode());

  // Состояние для предупреждения о минимальной цене
  const [showMinPriceWarning, setShowMinPriceWarning] = useState<boolean>(false);

  // Цвета для светлой/темной темы
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Toast для уведомлений
  const toast = useToast();

  // Сбрасываем состояние при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setSelectedStrategyType(PricingStrategyType.MATCH_LOWEST);
      setPercentReduction(5);
      setAmountReduction(100);
      setMinPrice(product.price.minThreshold || Math.floor(product.price.current * 0.8));
      setMaxPrice(Math.ceil(product.price.current * 1.2));
      setCheckFrequency(60);
      setApplyAutomatically(true);
      setCustomFormula('min(competitors) - 100');
      setSearchTerm('');
      setSearchResults([]);
      setSelectedCompetitors(product.linkedCompetitors || []);
      setShowOnlyOzon(false);
      setShowMinPriceWarning(false);
      setUseMockData(competitorSearchService.getMockMode());
    }
  }, [isOpen, product]);

  // Обработчик изменения режима поиска
  const handleToggleMockMode = () => {
    const newMode = !useMockData;
    setUseMockData(newMode);
    competitorSearchService.setMockMode(newMode);

    // Очищаем результаты поиска при изменении режима
    setSearchResults([]);

    toast({
      title: `Режим поиска: ${newMode ? 'Тестовый' : 'Реальный'}`,
      description: newMode
        ? 'Используются тестовые данные о конкурентах'
        : 'Используется реальный поиск конкурентов на Ozon',
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

  // Расчет предварительной цены без изменения состояния
  const calculateEstimatedPrice = (): { price: number; belowMinimum: boolean } => {
    // Получаем минимальную цену конкурентов
    let lowestCompetitorPrice = product.price.current;

    if (selectedCompetitors.length > 0) {
      lowestCompetitorPrice = Math.min(...selectedCompetitors.map(c => c.price));
    }

    let estimatedPrice = 0;

    switch (selectedStrategyType) {
      case PricingStrategyType.MATCH_LOWEST:
        estimatedPrice = lowestCompetitorPrice;
        break;
      case PricingStrategyType.UNDERCUT_BY_PERCENT:
        estimatedPrice = lowestCompetitorPrice * (1 - percentReduction / 100);
        break;
      case PricingStrategyType.UNDERCUT_BY_AMOUNT:
        estimatedPrice = lowestCompetitorPrice - amountReduction;
        break;
      case PricingStrategyType.AVERAGE_PRICE:
        if (selectedCompetitors.length > 0) {
          const avgPrice = selectedCompetitors.reduce((sum, c) => sum + c.price, 0) / selectedCompetitors.length;
          estimatedPrice = avgPrice;
        } else {
          estimatedPrice = lowestCompetitorPrice;
        }
        break;
      case PricingStrategyType.CUSTOM:
        // Здесь будет логика для вычисления цены по пользовательской формуле
        estimatedPrice = lowestCompetitorPrice - 100;
        break;
      default:
        estimatedPrice = product.price.current;
    }

    // Проверяем, не ниже ли расчетная цена минимальной
    const belowMinimum = estimatedPrice < minPrice;
    const finalPrice = belowMinimum ? minPrice : estimatedPrice;

    return { price: finalPrice, belowMinimum };
  };

  // Расчетная цена и флаг предупреждения
  const { price: estimatedPrice, belowMinimum } = calculateEstimatedPrice();

  // Обновляем состояние предупреждения при изменении расчетной цены
  useEffect(() => {
    setShowMinPriceWarning(belowMinimum);
  }, [
    belowMinimum,
    // Добавляем все зависимости, которые влияют на расчет цены
    selectedStrategyType,
    percentReduction,
    amountReduction,
    minPrice,
    selectedCompetitors
  ]);

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

  // Обработчик поиска конкурентов
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    try {
      // Используем сервис для поиска конкурентов
      const results = await competitorSearchService.searchCompetitors(
        searchTerm,
        product.id,
        product.price.current,
        showOnlyOzon,
        product.title // Передаем название товара
      );

      console.log('Результаты поиска конкурентов:', results);

      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка при поиске конкурентов:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить поиск конкурентов',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик добавления конкурента
  const handleAddCompetitor = (competitor: CompetitorProduct) => {
    if (!selectedCompetitors.find(c => c.id === competitor.id)) {
      const updatedCompetitors = [...selectedCompetitors, competitor];
      setSelectedCompetitors(updatedCompetitors);
      // Цена будет пересчитана автоматически при изменении selectedCompetitors
    }
  };

  // Обработчик удаления конкурента
  const handleRemoveCompetitor = (competitorId: string) => {
    const updatedCompetitors = selectedCompetitors.filter(c => c.id !== competitorId);
    setSelectedCompetitors(updatedCompetitors);
    // Цена будет пересчитана автоматически при изменении selectedCompetitors
  };

  // Фильтрация результатов поиска
  const filteredSearchResults = showOnlyOzon
    ? searchResults.filter(c => c.competitorName.toLowerCase().includes('ozon') || (c.url && c.url.toLowerCase().includes('ozon.ru')))
    : searchResults;

  // Получение цвета для разницы в цене
  const getPriceDiffColor = (competitorPrice: number) => {
    const priceDiff = ((competitorPrice - product.price.current) / product.price.current) * 100;

    if (priceDiff < -10) return 'green.500';
    if (priceDiff < 0) return 'green.400';
    if (priceDiff === 0) return 'gray.500';
    if (priceDiff > 10) return 'red.500';
    return 'red.400';
  };

  // Получение текста для разницы в цене
  const getPriceDiffText = (competitorPrice: number) => {
    const priceDiff = competitorPrice - product.price.current;
    const priceDiffPercent = (priceDiff / product.price.current) * 100;

    return `${priceDiff > 0 ? '+' : ''}${priceDiff.toLocaleString('ru-RU')} ₽ (${priceDiffPercent.toFixed(1)}%)`;
  };

  // Обработчик сохранения
  const handleSave = () => {
    if (selectedCompetitors.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо выбрать хотя бы одного конкурента',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const strategy = createStrategy();
    console.log('CombinedStrategyAndCompetitorsModal: вызываем onSave с параметрами:', {
      productId: product.id,
      competitorsCount: selectedCompetitors.length,
      strategyId: strategy.id,
      strategyType: strategy.type
    });

    // 🎯 АВТОМАТИЧЕСКИ ДОБАВЛЯЕМ ТОВАР В МОНИТОРИНГ
    if (applyAutomatically) {
      priceAutomationService.addProductToMonitoring(product, selectedCompetitors, strategy);

      toast({
        title: '🎯 Автоматическое регулирование включено!',
        description: `Товар ${product.sku} добавлен в мониторинг. Цены будут проверяться каждые 5 минут и автоматически корректироваться на Ozon.`,
        status: 'success',
        duration: 8000,
        isClosable: true,
      });
    }

    onSave(product, selectedCompetitors, strategy);
    onClose(); // Закрываем модальное окно после сохранения
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent className="purple-modal-border">
        <ModalHeader bg={headerBg} borderTopRadius="md">
          <Flex justify="space-between" align="center">
            <Text>Связывание товара с конкурентами</Text>
            <Badge colorScheme="blue" fontSize="md" px={2} py={1} borderRadius="md">
              {product.title}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={4}>
          {/* Информация о товаре и минимальной цене */}
          <Box p={4} mb={4} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={headerBg}>
            <Flex justify="space-between" align="center" wrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
              <Box>
                <Text fontWeight="bold">{product.title}</Text>
                <Text>Текущая цена: <strong>{formatPrice(product.price.current)}</strong></Text>
              </Box>

              <HStack spacing={4}>
                <FormControl width="auto">
                  <FormLabel fontWeight="bold">Минимальная цена</FormLabel>
                  <NumberInput
                    value={minPrice}
                    onChange={(_, value) => setMinPrice(value)}
                    min={1}
                    max={product.price.current * 2}
                    width="150px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Box>
                  <Text fontWeight="bold">Расчетная цена</Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={estimatedPrice < product.price.current ? "green.500" : "blue.500"}
                  >
                    {formatPrice(estimatedPrice)}
                  </Text>
                </Box>
              </HStack>
            </Flex>

            {/* Предупреждение о минимальной цене */}
            {showMinPriceWarning && (
              <Alert status="warning" mt={3}>
                <AlertIcon />
                <AlertTitle>Внимание!</AlertTitle>
                <AlertDescription>
                  Расчетная цена ниже минимальной. Цена будет установлена на уровне минимальной.
                </AlertDescription>
              </Alert>
            )}
          </Box>

          {/* Выбор стратегии */}
          <Box mb={4} p={4} borderWidth="1px" borderColor={borderColor} borderRadius="md">
            <Text fontWeight="bold" mb={3}>Выберите стратегию ценообразования</Text>

            <Select
              value={selectedStrategyType}
              onChange={(e) => setSelectedStrategyType(e.target.value as PricingStrategyType)}
              mb={4}
            >
              {Object.values(PricingStrategyType).map((type) => (
                <option key={type} value={type}>
                  {PricingStrategyNames[type]}
                </option>
              ))}
            </Select>

            <Text fontSize="sm" color="gray.500" mb={4}>
              {PricingStrategyDescriptions[selectedStrategyType]}
            </Text>

            {/* Параметры в зависимости от типа стратегии */}
            {selectedStrategyType === PricingStrategyType.UNDERCUT_BY_PERCENT && (
              <FormControl mb={4}>
                <FormLabel>Процент снижения</FormLabel>
                <NumberInput
                  value={percentReduction}
                  onChange={(_, value) => setPercentReduction(value)}
                  min={1}
                  max={50}
                  step={1}
                  maxW="150px"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
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
                  maxW="150px"
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

          {/* Поиск и связывание конкурентов */}
          <Box mb={4} p={4} borderWidth="1px" borderColor={borderColor} borderRadius="md">
            <Text fontWeight="bold" mb={3}>Связывание с конкурентами</Text>

            <Flex mb={4} gap={4} align="center" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Введите название товара или SKU"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>

              <Button
                colorScheme="blue"
                onClick={handleSearch}
                isLoading={isSearching}
                loadingText="Поиск..."
                minW="120px"
              >
                Найти
              </Button>

              <HStack spacing={4}>
                <Checkbox
                  isChecked={showOnlyOzon}
                  onChange={(e) => setShowOnlyOzon(e.target.checked)}
                >
                  Только Ozon
                </Checkbox>

                <Checkbox
                  isChecked={useMockData}
                  onChange={handleToggleMockMode}
                >
                  Тестовый режим
                </Checkbox>
              </HStack>
            </Flex>

            {/* Результаты поиска */}
            {isSearching ? (
              <Flex justify="center" align="center" height="100px">
                <Spinner size="xl" color="blue.500" thickness="4px" />
              </Flex>
            ) : searchResults.length > 0 ? (
              <Box overflowX="auto" mb={4}>
                <Text fontWeight="bold" mb={2}>Результаты поиска:</Text>
                <Table variant="simple" size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>Маркетплейс</Th>
                      <Th>Фото</Th>
                      <Th>Название товара</Th>
                      <Th isNumeric>Цена</Th>
                      <Th isNumeric>Разница</Th>
                      <Th>Действия</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredSearchResults.map(competitor => (
                      <Tr key={competitor.id}>
                        <Td>
                          <Badge
                            colorScheme={
                              competitor.url?.includes('ozon.ru') ? 'blue' :
                              competitor.url?.includes('wildberries.ru') ? 'purple' :
                              competitor.url?.includes('aliexpress.ru') ? 'orange' :
                              competitor.url?.includes('market.yandex.ru') ? 'yellow' : 'gray'
                            }
                            px={2}
                            py={1}
                          >
                            {competitor.competitorName}
                          </Badge>
                        </Td>
                        <Td>
                          {competitor.imageUrl ? (
                            <CompetitorImage
                              src={competitor.imageUrl}
                              alt={competitor.productTitle}
                            />
                          ) : (
                            <Box
                              width="40px"
                              height="40px"
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
                          )}
                        </Td>
                        <Td maxW="200px" isTruncated title={competitor.productTitle}>
                          {competitor.productTitle}
                        </Td>
                        <Td isNumeric fontWeight="bold">
                          {formatPrice(competitor.price)}
                        </Td>
                        <Td isNumeric>
                          <Text color={getPriceDiffColor(competitor.price)}>
                            {getPriceDiffText(competitor.price)}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="Открыть страницу товара">
                              <IconButton
                                icon={<ExternalLinkIcon />}
                                aria-label="Открыть страницу товара"
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => window.open(competitor.url, '_blank')}
                              />
                            </Tooltip>

                            <Tooltip label="Добавить связь">
                              <IconButton
                                icon={<AddIcon />}
                                aria-label="Добавить связь"
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => handleAddCompetitor(competitor)}
                                isDisabled={selectedCompetitors.some(c => c.id === competitor.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : searchTerm ? (
              <Alert status="info" mb={4}>
                <AlertIcon />
                <Text>Нет результатов поиска</Text>
              </Alert>
            ) : null}

            {/* Связанные конкуренты */}
            <Divider my={4} />

            <Text fontWeight="bold" mb={2}>Связано: {selectedCompetitors.length} конкурентов</Text>

            {selectedCompetitors.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <Text>Нет связанных конкурентов. Добавьте конкурентов через поиск.</Text>
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>Маркетплейс</Th>
                      <Th>Фото</Th>
                      <Th>Название товара</Th>
                      <Th isNumeric>Цена</Th>
                      <Th isNumeric>Разница</Th>
                      <Th>Действия</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedCompetitors.map(competitor => (
                      <Tr key={competitor.id}>
                        <Td>
                          <Badge
                            colorScheme={
                              competitor.url?.includes('ozon.ru') ? 'blue' :
                              competitor.url?.includes('wildberries.ru') ? 'purple' :
                              competitor.url?.includes('aliexpress.ru') ? 'orange' :
                              competitor.url?.includes('market.yandex.ru') ? 'yellow' : 'gray'
                            }
                            px={2}
                            py={1}
                          >
                            {competitor.competitorName}
                          </Badge>
                        </Td>
                        <Td>
                          {competitor.imageUrl ? (
                            <CompetitorImage
                              src={competitor.imageUrl}
                              alt={competitor.productTitle}
                            />
                          ) : (
                            <Box
                              width="40px"
                              height="40px"
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
                          )}
                        </Td>
                        <Td maxW="200px" isTruncated title={competitor.productTitle}>
                          {competitor.productTitle}
                        </Td>
                        <Td isNumeric fontWeight="bold">
                          {formatPrice(competitor.price)}
                        </Td>
                        <Td isNumeric>
                          <Text color={getPriceDiffColor(competitor.price)}>
                            {getPriceDiffText(competitor.price)}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {competitor.url && (
                              <Tooltip label="Открыть страницу товара">
                                <IconButton
                                  icon={<ExternalLinkIcon />}
                                  aria-label="Открыть страницу товара"
                                  size="sm"
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
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleRemoveCompetitor(competitor.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Отмена
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSave}
            isDisabled={selectedCompetitors.length === 0}
          >
            Сохранить связи
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
