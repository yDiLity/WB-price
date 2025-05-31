import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  useToast,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Spacer,
  Icon,
  Badge,
  Select,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaUndo, 
  FaInfoCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import logisticsService from '../../services/logisticsService';
import { LogisticsSettings, LogisticsRule } from '../../types/logistics';

const LogisticsSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<LogisticsSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<LogisticsRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await logisticsService.getLogisticsSettings();
      setSettings(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching logistics settings:', error);
      setIsLoading(false);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки логистического оптимизатора',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      await logisticsService.saveLogisticsSettings(settings);
      setIsSaving(false);
      toast({
        title: 'Настройки сохранены',
        description: 'Настройки логистического оптимизатора успешно сохранены',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving logistics settings:', error);
      setIsSaving(false);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки логистического оптимизатора',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleToggleAutomaticPriceAdjustment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      enableAutomaticPriceAdjustment: e.target.checked
    });
  };
  
  const handleThresholdChange = (field: keyof LogisticsSettings, value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  const handleAddRule = () => {
    if (!settings) return;
    
    const newRule: LogisticsRule = {
      id: `rule-${Date.now()}`,
      name: 'Новое правило',
      description: 'Описание нового правила',
      condition: {
        type: 'stock',
        stockThreshold: 10
      },
      action: {
        type: 'increase',
        value: 5,
        isPercentage: true
      },
      isActive: true
    };
    
    setSettings({
      ...settings,
      rules: [...settings.rules, newRule]
    });
    
    setEditingRule(newRule);
    setIsEditing(true);
  };
  
  const handleEditRule = (rule: LogisticsRule) => {
    setEditingRule(rule);
    setIsEditing(true);
  };
  
  const handleDeleteRule = (ruleId: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      rules: settings.rules.filter(rule => rule.id !== ruleId)
    });
    
    toast({
      title: 'Правило удалено',
      description: 'Правило логистической оптимизации успешно удалено',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleToggleRuleActive = (ruleId: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      rules: settings.rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive } 
          : rule
      )
    });
  };
  
  const handleUpdateRule = () => {
    if (!settings || !editingRule) return;
    
    setSettings({
      ...settings,
      rules: settings.rules.map(rule => 
        rule.id === editingRule.id 
          ? editingRule 
          : rule
      )
    });
    
    setEditingRule(null);
    setIsEditing(false);
    
    toast({
      title: 'Правило обновлено',
      description: 'Правило логистической оптимизации успешно обновлено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleCancelEditRule = () => {
    setEditingRule(null);
    setIsEditing(false);
  };
  
  const handleEditRuleField = (field: keyof LogisticsRule, value: any) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      [field]: value
    });
  };
  
  const handleEditCondition = (field: string, value: any) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      condition: {
        ...editingRule.condition,
        [field]: field === 'type' ? value : Number(value)
      }
    });
  };
  
  const handleEditAction = (field: string, value: any) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      action: {
        ...editingRule.action,
        [field]: field === 'type' || field === 'isPercentage' ? value : Number(value)
      }
    });
  };
  
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Загрузка настроек...</Text>
      </Box>
    );
  }
  
  if (!settings) {
    return (
      <Box textAlign="center" py={10}>
        <Icon as={FaExclamationTriangle} boxSize={10} color="orange.500" mb={4} />
        <Heading size="md" mb={2}>Ошибка загрузки настроек</Heading>
        <Text mb={4}>Не удалось загрузить настройки логистического оптимизатора</Text>
        <Button colorScheme="blue" onClick={fetchSettings}>Повторить попытку</Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Настройки логистического оптимизатора</Heading>
        <Button 
          leftIcon={<FaSave />} 
          colorScheme="blue"
          isLoading={isSaving}
          onClick={handleSaveSettings}
        >
          Сохранить настройки
        </Button>
      </Flex>
      
      <VStack spacing={6} align="stretch">
        {/* Основные настройки */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Основные настройки</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-price-adjustment" mb="0">
                  Автоматическая корректировка цен
                </FormLabel>
                <Spacer />
                <Switch 
                  id="auto-price-adjustment" 
                  isChecked={settings.enableAutomaticPriceAdjustment}
                  onChange={handleToggleAutomaticPriceAdjustment}
                  colorScheme="blue"
                />
              </FormControl>
              
              <Divider />
              
              <FormControl>
                <FormLabel>Порог низкого остатка (шт.)</FormLabel>
                <NumberInput 
                  value={settings.lowStockThreshold} 
                  min={1} 
                  max={100}
                  onChange={(_, value) => handleThresholdChange('lowStockThreshold', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Количество товара, при котором остаток считается низким
                </FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Порог критического остатка (шт.)</FormLabel>
                <NumberInput 
                  value={settings.criticalStockThreshold} 
                  min={0} 
                  max={settings.lowStockThreshold - 1}
                  onChange={(_, value) => handleThresholdChange('criticalStockThreshold', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Количество товара, при котором остаток считается критическим
                </FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Порог скорой поставки (дней)</FormLabel>
                <NumberInput 
                  value={settings.upcomingDeliveryThreshold} 
                  min={1} 
                  max={30}
                  onChange={(_, value) => handleThresholdChange('upcomingDeliveryThreshold', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Количество дней до поставки, при котором поставка считается скорой
                </FormHelperText>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Правила оптимизации */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Flex align="center">
              <Heading size="md">Правила оптимизации</Heading>
              <Spacer />
              <Button 
                leftIcon={<FaPlus />} 
                colorScheme="green" 
                size="sm"
                onClick={handleAddRule}
                isDisabled={isEditing}
              >
                Добавить правило
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {settings.rules.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Text color="gray.500">Нет настроенных правил оптимизации</Text>
                <Button 
                  mt={4} 
                  colorScheme="blue" 
                  leftIcon={<FaPlus />}
                  onClick={handleAddRule}
                >
                  Добавить первое правило
                </Button>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {settings.rules.map((rule) => (
                  <Box 
                    key={rule.id} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    borderColor={rule.isActive ? 'blue.200' : 'gray.200'}
                    bg={rule.isActive ? useColorModeValue('blue.50', 'blue.900') : useColorModeValue('gray.50', 'gray.700')}
                  >
                    <Flex align="center" mb={2}>
                      <Heading size="sm">{rule.name}</Heading>
                      <Spacer />
                      <HStack>
                        <Switch 
                          isChecked={rule.isActive} 
                          onChange={() => handleToggleRuleActive(rule.id)}
                          colorScheme="blue"
                          size="sm"
                        />
                        <Tooltip label="Редактировать правило">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            colorScheme="blue"
                            onClick={() => handleEditRule(rule)}
                            isDisabled={isEditing}
                          >
                            <Icon as={FaEdit} />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Удалить правило">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            colorScheme="red"
                            onClick={onOpen}
                            isDisabled={isEditing}
                          >
                            <Icon as={FaTrash} />
                          </Button>
                        </Tooltip>
                      </HStack>
                    </Flex>
                    
                    <Text fontSize="sm" color={rule.isActive ? 'gray.600' : 'gray.500'} mb={2}>
                      {rule.description}
                    </Text>
                    
                    <Flex wrap="wrap" gap={2}>
                      <Badge colorScheme={rule.isActive ? 'blue' : 'gray'}>
                        {rule.condition.type === 'stock' 
                          ? `Остаток < ${rule.condition.stockThreshold} шт.` 
                          : rule.condition.type === 'delivery' 
                            ? `Поставка через < ${rule.condition.deliveryDaysThreshold} дн.` 
                            : 'Комбинированное условие'}
                      </Badge>
                      <Badge colorScheme={rule.isActive ? 'green' : 'gray'}>
                        {rule.action.type === 'increase' 
                          ? <><Icon as={FaArrowUp} boxSize={3} mr={1} /> Увеличить цену</> 
                          : rule.action.type === 'decrease' 
                            ? <><Icon as={FaArrowDown} boxSize={3} mr={1} /> Уменьшить цену</> 
                            : <><Icon as={FaEquals} boxSize={3} mr={1} /> Установить цену</>}
                        {' '}
                        {rule.action.value}{rule.action.isPercentage ? '%' : ' ₽'}
                      </Badge>
                    </Flex>
                    
                    {/* Диалог подтверждения удаления */}
                    <AlertDialog
                      isOpen={isOpen}
                      leastDestructiveRef={cancelRef}
                      onClose={onClose}
                    >
                      <AlertDialogOverlay>
                        <AlertDialogContent>
                          <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Удалить правило
                          </AlertDialogHeader>
                          <AlertDialogBody>
                            Вы уверены, что хотите удалить правило "{rule.name}"? Это действие нельзя отменить.
                          </AlertDialogBody>
                          <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                              Отмена
                            </Button>
                            <Button 
                              colorScheme="red" 
                              onClick={() => {
                                handleDeleteRule(rule.id);
                                onClose();
                              }} 
                              ml={3}
                            >
                              Удалить
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialogOverlay>
                    </AlertDialog>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
        
        {/* Редактирование правила */}
        {isEditing && editingRule && (
          <Card bg={bgColor} borderWidth="1px" borderColor="blue.300" boxShadow="md">
            <CardHeader bg={useColorModeValue('blue.50', 'blue.900')}>
              <Heading size="md">
                {editingRule.id.startsWith('rule-') ? 'Новое правило' : 'Редактирование правила'}
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Название правила</FormLabel>
                  <Input 
                    value={editingRule.name} 
                    onChange={(e) => handleEditRuleField('name', e.target.value)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Input 
                    value={editingRule.description} 
                    onChange={(e) => handleEditRuleField('description', e.target.value)}
                  />
                </FormControl>
                
                <Divider />
                
                <Heading size="sm">Условие</Heading>
                
                <FormControl>
                  <FormLabel>Тип условия</FormLabel>
                  <Select 
                    value={editingRule.condition.type}
                    onChange={(e) => handleEditCondition('type', e.target.value)}
                  >
                    <option value="stock">Остаток товара</option>
                    <option value="delivery">Скорая поставка</option>
                    <option value="both">Комбинированное условие</option>
                  </Select>
                </FormControl>
                
                {(editingRule.condition.type === 'stock' || editingRule.condition.type === 'both') && (
                  <FormControl>
                    <FormLabel>Порог остатка (шт.)</FormLabel>
                    <NumberInput 
                      value={editingRule.condition.stockThreshold || 0} 
                      min={0} 
                      max={100}
                      onChange={(value) => handleEditCondition('stockThreshold', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Правило сработает, если остаток товара меньше указанного значения
                    </FormHelperText>
                  </FormControl>
                )}
                
                {(editingRule.condition.type === 'delivery' || editingRule.condition.type === 'both') && (
                  <FormControl>
                    <FormLabel>Порог поставки (дней)</FormLabel>
                    <NumberInput 
                      value={editingRule.condition.deliveryDaysThreshold || 0} 
                      min={0} 
                      max={30}
                      onChange={(value) => handleEditCondition('deliveryDaysThreshold', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Правило сработает, если поставка ожидается в течение указанного количества дней
                    </FormHelperText>
                  </FormControl>
                )}
                
                <Divider />
                
                <Heading size="sm">Действие</Heading>
                
                <FormControl>
                  <FormLabel>Тип действия</FormLabel>
                  <Select 
                    value={editingRule.action.type}
                    onChange={(e) => handleEditAction('type', e.target.value)}
                  >
                    <option value="increase">Увеличить цену</option>
                    <option value="decrease">Уменьшить цену</option>
                    <option value="set">Установить цену</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Значение</FormLabel>
                  <NumberInput 
                    value={editingRule.action.value} 
                    min={0} 
                    max={editingRule.action.isPercentage ? 100 : 1000000}
                    onChange={(value) => handleEditAction('value', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is-percentage" mb="0">
                    Значение в процентах
                  </FormLabel>
                  <Spacer />
                  <Switch 
                    id="is-percentage" 
                    isChecked={editingRule.action.isPercentage}
                    onChange={(e) => handleEditAction('isPercentage', e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>
              </VStack>
            </CardBody>
            <CardFooter>
              <HStack spacing={4}>
                <Button 
                  leftIcon={<FaSave />} 
                  colorScheme="blue"
                  onClick={handleUpdateRule}
                >
                  Сохранить правило
                </Button>
                <Button 
                  leftIcon={<FaTimes />} 
                  variant="outline"
                  onClick={handleCancelEditRule}
                >
                  Отмена
                </Button>
              </HStack>
            </CardFooter>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default LogisticsSettingsComponent;
