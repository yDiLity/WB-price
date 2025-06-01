import { createContext, useContext, useState, ReactNode } from 'react';
import {
  Product,
  ProductFilters,
  PricingStrategy,
  PricingStrategyType,
  ProductType,
  AIModule,
  PriceChange,
  DemandForecast,
  SuspiciousActivityAlert,
  SuspiciousActivityType
} from '../types';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  pricingStrategies: PricingStrategy[];
  suspiciousActivities: SuspiciousActivityAlert[];
  setFilters: (filters: ProductFilters) => void;
  fetchProducts: () => Promise<void>;
  updateProductPrice: (productId: string, newPrice: number, reason: string) => Promise<boolean>;
  applyPricingStrategy: (productId: string, strategyId: string) => Promise<boolean>;
  createPricingStrategy: (strategy: Omit<PricingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  toggleAIModule: (productId: string, module: AIModule, enabled: boolean) => Promise<boolean>;
  getDemandForecast: (productId: string, price: number) => Promise<DemandForecast | null>;
  resolveSuspiciousActivity: (alertId: string) => Promise<boolean>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Генерация тестовых данных для демонстрации
const generateMockProducts = (): Product[] => {
  const products: Product[] = [];

  const categories = [
    'Электроника',
    'Бытовая техника',
    'Одежда и обувь',
    'Детские товары',
    'Красота и здоровье',
    'Продукты питания',
    'Дом и сад',
    'Спорт и отдых',
    'Книги',
    'Товары для животных'
  ];

  const brands = [
    // Электроника и техника
    'Apple', 'Samsung', 'Xiaomi', 'LG', 'Sony', 'Asus',
    // Одежда и обувь
    'Adidas', 'Nike', 'Puma', 'Zara', 'H&M',
    // Детские товары
    'Lego', 'Hasbro', 'Mattel', 'Pampers',
    // Красота и здоровье
    'L\'Oreal', 'Nivea', 'Garnier', 'Dove',
    // Продукты питания
    'Nestle', 'Mars', 'Danone', 'Coca-Cola',
    // Дом и сад
    'IKEA', 'Bosch', 'Philips',
    // Спорт и отдых
    'Wilson', 'Demix', 'Decathlon',
    // Книги
    'Эксмо', 'АСТ', 'Азбука',
    // Товары для животных
    'Royal Canin', 'Purina', 'Whiskas'
  ];

  for (let i = 0; i < 50; i++) {
    const categoryIndex = i % categories.length;
    const brandIndex = i % brands.length;

    const basePrice = 5000 + Math.floor(Math.random() * 15000);
    const costPrice = basePrice * 0.7;

    const productTypes = [ProductType.HIT, ProductType.OUTDATED, ProductType.PREMIUM, ProductType.STANDARD];
    const productType = productTypes[i % productTypes.length];

    // Генерация истории цен
    const priceHistory: PriceChange[] = [];
    for (let j = 0; j < 5; j++) {
      const date = new Date();
      date.setDate(date.getDate() - j * 5);

      const oldPrice = basePrice * (1 + (Math.random() * 0.2 - 0.1));
      const newPrice = basePrice * (1 + (Math.random() * 0.2 - 0.1));

      priceHistory.push({
        id: `price-${i}-${j}`,
        oldPrice,
        newPrice,
        date: date.toISOString(),
        reason: 'Плановое изменение цены',
        appliedStrategy: j % 2 === 0 ? PricingStrategyType.AGGRESSIVE : PricingStrategyType.PREMIUM,
        isAutomatic: j % 2 === 0
      });
    }

    // Генерация товаров конкурентов
    const competitorProducts = [];
    for (let k = 0; k < 3; k++) {
      const competitorNames = ['TechZone', 'GadgetPro', 'ElectroMart', 'DigiStore', 'TechGiant'];
      const competitorName = competitorNames[k % competitorNames.length];

      const competitorPrice = basePrice * (1 + (Math.random() * 0.3 - 0.15));

      // История цен конкурента
      const competitorPriceHistory: PriceChange[] = [];
      for (let m = 0; m < 3; m++) {
        const date = new Date();
        date.setDate(date.getDate() - m * 7);

        const oldPrice = competitorPrice * (1 + (Math.random() * 0.1 - 0.05));
        const newPrice = competitorPrice * (1 + (Math.random() * 0.1 - 0.05));

        competitorPriceHistory.push({
          id: `comp-price-${i}-${k}-${m}`,
          oldPrice,
          newPrice,
          date: date.toISOString(),
          reason: 'Изменение цены конкурентом',
          isAutomatic: false
        });
      }

      competitorProducts.push({
        id: `competitor-${i}-${k}`,
        competitorName,
        productName: `${brands[brandIndex]} ${categories[categoryIndex]} ${i}`,
        currentPrice: competitorPrice,
        priceHistory: competitorPriceHistory,
        rating: 3 + Math.random() * 2,
        reviewCount: Math.floor(Math.random() * 100),
        isSuspicious: k === 0 && i % 5 === 0 // Некоторые конкуренты помечены как подозрительные
      });
    }

    // Включенные модули ИИ
    const aiModules = [];
    if (i % 2 === 0) aiModules.push(AIModule.DEMAND_FORECAST);
    if (i % 3 === 0) aiModules.push(AIModule.REVIEW_ANALYSIS);
    if (i % 4 === 0) aiModules.push(AIModule.ANOMALY_DETECTION);

    // Генерируем реалистичное название товара в зависимости от категории
    let productName = '';
    const category = categories[categoryIndex];
    const brand = brands[brandIndex];

    switch (category) {
      case 'Электроника':
        const electronicItems = ['Смартфон', 'Планшет', 'Ноутбук', 'Наушники', 'Умные часы', 'Телевизор'];
        const electronicModel = ['Pro', 'Max', 'Ultra', 'Lite', 'Plus', 'S', 'X', 'Z'];
        productName = `${brand} ${electronicItems[i % electronicItems.length]} ${electronicModel[i % electronicModel.length]} ${Math.floor(Math.random() * 20 + 1)}`;
        break;
      case 'Бытовая техника':
        const applianceItems = ['Холодильник', 'Стиральная машина', 'Микроволновая печь', 'Пылесос', 'Кофемашина', 'Блендер'];
        const applianceModel = ['Home', 'Premium', 'Smart', 'Eco', 'Classic'];
        productName = `${brand} ${applianceItems[i % applianceItems.length]} ${applianceModel[i % applianceModel.length]} ${Math.floor(Math.random() * 1000 + 1)}`;
        break;
      case 'Одежда и обувь':
        const clothingItems = ['Футболка', 'Джинсы', 'Куртка', 'Платье', 'Кроссовки', 'Рубашка'];
        const clothingModel = ['Sport', 'Casual', 'Classic', 'Urban', 'Comfort'];
        productName = `${brand} ${clothingItems[i % clothingItems.length]} ${clothingModel[i % clothingModel.length]}`;
        break;
      case 'Детские товары':
        const kidsItems = ['Конструктор', 'Кукла', 'Машинка', 'Настольная игра', 'Мягкая игрушка', 'Подгузники'];
        productName = `${brand} ${kidsItems[i % kidsItems.length]} "${['Приключения', 'Веселье', 'Дружба', 'Сказка', 'Чудеса'][i % 5]}"`;
        break;
      case 'Красота и здоровье':
        const beautyItems = ['Шампунь', 'Крем для лица', 'Тушь для ресниц', 'Помада', 'Гель для душа', 'Зубная паста'];
        productName = `${brand} ${beautyItems[i % beautyItems.length]} "${['Сияние', 'Свежесть', 'Молодость', 'Энергия', 'Защита'][i % 5]}"`;
        break;
      case 'Продукты питания':
        const foodItems = ['Шоколад', 'Кофе', 'Чай', 'Печенье', 'Йогурт', 'Сок'];
        productName = `${brand} ${foodItems[i % foodItems.length]} "${['Наслаждение', 'Традиция', 'Вкус', 'Польза', 'Радость'][i % 5]}"`;
        break;
      case 'Дом и сад':
        const homeItems = ['Стол', 'Стул', 'Диван', 'Шкаф', 'Лампа', 'Кастрюля'];
        productName = `${brand} ${homeItems[i % homeItems.length]} "${['Комфорт', 'Уют', 'Стиль', 'Модерн', 'Классика'][i % 5]}"`;
        break;
      case 'Спорт и отдых':
        const sportItems = ['Мяч', 'Ракетка', 'Велосипед', 'Гантели', 'Коврик для йоги', 'Палатка'];
        productName = `${brand} ${sportItems[i % sportItems.length]} "${['Победа', 'Сила', 'Скорость', 'Выносливость', 'Активность'][i % 5]}"`;
        break;
      case 'Книги':
        const bookGenres = ['Роман', 'Детектив', 'Фантастика', 'Учебник', 'Сказки', 'Поэзия'];
        productName = `${brand} ${bookGenres[i % bookGenres.length]} "${['Тайна', 'Приключение', 'Любовь', 'Знание', 'Мечта'][i % 5]}"`;
        break;
      case 'Товары для животных':
        const petItems = ['Корм', 'Игрушка', 'Лежанка', 'Шампунь', 'Миска', 'Ошейник'];
        const petTypes = ['для кошек', 'для собак', 'для грызунов', 'для птиц', 'для рыб'];
        productName = `${brand} ${petItems[i % petItems.length]} ${petTypes[i % petTypes.length]} "${['Забота', 'Здоровье', 'Радость', 'Комфорт', 'Игра'][i % 5]}"`;
        break;
      default:
        productName = `${brand} Товар ${i}`;
    }

    products.push({
      id: `product-${i}`,
      ozonId: `ozon-${10000 + i}`,
      name: productName,
      sku: `SKU-${100000 + i}`,
      currentPrice: basePrice,
      costPrice,
      recommendedPrice: i % 3 === 0 ? basePrice * 1.05 : undefined,
      category: categories[categoryIndex],
      brand: brands[brandIndex],
      productType,
      stock: Math.floor(Math.random() * 50),
      nextDeliveryDate: i % 2 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      aiModulesEnabled: aiModules,
      competitorProducts,
      priceHistory
    });
  }

  return products;
};

// Генерация тестовых стратегий ценообразования
const generateMockStrategies = (): PricingStrategy[] => {
  return [
    {
      id: 'strategy-1',
      name: 'Агрессивная',
      type: PricingStrategyType.AGGRESSIVE,
      rules: [
        {
          id: 'rule-1-1',
          condition: 'competitor_price < cost_price * 0.9',
          action: 'set_price(min_price)',
          priority: 1
        },
        {
          id: 'rule-1-2',
          condition: 'competitor_price > cost_price * 0.9',
          action: 'set_price(competitor_price * 0.95)',
          priority: 2
        }
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'strategy-2',
      name: 'Премиум',
      type: PricingStrategyType.PREMIUM,
      rules: [
        {
          id: 'rule-2-1',
          condition: 'rating > 4.5',
          action: 'set_price(competitor_price * 1.1)',
          priority: 1
        },
        {
          id: 'rule-2-2',
          condition: 'rating <= 4.5',
          action: 'set_price(competitor_price * 1.05)',
          priority: 2
        }
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'strategy-3',
      name: 'Очистка склада',
      type: PricingStrategyType.STOCK_CLEARANCE,
      rules: [
        {
          id: 'rule-3-1',
          condition: 'stock > 20',
          action: 'set_price(competitor_price * 0.9)',
          priority: 1
        },
        {
          id: 'rule-3-2',
          condition: 'stock <= 20',
          action: 'set_price(competitor_price * 0.8)',
          priority: 2
        }
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// Генерация тестовых алертов о подозрительной активности
const generateMockAlerts = (): SuspiciousActivityAlert[] => {
  return [
    {
      id: 'alert-1',
      type: SuspiciousActivityType.FAKE_REVIEWS,
      competitorName: 'GadgetPro',
      productId: 'product-0',
      description: '23 идентичных отзыва за 2 часа',
      date: new Date().toISOString(),
      isResolved: false,
      recommendedAction: 'Подать жалобу через Ozon API'
    },
    {
      id: 'alert-2',
      type: SuspiciousActivityType.DUMPING,
      competitorName: 'TechZone',
      productId: 'product-5',
      description: 'Цена на AirPods 4990 ₽ (рыночная 12990 ₽)',
      date: new Date().toISOString(),
      isResolved: false,
      recommendedAction: 'Подать жалобу через Ozon API'
    },
    {
      id: 'alert-3',
      type: SuspiciousActivityType.FAKE_SHOP,
      competitorName: 'ElectroMart',
      productId: 'product-10',
      description: 'Подозрительный магазин с нереалистично низкими ценами',
      date: new Date().toISOString(),
      isResolved: true,
      recommendedAction: 'Подать жалобу через Ozon API'
    }
  ];
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [pricingStrategies, setPricingStrategies] = useState<PricingStrategy[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivityAlert[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Загружаем реальные данные продавца yDiLity ООО
      const { realSellerProducts } = await import('../services/realProductData');
      const realStrategies = generateMockStrategies(); // Пока оставим стратегии
      const realAlerts = generateMockAlerts(); // Пока оставим алерты

      setProducts(realSellerProducts);
      setFilteredProducts(realSellerProducts);
      setPricingStrategies(realStrategies);
      setSuspiciousActivities(realAlerts);
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Остальные методы будут реализованы здесь
  const updateProductPrice = async (productId: string, newPrice: number, reason: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));

      // В реальном приложении здесь будет запрос к API
      setProducts(prevProducts =>
        prevProducts.map(product => {
          if (product.id === productId) {
            const priceChange: PriceChange = {
              id: `price-${Date.now()}`,
              oldPrice: product.currentPrice,
              newPrice,
              date: new Date().toISOString(),
              reason,
              isAutomatic: false
            };

            return {
              ...product,
              currentPrice: newPrice,
              priceHistory: [priceChange, ...product.priceHistory]
            };
          }
          return product;
        })
      );

      // Обновляем отфильтрованные товары
      setFilteredProducts(prevProducts =>
        prevProducts.map(product => {
          if (product.id === productId) {
            const priceChange: PriceChange = {
              id: `price-${Date.now()}`,
              oldPrice: product.currentPrice,
              newPrice,
              date: new Date().toISOString(),
              reason,
              isAutomatic: false
            };

            return {
              ...product,
              currentPrice: newPrice,
              priceHistory: [priceChange, ...product.priceHistory]
            };
          }
          return product;
        })
      );

      return true;
    } catch (error) {
      console.error('Ошибка при обновлении цены:', error);
      setError('Не удалось обновить цену. Пожалуйста, попробуйте позже.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const applyPricingStrategy = async (productId: string, strategyId: string): Promise<boolean> => {
    // Реализация будет добавлена позже
    return true;
  };

  const createPricingStrategy = async (strategy: Omit<PricingStrategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    // Реализация будет добавлена позже
    return true;
  };

  const toggleAIModule = async (productId: string, module: AIModule, enabled: boolean): Promise<boolean> => {
    // Реализация будет добавлена позже
    return true;
  };

  const getDemandForecast = async (productId: string, price: number): Promise<DemandForecast | null> => {
    // Реализация будет добавлена позже
    return null;
  };

  const resolveSuspiciousActivity = async (alertId: string): Promise<boolean> => {
    // Реализация будет добавлена позже
    return true;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        isLoading,
        error,
        filters,
        pricingStrategies,
        suspiciousActivities,
        setFilters,
        fetchProducts,
        updateProductPrice,
        applyPricingStrategy,
        createPricingStrategy,
        toggleAIModule,
        getDemandForecast,
        resolveSuspiciousActivity
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
