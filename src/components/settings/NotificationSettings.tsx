import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useColorModeValue,
  useToast,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Link
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaBell, FaTelegram, FaEnvelope, FaTest, FaExternalLinkAlt } from 'react-icons/fa';
import { notificationService, NotificationConfig } from '../../services/notificationService';

export default function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const currentConfig = notificationService.getConfig();
    setConfig(currentConfig);
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setIsLoading(true);

    try {
      notificationService.saveConfig(config);

      toast({
        title: '✅ Настройки сохранены',
        description: 'Конфигурация уведомлений успешно обновлена',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось сохранить настройки',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const results = await notificationService.testNotifications();
      setTestResults(results);

      if (results.telegram || results.email) {
        toast({
          title: '✅ Тест завершен',
          description: 'Проверьте ваши каналы уведомлений',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: '⚠️ Тест не пройден',
          description: 'Проверьте настройки уведомлений',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      }

    } catch (error) {
      toast({
        title: '❌ Ошибка тестирования',
        description: 'Не удалось выполнить тест уведомлений',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsTesting(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    if (!config) return;

    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  if (!config) {
    return <Text>Загрузка настроек...</Text>;
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <FaBell color="purple" />
            <Heading size="lg" color="purple.600">
              🚨 Настройка уведомлений о банах
            </Heading>
            <Badge colorScheme="blue" size="sm">
              Real-time
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Настройте уведомления в Telegram и Email для мгновенного получения информации о блокировках
          </Text>
        </CardHeader>
      </Card>

      {/* Основные настройки */}
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList className="purple-tab-border">
          <Tab>
            <HStack spacing={2}>
              <FaTelegram />
              <Text>Telegram</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FaEnvelope />
              <Text>Email</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FaTest />
              <Text>Тестирование</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Telegram настройки */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              <Alert status="info" className="purple-alert-border">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <AlertTitle>📱 Как настроить Telegram уведомления</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={1} fontSize="sm">
                      <Text>1. Найдите @BotFather в Telegram</Text>
                      <Text>2. Выполните команду /newbot</Text>
                      <Text>3. Дайте имя боту (например: "WB Parser Bot")</Text>
                      <Text>4. Скопируйте полученный токен</Text>
                      <Text>5. Напишите что-то своему боту</Text>
                      <Text>6. Получите Chat ID через: 
                        <Link 
                          href="https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates" 
                          isExternal 
                          color="blue.500"
                          ml={1}
                        >
                          API <FaExternalLinkAlt style={{ display: 'inline' }} />
                        </Link>
                      </Text>
                    </VStack>
                  </AlertDescription>
                </VStack>
              </Alert>

              <Card className="purple-card-border" bg={cardBg}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">📱 Telegram настройки</Heading>
                    <Switch
                      isChecked={config.telegram.enabled}
                      onChange={(e) => updateConfig('telegram.enabled', e.target.checked)}
                      colorScheme="purple"
                    />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Bot Token</FormLabel>
                      <Input
                        type="password"
                        value={config.telegram.botToken}
                        onChange={(e) => updateConfig('telegram.botToken', e.target.value)}
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                        className="purple-input-border"
                        isDisabled={!config.telegram.enabled}
                      />
                      <FormHelperText>
                        Токен бота, полученный от @BotFather
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Chat ID</FormLabel>
                      <Input
                        value={config.telegram.chatId}
                        onChange={(e) => updateConfig('telegram.chatId', e.target.value)}
                        placeholder="123456789"
                        className="purple-input-border"
                        isDisabled={!config.telegram.enabled}
                      />
                      <FormHelperText>
                        Ваш Chat ID для получения уведомлений
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Cooldown (минуты)</FormLabel>
                      <NumberInput
                        value={config.telegram.cooldown}
                        onChange={(value) => updateConfig('telegram.cooldown', parseInt(value) || 5)}
                        min={1}
                        max={60}
                        isDisabled={!config.telegram.enabled}
                      >
                        <NumberInputField className="purple-input-border" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormHelperText>
                        Минимальный интервал между уведомлениями
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Email настройки */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              <Alert status="warning" className="purple-alert-border">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <AlertTitle>📧 Email уведомления</AlertTitle>
                  <AlertDescription>
                    <Text fontSize="sm">
                      Email уведомления отправляются через backend сервер. 
                      Убедитесь, что сервер настроен для отправки почты.
                      Для Gmail используйте App Password вместо обычного пароля.
                    </Text>
                  </AlertDescription>
                </VStack>
              </Alert>

              <Card className="purple-card-border" bg={cardBg}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">📧 Email настройки</Heading>
                    <Switch
                      isChecked={config.email.enabled}
                      onChange={(e) => updateConfig('email.enabled', e.target.checked)}
                      colorScheme="purple"
                    />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Email отправителя</FormLabel>
                      <Input
                        type="email"
                        value={config.email.from}
                        onChange={(e) => updateConfig('email.from', e.target.value)}
                        placeholder="your.email@gmail.com"
                        className="purple-input-border"
                        isDisabled={!config.email.enabled}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email получателя</FormLabel>
                      <Input
                        type="email"
                        value={config.email.to}
                        onChange={(e) => updateConfig('email.to', e.target.value)}
                        placeholder="alerts@yourcompany.com"
                        className="purple-input-border"
                        isDisabled={!config.email.enabled}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Cooldown (минуты)</FormLabel>
                      <NumberInput
                        value={config.email.cooldown}
                        onChange={(value) => updateConfig('email.cooldown', parseInt(value) || 10)}
                        min={1}
                        max={120}
                        isDisabled={!config.email.enabled}
                      >
                        <NumberInputField className="purple-input-border" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormHelperText>
                        Минимальный интервал между email уведомлениями
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Тестирование */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              <Card className="purple-card-border" bg={cardBg}>
                <CardHeader>
                  <Heading size="md">🧪 Тестирование уведомлений</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="gray.600">
                      Отправьте тестовые уведомления для проверки настроек
                    </Text>

                    <Button
                      colorScheme="blue"
                      onClick={handleTestNotifications}
                      isLoading={isTesting}
                      loadingText="Тестирование..."
                      className="purple-button-border"
                      leftIcon={<FaTest />}
                    >
                      Отправить тестовые уведомления
                    </Button>

                    {testResults && (
                      <Alert 
                        status={testResults.telegram || testResults.email ? 'success' : 'error'} 
                        className="purple-alert-border"
                      >
                        <AlertIcon />
                        <VStack align="start" spacing={2}>
                          <AlertTitle>Результаты тестирования</AlertTitle>
                          <AlertDescription>
                            <VStack align="start" spacing={1} fontSize="sm">
                              <HStack>
                                <Text fontWeight="bold">Telegram:</Text>
                                <Badge colorScheme={testResults.telegram ? 'green' : 'red'}>
                                  {testResults.telegram ? 'Успешно' : 'Ошибка'}
                                </Badge>
                              </HStack>
                              <HStack>
                                <Text fontWeight="bold">Email:</Text>
                                <Badge colorScheme={testResults.email ? 'green' : 'red'}>
                                  {testResults.email ? 'Успешно' : 'Ошибка'}
                                </Badge>
                              </HStack>
                              {testResults.errors.length > 0 && (
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" color="red.500">Ошибки:</Text>
                                  {testResults.errors.map((error: string, index: number) => (
                                    <Code key={index} fontSize="xs" colorScheme="red">
                                      {error}
                                    </Code>
                                  ))}
                                </VStack>
                              )}
                            </VStack>
                          </AlertDescription>
                        </VStack>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Кнопки управления */}
      <HStack spacing={4}>
        <Button
          colorScheme="green"
          onClick={handleSaveConfig}
          isLoading={isLoading}
          loadingText="Сохранение..."
          className="purple-button-border"
        >
          Сохранить настройки
        </Button>

        <Button
          variant="outline"
          onClick={loadConfig}
          className="purple-button-border"
        >
          Сбросить изменения
        </Button>
      </HStack>

      {/* Информация о типах уведомлений */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">📋 Типы уведомлений</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch" fontSize="sm">
            <HStack>
              <Badge colorScheme="red">🚨 BAN</Badge>
              <Text>Обнаружена блокировка IP или fingerprint</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅ UNBAN</Badge>
              <Text>Успешное восстановление после блокировки</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="orange">💥 CRITICAL</Badge>
              <Text>Критическая ошибка, требующая вмешательства</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="yellow">⚠️ WARNING</Badge>
              <Text>Предупреждение о потенциальных проблемах</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
