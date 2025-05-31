import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Divider,
  Text,
  Heading,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Checkbox,
  IconButton,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Flex,
  Image,
  useToast,
  Spacer
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { OzonCardData, OzonCardAttribute, OzonCardSpecification } from '../../types/product';
import HelpTooltip from '../common/HelpTooltip';
import AIDescriptionGenerator from '../ai/AIDescriptionGenerator';

interface OzonCardEditorProps {
  cardData: OzonCardData | null;
  onSave: (cardData: OzonCardData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Компонент для редактирования карточки товара Ozon
 */
const OzonCardEditor: React.FC<OzonCardEditorProps> = ({
  cardData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  // Состояние
  const [formData, setFormData] = useState<OzonCardData>(
    cardData || {
      status: 'draft',
      title: '',
      description: '',
      brand: '',
      images: [],
      attributes: [],
      specifications: [],
      categoryId: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  // Состояние для новых атрибутов и характеристик
  const [newAttribute, setNewAttribute] = useState<Partial<OzonCardAttribute>>({
    name: '',
    value: '',
    isRequired: false
  });

  const [newSpecification, setNewSpecification] = useState<Partial<OzonCardSpecification>>({
    name: '',
    value: '',
    unit: ''
  });

  // Состояние для новой ссылки на изображение
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // Состояние для редактирования размеров
  const [dimensions, setDimensions] = useState({
    weight: formData.dimensions?.weight || 0,
    length: formData.dimensions?.length || 0,
    width: formData.dimensions?.width || 0,
    height: formData.dimensions?.height || 0
  });

  // Toast для уведомлений
  const toast = useToast();

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Обработчик изменения основных полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения чекбоксов
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Обработчик изменения числовых полей
  const handleNumberChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения размеров
  const handleDimensionChange = (name: string, value: number) => {
    setDimensions(prev => ({
      ...prev,
      [name]: value
    }));

    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value
      }
    }));
  };

  // Обработчик добавления атрибута
  const handleAddAttribute = () => {
    if (!newAttribute.name || !newAttribute.value) {
      toast({
        title: 'Ошибка',
        description: 'Название и значение атрибута не могут быть пустыми',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const id = `attr-${Date.now()}`;
    const attribute: OzonCardAttribute = {
      id,
      name: newAttribute.name || '',
      value: newAttribute.value || '',
      isRequired: newAttribute.isRequired || false
    };

    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, attribute]
    }));

    setNewAttribute({
      name: '',
      value: '',
      isRequired: false
    });
  };

