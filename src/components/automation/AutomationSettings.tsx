import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiSettings, FiShield, FiClock, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';
import { automationService } from '../../services/automationService';
import { AutomationSettings as AutomationSettingsType, MONITORING_INTERVALS } from '../../types/automation';

interface AutomationSettingsProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
  onSettingsChange?: (settings: AutomationSettingsType) => void;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({
  productId,
  productTitle,
  currentPrice,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<AutomationSettingsType | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const helperTextColor = useColorModeValue('gray.500', 'gray.200');

  useEffect(() => {
    loadSettings();
  }, [productId]);

  const loadSettings = () => {
    const currentSettings = automationService.getAutomationSettings(productId);
    setSettings(currentSettings);

    // Загружаем API ключи
    const savedApiKey = localStorage.getItem('ozonApiKey') || '';
    const savedClientId = localStorage.getItem('ozonClientId') || '';
    setApiKey(savedApiKey);
    setClientId(savedClientId);
  };

  const updateSettings = (updates: Partial<AutomationSettingsType>) => {
    if (!settings) return;

    const updatedSettings = automationService.updateAutomationSettings(productId, updates);
    setSettings(updatedSettings);

    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }

    toast({
      title: 'Настройки обновлены',
      description: 'Изменения сохранены и вступили в силу',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleOzonAutoUpdateToggle = (enabled: boolean) => {
    automationService.toggleOzonAutoUpdate(productId, enabled);
    loadSettings();

    toast({
      title: enabled ? 'Автообновление включено' : 'Автообновление отключено',
      description: enabled
        ? 'Цены будут изменяться на Ozon автоматически без подтверждения'
        : 'Изменения цен потребуют ручного подтверждения',
      status: enabled ? 'success' : 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleApiKeysUpdate = () => {
    automationService.setOzonApiKeys(apiKey, clientId);
    toast({
      title: 'API ключи обновлены',
      description: 'Подключение к Ozon API настроено',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const monitoringStatus = automationService.getMonitoringStatus();
  const ozonApiStatus = automationService.getOzonApiStatus();

  if (!settings) {
    return <Box>Загрузка настроек...</Box>;
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiSettings />
            <Heading size="md">⚙️ Автоматизация для "{productTitle}"</Heading>
          </HStack>
        </CardHeader>
      </Card>

      {/* Статус мониторинга */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="sm">📊 Статус системы</Heading>
            <Badge colorScheme="green">24/7 Активен</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Проверок сегодня</StatLabel>
              <StatNumber>{monitoringStatus.checksToday}</StatNumber>
              <StatHelpText>Автоматических проверок</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Изменений сегодня</StatLabel>
              <StatNumber color="green.500">{monitoringStatus.successfulChangesToday}</StatNumber>
              <StatHelpText>Успешных обновлений</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Ошибок сегодня</StatLabel>
              <StatNumber color="red.500">{monitoringStatus.errorsToday}</StatNumber>
              <StatHelpText>Неудачных попыток</StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Основные настройки */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiZap />
            <Heading size="sm">🚀 Автоматическое изменение цен на Ozon</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Главная галочка */}
            <Alert status={settings.ozonAutoUpdate ? 'success' : 'warning'} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">
                  {settings.ozonAutoUpdate ? 'Автообновление активно' : 'Автообновление отключено'}
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {settings.ozonAutoUpdate
                    ? 'Цены изменяются на Ozon автоматически без подтверждения'
                    : 'Все изменения цен требуют ручного подтверждения'
                  }
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="ozon-auto-update" mb="0" flex="1">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold" color={textColor}>Изменять цены на Ozon автоматически</Text>
                  <Text fontSize="sm" color={helperTextColor}>
                    При включении цены будут обновляться без вашего участия
                  </Text>
                </VStack>
              </FormLabel>
              <Switch
                id="ozon-auto-update"
                size="lg"
                isChecked={settings.ozonAutoUpdate}
                onChange={(e) => handleOzonAutoUpdateToggle(e.target.checked)}
                colorScheme="green"
              />
            </FormControl>

            {settings.ozonAutoUpdate && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  <strong>Внимание:</strong> При включенном автообновлении система будет изменять цены
                  на Ozon без вашего подтверждения. Убедитесь, что настроили правильные ограничения безопасности.
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Настройки безопасности */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiShield />
            <Heading size="sm">🛡️ Ограничения безопасности</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Максимальное изменение цены за раз (%)</FormLabel>
              <NumberInput
                value={settings.maxPriceChangePercent}
                onChange={(_, value) => updateSettings({ maxPriceChangePercent: value || 10 })}
                min={1}
                max={50}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Текущая цена: {currentPrice} ₽.
                Максимальное изменение: ±{((currentPrice * settings.maxPriceChangePercent) / 100).toFixed(2)} ₽
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Максимальное количество изменений в день</FormLabel>
              <NumberInput
                value={settings.maxDailyChanges}
                onChange={(_, value) => updateSettings({ maxDailyChanges: value || 5 })}
                min={1}
                max={20}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Защита от слишком частых изменений</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Минимальное время между изменениями (минуты)</FormLabel>
              <NumberInput
                value={settings.minTimeBetweenChanges}
                onChange={(_, value) => updateSettings({ minTimeBetweenChanges: value || 30 })}
                min={5}
                max={1440}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Пауза между автоматическими изменениями</FormHelperText>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Настройки API */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <FiSettings />
              <Heading size="sm">🔑 Настройки Ozon API</Heading>
            </HStack>
            <Badge colorScheme={ozonApiStatus.hasValidKeys ? 'green' : 'red'}>
              {ozonApiStatus.hasValidKeys ? 'Подключено' : 'Не настроено'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {!ozonApiStatus.hasValidKeys && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Для автоматического изменения цен необходимо настроить API ключи Ozon
                </AlertDescription>
              </Alert>
            )}

            <FormControl>
              <FormLabel>API Key</FormLabel>
              <InputGroup>
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Введите API ключ Ozon"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Показать/скрыть"
                    icon={showApiKeys ? <FiEyeOff /> : <FiEye />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Client ID</FormLabel>
              <Input
                type={showApiKeys ? 'text' : 'password'}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Введите Client ID Ozon"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleApiKeysUpdate}
              isDisabled={!apiKey || !clientId}
            >
              Сохранить API ключи
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Информация о 24/7 мониторинге */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>📡 24/7 Мониторинг всегда активен</AlertTitle>
          <AlertDescription>
            Система автоматически отслеживает цены конкурентов каждые 5 минут круглосуточно.
            Последняя проверка: {new Date(monitoringStatus.lastCheck).toLocaleString('ru-RU')}
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );
};
