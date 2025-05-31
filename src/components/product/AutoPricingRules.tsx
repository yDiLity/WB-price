import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Badge,
  Tooltip,
  IconButton,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Heading,
  Collapse,
  Icon
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon, CheckIcon, WarningIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaClock, FaRobot, FaPercentage, FaRubleSign } from 'react-icons/fa';
import { Product } from '../../types';
import HelpTooltip from '../common/HelpTooltip';

interface AutoPricingRule {
  id: string;
  name: string;
  isActive: boolean;
  condition: {
    type: 'below_competitor' | 'above_competitor' | 'price_change' | 'time_based';
    value: number;
    unit?: 'percent' | 'absolute';
    timeInterval?: number; // в часах
  };
  action: {
    type: 'adjust_price' | 'set_price' | 'notify';
    value: number;
    unit: 'percent' | 'absolute';
    minPrice?: number;
    maxPrice?: number;
  };
}

interface AutoPricingRulesProps {
  product: Product;
  onSaveRules: (rules: AutoPricingRule[]) => void;
}

/**
 * Компонент для настройки правил автоматического изменения цен
 */
const AutoPricingRules: React.FC<AutoPricingRulesProps> = ({
  product,
  onSaveRules
}) => {
  // Состояние для правил
  const [rules, setRules] = useState<AutoPricingRule[]>([]);
  const [isAutoPricingEnabled, setIsAutoPricingEnabled] = useState<boolean>(false);
  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // Состояние для нового правила
  const [newRule, setNewRule] = useState<Omit<AutoPricingRule, 'id'>>({
    name: '',
    isActive: true,
    condition: {
      type: 'below_competitor',
      value: 5,
      unit: 'percent'
    },
    action: {
      type: 'adjust_price',
      value: 3,
      unit: 'percent',
      minPrice: product.price.minThreshold || product.price.current * 0.8,
      maxPrice: product.price.current * 1.2
    }
  });

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Toast для уведомлений
  const toast = useToast();

  // Загрузка правил из продукта при монтировании компонента
  useEffect(() => {
    if (product.autoPricingRules) {
      setRules(product.autoPricingRules);
      setIsAutoPricingEnabled(product.autoPricingEnabled || false);
    }
  }, [product]);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Обработчик добавления нового правила
  const handleAddRule = () => {
    if (!newRule.name) {
      toast({
        title: 'Ошибка',
        description: 'Введите название правила',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newRuleWithId: AutoPricingRule = {
      ...newRule,
      id: `rule-${Date.now()}`
    };

    setRules([...rules, newRuleWithId]);
    setIsAddingRule(false);

    // Сбрасываем форму нового правила
    setNewRule({
      name: '',
      isActive: true,
      condition: {
        type: 'below_competitor',
        value: 5,
        unit: 'percent'
      },
      action: {
        type: 'adjust_price',
        value: 3,
        unit: 'percent',
        minPrice: product.price.minThreshold || product.price.current * 0.8,
        maxPrice: product.price.current * 1.2
      }
    });

    toast({
      title: 'Правило добавлено',
      description: 'Новое правило автоматического изменения цены добавлено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик удаления правила
  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));

    toast({
      title: 'Правило удалено',
      description: 'Правило автоматического изменения цены удалено',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик изменения активности правила
  const handleToggleRuleActive = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  // Обработчик сохранения правил
  const handleSaveRules = () => {
    onSaveRules(rules);

    toast({
      title: 'Правила сохранены',
      description: 'Правила автоматического изменения цены сохранены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Получение описания правила
  const getRuleDescription = (rule: AutoPricingRule) => {
    let conditionText = '';
    let actionText = '';

    // Описание условия
    switch (rule.condition.type) {
      case 'below_competitor':
        conditionText = `Если цена конкурента ниже на ${rule.condition.value}${rule.condition.unit === 'percent' ? '%' : ' руб.'}`;
        break;
      case 'above_competitor':
        conditionText = `Если цена конкурента выше на ${rule.condition.value}${rule.condition.unit === 'percent' ? '%' : ' руб.'}`;
        break;
      case 'price_change':
        conditionText = `Если цена конкурента изменилась на ${rule.condition.value}${rule.condition.unit === 'percent' ? '%' : ' руб.'}`;
        break;
      case 'time_based':
        conditionText = `Каждые ${rule.condition.timeInterval} часов`;
        break;
    }

    // Описание действия
    switch (rule.action.type) {
      case 'adjust_price':
        actionText = `изменить цену на ${rule.action.value}${rule.action.unit === 'percent' ? '%' : ' руб.'}`;
        break;
      case 'set_price':
        actionText = `установить цену ${rule.action.value}${rule.action.unit === 'percent' ? '% от цены конкурента' : ' руб.'}`;
        break;
      case 'notify':
        actionText = 'отправить уведомление';
        break;
    }

    return `${conditionText}, ${actionText}`;
  };

  // Получение иконки для типа условия
  const getConditionIcon = (type: string) => {
    switch (type) {
      case 'below_competitor':
        return <Icon as={FaPercentage} color="red.500" />;
      case 'above_competitor':
        return <Icon as={FaPercentage} color="green.500" />;
      case 'price_change':
        return <Icon as={FaRubleSign} color="blue.500" />;
      case 'time_based':
        return <Icon as={FaClock} color="purple.500" />;
      default:
        return <InfoIcon color="gray.500" />;
    }
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Heading size="md">Автоматическое изменение цен</Heading>
          <HelpTooltip
            label="Автоматическое изменение цен"
            description="Настройка правил автоматического изменения цен в зависимости от цен конкурентов."
            steps={[
              "Создайте правила для автоматического изменения цен",
              "Настройте условия срабатывания правил",
              "Настройте действия, которые будут выполнены при срабатывании правил",
              "Включите или отключите правила по необходимости"
            ]}
          />
        </HStack>

        <HStack>
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="auto-pricing-switch" mb="0" mr={2}>
              {isAutoPricingEnabled ? 'Включено' : 'Выключено'}
            </FormLabel>
            <Switch
              id="auto-pricing-switch"
              isChecked={isAutoPricingEnabled}
              onChange={() => setIsAutoPricingEnabled(!isAutoPricingEnabled)}
              colorScheme="blue"
            />
            <HelpTooltip
              label="Включение/отключение автоматического изменения цен"
              description="Включите эту опцию, чтобы система автоматически изменяла цены в соответствии с настроенными правилами."
              placement="left"
            />
          </FormControl>
        </HStack>
      </Flex>

      {!isAutoPricingEnabled && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            Включите автоматическое изменение цен, чтобы система могла автоматически реагировать на изменения цен конкурентов
          </AlertDescription>
        </Alert>
      )}

      <VStack spacing={4} align="stretch" mb={4}>
        {rules.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Нет правил</AlertTitle>
            <AlertDescription>
              Добавьте правила автоматического изменения цен, чтобы система могла реагировать на изменения цен конкурентов
            </AlertDescription>
          </Alert>
        ) : (
          rules.map(rule => (
            <Box
              key={rule.id}
              p={3}
              borderWidth="1px"
              borderColor={rule.isActive ? 'blue.500' : borderColor}
              borderRadius="md"
              bg={rule.isActive ? (useColorModeValue('blue.50', 'blue.900')) : bgColor}
            >
              <Flex justify="space-between" align="center">
                <HStack>
                  {getConditionIcon(rule.condition.type)}
                  <Text fontWeight="medium">{rule.name}</Text>
                  {!rule.isActive && (
                    <Badge colorScheme="gray">Неактивно</Badge>
                  )}
                </HStack>

                <HStack>
                  <Switch
                    isChecked={rule.isActive}
                    onChange={() => handleToggleRuleActive(rule.id)}
                    colorScheme="blue"
                    size="sm"
                  />

                  <IconButton
                    icon={expandedRuleId === rule.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    aria-label="Развернуть правило"
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                  />

                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Удалить правило"
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeleteRule(rule.id)}
                  />
                </HStack>
              </Flex>

              <Text fontSize="sm" color={textColor} mt={1}>
                {getRuleDescription(rule)}
              </Text>

              <Collapse in={expandedRuleId === rule.id} animateOpacity>
                <Box mt={3} pt={3} borderTopWidth="1px" borderColor={borderColor}>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Text fontWeight="medium" width="120px">Условие:</Text>
                      <Badge colorScheme={
                        rule.condition.type === 'below_competitor' ? 'red' :
                        rule.condition.type === 'above_competitor' ? 'green' :
                        rule.condition.type === 'price_change' ? 'blue' : 'purple'
                      }>
                        {rule.condition.type === 'below_competitor' ? 'Цена ниже' :
                         rule.condition.type === 'above_competitor' ? 'Цена выше' :
                         rule.condition.type === 'price_change' ? 'Изменение цены' : 'По времени'}
                      </Badge>
                      <Text>{rule.condition.value}{rule.condition.unit === 'percent' ? '%' : ' руб.'}</Text>
                      {rule.condition.type === 'time_based' && (
                        <Text>каждые {rule.condition.timeInterval} ч.</Text>
                      )}
                    </HStack>

                    <HStack>
                      <Text fontWeight="medium" width="120px">Действие:</Text>
                      <Badge colorScheme={
                        rule.action.type === 'adjust_price' ? 'blue' :
                        rule.action.type === 'set_price' ? 'green' : 'yellow'
                      }>
                        {rule.action.type === 'adjust_price' ? 'Изменить цену' :
                         rule.action.type === 'set_price' ? 'Установить цену' : 'Уведомить'}
                      </Badge>
                      <Text>{rule.action.value}{rule.action.unit === 'percent' ? '%' : ' руб.'}</Text>
                    </HStack>

                    {(rule.action.type === 'adjust_price' || rule.action.type === 'set_price') && (
                      <HStack>
                        <Text fontWeight="medium" width="120px">Ограничения:</Text>
                        <Text>Мин: {formatPrice(rule.action.minPrice || 0)}</Text>
                        <Text>Макс: {formatPrice(rule.action.maxPrice || 0)}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </Collapse>
            </Box>
          ))
        )}
      </VStack>

      {isAddingRule ? (
        <Box
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          bg={headerBg}
          mb={4}
        >
          <Heading size="sm" mb={3}>Новое правило</Heading>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Название правила</FormLabel>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Например: Снижение цены при конкуренции"
              />
            </FormControl>

            <Divider />

            <Heading size="xs">Условие</Heading>

            <HStack>
              <FormControl>
                <FormLabel>Тип условия</FormLabel>
                <Select
                  value={newRule.condition.type}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    condition: {
                      ...newRule.condition,
                      type: e.target.value as any
                    }
                  })}
                >
                  <option value="below_competitor">Цена конкурента ниже</option>
                  <option value="above_competitor">Цена конкурента выше</option>
                  <option value="price_change">Изменение цены конкурента</option>
                  <option value="time_based">По времени</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Значение</FormLabel>
                <NumberInput
                  value={newRule.condition.value}
                  onChange={(_, value) => setNewRule({
                    ...newRule,
                    condition: {
                      ...newRule.condition,
                      value
                    }
                  })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {newRule.condition.type !== 'time_based' && (
                <FormControl>
                  <FormLabel>Единица измерения</FormLabel>
                  <Select
                    value={newRule.condition.unit}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      condition: {
                        ...newRule.condition,
                        unit: e.target.value as any
                      }
                    })}
                  >
                    <option value="percent">Процент</option>
                    <option value="absolute">Рубли</option>
                  </Select>
                </FormControl>
              )}

              {newRule.condition.type === 'time_based' && (
                <FormControl>
                  <FormLabel>Интервал (часы)</FormLabel>
                  <NumberInput
                    value={newRule.condition.timeInterval || 24}
                    onChange={(_, value) => setNewRule({
                      ...newRule,
                      condition: {
                        ...newRule.condition,
                        timeInterval: value
                      }
                    })}
                    min={1}
                    max={168} // 1 неделя
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}
            </HStack>

            <Divider />

            <Heading size="xs">Действие</Heading>

            <HStack>
              <FormControl>
                <FormLabel>Тип действия</FormLabel>
                <Select
                  value={newRule.action.type}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    action: {
                      ...newRule.action,
                      type: e.target.value as any
                    }
                  })}
                >
                  <option value="adjust_price">Изменить цену</option>
                  <option value="set_price">Установить цену</option>
                  <option value="notify">Отправить уведомление</option>
                </Select>
              </FormControl>

              {newRule.action.type !== 'notify' && (
                <>
                  <FormControl>
                    <FormLabel>Значение</FormLabel>
                    <NumberInput
                      value={newRule.action.value}
                      onChange={(_, value) => setNewRule({
                        ...newRule,
                        action: {
                          ...newRule.action,
                          value
                        }
                      })}
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
                    <FormLabel>Единица измерения</FormLabel>
                    <Select
                      value={newRule.action.unit}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        action: {
                          ...newRule.action,
                          unit: e.target.value as any
                        }
                      })}
                    >
                      <option value="percent">Процент</option>
                      <option value="absolute">Рубли</option>
                    </Select>
                  </FormControl>
                </>
              )}
            </HStack>

            {(newRule.action.type === 'adjust_price' || newRule.action.type === 'set_price') && (
              <HStack>
                <FormControl>
                  <FormLabel>Минимальная цена</FormLabel>
                  <NumberInput
                    value={newRule.action.minPrice || 0}
                    onChange={(_, value) => setNewRule({
                      ...newRule,
                      action: {
                        ...newRule.action,
                        minPrice: value
                      }
                    })}
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
                  <FormLabel>Максимальная цена</FormLabel>
                  <NumberInput
                    value={newRule.action.maxPrice || 0}
                    onChange={(_, value) => setNewRule({
                      ...newRule,
                      action: {
                        ...newRule.action,
                        maxPrice: value
                      }
                    })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            )}

            <HStack justify="flex-end" spacing={3} pt={2}>
              <Button
                variant="outline"
                onClick={() => setIsAddingRule(false)}
              >
                Отмена
              </Button>

              <Button
                colorScheme="blue"
                onClick={handleAddRule}
                isDisabled={!newRule.name}
              >
                Добавить правило
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <HStack mb={4}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setIsAddingRule(true)}
          >
            Добавить правило
          </Button>
          <HelpTooltip
            label="Добавление правила"
            description="Создание нового правила автоматического изменения цены."
            steps={[
              "Нажмите кнопку 'Добавить правило'",
              "Заполните форму создания правила",
              "Укажите название, условие и действие",
              "Нажмите кнопку 'Добавить правило' в форме"
            ]}
          />
        </HStack>
      )}

      <Flex justify="flex-end">
        <HStack>
          <Button
            colorScheme="green"
            leftIcon={<CheckIcon />}
            onClick={handleSaveRules}
            isDisabled={rules.length === 0}
          >
            Сохранить настройки
          </Button>
          <HelpTooltip
            label="Сохранение правил"
            description="Сохранение настроенных правил автоматического изменения цен."
            steps={[
              "После добавления всех правил нажмите кнопку 'Сохранить настройки'",
              "Правила будут сохранены и начнут применяться при мониторинге цен",
              "Вы можете в любой момент изменить или удалить правила"
            ]}
            placement="left"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default AutoPricingRules;
