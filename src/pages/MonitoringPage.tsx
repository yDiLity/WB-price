import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Spinner,
  Flex,
  Badge,
  Progress,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { RepeatIcon, InfoIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

// Интерфейсы для статистики
interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: string;
  freeMemory: string;
  uptime: string;
}

interface ServerInfo {
  uptime: string;
  nodeVersion: string;
  memoryUsage: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
  };
}

interface RequestsInfo {
  total: number;
  perMinute: number;
  currentMinute: number;
}

interface UsersInfo {
  total: number;
  active: number;
}

interface RateLimitsInfo {
  perUserPerMinute: number;
  globalPerMinute: number;
}

interface ServerStats {
  system: SystemInfo;
  server: ServerInfo;
  requests: RequestsInfo;
  users: UsersInfo;
  rateLimits: RateLimitsInfo;
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Состояния
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [serverStatus, setServerStatus] = useState<'ok' | 'error' | 'unknown'>('unknown');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Загрузка статистики сервера
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Сначала проверяем работоспособность сервера
      const healthResponse = await fetch('http://localhost:3000/api/health');
      const healthData = await healthResponse.json();
      
      if (healthData.status === 'ok') {
        setServerStatus('ok');
        
        // Затем получаем статистику
        const statsResponse = await fetch('http://localhost:3000/api/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.stats);
          setLastUpdated(new Date());
        } else {
          throw new Error(statsData.message || 'Failed to fetch stats');
        }
      } else {
        setServerStatus('error');
        throw new Error('Server health check failed');
      }
    } catch (error) {
      console.error('Error fetching server stats:', error);
      setServerStatus('error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить статистику сервера',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Загрузка статистики при монтировании компонента
  useEffect(() => {
    fetchStats();
  }, []);
  
  // Автоматическое обновление статистики
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStats();
      }, 10000); // Обновление каждые 10 секунд
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);
  
  // Форматирование даты
  const formatDate = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Расчет процента использования памяти
  const calculateMemoryUsage = () => {
    if (!stats) return 0;
    
    const heapUsed = parseFloat(stats.server.memoryUsage.heapUsed);
    const heapTotal = parseFloat(stats.server.memoryUsage.heapTotal);
    
    return Math.round((heapUsed / heapTotal) * 100);
  };
  
  // Расчет процента использования лимита запросов
  const calculateRequestsUsage = () => {
    if (!stats) return 0;
    
    return Math.round((stats.requests.currentMinute / stats.rateLimits.globalPerMinute) * 100);
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1">Мониторинг сервера</Heading>
        <Flex align="center">
          {lastUpdated && (
            <Text fontSize="sm" color="gray.500" mr={4}>
              Последнее обновление: {formatDate(lastUpdated)}
            </Text>
          )}
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            onClick={fetchStats}
            isLoading={isLoading}
            mr={2}
          >
            Обновить
          </Button>
          <Button
            colorScheme={autoRefresh ? 'green' : 'gray'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Авто-обновление включено' : 'Авто-обновление выключено'}
          </Button>
        </Flex>
      </Flex>
      
      {/* Статус сервера */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
        <CardBody>
          <Flex justify="space-between" align="center">
            <Heading size="md">Статус сервера</Heading>
            <Badge
              colorScheme={
                serverStatus === 'ok' ? 'green' : serverStatus === 'error' ? 'red' : 'gray'
              }
              fontSize="lg"
              py={1}
              px={3}
              borderRadius="md"
            >
              {serverStatus === 'ok' ? 'Работает' : serverStatus === 'error' ? 'Ошибка' : 'Неизвестно'}
            </Badge>
          </Flex>
        </CardBody>
      </Card>
      
      {isLoading ? (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : stats ? (
        <>
          {/* Основные показатели */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel>Подключенные пользователи</StatLabel>
                  <StatNumber>{stats.users.total}</StatNumber>
                  <StatHelpText>
                    Активных: {stats.users.active}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel>Запросов в минуту</StatLabel>
                  <StatNumber>{stats.requests.perMinute}</StatNumber>
                  <StatHelpText>
                    Текущая минута: {stats.requests.currentMinute}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel>Всего запросов</StatLabel>
                  <StatNumber>{stats.requests.total.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    С момента запуска сервера
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel>Время работы</StatLabel>
                  <StatNumber>{stats.server.uptime}</StatNumber>
                  <StatHelpText>
                    Node.js {stats.server.nodeVersion}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Использование ресурсов */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Использование памяти</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={2}>
                  Используется: {stats.server.memoryUsage.heapUsed} из {stats.server.memoryUsage.heapTotal}
                </Text>
                <Progress 
                  value={calculateMemoryUsage()} 
                  colorScheme={calculateMemoryUsage() > 80 ? 'red' : calculateMemoryUsage() > 60 ? 'yellow' : 'green'} 
                  size="lg" 
                  borderRadius="md"
                  mb={2}
                />
                <Text fontSize="sm" color="gray.500">
                  RSS: {stats.server.memoryUsage.rss}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Использование лимита запросов</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={2}>
                  Текущая нагрузка: {stats.requests.currentMinute} из {stats.rateLimits.globalPerMinute} запросов в минуту
                </Text>
                <Progress 
                  value={calculateRequestsUsage()} 
                  colorScheme={calculateRequestsUsage() > 80 ? 'red' : calculateRequestsUsage() > 60 ? 'yellow' : 'green'} 
                  size="lg" 
                  borderRadius="md"
                  mb={2}
                />
                <Text fontSize="sm" color="gray.500">
                  Лимит на пользователя: {stats.rateLimits.perUserPerMinute} запросов в минуту
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Информация о системе */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
            <CardHeader>
              <Heading size="md">Информация о системе</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box>
                  <Text fontWeight="bold">Платформа:</Text>
                  <Text>{stats.system.platform}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Архитектура:</Text>
                  <Text>{stats.system.arch}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Процессоры:</Text>
                  <Text>{stats.system.cpus} ядер</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Общая память:</Text>
                  <Text>{stats.system.totalMemory}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Свободная память:</Text>
                  <Text>{stats.system.freeMemory}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Время работы системы:</Text>
                  <Text>{stats.system.uptime}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </>
      ) : (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Нет данных</AlertTitle>
            <AlertDescription>
              Не удалось получить статистику сервера. Проверьте, запущен ли сервер.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Container>
  );
}
