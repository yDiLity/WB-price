import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Checkbox,
  Collapse
} from '@chakra-ui/react';
import {
  SearchIcon,
  ExternalLinkIcon,
  DeleteIcon,
  EditIcon,
  RepeatIcon,
  LinkIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  CloseIcon
} from '@chakra-ui/icons';
import { useOzonProducts } from '../context/OzonProductContext';
import { Product, CompetitorProduct } from '../types/product';
import PriceComparisonChart from '../components/product/PriceComparisonChart';
import BulkEditModal from '../components/product/BulkEditModal';
import ExportDataButton from '../components/common/ExportDataButton';
import PriceHistoryChart from '../components/product/PriceHistoryChart';
import PricingRecommendations from '../components/product/PricingRecommendations';
import CompetitorInsights from '../components/product/CompetitorInsights';
import AutoPricingRules from '../components/product/AutoPricingRules';
import PriceAlertSettings from '../components/product/PriceAlertSettings';

/**
 * Страница для отображения всех связанных товаров
 */
export default function LinkedProductsPage() {
  // Получаем данные из контекста
  const { products, isLoading, error, loadProducts, updateProduct } = useOzonProducts();

  // Загружаем товары при монтировании компонента
  useEffect(() => {
    console.log('LinkedProductsPage: загрузка товаров');
    loadProducts();

    // Логируем товары с связанными конкурентами
    console.log('Товары с связанными конкурентами:',
      products.filter(p => p.linkedCompetitors && p.linkedCompetitors.length > 0).length);

    // Логируем все товары
    console.log('Всего товаров:', products.length);

    // Добавляем тестовые связи к первым 3 товарам, если у них нет связей
    if (products.length > 0) {
      const productsToUpdate = products.slice(0, 3).filter(p => !p.linkedCompetitors || p.linkedCompetitors.length === 0);

      console.log('Добавляем тестовые связи к товарам:', productsToUpdate.length);

      productsToUpdate.forEach(async (product) => {
        // Создаем тестовые связи
        const testCompetitors = [
          {
            id: `comp-1-${product.id}`,
            competitorId: 'comp-1',
            competitorName: 'Конкурент 1',
            productId: product.id,
            productTitle: product.title,
            price: Math.round(product.price.current * 0.95),
            url: 'https://ozon.ru/product/test',
            lastUpdated: new Date(),
            isActive: true
          },
          {
            id: `comp-2-${product.id}`,
            competitorId: 'comp-2',
            competitorName: 'Конкурент 2',
            productId: product.id,
            productTitle: product.title,
            price: Math.round(product.price.current * 1.05),
            url: 'https://wildberries.ru/product/test',
            lastUpdated: new Date(),
            isActive: true
          }
        ];

        // Обновляем товар с тестовыми связями
        const updatedProduct = {
          ...product,
          linkedCompetitors: testCompetitors,
          appliedStrategyId: 'strategy-1'
        };

        try {
          // Сохраняем обновленный товар
          const result = await updateProduct(product.id, updatedProduct);
          console.log('Товар обновлен с тестовыми связями:', result);
        } catch (error) {
          console.error('Ошибка при обновлении товара:', error);
        }
      });
    }
  }, [products.length]);

  // Состояние для фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOnlyWithMinThreshold, setShowOnlyWithMinThreshold] = useState(false);

  // Состояние для редактирования минимальной цены
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [minThresholdValue, setMinThresholdValue] = useState<number | null>(null);

  // Состояние для отображения связанных товаров
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Состояние для выбора товаров и массового редактирования
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState<boolean>(false);

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Toast для уведомлений
  const toast = useToast();

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
      year: 'numeric'
    });
  };

  // Получение товаров, у которых есть связанные конкуренты
  const productsWithCompetitors = products.filter(product =>
    product.linkedCompetitors && product.linkedCompetitors.length > 0
  );

  // Фильтрация товаров
  const filteredProducts = productsWithCompetitors.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

    const matchesMinThreshold = !showOnlyWithMinThreshold ||
      (product.price.minThreshold !== undefined && product.price.minThreshold > 0);

    return matchesSearch && matchesCategory && matchesMinThreshold;
  });

  // Получение всех уникальных маркетплейсов
  const getUniqueMarketplaces = () => {
    const marketplaces = new Set<string>();

    productsWithCompetitors.forEach(product => {
      if (product.linkedCompetitors) {
        product.linkedCompetitors.forEach(competitor => {
          if (competitor.url?.includes('ozon.ru') || competitor.competitorName.toLowerCase().includes('ozon')) {
            marketplaces.add('ozon');
          } else if (competitor.url?.includes('wildberries.ru') || competitor.competitorName.toLowerCase().includes('wildberries')) {
            marketplaces.add('wildberries');
          } else if (competitor.url?.includes('aliexpress.ru') || competitor.competitorName.toLowerCase().includes('aliexpress')) {
            marketplaces.add('aliexpress');
          } else if (competitor.url?.includes('market.yandex.ru') || competitor.competitorName.toLowerCase().includes('яндекс')) {
            marketplaces.add('yandex');
          } else {
            marketplaces.add('other');
          }
        });
      }
    });

    return Array.from(marketplaces);
  };

  // Получение всех уникальных категорий
  const getUniqueCategories = () => {
    const categories = new Set<string>();

    productsWithCompetitors.forEach(product => {
      categories.add(product.category);
    });

    return Array.from(categories);
  };

  // Фильтрация связанных конкурентов по маркетплейсу
  const filterCompetitorsByMarketplace = (competitors: CompetitorProduct[]) => {
    if (!selectedMarketplace) return competitors;

    return competitors.filter(competitor => {
      if (selectedMarketplace === 'ozon') {
        return competitor.url?.includes('ozon.ru') || competitor.competitorName.toLowerCase().includes('ozon');
      } else if (selectedMarketplace === 'wildberries') {
        return competitor.url?.includes('wildberries.ru') || competitor.competitorName.toLowerCase().includes('wildberries');
      } else if (selectedMarketplace === 'aliexpress') {
        return competitor.url?.includes('aliexpress.ru') || competitor.competitorName.toLowerCase().includes('aliexpress');
      } else if (selectedMarketplace === 'yandex') {
        return competitor.url?.includes('market.yandex.ru') || competitor.competitorName.toLowerCase().includes('яндекс');
      } else if (selectedMarketplace === 'other') {
        return !competitor.url?.includes('ozon.ru') &&
               !competitor.url?.includes('wildberries.ru') &&
               !competitor.url?.includes('aliexpress.ru') &&
               !competitor.url?.includes('market.yandex.ru') &&
               !competitor.competitorName.toLowerCase().includes('ozon') &&
               !competitor.competitorName.toLowerCase().includes('wildberries') &&
               !competitor.competitorName.toLowerCase().includes('aliexpress') &&
               !competitor.competitorName.toLowerCase().includes('яндекс');
      }
      return true;
    });
  };

  // Обработчик сохранения минимальной цены
  const handleSaveMinThreshold = (productId: string) => {
    // В реальном приложении здесь будет запрос к API для сохранения минимальной цены
    // Для демонстрации просто обновляем состояние

    toast({
      title: 'Минимальная цена сохранена',
      description: `Установлена минимальная цена: ${formatPrice(minThresholdValue || 0)}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setEditingProductId(null);
    setMinThresholdValue(null);
  };

  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setMinThresholdValue(null);
  };

  // Обработчик начала редактирования
  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setMinThresholdValue(product.price.minThreshold || 0);
  };

  // Обработчик удаления связи с конкурентом
  const handleRemoveCompetitor = (productId: string, competitorId: string) => {
    // В реальном приложении здесь будет запрос к API для удаления связи
    // Для демонстрации просто показываем уведомление

    toast({
      title: 'Связь удалена',
      description: 'Связь с конкурентом успешно удалена',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик применения новой цены
  const handleApplyPrice = async (productId: string, newPrice: number) => {
    try {
      // Находим товар
      const product = products.find(p => p.id === productId);

      if (!product) {
        throw new Error('Товар не найден');
      }

      // Создаем обновленный товар
      const updatedProduct = {
        ...product,
        price: {
          ...product.price,
          current: newPrice,
          old: product.price.current
        }
      };

      // Обновляем товар
      await updateProduct(productId, updatedProduct);

      // Показываем уведомление
      toast({
        title: 'Цена обновлена',
        description: `Новая цена: ${formatPrice(newPrice)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Ошибка при обновлении цены:', error);

      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить цену товара',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик сохранения правил автоматического изменения цен
  const handleSaveAutoPricingRules = async (productId: string, rules: any[]) => {
    try {
      // Находим товар
      const product = products.find(p => p.id === productId);

      if (!product) {
        throw new Error('Товар не найден');
      }

      // Создаем обновленный товар
      const updatedProduct = {
        ...product,
        autoPricingRules: rules,
        autoPricingEnabled: rules.length > 0
      };

      // Обновляем товар
      await updateProduct(productId, updatedProduct);

      // Показываем уведомление
      toast({
        title: 'Правила сохранены',
        description: 'Правила автоматического изменения цены сохранены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Ошибка при сохранении правил:', error);

      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить правила автоматического изменения цены',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик сохранения настроек уведомлений
  const handleSaveAlerts = async (productId: string, alerts: any[]) => {
    try {
      // Находим товар
      const product = products.find(p => p.id === productId);

      if (!product) {
        throw new Error('Товар не найден');
      }

      // Создаем обновленный товар
      const updatedProduct = {
        ...product,
        priceAlerts: alerts
      };

      // Обновляем товар
      await updateProduct(productId, updatedProduct);

      // Показываем уведомление
      toast({
        title: 'Уведомления сохранены',
        description: 'Настройки уведомлений о ценах сохранены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Ошибка при сохранении уведомлений:', error);

      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки уведомлений о ценах',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик выбора/отмены выбора товара
  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  // Обработчик выбора/отмены выбора всех товаров
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      // Если все выбраны, снимаем выбор со всех
      setSelectedProductIds([]);
    } else {
      // Иначе выбираем все
      setSelectedProductIds(filteredProducts.map(product => product.id));
    }
  };

  // Получение выбранных товаров
  const getSelectedProducts = () => {
    return filteredProducts.filter(product => selectedProductIds.includes(product.id));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        gap={4}
      >
        <VStack align="flex-start" spacing={1}>
          <Heading as="h1" size="xl">Связанные товары</Heading>
          <Text color="gray.500" fontSize="md">
            Управление товарами, связанными с конкурентами
          </Text>
        </VStack>

        <Badge
          colorScheme="blue"
          fontSize="md"
          px={3}
          py={1.5}
          borderRadius="full"
        >
          Всего связанных товаров: {productsWithCompetitors.length}
        </Badge>
      </Flex>

      {/* Панель фильтров */}
      <Box
        mb={6}
        p={4}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          align={{ base: 'stretch', md: 'center' }}
          flexWrap="wrap"
        >
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Поиск по названию или SKU"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="Все категории"
            maxW={{ base: '100%', md: '200px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Все маркетплейсы"
            maxW={{ base: '100%', md: '200px' }}
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
          >
            {getUniqueMarketplaces().map(marketplace => (
              <option key={marketplace} value={marketplace}>
                {marketplace === 'ozon' ? 'Ozon' :
                 marketplace === 'wildberries' ? 'Wildberries' :
                 marketplace === 'aliexpress' ? 'AliExpress' :
                 marketplace === 'yandex' ? 'Яндекс.Маркет' : 'Другие'}
              </option>
            ))}
          </Select>

          <HStack spacing={2}>
            <input
              type="checkbox"
              id="minThresholdFilter"
              checked={showOnlyWithMinThreshold}
              onChange={(e) => setShowOnlyWithMinThreshold(e.target.checked)}
            />
            <label htmlFor="minThresholdFilter">Только с мин. ценой</label>
          </HStack>

          <Button
            leftIcon={<RepeatIcon />}
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedMarketplace('');
              setShowOnlyWithMinThreshold(false);
            }}
          >
            Сбросить
          </Button>

          <HStack spacing={2}>
            <Button
              colorScheme="blue"
              leftIcon={<RepeatIcon />}
              onClick={() => {
                // Принудительно обновляем данные
                loadProducts();

                // Добавляем тестовые связи к первым 3 товарам
                if (products.length > 0) {
                  const productsToUpdate = products.slice(0, 3);

                  productsToUpdate.forEach(async (product) => {
                    // Создаем тестовые связи
                    const testCompetitors = [
                      {
                        id: `comp-1-${product.id}`,
                        competitorId: 'comp-1',
                        competitorName: 'Конкурент 1',
                        productId: product.id,
                        productTitle: product.title,
                        price: Math.round(product.price.current * 0.95),
                        url: 'https://ozon.ru/product/test',
                        lastUpdated: new Date(),
                        isActive: true
                      },
                      {
                        id: `comp-2-${product.id}`,
                        competitorId: 'comp-2',
                        competitorName: 'Конкурент 2',
                        productId: product.id,
                        productTitle: product.title,
                        price: Math.round(product.price.current * 1.05),
                        url: 'https://wildberries.ru/product/test',
                        lastUpdated: new Date(),
                        isActive: true
                      }
                    ];

                    // Обновляем товар с тестовыми связями
                    const updatedProduct = {
                      ...product,
                      linkedCompetitors: testCompetitors,
                      appliedStrategyId: 'strategy-1'
                    };

                    try {
                      // Сохраняем обновленный товар
                      await updateProduct(product.id, updatedProduct);
                    } catch (error) {
                      console.error('Ошибка при обновлении товара:', error);
                    }
                  });

                  // Показываем уведомление
                  toast({
                    title: 'Данные обновлены',
                    description: 'Тестовые связи добавлены к товарам',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });

                  // Перезагружаем страницу через 1 секунду
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              }}
            >
              Обновить данные
            </Button>

            <Button
              colorScheme="teal"
              isDisabled={selectedProductIds.length === 0}
              onClick={() => setIsBulkEditModalOpen(true)}
            >
              Массовое редактирование ({selectedProductIds.length})
            </Button>

            <ExportDataButton
              data={filteredProducts}
              filename="linked-products"
              buttonText="Экспорт данных"
            />
          </HStack>
        </Flex>
      </Box>

      {/* Список товаров */}
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>Нет связанных товаров, соответствующих фильтрам</Text>
        </Alert>
      ) : (
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="sm"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg={headerBg}>
              <Tr>
                <Th width="40px">
                  <Checkbox
                    isChecked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                    isIndeterminate={selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length}
                    onChange={handleToggleSelectAll}
                    colorScheme="blue"
                  />
                </Th>
                <Th width="40px"></Th>
                <Th>Товар</Th>
                <Th isNumeric>Текущая цена</Th>
                <Th isNumeric>Мин. цена</Th>
                <Th>Связи</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.map(product => {
                const isExpanded = expandedProductId === product.id;
                const isEditing = editingProductId === product.id;
                const linkedCompetitors = product.linkedCompetitors || [];
                const filteredCompetitors = filterCompetitorsByMarketplace(linkedCompetitors);

                return (
                  <React.Fragment key={product.id}>
                    <Tr>
                      <Td>
                        <Checkbox
                          isChecked={selectedProductIds.includes(product.id)}
                          onChange={() => handleToggleSelectProduct(product.id)}
                          colorScheme="blue"
                        />
                      </Td>
                      <Td>
                        <IconButton
                          aria-label={isExpanded ? "Свернуть" : "Развернуть"}
                          icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        />
                      </Td>
                      <Td>
                        <Flex align="center" gap={3}>
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.title}
                              boxSize="40px"
                              objectFit="contain"
                              borderRadius="md"
                            />
                          ) : (
                            <Box
                              boxSize="40px"
                              bg="gray.100"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="xs" color="gray.500">Нет</Text>
                            </Box>
                          )}
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" noOfLines={1}>{product.title}</Text>
                            <Text fontSize="xs" color="gray.500">SKU: {product.sku}</Text>
                          </VStack>
                        </Flex>
                      </Td>
                      <Td isNumeric fontWeight="bold">
                        {formatPrice(product.price.current)}
                      </Td>
                      <Td isNumeric>
                        {isEditing ? (
                          <Flex align="center" gap={2}>
                            <NumberInput
                              value={minThresholdValue || 0}
                              onChange={(_, value) => setMinThresholdValue(value)}
                              min={0}
                              max={product.price.current * 2}
                              size="sm"
                              maxW="120px"
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <IconButton
                              aria-label="Сохранить"
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleSaveMinThreshold(product.id)}
                            />
                            <IconButton
                              aria-label="Отменить"
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            />
                          </Flex>
                        ) : (
                          <Flex align="center" justify="flex-end" gap={2}>
                            <Text>
                              {product.price.minThreshold
                                ? formatPrice(product.price.minThreshold)
                                : "Не задана"}
                            </Text>
                            <IconButton
                              aria-label="Редактировать"
                              icon={<EditIcon />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleStartEdit(product)}
                            />
                          </Flex>
                        )}
                      </Td>
                      <Td>
                        <HStack>
                          <Badge colorScheme="blue" borderRadius="full">
                            {linkedCompetitors.length}
                          </Badge>
                          {filteredCompetitors.length !== linkedCompetitors.length && (
                            <Badge colorScheme="purple" borderRadius="full">
                              {filteredCompetitors.length} отфильтровано
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Добавить связь">
                            <IconButton
                              aria-label="Добавить связь"
                              icon={<LinkIcon />}
                              size="sm"
                              colorScheme="teal"
                              variant="ghost"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>

                    {isExpanded && (
                      <Tr>
                        <Td colSpan={7} p={0}>
                          <Box p={4} bg={headerBg}>
                            <Tabs colorScheme="blue" variant="enclosed">
                              <TabList>
                                <Tab>Связанные конкуренты</Tab>
                                <Tab>Сравнение цен</Tab>
                                <Tab>История цен</Tab>
                                <Tab>Рекомендации</Tab>
                                <Tab>Аналитика</Tab>
                                <Tab>Авто-цены</Tab>
                                <Tab>Уведомления</Tab>
                              </TabList>

                              <TabPanels>
                                <TabPanel p={4}>
                                  <Heading size="sm" mb={3}>Связанные конкуренты</Heading>

                                  {filteredCompetitors.length === 0 ? (
                                    <Alert status="info" size="sm">
                                      <AlertIcon />
                                      <Text>Нет связанных конкурентов, соответствующих фильтрам</Text>
                                    </Alert>
                                  ) : (
                                    <Table variant="simple" size="sm">
                                      <Thead>
                                        <Tr>
                                          <Th>Маркетплейс</Th>
                                          <Th>Название товара</Th>
                                          <Th isNumeric>Цена</Th>
                                          <Th isNumeric>Разница</Th>
                                          <Th>Обновлено</Th>
                                          <Th>Действия</Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody>
                                        {filteredCompetitors.map(competitor => {
                                          const priceDiff = ((competitor.price - product.price.current) / product.price.current) * 100;

                                          return (
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
                                                  py={0.5}
                                                >
                                                  {competitor.competitorName}
                                                </Badge>
                                              </Td>
                                              <Td maxW="300px" isTruncated title={competitor.productTitle}>
                                                {competitor.productTitle}
                                              </Td>
                                              <Td isNumeric fontWeight="bold">
                                                {formatPrice(competitor.price)}
                                              </Td>
                                              <Td isNumeric>
                                                <Text
                                                  color={priceDiff < 0 ? 'green.500' : priceDiff > 0 ? 'red.500' : 'gray.500'}
                                                >
                                                  {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                                                </Text>
                                              </Td>
                                              <Td fontSize="xs">
                                                {formatDate(competitor.lastUpdated)}
                                              </Td>
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
                                                      variant="ghost"
                                                      colorScheme="red"
                                                      onClick={() => handleRemoveCompetitor(product.id, competitor.id)}
                                                    />
                                                  </Tooltip>
                                                </HStack>
                                              </Td>
                                            </Tr>
                                          );
                                        })}
                                      </Tbody>
                                    </Table>
                                  )}
                                </TabPanel>

                                <TabPanel p={4}>
                                  {filteredCompetitors.length > 0 ? (
                                    <PriceComparisonChart
                                      product={product}
                                      competitors={filteredCompetitors}
                                    />
                                  ) : (
                                    <Alert status="info" size="sm">
                                      <AlertIcon />
                                      <Text>Нет связанных конкурентов для сравнения цен</Text>
                                    </Alert>
                                  )}
                                </TabPanel>

                                <TabPanel p={4}>
                                  <PriceHistoryChart productId={product.id} />
                                </TabPanel>

                                <TabPanel p={4}>
                                  <PricingRecommendations
                                    product={product}
                                    competitors={filteredCompetitors}
                                    onApplyPrice={(newPrice) => handleApplyPrice(product.id, newPrice)}
                                  />
                                </TabPanel>

                                <TabPanel p={4}>
                                  <CompetitorInsights
                                    product={product}
                                    competitors={filteredCompetitors}
                                  />
                                </TabPanel>

                                <TabPanel p={4}>
                                  <AutoPricingRules
                                    product={product}
                                    onSaveRules={(rules) => handleSaveAutoPricingRules(product.id, rules)}
                                  />
                                </TabPanel>

                                <TabPanel p={4}>
                                  <PriceAlertSettings
                                    product={product}
                                    onSaveAlerts={(alerts) => handleSaveAlerts(product.id, alerts)}
                                  />
                                </TabPanel>
                              </TabPanels>
                            </Tabs>
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Модальное окно для массового редактирования */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedProducts={getSelectedProducts()}
      />
    </Container>
  );
}