  // Обработчик удаления атрибута
  const handleDeleteAttribute = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
  };

  // Обработчик добавления характеристики
  const handleAddSpecification = () => {
    if (!newSpecification.name || !newSpecification.value) {
      toast({
        title: 'Ошибка',
        description: 'Название и значение характеристики не могут быть пустыми',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const id = `spec-${Date.now()}`;
    const specification: OzonCardSpecification = {
      id,
      name: newSpecification.name || '',
      value: newSpecification.value || '',
      unit: newSpecification.unit
    };

    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, specification]
    }));

    setNewSpecification({
      name: '',
      value: '',
      unit: ''
    });
  };

  // Обработчик удаления характеристики
  const handleDeleteSpecification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter(spec => spec.id !== id)
    }));
  };

  // Обработчик добавления изображения
  const handleAddImage = () => {
    if (!newImageUrl) {
      toast({
        title: 'Ошибка',
        description: 'URL изображения не может быть пустым',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl]
    }));

    setNewImageUrl('');
  };

  // Обработчик удаления изображения
  const handleDeleteImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Обработчик установки основного изображения
  const handleSetPrimaryImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      primaryImage: url
    }));
  };

  // Обработчик сохранения карточки
  const handleSave = () => {
    // Обновляем размеры
    const updatedFormData = {
      ...formData,
      dimensions: {
        weight: dimensions.weight,
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height
      }
    };

    onSave(updatedFormData);
  };

  return (
    <Box>
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Основная информация</Tab>
          <Tab>Атрибуты</Tab>
          <Tab>Характеристики</Tab>
          <Tab>Изображения</Tab>
          <Tab>Размеры и упаковка</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Название товара</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Введите название товара"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Бренд</FormLabel>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Введите название бренда"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Штрих-код</FormLabel>
                <Input
                  name="barcode"
                  value={formData.barcode || ''}
                  onChange={handleChange}
                  placeholder="Введите штрих-код товара"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Категория</FormLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  placeholder="Выберите категорию товара"
                >
                  <option value="electronics">Электроника</option>
                  <option value="home">Товары для дома</option>
                  <option value="clothes">Одежда</option>
                  <option value="beauty">Красота и здоровье</option>
                  <option value="sport">Спорт и отдых</option>
                  <option value="kids">Детские товары</option>
                  <option value="food">Продукты питания</option>
                  <option value="other">Другое</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <Flex justify="space-between" align="center" mb={2}>
                  <FormLabel mb={0}>Описание товара</FormLabel>
                  <AIDescriptionGenerator
                    productTitle={formData.title}
                    productCategory={formData.categoryId}
                    productBrand={formData.brand}
                    initialDescription={formData.description}
                    onApplyDescription={(description) => {
                      setFormData(prev => ({
                        ...prev,
                        description
                      }));
                    }}
                    onApplySummary={(summary) => {
                      setFormData(prev => ({
                        ...prev,
                        shortDescription: summary
                      }));
                    }}
                  />
                </Flex>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Введите описание товара"
                  minHeight="200px"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Краткое описание</FormLabel>
                <Textarea
                  name="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={handleChange}
                  placeholder="Введите краткое описание товара"
                  minHeight="100px"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Производитель</FormLabel>
                  <Input
                    name="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={handleChange}
                    placeholder="Введите название производителя"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Страна производства</FormLabel>
                  <Input
                    name="manufacturerCountry"
                    value={formData.manufacturerCountry || ''}
                    onChange={handleChange}
                    placeholder="Введите страну производства"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>НДС (%)</FormLabel>
                  <NumberInput
                    value={formData.vat || 20}
                    onChange={(_, value) => handleNumberChange('vat', value)}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Гарантия (месяцев)</FormLabel>
                  <NumberInput
                    value={formData.warranty || 0}
                    onChange={(_, value) => handleNumberChange('warranty', value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <Checkbox
                    name="isDigital"
                    isChecked={formData.isDigital || false}
                    onChange={handleCheckboxChange}
                  >
                    Цифровой товар
                  </Checkbox>
                </FormControl>

                <FormControl>
                  <Checkbox
                    name="isAdult"
                    isChecked={formData.isAdult || false}
                    onChange={handleCheckboxChange}
                  >
                    Товар для взрослых (18+)
                  </Checkbox>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Атрибуты товара</Heading>
              <Text color={textColor}>
                Атрибуты помогают покупателям находить ваш товар при поиске на Ozon
              </Text>

              <Divider />

              <HStack>
                <FormControl>
                  <FormLabel>Название атрибута</FormLabel>
                  <Input
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                    placeholder="Например: Цвет, Материал, Размер"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Значение атрибута</FormLabel>
                  <Input
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                    placeholder="Например: Красный, Хлопок, XL"
                  />
                </FormControl>

                <FormControl width="auto" alignSelf="flex-end">
                  <Checkbox
                    isChecked={newAttribute.isRequired}
                    onChange={(e) => setNewAttribute({ ...newAttribute, isRequired: e.target.checked })}
                  >
                    Обязательный
                  </Checkbox>
                </FormControl>

                <IconButton
                  icon={<AddIcon />}
                  aria-label="Добавить атрибут"
                  colorScheme="blue"
                  onClick={handleAddAttribute}
                  alignSelf="flex-end"
                />
              </HStack>

              <Divider />

              {formData.attributes.length === 0 ? (
                <Text color={textColor}>Атрибуты не добавлены</Text>
              ) : (
                <VStack spacing={2} align="stretch">
                  {formData.attributes.map((attr) => (
                    <HStack key={attr.id} p={2} borderWidth="1px" borderRadius="md">
                      <Text fontWeight="bold">{attr.name}:</Text>
                      <Text>{attr.value}</Text>
                      {attr.isRequired && (
                        <Badge colorScheme="red">Обязательный</Badge>
                      )}
                      <Spacer />
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Удалить атрибут"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteAttribute(attr.id)}
                      />
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Характеристики товара</Heading>
              <Text color={textColor}>
                Характеристики отображаются на странице товара и помогают покупателям принять решение о покупке
              </Text>

              <Divider />

              <HStack>
                <FormControl>
                  <FormLabel>Название характеристики</FormLabel>
                  <Input
                    value={newSpecification.name}
                    onChange={(e) => setNewSpecification({ ...newSpecification, name: e.target.value })}
                    placeholder="Например: Мощность, Объем, Скорость"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Значение характеристики</FormLabel>
                  <Input
                    value={newSpecification.value}
                    onChange={(e) => setNewSpecification({ ...newSpecification, value: e.target.value })}
                    placeholder="Например: 1000, 5, 100"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Единица измерения</FormLabel>
                  <Input
                    value={newSpecification.unit || ''}
                    onChange={(e) => setNewSpecification({ ...newSpecification, unit: e.target.value })}
                    placeholder="Например: Вт, л, км/ч"
                  />
                </FormControl>

                <IconButton
                  icon={<AddIcon />}
                  aria-label="Добавить характеристику"
                  colorScheme="blue"
                  onClick={handleAddSpecification}
                  alignSelf="flex-end"
                />
              </HStack>

              <Divider />

              {formData.specifications.length === 0 ? (
                <Text color={textColor}>Характеристики не добавлены</Text>
              ) : (
                <VStack spacing={2} align="stretch">
                  {formData.specifications.map((spec) => (
                    <HStack key={spec.id} p={2} borderWidth="1px" borderRadius="md">
                      <Text fontWeight="bold">{spec.name}:</Text>
                      <Text>{spec.value} {spec.unit}</Text>
                      <Spacer />
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Удалить характеристику"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteSpecification(spec.id)}
                      />
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Изображения товара</Heading>
              <Text color={textColor}>
                Добавьте изображения товара. Первое изображение будет использоваться как основное.
              </Text>

              <Divider />

              <HStack>
                <FormControl>
                  <FormLabel>URL изображения</FormLabel>
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Введите URL изображения"
                  />
                </FormControl>

                <IconButton
                  icon={<AddIcon />}
                  aria-label="Добавить изображение"
                  colorScheme="blue"
                  onClick={handleAddImage}
                  alignSelf="flex-end"
                />
              </HStack>

              <Divider />

              {formData.images.length === 0 ? (
                <Text color={textColor}>Изображения не добавлены</Text>
              ) : (
                <SimpleGrid columns={3} spacing={4}>
                  {formData.images.map((url, index) => (
                    <Box
                      key={index}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={formData.primaryImage === url ? 'blue.500' : borderColor}
                    >
                      <Image
                        src={url}
                        alt={`Изображение товара ${index + 1}`}
                        maxHeight="150px"
                        objectFit="contain"
                        mx="auto"
                        mb={2}
                      />

                      <HStack justify="center">
                        <IconButton
                          icon={<CheckIcon />}
                          aria-label="Сделать основным"
                          colorScheme={formData.primaryImage === url ? 'blue' : 'gray'}
                          size="sm"
                          onClick={() => handleSetPrimaryImage(url)}
                        />

                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Удалить изображение"
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteImage(index)}
                        />
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Размеры и упаковка</Heading>
              <Text color={textColor}>
                Укажите размеры и вес товара для расчета стоимости доставки
              </Text>

              <Divider />

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Вес (г)</FormLabel>
                  <NumberInput
                    value={dimensions.weight}
                    onChange={(_, value) => handleDimensionChange('weight', value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Количество в упаковке</FormLabel>
                  <NumberInput
                    value={formData.packageQuantity || 1}
                    onChange={(_, value) => handleNumberChange('packageQuantity', value)}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <Heading size="sm">Габариты (мм)</Heading>

              <SimpleGrid columns={3} spacing={4}>
                <FormControl>
                  <FormLabel>Длина</FormLabel>
                  <NumberInput
                    value={dimensions.length}
                    onChange={(_, value) => handleDimensionChange('length', value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Ширина</FormLabel>
                  <NumberInput
                    value={dimensions.width}
                    onChange={(_, value) => handleDimensionChange('width', value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Высота</FormLabel>
                  <NumberInput
                    value={dimensions.height}
                    onChange={(_, value) => handleDimensionChange('height', value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Flex justify="flex-end" mt={6}>
        <Button
          colorScheme="gray"
          mr={3}
          onClick={onCancel}
          isDisabled={isLoading}
        >
          Отмена
        </Button>

        <Button
          colorScheme="blue"
          onClick={handleSave}
          isLoading={isLoading}
        >
          Сохранить
        </Button>
      </Flex>
    </Box>
  );
};

export default OzonCardEditor;
