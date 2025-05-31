import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  useColorModeValue,
  Badge,
  HStack,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Link,
  VStack,
  Switch
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  SettingsIcon,
  ChevronDownIcon,
  RepeatIcon,
  DownloadIcon,
  ExternalLinkIcon,
  LinkIcon
} from '@chakra-ui/icons';
import { FaFilter } from 'react-icons/fa';
import { useOzonProducts } from '../context/OzonProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/product';
import ProductListSimple from '../components/product/ProductListSimple';
import { useNavigate } from 'react-router-dom';
import CompetitorLinkingModal from '../components/product/CompetitorLinkingModal';
import { CompetitorProduct } from '../types/product';
import { OzonApiServiceFactory } from '../services/ozonApiServiceFactory';
import { PricingStrategy } from '../components/product/StrategySelectionModal';
import { AutomationToggle } from '../components/automation/AutomationToggle';
import CompetitorPricesTable from '../components/product/CompetitorPricesTable';
import PriceHistoryChart from '../components/product/PriceHistoryChart';
import PricingRecommendations from '../components/product/PricingRecommendations';
import { MockDataDisplay } from '../components/product/MockDataDisplay';

export default function OzonProductsPage() {
  const {
    products,
    selectedProduct,
    searchResult,
    isLoading,
    error,
    filters,
    stats,
    loadProducts,
    loadProductStats,
    setFilters,
    resetFilters,
    selectProduct
  } = useOzonProducts();

  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Состояния
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [showInStock, setShowInStock] = useState<boolean | undefined>(undefined);
  const [showWithStrategy, setShowWithStrategy] = useState<boolean | undefined>(undefined);

  // Состояние для модального окна связывания конкурентов
  const [competitorLinkingProduct, setCompetitorLinkingProduct] = useState<Product | null>(null);

  // Модальные окна и ящики
  const {
    isOpen: isFilterDrawerOpen,
    onOpen: onFilterDrawerOpen,
    onClose: onFilterDrawerClose
  } = useDisclosure();

  const {
    isOpen: isProductDetailOpen,
    onOpen: onProductDetailOpen,
    onClose: onProductDetailClose
  } = useDisclosure();

  const {
    isOpen: isApplyStrategyOpen,
    onOpen: onApplyStrategyOpen,
    onClose: onApplyStrategyClose
  } = useDisclosure();

  // Используем useDisclosure с начальным состоянием false и колбэком для отладки
  const {
    isOpen: isCompetitorLinkingOpen,
    onOpen: onCompetitorLinkingOpenOriginal,
    onClose: onCompetitorLinkingClose
  } = useDisclosure({
    defaultIsOpen: false,
    onOpen: () => console.log('onCompetitorLinkingOpen вызван'),
    onClose: () => console.log('onCompetitorLinkingClose вызван')
  });

  // Создаем обертку для onOpen, чтобы добавить отладочные сообщения
  const onCompetitorLinkingOpen = () => {
    console.log('Вызываем onCompetitorLinkingOpen');
    onCompetitorLinkingOpenOriginal();
    // Проверяем, изменилось ли состояние
    setTimeout(() => {
      console.log('Состояние isCompetitorLinkingOpen после вызова onOpen:', isCompetitorLinkingOpen);
    }, 0);
  };

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  // Проверяем, настроен ли API Wildberries
  const isWBApiConfigured = user?.wbApiCredentials?.isValid || false;

  // Обработчик поиска
  const handleSearch = () => {
    setFilters({
      search: searchTerm,
      page: 1
    });
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setPriceRange({});
    setShowInStock(undefined);
    setShowWithStrategy(undefined);
    resetFilters();
  };

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    setFilters({
      search: searchTerm,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      inStock: showInStock,
      withStrategy: showWithStrategy,
      page: 1
    });

    if (isFilterDrawerOpen) {
      onFilterDrawerClose();
    }
  };

  // Обработчик выбора товара
  const handleSelectProduct = (product: Product) => {
    selectProduct(product);
    onProductDetailOpen();
  };

  // Обработчик применения стратегии
  const handleApplyStrategy = (productId: string) => {
    // Находим товар по ID и выбираем его
    const product = products.find(p => p.id === productId);
    if (product) {
      selectProduct(product);
      onApplyStrategyOpen();

      // Показываем уведомление для отладки
      console.log('Открываем модальное окно для применения стратегии к товару:', productId);
      alert(`Открываем модальное окно для применения стратегии к товару: ${product.title}`);
    }
  };



  // Обработчик связывания товара с конкурентами
  const handleLinkCompetitors = (productId: string) => {
    console.log('Вызван handleLinkCompetitors в OzonProductsPage для товара:', productId);

    // Находим товар по ID
    const product = products.find(p => p.id === productId);
    if (product) {
      console.log('Найден товар:', product.title);

      // Устанавливаем товар для модального окна
      setCompetitorLinkingProduct(product);

      // Открываем модальное окно
      onCompetitorLinkingOpen();
      console.log('Модальное окно должно быть открыто, isCompetitorLinkingOpen:', isCompetitorLinkingOpen);

      // Показываем уведомление для отладки
      console.log('Открываем модальное окно для связывания товара с конкурентами:', productId);
      // alert(`Открываем модальное окно для связывания товара с конкурентами: ${product.title}`);
    } else {
      console.error('Товар не найден:', productId);
      console.log('Список товаров:', products.map(p => ({ id: p.id, title: p.title })));

      // Попробуем загрузить товары заново
      loadProducts();

      // Попробуем найти товар в API
      const apiService = OzonApiServiceFactory.getInstance().getProductService('guest', null, 'ozon');
      apiService.getProductById(productId).then((foundProduct: Product) => {
        if (foundProduct) {
          console.log('Товар найден в API:', foundProduct.title);
          setCompetitorLinkingProduct(foundProduct);
          onCompetitorLinkingOpen();
        } else {
          console.error('Товар не найден даже в API:', productId);
          toast({
            title: 'Товар не найден',
            description: 'Не удалось найти товар. Пожалуйста, обновите страницу и попробуйте снова.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }).catch((error: any) => {
        console.error('Ошибка при поиске товара в API:', error);
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при поиске товара. Пожалуйста, попробуйте снова.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    }
  };

  // Обработчик закрытия модального окна связывания конкурентов
  const handleCompetitorLinkingClose = () => {
    onCompetitorLinkingClose();
    setCompetitorLinkingProduct(null);
  };

  // Обработчик сохранения связей с конкурентами и стратегии
  const handleSaveCompetitorLinks = (product: Product, linkedCompetitors: CompetitorProduct[], strategy?: PricingStrategy) => {
    // Здесь будет логика сохранения связей с конкурентами и стратегии
    console.log('Сохранение связей с конкурентами:', product.id, linkedCompetitors);

    if (strategy) {
      console.log('Применена стратегия:', strategy.name, strategy);

      // Показываем уведомление об успешном сохранении
      toast({
        title: 'Изменения сохранены',
        description: `Товар "${product.title}" связан с ${linkedCompetitors.length} конкурентами и применена стратегия "${strategy.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      // Показываем уведомление об успешном сохранении только связей
      toast({
        title: 'Связи сохранены',
        description: `Товар "${product.title}" связан с ${linkedCompetitors.length} конкурентами`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Обработчик обновления данных
  const handleRefresh = () => {
    loadProducts();
    loadProductStats();
  };

  // Обработчик перехода к настройкам API
  const handleGoToApiSettings = () => {
    navigate('/ozon-api-settings');
  };

  // Если API не настроен, показываем предупреждение, но не блокируем доступ к странице
  const apiWarning = !isOzonApiConfigured && (
    <Alert
      status="warning"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      p={4}
      mb={6}
      borderRadius="lg"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        API Ozon не настроено
      </AlertTitle>
      <AlertDescription maxWidth="md">
        Для отображения ваших товаров необходимо настроить подключение к API Ozon.
        Перейдите в настройки API, чтобы указать учетные данные.
      </AlertDescription>
      <Button
        colorScheme="blue"
        mt={4}
        onClick={handleGoToApiSettings}
      >
        Настроить API
      </Button>
    </Alert>
  );

  // Добавляем состояние для переключения между моковыми данными и API
  const [useApiMode, setUseApiMode] = useState<boolean>(false);

  // Обработчик переключения режима API
  const handleToggleApiMode = () => {
    setUseApiMode(!useApiMode);
  };

  return (
    <Container maxW="container.xl" py={8}>
      {/* Показываем предупреждение, если API не настроено */}
      {apiWarning}

      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        gap={4}
      >
        <VStack align="flex-start" spacing={1}>
          <Heading as="h1" size="xl">Мои товары</Heading>
          <Text color="gray.500" fontSize="md">Управление товарами, размещенными на маркетплейсе Ozon</Text>
        </VStack>

        <HStack spacing={2}>
          {/* Переключатель режима API */}
          <Flex align="center" mr={2}>
            <Text fontSize="sm" mr={2}>Режим API</Text>
            <Switch
              isChecked={useApiMode}
              onChange={handleToggleApiMode}
              isDisabled={!isOzonApiConfigured}
              colorScheme="blue"
            />
          </Flex>

          <Tooltip label="Обновить данные">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Обновить данные"
              variant="outline"
              onClick={handleRefresh}
              isLoading={isLoading}
            />
          </Tooltip>

          <Tooltip label="Экспорт товаров">
            <IconButton
              icon={<DownloadIcon />}
              aria-label="Экспорт товаров"
              variant="outline"
            />
          </Tooltip>

          <Button
            colorScheme="blue"
            leftIcon={<SettingsIcon />}
            onClick={handleGoToApiSettings}
          >
            Настройки API
          </Button>
        </HStack>
      </Flex>

      {/* Статистика */}
      {stats && (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
          <Stat
            bg={statBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
          >
            <StatLabel>Всего товаров</StatLabel>
            <StatNumber>{stats.totalProducts}</StatNumber>
            <StatHelpText>
              Средняя цена: {stats.averagePrice.toLocaleString('ru-RU')} ₽
            </StatHelpText>
          </Stat>

          <Stat
            bg={statBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
          >
            <StatLabel>Активных товаров</StatLabel>
            <StatNumber>{stats.byStatus['active'] || 0}</StatNumber>
            <StatHelpText>
              {stats.totalProducts > 0
                ? ((stats.byStatus['active'] || 0) / stats.totalProducts * 100).toFixed(1)
                : 0}% от общего числа
            </StatHelpText>
          </Stat>

          <Stat
            bg={statBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
          >
            <StatLabel>Со стратегией</StatLabel>
            <StatNumber>{stats.withStrategy}</StatNumber>
            <StatHelpText>
              {stats.totalProducts > 0
                ? (stats.withStrategy / stats.totalProducts * 100).toFixed(1)
                : 0}% от общего числа
            </StatHelpText>
          </Stat>

          <Stat
            bg={statBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
          >
            <StatLabel>Нет в наличии</StatLabel>
            <StatNumber>{stats.outOfStock}</StatNumber>
            <StatHelpText>
              {stats.totalProducts > 0
                ? (stats.outOfStock / stats.totalProducts * 100).toFixed(1)
                : 0}% от общего числа
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      {/* Панель поиска и фильтров */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        mb={6}
        gap={4}
        p={4}
        bg={cardBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <InputGroup maxW={{ base: '100%', md: '400px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </InputGroup>

        <HStack spacing={2}>
          <Button
            leftIcon={<FaFilter />}
            variant="outline"
            onClick={onFilterDrawerOpen}
          >
            Фильтры
            {Object.keys(filters).length > 2 && (
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {Object.keys(filters).length - 2}
              </Badge>
            )}
          </Button>

          <Tooltip label="Сбросить все фильтры">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Сбросить фильтры"
              variant="ghost"
              onClick={handleResetFilters}
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Сообщение об ошибке */}
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Ошибка!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}



      {/* Список товаров */}
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      ) : (
        <ProductListSimple
          onSelectProduct={handleSelectProduct}
          onApplyStrategy={handleApplyStrategy}
          onLinkCompetitors={handleLinkCompetitors}
        />
      )}

      {/* Ящик с фильтрами */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        placement="right"
        onClose={onFilterDrawerClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Фильтры товаров</DrawerHeader>

          <DrawerBody>
            {/* Содержимое фильтров */}
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Поиск</Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Название, SKU, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Box>

              {/* Другие фильтры */}
              {/* ... */}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleResetFilters}>
              Сбросить
            </Button>
            <Button colorScheme="blue" onClick={handleApplyFilters}>
              Применить
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Модальное окно с деталями товара */}
      <Modal
        isOpen={isProductDetailOpen}
        onClose={onProductDetailClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Детали товара</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <Box>
                {/* Детали товара */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box
                    width={{ base: '100%', md: '200px' }}
                    height={{ base: '200px', md: '200px' }}
                    bg="gray.100"
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                  >
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Flex
                        justify="center"
                        align="center"
                        height="100%"
                        color="gray.500"
                      >
                        Нет изображения
                      </Flex>
                    )}
                  </Box>

                  <Box flex="1">
                    <Heading size="md" mb={2}>{selectedProduct.title}</Heading>

                    <HStack spacing={2} mb={2}>
                      <Badge colorScheme="blue">{selectedProduct.category}</Badge>
                      <Badge
                        colorScheme={
                          selectedProduct.status === 'active' ? 'green' :
                          selectedProduct.status === 'pending' ? 'yellow' :
                          'red'
                        }
                      >
                        {selectedProduct.status}
                      </Badge>
                    </HStack>

                    <Text fontSize="2xl" fontWeight="bold" color="blue.500" mb={2}>
                      {selectedProduct.price.current.toLocaleString('ru-RU')} ₽
                    </Text>

                    {selectedProduct.price.old && (
                      <Text fontSize="md" textDecoration="line-through" color="gray.500" mb={2}>
                        {selectedProduct.price.old.toLocaleString('ru-RU')} ₽
                      </Text>
                    )}

                    <HStack spacing={4} mt={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.500">В наличии</Text>
                        <Text fontWeight="bold">{selectedProduct.stock.available} шт.</Text>
                      </Box>

                      <Box>
                        <Text fontSize="sm" color="gray.500">Продано</Text>
                        <Text fontWeight="bold">{selectedProduct.sales?.total || 0} шт.</Text>
                      </Box>

                      <Box>
                        <Text fontSize="sm" color="gray.500">Рейтинг</Text>
                        <Text fontWeight="bold">
                          {selectedProduct.rating?.value || 0} ({selectedProduct.rating?.count || 0})
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                </Flex>

                <Tabs mt={6} colorScheme="blue">
                  <TabList>
                    <Tab>Информация</Tab>
                    <Tab>Цены конкурентов</Tab>
                    <Tab>История цен</Tab>
                    <Tab>Стратегия</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <Text>{selectedProduct.description || 'Описание отсутствует'}</Text>
                    </TabPanel>
                    <TabPanel>
                      {selectedProduct.linkedCompetitors && selectedProduct.linkedCompetitors.length > 0 ? (
                        <CompetitorPricesTable
                          competitorPrices={selectedProduct.linkedCompetitors.map(comp => ({
                            id: comp.id,
                            competitorName: comp.competitorName,
                            price: comp.price,
                            url: comp.url,
                            lastUpdated: comp.lastUpdated || new Date().toISOString(),
                            marketplace: comp.url?.includes('ozon.ru') ? 'Ozon' :
                                       comp.url?.includes('wildberries.ru') ? 'Wildberries' :
                                       comp.url?.includes('aliexpress.ru') ? 'AliExpress' :
                                       comp.url?.includes('market.yandex.ru') ? 'Яндекс.Маркет' : 'Другой'
                          }))}
                          currentPrice={selectedProduct.price.current}
                        />
                      ) : (
                        <MockDataDisplay
                          type="competitors"
                          productTitle={selectedProduct.title}
                          currentPrice={selectedProduct.price.current}
                          onAction={() => handleLinkCompetitors(selectedProduct.id)}
                        />
                      )}
                    </TabPanel>
                    <TabPanel>
                      <PriceHistoryChart productId={selectedProduct.id} />
                    </TabPanel>
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {selectedProduct.appliedStrategyId ? (
                          <Box>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                              Применена стратегия ценообразования
                            </Text>
                            <Badge colorScheme="green" p={2} borderRadius="md">
                              Стратегия ID: {selectedProduct.appliedStrategyId}
                            </Badge>
                            <Text mt={2} color="gray.600">
                              Автоматическое ценообразование активно
                            </Text>
                          </Box>
                        ) : (
                          <MockDataDisplay
                            type="strategy"
                            productTitle={selectedProduct.title}
                            currentPrice={selectedProduct.price.current}
                            onAction={() => handleApplyStrategy(selectedProduct.id)}
                          />
                        )}

                        {selectedProduct.linkedCompetitors && selectedProduct.linkedCompetitors.length > 0 && (
                          <PricingRecommendations
                            product={selectedProduct}
                            competitors={selectedProduct.linkedCompetitors}
                          />
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onProductDetailClose}>
              Закрыть
            </Button>
            <Button colorScheme="blue">
              Редактировать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для связывания товара с конкурентами */}
      {competitorLinkingProduct ? (
        <>
          {console.log('Рендеринг CompetitorLinkingModal:', {
            competitorLinkingProduct: competitorLinkingProduct.title,
            isCompetitorLinkingOpen
          })}
          <CompetitorLinkingModal
            isOpen={isCompetitorLinkingOpen}
            onClose={handleCompetitorLinkingClose}
            product={competitorLinkingProduct}
            onSave={handleSaveCompetitorLinks}
          />
        </>
      ) : (
        console.log('competitorLinkingProduct не определен, модальное окно не отображается')
      )}
    </Container>
  );
}
