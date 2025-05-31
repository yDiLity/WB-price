import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  Tooltip,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Card,
  CardHeader,
  CardBody,
  Alert,
  AlertIcon,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaRocket,
  FaEye,
  FaBookmark,
  FaExternalLinkAlt,
  FaTruck,
  FaWarehouse,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

// Интерфейс для слота
interface DeliverySlot {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseRegion: string;
  date: string;
  timeSlot: string;
  type: 'FBS' | 'FBO' | 'Crossdocking';
  available: boolean;
  capacity: number;
  used: number;
  price: number;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: Date;
  estimatedDeliveryTime?: string;
  restrictions?: string[];
}

interface SlotListProps {
  slots: DeliverySlot[];
  isLoading: boolean;
  onBookSlot: (slotId: string) => void;
  onRefresh: () => void;
}

const SlotList: React.FC<SlotListProps> = ({ slots, isLoading, onBookSlot, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('available');
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingQuantity, setBookingQuantity] = useState(1);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Возвращаемся к useColorModeValue с правильными цветами
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Фильтрация слотов
  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slot.warehouseRegion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'all' || slot.warehouseName === warehouseFilter;
    const matchesType = typeFilter === 'all' || slot.type === typeFilter;
    const matchesAvailability = availabilityFilter === 'all' ||
                               (availabilityFilter === 'available' && slot.available) ||
                               (availabilityFilter === 'unavailable' && !slot.available);

    return matchesSearch && matchesWarehouse && matchesType && matchesAvailability;
  });

  // Получение уникальных складов для фильтра
  const uniqueWarehouses = Array.from(new Set(slots.map(slot => slot.warehouseName)));

  // Получение цвета приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Получение цвета типа слота
  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'FBS': return 'blue';
      case 'FBO': return 'purple';
      case 'Crossdocking': return 'teal';
      default: return 'gray';
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Открытие модального окна бронирования
  const openBookingModal = (slot: DeliverySlot) => {
    setSelectedSlot(slot);
    setBookingNotes('');
    setBookingQuantity(1);
    onOpen();
  };

  // Подтверждение бронирования
  const confirmBooking = () => {
    if (!selectedSlot) return;

    onBookSlot(selectedSlot.id);

    toast({
      title: 'Слот забронирован!',
      description: `Слот ${selectedSlot.warehouseName} на ${formatDate(selectedSlot.date)} успешно забронирован`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  // Расчет заполненности слота
  const getCapacityPercentage = (used: number, capacity: number) => {
    return Math.round((used / capacity) * 100);
  };

  return (
    <Box>
      {/* Фильтры и поиск */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">🔍 Поиск и фильтрация слотов</Heading>
            <Button
              leftIcon={<FaSearch />}
              colorScheme="blue"
              variant="outline"
              onClick={onRefresh}
              isLoading={isLoading}
            >
              Обновить
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Поиск по складу или региону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <HStack spacing={4} wrap="wrap">
              <Select
                placeholder="Все склады"
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                maxW="200px"
              >
                {uniqueWarehouses.map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
                ))}
              </Select>

              <Select
                placeholder="Все типы"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                maxW="150px"
              >
                <option value="FBS">FBS</option>
                <option value="FBO">FBO</option>
                <option value="Crossdocking">Кроссдокинг</option>
              </Select>

              <Select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                maxW="180px"
              >
                <option value="all">Все слоты</option>
                <option value="available">Доступные</option>
                <option value="unavailable">Недоступные</option>
              </Select>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Список слотов */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">📦 Слоты поставок ({filteredSlots.length})</Heading>
            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
              Обновлено: {new Date().toLocaleTimeString('ru-RU')}
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" py={10}>
              <VStack>
                <Spinner size="xl" color="blue.500" />
                <Text>Поиск доступных слотов...</Text>
              </VStack>
            </Flex>
          ) : filteredSlots.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Слоты не найдены</Text>
                <Text>Попробуйте изменить параметры поиска или обновить данные</Text>
              </Box>
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Склад</Th>
                    <Th>Дата и время</Th>
                    <Th>Тип</Th>
                    <Th>Заполненность</Th>
                    <Th>Цена</Th>
                    <Th>Приоритет</Th>
                    <Th>Статус</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSlots.map((slot) => (
                    <Tr
                      key={slot.id}
                      _hover={{ bg: hoverBg }}
                      opacity={slot.available ? 1 : 0.6}
                    >
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{slot.warehouseName}</Text>
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.300')}>
                            <Icon as={FaMapMarkerAlt} mr={1} />
                            {slot.warehouseRegion}
                          </Text>
                        </VStack>
                      </Td>

                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            <Icon as={FaCalendarAlt} mr={1} />
                            {formatDate(slot.date)}
                          </Text>
                          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.300')}>
                            <Icon as={FaClock} mr={1} />
                            {slot.timeSlot}
                          </Text>
                        </VStack>
                      </Td>

                      <Td>
                        <Badge colorScheme={getSlotTypeColor(slot.type)} variant="solid">
                          {slot.type}
                        </Badge>
                      </Td>

                      <Td>
                        <VStack align="start" spacing={2}>
                          <Progress
                            value={getCapacityPercentage(slot.used, slot.capacity)}
                            colorScheme={getCapacityPercentage(slot.used, slot.capacity) > 80 ? 'red' : 'green'}
                            size="sm"
                            width="100px"
                          />
                          <Text fontSize="xs">
                            {slot.used}/{slot.capacity} ({getCapacityPercentage(slot.used, slot.capacity)}%)
                          </Text>
                        </VStack>
                      </Td>

                      <Td>
                        <Text fontWeight="bold">{slot.price} ₽</Text>
                      </Td>

                      <Td>
                        <Badge colorScheme={getPriorityColor(slot.priority)}>
                          {slot.priority === 'high' ? 'Высокий' :
                           slot.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                      </Td>

                      <Td>
                        {slot.available ? (
                          <HStack spacing={1}>
                            <Icon as={FaCheckCircle} color="green.500" />
                            <Badge colorScheme="green">
                              Доступен
                            </Badge>
                          </HStack>
                        ) : (
                          <HStack spacing={1}>
                            <Icon as={FaTimesCircle} color="red.500" />
                            <Badge colorScheme="red">
                              Занят
                            </Badge>
                          </HStack>
                        )}
                      </Td>

                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Подробности">
                            <Button
                              size="sm"
                              variant="ghost"
                              leftIcon={<FaEye />}
                              onClick={() => openBookingModal(slot)}
                            >
                              Детали
                            </Button>
                          </Tooltip>

                          {slot.available && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FaRocket />}
                              onClick={() => openBookingModal(slot)}
                            >
                              Забронировать
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Модальное окно бронирования */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Бронирование слота
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedSlot && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={headerBg} borderRadius="md">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" fontSize="lg">
                      {selectedSlot.warehouseName}
                    </Text>
                    <Text color="gray.500">{selectedSlot.warehouseRegion}</Text>
                    <HStack>
                      <Badge colorScheme={getSlotTypeColor(selectedSlot.type)}>
                        {selectedSlot.type}
                      </Badge>
                      <Badge colorScheme={getPriorityColor(selectedSlot.priority)}>
                        Приоритет: {selectedSlot.priority}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>

                <HStack justify="space-between">
                  <VStack align="start">
                    <Text fontWeight="medium">Дата и время</Text>
                    <Text>{formatDate(selectedSlot.date)} {selectedSlot.timeSlot}</Text>
                  </VStack>
                  <VStack align="start">
                    <Text fontWeight="medium">Стоимость</Text>
                    <Text fontWeight="bold" color="blue.500">{selectedSlot.price} ₽</Text>
                  </VStack>
                </HStack>

                <FormControl>
                  <FormLabel>Количество мест</FormLabel>
                  <NumberInput
                    value={bookingQuantity}
                    onChange={(_, value) => setBookingQuantity(value)}
                    min={1}
                    max={selectedSlot.capacity - selectedSlot.used}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Комментарий (необязательно)</FormLabel>
                  <Textarea
                    placeholder="Дополнительная информация о поставке..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FaRocket />}
              onClick={confirmBooking}
              isDisabled={!selectedSlot?.available}
            >
              Подтвердить бронирование
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SlotList;
