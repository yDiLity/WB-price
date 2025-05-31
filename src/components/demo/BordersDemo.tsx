import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue
} from '@chakra-ui/react';

export default function BordersDemo() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box p={8} bg={bg} minH="100vh">
      <VStack spacing={8} align="stretch">
        <Text fontSize="3xl" fontWeight="bold" textAlign="center" className="purple-border purple-border-spacing">
          🎨 Демонстрация фиолетовых рамок
        </Text>

        {/* Карточки */}
        <Box className="purple-section-border purple-border-spacing">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>📦 Карточки</Text>
          <HStack spacing={4} wrap="wrap">
            <Card className="purple-card-border" maxW="300px">
              <CardHeader>
                <Text fontWeight="bold">Товар #1</Text>
              </CardHeader>
              <CardBody>
                <Text>Описание товара с фиолетовой рамкой</Text>
                <Badge colorScheme="purple" mt={2}>В наличии</Badge>
              </CardBody>
            </Card>

            <Card className="purple-animated-border" maxW="300px">
              <CardHeader>
                <Text fontWeight="bold">Товар #2</Text>
              </CardHeader>
              <CardBody>
                <Text>Анимированная рамка</Text>
                <Badge colorScheme="blue" mt={2}>Популярный</Badge>
              </CardBody>
            </Card>

            <Card className="purple-gradient-border" maxW="300px">
              <CardHeader>
                <Text fontWeight="bold">Товар #3</Text>
              </CardHeader>
              <CardBody>
                <Text>Градиентная рамка</Text>
                <Badge colorScheme="green" mt={2}>Новинка</Badge>
              </CardBody>
            </Card>
          </HStack>
        </Box>

        {/* Кнопки */}
        <Box className="purple-container-border purple-border-spacing">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>🔘 Кнопки</Text>
          <HStack spacing={4} wrap="wrap">
            <Button className="purple-button-border" colorScheme="blue">
              Обычная кнопка
            </Button>
            <Button className="purple-button-border" colorScheme="purple" variant="outline">
              Контурная кнопка
            </Button>
            <Button className="purple-button-border" colorScheme="green" size="lg">
              Большая кнопка
            </Button>
            <Button className="purple-button-border" onClick={onOpen}>
              Открыть модальное окно
            </Button>
          </HStack>
        </Box>

        {/* Формы */}
        <Box className="purple-section-border purple-border-spacing">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>📝 Формы</Text>
          <VStack spacing={4} align="stretch" maxW="400px">
            <Input 
              placeholder="Поле ввода с фиолетовой рамкой" 
              className="purple-form-border"
            />
            <Input 
              placeholder="Еще одно поле" 
              className="purple-form-border"
            />
            <Button className="purple-button-border" colorScheme="purple">
              Отправить
            </Button>
          </VStack>
        </Box>

        {/* Таблица */}
        <Box className="purple-container-border purple-border-spacing">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>📊 Таблица</Text>
          <TableContainer>
            <Table className="purple-table-border" variant="striped" colorScheme="purple">
              <Thead>
                <Tr>
                  <Th>Товар</Th>
                  <Th>Цена</Th>
                  <Th>Статус</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Товар 1</Td>
                  <Td>1000 ₽</Td>
                  <Td><Badge colorScheme="green">В наличии</Badge></Td>
                </Tr>
                <Tr>
                  <Td>Товар 2</Td>
                  <Td>2000 ₽</Td>
                  <Td><Badge colorScheme="yellow">Мало</Badge></Td>
                </Tr>
                <Tr>
                  <Td>Товар 3</Td>
                  <Td>3000 ₽</Td>
                  <Td><Badge colorScheme="red">Нет в наличии</Badge></Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Алерты */}
        <Box className="purple-section-border purple-border-spacing">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>⚠️ Уведомления</Text>
          <VStack spacing={4} align="stretch">
            <Alert status="info" className="purple-alert-border">
              <AlertIcon />
              Информационное сообщение с фиолетовой рамкой
            </Alert>
            <Alert status="success" className="purple-alert-border">
              <AlertIcon />
              Успешное выполнение операции
            </Alert>
            <Alert status="warning" className="purple-alert-border">
              <AlertIcon />
              Предупреждение о возможных проблемах
            </Alert>
          </VStack>
        </Box>

        {/* Статистика */}
        <Box className="purple-dashboard-border purple-border-spacing">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>📈 Статистика</Text>
          <HStack spacing={8} wrap="wrap">
            <Stat className="purple-stat-border purple-border-spacing">
              <StatLabel>Общий доход</StatLabel>
              <StatNumber>₽345,670</StatNumber>
              <StatHelpText>+23% с прошлого месяца</StatHelpText>
            </Stat>
            <Stat className="purple-stat-border purple-border-spacing">
              <StatLabel>Продажи</StatLabel>
              <StatNumber>1,234</StatNumber>
              <StatHelpText>+12% с прошлого месяца</StatHelpText>
            </Stat>
            <Stat className="purple-stat-border purple-border-spacing">
              <StatLabel>Конверсия</StatLabel>
              <StatNumber>23.4%</StatNumber>
              <StatHelpText>+5% с прошлого месяца</StatHelpText>
            </Stat>
          </HStack>
        </Box>
      </VStack>

      {/* Модальное окно */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className="purple-modal-border">
          <ModalHeader>Модальное окно с фиолетовой рамкой</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>Это модальное окно демонстрирует фиолетовую рамку.</Text>
            <Input 
              placeholder="Поле в модальном окне" 
              className="purple-form-border"
              mt={4}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
