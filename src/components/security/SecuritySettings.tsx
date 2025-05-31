import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  useToast,
  Textarea,
  Divider
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { securityService } from '../../services/securityService';

export default function SecuritySettings() {
  const [config, setConfig] = useState({
    maxRequestsPerMinute: 100,
    minDelayBetweenRequests: 5000,
    maxDelayBetweenRequests: 15000,
    enableProxyRotation: true,
    enableUserAgentRotation: true,
    enableCaching: true,
    cacheExpirationTime: 3600000,
    telegramBotToken: '',
    telegramChatId: ''
  });

  const [proxyList, setProxyList] = useState('');
  const [stats, setStats] = useState(securityService.getSecurityStats());
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Обновляем статистику каждые 5 секунд
    const interval = setInterval(() => {
      setStats(securityService.getSecurityStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConfigUpdate = () => {
    securityService.updateConfig(config);
    toast({
      title: '✅ Настройки сохранены',
      description: 'Конфигурация безопасности обновлена',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  const handleProxyAdd = () => {
    const proxies = proxyList.split('\n').filter(line => line.trim());
    let addedCount = 0;

    proxies.forEach(proxyLine => {
      try {
        // Формат: host:port:username:password или host:port
        const parts = proxyLine.trim().split(':');
        if (parts.length >= 2) {
          securityService.addProxy({
            host: parts[0],
            port: parseInt(parts[1]),
            username: parts[2] || undefined,
            password: parts[3] || undefined,
            type: 'http'
          });
          addedCount++;
        }
      } catch (error) {
        console.error('Ошибка добавления прокси:', error);
      }
    });

    if (addedCount > 0) {
      toast({
        title: `✅ Добавлено ${addedCount} прокси`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setProxyList('');
      setStats(securityService.getSecurityStats());
    }
  };

  const handleClearCache = () => {
    securityService.clearCache();
    setStats(securityService.getSecurityStats());
    toast({
      title: '🧹 Кеш очищен',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  const testTelegramBot = async () => {
    if (!config.telegramBotToken || !config.telegramChatId) {
      toast({
        title: '❌ Ошибка',
        description: 'Укажите токен бота и Chat ID',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: '🧪 Тестовое сообщение от WB Price Optimizer Pro'
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Telegram бот работает',
          description: 'Тестовое сообщение отправлено',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка Telegram бота',
        description: 'Проверьте токен и Chat ID',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Статистика */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">📊 Статистика безопасности</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Запросов в минуту</StatLabel>
              <StatNumber color="blue.500">{stats.requestCount}</StatNumber>
              <StatHelpText>из {stats.config.maxRequestsPerMinute}</StatHelpText>
            </Stat>

            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Размер кеша</StatLabel>
              <StatNumber color="green.500">{stats.cacheSize}</StatNumber>
              <StatHelpText>записей</StatHelpText>
            </Stat>

            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Прокси</StatLabel>
              <StatNumber color="purple.500">{stats.proxiesCount}</StatNumber>
              <StatHelpText>активных</StatHelpText>
            </Stat>

            <Stat className="purple-stat-border" p={3} borderRadius="md">
              <StatLabel>Текущий прокси</StatLabel>
              <StatNumber color="orange.500">#{stats.currentProxy + 1}</StatNumber>
              <StatHelpText>в ротации</StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Основные настройки */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">⚙️ Настройки безопасности</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Максимум запросов в минуту</FormLabel>
                <NumberInput
                  value={config.maxRequestsPerMinute}
                  onChange={(_, value) => setConfig({...config, maxRequestsPerMinute: value})}
                  min={1}
                  max={1000}
                  className="purple-form-border"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Время кеша (мс)</FormLabel>
                <NumberInput
                  value={config.cacheExpirationTime}
                  onChange={(_, value) => setConfig({...config, cacheExpirationTime: value})}
                  min={60000}
                  max={86400000}
                  className="purple-form-border"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Мин. задержка (мс)</FormLabel>
                <NumberInput
                  value={config.minDelayBetweenRequests}
                  onChange={(_, value) => setConfig({...config, minDelayBetweenRequests: value})}
                  min={1000}
                  max={30000}
                  className="purple-form-border"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Макс. задержка (мс)</FormLabel>
                <NumberInput
                  value={config.maxDelayBetweenRequests}
                  onChange={(_, value) => setConfig({...config, maxDelayBetweenRequests: value})}
                  min={5000}
                  max={60000}
                  className="purple-form-border"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Переключатели */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Ротация прокси</FormLabel>
                <Switch
                  isChecked={config.enableProxyRotation}
                  onChange={(e) => setConfig({...config, enableProxyRotation: e.target.checked})}
                  colorScheme="purple"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Ротация User-Agent</FormLabel>
                <Switch
                  isChecked={config.enableUserAgentRotation}
                  onChange={(e) => setConfig({...config, enableUserAgentRotation: e.target.checked})}
                  colorScheme="purple"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Кеширование</FormLabel>
                <Switch
                  isChecked={config.enableCaching}
                  onChange={(e) => setConfig({...config, enableCaching: e.target.checked})}
                  colorScheme="purple"
                />
              </FormControl>
            </SimpleGrid>

            <HStack spacing={4}>
              <Button
                colorScheme="purple"
                onClick={handleConfigUpdate}
                className="purple-button-border"
              >
                💾 Сохранить настройки
              </Button>
              <Button
                variant="outline"
                onClick={handleClearCache}
                className="purple-button-border"
              >
                🧹 Очистить кеш
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Настройки Telegram */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">📱 Уведомления Telegram</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Токен бота</FormLabel>
              <Input
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={config.telegramBotToken}
                onChange={(e) => setConfig({...config, telegramBotToken: e.target.value})}
                className="purple-form-border"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Chat ID</FormLabel>
              <Input
                placeholder="-1001234567890"
                value={config.telegramChatId}
                onChange={(e) => setConfig({...config, telegramChatId: e.target.value})}
                className="purple-form-border"
              />
            </FormControl>

            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={testTelegramBot}
                className="purple-button-border"
              >
                🧪 Тест бота
              </Button>
              <Text fontSize="sm" color="gray.600">
                Отправит тестовое сообщение для проверки
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Настройки прокси */}
      <Card className="purple-card-border" bg={cardBg}>
        <CardHeader>
          <Heading size="md">🔄 Управление прокси</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Список прокси (по одному на строку)</FormLabel>
              <Textarea
                placeholder={`host1:port1:username1:password1
host2:port2:username2:password2
host3:port3`}
                value={proxyList}
                onChange={(e) => setProxyList(e.target.value)}
                rows={5}
                className="purple-form-border"
              />
            </FormControl>

            <Alert status="info" className="purple-alert-border">
              <AlertIcon />
              <Box>
                <Text fontSize="sm">
                  Формат: host:port:username:password или host:port (без авторизации)
                </Text>
              </Box>
            </Alert>

            <Button
              colorScheme="green"
              onClick={handleProxyAdd}
              isDisabled={!proxyList.trim()}
              className="purple-button-border"
            >
              ➕ Добавить прокси
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
