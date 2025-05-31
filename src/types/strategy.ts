// Типы стратегий ценообразования
export enum StrategyType {
  COMPETITOR_BASED = 'competitor_based',
  MARGIN_BASED = 'margin_based',
  MARKET_POSITION = 'market_position',
  TIME_BASED = 'time_based',
  STOCK_BASED = 'stock_based',
  CUSTOM = 'custom'
}

// Типы правил для стратегий
export enum RuleType {
  LOWER_THAN_COMPETITOR = 'lower_than_competitor',
  HIGHER_THAN_COMPETITOR = 'higher_than_competitor',
  MATCH_COMPETITOR = 'match_competitor',
  MINIMUM_MARGIN = 'minimum_margin',
  TARGET_MARGIN = 'target_margin',
  POSITION_IN_RANGE = 'position_in_range',
  TIME_SCHEDULE = 'time_schedule',
  STOCK_LEVEL = 'stock_level',
  CUSTOM_FORMULA = 'custom_formula'
}

// Статус стратегии
export enum StrategyStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DRAFT = 'draft'
}

// Интерфейс для правила стратегии
export interface StrategyRule {
  id: string;
  type: RuleType;
  parameters: Record<string, any>;
  description: string;
  priority: number;
}

// Интерфейс для конкурента
export interface Competitor {
  id: string;
  name: string;
  url?: string;
  notes?: string;
}

// Интерфейс для товара конкурента
export interface CompetitorProduct {
  id: string;
  competitorId: string;
  competitorName: string;
  productTitle: string;
  price: number;
  url: string;
  lastUpdated: Date;
  imageUrl?: string;
}

// Интерфейс для стратегии ценообразования
export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  status: StrategyStatus;
  rules: StrategyRule[];
  appliedToProducts: string[]; // ID товаров, к которым применена стратегия
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runFrequency?: string; // Частота запуска (например, "daily", "hourly")
  isTemplate?: boolean; // Является ли шаблоном
}

// Интерфейс для шаблона стратегии
export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  defaultRules: Partial<StrategyRule>[];
  configurationFields: ConfigurationField[];

}

// Интерфейс для поля конфигурации шаблона
export interface ConfigurationField {
  id: string;
  name: string;
  type: 'number' | 'text' | 'select' | 'competitor' | 'date' | 'boolean';
  label: string;
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[]; // Для типа 'select'
  min?: number; // Для типа 'number'
  max?: number; // Для типа 'number'
  step?: number; // Для типа 'number'
  required: boolean;
  helpText?: string;
}

