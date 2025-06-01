/**
 * 📊 Компонент мониторинга продакшн системы WB
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Badge,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  useColorModeValue,
  useToast,
  Flex,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaServer, 
  FaNetworkWired, 
  FaChartLine, 
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaSync,
  FaEye
} from 'react-icons/fa';
import productionWBService from '../../services/productionWBService';

interface ProxyServer {
  id: string;
  host: string;
  port: number;
  location: string;
  isActive: boolean;
  successRate: number;
  responseTime: number;
  lastUsed: Date;
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  successRate: number;
  lastUpdated: Date;
}

const ProductionMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<RequestMetrics | null>(null);
  const [proxyStatus, setProxyStatus] = useState<{ active: number; total: number; proxies: ProxyServer[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newProxy, setNewProxy] = useState({
    host: '',
    port: 8080,
    username: '',
    password: '',
    type: 'http' as 'http' | 'https' | 'socks5',
    location: ''
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Цвета для темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  // Загрузка данных
  useEffect(() => {
    loadData();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const metricsData = productionWBService.getMetrics();
      const proxyData = productionWBService.getProxyStatus();
      
      setMetrics(metricsData);
      setProxyStatus(proxyData);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных мониторинга:', error);
      setIsLoading(false);
    }
  };

  const handleAddProxy = () => {
    try {
      productionWBService.addProxy({
        host: newProxy.host,
        port: newProxy.port,
        username: newProxy.username || undefined,
        password: newProxy.password || undefined,
        type: newProxy.type,
        location: newProxy.location,
        isActive: true
      });

      toast({
        title: 'Прокси добавлен',
        description: `Прокси ${newProxy.host}:${newProxy.port} успешно добавлен`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      // Сброс формы
      setNewProxy({
        host: '',
        port: 8080,
        username: '',
        password: '',
        type: 'http',
        location: ''
      });

      onClose();
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить прокси',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleRemoveProxy = (proxyId: string) => {
    try {
      productionWBService.removeProxy(proxyId);
      
      toast({
        title: 'Прокси удален',
        description: 'Прокси успешно удален из системы',
        status: 'info',
        duration: 3000,
        isClosable: true
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить прокси',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 90) return 'green';
    if (successRate >= 70) return 'yellow';
    return 'red';
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 200) return 'green';
    if (responseTime <= 500) return 'yellow';
    return 'red';
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Heading>Загрузка мониторинга...</Heading>
          <Progress size="lg" isIndeterminate colorScheme="blue" w="100%" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Заголовок */}
        <Flex justify="space-between" align="center">
          <VStack align="flex-start" spacing={1}>
            <Heading as="h1" size="xl">
              <Icon as={FaChartLine} mr={3} color="blue.500" />
              Мониторинг продакшн системы
            </Heading>
            <Text color="gray.500">
              Отслеживание производительности и состояния прокси-серверов
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Button
              leftIcon={<FaSync />}
              onClick={loadData}
              variant="outline"
            >
              Обновить
            </Button>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Добавить прокси
            </Button>
          </HStack>
        </Flex>

        {/* Предупреждения */}
        {proxyStatus && proxyStatus.active < proxyStatus.total * 0.5 && (
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Внимание!</AlertTitle>
            <AlertDescription>
              Активно только {proxyStatus.active} из {proxyStatus.total} прокси-серверов. 
              Рекомендуется добавить новые прокси для стабильной работы.
            </AlertDescription>
          </Alert>
        )}

        {/* Метрики запросов */}
        {metrics && (
          <Box>
            <Heading size="md" mb={4}>📊 Метрики запросов</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
                <StatLabel>Всего запросов</StatLabel>
                <StatNumber>{metrics.totalRequests.toLocaleString()}</StatNumber>
                <StatHelpText>За все время</StatHelpText>
              </Stat>

              <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
                <StatLabel>Успешность</StatLabel>
                <StatNumber color={metrics.successRate >= 90 ? 'green.500' : 'red.500'}>
                  {metrics.successRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={metrics.successRate >= 90 ? 'increase' : 'decrease'} />
                  {metrics.successfulRequests} успешных
                </StatHelpText>
              </Stat>

              <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
                <StatLabel>Среднее время ответа</StatLabel>
                <StatNumber color={getResponseTimeColor(metrics.averageResponseTime)}>
                  {metrics.averageResponseTime.toFixed(0)}ms
                </StatNumber>
                <StatHelpText>Время обработки</StatHelpText>
              </Stat>

              <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
                <StatLabel>Неудачные запросы</StatLabel>
                <StatNumber color="red.500">{metrics.failedRequests}</StatNumber>
                <StatHelpText>Требуют внимания</StatHelpText>
              </Stat>
            </SimpleGrid>
          </Box>
        )}

        {/* Состояние прокси */}
        {proxyStatus && (
          <Box>
            <Heading size="md" mb={4}>🌐 Прокси-серверы</Heading>
            <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>Сервер</Th>
                      <Th>Локация</Th>
                      <Th>Статус</Th>
                      <Th>Успешность</Th>
                      <Th>Время ответа</Th>
                      <Th>Последнее использование</Th>
                      <Th>Действия</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {proxyStatus.proxies.map((proxy) => (
                      <Tr key={proxy.id}>
                        <Td>
                          <VStack align="flex-start" spacing={1}>
                            <Text fontWeight="bold">{proxy.host}:{proxy.port}</Text>
                            <Text fontSize="sm" color="gray.500">{proxy.id}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">{proxy.location}</Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={proxy.isActive ? 'green' : 'red'}>
                            {proxy.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="flex-start" spacing={1}>
                            <Text color={getStatusColor(proxy.successRate)}>
                              {proxy.successRate.toFixed(1)}%
                            </Text>
                            <Progress 
                              value={proxy.successRate} 
                              size="sm" 
                              colorScheme={getStatusColor(proxy.successRate)}
                              w="60px"
                            />
                          </VStack>
                        </Td>
                        <Td>
                          <Text color={getResponseTimeColor(proxy.responseTime)}>
                            {proxy.responseTime.toFixed(0)}ms
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(proxy.lastUsed).toLocaleString('ru-RU')}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="Просмотр деталей">
                              <Button size="sm" variant="ghost">
                                <FaEye />
                              </Button>
                            </Tooltip>
                            <Tooltip label="Удалить прокси">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                colorScheme="red"
                                onClick={() => handleRemoveProxy(proxy.id)}
                              >
                                <FaTrash />
                              </Button>
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}

        {/* Модальное окно добавления прокси */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Добавить новый прокси-сервер</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Хост</FormLabel>
                  <Input
                    placeholder="proxy.example.com"
                    value={newProxy.host}
                    onChange={(e) => setNewProxy({...newProxy, host: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Порт</FormLabel>
                  <Input
                    type="number"
                    placeholder="8080"
                    value={newProxy.port}
                    onChange={(e) => setNewProxy({...newProxy, port: parseInt(e.target.value)})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Тип</FormLabel>
                  <Select
                    value={newProxy.type}
                    onChange={(e) => setNewProxy({...newProxy, type: e.target.value as any})}
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="socks5">SOCKS5</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Локация</FormLabel>
                  <Input
                    placeholder="Moscow"
                    value={newProxy.location}
                    onChange={(e) => setNewProxy({...newProxy, location: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Имя пользователя</FormLabel>
                  <Input
                    placeholder="username (опционально)"
                    value={newProxy.username}
                    onChange={(e) => setNewProxy({...newProxy, username: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Пароль</FormLabel>
                  <Input
                    type="password"
                    placeholder="password (опционально)"
                    value={newProxy.password}
                    onChange={(e) => setNewProxy({...newProxy, password: e.target.value})}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Отмена
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleAddProxy}
                isDisabled={!newProxy.host || !newProxy.location}
              >
                Добавить
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default ProductionMonitor;
