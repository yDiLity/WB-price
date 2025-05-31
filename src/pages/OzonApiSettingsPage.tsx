import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Spacer,
  Badge,
  Tooltip,
  Link,
  Icon,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, InfoIcon, ViewIcon, ViewOffIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { OzonApiCredentials } from '../types/auth';

export default function OzonApiSettingsPage() {
  const { user, isLoading, error, updateOzonApiCredentials, validateOzonApiCredentials, clearError } = useAuth();
  
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  
  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Загружаем сохраненные учетные данные при монтировании компонента
  useEffect(() => {
    if (user && user.ozonApiCredentials) {
      setClientId(user.ozonApiCredentials.clientId || '');
      setApiKey(user.ozonApiCredentials.apiKey || '');
      setValidated(user.ozonApiCredentials.isValid || false);
      setValidationSuccess(user.ozonApiCredentials.isValid || false);
    }
  }, [user]);
  
  // Обработчик проверки учетных данных API
  const handleValidateCredentials = async () => {
    if (!clientId || !apiKey) {
      return;
    }
    
    setValidating(true);
    setValidated(false);
    clearError();
    
    const credentials: OzonApiCredentials = {
      clientId,
      apiKey,
      isValid: false
    };
    
    try {
      const isValid = await validateOzonApiCredentials(credentials);
      setValidated(true);
      setValidationSuccess(isValid);
    } catch (error) {
      setValidated(true);
      setValidationSuccess(false);
    } finally {
      setValidating(false);
    }
  };
  
  // Обработчик сохранения учетных данных API
  const handleSaveCredentials = async () => {
    if (!clientId || !apiKey) {
      return;
    }
    
    const credentials: OzonApiCredentials = {
      clientId,
      apiKey,
      isValid: validationSuccess
    };
    
    await updateOzonApiCredentials(credentials);
  };
  
  // Обработчик сброса формы
  const handleReset = () => {
    if (user && user.ozonApiCredentials) {
      setClientId(user.ozonApiCredentials.clientId || '');
      setApiKey(user.ozonApiCredentials.apiKey || '');
      setValidated(user.ozonApiCredentials.isValid || false);
      setValidationSuccess(user.ozonApiCredentials.isValid || false);
    } else {
      setClientId('');
      setApiKey('');
      setValidated(false);
      setValidationSuccess(false);
    }
    clearError();
  };
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Настройки API Ozon</Heading>
        
        <Text color={textColor}>
          Для интеграции с API Ozon и получения данных о ваших товарах необходимо указать учетные данные API.
          Эти данные можно получить в личном кабинете продавца Ozon.
        </Text>
        
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardHeader>
            <Heading size="md">Статус подключения API</Heading>
          </CardHeader>
          <CardBody>
            <Flex align="center">
              <Text>Статус API Ozon:</Text>
              <Spacer />
              {user?.ozonApiCredentials?.isValid ? (
                <Badge colorScheme="green" p={2} borderRadius="md">
                  <HStack spacing={2}>
                    <Icon as={CheckIcon} />
                    <Text>Подключено</Text>
                  </HStack>
                </Badge>
              ) : (
                <Badge colorScheme="red" p={2} borderRadius="md">
                  <HStack spacing={2}>
                    <Icon as={CloseIcon} />
                    <Text>Не подключено</Text>
                  </HStack>
                </Badge>
              )}
            </Flex>
            
            {user?.ozonApiCredentials?.lastValidated && (
              <Text fontSize="sm" color={textColor} mt={2}>
                Последняя проверка: {new Date(user.ozonApiCredentials.lastValidated).toLocaleString()}
              </Text>
            )}
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardHeader>
            <Heading size="md">Учетные данные API Ozon</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {validated && (
                <Alert status={validationSuccess ? 'success' : 'error'} borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>{validationSuccess ? 'Проверка успешна' : 'Ошибка проверки'}</AlertTitle>
                  <AlertDescription>
                    {validationSuccess 
                      ? 'Учетные данные API Ozon успешно проверены' 
                      : 'Не удалось подключиться к API Ozon с указанными учетными данными'}
                  </AlertDescription>
                </Alert>
              )}
              
              <FormControl isRequired>
                <FormLabel>Client ID</FormLabel>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Введите Client ID"
                  isDisabled={isLoading || validating}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>API Key</FormLabel>
                <InputGroup>
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Введите API Key"
                    isDisabled={isLoading || validating}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showApiKey ? 'Скрыть API Key' : 'Показать API Key'}
                      icon={showApiKey ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={() => setShowApiKey(!showApiKey)}
                      isDisabled={isLoading || validating}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Box>
                <Text fontSize="sm" color={textColor}>
                  <Icon as={InfoIcon} mr={1} />
                  Учетные данные API можно получить в{' '}
                  <Link href="https://seller.ozon.ru/app/settings/api-keys" isExternal color="blue.500">
                    личном кабинете продавца Ozon <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
              </Box>
            </VStack>
          </CardBody>
          <CardFooter>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={handleValidateCredentials}
                isLoading={validating}
                isDisabled={!clientId || !apiKey || isLoading}
              >
                Проверить подключение
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSaveCredentials}
                isDisabled={!clientId || !apiKey || isLoading || validating || !validationSuccess}
              >
                Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                isDisabled={isLoading || validating}
              >
                Сбросить
              </Button>
            </HStack>
          </CardFooter>
        </Card>
        
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardHeader>
            <Heading size="md">Инструкция по получению учетных данных API</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text>1. Войдите в личный кабинет продавца Ozon</Text>
              <Text>2. Перейдите в раздел "Настройки" → "API ключи"</Text>
              <Text>3. Нажмите кнопку "Создать ключ"</Text>
              <Text>4. Скопируйте полученные Client ID и API Key</Text>
              <Text>5. Вставьте их в соответствующие поля на этой странице</Text>
              <Text>6. Нажмите "Проверить подключение", а затем "Сохранить"</Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
