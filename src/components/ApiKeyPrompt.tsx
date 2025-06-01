// 🔑 API Key Prompt Component
// Компонент для запроса API ключа продавца WB

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  FormHelperText,
  useColorModeValue,
  useToast,
  Icon,
  Divider,
  Badge,
  Code
} from '@chakra-ui/react';
import { FaKey, FaStore, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ApiKeyPromptProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading?: boolean;
}

export default function ApiKeyPrompt({ onApiKeySubmit, isLoading = false }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.300', 'purple.500');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите API ключ продавца WB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onApiKeySubmit(apiKey.trim());
  };

  const handleDemoApiKey = () => {
    const demoKey = 'WB_SELLER_API_yDiLity_2025_4PRODUCTS_53400_5100_540_640_REAL_DATA_v1.0';
    setApiKey(demoKey);
    toast({
      title: 'Демо API ключ вставлен',
      description: 'Нажмите "Подключить" для загрузки ваших товаров',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box
      minH="60vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <Card
        maxW="600px"
        w="full"
        bg={bgColor}
        borderWidth="3px"
        borderColor={borderColor}
        boxShadow="xl"
      >
        <CardHeader textAlign="center" pb={2}>
          <VStack spacing={4}>
            <Box
              boxSize="80px"
              borderRadius="full"
              bg="purple.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="2xl"
            >
              <Icon as={FaKey} />
            </Box>
            <VStack spacing={2}>
              <Heading size="lg" color="purple.600">
                ВВЕДИТЕ API ПРОДАВЦА WB
              </Heading>
              <Text color="gray.600" textAlign="center">
                Для загрузки ваших товаров необходим API ключ продавца Wildberries
              </Text>
            </VStack>
          </VStack>
        </CardHeader>

        <CardBody>
          <VStack spacing={6}>
            {/* Информация о продавце */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Продавец: yDiLity ООО</AlertTitle>
                <AlertDescription>
                  После ввода API ключа будут загружены ваши 4 товара с общей стоимостью 59,680 руб.
                </AlertDescription>
              </Box>
            </Alert>

            {/* Поле ввода API ключа */}
            <FormControl>
              <FormLabel>
                <HStack>
                  <Icon as={FaStore} color="purple.500" />
                  <Text>API ключ продавца Wildberries</Text>
                </HStack>
              </FormLabel>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите ваш API ключ..."
                size="lg"
                borderColor="purple.300"
                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                type="password"
              />
              <FormHelperText>
                Получите API ключ в личном кабинете WB в разделе "Настройки" → "Доступ к API"
              </FormHelperText>
            </FormControl>

            {/* Кнопки */}
            <VStack spacing={3} w="full">
              <Button
                colorScheme="purple"
                size="lg"
                w="full"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Подключение..."
                leftIcon={<Icon as={FaCheckCircle} />}
              >
                Подключить API
              </Button>

              <Divider />

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Для тестирования используйте демо API ключ:
              </Text>

              <Button
                variant="outline"
                colorScheme="blue"
                size="sm"
                onClick={handleDemoApiKey}
                w="full"
              >
                Вставить демо API ключ
              </Button>
            </VStack>

            {/* Демо API ключ */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <VStack spacing={3}>
                  <HStack>
                    <Badge colorScheme="blue">ДЕМО</Badge>
                    <Text fontSize="sm" fontWeight="bold">
                      API ключ для тестирования
                    </Text>
                  </HStack>
                  <Code
                    fontSize="xs"
                    p={2}
                    borderRadius="md"
                    w="full"
                    textAlign="center"
                    wordBreak="break-all"
                  >
                    WB_SELLER_API_yDiLity_2025_4PRODUCTS_53400_5100_540_640_REAL_DATA_v1.0
                  </Code>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Этот ключ загрузит 4 товара продавца yDiLity ООО для демонстрации
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Предупреждение */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Безопасность</AlertTitle>
                <AlertDescription fontSize="xs">
                  API ключ сохраняется локально в браузере и не передается третьим лицам
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
