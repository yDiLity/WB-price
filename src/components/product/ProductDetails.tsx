import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Badge,
  Divider,
  Image,
  Grid,
  GridItem,
  Heading,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  SettingsIcon,
  InfoIcon,
  StarIcon,
  ViewIcon,
  ArrowBackIcon,
  ExternalLinkIcon,
  LinkIcon,
  ChevronDownIcon,
  AddIcon
} from '@chakra-ui/icons';
import { FaFileAlt } from 'react-icons/fa';
import {
  Product,
  ProductCategory,
  ProductStatus,
  ProductCategoryNames,
  ProductStatusNames
} from '../../types/product';
import ProductPriceInfo from './ProductPriceInfo';
import { useNavigate } from 'react-router-dom';

interface ProductDetailsProps {
  product: Product;
  onBack?: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onApplyStrategy?: (productId: string) => void;
  onLinkCompetitors?: (productId: string) => void;
}

export default function ProductDetails({
  product,
  onBack,
  onEdit,
  onDelete,
  onApplyStrategy,
  onLinkCompetitors
}: ProductDetailsProps) {
  const navigate = useNavigate();
  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');

  // Статусы товаров и их цвета
  const statusColors: Record<ProductStatus, string> = {
    [ProductStatus.ACTIVE]: 'green',
    [ProductStatus.INACTIVE]: 'gray',
    [ProductStatus.PENDING]: 'yellow',
    [ProductStatus.REJECTED]: 'red',
    [ProductStatus.ARCHIVED]: 'purple'
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Получение основного изображения товара
  const mainImage = product.images.find(img => img.isMain) || product.images[0];

  return (
    <Box>
      {/* Верхняя панель с кнопкой назад и действиями */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        pb={4}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
      >
        {onBack && (
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={onBack}
            size="md"
          >
            Назад к списку
          </Button>
        )}

        <HStack spacing={2}>
          {onEdit && (
            <Button
              leftIcon={<EditIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={() => onEdit(product)}
              size="md"
            >
              Редактировать
            </Button>
          )}

          {onLinkCompetitors && (
            <Button
              leftIcon={<LinkIcon />}
              colorScheme="teal"
              variant="outline"
              onClick={() => onLinkCompetitors(product.id)}
              size="md"
            >
              Связать с конкурентами
            </Button>
          )}

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<FaFileAlt />}
              colorScheme="orange"
              variant="outline"
              size="md"
            >
              Карточка WB
              <Badge ml={2} colorScheme="blue" fontSize="xs">BETA</Badge>
            </MenuButton>
            <MenuList>
              <MenuItem
                icon={<ExternalLinkIcon />}
                onClick={() => navigate(`/wb-card/${product.id}`)}
              >
                Просмотр карточки
              </MenuItem>
              <MenuItem
                icon={<AddIcon />}
                onClick={() => navigate(`/create-wb-card?productId=${product.id}`)}
              >
                Создать новую карточку
              </MenuItem>
            </MenuList>
          </Menu>

          {onApplyStrategy && (
            <Button
              leftIcon={<SettingsIcon />}
              colorScheme="purple"
              onClick={() => onApplyStrategy(product.id)}
              size="md"
            >
              Применить стратегию
            </Button>
          )}

          {onDelete && (
            <Tooltip label="Удалить товар">
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(product.id)}
                aria-label="Удалить товар"
                size="md"
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>

      {/* Основная информация о товаре */}
      <Grid
        templateColumns={{ base: '1fr', md: '350px 1fr' }}
        gap={8}
        mb={8}
      >
        {/* Изображение товара */}
        <GridItem>
          <Box
            bg={sectionBg}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            position="relative"
          >
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={product.title}
                objectFit="contain"
                width="100%"
                height="350px"
                fallbackSrc="/images/placeholders/default.svg"
              />
            ) : (
              <Flex
                height="350px"
                align="center"
                justify="center"
                bg={sectionBg}
              >
                <Text color={textColor} fontSize="lg">Нет изображения</Text>
              </Flex>
            )}

            {/* Статус товара */}
            <Badge
              position="absolute"
              top="12px"
              right="12px"
              colorScheme={statusColors[product.status]}
              borderRadius="full"
              px={3}
              py={1}
              fontSize="0.9rem"
              fontWeight="bold"
              boxShadow="0 2px 5px rgba(0,0,0,0.1)"
            >
              {ProductStatusNames[product.status]}
            </Badge>

            {/* Галерея миниатюр */}
            {product.images.length > 1 && (
              <Flex
                mt={4}
                gap={2}
                overflowX="auto"
                p={2}
                css={{
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                  }
                }}
              >
                {product.images.map((image) => (
                  <Box
                    key={image.id}
                    width="60px"
                    height="60px"
                    borderRadius="md"
                    overflow="hidden"
                    borderWidth="2px"
                    borderColor={image.isMain ? 'blue.500' : 'transparent'}
                    cursor="pointer"
                    flexShrink={0}
                  >
                    <Image
                      src={image.url}
                      alt={product.title}
                      objectFit="cover"
                      width="100%"
                      height="100%"
                      fallbackSrc="/images/placeholders/default.svg"
                    />
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </GridItem>

        {/* Информация о товаре */}
        <GridItem>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading
                as="h1"
                size="lg"
                color={headingColor}
                fontWeight="700"
                letterSpacing="tight"
                lineHeight="1.2"
                mb={2}
              >
                {product.title}
              </Heading>

              <Flex wrap="wrap" gap={2} mb={4}>
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="0.8rem"
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
                    fontSize="0.8rem"
                  >
                    {product.brand}
                  </Badge>
                )}

                {product.subcategory && (
                  <Badge
                    colorScheme="teal"
                    variant="subtle"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="0.8rem"
                  >
                    {product.subcategory}
                  </Badge>
                )}
              </Flex>

              <Text
                fontSize="md"
                color={textColor}
                lineHeight="1.6"
                mb={4}
              >
                {product.description}
              </Text>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
                <Box>
                  <Text fontSize="sm" color={textColor}>Артикул:</Text>
                  <Text fontWeight="medium">{product.sku}</Text>
                </Box>

                {product.barcode && (
                  <Box>
                    <Text fontSize="sm" color={textColor}>Штрих-код:</Text>
                    <Text fontWeight="medium">{product.barcode}</Text>
                  </Box>
                )}

                {product.ozonId && (
                  <Box>
                    <Text fontSize="sm" color={textColor}>ID в Ozon:</Text>
                    <Text fontWeight="medium">{product.ozonId}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" color={textColor}>Создан:</Text>
                  <Text fontWeight="medium">{formatDate(product.createdAt)}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color={textColor}>Обновлен:</Text>
                  <Text fontWeight="medium">{formatDate(product.updatedAt)}</Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Информация о цене */}
            <ProductPriceInfo price={product.price} showCompetitors={true} />
          </VStack>
        </GridItem>
      </Grid>

      {/* Вкладки с дополнительной информацией */}
      <Tabs colorScheme="blue" variant="enclosed" borderRadius="lg" boxShadow="sm">
        <TabList>
          <Tab>Остатки</Tab>
          <Tab>Атрибуты</Tab>
          <Tab>Продажи</Tab>
          <Tab>Стратегия</Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка с информацией об остатках */}
          <TabPanel>
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat>
                  <StatLabel>Доступно</StatLabel>
                  <StatNumber>{product.stock.available}</StatNumber>
                  <StatHelpText>
                    {product.stock.available > 10 ? (
                      <StatArrow type="increase" />
                    ) : (
                      <StatArrow type="decrease" />
                    )}
                    {product.stock.available > 10 ? 'Достаточно' : 'Мало'}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Зарезервировано</StatLabel>
                  <StatNumber>{product.stock.reserved}</StatNumber>
                  <StatHelpText>
                    {((product.stock.reserved / Math.max(product.stock.available, 1)) * 100).toFixed(0)}% от доступных
                  </StatHelpText>
                </Stat>

                {product.stock.inbound && (
                  <Stat>
                    <StatLabel>Ожидается</StatLabel>
                    <StatNumber>{product.stock.inbound}</StatNumber>
                    <StatHelpText>
                      {product.stock.nextDeliveryDate && (
                        <>Поступление: {formatDate(product.stock.nextDeliveryDate)}</>
                      )}
                    </StatHelpText>
                  </Stat>
                )}
              </SimpleGrid>
            </Box>
          </TabPanel>

          {/* Вкладка с атрибутами товара */}
          <TabPanel>
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
            >
              {product.attributes && product.attributes.length > 0 ? (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Характеристика</Th>
                        <Th>Значение</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {product.attributes.map((attr) => (
                        <Tr key={attr.id}>
                          <Td fontWeight="medium">{attr.name}</Td>
                          <Td>{attr.value}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text color={textColor} textAlign="center" py={4}>
                  Нет данных о характеристиках товара
                </Text>
              )}
            </Box>
          </TabPanel>

          {/* Вкладка с информацией о продажах */}
          <TabPanel>
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
            >
              {product.salesStats ? (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Stat>
                    <StatLabel>Всего продано</StatLabel>
                    <StatNumber>{product.salesStats.totalSold}</StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel>За последний месяц</StatLabel>
                    <StatNumber>{product.salesStats.lastMonthSold}</StatNumber>
                    <StatHelpText>
                      {((product.salesStats.lastMonthSold / Math.max(product.salesStats.totalSold, 1)) * 100).toFixed(0)}% от общих продаж
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>За последнюю неделю</StatLabel>
                    <StatNumber>{product.salesStats.lastWeekSold}</StatNumber>
                    <StatHelpText>
                      {((product.salesStats.lastWeekSold / Math.max(product.salesStats.lastMonthSold, 1)) * 100).toFixed(0)}% от месячных продаж
                    </StatHelpText>
                  </Stat>

                  {product.salesStats.averageRating && (
                    <Stat>
                      <StatLabel>Рейтинг</StatLabel>
                      <StatNumber>
                        <Flex align="center">
                          {product.salesStats.averageRating.toFixed(1)}
                          <StarIcon ml={1} color="yellow.400" />
                        </Flex>
                      </StatNumber>
                      <StatHelpText>
                        {product.salesStats.reviewsCount} отзывов
                      </StatHelpText>
                    </Stat>
                  )}
                </SimpleGrid>
              ) : (
                <Text color={textColor} textAlign="center" py={4}>
                  Нет данных о продажах
                </Text>
              )}
            </Box>
          </TabPanel>

          {/* Вкладка со стратегией ценообразования */}
          <TabPanel>
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
            >
              {product.appliedStrategyId ? (
                <VStack align="stretch" spacing={4}>
                  <Flex align="center" justify="space-between">
                    <Heading size="md">Применена стратегия</Heading>
                    <Badge colorScheme="blue" p={2} borderRadius="md">
                      ID: {product.appliedStrategyId}
                    </Badge>
                  </Flex>

                  <Text>
                    Для просмотра деталей стратегии перейдите в раздел "Стратегии ценообразования"
                  </Text>

                  {onApplyStrategy && (
                    <Button
                      leftIcon={<SettingsIcon />}
                      colorScheme="purple"
                      onClick={() => onApplyStrategy(product.id)}
                      alignSelf="flex-start"
                      mt={2}
                    >
                      Изменить стратегию
                    </Button>
                  )}
                </VStack>
              ) : (
                <VStack align="stretch" spacing={4}>
                  <Text color={textColor} textAlign="center" py={4}>
                    Стратегия ценообразования не применена
                  </Text>

                  {onApplyStrategy && (
                    <Button
                      leftIcon={<SettingsIcon />}
                      colorScheme="purple"
                      onClick={() => onApplyStrategy(product.id)}
                      alignSelf="center"
                    >
                      Применить стратегию
                    </Button>
                  )}
                </VStack>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
