import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Badge,
  Tooltip,
  IconButton,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Heading,
  Checkbox,
  Icon
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { FaBell, FaTelegram, FaEnvelope, FaMobile, FaPercentage, FaRubleSign } from 'react-icons/fa';
import { Product } from '../../types';
import HelpTooltip from '../common/HelpTooltip';

interface PriceAlert {
  id: string;
  name: string;
  isActive: boolean;
  condition: {
    type: 'below_threshold' | 'above_threshold' | 'price_change' | 'competitor_price_change';
    value: number;
    unit: 'percent' | 'absolute';
  };
  notificationChannels: {
    email: boolean;
    telegram: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface PriceAlertSettingsProps {
  product: Product;
  onSaveAlerts: (alerts: PriceAlert[]) => void;
}

/**
 * Компонент для настройки уведомлений о ценах
 */
const PriceAlertSettings: React.FC<PriceAlertSettingsProps> = ({
  product,
  onSaveAlerts
}) => {
  // Состояние для уведомлений
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAddingAlert, setIsAddingAlert] = useState<boolean>(false);

  // Состояние для нового уведомления
  const [newAlert, setNewAlert] = useState<Omit<PriceAlert, 'id'>>({
    name: '',
    isActive: true,
    condition: {
      type: 'below_threshold',
      value: 5,
      unit: 'percent'
    },
    notificationChannels: {
      email: true,
      telegram: false,
      sms: false,
      push: true
    }
  });

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Toast для уведомлений
  const toast = useToast();

  // Загрузка уведомлений из продукта при монтировании компонента
  useEffect(() => {
    if (product.priceAlerts) {
      setAlerts(product.priceAlerts);
    }
  }, [product]);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Обработчик добавления нового уведомления
  const handleAddAlert = () => {
    if (!newAlert.name) {
      toast({
        title: 'Ошибка',
        description: 'Введите название уведомления',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newAlertWithId: PriceAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`
    };

    setAlerts([...alerts, newAlertWithId]);
    setIsAddingAlert(false);

    // Сбрасываем форму нового уведомления
    setNewAlert({
      name: '',
      isActive: true,
      condition: {
        type: 'below_threshold',
        value: 5,
        unit: 'percent'
      },
      notificationChannels: {
        email: true,
        telegram: false,
        sms: false,
        push: true
      }
    });

    toast({
      title: 'Уведомление добавлено',
      description: 'Новое уведомление о цене добавлено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик удаления уведомления
  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));

    toast({
      title: 'Уведомление удалено',
      description: 'Уведомление о цене удалено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик изменения активности уведомления
  const handleToggleAlertActive = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  // Обработчик сохранения уведомлений
  const handleSaveAlerts = () => {
    onSaveAlerts(alerts);

    toast({
      title: 'Уведомления сохранены',
      description: 'Настройки уведомлений о ценах сохранены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Получение описания уведомления
  const getAlertDescription = (alert: PriceAlert) => {
    let conditionText = '';

    // Описание условия
    switch (alert.condition.type) {
      case 'below_threshold':
        conditionText = `Цена ниже ${alert.condition.unit === 'percent' ? `${alert.condition.value}% от текущей` : formatPrice(alert.condition.value)}`;
        break;
      case 'above_threshold':
        conditionText = `Цена выше ${alert.condition.unit === 'percent' ? `${alert.condition.value}% от текущей` : formatPrice(alert.condition.value)}`;
        break;
      case 'price_change':
        conditionText = `Изменение цены на ${alert.condition.value}${alert.condition.unit === 'percent' ? '%' : ' руб.'}`;
        break;
      case 'competitor_price_change':
        conditionText = `Изменение цены конкурента на ${alert.condition.value}${alert.condition.unit === 'percent' ? '%' : ' руб.'}`;
        break;
    }

    // Каналы уведомлений
    const channels = [];
    if (alert.notificationChannels.email) channels.push('Email');
    if (alert.notificationChannels.telegram) channels.push('Telegram');
    if (alert.notificationChannels.sms) channels.push('SMS');
    if (alert.notificationChannels.push) channels.push('Push');

    return `${conditionText} (${channels.join(', ')})`;
  };

  // Получение иконки для типа условия
  const getConditionIcon = (type: string) => {
    switch (type) {
      case 'below_threshold':
        return <Icon as={FaPercentage} color="red.500" />;
      case 'above_threshold':
        return <Icon as={FaPercentage} color="green.500" />;
      case 'price_change':
        return <Icon as={FaRubleSign} color="blue.500" />;
      case 'competitor_price_change':
        return <Icon as={FaRubleSign} color="purple.500" />;
      default:
        return <InfoIcon color="gray.500" />;
    }
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Heading size="md">Уведомления о ценах</Heading>
          <HelpTooltip
            label="Уведомления о ценах"
            description="Настройка уведомлений об изменениях цен конкурентов."
            steps={[
              "Создайте уведомления для отслеживания изменений цен",
              "Настройте условия срабатывания уведомлений",
              "Выберите каналы получения уведомлений (Email, Telegram, SMS, Push)",
              "Включите или отключите уведомления по необходимости"
            ]}
          />
        </HStack>
      </Flex>

      <VStack spacing={4} align="stretch" mb={4}>
        {alerts.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Нет уведомлений</AlertTitle>
            <AlertDescription>
              Добавьте уведомления о ценах, чтобы получать информацию об изменениях цен
            </AlertDescription>
          </Alert>
        ) : (
          alerts.map(alert => (
            <Box
              key={alert.id}
              p={3}
              borderWidth="1px"
              borderColor={alert.isActive ? 'blue.500' : borderColor}
              borderRadius="md"
              bg={alert.isActive ? (useColorModeValue('blue.50', 'blue.900')) : bgColor}
            >
              <Flex justify="space-between" align="center">
                <HStack>
                  {getConditionIcon(alert.condition.type)}
                  <Text fontWeight="medium">{alert.name}</Text>
                  {!alert.isActive && (
                    <Badge colorScheme="gray">Неактивно</Badge>
                  )}
                </HStack>

                <HStack>
                  <Switch
                    isChecked={alert.isActive}
                    onChange={() => handleToggleAlertActive(alert.id)}
                    colorScheme="blue"
                    size="sm"
                  />

                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Удалить уведомление"
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeleteAlert(alert.id)}
                  />
                </HStack>
              </Flex>

              <Text fontSize="sm" color={textColor} mt={1}>
                {getAlertDescription(alert)}
              </Text>

              <HStack mt={2} spacing={2}>
                {alert.notificationChannels.email && (
                  <Tooltip label="Email">
                    <Icon as={FaEnvelope} color="blue.500" />
                  </Tooltip>
                )}
                {alert.notificationChannels.telegram && (
                  <Tooltip label="Telegram">
                    <Icon as={FaTelegram} color="blue.500" />
                  </Tooltip>
                )}
                {alert.notificationChannels.sms && (
                  <Tooltip label="SMS">
                    <Icon as={FaMobile} color="blue.500" />
                  </Tooltip>
                )}
                {alert.notificationChannels.push && (
                  <Tooltip label="Push-уведомления">
                    <Icon as={FaBell} color="blue.500" />
                  </Tooltip>
                )}
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      {isAddingAlert ? (
        <Box
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          bg={headerBg}
          mb={4}
        >
          <Heading size="sm" mb={3}>Новое уведомление</Heading>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Название уведомления</FormLabel>
              <Input
                value={newAlert.name}
                onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                placeholder="Например: Уведомление о снижении цены"
              />
            </FormControl>

            <Divider />

            <Heading size="xs">Условие</Heading>

            <HStack>
              <FormControl>
                <FormLabel>Тип условия</FormLabel>
                <Select
                  value={newAlert.condition.type}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    condition: {
                      ...newAlert.condition,
                      type: e.target.value as any
                    }
                  })}
                >
                  <option value="below_threshold">Цена ниже порога</option>
                  <option value="above_threshold">Цена выше порога</option>
                  <option value="price_change">Изменение цены</option>
                  <option value="competitor_price_change">Изменение цены конкурента</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Значение</FormLabel>
                <NumberInput
                  value={newAlert.condition.value}
                  onChange={(_, value) => setNewAlert({
                    ...newAlert,
                    condition: {
                      ...newAlert.condition,
                      value
                    }
                  })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Единица измерения</FormLabel>
                <Select
                  value={newAlert.condition.unit}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    condition: {
                      ...newAlert.condition,
                      unit: e.target.value as any
                    }
                  })}
                >
                  <option value="percent">Процент</option>
                  <option value="absolute">Рубли</option>
                </Select>
              </FormControl>
            </HStack>

            <Divider />

            <Heading size="xs">Каналы уведомлений</Heading>

            <HStack spacing={6}>
              <FormControl display="flex" alignItems="center">
                <Checkbox
                  isChecked={newAlert.notificationChannels.email}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    notificationChannels: {
                      ...newAlert.notificationChannels,
                      email: e.target.checked
                    }
                  })}
                  colorScheme="blue"
                />
                <FormLabel htmlFor="email-alert" mb="0" ml={2}>
                  <HStack>
                    <Icon as={FaEnvelope} />
                    <Text>Email</Text>
                  </HStack>
                </FormLabel>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <Checkbox
                  isChecked={newAlert.notificationChannels.telegram}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    notificationChannels: {
                      ...newAlert.notificationChannels,
                      telegram: e.target.checked
                    }
                  })}
                  colorScheme="blue"
                />
                <FormLabel htmlFor="telegram-alert" mb="0" ml={2}>
                  <HStack>
                    <Icon as={FaTelegram} />
                    <Text>Telegram</Text>
                  </HStack>
                </FormLabel>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <Checkbox
                  isChecked={newAlert.notificationChannels.sms}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    notificationChannels: {
                      ...newAlert.notificationChannels,
                      sms: e.target.checked
                    }
                  })}
                  colorScheme="blue"
                />
                <FormLabel htmlFor="sms-alert" mb="0" ml={2}>
                  <HStack>
                    <Icon as={FaMobile} />
                    <Text>SMS</Text>
                  </HStack>
                </FormLabel>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <Checkbox
                  isChecked={newAlert.notificationChannels.push}
                  onChange={(e) => setNewAlert({
                    ...newAlert,
                    notificationChannels: {
                      ...newAlert.notificationChannels,
                      push: e.target.checked
                    }
                  })}
                  colorScheme="blue"
                />
                <FormLabel htmlFor="push-alert" mb="0" ml={2}>
                  <HStack>
                    <Icon as={FaBell} />
                    <Text>Push</Text>
                  </HStack>
                </FormLabel>
              </FormControl>
            </HStack>

            <HStack justify="flex-end" spacing={3} pt={2}>
              <Button
                variant="outline"
                onClick={() => setIsAddingAlert(false)}
              >
                Отмена
              </Button>

              <Button
                colorScheme="blue"
                onClick={handleAddAlert}
                isDisabled={!newAlert.name}
              >
                Добавить уведомление
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <HStack mb={4}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setIsAddingAlert(true)}
          >
            Добавить уведомление
          </Button>
          <HelpTooltip
            label="Добавление уведомления"
            description="Создание нового уведомления об изменении цены."
            steps={[
              "Нажмите кнопку 'Добавить уведомление'",
              "Заполните форму создания уведомления",
              "Укажите название, условие и каналы уведомлений",
              "Нажмите кнопку 'Добавить уведомление' в форме"
            ]}
          />
        </HStack>
      )}

      <Flex justify="flex-end">
        <HStack>
          <Button
            colorScheme="green"
            leftIcon={<CheckIcon />}
            onClick={handleSaveAlerts}
            isDisabled={alerts.length === 0}
          >
            Сохранить настройки
          </Button>
          <HelpTooltip
            label="Сохранение уведомлений"
            description="Сохранение настроенных уведомлений о ценах."
            steps={[
              "После добавления всех уведомлений нажмите кнопку 'Сохранить настройки'",
              "Уведомления будут сохранены и начнут работать при мониторинге цен",
              "Вы можете в любой момент изменить или удалить уведомления"
            ]}
            placement="left"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default PriceAlertSettings;
