import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Text,
  Link,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Divider,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { FaKey, FaExternalLinkAlt, FaCheck, FaTimes, FaPlay, FaInfo } from 'react-icons/fa'
import { wildberriesApi } from '../services/wildberriesApi'
import { demoWildberriesApi } from '../services/demoWildberriesApi'

interface WBApiKeySetupProps {
  onApiKeySet?: (hasKey: boolean) => void
}

const WBApiKeySetup: React.FC<WBApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasValidKey, setHasValidKey] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    // Проверяем наличие сохраненного API ключа
    const savedKey = wildberriesApi.getApiKey()
    const savedMode = localStorage.getItem('wb_demo_mode')

    if (savedMode === 'false' && savedKey) {
      setApiKey(savedKey)
      setHasValidKey(true)
      setIsDemoMode(false)
      onApiKeySet?.(true)
    } else {
      // По умолчанию включаем демо-режим
      setIsDemoMode(true)
      setHasValidKey(true)
      onApiKeySet?.(true)
      localStorage.setItem('wb_demo_mode', 'true')
    }
  }, [onApiKeySet])

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Введите API ключ')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Устанавливаем API ключ
      wildberriesApi.setApiKey(apiKey.trim())

      // Пробуем сделать тестовый запрос
      await wildberriesApi.getWarehouses()

      setHasValidKey(true)
      onApiKeySet?.(true)

      toast({
        title: 'API ключ сохранен',
        description: 'Подключение к Wildberries API успешно установлено',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      setError('Неверный API ключ или ошибка подключения')
      setHasValidKey(false)
      onApiKeySet?.(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveApiKey = () => {
    localStorage.removeItem('wb_api_key')
    setApiKey('')
    setHasValidKey(false)
    setError('')
    onApiKeySet?.(false)

    toast({
      title: 'API ключ удален',
      description: 'Подключение к Wildberries API отключено',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleDemoMode = () => {
    setIsDemoMode(true)
    setHasValidKey(true)
    setError('')
    localStorage.setItem('wb_demo_mode', 'true')
    onApiKeySet?.(true)

    toast({
      title: 'Демо-режим включен',
      description: 'Используются тестовые данные для демонстрации функционала',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleRealMode = () => {
    const savedKey = wildberriesApi.getApiKey()
    if (savedKey) {
      setIsDemoMode(false)
      setHasValidKey(true)
      localStorage.setItem('wb_demo_mode', 'false')
      onApiKeySet?.(true)

      toast({
        title: 'Реальный режим включен',
        description: 'Используется подключение к настоящему API Wildberries',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      setError('Сначала настройте API ключ')
    }
  }

  if (hasValidKey) {
    return (
      <Box p={4} bg={isDemoMode ? "blue.50" : "green.50"} borderRadius="md" borderWidth="1px" borderColor={isDemoMode ? "blue.200" : "green.200"}>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between" align="center">
            <HStack>
              <FaCheck color={isDemoMode ? "blue" : "green"} />
              <Text color={isDemoMode ? "blue.700" : "green.700"} fontWeight="medium">
                {isDemoMode ? "Демо-режим активен" : "Подключение к Wildberries API активно"}
              </Text>
              <Badge colorScheme={isDemoMode ? "blue" : "green"} variant="subtle">
                {isDemoMode ? "Тестовые данные" : `Ключ: ${apiKey.substring(0, 8)}...`}
              </Badge>
            </HStack>
            <HStack>
              <Button size="sm" variant="outline" onClick={onOpen}>
                Настройки
              </Button>
            </HStack>
          </HStack>

          {/* Переключатель режимов */}
          <HStack spacing={4} p={3} bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200">
            <Text fontSize="sm" fontWeight="medium">Режим работы:</Text>
            <HStack>
              <Button
                size="sm"
                colorScheme={isDemoMode ? "blue" : "gray"}
                variant={isDemoMode ? "solid" : "outline"}
                leftIcon={<FaPlay />}
                onClick={handleDemoMode}
              >
                Демо
              </Button>
              <Button
                size="sm"
                colorScheme={!isDemoMode ? "green" : "gray"}
                variant={!isDemoMode ? "solid" : "outline"}
                leftIcon={<FaKey />}
                onClick={handleRealMode}
              >
                Реальный API
              </Button>
            </HStack>
          </HStack>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Настройки подключения Wildberries</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs>
                <TabList>
                  <Tab>
                    <HStack>
                      <FaPlay />
                      <Text>Демо-режим</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack>
                      <FaKey />
                      <Text>Реальный API</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Демо-режим */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Alert status="info">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Демо-режим</AlertTitle>
                          <AlertDescription>
                            Используйте тестовые данные для изучения функционала без реального API
                          </AlertDescription>
                        </Box>
                      </Alert>

                      <Box p={4} bg="blue.50" borderRadius="md">
                        <Text fontWeight="medium" mb={2}>✨ Возможности демо-режима:</Text>
                        <VStack align="flex-start" spacing={1} fontSize="sm">
                          <Text>• 50 тестовых товаров с реалистичными данными</Text>
                          <Text>• Имитация работы с ценами и остатками</Text>
                          <Text>• Демонстрация поиска конкурентов</Text>
                          <Text>• Тестирование всех функций без ограничений</Text>
                        </VStack>
                      </Box>

                      <Button
                        colorScheme="blue"
                        onClick={() => {
                          handleDemoMode()
                          onClose()
                        }}
                        leftIcon={<FaPlay />}
                      >
                        Включить демо-режим
                      </Button>
                    </VStack>
                  </TabPanel>

                  {/* Реальный API */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Alert status="warning">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Требуется API ключ продавца</AlertTitle>
                          <AlertDescription>
                            Для работы с реальными данными нужен API ключ из личного кабинета Wildberries
                          </AlertDescription>
                        </Box>
                      </Alert>

                      <FormControl>
                        <FormLabel>API ключ Wildberries</FormLabel>
                        <Input
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Введите API ключ"
                          type="password"
                        />
                        <FormHelperText>
                          Получите ключ в разделе "Настройки" → "Доступ к API" в личном кабинете
                        </FormHelperText>
                      </FormControl>

                      <VStack spacing={4} align="stretch">
                        <Box p={4} bg="orange.50" borderRadius="md">
                          <Text fontWeight="medium" mb={2}>📋 Как получить API ключ:</Text>
                          <VStack align="flex-start" spacing={1} fontSize="sm">
                            <Text>1. Зарегистрируйтесь как продавец на Wildberries</Text>
                            <Text>2. Войдите в личный кабинет продавца</Text>
                            <Text>3. Перейдите в "Настройки" → "Доступ к API"</Text>
                            <Text>4. Создайте новый токен с нужными правами</Text>
                          </VStack>

                          <VStack spacing={2} mt={3} align="stretch">
                            <Link
                              href="https://seller.wildberries.ru/supplier-settings/access-to-api"
                              isExternal
                              color="blue.500"
                              fontWeight="medium"
                              fontSize="sm"
                            >
                              🔗 Настройки API (продавцы) <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
                            </Link>
                            <Link
                              href="https://dev.wildberries.ru/"
                              isExternal
                              color="purple.500"
                              fontWeight="medium"
                              fontSize="sm"
                            >
                              🛠️ Документация API для разработчиков <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
                            </Link>
                          </VStack>
                        </Box>

                        <Box p={4} bg="purple.50" borderRadius="md">
                          <Text fontWeight="medium" mb={2} color="purple.700">🔧 Для разработчиков:</Text>
                          <VStack align="flex-start" spacing={1} fontSize="sm" color="purple.600">
                            <Text>• Полная документация API на dev.wildberries.ru</Text>
                            <Text>• Примеры интеграции и SDK</Text>
                            <Text>• Тестовая среда для разработки</Text>
                            <Text>• Техническая поддержка разработчиков</Text>
                          </VStack>
                        </Box>
                      </VStack>

                      {error && (
                        <Alert status="error">
                          <AlertIcon />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <HStack>
                        <Button
                          colorScheme="green"
                          onClick={handleSaveApiKey}
                          isLoading={isLoading}
                          loadingText="Проверка..."
                          leftIcon={<FaKey />}
                        >
                          Подключить API
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                          Отмена
                        </Button>
                        {!isDemoMode && (
                          <Button colorScheme="red" variant="outline" onClick={handleRemoveApiKey}>
                            Удалить ключ
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    )
  }

  return (
    <Alert status="info" flexDirection="column" alignItems="flex-start" p={6}>
      <HStack mb={4}>
        <AlertIcon />
        <AlertTitle>Выберите режим работы</AlertTitle>
      </HStack>

      <AlertDescription mb={4}>
        Вы можете использовать демо-режим для изучения функционала или подключить реальный API Wildberries.
      </AlertDescription>

      {/* Быстрый выбор режима */}
      <HStack spacing={4} mb={6} w="100%">
        <Button
          leftIcon={<FaPlay />}
          colorScheme="blue"
          size="lg"
          onClick={handleDemoMode}
          flex={1}
        >
          Демо-режим
        </Button>
        <Button
          leftIcon={<FaKey />}
          colorScheme="green"
          variant="outline"
          size="lg"
          onClick={onOpen}
          flex={1}
        >
          Настроить API
        </Button>
      </HStack>

      <VStack spacing={4} align="stretch" w="100%">
        {/* Демо-режим */}
        <Box p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
          <Text fontWeight="medium" mb={2} color="blue.700">
            🎭 Демо-режим:
          </Text>
          <VStack align="flex-start" spacing={1} fontSize="sm" color="blue.600">
            <Text>• 50 реалистичных товаров для тестирования</Text>
            <Text>• Полная имитация работы с API Wildberries</Text>
            <Text>• Безопасное изучение всех функций</Text>
            <Text>• Не требует регистрации на Wildberries</Text>
          </VStack>
        </Box>

        {/* Реальный API */}
        <Box p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
          <Text fontWeight="medium" mb={2} color="green.700">
            🔑 Реальный API:
          </Text>
          <VStack align="flex-start" spacing={1} fontSize="sm" color="green.600">
            <Text>• Работа с настоящими товарами и данными</Text>
            <Text>• Автоматическое обновление цен на WB</Text>
            <Text>• Реальная статистика и аналитика</Text>
            <Text>• Требует API ключ продавца Wildberries</Text>
          </VStack>

          <Divider my={3} />

          <Text fontSize="sm" fontWeight="medium" mb={2}>Как получить доступ к API Wildberries:</Text>
          <VStack align="flex-start" spacing={1} fontSize="sm" color="green.600">
            <Text>1. Подайте заявку на сайте seller.wildberries.ru</Text>
            <Text>2. Пройдите процедуру регистрации</Text>
            <Text>3. Получите доступ к личному кабинету</Text>
            <Text>4. Создайте API ключ в настройках</Text>
            <Text>5. Изучите документацию на dev.wildberries.ru</Text>
          </VStack>

          <VStack spacing={2} mt={3} align="stretch">
            <Link
              href="https://seller.wildberries.ru/"
              isExternal
              color="green.500"
              fontWeight="medium"
              fontSize="sm"
            >
              🏪 Стать продавцом на Wildberries <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
            </Link>
            <Link
              href="https://dev.wildberries.ru/"
              isExternal
              color="purple.500"
              fontWeight="medium"
              fontSize="sm"
            >
              📚 Документация API для разработчиков <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
            </Link>
          </VStack>
        </Box>

        <Box p={3} bg="gray.50" borderRadius="md" fontSize="sm" color="gray.600">
          <Text fontWeight="medium" mb={1}>💡 Рекомендация:</Text>
          <Text>
            Начните с демо-режима для изучения функционала.
            После регистрации как продавец на Wildberries сможете переключиться на реальный API.
          </Text>
        </Box>
      </VStack>

      {/* Модальное окно настроек */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent className="purple-modal-border">
          <ModalHeader>Настройки подключения Wildberries</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>
                  <HStack>
                    <FaPlay />
                    <Text>Демо-режим</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaKey />
                    <Text>Реальный API</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Демо-режим */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Демо-режим</AlertTitle>
                        <AlertDescription>
                          Используйте тестовые данные для изучения функционала без реального API
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Box p={4} bg="blue.50" borderRadius="md">
                      <Text fontWeight="medium" mb={2}>✨ Возможности демо-режима:</Text>
                      <VStack align="flex-start" spacing={1} fontSize="sm">
                        <Text>• 50 тестовых товаров с реалистичными данными</Text>
                        <Text>• Имитация работы с ценами и остатками</Text>
                        <Text>• Демонстрация поиска конкурентов</Text>
                        <Text>• Тестирование всех функций без ограничений</Text>
                      </VStack>
                    </Box>

                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        handleDemoMode()
                        onClose()
                      }}
                      leftIcon={<FaPlay />}
                    >
                      Включить демо-режим
                    </Button>
                  </VStack>
                </TabPanel>

                {/* Реальный API */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="warning">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Требуется API ключ продавца</AlertTitle>
                        <AlertDescription>
                          Для работы с реальными данными нужен API ключ из личного кабинета Wildberries
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl>
                      <FormLabel>API ключ Wildberries</FormLabel>
                      <Input
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите API ключ"
                        type="password"
                      />
                      <FormHelperText>
                        Получите ключ в разделе "Настройки" → "Доступ к API" в личном кабинете
                      </FormHelperText>
                    </FormControl>

                    <Box p={4} bg="orange.50" borderRadius="md">
                      <Text fontWeight="medium" mb={2}>📋 Как получить API ключ:</Text>
                      <VStack align="flex-start" spacing={1} fontSize="sm">
                        <Text>1. Зарегистрируйтесь как продавец на Wildberries</Text>
                        <Text>2. Войдите в личный кабинет продавца</Text>
                        <Text>3. Перейдите в "Настройки" → "Доступ к API"</Text>
                        <Text>4. Создайте новый токен с нужными правами</Text>
                      </VStack>

                      <Link
                        href="https://seller.wildberries.ru/supplier-settings/access-to-api"
                        isExternal
                        color="blue.500"
                        fontWeight="medium"
                        mt={2}
                        display="block"
                      >
                        Открыть настройки API <FaExternalLinkAlt style={{ display: 'inline', marginLeft: '4px' }} />
                      </Link>
                    </Box>

                    {error && (
                      <Alert status="error">
                        <AlertIcon />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <HStack>
                      <Button
                        colorScheme="green"
                        onClick={handleSaveApiKey}
                        isLoading={isLoading}
                        loadingText="Проверка..."
                        leftIcon={<FaKey />}
                      >
                        Подключить API
                      </Button>
                      <Button variant="ghost" onClick={onClose}>
                        Отмена
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Alert>
  )
}

export default WBApiKeySetup