// Предопределенные шаблоны стратегий
export const strategyTemplates: StrategyTemplate[] = [
  {
    id: 'competitor_lower_price',
    name: 'Ниже конкурента',
    description: 'Установить цену ниже выбранного конкурента на указанный процент',
    type: StrategyType.COMPETITOR_BASED,
    defaultRules: [
      {
        type: RuleType.LOWER_THAN_COMPETITOR,
        parameters: {
          competitorId: '',
          percentageLower: 5
        },
        priority: 1
      }
    ],
    configurationFields: [
      {
        id: 'competitor',
        name: 'competitorId',
        type: 'competitor',
        label: 'Выберите конкурента',
        placeholder: 'Выберите конкурента для сравнения',
        required: true,
        helpText: 'Конкурент, относительно которого будет установлена цена'
      },
      {
        id: 'percentage',
        name: 'percentageLower',
        type: 'number',
        label: 'Процент снижения',
        placeholder: '5',
        defaultValue: 5,
        min: 0.1,
        max: 50,
        step: 0.1,
        required: true,
        helpText: 'На сколько процентов ваша цена будет ниже цены конкурента'
      }
    ]
  },
  {
    id: 'competitor_higher_price',
    name: 'Выше конкурента',
    description: 'Установить цену выше выбранного конкурента на указанный процент',
    type: StrategyType.COMPETITOR_BASED,
    defaultRules: [
      {
        type: RuleType.HIGHER_THAN_COMPETITOR,
        parameters: {
          competitorId: '',
          percentageHigher: 5
        },
        priority: 1
      }
    ],
    configurationFields: [
      {
        id: 'competitor',
        name: 'competitorId',
        type: 'competitor',
        label: 'Выберите конкурента',
        placeholder: 'Выберите конкурента для сравнения',
        required: true,
        helpText: 'Конкурент, относительно которого будет установлена цена'
      },
      {
        id: 'percentage',
        name: 'percentageHigher',
        type: 'number',
        label: 'Процент повышения',
        placeholder: '5',
        defaultValue: 5,
        min: 0.1,
        max: 50,
        step: 0.1,
        required: true,
        helpText: 'На сколько процентов ваша цена будет выше цены конкурента'
      }
    ]
  },
  {
    id: 'competitor_match_price',
    name: 'Соответствие цене конкурента',
    description: 'Установить точно такую же цену, как у выбранного конкурента',
    type: StrategyType.COMPETITOR_BASED,
    defaultRules: [
      {
        type: RuleType.MATCH_COMPETITOR,
        parameters: {
          competitorId: ''
        },
        priority: 1
      }
    ],
    configurationFields: [
      {
        id: 'competitor',
        name: 'competitorId',
        type: 'competitor',
        label: 'Выберите конкурента',
        placeholder: 'Выберите конкурента для сравнения',
        required: true,
        helpText: 'Конкурент, цену которого вы хотите соответствовать'
      }
    ]
  },
  {
    id: 'minimum_margin',
    name: 'Минимальная маржа',
    description: 'Установить цену, обеспечивающую минимальную маржу',
    type: StrategyType.MARGIN_BASED,
    defaultRules: [
      {
        type: RuleType.MINIMUM_MARGIN,
        parameters: {
          marginPercentage: 20
        },
        priority: 1
      }
    ],
    configurationFields: [
      {
        id: 'margin',
        name: 'marginPercentage',
        type: 'number',
        label: 'Минимальная маржа (%)',
        placeholder: '20',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
        required: true,
        helpText: 'Минимальный процент маржи, который должен быть обеспечен'
      }
    ]
  },
  {
    id: 'market_position',
    name: 'Позиция на рынке',
    description: 'Установить цену в определенной позиции относительно рыночного диапазона',
    type: StrategyType.MARKET_POSITION,
    defaultRules: [
      {
        type: RuleType.POSITION_IN_RANGE,
        parameters: {
          positionPercentage: 50
        },
        priority: 1
      }
    ],
    configurationFields: [
      {
        id: 'position',
        name: 'positionPercentage',
        type: 'number',
        label: 'Позиция в диапазоне (%)',
        placeholder: '50',
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        required: true,
        helpText: '0% - самая низкая цена на рынке, 100% - самая высокая цена на рынке'
      }
    ]
  },
  {
    id: 'custom_strategy',
    name: 'Своя стратегия',
    description: 'Создайте полностью настраиваемую стратегию ценообразования с вашими правилами',
    type: StrategyType.CUSTOM,
    defaultRules: [
      {
        type: RuleType.CUSTOM_FORMULA,
        parameters: {
          formula: '',
          description: ''
        },
        priority: 1
      }
    ],
    configurationFields: [
      {
        id: 'formula',
        name: 'formula',
        type: 'text',
        label: 'Формула расчета цены',
        placeholder: 'Например: cost_price * 1.3 или competitor_price * 0.95',
        required: true,
        helpText: 'Введите формулу для расчета цены. Доступные переменные: cost_price, competitor_price, market_min, market_max, stock_level'
      },
      {
        id: 'description',
        name: 'description',
        type: 'text',
        label: 'Описание стратегии',
        placeholder: 'Опишите логику работы вашей стратегии',
        required: false,
        helpText: 'Это описание поможет вам и другим пользователям понять, как работает стратегия'
      }
    ]
  }
];
