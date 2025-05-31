import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  HStack,
  VStack
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, SettingsIcon } from '@chakra-ui/icons';
import { Product, ProductType, AIModule, PricingStrategyType } from '../types';
import { useProducts } from '../context/ProductContext';
import { AutomationToggle } from './automation/AutomationToggle';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isOpen, onToggle } = useDisclosure();
  const { updateProductPrice } = useProducts();
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(product.currentPrice);

  // Получаем минимальную цену конкурента
  const minCompetitorPrice = product.competitorProducts.length > 0
    ? Math.min(...product.competitorProducts.map(comp => comp.currentPrice))
    : null;

  // Получаем разницу с минимальной ценой конкурента
  const priceDifference = minCompetitorPrice
    ? ((product.currentPrice - minCompetitorPrice) / minCompetitorPrice) * 100
    : null;

  // Получаем маржу
  const margin = ((product.currentPrice - product.costPrice) / product.currentPrice) * 100;

  // Получаем цвет для типа товара
  const getProductTypeColor = (type: ProductType) => {
    switch (type) {
      case ProductType.HIT:
        return 'green';
      case ProductType.PREMIUM:
        return 'purple';
      case ProductType.OUTDATED:
        return 'orange';
      case ProductType.STANDARD:
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Получаем название для типа товара
  const getProductTypeName = (type: ProductType) => {
    switch (type) {
      case ProductType.HIT:
        return 'Хит продаж';
      case ProductType.PREMIUM:
        return 'Премиум';
      case ProductType.OUTDATED:
        return 'Устаревший';
      case ProductType.STANDARD:
        return 'Стандартный';
      default:
        return 'Неизвестно';
    }
  };

  // Получаем название для модуля ИИ
  const getAIModuleName = (module: AIModule) => {
    switch (module) {
      case AIModule.DEMAND_FORECAST:
        return 'Прогноз спроса';
      case AIModule.REINFORCEMENT_LEARNING:
        return 'Reinforcement Learning';
      case AIModule.REVIEW_ANALYSIS:
        return 'Анализ отзывов';
      case AIModule.ANOMALY_DETECTION:
        return 'Обнаружение аномалий';
      case AIModule.PERSONALIZATION:
        return 'Персонализация';
      default:
        return 'Неизвестно';
    }
  };

  // Обработчик изменения цены
  const handlePriceChange = async () => {
    if (newPrice === product.currentPrice) return;

    setIsUpdatingPrice(true);

    try {
      const success = await updateProductPrice(
        product.id,
        newPrice,
        `Ручное изменение цены с ${product.currentPrice} на ${newPrice}`
      );

      if (!success) {
        // Если не удалось обновить цену, возвращаем старую
        setNewPrice(product.currentPrice);
      }
    } catch (error) {
      console.error('Ошибка при обновлении цены:', error);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Цвета для карточки
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
      className="product-card"
    >
      {/* Заголовок с артикулом */}
      <Box
        bg={useColorModeValue('blue.50', 'blue.900')}
        p={3}
        borderBottom="1px solid"
        borderColor={useColorModeValue('blue.200', 'blue.600')}
      >
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1} flex="1">
            <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')} fontWeight="medium">
              АРТИКУЛ
            </Text>
            <Text
              fontSize="lg"
              fontWeight="black"
              color={useColorModeValue('blue.800', 'blue.100')}
              fontFamily="mono"
            >
              {product.sku}
            </Text>
          </VStack>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<SettingsIcon />}
              variant="ghost"
              size="sm"
              aria-label="Действия"
            />
            <MenuList>
              <MenuItem>Редактировать товар</MenuItem>
              <MenuItem>Применить стратегию</MenuItem>
              <MenuItem>Настроить ИИ-модули</MenuItem>
              <MenuItem>История цен</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      <Box p={4}>
        {/* Название товара - вторично */}
        <VStack align="start" spacing={1} mb={3}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            НАЗВАНИЕ
          </Text>
          <Text fontSize="md" fontWeight="600" noOfLines={2} title={product.name} color={useColorModeValue('gray.700', 'gray.200')}>
            {product.name}
          </Text>
        </VStack>

        <Flex mb={2}>
          <Badge colorScheme={getProductTypeColor(product.productType)} mr={2}>
            {getProductTypeName(product.productType)}
          </Badge>
          <Badge colorScheme="gray">{product.category}</Badge>
        </Flex>

        {product.ozonId && (
          <Text fontSize="sm" color="gray.500" mb={3}>
            OZON ID: <Text as="span" fontFamily="mono" fontWeight="bold">{product.ozonId}</Text>
          </Text>
        )}

        <Flex justify="space-between" mb={4}>
          <Stat bg={statBg} p={2} borderRadius="md" flex="1" mr={2}>
            <StatLabel fontSize="xs">Текущая цена</StatLabel>
            <StatNumber fontSize="md">{product.currentPrice.toLocaleString()} ₽</StatNumber>
            {product.recommendedPrice && (
              <StatHelpText fontSize="xs">
                <Tooltip label="Рекомендованная цена ИИ">
                  <span>Рек: {product.recommendedPrice.toLocaleString()} ₽</span>
                </Tooltip>
              </StatHelpText>
            )}
          </Stat>

          <Stat bg={statBg} p={2} borderRadius="md" flex="1" ml={2}>
            <StatLabel fontSize="xs">Маржа</StatLabel>
            <StatNumber fontSize="md">{margin.toFixed(1)}%</StatNumber>
            <StatHelpText fontSize="xs">
              <Tooltip label="Себестоимость">
                <span>Себ: {product.costPrice.toLocaleString()} ₽</span>
              </Tooltip>
            </StatHelpText>
          </Stat>
        </Flex>

        <Flex justify="space-between" mb={2}>
          <Stat bg={statBg} p={2} borderRadius="md" flex="1" mr={2}>
            <StatLabel fontSize="xs">Остаток</StatLabel>
            <StatNumber fontSize="md">{product.stock} шт.</StatNumber>
            {product.nextDeliveryDate && (
              <StatHelpText fontSize="xs">
                Поставка: {new Date(product.nextDeliveryDate).toLocaleDateString()}
              </StatHelpText>
            )}
          </Stat>

          {minCompetitorPrice && (
            <Stat bg={statBg} p={2} borderRadius="md" flex="1" ml={2}>
              <StatLabel fontSize="xs">Мин. цена конкурента</StatLabel>
              <StatNumber fontSize="md">{minCompetitorPrice.toLocaleString()} ₽</StatNumber>
              {priceDifference !== null && (
                <StatHelpText fontSize="xs">
                  <StatArrow type={priceDifference >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(priceDifference).toFixed(1)}% {priceDifference >= 0 ? 'дороже' : 'дешевле'}
                </StatHelpText>
              )}
            </Stat>
          )}
        </Flex>

        {/* Компонент автоматизации */}
        <Box mt={3}>
          <AutomationToggle
            productId={product.id}
            productTitle={product.name}
            currentPrice={product.currentPrice}
            compact={true}
          />
        </Box>

        <Button
          rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={onToggle}
          variant="outline"
          size="sm"
          width="full"
          mt={2}
        >
          {isOpen ? 'Скрыть детали' : 'Показать детали'}
        </Button>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Divider />
        <Box p={4}>
          <Text fontWeight="medium" mb={2}>ИИ-модули</Text>
          <Flex wrap="wrap" mb={4}>
            {product.aiModulesEnabled.length > 0 ? (
              product.aiModulesEnabled.map(module => (
                <Badge key={module} colorScheme="green" m={1}>
                  {getAIModuleName(module)}
                </Badge>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">Нет активных ИИ-модулей</Text>
            )}
          </Flex>

          <Text fontWeight="medium" mb={2}>Конкуренты ({product.competitorProducts.length})</Text>
          {product.competitorProducts.length > 0 ? (
            <Box maxH="200px" overflowY="auto">
              {product.competitorProducts.map(competitor => (
                <Flex
                  key={competitor.id}
                  justify="space-between"
                  align="center"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  mb={2}
                  bg={competitor.isSuspicious ? 'red.50' : 'transparent'}
                  borderColor={competitor.isSuspicious ? 'red.200' : borderColor}
                >
                  <Box>
                    <Text fontSize="sm" fontWeight={competitor.isSuspicious ? 'bold' : 'normal'}>
                      {competitor.competitorName}
                      {competitor.isSuspicious && (
                        <Badge colorScheme="red" ml={2} fontSize="xs">Подозрительный</Badge>
                      )}
                    </Text>
                    <Text fontSize="xs" color="gray.500">{competitor.productName}</Text>
                  </Box>
                  <Text fontWeight="bold">{competitor.currentPrice.toLocaleString()} ₽</Text>
                </Flex>
              ))}
            </Box>
          ) : (
            <Text fontSize="sm" color="gray.500">Нет данных о конкурентах</Text>
          )}

          <Divider my={4} />

          <Flex align="center" justify="space-between">
            <Box flex="1" mr={4}>
              <Text fontSize="sm" mb={1}>Новая цена:</Text>
              <Flex>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="input"
                  style={{ width: '100%', marginRight: '8px' }}
                  min={product.costPrice}
                />
                <Button
                  colorScheme="blue"
                  isLoading={isUpdatingPrice}
                  onClick={handlePriceChange}
                  isDisabled={newPrice === product.currentPrice}
                >
                  Обновить
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
}
