import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  Badge,
  Heading,
  Stack,
  HStack,
  VStack,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Checkbox,
  useColorModeValue,
  Tooltip,
  Collapse,
  useDisclosure,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  DeleteIcon,
  SettingsIcon,
  InfoIcon,
  StarIcon,
  ViewIcon,
  LinkIcon
} from '@chakra-ui/icons';
import {
  Product,
  ProductCategory,
  ProductStatus,
  ProductCategoryNames,
  ProductStatusNames,
  CompetitorProduct
} from '../../types/product';
import { useOzonProducts } from '../../context/OzonProductContext';
import CompetitorLinkingModal from './CompetitorLinkingModal';
import CompetitorLinksOverview from './CompetitorLinksOverview';
import StrategySelectionModal, { PricingStrategy } from './StrategySelectionModal';
import StrategyAndCompetitorsModal from './StrategyAndCompetitorsModal';
import CombinedStrategyAndCompetitorsModal from './CombinedStrategyAndCompetitorsModal';
import { AutomationToggle } from '../automation/AutomationToggle';

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: (product: Product) => void;
  onToggleSelect?: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onApplyStrategy?: (productId: string) => void;
  onLinkCompetitors?: (productId: string) => void;
  compact?: boolean;
}

export default function ProductCard({
  product,
  isSelected = false,
  onSelect,
  onToggleSelect,
  onEdit,
  onDelete,
  onApplyStrategy,
  onLinkCompetitors,
  compact = false
}: ProductCardProps) {
  // Получаем функции из контекста
  const { saveCompetitorLinks } = useOzonProducts();
  const toast = useToast();

  // Состояние для раскрывающейся панели
  const { isOpen, onToggle } = useDisclosure();

  // Состояние для модального окна связывания конкурентов
  const {
    isOpen: isCompetitorLinkingOpen,
    onOpen: onCompetitorLinkingOpen,
    onClose: onCompetitorLinkingClose
  } = useDisclosure();

  // Состояние для модального окна обзора связанных конкурентов
  const {
    isOpen: isCompetitorOverviewOpen,
    onOpen: onCompetitorOverviewOpen,
    onClose: onCompetitorOverviewClose
  } = useDisclosure();

  // Состояние для модального окна выбора стратегии
  const {
    isOpen: isStrategySelectionOpen,
    onOpen: onStrategySelectionOpen,
    onClose: onStrategySelectionClose
  } = useDisclosure();

  // Состояние для модального окна выбора стратегии и связывания с конкурентами
  const {
    isOpen: isStrategyAndCompetitorsOpen,
    onOpen: onStrategyAndCompetitorsOpen,
    onClose: onStrategyAndCompetitorsClose
  } = useDisclosure();

  // Состояние для объединенного модального окна выбора стратегии и связывания с конкурентами
  const {
    isOpen: isCombinedModalOpen,
    onOpen: onCombinedModalOpen,
    onClose: onCombinedModalClose
  } = useDisclosure();

  // Состояние для хранения связанных конкурентов
  const [linkedCompetitors, setLinkedCompetitors] = useState<CompetitorProduct[]>(product.linkedCompetitors || []);

  // Состояние для хранения выбранной стратегии
  const [selectedStrategy, setSelectedStrategy] = useState<PricingStrategy | null>(null);

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const priceColor = useColorModeValue('blue.600', 'blue.300');
  const oldPriceColor = useColorModeValue('gray.500', 'gray.400');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.300', 'blue.500');

  // Статусы товаров и их цвета
  const statusColors: Record<ProductStatus, string> = {
    [ProductStatus.ACTIVE]: 'green',
    [ProductStatus.INACTIVE]: 'gray',
    [ProductStatus.PENDING]: 'yellow',
    [ProductStatus.REJECTED]: 'red',
    [ProductStatus.ARCHIVED]: 'purple'
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
      year: 'numeric'
    });
  };

  // Состояние для хранения загруженных изображений
  const [loadedImages, setLoadedImages] = useState<{ id: string; url: string; isMain: boolean; sortOrder: number }[]>([]);

  // Получение основного изображения товара
  const mainImage = loadedImages.length > 0
    ? loadedImages.find(img => img.isMain) || loadedImages[0]
    : product.images.find(img => img.isMain) || product.images[0];

  // Эффект для автоматической загрузки изображений, если они отсутствуют
  useEffect(() => {
    const loadProductImages = async () => {
      // Если у товара уже есть изображения, не загружаем новые
      if (product.images && product.images.length > 0) {
        return;
      }

      try {
        // В реальном приложении здесь будет запрос к сервису изображений
        // const imageService = new ProductImageService({
        //   apiKey: 'YOUR_API_KEY',
        //   baseUrl: 'https://api.example.com'
        // });
        // const images = await imageService.getProductImages(product, 'google');

        // Для демонстрации используем заглушку
        console.log(`Автоматическая загрузка изображений для товара ${product.id}`);

        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));

        // Генерируем случайные изображения
        const images = [
          {
            id: `img-${product.id}-1`,
            url: `/images/placeholders/${product.category.toLowerCase()}.svg`,
            isMain: true,
            sortOrder: 0
          },
          {
            id: `img-${product.id}-2`,
            url: `/images/placeholders/default.svg`,
            isMain: false,
            sortOrder: 1
          }
        ];

        setLoadedImages(images);
      } catch (error) {
        console.error(`Ошибка при загрузке изображений для товара ${product.id}:`, error);
      }
    };

    loadProductImages();
  }, [product.id, product.images, product.category]);

  // Обработчик выбора товара
  const handleSelect = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  // Обработчик переключения выбора товара
  const handleToggleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(product.id);
    }
  };

  // Обработчик редактирования товара
  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  // Обработчик удаления товара
  const handleDelete = () => {
    if (onDelete) {
      onDelete(product.id);
    }
  };

  // Обработчик применения стратегии
  const handleApplyStrategy = (strategyId?: string) => {
    console.log('handleApplyStrategy вызван с параметрами:', { productId: product.id, strategyId });

    if (onApplyStrategy) {
      onApplyStrategy(product.id, strategyId);
    }
  };

  // Обработчик связывания товара с конкурентами
  const handleLinkCompetitors = (e: React.MouseEvent) => {
    // Останавливаем всплытие события, чтобы не вызывался handleSelect
    e.stopPropagation();

    console.log('Вызван handleLinkCompetitors для товара:', product.id);

    // Открываем объединенное модальное окно выбора стратегии и связывания с конкурентами
    onCombinedModalOpen();

    // Также вызываем внешний обработчик, если он определен
    if (onLinkCompetitors) {
      onLinkCompetitors(product.id);
    }
  };

  // Обработчик выбора стратегии
  const handleSelectStrategy = (strategy: PricingStrategy) => {
    console.log('Выбрана стратегия:', strategy);

    // Сохраняем выбранную стратегию
    setSelectedStrategy(strategy);

    // Применяем стратегию к товару
    if (onApplyStrategy) {
      onApplyStrategy(product.id, strategy.id);
    }

    // Показываем уведомление об успешном применении стратегии
    toast({
      title: 'Стратегия применена',
      description: `Стратегия "${strategy.name}" успешно применена к товару`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик перехода к связыванию конкурентов после выбора стратегии
  const handleProceedToCompetitors = (strategy: PricingStrategy) => {
    console.log('Переход к связыванию конкурентов после выбора стратегии:', strategy);

    // Сохраняем выбранную стратегию
    setSelectedStrategy(strategy);

    // Применяем стратегию к товару
    if (onApplyStrategy) {
      onApplyStrategy(product.id, strategy.id);
    }

    // Открываем модальное окно связывания конкурентов
    onCompetitorLinkingOpen();
  };

  // Обработчик сохранения связей с конкурентами
  const handleSaveCompetitorLinks = async (product: Product, competitors: CompetitorProduct[]) => {
    console.log('Сохранение связей с конкурентами:', product.id, competitors);

    try {
      // Сохраняем связи в контексте (и на сервере)
      const updatedProduct = await saveCompetitorLinks(product.id, competitors);

      if (updatedProduct) {
        // Обновляем локальное состояние
        setLinkedCompetitors(updatedProduct.linkedCompetitors || []);

        // Закрываем модальное окно связывания
        onCompetitorLinkingClose();

        // Открываем модальное окно обзора связанных конкурентов
        onCompetitorOverviewOpen();

        // Показываем уведомление об успешном сохранении
        toast({
          title: 'Связи сохранены',
          description: `Товар "${product.title}" связан с ${competitors.length} конкурентами`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Ошибка при сохранении связей:', error);

      // Показываем уведомление об ошибке
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить связи с конкурентами',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик сохранения стратегии и связей с конкурентами
  const handleSaveStrategyAndCompetitors = async (product: Product, competitors: CompetitorProduct[], strategy: PricingStrategy) => {
    console.log('Сохранение стратегии и связей с конкурентами:', product.id, strategy, competitors);

    try {
      // Сначала применяем стратегию к товару
      console.log('Применяем стратегию к товару:', strategy.id);
      if (onApplyStrategy) {
        await onApplyStrategy(product.id, strategy.id);
        console.log('Стратегия успешно применена');
      }

      // Затем сохраняем связи в контексте (и на сервере)
      console.log('Сохраняем связи с конкурентами:', competitors.length);
      const updatedProduct = await saveCompetitorLinks(product.id, competitors);
      console.log('Результат сохранения связей:', updatedProduct);

      if (updatedProduct) {
        // Обновляем локальное состояние
        setLinkedCompetitors(updatedProduct.linkedCompetitors || []);

        // Обновляем состояние выбранной стратегии
        setSelectedStrategy(strategy);

        // Закрываем модальное окно
        onCombinedModalClose();

        // Показываем уведомление об успешном сохранении
        toast({
          title: 'Стратегия и связи сохранены',
          description: `Применена стратегия "${strategy.name}" и товар связан с ${competitors.length} конкурентами`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Перезагружаем страницу, чтобы обновить данные
        // Это временное решение, в реальном приложении лучше использовать контекст
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Ошибка при сохранении стратегии и связей:', error);

      // Показываем уведомление об ошибке
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить стратегию и связи с конкурентами',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик удаления конкурента
  const handleRemoveCompetitor = async (competitorId: string) => {
    try {
      // Создаем новый массив связанных конкурентов без удаляемого
      const updatedCompetitors = linkedCompetitors.filter(c => c.id !== competitorId);

      // Сохраняем обновленные связи
      const updatedProduct = await saveCompetitorLinks(product.id, updatedCompetitors);

      if (updatedProduct) {
        // Обновляем локальное состояние
        setLinkedCompetitors(updatedProduct.linkedCompetitors || []);

        // Показываем уведомление об успешном удалении
        toast({
          title: 'Связь удалена',
          description: 'Связь с конкурентом успешно удалена',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Ошибка при удалении связи:', error);

      // Показываем уведомление об ошибке
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить связь с конкурентом',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg={isSelected ? selectedBg : cardBg}
      borderWidth="1px"
      borderColor={isSelected ? selectedBorder : borderColor}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        borderColor: isSelected ? selectedBorder : 'blue.300'
      }}
      onClick={handleSelect}
      cursor={onSelect ? 'pointer' : 'default'}
      position="relative"
      className="product-card purple-card-border"
    >
      {/* Чекбокс для выбора товара */}
      {onToggleSelect && (
        <Checkbox
          position="absolute"
          top="12px"
          left="12px"
          zIndex="1"
          isChecked={isSelected}
          onChange={handleToggleSelect}
          colorScheme="blue"
          size="lg"
          bg={useColorModeValue('white', 'gray.600')}
          borderRadius="md"
          opacity="0.9"
          _hover={{ opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Статус товара */}
      <Badge
        position="absolute"
        top="12px"
        right="12px"
        zIndex="1"
        colorScheme={statusColors[product.status]}
        borderRadius="full"
        px={3}
        py={1}
        fontSize="0.8rem"
        fontWeight="bold"
        boxShadow="0 2px 5px rgba(0,0,0,0.1)"
      >
        {ProductStatusNames[product.status]}
      </Badge>

      {/* Заголовок с артикулом - ГЛАВНАЯ ИНФОРМАЦИЯ */}
      <Box
        bgGradient={useColorModeValue(
          'linear(135deg, blue.50 0%, cyan.50 50%, blue.100 100%)',
          'linear(135deg, blue.900 0%, cyan.900 50%, blue.800 100%)'
        )}
        p={4}
        borderBottom="2px solid"
        borderColor={useColorModeValue('blue.200', 'blue.600')}
      >
        {/* Артикул - САМОЕ ВАЖНОЕ */}
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1} flex="1">
              <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')} fontWeight="medium">
                АРТИКУЛ
              </Text>
              <Text
                fontSize="xl"
                fontWeight="black"
                color={useColorModeValue('blue.800', 'blue.100')}
                letterSpacing="wide"
                fontFamily="mono"
                bg={useColorModeValue('white', 'gray.800')}
                px={3}
                py={1}
                borderRadius="md"
                border="2px solid"
                borderColor={useColorModeValue('blue.300', 'blue.500')}
              >
                {product.sku}
              </Text>
            </VStack>

            {/* Индикатор применения стратегии */}
            {product.appliedStrategyId && (
              <Tooltip label="Применена стратегия ценообразования">
                <Badge
                  colorScheme="green"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="0.8rem"
                  fontWeight="bold"
                  boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                >
                  <InfoIcon mr={1} boxSize={3} />
                  Стратегия
                </Badge>
              </Tooltip>
            )}
          </HStack>

          {/* Ozon ID если есть */}
          {product.ozonId && (
            <HStack spacing={2}>
              <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="medium">
                OZON ID:
              </Text>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color={useColorModeValue('gray.700', 'gray.300')}
                bg={useColorModeValue('gray.100', 'gray.700')}
                px={2}
                py={1}
                borderRadius="md"
                fontFamily="mono"
              >
                {product.ozonId}
              </Text>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Информация о товаре */}
      <Box p={5}>
        <Stack spacing={3}>
          {/* Название товара - вторично по важности */}
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="medium">
              НАЗВАНИЕ ТОВАРА
            </Text>
            <Text
              fontSize={compact ? "sm" : "md"}
              noOfLines={2}
              title={product.title}
              fontWeight="600"
              letterSpacing="normal"
              lineHeight="1.3"
              color={useColorModeValue('gray.700', 'gray.200')}
            >
              {product.title}
            </Text>
          </VStack>

          <Flex wrap="wrap" gap={2}>
            <Badge
              colorScheme="purple"
              variant="subtle"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="0.75rem"
            >
              {ProductCategoryNames[product.category]}
            </Badge>
            {product.brand && (
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={2}
                py={1}
                borderRadius="md"
                fontSize="0.75rem"
              >
                {product.brand}
              </Badge>
            )}
          </Flex>

          {!compact && (
            <Text
              fontSize="sm"
              color={textColor}
              noOfLines={2}
              lineHeight="1.5"
            >
              {product.description}
            </Text>
          )}

          <Flex
            justify="space-between"
            align="center"
            bgGradient={useColorModeValue(
              'linear(135deg, gray.50 0%, blue.50 50%, gray.100 100%)',
              'linear(135deg, gray.700 0%, blue.800 50%, gray.600 100%)'
            )}
            p={3}
            borderRadius="lg"
            mt={1}
            border="1px solid"
            borderColor={useColorModeValue('blue.200', 'blue.600')}
          >
            <Stack spacing={0}>
              <Text
                fontWeight="bold"
                fontSize={compact ? "md" : "xl"}
                bgGradient={useColorModeValue(
                  'linear(135deg, blue.600 0%, cyan.500 50%, blue.700 100%)',
                  'linear(135deg, blue.300 0%, cyan.300 50%, blue.400 100%)'
                )}
                bgClip="text"
                letterSpacing="tight"
              >
                {formatPrice(product.price.current)}
              </Text>

              {product.price.old && (
                <Text
                  fontSize={compact ? "xs" : "sm"}
                  color={oldPriceColor}
                  textDecoration="line-through"
                >
                  {formatPrice(product.price.old)}
                </Text>
              )}

              {product.price.costPrice && !compact && (
                <Flex align="center" mt={1}>
                  <Text fontSize="xs" color={textColor} mr={1}>
                    Закуп: {formatPrice(product.price.costPrice)}
                  </Text>
                  {product.price.costPrice > 0 && (
                    <Badge
                      colorScheme={((product.price.current - product.price.costPrice) / product.price.costPrice * 100) < 15 ? "orange" : "green"}
                      fontSize="xs"
                    >
                      {(((product.price.current - product.price.costPrice) / product.price.costPrice) * 100).toFixed(0)}%
                    </Badge>
                  )}
                </Flex>
              )}

              {/* Минимальная цена */}
              {!compact && (
                <Flex align="center" mt={1}>
                  <Text fontSize="xs" color={textColor} mr={1}>
                    Мин. цена: {product.price.minThreshold
                      ? formatPrice(product.price.minThreshold)
                      : "не задана"}
                  </Text>
                  {product.price.minThreshold && product.price.minThreshold > 0 && (
                    <Tooltip label="Минимальная цена, ниже которой товар не будет продаваться">
                      <InfoIcon boxSize={3} color="blue.500" />
                    </Tooltip>
                  )}
                </Flex>
              )}
            </Stack>

            <Badge
              colorScheme={product.stock.available > 0 ? "green" : "red"}
              variant="solid"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="0.8rem"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
            >
              {product.stock.available > 0
                ? `В наличии: ${product.stock.available}`
                : "Нет в наличии"}
            </Badge>
          </Flex>

          {product.salesStats && !compact && (
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={2}
              mt={1}
            >
              <Tooltip label="Всего продано">
                <Flex
                  align="center"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  px={3}
                  py={1}
                  borderRadius="md"
                >
                  <Text fontSize="sm" fontWeight="medium" mr={1}>
                    Продано:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {product.salesStats.totalSold}
                  </Text>
                </Flex>
              </Tooltip>

              {product.salesStats.averageRating && (
                <Tooltip label="Средний рейтинг">
                  <Flex
                    align="center"
                    bg={useColorModeValue('yellow.50', 'yellow.900')}
                    px={3}
                    py={1}
                    borderRadius="md"
                  >
                    <StarIcon boxSize={3.5} color="yellow.400" mr={1} />
                    <Text fontSize="sm" fontWeight="bold">
                      {product.salesStats.averageRating.toFixed(1)}
                    </Text>
                    <Text fontSize="sm" color={textColor} ml={1}>
                      ({product.salesStats.reviewsCount || 0})
                    </Text>
                  </Flex>
                </Tooltip>
              )}
            </Flex>
          )}

          {/* Компонент автоматизации */}
          <Box mt={3}>
            <AutomationToggle
              productId={product.id}
              productTitle={product.title}
              currentPrice={product.price.current}
              compact={true}
            />
          </Box>

          {/* Кнопки действий */}
          <Flex justify="space-between" mt={3} align="center">
            {!compact && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                borderRadius="full"
                fontWeight="medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                _hover={{
                  bg: useColorModeValue('blue.50', 'blue.900'),
                }}
              >
                {isOpen ? 'Скрыть' : 'Подробнее'}
              </Button>
            )}

            <HStack spacing={2} ml="auto">
              {onSelect && (
                <Tooltip label="Просмотр">
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    icon={<ViewIcon />}
                    aria-label="Просмотр товара"
                    borderRadius="full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect();
                    }}
                  />
                </Tooltip>
              )}

              {(onEdit || onDelete || onApplyStrategy) && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    icon={<SettingsIcon />}
                    aria-label="Действия"
                    borderRadius="full"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <MenuList
                    onClick={(e) => e.stopPropagation()}
                    shadow="lg"
                    borderRadius="xl"
                    p={1}
                  >
                    {onEdit && (
                      <MenuItem
                        icon={<EditIcon />}
                        onClick={handleEdit}
                        borderRadius="md"
                        _hover={{
                          bg: useColorModeValue('blue.50', 'blue.900'),
                        }}
                      >
                        Редактировать
                      </MenuItem>
                    )}

                    {onApplyStrategy && (
                      <MenuItem
                        icon={<InfoIcon />}
                        onClick={handleApplyStrategy}
                        borderRadius="md"
                        _hover={{
                          bg: useColorModeValue('blue.50', 'blue.900'),
                        }}
                      >
                        {product.appliedStrategyId
                          ? 'Изменить стратегию'
                          : 'Применить стратегию'}
                      </MenuItem>
                    )}

                    {onLinkCompetitors && (
                      <MenuItem
                        icon={<LinkIcon />}
                        onClick={handleLinkCompetitors}
                        borderRadius="md"
                        _hover={{
                          bg: useColorModeValue('teal.50', 'teal.900'),
                        }}
                      >
                        Связать с конкурентами
                      </MenuItem>
                    )}

                    {onDelete && (
                      <>
                        <Divider my={1} />
                        <MenuItem
                          icon={<DeleteIcon />}
                          color="red.500"
                          onClick={handleDelete}
                          borderRadius="md"
                          _hover={{
                            bg: useColorModeValue('red.50', 'red.900'),
                          }}
                        >
                          Удалить
                        </MenuItem>
                      </>
                    )}
                  </MenuList>
                </Menu>
              )}
            </HStack>
          </Flex>
        </Stack>
      </Box>

      {/* Дополнительная информация (раскрывающаяся) */}
      {!compact && (
        <Collapse in={isOpen} animateOpacity>
          <Box
            p={5}
            borderTopWidth="1px"
            borderColor={borderColor}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderBottomLeftRadius="xl"
            borderBottomRightRadius="xl"
          >
            <VStack spacing={4} align="stretch">
              {/* Основная информация */}
              <Box>
                <Text fontSize="md" fontWeight="bold" color={useColorModeValue('gray.700', 'gray.200')} mb={3}>
                  📋 Основная информация
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {product.sku && (
                    <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="medium" mb={1}>
                        SKU
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color={useColorModeValue('gray.800', 'gray.100')}>
                        {product.sku}
                      </Text>
                    </Box>
                  )}

                  {product.ozonId && (
                    <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" borderLeft="4px solid" borderColor="orange.400">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="medium" mb={1}>
                        OZON ID
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color={useColorModeValue('gray.800', 'gray.100')}>
                        {product.ozonId}
                      </Text>
                    </Box>
                  )}

                  {product.subcategory && (
                    <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" borderLeft="4px solid" borderColor="teal.400">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="medium" mb={1}>
                        ПОДКАТЕГОРИЯ
                      </Text>
                      <Badge colorScheme="teal" variant="subtle" fontSize="sm" px={2} py={1}>
                        {product.subcategory}
                      </Badge>
                    </Box>
                  )}
                </SimpleGrid>
              </Box>

              {/* Даты */}
              <Box>
                <Text fontSize="md" fontWeight="bold" color={useColorModeValue('gray.700', 'gray.200')} mb={3}>
                  📅 Даты
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                    <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')} fontWeight="medium" mb={1}>
                      СОЗДАН
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('blue.800', 'blue.100')}>
                      {formatDate(product.createdAt)}
                    </Text>
                  </Box>

                  <Box p={3} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md">
                    <Text fontSize="xs" color={useColorModeValue('green.600', 'green.300')} fontWeight="medium" mb={1}>
                      ОБНОВЛЕН
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('green.800', 'green.100')}>
                      {formatDate(product.updatedAt)}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Ценовая информация */}
              {(product.price.costPrice || product.price.recommended) && (
                <Box>
                  <Text fontSize="md" fontWeight="bold" color={useColorModeValue('gray.700', 'gray.200')} mb={3}>
                    💰 Ценовая информация
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {product.price.costPrice && (
                      <Box p={3} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="md">
                        <Text fontSize="xs" color={useColorModeValue('orange.600', 'orange.300')} fontWeight="medium" mb={1}>
                          СЕБЕСТОИМОСТЬ
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('orange.800', 'orange.100')}>
                          {formatPrice(product.price.costPrice)}
                        </Text>
                      </Box>
                    )}

                    {product.price.recommended && (
                      <Box p={3} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md">
                        <Text fontSize="xs" color={useColorModeValue('green.600', 'green.300')} fontWeight="medium" mb={1}>
                          РЕКОМЕНДОВАННАЯ
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('green.800', 'green.100')}>
                          {formatPrice(product.price.recommended)}
                        </Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>
              )}

              {/* Складская информация */}
              {(product.stock.inbound || product.stock.nextDeliveryDate) && (
                <Box>
                  <Text fontSize="md" fontWeight="bold" color={useColorModeValue('gray.700', 'gray.200')} mb={3}>
                    📦 Складская информация
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {product.stock.inbound && (
                      <Box p={3} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="md">
                        <Text fontSize="xs" color={useColorModeValue('purple.600', 'purple.300')} fontWeight="medium" mb={1}>
                          ОЖИДАЕТСЯ
                        </Text>
                        <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                          {product.stock.inbound} шт.
                        </Badge>
                      </Box>
                    )}

                    {product.stock.nextDeliveryDate && (
                      <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                        <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')} fontWeight="medium" mb={1}>
                          ДАТА ПОСТУПЛЕНИЯ
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('blue.800', 'blue.100')}>
                          {formatDate(product.stock.nextDeliveryDate)}
                        </Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          </Box>
        </Collapse>
      )}

      {/* Модальное окно для связывания товара с конкурентами */}
      <CompetitorLinkingModal
        isOpen={isCompetitorLinkingOpen}
        onClose={onCompetitorLinkingClose}
        product={product}
        onSave={handleSaveCompetitorLinks}
      />

      {/* Модальное окно для обзора связанных конкурентов */}
      <CompetitorLinksOverview
        isOpen={isCompetitorOverviewOpen}
        onClose={onCompetitorOverviewClose}
        product={product}
        linkedCompetitors={linkedCompetitors}
        onRemoveCompetitor={handleRemoveCompetitor}
      />

      {/* Модальное окно для выбора стратегии ценообразования */}
      <StrategySelectionModal
        isOpen={isStrategySelectionOpen}
        onClose={onStrategySelectionClose}
        product={product}
        onSelectStrategy={handleSelectStrategy}
        onProceedToCompetitors={handleProceedToCompetitors}
      />

      {/* Модальное окно для выбора стратегии и связывания с конкурентами */}
      <StrategyAndCompetitorsModal
        isOpen={isStrategyAndCompetitorsOpen}
        onClose={onStrategyAndCompetitorsClose}
        product={product}
        onSave={handleSaveStrategyAndCompetitors}
      />

      {/* Объединенное модальное окно для выбора стратегии и связывания с конкурентами */}
      <CombinedStrategyAndCompetitorsModal
        isOpen={isCombinedModalOpen}
        onClose={onCombinedModalClose}
        product={product}
        onSave={handleSaveStrategyAndCompetitors}
      />
    </Box>
  );
}
