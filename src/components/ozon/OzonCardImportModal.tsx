import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormHelperText,
  useToast,
  Box,
  Divider,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FaFileImport, FaLink, FaCode, FaInfoCircle } from 'react-icons/fa';
import { OzonCardData } from '../../types/product';

interface OzonCardImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cardData: OzonCardData) => void;
}

/**
 * Компонент модального окна для импорта карточки товара
 */
const OzonCardImportModal: React.FC<OzonCardImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  // Состояние
  const [jsonData, setJsonData] = useState<string>('');
  const [ozonUrl, setOzonUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast для уведомлений
  const toast = useToast();
  
  // Обработчик импорта из JSON
  const handleImportFromJson = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Парсим JSON
      const parsedData = JSON.parse(jsonData);
      
      // Проверяем, что это объект
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Данные должны быть объектом');
      }
      
      // Проверяем обязательные поля
      if (!parsedData.title) {
        throw new Error('Отсутствует обязательное поле "title"');
      }
      
      if (!parsedData.description) {
        throw new Error('Отсутствует обязательное поле "description"');
      }
      
      if (!parsedData.brand) {
        throw new Error('Отсутствует обязательное поле "brand"');
      }
      
      // Создаем объект карточки
      const cardData: OzonCardData = {
        status: 'draft',
        title: parsedData.title,
        description: parsedData.description,
        shortDescription: parsedData.shortDescription,
        brand: parsedData.brand,
        barcode: parsedData.barcode,
        images: Array.isArray(parsedData.images) ? parsedData.images : [],
        primaryImage: parsedData.primaryImage,
        attributes: Array.isArray(parsedData.attributes) ? parsedData.attributes : [],
        specifications: Array.isArray(parsedData.specifications) ? parsedData.specifications : [],
        dimensions: parsedData.dimensions,
        packageQuantity: parsedData.packageQuantity,
        categoryId: parsedData.categoryId || 'other',
        categoryPath: parsedData.categoryPath,
        isDigital: parsedData.isDigital,
        isAdult: parsedData.isAdult,
        vat: parsedData.vat,
        manufacturer: parsedData.manufacturer,
        manufacturerCountry: parsedData.manufacturerCountry,
        warranty: parsedData.warranty,
        customFields: parsedData.customFields
      };
      
      // Импортируем карточку
      onImport(cardData);
      
      // Закрываем модальное окно
      onClose();
      
      // Очищаем форму
      setJsonData('');
      setOzonUrl('');
      
      toast({
        title: 'Импорт успешен',
        description: 'Карточка товара успешно импортирована из JSON',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error importing card from JSON:', err);
      setError(`Ошибка импорта из JSON: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      
      toast({
        title: 'Ошибка импорта',
        description: `Не удалось импортировать карточку товара из JSON: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик импорта из URL
  const handleImportFromUrl = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Проверяем URL
      if (!ozonUrl) {
        throw new Error('URL не может быть пустым');
      }
      
      // Проверяем, что URL ведет на Ozon
      if (!ozonUrl.includes('ozon.ru')) {
        throw new Error('URL должен вести на сайт Ozon');
      }
      
      // В реальном приложении здесь будет запрос к API для парсинга страницы Ozon
      // Для демонстрации создаем заглушку
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Создаем объект карточки
      const cardData: OzonCardData = {
        status: 'draft',
        title: 'Импортированный товар с Ozon',
        description: 'Описание товара, импортированного с Ozon. В реальном приложении здесь будет описание, полученное с сайта Ozon.',
        brand: 'Бренд',
        images: [
          'https://via.placeholder.com/500',
          'https://via.placeholder.com/500?text=Image+2',
          'https://via.placeholder.com/500?text=Image+3'
        ],
        attributes: [
          {
            id: 'attr-1',
            name: 'Цвет',
            value: 'Черный',
            isRequired: true
          },
          {
            id: 'attr-2',
            name: 'Материал',
            value: 'Пластик',
            isRequired: false
          }
        ],
        specifications: [
          {
            id: 'spec-1',
            name: 'Вес',
            value: '500',
            unit: 'г'
          },
          {
            id: 'spec-2',
            name: 'Размеры',
            value: '10x20x30',
            unit: 'см'
          }
        ],
        dimensions: {
          weight: 500,
          length: 100,
          width: 200,
          height: 300
        },
        categoryId: 'electronics',
        categoryPath: ['Главная', 'Электроника', 'Смартфоны'],
        manufacturer: 'Производитель',
        manufacturerCountry: 'Китай',
        warranty: 12
      };
      
      // Импортируем карточку
      onImport(cardData);
      
      // Закрываем модальное окно
      onClose();
      
      // Очищаем форму
      setJsonData('');
      setOzonUrl('');
      
      toast({
        title: 'Импорт успешен',
        description: 'Карточка товара успешно импортирована с Ozon',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error importing card from URL:', err);
      setError(`Ошибка импорта с Ozon: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      
      toast({
        title: 'Ошибка импорта',
        description: `Не удалось импортировать карточку товара с Ozon: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Импорт карточки товара</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>
                <HStack>
                  <Icon as={FaLink} />
                  <Text>Импорт с Ozon</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaCode} />
                  <Text>Импорт из JSON</Text>
                </HStack>
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Text>
                      Введите URL товара на Ozon, и система попытается импортировать данные карточки.
                      <br />
                      <strong>Примечание:</strong> Эта функция находится в бета-версии и может работать некорректно.
                    </Text>
                  </Alert>
                  
                  <FormControl>
                    <FormLabel>URL товара на Ozon</FormLabel>
                    <Input
                      value={ozonUrl}
                      onChange={(e) => setOzonUrl(e.target.value)}
                      placeholder="https://www.ozon.ru/product/..."
                    />
                    <FormHelperText>
                      Например: https://www.ozon.ru/product/smartfon-apple-iphone-13-128gb-chernyy-...
                    </FormHelperText>
                  </FormControl>
                  
                  {error && (
                    <Alert status="error">
                      <AlertIcon />
                      <Text>{error}</Text>
                    </Alert>
                  )}
                  
                  <Button
                    leftIcon={<Icon as={FaFileImport} />}
                    colorScheme="blue"
                    onClick={handleImportFromUrl}
                    isLoading={isLoading}
                    isDisabled={!ozonUrl}
                  >
                    Импортировать с Ozon
                  </Button>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Text>
                      Введите данные карточки товара в формате JSON.
                      <br />
                      <strong>Обязательные поля:</strong> title, description, brand, categoryId.
                    </Text>
                  </Alert>
                  
                  <FormControl>
                    <FormLabel>Данные карточки в формате JSON</FormLabel>
                    <Textarea
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      placeholder='{"title": "Название товара", "description": "Описание товара", "brand": "Бренд", "categoryId": "electronics", ...}'
                      minHeight="200px"
                      fontFamily="monospace"
                    />
                  </FormControl>
                  
                  {error && (
                    <Alert status="error">
                      <AlertIcon />
                      <Text>{error}</Text>
                    </Alert>
                  )}
                  
                  <Button
                    leftIcon={<Icon as={FaFileImport} />}
                    colorScheme="blue"
                    onClick={handleImportFromJson}
                    isLoading={isLoading}
                    isDisabled={!jsonData}
                  >
                    Импортировать из JSON
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Divider my={4} />
          
          <Box>
            <HStack mb={2}>
              <Icon as={FaInfoCircle} color="blue.500" />
              <Text fontWeight="bold">Примечание:</Text>
            </HStack>
            <Text fontSize="sm">
              Импортированные данные будут сохранены как черновик карточки товара.
              Вы сможете отредактировать их перед публикацией на Ozon.
            </Text>
          </Box>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OzonCardImportModal;
