import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Textarea,
  VStack,
  HStack,
  useToast,
  Spinner,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Tooltip,
  IconButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Link
} from '@chakra-ui/react';
import { InfoIcon, CheckIcon, RepeatIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaRobot, FaMagic, FaLightbulb, FaGoogle } from 'react-icons/fa';

// Типы для генерации описаний
interface AIDescriptionGeneratorProps {
  productTitle: string;
  productCategory?: string;
  productBrand?: string;
  initialDescription?: string;
  onApplyDescription: (description: string) => void;
  onApplySummary?: (summary: string) => void;
}

// Примеры стилей описаний
const DESCRIPTION_STYLES = [
  { value: 'informative', label: 'Информативный', description: 'Подробное описание с акцентом на характеристики и факты' },
  { value: 'emotional', label: 'Эмоциональный', description: 'Описание с акцентом на эмоции и впечатления от использования' },
  { value: 'professional', label: 'Профессиональный', description: 'Строгое и деловое описание для профессиональных товаров' },
  { value: 'casual', label: 'Повседневный', description: 'Простое и понятное описание для повседневных товаров' },
  { value: 'luxury', label: 'Премиальный', description: 'Описание с акцентом на эксклюзивность и высокое качество' }
];

// Примеры тональностей
const TONES = [
  { value: 'neutral', label: 'Нейтральный' },
  { value: 'enthusiastic', label: 'Восторженный' },
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'formal', label: 'Формальный' },
  { value: 'persuasive', label: 'Убедительный' }
];

/**
 * Компонент для генерации описаний товаров с помощью ИИ
 */
