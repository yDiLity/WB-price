import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast({
        title: 'Успешный вход',
        description: 'Вы успешно вошли в систему',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/slots');
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный email или пароль',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      maxW="lg"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={{ base: 'xs', md: 'sm' }}>Вход в аккаунт</Heading>
            <Text color="fg.muted">
              Нет аккаунта?{' '}
              <RouterLink to="/register">
                <Box as="span" color="blue.500">
                  Зарегистрироваться
                </Box>
              </RouterLink>
            </Text>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password">Пароль</FormLabel>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
              </Stack>
              <HStack justify="space-between">
                <Checkbox defaultChecked>Запомнить меня</Checkbox>
                <Button variant="text" size="sm">
                  Забыли пароль?
                </Button>
              </HStack>
              <Stack spacing="6">
                <Button 
                  colorScheme="blue" 
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Войти
                </Button>
                <HStack>
                  <Divider />
                  <Text textStyle="sm" whiteSpace="nowrap" color="fg.muted">
                    или продолжить с
                  </Text>
                  <Divider />
                </HStack>
                <Button variant="outline">Google</Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}
