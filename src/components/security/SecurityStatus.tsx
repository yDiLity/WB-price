import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Tooltip,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  Flex
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaLock, FaShieldAlt, FaEye, FaServer } from 'react-icons/fa';
import { autoSecuritySetup } from '../../services/autoSecuritySetup';

export default function SecurityStatus() {
  const [securityStatus, setSecurityStatus] = useState(autoSecuritySetup.getSecurityStatus());
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Обновляем статус каждые 10 секунд
    const interval = setInterval(() => {
      setSecurityStatus(autoSecuritySetup.getSecurityStatus());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!securityStatus.initialized) return 'red';
    if (securityStatus.recommendations.length > 2) return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (!securityStatus.initialized) return 'Не инициализирована';
    if (securityStatus.recommendations.length > 2) return 'Требует внимания';
    return 'Активна';
  };

  const requestUsagePercent = securityStatus.stats.config.maxRequestsPerMinute > 0 
    ? (securityStatus.stats.requestCount / securityStatus.stats.config.maxRequestsPerMinute) * 100 
    : 0;

  return (
    <Box
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="md"
      p={3}
      className="purple-container-border"
      maxW="300px"
    >
      <VStack spacing={3} align="stretch">
        {/* Заголовок */}
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FaLock} color="purple.500" />
            <Text fontSize="sm" fontWeight="bold">
              Защита WB
            </Text>
          </HStack>
          <Badge colorScheme={getStatusColor()} size="sm">
            {getStatusText()}
          </Badge>
        </HStack>

        {/* Основные метрики */}
        <VStack spacing={2} align="stretch">
          {/* Использование лимита запросов */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.600">
                Запросы/мин
              </Text>
              <Text fontSize="xs" fontWeight="bold">
                {securityStatus.stats.requestCount}/{securityStatus.stats.config.maxRequestsPerMinute}
              </Text>
            </HStack>
            <Progress
              value={requestUsagePercent}
              size="sm"
              colorScheme={requestUsagePercent > 80 ? 'red' : requestUsagePercent > 60 ? 'yellow' : 'green'}
              borderRadius="md"
            />
          </Box>

          {/* Статистика */}
          <HStack justify="space-between" fontSize="xs">
            <Tooltip label="Количество активных прокси">
              <HStack spacing={1}>
                <Icon as={FaServer} color="blue.500" />
                <Text>{securityStatus.stats.proxiesCount}</Text>
              </HStack>
            </Tooltip>

            <Tooltip label="Размер кеша">
              <HStack spacing={1}>
                <Icon as={FaShieldAlt} color="green.500" />
                <Text>{securityStatus.stats.cacheSize}</Text>
              </HStack>
            </Tooltip>

            <Tooltip label="Мониторинг активен">
              <HStack spacing={1}>
                <Icon as={FaEye} color="orange.500" />
                <Text>ON</Text>
              </HStack>
            </Tooltip>
          </HStack>
        </VStack>

        {/* Рекомендации */}
        {securityStatus.recommendations.length > 0 && (
          <Alert status="warning" size="sm" borderRadius="md">
            <AlertIcon boxSize={3} />
            <AlertDescription fontSize="xs">
              {securityStatus.recommendations[0]}
            </AlertDescription>
          </Alert>
        )}

        {/* Индикаторы защиты */}
        <HStack justify="space-between" fontSize="xs">
          <Tooltip label="Ротация User-Agent">
            <Badge 
              colorScheme={securityStatus.stats.config.enableUserAgentRotation ? 'green' : 'red'} 
              size="xs"
            >
              UA
            </Badge>
          </Tooltip>

          <Tooltip label="Ротация прокси">
            <Badge 
              colorScheme={securityStatus.stats.config.enableProxyRotation ? 'green' : 'red'} 
              size="xs"
            >
              Proxy
            </Badge>
          </Tooltip>

          <Tooltip label="Кеширование">
            <Badge 
              colorScheme={securityStatus.stats.config.enableCaching ? 'green' : 'red'} 
              size="xs"
            >
              Cache
            </Badge>
          </Tooltip>

          <Tooltip label="Задержки между запросами">
            <Badge colorScheme="green" size="xs">
              {securityStatus.stats.config.minDelayBetweenRequests / 1000}s
            </Badge>
          </Tooltip>
        </HStack>

        {/* Статус в реальном времени */}
        <Flex justify="center">
          <Text fontSize="xs" color="gray.500">
            🛡️ Все API запросы защищены автоматически
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
}