const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
  productTitle,
  productCategory,
  productBrand,
  initialDescription,
  onApplyDescription,
  onApplySummary
}) => {
  // Состояния
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [style, setStyle] = useState('informative');
  const [tone, setTone] = useState('neutral');
  const [length, setLength] = useState('medium');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  // Цвета
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Toast для уведомлений
  const toast = useToast();

  // Открытие модального окна
  const handleOpen = () => {
    setIsOpen(true);
  };

  // Закрытие модального окна
  const handleClose = () => {
    setIsOpen(false);
  };

  // Генерация описания с помощью ИИ
  const generateDescription = async () => {
    if (!apiKey) {
      toast({
        title: 'API ключ не указан',
        description: 'Пожалуйста, укажите API ключ Google Gemini для использования функции генерации описаний',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      setActiveTab(2); // Переключаемся на вкладку настроек
      return;
    }

    setIsLoading(true);

    try {
      // Формируем запрос к API Google Gemini
      const prompt = `Создай описание товара для маркетплейса Ozon.
Название товара: ${productTitle}
${productCategory ? `Категория: ${productCategory}` : ''}
${productBrand ? `Бренд: ${productBrand}` : ''}
Стиль описания: ${DESCRIPTION_STYLES.find(s => s.value === style)?.label || 'Информативный'}
Тональность: ${TONES.find(t => t.value === tone)?.label || 'Нейтральный'}
Длина: ${length === 'short' ? 'Короткое (до 500 символов)' : length === 'medium' ? 'Среднее (до 1000 символов)' : 'Длинное (до 2000 символов)'}
${additionalInfo ? `Дополнительная информация: ${additionalInfo}` : ''}

Создай два варианта текста:
1. Полное описание товара с характеристиками, преимуществами и особенностями использования.
2. Краткое описание (до 200 символов) для превью товара.

Формат ответа:
ПОЛНОЕ ОПИСАНИЕ:
[полное описание товара]

КРАТКОЕ ОПИСАНИЕ:
[краткое описание товара]`;

      // Отправляем запрос к API Google Gemini
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Ошибка при генерации описания');
      }

      const content = data.candidates[0].content.parts[0].text;

      // Разделяем полное и краткое описания
      const fullDescriptionMatch = content.match(/ПОЛНОЕ ОПИСАНИЕ:([\s\S]*?)(?=КРАТКОЕ ОПИСАНИЕ:|$)/i);
      const shortDescriptionMatch = content.match(/КРАТКОЕ ОПИСАНИЕ:([\s\S]*?)$/i);

      const fullDescription = fullDescriptionMatch ? fullDescriptionMatch[1].trim() : '';
      const shortDescription = shortDescriptionMatch ? shortDescriptionMatch[1].trim() : '';

      setGeneratedDescription(fullDescription);
      setGeneratedSummary(shortDescription);

      // Сохраняем API ключ в localStorage
      localStorage.setItem('gemini_api_key', apiKey);

      // Переключаемся на вкладку с результатами
      setActiveTab(1);

      toast({
        title: 'Описание сгенерировано',
        description: 'Описание товара успешно сгенерировано',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error('Ошибка при генерации описания:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сгенерировать описание',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Применение сгенерированного описания
  const handleApplyDescription = () => {
    onApplyDescription(generatedDescription);
    if (onApplySummary && generatedSummary) {
      onApplySummary(generatedSummary);
    }
    handleClose();

    toast({
      title: 'Описание применено',
      description: 'Сгенерированное описание успешно применено к товару',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  // Копирование текста в буфер обмена
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'Текст скопирован в буфер обмена',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  return (
    <>
      <Button
        leftIcon={<FaGoogle />}
        colorScheme="purple"
        variant="outline"
        onClick={handleOpen}
        size="md"
      >
        Генерация описания с Gemini AI
        <Badge ml={2} colorScheme="blue" fontSize="xs">BETA</Badge>
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center">
              <FaGoogle style={{ marginRight: '8px' }} />
              Генерация описания товара с помощью Google Gemini AI
              <Badge ml={2} colorScheme="blue" fontSize="xs">BETA</Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Tabs index={activeTab} onChange={setActiveTab} colorScheme="purple" variant="enclosed">
              <TabList>
                <Tab>Параметры</Tab>
                <Tab isDisabled={!generatedDescription}>Результат</Tab>
                <Tab>Настройки API</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Информация о товаре</AlertTitle>
                        <AlertDescription>
                          <Text><strong>Название:</strong> {productTitle}</Text>
                          {productCategory && <Text><strong>Категория:</strong> {productCategory}</Text>}
                          {productBrand && <Text><strong>Бренд:</strong> {productBrand}</Text>}
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl>
                      <FormLabel>Стиль описания</FormLabel>
                      <Select value={style} onChange={(e) => setStyle(e.target.value)}>
                        {DESCRIPTION_STYLES.map(style => (
                          <option key={style.value} value={style.value}>
                            {style.label} - {style.description}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Тональность</FormLabel>
                      <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                        {TONES.map(tone => (
                          <option key={tone.value} value={tone.value}>
                            {tone.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Длина описания</FormLabel>
                      <Select value={length} onChange={(e) => setLength(e.target.value)}>
                        <option value="short">Короткое (до 500 символов)</option>
                        <option value="medium">Среднее (до 1000 символов)</option>
                        <option value="long">Длинное (до 2000 символов)</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Дополнительная информация (опционально)</FormLabel>
                      <Textarea
                        placeholder="Укажите дополнительные сведения о товаре, особенности, преимущества и т.д."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        rows={4}
                      />
                    </FormControl>

                    <Button
                      leftIcon={<FaMagic />}
                      colorScheme="purple"
                      onClick={generateDescription}
                      isLoading={isLoading}
                      loadingText="Генерация..."
                      size="lg"
                      mt={2}
                    >
                      Сгенерировать описание
                    </Button>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Heading size="sm">Полное описание</Heading>
                        <IconButton
                          aria-label="Копировать"
                          icon={<CopyIcon />}
                          size="sm"
                          onClick={() => copyToClipboard(generatedDescription)}
                        />
                      </Flex>
                      <Box
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                        bg={bgColor}
                        maxH="300px"
                        overflowY="auto"
                      >
                        {generatedDescription.split('\n').map((line, index) => (
                          <Text key={index} mb={line.trim() === '' ? 0 : 2}>
                            {line || <br />}
                          </Text>
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Heading size="sm">Краткое описание</Heading>
                        <IconButton
                          aria-label="Копировать"
                          icon={<CopyIcon />}
                          size="sm"
                          onClick={() => copyToClipboard(generatedSummary)}
                        />
                      </Flex>
                      <Box
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                        bg={bgColor}
                      >
                        <Text>{generatedSummary}</Text>
                      </Box>
                    </Box>

                    <HStack spacing={4} mt={2}>
                      <Button
                        leftIcon={<RepeatIcon />}
                        onClick={() => {
                          setActiveTab(0);
                        }}
                        variant="outline"
                      >
                        Изменить параметры
                      </Button>
                      <Button
                        leftIcon={<CheckIcon />}
                        colorScheme="green"
                        onClick={handleApplyDescription}
                      >
                        Применить описание
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Настройка API Google Gemini</AlertTitle>
                        <AlertDescription>
                          <Text mb={2}>
                            Для использования функции генерации описаний необходимо указать API ключ Google Gemini.
                            Вы можете получить ключ на сайте <Link href="https://makersuite.google.com/app/apikey" isExternal color="blue.500">Google AI Studio <ExternalLinkIcon mx="2px" /></Link>.
                          </Text>
                          <Text fontSize="sm" fontStyle="italic">
                            Google Gemini API предоставляет бесплатный тариф с лимитом до 60 запросов в минуту, что более чем достаточно для большинства пользователей.
                          </Text>
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <VStack spacing={4} align="stretch" bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="md">
                      <Heading size="sm" display="flex" alignItems="center">
                        <FaGoogle style={{ marginRight: '8px' }} /> Инструкция по получению API ключа Google Gemini
                      </Heading>
                      <Box>
                        <Text fontWeight="bold" mb={1}>1. Перейдите на Google AI Studio</Text>
                        <Text mb={3}>Откройте <Link href="https://makersuite.google.com/app/apikey" isExternal color="blue.500">Google AI Studio <ExternalLinkIcon mx="2px" /></Link> и войдите в свой аккаунт Google</Text>

                        <Text fontWeight="bold" mb={1}>2. Создайте API ключ</Text>
                        <Text mb={3}>Нажмите на кнопку "Create API key" (Создать API ключ)</Text>

                        <Text fontWeight="bold" mb={1}>3. Скопируйте ключ</Text>
                        <Text mb={3}>После создания ключа, скопируйте его и вставьте в поле ниже</Text>
                      </Box>
                    </VStack>

                    <FormControl>
                      <FormLabel>API ключ Google Gemini</FormLabel>
                      <Input
                        type="password"
                        placeholder="AIzaSyA..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </FormControl>

                    <Button
                      leftIcon={<FaGoogle />}
                      colorScheme="blue"
                      onClick={() => {
                        localStorage.setItem('gemini_api_key', apiKey);
                        toast({
                          title: 'API ключ сохранен',
                          description: 'API ключ Google Gemini успешно сохранен',
                          status: 'success',
                          duration: 3000,
                          isClosable: true
                        });
                      }}
                    >
                      Сохранить API ключ
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AIDescriptionGenerator;
