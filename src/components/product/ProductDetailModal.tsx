import React from 'react';
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
  Flex,
  Image,
  Text,
  Badge,
  Divider,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Heading,
  SimpleGrid,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Link
} from '@chakra-ui/react';
import {
  ExternalLinkIcon,
  EditIcon,
  SettingsIcon,
  InfoIcon,
  DownloadIcon,
  StarIcon
} from '@chakra-ui/icons';
import { Product, ProductStatus, ProductCategory } from '../../types/product';
import { formatPrice } from '../../utils/formatters';
import PriceHistoryChart from './PriceHistoryChart';
import SalesChart from './SalesChart';
import CompetitorPricesTable from './CompetitorPricesTable';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductImageUploader } from './ProductImageUploader';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onApplyStrategy?: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onApplyStrategy,
  onEditProduct
}) => {
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  // Если товар не выбран, не отображаем модальное окно
  if (!product) return null;

  // Получаем основное изображение товара
  const mainImage = product.images && product.images.length > 0
    ? product.images.find(img => img.isMain) || product.images[0]
    : null;

  // Получаем статус товара с соответствующим цветом
  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'green';
      case ProductStatus.PENDING:
        return 'yellow';
      case ProductStatus.INACTIVE:
        return 'gray';
      case ProductStatus.REJECTED:
        return 'red';
      case ProductStatus.ARCHIVED:
        return 'purple';
      default:
        return 'gray';
    }
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text>{product.title}</Text>
            <Badge
              colorScheme={getStatusColor(product.status)}
              fontSize="0.8em"
              p={1}
            >
              {product.status}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} mb={6}>
            {/* Галерея изображений товара */}
            <Box
              width={{ base: '100%', md: '300px' }}
            >
              <ProductImageGallery
                images={product.images}
                size="md"
                showThumbnails={true}
              />
            </Box>

            {/* Основная информация о товаре */}
            <Box flex="1">
              <VStack align="stretch" spacing={4}>
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Badge colorScheme="blue">{product.category}</Badge>
                    {product.subcategory && (
                      <Badge colorScheme="teal">{product.subcategory}</Badge>
                    )}
                    {product.brand && (
                      <Badge colorScheme="purple">{product.brand}</Badge>
                    )}
                  </HStack>

                  <Text fontSize="sm" color={textColor} mb={2}>
                    SKU: {product.sku}
                    {product.barcode && ` | Штрих-код: ${product.barcode}`}
                  </Text>

                  <Text fontSize="sm" color={textColor} mb={4}>
                    ID: {product.id}
                    {product.ozonId && ` | Ozon ID: ${product.ozonId}`}
                  </Text>
                </Box>

                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {formatPrice(product.price.current)}
                    </Text>
                    {product.price.old && (
                      <Text fontSize="md" textDecoration="line-through" color="gray.500">
                        {formatPrice(product.price.old)}
                      </Text>
                    )}
                  </Flex>

                  {product.price.recommended && (
                    <Text fontSize="sm" color={textColor} mb={1}>
                      Рекомендованная цена: {formatPrice(product.price.recommended)}
                    </Text>
                  )}

                  {product.price.costPrice && (
                    <Text fontSize="sm" color={textColor} mb={1}>
                      Себестоимость: {formatPrice(product.price.costPrice)}
                    </Text>
                  )}

                  <Flex mt={2}>
                    <Text fontSize="sm" color={textColor} mr={4}>
                      Мин. цена: {formatPrice(product.price.min || 0)}
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      Макс. цена: {formatPrice(product.price.max || 0)}
                    </Text>
                  </Flex>
                </Box>

                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={4}>
                  <Stat bg={statBg} p={2} borderRadius="md">
                    <StatLabel>В наличии</StatLabel>
                    <StatNumber>{product.stock.available}</StatNumber>
                    <StatHelpText>
                      {product.stock.reserved > 0 && `Зарезервировано: ${product.stock.reserved}`}
                    </StatHelpText>
                  </Stat>

                  {product.salesStats && (
                    <Stat bg={statBg} p={2} borderRadius="md">
                      <StatLabel>Продано</StatLabel>
                      <StatNumber>{product.salesStats.totalSold}</StatNumber>
                      <StatHelpText>
                        За месяц: {product.salesStats.lastMonthSold}
                      </StatHelpText>
                    </Stat>
                  )}

                  {product.salesStats && product.salesStats.averageRating && (
                    <Stat bg={statBg} p={2} borderRadius="md">
                      <StatLabel>Рейтинг</StatLabel>
                      <StatNumber>
                        {product.salesStats.averageRating.toFixed(1)}
                        <Box as="span" ml={1} color="yellow.400">
                          <StarIcon />
                        </Box>
                      </StatNumber>
                      <StatHelpText>
                        Отзывов: {product.salesStats.reviewsCount || 0}
                      </StatHelpText>
                    </Stat>
                  )}
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" color={textColor}>
                    Создан: {formatDate(product.createdAt)}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Обновлен: {formatDate(product.updatedAt)}
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Flex>

          <Divider mb={6} />

          {/* Вкладки с дополнительной информацией */}
          <Tabs colorScheme="blue" isLazy>
            <TabList>
              <Tab>Описание</Tab>
              <Tab>Изображения</Tab>
              <Tab>Характеристики</Tab>
              <Tab>Цены конкурентов</Tab>
              <Tab>История цен</Tab>
              <Tab>Продажи</Tab>
              <Tab>Стратегия</Tab>
            </TabList>

            <TabPanels>
              {/* Вкладка с описанием */}
              <TabPanel>
                <Text>{product.description}</Text>
              </TabPanel>

              {/* Вкладка с изображениями */}
              <TabPanel>
                <Box>
                  <ProductImageUploader
                    product={product}
                    images={product.images}
                    onImagesChange={(newImages) => {
                      // В реальном приложении здесь будет обновление изображений товара
                      console.log('Обновление изображений товара:', newImages);
                    }}
                  />
                </Box>
              </TabPanel>

              {/* Вкладка с характеристиками */}
              <TabPanel>
                {product.attributes && product.attributes.length > 0 ? (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Характеристика</Th>
                          <Th>Значение</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {product.attributes.map(attr => (
                          <Tr key={attr.id}>
                            <Td>{attr.name}</Td>
                            <Td>{attr.value}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Text color={textColor}>Нет данных о характеристиках товара</Text>
                )}
              </TabPanel>

              {/* Вкладка с ценами конкурентов */}
              <TabPanel>
                {product.price.competitorPrices && product.price.competitorPrices.length > 0 ? (
                  <CompetitorPricesTable
                    competitorPrices={product.price.competitorPrices}
                    currentPrice={product.price.current}
                  />
                ) : (
                  <Text color={textColor}>Нет данных о ценах конкурентов</Text>
                )}
              </TabPanel>

              {/* Вкладка с историей цен */}
              <TabPanel>
                <PriceHistoryChart productId={product.id} />
              </TabPanel>

              {/* Вкладка с продажами */}
              <TabPanel>
                <SalesChart productId={product.id} />
              </TabPanel>

              {/* Вкладка со стратегией */}
              <TabPanel>
                {product.appliedStrategyId ? (
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontWeight="bold">
                        Применена стратегия: {product.appliedStrategyId}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<SettingsIcon />}
                        onClick={() => onApplyStrategy && onApplyStrategy(product.id)}
                      >
                        Изменить стратегию
                      </Button>
                    </Flex>
                    <Text color={textColor}>
                      Стратегия ценообразования автоматически корректирует цену товара
                      в зависимости от цен конкурентов и других параметров.
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Text mb={4}>К этому товару не применена стратегия ценообразования.</Text>
                    <Button
                      colorScheme="blue"
                      leftIcon={<SettingsIcon />}
                      onClick={() => onApplyStrategy && onApplyStrategy(product.id)}
                    >
                      Применить стратегию
                    </Button>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2}>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
            >
              Закрыть
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<EditIcon />}
              onClick={() => onEditProduct && onEditProduct(product)}
            >
              Редактировать
            </Button>
            <Tooltip label="Открыть на Ozon">
              <IconButton
                aria-label="Открыть на Ozon"
                icon={<ExternalLinkIcon />}
                variant="ghost"
                as={Link}
                href={`https://ozon.ru/product/${product.ozonId || ''}`}
                isExternal
              />
            </Tooltip>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductDetailModal;
