import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Spinner,
  Flex,
  Code,
  IconButton,
  Tooltip,
  Divider,
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { DeleteIcon, RepeatIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

// Интерфейс для подключенного пользователя
interface ConnectedUser {
  chatId: string;
  name: string;
  username: string;
  connectedAt: string;
}

export default function ConnectedUsersPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Состояния
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const [copiedChatId, setCopiedChatId] = useState('');
  const [manualChatId, setManualChatId] = useState('');
  
  // Модальные окна
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isTestMessageOpen, onOpen: onTestMessageOpen, onClose: onTestMessageClose } = useDisclosure();
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Загрузка списка подключенных пользователей
  const fetchConnectedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/connected-users');
      const data = await response.json();
      
      if (data.success) {
        setConnectedUsers(data.users);
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось загрузить список подключенных пользователей',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching connected users:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список подключенных пользователей',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Загрузка списка подключенных пользователей при монтировании компонента
  useEffect(() => {
    fetchConnectedUsers();
  }, []);
  
  // Отправка тестового сообщения
  const handleSendTestMessage = async (chatId: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/send-test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Тестовое сообщение отправлено',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onTestMessageClose();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось отправить тестовое сообщение',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить тестовое сообщение',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Удаление подключенного пользователя
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/connected-users/${selectedUser.chatId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Пользователь успешно удален',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Обновляем список подключенных пользователей
        fetchConnectedUsers();
        onDeleteClose();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось удалить пользователя',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пользователя',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Копирование Chat ID в буфер обмена
  const handleCopyChatId = (chatId: string) => {
    navigator.clipboard.writeText(chatId);
    setCopiedChatId(chatId);
    
    toast({
      title: 'Скопировано',
      description: 'Chat ID скопирован в буфер обмена',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Сбрасываем состояние через 2 секунды
    setTimeout(() => {
      setCopiedChatId('');
    }, 2000);
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
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Подключенные пользователи</Heading>
      
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Список подключенных пользователей</Heading>
            <Button 
              leftIcon={<RepeatIcon />} 
              colorScheme="blue" 
              onClick={fetchConnectedUsers}
              isLoading={isLoading}
            >
              Обновить
            </Button>
          </Flex>
        </CardHeader>
        
        <CardBody>
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : connectedUsers.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Нет подключенных пользователей</AlertTitle>
                <AlertDescription>
                  Пользователи появятся здесь после авторизации в Telegram-боте.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Имя</Th>
                  <Th>Username</Th>
                  <Th>Chat ID</Th>
                  <Th>Дата подключения</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {connectedUsers.map((user) => (
                  <Tr key={user.chatId}>
                    <Td>{user.name}</Td>
                    <Td>{user.username}</Td>
                    <Td>
                      <Flex align="center">
                        <Code p={1} borderRadius="md" fontSize="sm">
                          {user.chatId}
                        </Code>
                        <IconButton
                          aria-label="Копировать Chat ID"
                          icon={copiedChatId === user.chatId ? <CheckIcon /> : <CopyIcon />}
                          size="xs"
                          ml={2}
                          colorScheme={copiedChatId === user.chatId ? "green" : "gray"}
                          variant="ghost"
                          onClick={() => handleCopyChatId(user.chatId)}
                        />
                      </Flex>
                    </Td>
                    <Td>{formatDate(user.connectedAt)}</Td>
                    <Td>
                      <Tooltip label="Отправить тестовое сообщение">
                        <IconButton
                          aria-label="Отправить тестовое сообщение"
                          icon={<RepeatIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          mr={2}
                          onClick={() => {
                            setSelectedUser(user);
                            onTestMessageOpen();
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="Удалить пользователя">
                        <IconButton
                          aria-label="Удалить пользователя"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            onDeleteOpen();
                          }}
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
        
        <CardFooter>
          <Text fontSize="sm" color="gray.500">
            Всего подключенных пользователей: {connectedUsers.length}
          </Text>
        </CardFooter>
      </Card>
      
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
        <CardHeader>
          <Heading size="md">Отправить тестовое сообщение</Heading>
        </CardHeader>
        
        <CardBody>
          <FormControl>
            <FormLabel>Chat ID</FormLabel>
            <Input 
              value={manualChatId}
              onChange={(e) => setManualChatId(e.target.value)}
              placeholder="Введите Chat ID пользователя"
            />
          </FormControl>
        </CardBody>
        
        <CardFooter>
          <Button 
            colorScheme="blue" 
            onClick={() => handleSendTestMessage(manualChatId)}
            isDisabled={!manualChatId}
          >
            Отправить тестовое сообщение
          </Button>
        </CardFooter>
      </Card>
      
      {/* Модальное окно отправки тестового сообщения */}
      <Modal isOpen={isTestMessageOpen} onClose={onTestMessageClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Отправка тестового сообщения</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <>
                <Text mb={2}>Вы собираетесь отправить тестовое сообщение пользователю:</Text>
                <Text mb={2}>Имя: <strong>{selectedUser.name}</strong></Text>
                <Text mb={2}>Username: <strong>{selectedUser.username}</strong></Text>
                <Text mb={2}>Chat ID: <Code p={1}>{selectedUser.chatId}</Code></Text>
                
                <Alert status="info" borderRadius="md" mt={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Информация</AlertTitle>
                    <AlertDescription>
                      Тестовое сообщение поможет проверить, правильно ли настроено подключение к Telegram-боту.
                    </AlertDescription>
                  </Box>
                </Alert>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTestMessageClose}>
              Отмена
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => selectedUser && handleSendTestMessage(selectedUser.chatId)}
            >
              Отправить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Модальное окно удаления пользователя */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удаление пользователя</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <>
                <Alert status="error" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Внимание!</AlertTitle>
                    <AlertDescription>
                      Вы собираетесь удалить подключение пользователя. Это действие нельзя отменить.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Text mb={2}>Вы уверены, что хотите удалить подключение пользователя:</Text>
                <Text mb={2}>Имя: <strong>{selectedUser.name}</strong></Text>
                <Text mb={2}>Username: <strong>{selectedUser.username}</strong></Text>
                <Text mb={2}>Chat ID: <Code p={1}>{selectedUser.chatId}</Code></Text>
                
                <Alert status="warning" borderRadius="md" mt={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Последствия</AlertTitle>
                    <AlertDescription>
                      После удаления пользователь больше не будет получать уведомления. Для повторного подключения ему потребуется заново авторизоваться в боте.
                    </AlertDescription>
                  </Box>
                </Alert>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Отмена
            </Button>
            <Button colorScheme="red" onClick={handleDeleteUser}>
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
