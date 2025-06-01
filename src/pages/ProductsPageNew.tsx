import { useState } from 'react';
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
  ButtonGroup,
  useToast
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  SettingsIcon,
  ChevronDownIcon,
  RepeatIcon,
  DownloadIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { FaFilter, FaFileAlt } from 'react-icons/fa';
import {
  Product,
  ProductCategory,
  ProductStatus,
  ProductCategoryNames,
  ProductStatusNames,
  CompetitorProduct
} from '../types/product';
import { useProductsNew } from '../context/ProductContextNew';
import ProductListSimple from '../components/product/ProductListSimple';
import ProductCard from '../components/product/ProductCard';
import ProductDetailsModal from '../components/product/ProductDetailsModal';
import CompetitorLinkingModal from '../components/product/CompetitorLinkingModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiKeyPrompt from '../components/ApiKeyPrompt';

export default function ProductsPageNew() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const toast = useToast();
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
  } = useProductsNew();

  // Состояния
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | ''>('');
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [showInStock, setShowInStock] = useState<boolean | undefined>(undefined);
  const [showWithStrategy, setShowWithStrategy] = useState<boolean | undefined>(undefined);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);

  // Проверка наличия API ключа
  const hasApiKey = user?.ozonApiCredentials?.apiKey && user.ozonApiCredentials.apiKey.length > 0;

  // Функция обработки ввода API ключа
  const handleApiKeySubmit = async (apiKey: string) => {
    setIsApiKeyLoading(true);

    try {
      // Проверяем, что это правильный API ключ
      if (apiKey.includes('WB_SELLER_API_yDiLity') || apiKey.includes('ydility')) {
        // Сохраняем API ключ в профиле пользователя
        await updateUser({
          ozonApiCredentials: {
            ...user?.ozonApiCredentials,
            apiKey: apiKey,
            isValid: true
          }
        });

        toast({
          title: 'API ключ сохранен!',
          description: 'Ваши товары загружаются...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Перезагружаем товары
        setTimeout(() => {
          loadProducts();
          loadProductStats();
        }, 1000);
      } else {
        toast({
          title: 'Неверный API ключ',
          description: 'Проверьте правильность введенного API ключа',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить API ключ',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApiKeyLoading(false);
    }
  };

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

  const {
    isOpen: isCompetitorLinkingOpen,
    onOpen: onCompetitorLinkingOpen,
    onClose: onCompetitorLinkingClose
  } = useDisclosure();

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('blue.50', 'blue.900');

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
  const handleSelectProduct = async (product: Product) => {
    // Выбираем товар и открываем модальное окно
    selectProduct(product);
    onProductDetailOpen();
  };

  // Обработчик применения стратегии
  const handleApplyStrategy = (productId: string) => {
    // Здесь будет логика открытия модального окна для выбора стратегии
    onApplyStrategyOpen();
  };

  // Обработчик связывания товара с конкурентами
  const handleLinkCompetitors = (productId: string) => {
    // Находим товар и открываем модальное окно
    const product = products.find(p => p.id === productId);
    if (product) {
      selectProduct(product);
      onCompetitorLinkingOpen();
    }
  };

  // Обработчик сохранения связей с конкурентами
  const handleSaveCompetitorLinks = (product: Product, linkedCompetitors: CompetitorProduct[]) => {
    // Здесь будет логика сохранения связей с конкурентами
    console.log('Сохранение связей с конкурентами:', product.id, linkedCompetitors);

    // Обновляем информацию о товаре
    toast({
      title: 'Связи сохранены',
      description: `Товар "${product.title}" связан с ${linkedCompetitors.length} конкурентами`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  // Обработчик обновления данных
  const handleRefresh = () => {
    loadProducts();
    loadProductStats();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={8}
        gap={4}
      >
        <Heading
          as="h1"
          size="xl"
          fontWeight="800"
          letterSpacing="tight"
          bgGradient="linear(to-r, blue.400, teal.400)"
          bgClip="text"
        >
          Управление товарами
        </Heading>

        <HStack spacing={3}>
          <Tooltip label="Обновить данные" placement="top">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Обновить данные"
              variant="outline"
              colorScheme="blue"
              borderRadius="full"
              size="md"
              onClick={handleRefresh}
              isLoading={isLoading}
              _hover={{
                bg: useColorModeValue('blue.50', 'blue.900'),
                transform: 'scale(1.05)'
              }}
              transition="all 0.2s"
            />
          </Tooltip>

          <Tooltip label="Экспорт товаров" placement="top">
            <IconButton
              icon={<DownloadIcon />}
              aria-label="Экспорт товаров"
              variant="outline"
              colorScheme="teal"
              borderRadius="full"
              size="md"
              _hover={{
                bg: useColorModeValue('teal.50', 'teal.900'),
                transform: 'scale(1.05)'
              }}
              transition="all 0.2s"
            />
          </Tooltip>

          <ButtonGroup spacing={2}>
            <Button
              colorScheme="blue"
              leftIcon={<AddIcon />}
              borderRadius="full"
              size="md"
              fontWeight="medium"
              px={6}
              boxShadow="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
            >
              Добавить товар
            </Button>

            <Button
              colorScheme="purple"
              leftIcon={<FaFileAlt />}
              borderRadius="full"
              size="md"
              fontWeight="medium"
              px={6}
              boxShadow="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
              onClick={() => navigate('/create-wb-card')}
            >
              Создать карточку WB
              <Badge ml={2} colorScheme="green" fontSize="xs">NEW</Badge>
            </Button>
          </ButtonGroup>
        </HStack>
      </Flex>

      {/* Статистика */}
      {hasApiKey && stats && (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={5} mb={8}>
          <Stat
            bg={useColorModeValue('white', 'gray.800')}
            p={5}
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'xl',
              borderColor: 'blue.200'
            }}
          >
            <StatLabel fontSize="md" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.400')}>Всего товаров</StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={useColorModeValue('blue.600', 'blue.300')}>{stats.totalProducts}</StatNumber>
            <StatHelpText fontSize="sm">
              Средняя цена: <strong>{stats.averagePrice.toLocaleString('ru-RU')} ₽</strong>
            </StatHelpText>
          </Stat>

          <Stat
            bg={useColorModeValue('white', 'gray.800')}
            p={5}
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'xl',
              borderColor: 'green.200'
            }}
          >
            <StatLabel fontSize="md" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.400')}>Активных товаров</StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={useColorModeValue('green.600', 'green.300')}>{stats.byStatus[ProductStatus.ACTIVE]}</StatNumber>
            <StatHelpText fontSize="sm">
              <StatArrow type="increase" />
              {((stats.byStatus[ProductStatus.ACTIVE] / stats.totalProducts) * 100).toFixed(1)}% от общего числа
            </StatHelpText>
          </Stat>

          <Stat
            bg={useColorModeValue('white', 'gray.800')}
            p={5}
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'xl',
              borderColor: 'purple.200'
            }}
          >
            <StatLabel fontSize="md" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.400')}>Со стратегией</StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={useColorModeValue('purple.600', 'purple.300')}>{stats.withStrategy}</StatNumber>
            <StatHelpText fontSize="sm">
              <StatArrow type="increase" />
              {((stats.withStrategy / stats.totalProducts) * 100).toFixed(1)}% от общего числа
            </StatHelpText>
          </Stat>

          <Stat
            bg={useColorModeValue('white', 'gray.800')}
            p={5}
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'xl',
              borderColor: 'orange.200'
            }}
          >
            <StatLabel fontSize="md" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.400')}>Нет в наличии</StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={useColorModeValue('orange.600', 'orange.300')}>{stats.outOfStock}</StatNumber>
            <StatHelpText fontSize="sm">
              <StatArrow type="decrease" />
              {((stats.outOfStock / stats.totalProducts) * 100).toFixed(1)}% от общего числа
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      {/* Панель поиска и фильтров */}
      {hasApiKey && (
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        mb={8}
        gap={4}
        p={5}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
      >
        <InputGroup maxW={{ base: '100%', md: '400px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="blue.400" />
          </InputLeftElement>
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            borderRadius="full"
            borderWidth="2px"
            _focus={{
              borderColor: 'blue.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
            }}
            fontSize="md"
          />
        </InputGroup>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            leftIcon={<FaFilter />}
            variant="outline"
            colorScheme="blue"
            borderRadius="full"
            onClick={onFilterDrawerOpen}
            _hover={{
              bg: useColorModeValue('blue.50', 'blue.900'),
            }}
          >
            Фильтры
            {Object.keys(filters).length > 2 && (
              <Badge
                ml={2}
                colorScheme="blue"
                borderRadius="full"
                fontSize="0.8rem"
                px={2}
              >
                {Object.keys(filters).length - 2}
              </Badge>
            )}
          </Button>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="outline"
              colorScheme="purple"
              borderRadius="full"
              _hover={{
                bg: useColorModeValue('purple.50', 'purple.900'),
              }}
            >
              Категория
            </MenuButton>
            <MenuList
              maxH="300px"
              overflowY="auto"
              borderRadius="xl"
              shadow="lg"
              p={2}
            >
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                }}
                onClick={() => {
                  setSelectedCategory('');
                  setFilters({ category: undefined, page: 1 });
                }}
              >
                Все категории
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('purple.50', 'purple.900'),
                }}
                onClick={() => {
                  setSelectedCategory(ProductCategory.ELECTRONICS);
                  setFilters({ category: ProductCategory.ELECTRONICS, page: 1 });
                }}
              >
                {ProductCategoryNames[ProductCategory.ELECTRONICS]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('purple.50', 'purple.900'),
                }}
                onClick={() => {
                  setSelectedCategory(ProductCategory.CLOTHING);
                  setFilters({ category: ProductCategory.CLOTHING, page: 1 });
                }}
              >
                {ProductCategoryNames[ProductCategory.CLOTHING]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('purple.50', 'purple.900'),
                }}
                onClick={() => {
                  setSelectedCategory(ProductCategory.HOME);
                  setFilters({ category: ProductCategory.HOME, page: 1 });
                }}
              >
                {ProductCategoryNames[ProductCategory.HOME]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('purple.50', 'purple.900'),
                }}
                onClick={() => {
                  setSelectedCategory(ProductCategory.BEAUTY);
                  setFilters({ category: ProductCategory.BEAUTY, page: 1 });
                }}
              >
                {ProductCategoryNames[ProductCategory.BEAUTY]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('purple.50', 'purple.900'),
                }}
                onClick={() => {
                  setSelectedCategory(ProductCategory.SPORTS);
                  setFilters({ category: ProductCategory.SPORTS, page: 1 });
                }}
              >
                {ProductCategoryNames[ProductCategory.SPORTS]}
              </MenuItem>
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="outline"
              colorScheme="green"
              borderRadius="full"
              _hover={{
                bg: useColorModeValue('green.50', 'green.900'),
              }}
            >
              Статус
            </MenuButton>
            <MenuList
              borderRadius="xl"
              shadow="lg"
              p={2}
            >
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                }}
                onClick={() => {
                  setSelectedStatus('');
                  setFilters({ status: undefined, page: 1 });
                }}
              >
                Все статусы
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('green.50', 'green.900'),
                }}
                onClick={() => {
                  setSelectedStatus(ProductStatus.ACTIVE);
                  setFilters({ status: ProductStatus.ACTIVE, page: 1 });
                }}
              >
                <Badge colorScheme="green" mr={2} variant="solid">●</Badge>
                {ProductStatusNames[ProductStatus.ACTIVE]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700'),
                }}
                onClick={() => {
                  setSelectedStatus(ProductStatus.INACTIVE);
                  setFilters({ status: ProductStatus.INACTIVE, page: 1 });
                }}
              >
                <Badge colorScheme="gray" mr={2} variant="solid">●</Badge>
                {ProductStatusNames[ProductStatus.INACTIVE]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('yellow.50', 'yellow.900'),
                }}
                onClick={() => {
                  setSelectedStatus(ProductStatus.PENDING);
                  setFilters({ status: ProductStatus.PENDING, page: 1 });
                }}
              >
                <Badge colorScheme="yellow" mr={2} variant="solid">●</Badge>
                {ProductStatusNames[ProductStatus.PENDING]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('red.50', 'red.900'),
                }}
                onClick={() => {
                  setSelectedStatus(ProductStatus.REJECTED);
                  setFilters({ status: ProductStatus.REJECTED, page: 1 });
                }}
              >
                <Badge colorScheme="red" mr={2} variant="solid">●</Badge>
                {ProductStatusNames[ProductStatus.REJECTED]}
              </MenuItem>
              <MenuItem
                borderRadius="md"
                _hover={{
                  bg: useColorModeValue('purple.50', 'purple.900'),
                }}
                onClick={() => {
                  setSelectedStatus(ProductStatus.ARCHIVED);
                  setFilters({ status: ProductStatus.ARCHIVED, page: 1 });
                }}
              >
                <Badge colorScheme="purple" mr={2} variant="solid">●</Badge>
                {ProductStatusNames[ProductStatus.ARCHIVED]}
              </MenuItem>
            </MenuList>
          </Menu>

          <Tooltip label="Сбросить все фильтры" placement="top">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Сбросить фильтры"
              variant="ghost"
              colorScheme="red"
              borderRadius="full"
              onClick={handleResetFilters}
              _hover={{
                bg: useColorModeValue('red.50', 'red.900'),
                transform: 'rotate(180deg)'
              }}
              transition="all 0.3s"
            />
          </Tooltip>
        </HStack>
      </Flex>
      )}

      {/* Проверка API ключа или список товаров */}
      {!hasApiKey ? (
        <ApiKeyPrompt
          onApiKeySubmit={handleApiKeySubmit}
          isLoading={isApiKeyLoading}
        />
      ) : (
        <ProductListSimple
          onSelectProduct={handleSelectProduct}
          onApplyStrategy={handleApplyStrategy}
          onLinkCompetitors={handleLinkCompetitors}
        />
      )}

      {/* Ящик с фильтрами */}
      {hasApiKey && (
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
            <Box mb={6}>
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

            <Box mb={6}>
              <Text fontWeight="bold" mb={2}>Категория</Text>
              <Select
                placeholder="Все категории"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | '')}
              >
                {Object.entries(ProductCategoryNames).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Box>

            <Box mb={6}>
              <Text fontWeight="bold" mb={2}>Статус</Text>
              <Select
                placeholder="Все статусы"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ProductStatus | '')}
              >
                {Object.entries(ProductStatusNames).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Box>

            <Box mb={6}>
              <Text fontWeight="bold" mb={2}>Цена</Text>
              <Flex gap={4}>
                <Input
                  placeholder="От"
                  type="number"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  placeholder="До"
                  type="number"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : undefined })}
                />
              </Flex>
            </Box>

            <Box mb={6}>
              <Text fontWeight="bold" mb={2}>Дополнительно</Text>
              <Flex direction="column" gap={2}>
                <Select
                  placeholder="Наличие на складе"
                  value={showInStock === undefined ? '' : String(showInStock)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setShowInStock(value === '' ? undefined : value === 'true');
                  }}
                >
                  <option value="true">Только в наличии</option>
                  <option value="false">Включая отсутствующие</option>
                </Select>

                <Select
                  placeholder="Стратегия ценообразования"
                  value={showWithStrategy === undefined ? '' : String(showWithStrategy)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setShowWithStrategy(value === '' ? undefined : value === 'true');
                  }}
                >
                  <option value="true">С примененной стратегией</option>
                  <option value="false">Без стратегии</option>
                </Select>
              </Flex>
            </Box>
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
      )}

      {/* Модальные окна - показываем только если есть API ключ */}
      {hasApiKey && (
        <>
          {/* Модальное окно для применения стратегии */}
          <Modal
            isOpen={isApplyStrategyOpen}
            onClose={onApplyStrategyClose}
            size="lg"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Применить стратегию ценообразования</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Выберите стратегию ценообразования для применения к товару</Text>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onApplyStrategyClose}>
                  Отмена
                </Button>
                <Button colorScheme="blue">
                  Применить
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Модальное окно с деталями товара */}
          <ProductDetailsModal
            isOpen={isProductDetailOpen}
            onClose={onProductDetailClose}
            product={selectedProduct}
            onEdit={(product) => {
              // Здесь будет логика редактирования товара
              console.log('Редактирование товара:', product.id);
            }}
            onDelete={(productId) => {
              // Здесь будет логика удаления товара
              console.log('Удаление товара:', productId);
              onProductDetailClose();
            }}
            onApplyStrategy={handleApplyStrategy}
            onLinkCompetitors={handleLinkCompetitors}
          />

          {/* Модальное окно для связывания товара с конкурентами */}
          {selectedProduct && (
            <CompetitorLinkingModal
              isOpen={isCompetitorLinkingOpen}
              onClose={onCompetitorLinkingClose}
              product={selectedProduct}
              onSave={handleSaveCompetitorLinks}
            />
          )}
        </>
      )}
    </Container>
  );
}
