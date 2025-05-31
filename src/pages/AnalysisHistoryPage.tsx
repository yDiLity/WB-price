import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Flex,
  Spacer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  SimpleGrid,
  Divider,
  HStack,
  VStack,
  Tooltip,
  Tag,
  TagLabel,
  TagLeftIcon,
  Avatar,
  AvatarBadge,
  Progress,
  Collapse,
  Grid,
  GridItem,
  Image,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue
} from '@chakra-ui/react';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaCheck,
  FaHistory,
  FaChartLine,
  FaFilter,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaInfoCircle,
  FaTelegram,
  FaCalendarAlt,
  FaTag,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartBar,
  FaListAlt,
  FaTable,
  FaTh,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaRocket,
  FaClock
} from 'react-icons/fa';
import { analysisHistoryService, AnalysisHistory } from '../services/analysisHistoryService';
import { telegramService, NotificationType } from '../services/telegramService';
import { Product } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Инициализация ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

export default function AnalysisHistoryPage() {
  const toast = useToast();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isApplyOpen, onOpen: onApplyOpen, onClose: onApplyClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  // Основные состояния
  const [allHistory, setAllHistory] = useState<AnalysisHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AnalysisHistory[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Фильтры и сортировка
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'recommendedPrice'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Состояния загрузки
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Вид отображения
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'grid'>('cards');

  // Цвета и стили
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Адаптивность
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Загрузка истории анализа
  useEffect(() => {
    loadHistory();
  }, []);

  // Фильтрация и сортировка истории
  useEffect(() => {
    filterAndSortHistory();
  }, [searchTerm, productFilter, sortField, sortDirection, allHistory]);

  // Загрузка всей истории анализа
  const loadHistory = () => {
    setIsLoading(true);

    try {
      // Имитация задержки загрузки для демонстрации скелетона
      setTimeout(() => {
        const historyData = analysisHistoryService.getAllAnalysisHistory();

        // Преобразуем объект в массив
        const historyArray: AnalysisHistory[] = [];
        Object.keys(historyData).forEach(productId => {
          historyData[productId].forEach(item => {
            historyArray.push(item);
          });
        });

        setAllHistory(historyArray);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить историю анализа',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  // Фильтрация и сортировка истории
  const filterAndSortHistory = () => {
    if (allHistory.length === 0) {
      setFilteredHistory([]);
      return;
    }

    let filtered = [...allHistory];

    // Фильтрация по поисковому запросу
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.analysis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recommendedPrice.toString().includes(searchTerm)
      );
    }

    // Фильтрация по товару
    if (productFilter !== 'all') {
      filtered = filtered.filter(item => item.productId === productFilter);
    }

    // Сортировка
    filtered.sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.recommendedPrice - b.recommendedPrice
          : b.recommendedPrice - a.recommendedPrice;
      }
    });

    setFilteredHistory(filtered);
  };

  // Переключение развернутого состояния элемента
  const toggleItemExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Получение данных для графика
  const getChartData = (productId: string) => {
    const productHistory = allHistory.filter(item => item.productId === productId);

    // Сортируем по дате (от старых к новым)
    productHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: productHistory.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
      }),
      datasets: [
        {
          label: 'Рекомендуемая цена',
          data: productHistory.map(item => item.recommendedPrice),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Минимальная цена',
          data: productHistory.map(item => item.minPrice),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  };

  // Получение процента изменения цены
  const getPriceChangePercent = (oldPrice: number, newPrice: number) => {
    return ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
  };

  // Получение цвета для изменения цены
  const getPriceChangeColor = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) return 'green.500';
    if (newPrice < oldPrice) return 'red.500';
    return 'gray.500';
  };

  // Получение иконки для изменения цены
  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) return FaArrowUp;
    if (newPrice < oldPrice) return FaArrowDown;
    return FaEquals;
  };

  // Получение уникальных ID товаров
  const getUniqueProductIds = () => {
    const productIds = new Set<string>();
    allHistory.forEach(item => productIds.add(item.productId));
    return Array.from(productIds);
  };

  // Просмотр анализа
  const viewAnalysis = (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis);
    onViewOpen();
  };

  // Подготовка к удалению анализа
  const prepareDelete = (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis);
    onDeleteOpen();
  };

  // Удаление анализа
  const deleteAnalysis = async () => {
    if (!selectedAnalysis) return;

    setIsDeleting(true);

    try {
      const success = analysisHistoryService.deleteAnalysis(selectedAnalysis.id);

      if (success) {
        loadHistory();
        onDeleteClose();

        toast({
          title: 'Анализ удален',
          description: 'Запись об анализе успешно удалена из истории',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись об анализе',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Подготовка к применению цены
  const prepareApply = (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis);
    onApplyOpen();
  };

  // Применение рекомендуемой цены
  const applyRecommendedPrice = async () => {
    if (!selectedAnalysis) return;

    setIsApplying(true);

    try {
      const success = analysisHistoryService.markAnalysisAsApplied(selectedAnalysis.id);

      if (success) {
        loadHistory();
        onApplyClose();

        toast({
          title: 'Цена применена',
          description: `Рекомендуемая цена ${selectedAnalysis.recommendedPrice} ₽ успешно применена`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to apply recommended price');
      }
    } catch (error) {
      console.error('Error applying recommended price:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось применить рекомендуемую цену',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Отправка уведомления в Telegram
  const sendTelegramNotification = async (analysis: AnalysisHistory) => {
    if (!telegramService.isInitialized() || telegramService.getChatIds().length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Telegram-бот не настроен. Перейдите в настройки для настройки уведомлений.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsNotifying(true);

    try {
      // Создаем моковый товар для уведомления
      const mockProduct: Product = {
        id: analysis.productId,
        name: `Товар ${analysis.productId}`,
        currentPrice: analysis.recommendedPrice * 0.9, // Предполагаем, что текущая цена ниже рекомендуемой
      } as Product;

      const success = await telegramService.sendNotification({
        type: NotificationType.RECOMMENDATION,
        title: '💡 Рекомендация по цене',
        message: `Получена рекомендация по цене для товара "${mockProduct.name}" от ${new Date(analysis.date).toLocaleString()}.`,
        data: {
          productName: mockProduct.name,
          currentPrice: mockProduct.currentPrice,
          recommendedPrice: analysis.recommendedPrice,
          changePercent: ((analysis.recommendedPrice - mockProduct.currentPrice) / mockProduct.currentPrice * 100).toFixed(2)
        }
      });

      if (success) {
        toast({
          title: 'Уведомление отправлено',
          description: 'Уведомление успешно отправлено в Telegram',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить уведомление в Telegram',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsNotifying(false);
    }
  };

  // Очистка всей истории
  const clearAllHistory = () => {
    if (window.confirm('Вы уверены, что хотите очистить всю историю анализа? Это действие нельзя отменить.')) {
      analysisHistoryService.clearAllHistory();
      loadHistory();

      toast({
        title: 'История очищена',
        description: 'Вся история анализа успешно очищена',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.2xl" py={10}>
      {/* Заголовок и кнопки управления */}
      <Box
        bg={secondaryBg}
        p={8}
        borderRadius="xl"
        mb={8}
        boxShadow="md"
        position="relative"
        overflow="hidden"
        backgroundImage="linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)"
        backgroundSize="20px 20px"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="8px"
          bgGradient="linear(to-r, blue.400, purple.500, pink.400)"
        />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          mb={{ base: 6, md: 0 }}
        >
          <Box>
            <Heading
              as="h1"
              size="2xl"
              mb={2}
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              История анализа
            </Heading>
            <Text
              color={mutedTextColor}
              fontSize="lg"
              maxW="600px"
            >
              Просмотр и управление историей AI-анализа товаров. Отслеживайте рекомендации,
              применяйте цены и анализируйте динамику изменений.
            </Text>
          </Box>

          <Spacer />

          <HStack spacing={4} mt={{ base: 6, md: 0 }}>
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<FaFilter />}
                variant="outline"
                colorScheme="blue"
                size="lg"
                px={6}
                borderRadius="full"
                boxShadow="sm"
                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                Вид отображения
              </MenuButton>
              <MenuList borderRadius="xl" boxShadow="xl" p={2}>
                <MenuItem
                  icon={<FaListAlt size="18px" />}
                  onClick={() => setViewMode('cards')}
                  fontWeight={viewMode === 'cards' ? 'bold' : 'normal'}
                  color={viewMode === 'cards' ? 'blue.500' : undefined}
                  bg={viewMode === 'cards' ? 'blue.50' : undefined}
                  borderRadius="md"
                  p={3}
                  mb={1}
                >
                  Карточки
                </MenuItem>
                <MenuItem
                  icon={<FaTable size="18px" />}
                  onClick={() => setViewMode('table')}
                  fontWeight={viewMode === 'table' ? 'bold' : 'normal'}
                  color={viewMode === 'table' ? 'blue.500' : undefined}
                  bg={viewMode === 'table' ? 'blue.50' : undefined}
                  borderRadius="md"
                  p={3}
                  mb={1}
                >
                  Таблица
                </MenuItem>
                <MenuItem
                  icon={<FaTh size="18px" />}
                  onClick={() => setViewMode('grid')}
                  fontWeight={viewMode === 'grid' ? 'bold' : 'normal'}
                  color={viewMode === 'grid' ? 'blue.500' : undefined}
                  bg={viewMode === 'grid' ? 'blue.50' : undefined}
                  borderRadius="md"
                  p={3}
                >
                  Сетка
                </MenuItem>
              </MenuList>
            </Menu>

            <Button
              leftIcon={<FaChartLine size="18px" />}
              colorScheme="blue"
              onClick={onDrawerOpen}
              size="lg"
              px={6}
              borderRadius="full"
              boxShadow="sm"
              _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              Статистика и графики
            </Button>

            <Button
              leftIcon={<FaTrash size="18px" />}
              colorScheme="red"
              variant="outline"
              onClick={clearAllHistory}
              isDisabled={allHistory.length === 0 || isLoading}
              size="lg"
              px={6}
              borderRadius="full"
              boxShadow="sm"
              _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              Очистить историю
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Фильтры и поиск */}
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        boxShadow="md"
        mb={8}
        borderRadius="xl"
        overflow="hidden"
        position="relative"
      >
        <Box
          bg="linear-gradient(90deg, #3182CE 0%, #805AD5 100%)"
          py={3}
          px={6}
          color="white"
          fontWeight="bold"
        >
          <Flex align="center">
            <FaFilter size="18px" />
            <Text ml={3} fontSize="lg">Фильтры и поиск</Text>
          </Flex>
        </Box>

        <CardBody p={6}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="flex-end">
            <Box flex="1">
              <Text mb={2} fontWeight="medium" fontSize="sm" color={mutedTextColor}>Поиск по анализу</Text>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none" h="full" pl={2}>
                  <FaSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Поиск по тексту анализа или ID товара"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="lg"
                  pl={12}
                  boxShadow="sm"
                  _focus={{ boxShadow: "md", borderColor: "blue.400" }}
                  fontSize="md"
                />
              </InputGroup>
            </Box>

            <Box minW={{ base: '100%', md: '250px' }}>
              <Text mb={2} fontWeight="medium" fontSize="sm" color={mutedTextColor}>Фильтр по товару</Text>
              <Select
                placeholder="Выберите товар"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                size="lg"
                borderRadius="lg"
                icon={<FaTag />}
                boxShadow="sm"
                _focus={{ boxShadow: "md", borderColor: "blue.400" }}
                fontSize="md"
              >
                <option value="all">Все товары</option>
                {getUniqueProductIds().map(id => (
                  <option key={id} value={id}>Товар {id}</option>
                ))}
              </Select>
            </Box>

            <Box minW={{ base: '100%', md: '300px' }}>
              <Text mb={2} fontWeight="medium" fontSize="sm" color={mutedTextColor}>Сортировка</Text>
              <Flex>
                <Select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as 'date' | 'recommendedPrice')}
                  size="lg"
                  borderRadius="lg"
                  icon={<FaSort />}
                  boxShadow="sm"
                  _focus={{ boxShadow: "md", borderColor: "blue.400" }}
                  fontSize="md"
                  mr={2}
                >
                  <option value="date">По дате</option>
                  <option value="recommendedPrice">По цене</option>
                </Select>

                <Tooltip label={sortDirection === 'desc' ? 'По убыванию' : 'По возрастанию'}>
                  <IconButton
                    aria-label="Изменить порядок сортировки"
                    icon={sortDirection === 'desc' ? <FaSortAmountDown size="20px" /> : <FaSortAmountUp size="20px" />}
                    onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="lg"
                    size="lg"
                    boxShadow="sm"
                    _hover={{ boxShadow: "md" }}
                  />
                </Tooltip>
              </Flex>
            </Box>
          </Stack>

          {searchTerm && (
            <Box mt={4} p={3} bg="blue.50" borderRadius="lg">
              <Flex align="center">
                <FaInfoCircle color="#3182CE" />
                <Text ml={2} color="blue.700">
                  Найдено результатов: <b>{filteredHistory.length}</b> из {allHistory.length}
                </Text>
              </Flex>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Заголовок для выбранного режима просмотра */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        bg={secondaryBg}
        p={4}
        borderRadius="xl"
        boxShadow="sm"
      >
        <HStack>
          <Box
            bg={accentColor}
            color="white"
            p={2}
            borderRadius="lg"
            boxShadow="sm"
          >
            {viewMode === 'cards' && <FaListAlt size="20px" />}
            {viewMode === 'table' && <FaTable size="20px" />}
            {viewMode === 'grid' && <FaTh size="20px" />}
          </Box>
          <Text fontWeight="bold" fontSize="lg">
            {viewMode === 'cards' && 'Просмотр в виде карточек'}
            {viewMode === 'table' && 'Просмотр в виде таблицы'}
            {viewMode === 'grid' && 'Просмотр в виде сетки'}
          </Text>
        </HStack>

        <HStack>
          <Text color={mutedTextColor} fontSize="sm">
            Всего записей: <b>{filteredHistory.length}</b>
          </Text>

          <Badge
            colorScheme="purple"
            fontSize="sm"
            borderRadius="full"
            px={3}
            py={1}
          >
            {sortField === 'date' ? 'Сортировка по дате' : 'Сортировка по цене'}
          </Badge>
        </HStack>
      </Flex>

      {/* Содержимое страницы */}
      {isLoading ? (
        // Скелетон загрузки
        <VStack spacing={6} align="stretch">
          {[1, 2, 3].map(i => (
            <Card key={i} borderRadius="xl" overflow="hidden" boxShadow="md">
              <CardHeader bg={secondaryBg} py={4}>
                <Flex justify="space-between">
                  <HStack>
                    <Skeleton height="40px" width="40px" borderRadius="full" />
                    <Skeleton height="40px" width="200px" />
                  </HStack>
                  <Skeleton height="30px" width="100px" borderRadius="full" />
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Stack spacing={4}>
                      <Skeleton height="30px" />
                      <Skeleton height="50px" />
                      <Skeleton height="30px" width="80%" />
                    </Stack>
                  </Box>
                  <Box>
                    <Stack spacing={4}>
                      <Skeleton height="100px" borderRadius="lg" />
                      <Skeleton height="40px" />
                    </Stack>
                  </Box>
                </SimpleGrid>
              </CardBody>
              <CardFooter bg={secondaryBg}>
                <Skeleton height="45px" width="100%" />
              </CardFooter>
            </Card>
          ))}
        </VStack>
      ) : filteredHistory.length > 0 ? (
        <>
          {/* Вид "Карточки" */}
          {viewMode === 'cards' && (
            <VStack spacing={6} align="stretch">
              {filteredHistory.map(item => (
                <Card
                  key={item.id}
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                  position="relative"
                >
                  {/* Цветная полоса сверху карточки */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="4px"
                    bg={item.appliedToProduct ? "green.500" : "blue.500"}
                  />

                  <CardHeader bg={secondaryBg} py={4}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Avatar
                          size="md"
                          bg={accentColor}
                          icon={<FaShoppingCart fontSize="1.2rem" />}
                          boxShadow="md"
                        >
                          {item.appliedToProduct && (
                            <AvatarBadge boxSize="1.2em" bg="green.500" borderWidth="2px" />
                          )}
                        </Avatar>
                        <Box>
                          <Heading size="md" fontWeight="bold">Товар {item.productId}</Heading>
                          <HStack spacing={4} mt={1}>
                            <Text fontSize="sm" color={mutedTextColor}>
                              <FaCalendarAlt style={{ display: 'inline', marginRight: '4px' }} />
                              {new Date(item.date).toLocaleString()}
                            </Text>
                            {item.competitorsData && (
                              <Tag size="sm" colorScheme="purple" borderRadius="full" variant="subtle">
                                <TagLeftIcon as={FaInfoCircle} boxSize="12px" />
                                <TagLabel>Конкурентов: {item.competitorsData.count}</TagLabel>
                              </Tag>
                            )}
                          </HStack>
                        </Box>
                      </HStack>

                      <Badge
                        colorScheme={item.appliedToProduct ? 'green' : 'blue'}
                        borderRadius="full"
                        px={3}
                        py={1.5}
                        fontSize="md"
                        boxShadow="sm"
                        display="flex"
                        alignItems="center"
                      >
                        {item.appliedToProduct ? (
                          <>
                            <FaCheckCircle style={{ marginRight: '6px' }} />
                            Применено
                          </>
                        ) : (
                          <>
                            <FaTimesCircle style={{ marginRight: '6px' }} />
                            Не применено
                          </>
                        )}
                      </Badge>
                    </Flex>
                  </CardHeader>

                  <CardBody p={6}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Box>
                        <StatGroup
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          p={4}
                          borderRadius="lg"
                          boxShadow="sm"
                        >
                          <Stat>
                            <StatLabel fontSize="md" fontWeight="medium">Рекомендуемая цена</StatLabel>
                            <StatNumber fontSize="2xl" color={accentColor}>{item.recommendedPrice.toLocaleString()} ₽</StatNumber>
                            {item.competitorsData && (
                              <StatHelpText>
                                <StatArrow
                                  type={item.recommendedPrice > item.competitorsData.avgPrice ? 'increase' : 'decrease'}
                                />
                                {Math.abs(((item.recommendedPrice - item.competitorsData.avgPrice) / item.competitorsData.avgPrice * 100)).toFixed(1)}% от средней
                              </StatHelpText>
                            )}
                          </Stat>

                          <Stat>
                            <StatLabel fontSize="md" fontWeight="medium">Минимальная цена</StatLabel>
                            <StatNumber fontSize="2xl">{item.minPrice.toLocaleString()} ₽</StatNumber>
                            <StatHelpText>
                              Минимальный порог
                            </StatHelpText>
                          </Stat>
                        </StatGroup>

                        {item.competitorsData && (
                          <Box mt={5} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} boxShadow="sm">
                            <Flex justify="space-between" align="center" mb={3}>
                              <Text fontWeight="bold" fontSize="md">Данные о конкурентах</Text>
                              <Badge colorScheme="blue" borderRadius="full">
                                {item.competitorsData.count} конкурентов
                              </Badge>
                            </Flex>

                            <SimpleGrid columns={2} spacing={4}>
                              <Box>
                                <Text fontSize="sm" color={mutedTextColor}>Средняя цена</Text>
                                <Text fontWeight="bold">{item.competitorsData.avgPrice.toLocaleString()} ₽</Text>
                              </Box>
                              <Box>
                                <Text fontSize="sm" color={mutedTextColor}>Мин. цена конкурента</Text>
                                <Text fontWeight="bold">{item.competitorsData.minPrice.toLocaleString()} ₽</Text>
                              </Box>
                            </SimpleGrid>
                          </Box>
                        )}
                      </Box>

                      <Box>
                        <Collapse in={expandedItems[item.id]} animateOpacity>
                          <Box
                            p={4}
                            bg={secondaryBg}
                            borderRadius="lg"
                            fontSize="md"
                            maxHeight="200px"
                            overflowY="auto"
                            mb={4}
                            boxShadow="sm"
                            borderWidth="1px"
                            borderColor={borderColor}
                          >
                            <Flex align="center" mb={2}>
                              <FaChartLine color={accentColor} />
                              <Text fontWeight="bold" ml={2}>Фрагмент анализа:</Text>
                            </Flex>
                            <Text>{item.analysis.substring(0, 300)}...</Text>
                          </Box>
                        </Collapse>

                        <Button
                          size="md"
                          variant="outline"
                          width="full"
                          onClick={() => toggleItemExpanded(item.id)}
                          leftIcon={expandedItems[item.id] ? <FaEye /> : <FaEye />}
                          mb={4}
                          borderRadius="lg"
                          boxShadow="sm"
                          _hover={{ boxShadow: "md" }}
                        >
                          {expandedItems[item.id] ? 'Скрыть анализ' : 'Показать анализ'}
                        </Button>

                        <SimpleGrid columns={2} spacing={4}>
                          <Button
                            colorScheme="blue"
                            leftIcon={<FaEye />}
                            size="md"
                            onClick={() => viewAnalysis(item)}
                            borderRadius="lg"
                            boxShadow="sm"
                            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                            transition="all 0.2s"
                          >
                            Просмотреть анализ
                          </Button>

                          {!item.appliedToProduct ? (
                            <Button
                              colorScheme="green"
                              leftIcon={<FaCheck />}
                              size="md"
                              onClick={() => prepareApply(item)}
                              borderRadius="lg"
                              boxShadow="sm"
                              _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                              transition="all 0.2s"
                            >
                              Применить цену
                            </Button>
                          ) : (
                            <Button
                              colorScheme="telegram"
                              leftIcon={<FaTelegram />}
                              size="md"
                              onClick={() => sendTelegramNotification(item)}
                              isLoading={isNotifying && selectedAnalysis?.id === item.id}
                              borderRadius="lg"
                              boxShadow="sm"
                              _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                              transition="all 0.2s"
                            >
                              Отправить
                            </Button>
                          )}
                        </SimpleGrid>
                      </Box>
                    </SimpleGrid>
                  </CardBody>

                  <CardFooter
                    bg={secondaryBg}
                    borderTop="1px"
                    borderColor={borderColor}
                    py={3}
                    px={6}
                  >
                    <Flex justify="space-between" align="center" width="100%">
                      <Text fontSize="sm" color={mutedTextColor}>
                        ID: {item.id.substring(0, 8)}...
                      </Text>

                      <Tooltip label="Удалить запись">
                        <IconButton
                          aria-label="Удалить"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => prepareDelete(item)}
                        />
                      </Tooltip>
                    </Flex>
                  </CardFooter>
                </Card>
              ))}
            </VStack>
          )}

          {/* Вид "Таблица" */}
          {viewMode === 'table' && (
            <Box
              overflowX="auto"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Table variant="striped" colorScheme="blue">
                <Thead bg={accentColor}>
                  <Tr>
                    <Th color="white">Дата</Th>
                    <Th color="white">Товар</Th>
                    <Th color="white" isNumeric>Рекомендуемая цена</Th>
                    <Th color="white" isNumeric>Мин. цена</Th>
                    <Th color="white">Статус</Th>
                    <Th color="white">Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredHistory.map(item => (
                    <Tr key={item.id}>
                      <Td>{new Date(item.date).toLocaleString()}</Td>
                      <Td>
                        <HStack>
                          <Avatar
                            size="xs"
                            bg={accentColor}
                            icon={<FaShoppingCart fontSize="0.7rem" />}
                          />
                          <Text>Товар {item.productId}</Text>
                        </HStack>
                      </Td>
                      <Td isNumeric fontWeight="bold">{item.recommendedPrice.toLocaleString()} ₽</Td>
                      <Td isNumeric>{item.minPrice.toLocaleString()} ₽</Td>
                      <Td>
                        {item.appliedToProduct ? (
                          <Badge colorScheme="green" borderRadius="full" px={2}>
                            <HStack spacing={1}>
                              <FaCheckCircle />
                              <Text>Применено</Text>
                            </HStack>
                          </Badge>
                        ) : (
                          <Badge colorScheme="blue" borderRadius="full" px={2}>
                            <HStack spacing={1}>
                              <FaTimesCircle />
                              <Text>Не применено</Text>
                            </HStack>
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Popover trigger="hover" placement="top">
                            <PopoverTrigger>
                              <IconButton
                                aria-label="Просмотреть"
                                icon={<FaEye />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => viewAnalysis(item)}
                              />
                            </PopoverTrigger>
                            <PopoverContent width="300px">
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverHeader fontWeight="bold">Предпросмотр анализа</PopoverHeader>
                              <PopoverBody>
                                <Text noOfLines={3}>{item.analysis}</Text>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>

                          {!item.appliedToProduct && (
                            <IconButton
                              aria-label="Применить"
                              icon={<FaCheck />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => prepareApply(item)}
                            />
                          )}

                          <IconButton
                            aria-label="Отправить в Telegram"
                            icon={<FaTelegram />}
                            size="sm"
                            colorScheme="telegram"
                            onClick={() => sendTelegramNotification(item)}
                            isLoading={isNotifying && selectedAnalysis?.id === item.id}
                          />

                          <IconButton
                            aria-label="Удалить"
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => prepareDelete(item)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Вид "Сетка" */}
          {viewMode === 'grid' && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredHistory.map(item => (
                <Card
                  key={item.id}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  transition="all 0.2s"
                  _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                >
                  <Box
                    bg={accentColor}
                    py={2}
                    px={4}
                    color="white"
                    fontWeight="bold"
                  >
                    <Flex justify="space-between" align="center">
                      <Text>Товар {item.productId}</Text>
                      {item.appliedToProduct ? (
                        <Badge colorScheme="green" bg={useColorModeValue('white', 'green.800')} color={useColorModeValue('green.500', 'green.200')} borderRadius="full" px={2}>
                          Применено
                        </Badge>
                      ) : (
                        <Badge colorScheme="blue" bg={useColorModeValue('white', 'blue.800')} color={useColorModeValue('blue.500', 'blue.200')} borderRadius="full" px={2}>
                          Не применено
                        </Badge>
                      )}
                    </Flex>
                  </Box>

                  <CardBody flex="1">
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color={mutedTextColor}>
                        <FaCalendarAlt style={{ display: 'inline', marginRight: '4px' }} />
                        {new Date(item.date).toLocaleString()}
                      </Text>

                      <Stat>
                        <StatLabel>Рекомендуемая цена</StatLabel>
                        <StatNumber>{item.recommendedPrice.toLocaleString()} ₽</StatNumber>
                        {item.competitorsData && (
                          <StatHelpText>
                            <StatArrow
                              type={item.recommendedPrice > item.competitorsData.avgPrice ? 'increase' : 'decrease'}
                            />
                            {Math.abs(((item.recommendedPrice - item.competitorsData.avgPrice) / item.competitorsData.avgPrice * 100)).toFixed(2)}% от средней
                          </StatHelpText>
                        )}
                      </Stat>

                      <Box
                        p={2}
                        bg={secondaryBg}
                        borderRadius="md"
                        fontSize="sm"
                        maxHeight="80px"
                        overflowY="auto"
                      >
                        <Text noOfLines={3}>{item.analysis}</Text>
                      </Box>
                    </VStack>
                  </CardBody>

                  <CardFooter
                    bg={secondaryBg}
                    borderTop="1px"
                    borderColor={borderColor}
                    py={2}
                  >
                    <HStack spacing={2} width="100%" justify="space-between">
                      <Button
                        size="sm"
                        leftIcon={<FaEye />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => viewAnalysis(item)}
                        flex="1"
                      >
                        Просмотр
                      </Button>

                      {!item.appliedToProduct ? (
                        <Button
                          size="sm"
                          leftIcon={<FaCheck />}
                          colorScheme="green"
                          onClick={() => prepareApply(item)}
                          flex="1"
                        >
                          Применить
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          leftIcon={<FaTelegram />}
                          colorScheme="telegram"
                          onClick={() => sendTelegramNotification(item)}
                          isLoading={isNotifying && selectedAnalysis?.id === item.id}
                          flex="1"
                        >
                          Отправить
                        </Button>
                      )}
                    </HStack>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </>
      ) : (
        <Alert
          status="info"
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
          p={6}
        >
          <AlertIcon boxSize="24px" />
          <Box>
            <AlertTitle fontSize="lg" mb={2}>Нет данных</AlertTitle>
            <AlertDescription>
              История анализа пуста. Выполните анализ товаров на странице ИИ-анализа, чтобы увидеть результаты здесь.
            </AlertDescription>
            <Button
              as={Link}
              to="/ai-analysis"
              mt={4}
              colorScheme="blue"
              leftIcon={<FaRocket />}
            >
              Перейти к ИИ-анализу
            </Button>
          </Box>
        </Alert>
      )}

      {/* Боковая панель статистики */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <FaChartLine />
              <Text ml={2}>Статистика анализа</Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            {allHistory.length > 0 ? (
              <VStack spacing={6} align="stretch" py={4}>
                <Box>
                  <Heading size="md" mb={4}>Общая статистика</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Stat>
                      <StatLabel>Всего анализов</StatLabel>
                      <StatNumber>{allHistory.length}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Применено</StatLabel>
                      <StatNumber>
                        {allHistory.filter(item => item.appliedToProduct).length}
                      </StatNumber>
                      <StatHelpText>
                        {((allHistory.filter(item => item.appliedToProduct).length / allHistory.length) * 100).toFixed(0)}% от общего числа
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Divider />

                <Box>
                  <Heading size="md" mb={4}>Анализ по товарам</Heading>
                  {getUniqueProductIds().map(productId => {
                    const productHistory = allHistory.filter(item => item.productId === productId);
                    const chartData = getChartData(productId);

                    return (
                      <Box
                        key={productId}
                        mb={6}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={borderColor}
                      >
                        <Heading size="sm" mb={2}>Товар {productId}</Heading>
                        <Text fontSize="sm" color={mutedTextColor} mb={4}>
                          Количество анализов: {productHistory.length}
                        </Text>

                        {productHistory.length > 1 && (
                          <Box height="200px" mb={4}>
                            <Line
                              data={chartData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
                                  },
                                  title: {
                                    display: true,
                                    text: 'Динамика рекомендуемых цен'
                                  }
                                }
                              }}
                            />
                          </Box>
                        )}

                        <SimpleGrid columns={2} spacing={4}>
                          <Stat size="sm">
                            <StatLabel>Средняя рек. цена</StatLabel>
                            <StatNumber>
                              {(productHistory.reduce((sum, item) => sum + item.recommendedPrice, 0) / productHistory.length).toLocaleString()} ₽
                            </StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Последняя рек. цена</StatLabel>
                            <StatNumber>
                              {productHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].recommendedPrice.toLocaleString()} ₽
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </Box>
                    );
                  })}
                </Box>
              </VStack>
            ) : (
              <Alert status="info" mt={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Нет данных</AlertTitle>
                  <AlertDescription>
                    История анализа пуста. Выполните анализ товаров, чтобы увидеть статистику.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onDrawerClose}>
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Модальное окно просмотра анализа */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="6px"
            bgGradient="linear(to-r, blue.400, purple.500)"
            borderTopLeftRadius="lg"
            borderTopRightRadius="lg"
          />

          <ModalHeader pt={6}>
            <Flex align="center">
              <FaChartLine color={accentColor} />
              <Text ml={2}>Результаты анализа</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedAnalysis && (
              <VStack spacing={4} align="stretch">
                <Flex
                  justify="space-between"
                  align="center"
                  bg={secondaryBg}
                  p={3}
                  borderRadius="md"
                >
                  <HStack>
                    <Avatar
                      size="sm"
                      bg={accentColor}
                      icon={<FaShoppingCart fontSize="1rem" />}
                    >
                      {selectedAnalysis.appliedToProduct && (
                        <AvatarBadge boxSize="1em" bg="green.500" />
                      )}
                    </Avatar>
                    <Box>
                      <Heading size="sm">Товар {selectedAnalysis.productId}</Heading>
                      <Text fontSize="xs" color={mutedTextColor}>
                        <FaCalendarAlt style={{ display: 'inline', marginRight: '4px' }} />
                        {new Date(selectedAnalysis.date).toLocaleString()}
                      </Text>
                    </Box>
                  </HStack>

                  <Badge
                    colorScheme={selectedAnalysis.appliedToProduct ? 'green' : 'blue'}
                    borderRadius="full"
                    px={2}
                    py={1}
                  >
                    {selectedAnalysis.appliedToProduct ? 'Применено' : 'Не применено'}
                  </Badge>
                </Flex>

                <Tabs colorScheme="blue" variant="enclosed" borderRadius="md" overflow="hidden">
                  <TabList>
                    <Tab>Рекомендации</Tab>
                    <Tab>Конкуренты</Tab>
                    <Tab>Полный анализ</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <StatGroup>
                          <Stat>
                            <StatLabel>Рекомендуемая цена</StatLabel>
                            <StatNumber color={accentColor}>{selectedAnalysis.recommendedPrice.toLocaleString()} ₽</StatNumber>
                            {selectedAnalysis.competitorsData && (
                              <StatHelpText>
                                <StatArrow
                                  type={selectedAnalysis.recommendedPrice > selectedAnalysis.competitorsData.avgPrice ? 'increase' : 'decrease'}
                                />
                                {Math.abs(((selectedAnalysis.recommendedPrice - selectedAnalysis.competitorsData.avgPrice) / selectedAnalysis.competitorsData.avgPrice * 100)).toFixed(2)}% от средней
                              </StatHelpText>
                            )}
                          </Stat>

                          <Stat>
                            <StatLabel>Минимальная цена</StatLabel>
                            <StatNumber>{selectedAnalysis.minPrice.toLocaleString()} ₽</StatNumber>
                          </Stat>
                        </StatGroup>

                        {!selectedAnalysis.appliedToProduct && (
                          <Button
                            colorScheme="green"
                            leftIcon={<FaCheck />}
                            onClick={() => {
                              onViewClose();
                              prepareApply(selectedAnalysis);
                            }}
                            mt={2}
                          >
                            Применить рекомендуемую цену
                          </Button>
                        )}
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      {selectedAnalysis.competitorsData ? (
                        <VStack spacing={4} align="stretch">
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <Stat>
                              <StatLabel>Количество конкурентов</StatLabel>
                              <StatNumber>{selectedAnalysis.competitorsData.count}</StatNumber>
                            </Stat>

                            <Stat>
                              <StatLabel>Средняя цена</StatLabel>
                              <StatNumber>{selectedAnalysis.competitorsData.avgPrice.toLocaleString()} ₽</StatNumber>
                            </Stat>

                            <Stat>
                              <StatLabel>Минимальная цена</StatLabel>
                              <StatNumber>{selectedAnalysis.competitorsData.minPrice.toLocaleString()} ₽</StatNumber>
                            </Stat>

                            <Stat>
                              <StatLabel>Максимальная цена</StatLabel>
                              <StatNumber>{selectedAnalysis.competitorsData.maxPrice.toLocaleString()} ₽</StatNumber>
                            </Stat>
                          </SimpleGrid>

                          <Box height="200px" mt={4}>
                            <Line
                              data={{
                                labels: ['Ваша цена', 'Рекомендуемая', 'Мин. конкурент', 'Средняя', 'Макс. конкурент'],
                                datasets: [
                                  {
                                    label: 'Сравнение цен',
                                    data: [
                                      selectedAnalysis.recommendedPrice * 0.9, // Имитация текущей цены
                                      selectedAnalysis.recommendedPrice,
                                      selectedAnalysis.competitorsData.minPrice,
                                      selectedAnalysis.competitorsData.avgPrice,
                                      selectedAnalysis.competitorsData.maxPrice
                                    ],
                                    backgroundColor: [
                                      'rgba(255, 99, 132, 0.5)',
                                      'rgba(54, 162, 235, 0.5)',
                                      'rgba(255, 206, 86, 0.5)',
                                      'rgba(75, 192, 192, 0.5)',
                                      'rgba(153, 102, 255, 0.5)'
                                    ],
                                    borderColor: [
                                      'rgba(255, 99, 132, 1)',
                                      'rgba(54, 162, 235, 1)',
                                      'rgba(255, 206, 86, 1)',
                                      'rgba(75, 192, 192, 1)',
                                      'rgba(153, 102, 255, 1)'
                                    ],
                                    borderWidth: 1
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
                                  },
                                  title: {
                                    display: true,
                                    text: 'Сравнение цен'
                                  }
                                }
                              }}
                            />
                          </Box>
                        </VStack>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Нет данных</AlertTitle>
                            <AlertDescription>
                              Данные о конкурентах отсутствуют для этого анализа.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </TabPanel>

                    <TabPanel>
                      <Box
                        whiteSpace="pre-wrap"
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                        maxHeight="400px"
                        overflowY="auto"
                        fontSize="sm"
                      >
                        {selectedAnalysis.analysis}
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              leftIcon={<FaTelegram />}
              colorScheme="telegram"
              mr={3}
              onClick={() => {
                sendTelegramNotification(selectedAnalysis!);
                toast({
                  title: 'Отправлено',
                  description: 'Уведомление отправлено в Telegram',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Отправить в Telegram
            </Button>
            <Button onClick={onViewClose}>Закрыть</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно удаления анализа */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>
            <Flex align="center" color="red.500">
              <FaExclamationTriangle />
              <Text ml={2}>Удаление записи</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Внимание!</AlertTitle>
                <AlertDescription>
                  Вы уверены, что хотите удалить эту запись из истории анализа?
                </AlertDescription>
              </Box>
            </Alert>
            <Text mt={4}>Это действие нельзя отменить.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDeleteClose}>
              Отмена
            </Button>
            <Button
              colorScheme="red"
              onClick={deleteAnalysis}
              isLoading={isDeleting}
              leftIcon={<FaTrash />}
            >
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно применения цены */}
      <Modal isOpen={isApplyOpen} onClose={onApplyClose}>
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="6px"
            bg="green.500"
            borderTopLeftRadius="lg"
            borderTopRightRadius="lg"
          />

          <ModalHeader pt={6}>
            <Flex align="center" color="green.500">
              <FaCheck />
              <Text ml={2}>Применение рекомендуемой цены</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedAnalysis && (
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Подтверждение</AlertTitle>
                    <AlertDescription>
                      Вы собираетесь применить рекомендуемую цену к товару.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text color={mutedTextColor}>Текущая цена:</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {(selectedAnalysis.recommendedPrice * 0.9).toLocaleString()} ₽
                      </Text>
                    </Box>
                    <Box>
                      <Text color={mutedTextColor}>Новая цена:</Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.500">
                        {selectedAnalysis.recommendedPrice.toLocaleString()} ₽
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Divider my={4} />

                  <Flex align="center" justify="center">
                    <Text fontWeight="bold" mr={2}>Изменение:</Text>
                    <Badge
                      colorScheme="green"
                      fontSize="md"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      +{((selectedAnalysis.recommendedPrice / (selectedAnalysis.recommendedPrice * 0.9) - 1) * 100).toFixed(2)}%
                    </Badge>
                  </Flex>
                </Box>

                <Text>
                  После применения цены запись будет отмечена как примененная, и вы сможете отслеживать историю изменений цен.
                </Text>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onApplyClose}>
              Отмена
            </Button>
            <Button
              colorScheme="green"
              onClick={applyRecommendedPrice}
              isLoading={isApplying}
              leftIcon={<FaCheck />}
            >
              Применить цену
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
