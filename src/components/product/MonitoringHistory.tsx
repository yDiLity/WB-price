import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  Flex,
  Heading,
  Select,
  Divider,
  Alert,
  AlertIcon,
  Collapse,
  Icon
} from '@chakra-ui/react';
import { 
  CheckIcon, 
  WarningIcon, 
  InfoIcon, 
  TimeIcon, 
  RepeatIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { FaRobot, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import { Product, CompetitorProduct } from '../../types';

interface MonitoringEvent {
  id: string;
  timestamp: string;
  type: 'price_check' | 'price_change' | 'rule_triggered' | 'error';
  status: 'success' | 'warning' | 'error' | 'info';
  description: string;
  details?: {
    competitorId?: string;
    oldPrice?: number;
    newPrice?: number;
    ruleId?: string;
    ruleName?: string;
    errorMessage?: string;
  };
}

interface MonitoringHistoryProps {
  product: Product;
  competitors: CompetitorProduct[];
  onRunMonitoring?: () => void;
}

/**
 * Компонент для отображения истории мониторинга цен
 */
const MonitoringHistory: React.FC<MonitoringHistoryProps> = ({
  product,
  competitors,
  onRunMonitoring
}) => {
  // Состояние для фильтрации и отображения
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [eventType, setEventType] = useState<'all' | 'price_check' | 'price_change' | 'rule_triggered' | 'error'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Получение истории мониторинга
  const getMonitoringHistory = (): MonitoringEvent[] => {
    // В реальном приложении здесь будет запрос к API для получения истории мониторинга
    // Для демонстрации используем моковые данные
    
    const now = new Date();
    const history: MonitoringEvent[] = [];
    
    // Генерируем историю мониторинга
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setHours(now.getHours() - i * 4);
      
      const types = ['price_check', 'price_change', 'rule_triggered', 'error'];
      const type = types[Math.floor(Math.random() * types.length)] as 'price_check' | 'price_change' | 'rule_triggered' | 'error';
      
      const statuses = ['success', 'warning', 'error', 'info'];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as 'success' | 'warning' | 'error' | 'info';
      
      let description = '';
      let details: any = {};
      
      if (type === 'price_check') {
        description = 'Проверка цен конкурентов';
        details = {
          competitorId: competitors.length > 0 ? competitors[Math.floor(Math.random() * competitors.length)].id : undefined
        };
      } else if (type === 'price_change') {
        const oldPrice = product.price.current * (0.9 + Math.random() * 0.2);
        const newPrice = oldPrice * (0.9 + Math.random() * 0.2);
        description = `Изменение цены с ${formatPrice(oldPrice)} на ${formatPrice(newPrice)}`;
        details = {
          oldPrice,
          newPrice,
          competitorId: competitors.length > 0 ? competitors[Math.floor(Math.random() * competitors.length)].id : undefined
        };
      } else if (type === 'rule_triggered') {
        description = 'Сработало правило автоматического изменения цены';
        details = {
          ruleId: `rule-${i}`,
          ruleName: 'Снижение цены при конкуренции'
        };
      } else {
        description = 'Ошибка при мониторинге цен';
        details = {
          errorMessage: 'Не удалось получить данные о ценах конкурентов'
        };
      }
      
      history.push({
        id: `event-${i}`,
        timestamp: date.toISOString(),
        type,
        status,
        description,
        details
      });
    }
    
    // Фильтруем по выбранному периоду времени
    const filteredHistory = history.filter(event => {
      const eventDate = new Date(event.timestamp);
      
      if (timeRange === 'day') {
        const dayAgo = new Date(now);
        dayAgo.setDate(now.getDate() - 1);
        return eventDate >= dayAgo;
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return eventDate >= weekAgo;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return eventDate >= monthAgo;
      }
      
      // Для 'all' возвращаем все события
      return true;
    });
    
    // Фильтруем по выбранному типу события
    return eventType === 'all' 
      ? filteredHistory 
      : filteredHistory.filter(event => event.type === eventType);
  };
  
  // Получение иконки для типа события
  const getEventIcon = (type: string, status: string) => {
    if (status === 'error') {
      return <Icon as={FaExclamationTriangle} color="red.500" />;
    }
    
    switch (type) {
      case 'price_check':
        return <TimeIcon color="blue.500" />;
      case 'price_change':
        return <RepeatIcon color="green.500" />;
      case 'rule_triggered':
        return <Icon as={FaRobot} color="purple.500" />;
      default:
        return <InfoIcon color="gray.500" />;
    }
  };
  
  // Получение цвета для статуса события
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };
  
  // Получение названия типа события
  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'price_check':
        return 'Проверка цен';
      case 'price_change':
        return 'Изменение цены';
      case 'rule_triggered':
        return 'Сработало правило';
      case 'error':
        return 'Ошибка';
      default:
        return 'Событие';
    }
  };
  
  // Получение названия конкурента по ID
  const getCompetitorName = (competitorId?: string) => {
    if (!competitorId) return 'Неизвестный конкурент';
    
    const competitor = competitors.find(comp => comp.id === competitorId);
    return competitor ? competitor.competitorName : 'Неизвестный конкурент';
  };
  
  // Получаем историю мониторинга
  const monitoringHistory = getMonitoringHistory();
  
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
        <Heading size="md">История мониторинга</Heading>
        
        <HStack spacing={2}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            size="sm"
            width="150px"
          >
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="all">За всё время</option>
          </Select>
          
          <Select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as any)}
            size="sm"
            width="180px"
          >
            <option value="all">Все события</option>
            <option value="price_check">Проверка цен</option>
            <option value="price_change">Изменение цены</option>
            <option value="rule_triggered">Сработало правило</option>
            <option value="error">Ошибки</option>
          </Select>
          
          <Button
            colorScheme="blue"
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={onRunMonitoring}
          >
            Запустить мониторинг
          </Button>
        </HStack>
      </Flex>
      
      {monitoringHistory.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>Нет событий мониторинга за выбранный период</Text>
        </Alert>
      ) : (
        <Table variant="simple" size="sm">
          <Thead bg={headerBg}>
            <Tr>
              <Th width="180px">Дата и время</Th>
              <Th width="150px">Тип</Th>
              <Th>Описание</Th>
              <Th width="100px">Статус</Th>
              <Th width="80px">Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {monitoringHistory.map(event => (
              <React.Fragment key={event.id}>
                <Tr>
                  <Td>{formatDate(event.timestamp)}</Td>
                  <Td>
                    <HStack>
                      {getEventIcon(event.type, event.status)}
                      <Text>{getEventTypeName(event.type)}</Text>
                    </HStack>
                  </Td>
                  <Td>{event.description}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(event.status)}>
                      {event.status === 'success' ? 'Успешно' :
                       event.status === 'warning' ? 'Предупреждение' :
                       event.status === 'error' ? 'Ошибка' : 'Информация'}
                    </Badge>
                  </Td>
                  <Td>
                    <IconButton
                      icon={expandedEventId === event.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      aria-label="Подробности"
                      size="xs"
                      variant="ghost"
                      onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                    />
                  </Td>
                </Tr>
                
                <Tr>
                  <Td colSpan={5} p={0}>
                    <Collapse in={expandedEventId === event.id} animateOpacity>
                      <Box p={4} bg={headerBg}>
                        <VStack align="stretch" spacing={3}>
                          <Heading size="xs">Подробная информация</Heading>
                          
                          {event.type === 'price_check' && event.details?.competitorId && (
                            <HStack>
                              <Text fontWeight="medium" width="150px">Конкурент:</Text>
                              <Text>{getCompetitorName(event.details.competitorId)}</Text>
                            </HStack>
                          )}
                          
                          {event.type === 'price_change' && (
                            <>
                              <HStack>
                                <Text fontWeight="medium" width="150px">Старая цена:</Text>
                                <Text>{formatPrice(event.details?.oldPrice || 0)}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="medium" width="150px">Новая цена:</Text>
                                <Text>{formatPrice(event.details?.newPrice || 0)}</Text>
                              </HStack>
                              {event.details?.competitorId && (
                                <HStack>
                                  <Text fontWeight="medium" width="150px">Конкурент:</Text>
                                  <Text>{getCompetitorName(event.details.competitorId)}</Text>
                                </HStack>
                              )}
                            </>
                          )}
                          
                          {event.type === 'rule_triggered' && (
                            <HStack>
                              <Text fontWeight="medium" width="150px">Правило:</Text>
                              <Text>{event.details?.ruleName}</Text>
                            </HStack>
                          )}
                          
                          {event.type === 'error' && (
                            <HStack>
                              <Text fontWeight="medium" width="150px">Сообщение об ошибке:</Text>
                              <Text color="red.500">{event.details?.errorMessage}</Text>
                            </HStack>
                          )}
                          
                          <Divider />
                          
                          <Flex justify="flex-end">
                            <Button
                              size="xs"
                              leftIcon={<ExternalLinkIcon />}
                              variant="outline"
                            >
                              Подробнее
                            </Button>
                          </Flex>
                        </VStack>
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default MonitoringHistory;
