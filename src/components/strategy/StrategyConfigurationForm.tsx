import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Switch,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  StrategyTemplate,
  ConfigurationField,
  StrategyRule,
  PricingStrategy,
  StrategyStatus,
  Competitor,
  StrategyType
} from '../../types/strategy';
import FormulaBuilder from './FormulaBuilder';
import VisualStrategyBuilder from './VisualStrategyBuilder';

interface StrategyConfigurationFormProps {
  template: StrategyTemplate;
  competitors: Competitor[];
  onSaveStrategy: (strategy: PricingStrategy) => void;
  onCancel: () => void;
}

export default function StrategyConfigurationForm({
  template,
  competitors,
  onSaveStrategy,
  onCancel
}: StrategyConfigurationFormProps) {
  // Состояние для хранения значений полей
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [strategyName, setStrategyName] = useState(`${template.name}`);
  const [strategyDescription, setStrategyDescription] = useState(template.description);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Инициализация значений по умолчанию
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    template.configurationFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialValues[field.name] = field.defaultValue;
      }
    });
    setFormValues(initialValues);
  }, [template]);

  // Обработчик изменения полей формы
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Очищаем ошибку при изменении поля
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Проверка имени стратегии
    if (!strategyName.trim()) {
      newErrors.name = 'Название стратегии обязательно';
    }

    // Проверка обязательных полей
    template.configurationFields.forEach(field => {
      if (field.required && (formValues[field.name] === undefined || formValues[field.name] === '')) {
        newErrors[field.name] = 'Это поле обязательно';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Создание правил стратегии на основе шаблона и значений формы
  const createStrategyRules = (): StrategyRule[] => {
    return template.defaultRules.map((ruleTemplate, index) => {
      const parameters: Record<string, any> = {};

      // Копируем параметры из шаблона
      if (ruleTemplate.parameters) {
        Object.keys(ruleTemplate.parameters).forEach(paramKey => {
          parameters[paramKey] = ruleTemplate.parameters![paramKey];
        });
      }

      // Заменяем значения из формы
      template.configurationFields.forEach(field => {
        if (formValues[field.name] !== undefined) {
          parameters[field.name] = formValues[field.name];
        }
      });

      return {
        id: `rule-${Date.now()}-${index}`,
        type: ruleTemplate.type!,
        parameters,
        description: generateRuleDescription(ruleTemplate.type!, parameters),
        priority: ruleTemplate.priority || index + 1
      };
    });
  };

  // Генерация описания правила на основе типа и параметров
  const generateRuleDescription = (ruleType: string, parameters: Record<string, any>): string => {
    switch (ruleType) {
      case 'lower_than_competitor': {
        const competitor = competitors.find(c => c.id === parameters.competitorId);
        return `Цена ниже, чем у ${competitor?.name || 'конкурента'} на ${parameters.percentageLower}%`;
      }
      case 'higher_than_competitor': {
        const competitor = competitors.find(c => c.id === parameters.competitorId);
        return `Цена выше, чем у ${competitor?.name || 'конкурента'} на ${parameters.percentageHigher}%`;
      }
      case 'match_competitor': {
        const competitor = competitors.find(c => c.id === parameters.competitorId);
        return `Цена соответствует цене ${competitor?.name || 'конкурента'}`;
      }
      case 'minimum_margin':
        return `Минимальная маржа ${parameters.marginPercentage}%`;
      case 'position_in_range':
        return `Позиция в рыночном диапазоне: ${parameters.positionPercentage}%`;
      case 'custom_formula':
        if (parameters.description && parameters.description.trim()) {
          return parameters.description;
        }
        return `Пользовательская формула: ${parameters.formula || 'Не задана'}`;
      default:
        return 'Пользовательское правило';
    }
  };

  // Обработчик сохранения стратегии
  const handleSaveStrategy = () => {
    if (!validateForm()) {
      return;
    }

    const rules = createStrategyRules();

    const newStrategy: PricingStrategy = {
      id: `strategy-${Date.now()}`,
      name: strategyName,
      description: strategyDescription,
      type: template.type,
      status: StrategyStatus.DRAFT,
      rules,
      appliedToProducts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSaveStrategy(newStrategy);
  };

  // Рендеринг поля формы в зависимости от его типа
  const renderField = (field: ConfigurationField) => {
    // Если это поле формулы и стратегия пользовательская, используем визуальный конструктор стратегий
    if (field.type === 'text' && field.name === 'formula' && template.type === StrategyType.CUSTOM) {
      return (
        <VisualStrategyBuilder
          competitors={competitors}
          initialFormula={formValues[field.name] || field.defaultValue || ''}
          initialDescription={formValues['description'] || ''}
          onChange={(formula, description) => {
            handleFieldChange(field.name, formula);
            if (description) {
              handleFieldChange('description', description);
            }
          }}
        />
      );
    }

    switch (field.type) {
      case 'number':
        return (
          <NumberInput
            value={formValues[field.name] || field.defaultValue || ''}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            onChange={(valueString) => handleFieldChange(field.name, parseFloat(valueString))}
            isInvalid={!!errors[field.name]}
          >
            <NumberInputField placeholder={field.placeholder} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );

      case 'text':
        // Скрываем поле описания, если оно будет заполнено автоматически из визуального конструктора
        if (field.name === 'description' && template.type === StrategyType.CUSTOM) {
          return null;
        }

        return (
          <Input
            value={formValues[field.name] || field.defaultValue || ''}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            isInvalid={!!errors[field.name]}
          />
        );

      case 'select':
        return (
          <Select
            value={formValues[field.name] || field.defaultValue || ''}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            isInvalid={!!errors[field.name]}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'competitor':
        return (
          <Select
            value={formValues[field.name] || field.defaultValue || ''}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            isInvalid={!!errors[field.name]}
          >
            {competitors.map(competitor => (
              <option key={competitor.id} value={competitor.id}>
                {competitor.name}
              </option>
            ))}
          </Select>
        );

      case 'boolean':
        return (
          <Switch
            isChecked={formValues[field.name] || field.defaultValue || false}
            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
          />
        );

      default:
        return <Input placeholder="Неподдерживаемый тип поля" isReadOnly />;
    }
  };

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      boxShadow="sm"
    >
      <Heading size="md" mb={4}>Настройка стратегии</Heading>

      <VStack spacing={6} align="stretch">
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Название стратегии</FormLabel>
          <Input
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="Введите название стратегии"
          />
          {errors.name && <FormHelperText color="red.500">{errors.name}</FormHelperText>}
        </FormControl>

        <FormControl>
          <FormLabel>Описание</FormLabel>
          <Input
            value={strategyDescription}
            onChange={(e) => setStrategyDescription(e.target.value)}
            placeholder="Введите описание стратегии"
          />
        </FormControl>

        <Divider />

        <Heading size="sm" mb={2}>Параметры стратегии</Heading>

        {template.configurationFields.map((field) => (
          <FormControl key={field.id} isRequired={field.required} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label}</FormLabel>
            {renderField(field)}
            {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
            {errors[field.name] && <FormHelperText color="red.500">{errors[field.name]}</FormHelperText>}
          </FormControl>
        ))}

        <Divider />

        <Box>
          <Heading size="sm" mb={3}>Предпросмотр правил</Heading>

          {Object.keys(formValues).length > 0 ? (
            <VStack spacing={2} align="stretch">
              {createStrategyRules().map((rule, index) => (
                <Flex
                  key={index}
                  p={3}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text>{rule.description}</Text>
                  <Badge colorScheme="blue">Приоритет: {rule.priority}</Badge>
                </Flex>
              ))}
            </VStack>
          ) : (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                Заполните параметры стратегии для предпросмотра правил
              </AlertDescription>
            </Alert>
          )}
        </Box>

        <HStack spacing={4} justify="flex-end" pt={4}>
          <Button variant="outline" onClick={onCancel}>Отмена</Button>
          <Button colorScheme="blue" onClick={handleSaveStrategy}>Сохранить стратегию</Button>
        </HStack>
      </VStack>
    </Box>
  );
}
