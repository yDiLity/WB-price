import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Code,
  UnorderedList,
  ListItem
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { ozonApiService } from '../services/ozonApi';
import { aiService } from '../services/aiService';
import { telegramService } from '../services/telegramService';
import TelegramSettings from '../components/settings/TelegramSettings';
import ThemeToggleButton from '../components/common/ThemeToggleButton';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Состояния для API Ozon
  const [ozonClientId, setOzonClientId] = useState('');
  const [ozonApiKey, setOzonApiKey] = useState('');
  const [isOzonApiConnected, setIsOzonApiConnected] = useState(false);
  const [isTestingOzonApi, setIsTestingOzonApi] = useState(false);

  // Состояния для ИИ-сервиса
  const [aiApiKey, setAiApiKey] = useState('');
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Состояния для Telegram-бота
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  // Состояния для настроек уведомлений
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [autoApplyPriceChanges, setAutoApplyPriceChanges] = useState(false);

  // Инициализация состояний из пользовательских данных
  useEffect(() => {
    if (user) {
      setEmailNotifications(user.settings.emailNotifications);
      setTelegramNotifications(user.settings.telegramNotifications);
      setAutoApplyPriceChanges(user.settings.autoApplyPriceChanges);

      if (user.settings.telegramChatId) {
        setTelegramChatId(user.settings.telegramChatId);
      }
    }

    // Проверяем, инициализированы ли сервисы
    setIsOzonApiConnected(ozonApiService.isInitialized());
    setIsAiConnected(aiService.isInitialized());
    setIsTelegramConnected(telegramService.isInitialized());
  }, [user]);

  // Обработчик подключения API Ozon
  const handleConnectOzonApi = async () => {
    if (!ozonClientId || !ozonApiKey) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите Client ID и API-ключ Ozon',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsTestingOzonApi(true);

    try {
      const success = ozonApiService.initialize(ozonClientId, ozonApiKey);

      if (success) {
        setIsOzonApiConnected(true);
        toast({
          title: 'Успешно',
          description: 'API Ozon успешно подключен',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error connecting to Ozon API:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к API Ozon. Проверьте введенные данные.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTestingOzonApi(false);
    }
  };

  // Обработчик подключения ИИ-сервиса
  const handleConnectAi = async () => {
    // Даже если API-ключ не указан, мы все равно инициализируем сервис
    // с пустым ключом, чтобы использовать локальную функциональность
    setIsTestingAi(true);

    try {
      // Инициализируем сервис с ключом или без него
      const success = aiService.initialize(aiApiKey || 'local_mode');

      if (success) {
        setIsAiConnected(true);
        toast({
          title: 'Успешно',
          description: aiApiKey
            ? 'ИИ-сервис успешно подключен с API-ключом'
            : 'ИИ-сервис успешно подключен в локальном режиме',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error connecting to AI service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к ИИ-сервису. Проверьте введенные данные.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  // Обработчик подключения Telegram-бота
  const handleConnectTelegram = async () => {
    if (!telegramChatId) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите Chat ID, полученный от бота',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsTestingTelegram(true);

    try {
      // Используем фиксированный токен для официального бота
      const success = telegramService.initialize('OzonPriceOptimizerBot');

      if (success) {
        setIsTelegramConnected(true);

        // Сохраняем Chat ID в настройках пользователя
        if (user) {
          updateUser({
            settings: {
              ...user.settings,
              telegramChatId
            }
          });
        }

        toast({
          title: 'Успешно',
          description: 'Telegram-бот успешно подключен',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error connecting to Telegram:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к Telegram. Проверьте введенные данные.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // Обработчик отправки тестового сообщения в Telegram
  const handleSendTestMessage = async () => {
    if (!telegramChatId) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите Chat ID',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsTestingTelegram(true);

    try {
      // Создаем моковые данные для теста
      const mockProduct = {
        id: 'test-product',
        name: 'Тестовый товар',
        currentPrice: 1000,
        priceHistory: []
      } as any;

      const mockPriceChange = {
        id: 'test-price-change',
        oldPrice: 1000,
        newPrice: 950,
        date: new Date().toISOString(),
        reason: 'Тестовое сообщение',
        isAutomatic: false
      };

      const success = await telegramService.sendPriceChangeNotification(
        telegramChatId,
        mockProduct,
        mockPriceChange
      );

      if (success) {
        toast({
          title: 'Успешно',
          description: 'Тестовое сообщение отправлено',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Сохраняем Chat ID в настройках пользователя
        if (user) {
          updateUser({
            settings: {
              ...user.settings,
              telegramChatId
            }
          });
        }
      } else {
        throw new Error('Failed to send test message');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить тестовое сообщение. Проверьте введенные данные.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // Обработчик сохранения настроек уведомлений
  const handleSaveNotificationSettings = () => {
    if (user) {
      updateUser({
        settings: {
          ...user.settings,
          emailNotifications,
          telegramNotifications,
          autoApplyPriceChanges,
          telegramChatId
        }
      });

      toast({
        title: 'Успешно',
        description: 'Настройки уведомлений сохранены',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Цвета для компонентов
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Настройки</Heading>

      <Tabs colorScheme="blue" isLazy>
        <TabList mb={6}>
          <Tab>API Ozon</Tab>
          <Tab>ИИ-функциональность</Tab>
          <Tab>Telegram-бот</Tab>
          <Tab>Уведомления</Tab>
          <Tab>Пользователи</Tab>
          <Tab>Интерфейс</Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка API Ozon */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Настройки API Ozon</Heading>
                <Text mt={2} color="gray.600">
                  Для работы с API Ozon необходимо указать Client ID и API-ключ из личного кабинета продавца Ozon.
                </Text>
              </CardHeader>

              <CardBody>
                <VStack spacing={6} align="stretch">
                  {isOzonApiConnected && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>API Ozon подключен</AlertTitle>
                        <AlertDescription>
                          Вы успешно подключили API Ozon. Теперь вы можете получать данные о товарах и обновлять цены.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  <FormControl>
                    <FormLabel>Client ID</FormLabel>
                    <Input
                      value={ozonClientId}
                      onChange={(e) => setOzonClientId(e.target.value)}
                      placeholder="Введите Client ID из личного кабинета Ozon"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>API-ключ</FormLabel>
                    <Input
                      type="password"
                      value={ozonApiKey}
                      onChange={(e) => setOzonApiKey(e.target.value)}
                      placeholder="Введите API-ключ из личного кабинета Ozon"
                    />
                  </FormControl>
                </VStack>
              </CardBody>

              <CardFooter>
                <Button
                  colorScheme="blue"
                  onClick={handleConnectOzonApi}
                  isLoading={isTestingOzonApi}
                  isDisabled={!ozonClientId || !ozonApiKey}
                >
                  {isOzonApiConnected ? 'Обновить подключение' : 'Подключить API Ozon'}
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>

          {/* Вкладка ИИ-функциональность */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Настройки ИИ-функциональности</Heading>
                <Text mt={2} color="gray.600">
                  Для работы с ИИ-функциональностью можно указать API-ключ или использовать локальный режим.
                </Text>
              </CardHeader>

              <CardBody>
                <VStack spacing={6} align="stretch">
                  {isAiConnected && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>ИИ-сервис подключен</AlertTitle>
                        <AlertDescription>
                          Вы успешно подключили ИИ-сервис. Теперь вы можете использовать функции прогнозирования спроса и оптимизации цен.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  <FormControl>
                    <FormLabel>API-ключ для ИИ-сервиса (необязательно)</FormLabel>
                    <Input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Введите API-ключ для ИИ-сервиса или оставьте пустым для локального режима"
                    />
                  </FormControl>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Локальный режим</AlertTitle>
                      <AlertDescription>
                        Если вы не укажете API-ключ, система будет использовать локальный режим анализа.
                        В этом режиме все вычисления выполняются на вашем устройстве без отправки данных на внешние серверы.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>

              <CardFooter>
                <Button
                  colorScheme="blue"
                  onClick={handleConnectAi}
                  isLoading={isTestingAi}
                >
                  {isAiConnected ? 'Обновить подключение' : 'Подключить ИИ-сервис'}
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>

          {/* Вкладка Telegram-бот */}
          <TabPanel px={0}>
            <TelegramSettings
              onSettingsChange={() => {
                setIsTelegramConnected(telegramService.isInitialized());
                toast({
                  title: 'Настройки обновлены',
                  description: 'Настройки Telegram-бота успешно обновлены',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            />
          </TabPanel>

          {/* Вкладка Уведомления */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Настройки уведомлений</Heading>
                <Text mt={2} color="gray.600">
                  Настройте способы получения уведомлений и автоматическое применение изменений цен.
                </Text>
              </CardHeader>

              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="email-notifications" mb="0">
                      Уведомления по email
                    </FormLabel>
                    <Switch
                      id="email-notifications"
                      isChecked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="telegram-notifications" mb="0">
                      Уведомления в Telegram
                    </FormLabel>
                    <Switch
                      id="telegram-notifications"
                      isChecked={telegramNotifications}
                      onChange={(e) => setTelegramNotifications(e.target.checked)}
                      colorScheme="blue"
                      isDisabled={!isTelegramConnected || !telegramChatId}
                    />
                  </FormControl>

                  <Divider />

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-apply-price-changes" mb="0">
                      Автоматически применять изменения цен
                    </FormLabel>
                    <Switch
                      id="auto-apply-price-changes"
                      isChecked={autoApplyPriceChanges}
                      onChange={(e) => setAutoApplyPriceChanges(e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>
                </VStack>
              </CardBody>

              <CardFooter>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveNotificationSettings}
                >
                  Сохранить настройки
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>

          {/* Вкладка Пользователи */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Управление подключенными пользователями</Heading>
                <Text mt={2} color="gray.600">
                  Управляйте пользователями, которые подключены к Telegram-боту и получают уведомления.
                </Text>
              </CardHeader>

              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Общий пароль для всех пользователей</Text>
                      <Text>
                        Все пользователи используют один и тот же пароль для доступа к Telegram-боту: <Code>ozonpro2025</Code>
                      </Text>
                      <Text mt={2}>
                        Безопасность обеспечивается уникальностью Chat ID каждого пользователя.
                      </Text>
                    </Box>
                  </Alert>

                  <Text>
                    На странице управления подключенными пользователями вы можете:
                  </Text>

                  <UnorderedList spacing={2} pl={4}>
                    <ListItem>Просматривать список подключенных пользователей</ListItem>
                    <ListItem>Отправлять тестовые сообщения</ListItem>
                    <ListItem>Удалять подключения пользователей</ListItem>
                    <ListItem>Копировать Chat ID пользователей</ListItem>
                  </UnorderedList>
                </VStack>
              </CardBody>

              <CardFooter>
                <Button
                  as={RouterLink}
                  to="/users"
                  colorScheme="blue"
                  rightIcon={<ExternalLinkIcon />}
                >
                  Перейти к управлению подключенными пользователями
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>

          {/* Вкладка Интерфейс */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Настройки интерфейса</Heading>
                <Text mt={2} color="gray.600">
                  Настройте внешний вид приложения под свои предпочтения.
                </Text>
              </CardHeader>

              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="sm" mb={4}>Тема оформления</Heading>

                    <HStack spacing={6} align="center">
                      <Text fontWeight="medium">Выберите тему:</Text>
                      <ThemeToggleButton variant="full" showLabel={true} />
                    </HStack>

                    <Text mt={4} fontSize="sm" color="gray.500">
                      Вы также можете быстро переключать тему с помощью кнопки в правом верхнем углу экрана.
                    </Text>
                  </Box>

                  <Divider />

                  <Box>
                    <Heading size="sm" mb={4}>Другие настройки интерфейса</Heading>

                    <FormControl display="flex" alignItems="center" mb={3}>
                      <FormLabel htmlFor="compact-view" mb="0">
                        Компактный вид
                      </FormLabel>
                      <Switch
                        id="compact-view"
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="show-tooltips" mb="0">
                        Показывать подсказки
                      </FormLabel>
                      <Switch
                        id="show-tooltips"
                        colorScheme="blue"
                        defaultChecked
                      />
                    </FormControl>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
