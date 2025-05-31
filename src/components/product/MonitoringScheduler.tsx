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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Checkbox
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon, CheckIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';
import { FaClock, FaCalendarAlt, FaRecycle, FaRegClock } from 'react-icons/fa';
import { Product } from '../../types';

interface ScheduleItem {
  id: string;
  isActive: boolean;
  type: 'daily' | 'weekly' | 'custom';
  time: string;
  days?: number[]; // Для еженедельного расписания (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
  interval?: number; // Для пользовательского интервала (в часах)
  lastRun?: Date;
  nextRun?: Date;
}

interface MonitoringSchedulerProps {
  product: Product;
  onSaveSchedule: (schedule: ScheduleItem[]) => void;
  onRunMonitoring: () => void;
}

/**
 * Компонент для настройки расписания мониторинга цен
 */
const MonitoringScheduler: React.FC<MonitoringSchedulerProps> = ({
  product,
  onSaveSchedule,
  onRunMonitoring
}) => {
  // Состояние для расписания
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isAddingSchedule, setIsAddingSchedule] = useState<boolean>(false);
  
  // Состояние для нового расписания
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduleItem, 'id'>>({
    isActive: true,
    type: 'daily',
    time: '12:00',
    days: [1, 3, 5], // По умолчанию понедельник, среда, пятница
    interval: 24 // По умолчанию каждые 24 часа
  });
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Toast для уведомлений
  const toast = useToast();
  
  // Загрузка расписания из продукта при монтировании компонента
  useEffect(() => {
    if (product.monitoringSchedule) {
      setScheduleItems(product.monitoringSchedule);
    } else {
      // Если расписания нет, создаем одно по умолчанию
      const defaultSchedule: ScheduleItem = {
        id: `schedule-${Date.now()}`,
        isActive: true,
        type: 'daily',
        time: '12:00',
        nextRun: getNextRunTime('daily', '12:00')
      };
      
      setScheduleItems([defaultSchedule]);
    }
  }, [product]);
  
  // Получение следующего времени запуска
  const getNextRunTime = (type: 'daily' | 'weekly' | 'custom', time: string, days?: number[], interval?: number): Date => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      // Если время уже прошло сегодня, переносим на следующий день
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    if (type === 'weekly' && days && days.length > 0) {
      // Для еженедельного расписания находим ближайший выбранный день
      const currentDay = nextRun.getDay();
      let daysUntilNext = 7;
      
      for (const day of days) {
        const diff = (day - currentDay + 7) % 7;
        if (diff < daysUntilNext && (diff > 0 || (diff === 0 && nextRun > now))) {
          daysUntilNext = diff;
        }
      }
      
      if (daysUntilNext < 7) {
        nextRun.setDate(nextRun.getDate() + daysUntilNext);
      }
    } else if (type === 'custom' && interval) {
      // Для пользовательского интервала добавляем указанное количество часов
      nextRun = new Date(now.getTime() + interval * 60 * 60 * 1000);
    }
    
    return nextRun;
  };
  
  // Обработчик добавления нового расписания
  const handleAddSchedule = () => {
    const newScheduleWithId: ScheduleItem = {
      ...newSchedule,
      id: `schedule-${Date.now()}`,
      nextRun: getNextRunTime(
        newSchedule.type,
        newSchedule.time,
        newSchedule.days,
        newSchedule.interval
      )
    };
    
    setScheduleItems([...scheduleItems, newScheduleWithId]);
    setIsAddingSchedule(false);
    
    // Сбрасываем форму нового расписания
    setNewSchedule({
      isActive: true,
      type: 'daily',
      time: '12:00',
      days: [1, 3, 5],
      interval: 24
    });
    
    toast({
      title: 'Расписание добавлено',
      description: 'Новое расписание мониторинга добавлено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик удаления расписания
  const handleDeleteSchedule = (scheduleId: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== scheduleId));
    
    toast({
      title: 'Расписание удалено',
      description: 'Расписание мониторинга удалено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик изменения активности расписания
  const handleToggleScheduleActive = (scheduleId: string) => {
    setScheduleItems(scheduleItems.map(item => 
      item.id === scheduleId ? { ...item, isActive: !item.isActive } : item
    ));
  };
  
  // Обработчик сохранения расписания
  const handleSaveSchedule = () => {
    onSaveSchedule(scheduleItems);
    
    toast({
      title: 'Расписание сохранено',
      description: 'Расписание мониторинга сохранено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Обработчик выбора/отмены выбора дня недели
  const handleToggleDay = (day: number) => {
    setNewSchedule(prev => {
      const days = prev.days || [];
      if (days.includes(day)) {
        return { ...prev, days: days.filter(d => d !== day) };
      } else {
        return { ...prev, days: [...days, day].sort() };
      }
    });
  };
  
  // Получение названия дня недели
  const getDayName = (day: number): string => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[day];
  };
  
  // Форматирование даты
  const formatDate = (date?: Date): string => {
    if (!date) return 'Не запланировано';
    
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Получение описания расписания
  const getScheduleDescription = (schedule: ScheduleItem): string => {
    if (schedule.type === 'daily') {
      return `Ежедневно в ${schedule.time}`;
    } else if (schedule.type === 'weekly' && schedule.days) {
      const daysText = schedule.days.map(day => getDayName(day)).join(', ');
      return `Еженедельно (${daysText}) в ${schedule.time}`;
    } else if (schedule.type === 'custom' && schedule.interval) {
      return `Каждые ${schedule.interval} часов`;
    }
    
    return 'Неизвестное расписание';
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
        <Heading size="md">Расписание мониторинга</Heading>
      </Flex>
      
      <VStack spacing={4} align="stretch" mb={4}>
        {scheduleItems.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Нет расписания</AlertTitle>
            <AlertDescription>
              Добавьте расписание для автоматического мониторинга цен
            </AlertDescription>
          </Alert>
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg={headerBg}>
              <Tr>
                <Th width="50px">Статус</Th>
                <Th>Расписание</Th>
                <Th>Следующий запуск</Th>
                <Th width="100px">Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {scheduleItems.map(schedule => (
                <Tr key={schedule.id}>
                  <Td>
                    <Switch
                      isChecked={schedule.isActive}
                      onChange={() => handleToggleScheduleActive(schedule.id)}
                      colorScheme="blue"
                      size="sm"
                    />
                  </Td>
                  <Td>
                    <HStack>
                      <Icon as={FaRegClock} color="blue.500" />
                      <Text>{getScheduleDescription(schedule)}</Text>
                      {!schedule.isActive && (
                        <Badge colorScheme="gray">Неактивно</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Text color={schedule.isActive ? 'green.500' : textColor}>
                      {formatDate(schedule.nextRun)}
                    </Text>
                  </Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Удалить расписание"
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
      
      {isAddingSchedule ? (
        <Box
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          bg={headerBg}
          mb={4}
        >
          <Heading size="sm" mb={3}>Новое расписание</Heading>
          
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Тип расписания</FormLabel>
              <Select
                value={newSchedule.type}
                onChange={(e) => setNewSchedule({
                  ...newSchedule,
                  type: e.target.value as any
                })}
              >
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="custom">Пользовательский интервал</option>
              </Select>
            </FormControl>
            
            {newSchedule.type !== 'custom' && (
              <FormControl>
                <FormLabel>Время запуска</FormLabel>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({
                    ...newSchedule,
                    time: e.target.value
                  })}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    borderWidth: '1px',
                    borderColor: borderColor,
                    width: '100%'
                  }}
                />
              </FormControl>
            )}
            
            {newSchedule.type === 'weekly' && (
              <FormControl>
                <FormLabel>Дни недели</FormLabel>
                <HStack spacing={2} wrap="wrap">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <Button
                      key={day}
                      size="sm"
                      colorScheme={newSchedule.days?.includes(day) ? 'blue' : 'gray'}
                      onClick={() => handleToggleDay(day)}
                    >
                      {getDayName(day)}
                    </Button>
                  ))}
                </HStack>
              </FormControl>
            )}
            
            {newSchedule.type === 'custom' && (
              <FormControl>
                <FormLabel>Интервал (часы)</FormLabel>
                <NumberInput
                  value={newSchedule.interval}
                  onChange={(_, value) => setNewSchedule({
                    ...newSchedule,
                    interval: value
                  })}
                  min={1}
                  max={168} // 1 неделя
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}
            
            <HStack justify="flex-end" spacing={3} pt={2}>
              <Button
                variant="outline"
                onClick={() => setIsAddingSchedule(false)}
              >
                Отмена
              </Button>
              
              <Button
                colorScheme="blue"
                onClick={handleAddSchedule}
              >
                Добавить расписание
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => setIsAddingSchedule(true)}
          mb={4}
        >
          Добавить расписание
        </Button>
      )}
      
      <Flex justify="space-between">
        <Button
          colorScheme="teal"
          leftIcon={<Icon as={FaRecycle} />}
          onClick={onRunMonitoring}
        >
          Запустить мониторинг сейчас
        </Button>
        
        <Button
          colorScheme="green"
          leftIcon={<CheckIcon />}
          onClick={handleSaveSchedule}
          isDisabled={scheduleItems.length === 0}
        >
          Сохранить расписание
        </Button>
      </Flex>
    </Box>
  );
};

export default MonitoringScheduler;
