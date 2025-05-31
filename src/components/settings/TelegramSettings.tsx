import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Badge,
  IconButton,
  Divider,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Switch,
  FormHelperText,
  useColorModeValue,
  Code,
  Link,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaRobot, FaTelegram, FaExternalLinkAlt, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { telegramService } from '../../services/telegramService';

interface TelegramSettingsProps {
  onSettingsChange?: () => void;
}

export default function TelegramSettings({ onSettingsChange }: TelegramSettingsProps) {
  const toast = useToast();
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [chatIds, setChatIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isTestingSend, setIsTestingSend] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    loadSettings();
  }, []);

  // Загрузка настроек из сервиса
  const loadSettings = () => {
    const initialized = telegramService.isInitialized();
    setIsInitialized(initialized);
    
    if (initialized) {
      setChatIds(telegramService.getChatIds());
    }
  };

  // Сохранение настроек
  const saveSettings = () => {
    if (!botToken) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен бота',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      telegramService.initialize(botToken);
      setIsInitialized(true);
      
      toast({
        title: 'Успешно',
        description: 'Настройки Telegram-бота сохранены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (error) {
      console.error('Error saving Telegram settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки Telegram-бота',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Добавление нового ID чата
  const addChatId = () => {
    if (!chatId) {
      toast({
        title: 'Ошибка',
        description: 'Введите ID чата',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAdding(true);

    try {
      const success = telegramService.addChatId(chatId);
      
      if (success) {
        setChatIds(telegramService.getChatIds());
        setChatId('');
        
        toast({
          title: 'Успешно',
          description: 'ID чата добавлен',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        if (onSettingsChange) {
          onSettingsChange();
        }
      } else {
        toast({
          title: 'Предупреждение',
          description: 'Этот ID чата уже добавлен',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error adding chat ID:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить ID чата',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Удаление ID чата
  const removeChatId = (id: string) => {
    try {
      const success = telegramService.removeChatId(id);
      
      if (success) {
        setChatIds(telegramService.getChatIds());
        
        toast({
          title: 'Успешно',
          description: 'ID чата удален',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        if (onSettingsChange) {
          onSettingsChange();
        }
      }
    } catch (error) {
      console.error('Error removing chat ID:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить ID чата',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Отправка тестового сообщения
  const sendTestMessage = async () => {
    if (chatIds.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы один ID чата',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTestingSend(true);

    try {
      const success = await telegramService.sendNotification({
        type: 'test' as any,
        title: '🔔 Тестовое уведомление',
        message: 'Это тестовое уведомление от Ozon Price Optimizer Pro. Если вы видите это сообщение, значит настройки Telegram-бота работают корректно.'
      });
      
      if (success) {
        toast({
          title: 'Успешно',
          description: 'Тестовое сообщение отправлено',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось отправить тестовое сообщение',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить тестовое сообщение',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTestingSend(false);
    }
  };

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
      <CardHeader>
        <Flex align="center">
          <FaTelegram size={24} color="#0088cc" />
          <Heading size="md" ml={2}>Настройки Telegram-уведомлений</Heading>
          <Spacer />
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="telegram-notifications" mb="0">
              Уведомления
            </FormLabel>
            <Switch
              id="telegram-notifications"
              isChecked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>
        </Flex>
      </CardHeader>

      <CardBody>
        <VStack spacing={4} align="stretch">
          {!isInitialized && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Настройка Telegram-бота</AlertTitle>
                <AlertDescription>
                  Для получения уведомлений в Telegram необходимо создать бота и указать его токен.
                  <Link href="https://core.telegram.org/bots#how-do-i-create-a-bot" isExternal color="blue.500" ml={1}>
                    Инструкция <FaExternalLinkAlt size={12} style={{ display: 'inline', marginBottom: '2px' }} />
                  </Link>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <FormControl>
            <FormLabel>Токен бота</FormLabel>
            <Input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Введите токен бота"
            />
            <FormHelperText>
              Получите токен у @BotFather в Telegram
            </FormHelperText>
          </FormControl>

          <Button
            colorScheme="blue"
            onClick={saveSettings}
            isLoading={isSaving}
            leftIcon={<FaRobot />}
            isDisabled={!botToken}
          >
            {isInitialized ? 'Обновить настройки бота' : 'Сохранить настройки бота'}
          </Button>

          {isInitialized && (
            <>
              <Divider my={2} />

              <Text fontWeight="bold">Получатели уведомлений</Text>

              <HStack>
                <FormControl>
                  <FormLabel>ID чата</FormLabel>
                  <Input
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="Введите ID чата"
                  />
                  <FormHelperText>
                    Используйте бота @userinfobot, чтобы узнать ваш ID
                  </FormHelperText>
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={addChatId}
                  isLoading={isAdding}
                  leftIcon={<FaPlus />}
                  mt={8}
                  isDisabled={!chatId}
                >
                  Добавить
                </Button>
              </HStack>

              {chatIds.length > 0 ? (
                <VStack align="stretch" spacing={2}>
                  {chatIds.map((id) => (
                    <HStack key={id} p={2} borderWidth="1px" borderRadius="md">
                      <Text flex="1">{id}</Text>
                      <IconButton
                        aria-label="Удалить ID чата"
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeChatId(id)}
                      />
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Добавьте хотя бы один ID чата для получения уведомлений
                  </AlertDescription>
                </Alert>
              )}

              <Button
                colorScheme="blue"
                onClick={sendTestMessage}
                isLoading={isTestingSend}
                leftIcon={<FaTelegram />}
                isDisabled={chatIds.length === 0}
                variant="outline"
              >
                Отправить тестовое сообщение
              </Button>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
