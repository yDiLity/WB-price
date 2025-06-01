import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Switch,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  Checkbox,
  CheckboxGroup,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Flex,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, NotificationPreferences } from '../types/auth';
import {
  FaStore,
  FaBox,
  FaChartLine,
  FaRubleSign,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaUser,
  FaCog,
  FaShoppingCart,
  FaTruck,
  FaPercentage,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';

// Интерфейс для данных профиля магазина
interface ShopProfile {
  id: string;
  name: string;
  email: string;
  marketplace: string;
  supplierId: string;
  workMethod: string;
  registrationDate: string;
  lastUpdate: string;
  totalProducts: number;
  activeProducts: number;
  productsOnSale: number;
  productsWithDiscount: number;
  brandsWithDiscount: number;
  productsOutOfStock: number;
  brandsOutOfStock: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageMargin: number;
  automationEnabled: boolean;
  apiConnected: boolean;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Мок-данные складов для настроек уведомлений
  const warehouses = [
    { id: '1', name: 'Хоругвино', address: 'Московская область, Солнечногорский район', region: 'Москва' },
    { id: '2', name: 'Софьино', address: 'Московская область, Раменский район', region: 'Москва' },
    { id: '3', name: 'Санкт-Петербург', address: 'Ленинградская область, Пушкинский район', region: 'Санкт-Петербург' },
    { id: '4', name: 'Екатеринбург', address: 'Свердловская область', region: 'Екатеринбург' },
    { id: '5', name: 'Новосибирск', address: 'Новосибирская область', region: 'Новосибирск' },
  ];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    telegram: false,
    telegramChatId: '',
    priorityWarehouses: [],
    priorityTimeSlots: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Данные профиля магазина - динамически обновляются при изменении API ключа
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => {
    const hasApiKey = !!apiKey;
    return {
      id: 'shop_12345',
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'yDiLity ООО' : 'yDiLity ООО',
      email: user?.email || 'shop@ydility.com',
      marketplace: 'Wildberries',
      supplierId: hasApiKey ? '123456789' : '000000000',
      workMethod: 'FBS',
      registrationDate: '15.03.2024',
      lastUpdate: hasApiKey ? '29.05.2025 12:51' : 'Не синхронизировано',
      totalProducts: hasApiKey ? 4 : 0, // Ваши 4 товара или 0
      activeProducts: hasApiKey ? 4 : 0,
      productsOnSale: hasApiKey ? 4 : 0,
      productsWithDiscount: hasApiKey ? 0 : 0,
      brandsWithDiscount: hasApiKey ? 0 : 0,
      productsOutOfStock: hasApiKey ? 0 : 0,
      brandsOutOfStock: hasApiKey ? 0 : 0,
      totalRevenue: hasApiKey ? 59680 : 0, // Сумма ваших товаров: 53400+5100+540+640
      monthlyRevenue: hasApiKey ? 185000 : 0,
      averageMargin: hasApiKey ? 23.5 : 0,
      automationEnabled: hasApiKey,
      apiConnected: hasApiKey,
    };
  });

  // Обновляем профиль при изменении API ключа
  useEffect(() => {
    const hasApiKey = !!apiKey;
    setShopProfile(prev => ({
      ...prev,
      supplierId: hasApiKey ? '123456789' : '000000000',
      lastUpdate: hasApiKey ? '29.05.2025 12:51' : 'Не синхронизировано',
      totalProducts: hasApiKey ? 4 : 0,
      activeProducts: hasApiKey ? 4 : 0,
      productsOnSale: hasApiKey ? 4 : 0,
      productsWithDiscount: hasApiKey ? 0 : 0,
      brandsWithDiscount: hasApiKey ? 0 : 0,
      productsOutOfStock: hasApiKey ? 0 : 0,
      brandsOutOfStock: hasApiKey ? 0 : 0,
      totalRevenue: hasApiKey ? 59680 : 0,
      monthlyRevenue: hasApiKey ? 185000 : 0,
      averageMargin: hasApiKey ? 23.5 : 0,
      automationEnabled: hasApiKey,
      apiConnected: hasApiKey,
    }));
  }, [apiKey]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setApiKey(user.ozonApiCredentials?.apiKey || '');
      if (user.notificationPreferences) {
        setNotificationPreferences({
          email: user.notificationPreferences.email ?? true,
          push: user.notificationPreferences.push ?? true,
          telegram: user.notificationPreferences.telegram ?? false,
          telegramChatId: user.notificationPreferences.telegramChatId || '',
          priorityWarehouses: user.notificationPreferences.priorityWarehouses || [],
          priorityTimeSlots: user.notificationPreferences.priorityTimeSlots || []
        });
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedUser: Partial<User> = {
        firstName,
        lastName,
        ozonApiCredentials: {
          ...user?.ozonApiCredentials,
          apiKey,
          clientId: user?.ozonApiCredentials?.clientId || '',
          isValid: user?.ozonApiCredentials?.isValid || false
        },
        notificationPreferences
      };

      updateUser(updatedUser);

      toast({
        title: 'Профиль обновлен',
        description: 'Ваши настройки успешно сохранены',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationChange = (field: keyof NotificationPreferences, value: any) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWarehouseChange = (selectedWarehouses: string[]) => {
    setNotificationPreferences(prev => ({
      ...prev,
      priorityWarehouses: selectedWarehouses
    }));
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Flex justify="space-between" align="center">
          <Heading size="xl" color={useColorModeValue('gray.800', 'white')}>
            👤 Профиль пользователя
          </Heading>
          <HStack>
            {isEditing ? (
              <>
                <Button
                  colorScheme="green"
                  leftIcon={<Icon as={FaSave} />}
                  onClick={() => {
                    handleSubmit(new Event('submit') as any);
                    setIsEditing(false);
                  }}
                >
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Отмена
                </Button>
              </>
            ) : (
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={FaEdit} />}
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Основная информация о магазине */}
        <Card
          bg={bgColor}
          borderWidth="2px"
          borderColor={useColorModeValue('blue.500', 'blue.300')}
          className="profile-card"
        >
          <CardHeader>
            <HStack spacing={4}>
              <Box
                boxSize="80px"
                borderRadius="xl"
                bg="purple.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="xl"
                fontWeight="bold"
              >
                WB
              </Box>
              <VStack align="start" spacing={1} flex="1">
                <Heading size="lg">
                  {shopProfile.name} ({shopProfile.workMethod})
                </Heading>
                <HStack spacing={4}>
                  <Text color={textColor}>
                    <strong>Маркетплейс:</strong> {shopProfile.marketplace}
                  </Text>
                  <Text color={textColor}>
                    <strong>ИД Поставщика:</strong> {shopProfile.supplierId}
                  </Text>
                  <Text color={textColor}>
                    <strong>Метод работы:</strong> {shopProfile.workMethod}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Badge colorScheme={shopProfile.apiConnected ? 'green' : 'red'}>
                    {shopProfile.apiConnected ? 'API подключен' : 'API не подключен'}
                  </Badge>
                  <Badge colorScheme={shopProfile.automationEnabled ? 'blue' : 'gray'}>
                    {shopProfile.automationEnabled ? 'Автоматизация включена' : 'Автоматизация выключена'}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </CardHeader>
        </Card>

        {/* Паспорт кабинета */}
        <Card
          bg={bgColor}
          borderWidth="2px"
          borderColor={useColorModeValue('blue.500', 'blue.300')}
          className="profile-card"
        >
          <CardHeader>
            <Heading size="md">📊 Паспорт кабинета</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat>
                <StatLabel>Всего товаров</StatLabel>
                <StatNumber color="blue.500">{shopProfile.totalProducts.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% за месяц
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Товаров на остатках</StatLabel>
                <StatNumber color="orange.500">{shopProfile.productsOutOfStock.toLocaleString()}</StatNumber>
                <StatHelpText>
                  {((shopProfile.productsOutOfStock / shopProfile.totalProducts) * 100).toFixed(1)}% от общего числа
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Товаров со скидкой/наценкой</StatLabel>
                <StatNumber color="purple.500">{shopProfile.productsWithDiscount.toLocaleString()}</StatNumber>
                <StatHelpText>
                  {shopProfile.brandsWithDiscount} брендов со скидкой
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Брендов со скидкой/наценкой</StatLabel>
                <StatNumber color="green.500">{shopProfile.brandsWithDiscount}</StatNumber>
                <StatHelpText>Активные акции</StatHelpText>
              </Stat>
            </SimpleGrid>

            <Divider my={6} />

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Stat>
                <StatLabel>Товаров снято с продажи</StatLabel>
                <StatNumber color="red.500">
                  {(shopProfile.totalProducts - shopProfile.productsOnSale).toLocaleString()}
                </StatNumber>
                <StatHelpText>Требуют внимания</StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Брендов снято с продажи</StatLabel>
                <StatNumber color="red.500">{shopProfile.brandsOutOfStock}</StatNumber>
                <StatHelpText>Проверьте поставки</StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Дата обновления</StatLabel>
                <StatNumber fontSize="lg" color="gray.500">
                  {shopProfile.lastUpdate}
                </StatNumber>
                <StatHelpText>Последняя синхронизация</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Настройки в табах */}
        <Tabs colorScheme="blue" isLazy>
          <TabList>
            <Tab>Основная информация</Tab>
            <Tab>Настройки уведомлений</Tab>
            <Tab>API Ozon</Tab>
            <Tab>Финансовая статистика</Tab>
          </TabList>

        <TabPanels>
          {/* Основная информация */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderRadius="md"
              boxShadow="sm"
              borderWidth="2px"
              borderColor={useColorModeValue('blue.500', 'blue.300')}
              className="settings-card"
            >
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input value={user?.email || ''} isReadOnly />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Имя</FormLabel>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ваше имя"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Фамилия</FormLabel>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ваша фамилия"
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={isSubmitting}
                    alignSelf="flex-start"
                    mt={4}
                  >
                    Сохранить изменения
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabPanel>

          {/* Настройки уведомлений */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderRadius="md"
              boxShadow="sm"
              borderWidth="2px"
              borderColor={useColorModeValue('blue.500', 'blue.300')}
              className="settings-card"
            >
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Каналы уведомлений</Heading>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="email-notifications" mb="0">
                      Email-уведомления
                    </FormLabel>
                    <Switch
                      id="email-notifications"
                      isChecked={notificationPreferences.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="push-notifications" mb="0">
                      Push-уведомления
                    </FormLabel>
                    <Switch
                      id="push-notifications"
                      isChecked={notificationPreferences.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="telegram-notifications" mb="0">
                      Telegram-уведомления
                    </FormLabel>
                    <Switch
                      id="telegram-notifications"
                      isChecked={notificationPreferences.telegram}
                      onChange={(e) => handleNotificationChange('telegram', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  {notificationPreferences.telegram && (
                    <FormControl>
                      <FormLabel>Telegram Chat ID</FormLabel>
                      <Input
                        value={notificationPreferences.telegramChatId}
                        onChange={(e) => handleNotificationChange('telegramChatId', e.target.value)}
                        placeholder="Ваш Chat ID в Telegram"
                      />
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Чтобы получить Chat ID, напишите боту @userinfobot в Telegram
                      </Text>
                    </FormControl>
                  )}

                  <Divider />

                  <Heading size="md">Приоритетные склады</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Выберите склады, для которых вы хотите получать уведомления в первую очередь
                  </Text>

                  <CheckboxGroup
                    colorScheme="blue"
                    value={notificationPreferences.priorityWarehouses}
                    onChange={handleWarehouseChange}
                  >
                    <Stack spacing={2}>
                      {warehouses.map(warehouse => (
                        <Checkbox key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>

                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={isSubmitting}
                    alignSelf="flex-start"
                    mt={4}
                  >
                    Сохранить настройки
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabPanel>

          {/* API Ozon */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderRadius="md"
              boxShadow="sm"
              borderWidth="2px"
              borderColor={useColorModeValue('blue.500', 'blue.300')}
              className="settings-card"
            >
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <Text>
                    Для автоматического бронирования слотов необходимо указать API-ключ Ozon.
                  </Text>

                  <FormControl>
                    <FormLabel>API-ключ Ozon</FormLabel>
                    <Input
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Ваш API-ключ Ozon"
                      type="password"
                    />
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      API-ключ можно получить в личном кабинете Ozon в разделе "Настройки API"
                    </Text>
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={isSubmitting}
                    alignSelf="flex-start"
                    mt={4}
                  >
                    Сохранить API-ключ
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabPanel>

          {/* Финансовая статистика */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card
                bg={bgColor}
                borderWidth="2px"
                borderColor={useColorModeValue('blue.500', 'blue.300')}
                className="profile-card"
              >
                <CardHeader>
                  <Heading size="md">💰 Финансовая статистика</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Stat>
                      <StatLabel>Общая выручка</StatLabel>
                      <StatNumber color="green.500">
                        {shopProfile.totalRevenue.toLocaleString()} ₽
                      </StatNumber>
                      <StatHelpText>За все время</StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Выручка за месяц</StatLabel>
                      <StatNumber color="blue.500">
                        {shopProfile.monthlyRevenue.toLocaleString()} ₽
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        +8.2% к прошлому месяцу
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Средняя маржинальность</StatLabel>
                      <StatNumber color="purple.500">{shopProfile.averageMargin}%</StatNumber>
                      <StatHelpText>По всем товарам</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg={bgColor}
                borderWidth="2px"
                borderColor={useColorModeValue('blue.500', 'blue.300')}
                className="profile-card"
              >
                <CardHeader>
                  <Heading size="md">🔗 Статус подключений</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status={shopProfile.apiConnected ? 'success' : 'error'}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>API Ozon</AlertTitle>
                        <AlertDescription>
                          {shopProfile.apiConnected
                            ? 'Подключение активно. Данные синхронизируются автоматически.'
                            : 'Подключение отсутствует. Настройте API ключи в разделе настроек.'
                          }
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Система мониторинга</AlertTitle>
                        <AlertDescription>
                          24/7 мониторинг цен активен. Проверка каждые 5 минут.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Alert status="warning">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Рекомендации</AlertTitle>
                        <AlertDescription>
                          Рекомендуем настроить минимальные цены для {shopProfile.productsWithDiscount} товаров со скидками.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
      </VStack>
    </Container>
  );
}
