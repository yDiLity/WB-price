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
  

  const [apiKey, setApiKey] = useState('WB_SELLER_API_yDiLity_2025_4PRODUCTS_5340O_5100_540_640_REAL_DATA_v1.0');
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
      setApiKey(user.ozonApiCredentials.apiKey || '');
      setValidated(user.ozonApiCredentials.isValid || false);
      setValidationSuccess(user.ozonApiCredentials.isValid || false);
    }
  }, [user]);
  
  // Обработчик проверки учетных данных API
  const handleValidateCredentials = async () => {
    if (!apiKey) {
      return;
    }
    
    setValidating(true);
    setValidated(false);
    clearError();
    
    const credentials: OzonApiCredentials = {
      clientId: '', // ID поставщика извлекается из токена
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
    if (!apiKey) {
      return;
    }

    const credentials: OzonApiCredentials = {
      clientId: '', // ID поставщика извлекается из токена
      apiKey,
      isValid: validationSuccess
    };
    
    await updateOzonApiCredentials(credentials);
  };
  
  // Обработчик сброса формы
  const handleReset = () => {
    if (user && user.ozonApiCredentials) {
      setApiKey(user.ozonApiCredentials.apiKey || '');
      setValidated(user.ozonApiCredentials.isValid || false);
      setValidationSuccess(user.ozonApiCredentials.isValid || false);
    } else {
      setApiKey('WB_SELLER_API_yDiLity_2025_4PRODUCTS_5340O_5100_540_640_REAL_DATA_v1.0');
      setValidated(false);
      setValidationSuccess(false);
    }
    clearError();
  };
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Настройки API Wildberries</Heading>

        <Text color={textColor}>
          Для интеграции с API Wildberries и получения данных о ваших товарах необходимо указать учетные данные API.
          Эти данные можно получить в личном кабинете продавца Wildberries.
        </Text>
        
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardHeader>
            <Heading size="md">Статус подключения API</Heading>
          </CardHeader>
          <CardBody>
            <Flex align="center">
              <Text>Статус API Wildberries:</Text>
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
            <Heading size="md">Учетные данные API Wildberries</Heading>
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
                      ? 'Учетные данные API Wildberries успешно проверены'
                      : 'Не удалось подключиться к API Wildberries с указанными учетными данными'}
                  </AlertDescription>
                </Alert>
              )}
              
              <FormControl isRequired>
                <FormLabel>API Key</FormLabel>
                <InputGroup>
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Введите API ключ Wildberries"
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
                  <Link href="https://seller.wildberries.ru/supplier-settings/access-to-api" isExternal color="blue.500">
                    личном кабинете продавца Wildberries <ExternalLinkIcon mx="2px" />
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
                isDisabled={!apiKey || isLoading}
              >
                Проверить подключение
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSaveCredentials}
                isDisabled={!apiKey || isLoading || validating || !validationSuccess}
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
              <Text>1. Войдите в личный кабинет продавца Wildberries</Text>
              <Text>2. Перейдите в раздел "Настройки" → "Доступ к API"</Text>
              <Text>3. Нажмите кнопку "Создать новый токен"</Text>
              <Text>4. Выберите права доступа: "Контент", "Маркетплейс", "Статистика"</Text>
              <Text>5. Скопируйте полученный API ключ (токен)</Text>
              <Text>6. Вставьте его в поле на этой странице</Text>
              <Text>7. Нажмите "Проверить подключение", а затем "Сохранить"</Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
