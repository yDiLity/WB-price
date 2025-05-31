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
  FormControl,
  FormLabel,
  Input,
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
  Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, RepeatIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

// Интерфейс для пользователя
interface User {
  email: string;
  name: string;
  chatId: string | null;
  isConnected: boolean;
  password?: string;
  newPassword?: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Состояния
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [copiedPassword, setCopiedPassword] = useState('');
  
  // Модальные окна
  const { isOpen: isAddUserOpen, onOpen: onAddUserOpen, onClose: onAddUserClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Загрузка списка пользователей
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось загрузить список пользователей',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список пользователей',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Загрузка списка пользователей при монтировании компонента
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Создание нового пользователя
  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Пользователь успешно создан',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Открываем модальное окно с паролем
        setSelectedUser(data.user);
        onAddUserClose();
        onPasswordOpen();
        
        // Обновляем список пользователей
        fetchUsers();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось создать пользователя',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать пользователя',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Обновление пароля пользователя
  const handleResetPassword = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${email}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Открываем модальное окно с новым паролем
        setSelectedUser(data.user);
        onPasswordOpen();
        
        toast({
          title: 'Успешно',
          description: 'Пароль успешно обновлен',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось обновить пароль',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить пароль',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Удаление пользователя
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/${selectedUser.email}`, {
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
        
        // Обновляем список пользователей
        fetchUsers();
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
  
  // Копирование пароля в буфер обмена
  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(password);
    
    toast({
      title: 'Скопировано',
      description: 'Пароль скопирован в буфер обмена',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Сбрасываем состояние через 2 секунды
    setTimeout(() => {
      setCopiedPassword('');
    }, 2000);
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Управление пользователями</Heading>
      
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Список пользователей</Heading>
            <Button 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={onAddUserOpen}
            >
              Добавить пользователя
            </Button>
          </Flex>
        </CardHeader>
        
        <CardBody>
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : users.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Нет пользователей</AlertTitle>
                <AlertDescription>
                  Добавьте первого пользователя, нажав на кнопку "Добавить пользователя"
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Имя</Th>
                  <Th>Статус</Th>
                  <Th>Chat ID</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.email}>
                    <Td>{user.email}</Td>
                    <Td>{user.name}</Td>
                    <Td>
                      {user.isConnected ? (
                        <Badge colorScheme="green">Подключен</Badge>
                      ) : (
                        <Badge colorScheme="red">Не подключен</Badge>
                      )}
                    </Td>
                    <Td>{user.chatId || '-'}</Td>
                    <Td>
                      <Tooltip label="Сбросить пароль">
                        <IconButton
                          aria-label="Сбросить пароль"
                          icon={<RepeatIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          mr={2}
                          onClick={() => handleResetPassword(user.email)}
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
            Всего пользователей: {users.length}
          </Text>
        </CardFooter>
      </Card>
      
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Информация</AlertTitle>
          <AlertDescription>
            <Text mb={2}>
              Каждый пользователь получает уникальный пароль для доступа к Telegram-боту.
            </Text>
            <Text>
              После создания пользователя или сброса пароля, отправьте пользователю его пароль для авторизации в боте.
            </Text>
          </AlertDescription>
        </Box>
      </Alert>
      
      {/* Модальное окно добавления пользователя */}
      <Modal isOpen={isAddUserOpen} onClose={onAddUserClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавление пользователя</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input 
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Введите email пользователя"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Имя</FormLabel>
              <Input 
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Введите имя пользователя"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddUserClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleAddUser}>
              Добавить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Модальное окно с паролем */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Пароль пользователя</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <>
                <Alert status="success" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Пароль сгенерирован</AlertTitle>
                    <AlertDescription>
                      Пароль для пользователя {selectedUser.email} успешно сгенерирован.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Text mb={2}>Email: <strong>{selectedUser.email}</strong></Text>
                <Text mb={2}>Имя: <strong>{selectedUser.name}</strong></Text>
                
                <Divider my={4} />
                
                <Text mb={2}>Пароль для Telegram-бота:</Text>
                <Flex align="center" mb={4}>
                  <Code p={2} borderRadius="md" flex="1" fontSize="md" fontWeight="bold">
                    {selectedUser.password || selectedUser.newPassword}
                  </Code>
                  <IconButton
                    aria-label="Копировать пароль"
                    icon={copiedPassword === (selectedUser.password || selectedUser.newPassword) ? <CheckIcon /> : <CopyIcon />}
                    ml={2}
                    colorScheme={copiedPassword === (selectedUser.password || selectedUser.newPassword) ? "green" : "blue"}
                    onClick={() => handleCopyPassword(selectedUser.password || selectedUser.newPassword || '')}
                  />
                </Flex>
                
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Важно!</AlertTitle>
                    <AlertDescription>
                      Сохраните этот пароль, он будет показан только один раз. Передайте его пользователю для авторизации в Telegram-боте.
                    </AlertDescription>
                  </Box>
                </Alert>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onPasswordClose}>
              Закрыть
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
                      Вы собираетесь удалить пользователя. Это действие нельзя отменить.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Text mb={2}>Вы уверены, что хотите удалить пользователя <strong>{selectedUser.email}</strong>?</Text>
                
                {selectedUser.isConnected && (
                  <Alert status="warning" borderRadius="md" mt={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Пользователь подключен</AlertTitle>
                      <AlertDescription>
                        Этот пользователь подключен к Telegram-боту. После удаления он больше не сможет получать уведомления.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
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
