import {
  Product,
  ProductCategory,
  ProductStatus,
  CompetitorPrice,
  ProductImage,
  ProductAttribute,
  StockInfo,
  SalesStats,
  ProductSource
} from '../types/product';
import { Competitor } from '../types/strategy';

// Генерация случайного числа в диапазоне
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Генерация случайного элемента из массива
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Генерация случайной даты в диапазоне
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Генерация случайного булева значения с заданной вероятностью
const randomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};

// Генерация случайного SKU
const generateSku = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let sku = '';

  // Генерируем 2 случайные буквы
  for (let i = 0; i < 2; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Добавляем дефис
  sku += '-';

  // Генерируем 6 случайных цифр
  for (let i = 0; i < 6; i++) {
    sku += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return sku;
};

// Генерация случайного штрих-кода
const generateBarcode = (): string => {
  let barcode = '';
  for (let i = 0; i < 13; i++) {
    barcode += Math.floor(Math.random() * 10);
  }
  return barcode;
};

// Список брендов по категориям
const brandsByCategory: Record<ProductCategory, string[]> = {
  [ProductCategory.ELECTRONICS]: ['Apple', 'Samsung', 'Xiaomi', 'Sony', 'LG', 'Huawei', 'Asus', 'Lenovo', 'HP', 'Dell'],
  [ProductCategory.CLOTHING]: ['Adidas', 'Nike', 'Puma', 'Reebok', 'H&M', 'Zara', 'Uniqlo', 'Lacoste', 'Tommy Hilfiger', 'Calvin Klein'],
  [ProductCategory.HOME]: ['IKEA', 'Hoff', 'Leroy Merlin', 'OBI', 'Zara Home', 'H&M Home', 'Villeroy & Boch', 'Bosch', 'Philips', 'Tefal'],
  [ProductCategory.BEAUTY]: ['L\'Oreal', 'Maybelline', 'MAC', 'Estee Lauder', 'Clinique', 'Nivea', 'Garnier', 'Dove', 'Avon', 'Oriflame'],
  [ProductCategory.SPORTS]: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'Columbia', 'The North Face', 'Salomon', 'Wilson', 'Head'],
  [ProductCategory.TOYS]: ['Lego', 'Hasbro', 'Mattel', 'Fisher-Price', 'Playmobil', 'Hot Wheels', 'Barbie', 'Nerf', 'Disney', 'Marvel'],
  [ProductCategory.BOOKS]: ['Эксмо', 'АСТ', 'Росмэн', 'Азбука', 'Махаон', 'Альпина', 'МИФ', 'Питер', 'O\'Reilly', 'Packt'],
  [ProductCategory.FOOD]: ['Nestle', 'Danone', 'PepsiCo', 'Coca-Cola', 'Mars', 'Ferrero', 'Kraft', 'Heinz', 'Unilever', 'Mondelez'],
  [ProductCategory.HEALTH]: ['Johnson & Johnson', 'Pfizer', 'Bayer', 'Novartis', 'Sanofi', 'GlaxoSmithKline', 'Roche', 'Abbott', 'Merck', 'Teva'],
  [ProductCategory.AUTO]: ['Bosch', 'Continental', 'Michelin', 'Bridgestone', 'Castrol', 'Mobil', 'Shell', 'Liqui Moly', 'Mann-Filter', 'NGK'],
  [ProductCategory.PETS]: ['Royal Canin', 'Purina', 'Pedigree', 'Whiskas', 'Hills', 'Acana', 'Brit', 'Beaphar', 'Trixie', 'Ferplast'],
  [ProductCategory.JEWELRY]: ['Pandora', 'Swarovski', 'Tiffany & Co', 'Cartier', 'Bulgari', 'Sokolov', 'Sunlight', 'Адамас', 'Tous', 'Thomas Sabo'],
  [ProductCategory.OFFICE]: ['Комус', 'Erich Krause', 'Pilot', 'Parker', 'Moleskine', 'Leuchtturm1917', 'Canon', 'HP', 'Epson', 'Brother'],
  [ProductCategory.GARDEN]: ['Gardena', 'Bosch', 'Karcher', 'Fiskars', 'AL-KO', 'Husqvarna', 'STIHL', 'Makita', 'Greenworks', 'Wolf-Garten'],
  [ProductCategory.OTHER]: ['Разные бренды']
};

// Список подкатегорий по категориям
const subcategoriesByCategory: Record<ProductCategory, string[]> = {
  [ProductCategory.ELECTRONICS]: ['Смартфоны', 'Ноутбуки', 'Планшеты', 'Телевизоры', 'Наушники', 'Фотоаппараты', 'Умные часы', 'Аудиотехника', 'Игровые приставки', 'Аксессуары'],
  [ProductCategory.CLOTHING]: ['Футболки', 'Джинсы', 'Платья', 'Куртки', 'Обувь', 'Нижнее белье', 'Спортивная одежда', 'Аксессуары', 'Детская одежда', 'Верхняя одежда'],
  [ProductCategory.HOME]: ['Мебель', 'Посуда', 'Текстиль', 'Освещение', 'Декор', 'Хранение', 'Бытовая техника', 'Кухонные принадлежности', 'Ванная комната', 'Уборка'],
  [ProductCategory.BEAUTY]: ['Уход за лицом', 'Уход за волосами', 'Макияж', 'Парфюмерия', 'Уход за телом', 'Маникюр и педикюр', 'Инструменты', 'Наборы', 'Мужская косметика', 'Подарки'],
  [ProductCategory.SPORTS]: ['Фитнес', 'Бег', 'Йога', 'Плавание', 'Велоспорт', 'Туризм', 'Командные виды спорта', 'Зимние виды спорта', 'Единоборства', 'Тренажеры'],
  [ProductCategory.TOYS]: ['Конструкторы', 'Куклы', 'Машинки', 'Настольные игры', 'Развивающие игрушки', 'Мягкие игрушки', 'Игрушки для малышей', 'Радиоуправляемые игрушки', 'Игровые наборы', 'Пазлы'],
  [ProductCategory.BOOKS]: ['Художественная литература', 'Детская литература', 'Бизнес-литература', 'Учебная литература', 'Научно-популярная литература', 'Комиксы и манга', 'Саморазвитие', 'Искусство и культура', 'Компьютерная литература', 'Канцтовары'],
  [ProductCategory.FOOD]: ['Сладости', 'Напитки', 'Снеки', 'Бакалея', 'Консервы', 'Молочные продукты', 'Замороженные продукты', 'Чай и кофе', 'Здоровое питание', 'Деликатесы'],
  [ProductCategory.HEALTH]: ['Витамины и БАДы', 'Лекарства', 'Медицинские приборы', 'Ортопедия', 'Оптика', 'Гигиена', 'Уход за полостью рта', 'Первая помощь', 'Массажеры', 'Товары для здоровья'],
  [ProductCategory.AUTO]: ['Автозапчасти', 'Автохимия', 'Автоэлектроника', 'Шины и диски', 'Аксессуары', 'Инструменты', 'Автозвук', 'Навигация', 'Уход за автомобилем', 'Безопасность'],
  [ProductCategory.PETS]: ['Корма для собак', 'Корма для кошек', 'Лакомства', 'Игрушки', 'Аксессуары', 'Уход и гигиена', 'Лежанки и домики', 'Переноски', 'Ветеринарные товары', 'Аквариумистика'],
  [ProductCategory.JEWELRY]: ['Кольца', 'Серьги', 'Подвески', 'Браслеты', 'Цепочки', 'Часы', 'Броши', 'Комплекты', 'Мужские украшения', 'Детские украшения'],
  [ProductCategory.OFFICE]: ['Канцтовары', 'Бумага', 'Принтеры и МФУ', 'Расходные материалы', 'Офисная мебель', 'Офисная техника', 'Хранение документов', 'Презентационное оборудование', 'Сейфы', 'Офисные принадлежности'],
  [ProductCategory.GARDEN]: ['Садовый инструмент', 'Садовая техника', 'Полив', 'Семена и растения', 'Удобрения', 'Садовая мебель', 'Грили и барбекю', 'Бассейны', 'Теплицы', 'Декор для сада'],
  [ProductCategory.OTHER]: ['Разное']
};

// Список названий товаров по категориям
const productNamesByCategory: Record<ProductCategory, string[]> = {
  [ProductCategory.ELECTRONICS]: [
    'Смартфон {brand} {model}',
    'Ноутбук {brand} {model}',
    'Планшет {brand} {model}',
    'Телевизор {brand} {model}',
    'Наушники {brand} {model}',
    'Умные часы {brand} {model}',
    'Фотоаппарат {brand} {model}',
    'Колонка {brand} {model}',
    'Игровая приставка {brand} {model}',
    'Монитор {brand} {model}'
  ],
  [ProductCategory.CLOTHING]: [
    'Футболка {brand} {model}',
    'Джинсы {brand} {model}',
    'Платье {brand} {model}',
    'Куртка {brand} {model}',
    'Кроссовки {brand} {model}',
    'Рубашка {brand} {model}',
    'Свитер {brand} {model}',
    'Шорты {brand} {model}',
    'Юбка {brand} {model}',
    'Пальто {brand} {model}'
  ],
  // Для остальных категорий аналогично...
  [ProductCategory.OTHER]: ['Товар {brand} {model}']
};

// Модели для электроники
const electronicsModels = ['Pro', 'Max', 'Ultra', 'Lite', 'Plus', 'S', 'X', 'Z', 'Note', 'Air'];

// Генерация случайного названия товара
const generateProductName = (category: ProductCategory, brand: string): string => {
  const template = randomItem(productNamesByCategory[category] || productNamesByCategory[ProductCategory.OTHER]);
  const model = category === ProductCategory.ELECTRONICS ? randomItem(electronicsModels) : '';
  return template.replace('{brand}', brand).replace('{model}', model);
};

// Генерация случайного описания товара
const generateProductDescription = (title: string, category: ProductCategory, brand: string): string => {
  const features = [
    'Высокое качество',
    'Надежность',
    'Современный дизайн',
    'Удобство использования',
    'Долговечность',
    'Экономичность',
    'Инновационные технологии',
    'Экологичность',
    'Многофункциональность',
    'Компактность'
  ];

  const randomFeatures = Array.from({ length: randomInt(3, 5) }, () => randomItem(features));
  const uniqueFeatures = [...new Set(randomFeatures)];

  return `${title} от бренда ${brand}. ${uniqueFeatures.join('. ')}. Идеальный выбор для тех, кто ценит качество и функциональность.`;
};

// Генерация случайной цены
const generatePrice = (category: ProductCategory): number => {
  const priceRanges: Record<ProductCategory, [number, number]> = {
    [ProductCategory.ELECTRONICS]: [5000, 150000],
    [ProductCategory.CLOTHING]: [1000, 15000],
    [ProductCategory.HOME]: [500, 50000],
    [ProductCategory.BEAUTY]: [300, 10000],
    [ProductCategory.SPORTS]: [500, 30000],
    [ProductCategory.TOYS]: [300, 10000],
    [ProductCategory.BOOKS]: [200, 3000],
    [ProductCategory.FOOD]: [50, 5000],
    [ProductCategory.HEALTH]: [200, 10000],
    [ProductCategory.AUTO]: [500, 20000],
    [ProductCategory.PETS]: [100, 5000],
    [ProductCategory.JEWELRY]: [1000, 100000],
    [ProductCategory.OFFICE]: [200, 20000],
    [ProductCategory.GARDEN]: [300, 30000],
    [ProductCategory.OTHER]: [100, 10000]
  };

  const [min, max] = priceRanges[category] || [100, 10000];
  return Math.round(randomInt(min, max) / 10) * 10; // Округляем до десятков
};

// Список конкурентов
export const mockCompetitors: Competitor[] = [
  { id: 'comp-1', name: 'МегаМаркет', url: 'https://megamarket.ru' },
  { id: 'comp-2', name: 'Яндекс.Маркет', url: 'https://market.yandex.ru' },
  { id: 'comp-3', name: 'Wildberries', url: 'https://wildberries.ru' },
  { id: 'comp-4', name: 'AliExpress', url: 'https://aliexpress.ru' },
  { id: 'comp-5', name: 'СберМегаМаркет', url: 'https://sbermegamarket.ru' },
  { id: 'comp-6', name: 'DNS', url: 'https://dns-shop.ru' },
  { id: 'comp-7', name: 'М.Видео', url: 'https://mvideo.ru' },
  { id: 'comp-8', name: 'Эльдорадо', url: 'https://eldorado.ru' },
  { id: 'comp-9', name: 'Ситилинк', url: 'https://citilink.ru' },
  { id: 'comp-10', name: 'Lamoda', url: 'https://lamoda.ru' }
];

// Генерация случайных цен конкурентов
const generateCompetitorPrices = (basePrice: number): CompetitorPrice[] => {
  const numberOfCompetitors = randomInt(2, 5);
  const selectedCompetitors = [...mockCompetitors]
    .sort(() => 0.5 - Math.random())
    .slice(0, numberOfCompetitors);

  return selectedCompetitors.map(competitor => {
    // Цена конкурента отличается от базовой на -15% до +15%
    const priceDiff = basePrice * (Math.random() * 0.3 - 0.15);
    const price = Math.round((basePrice + priceDiff) / 10) * 10; // Округляем до десятков

    return {
      competitorId: competitor.id,
      competitorName: competitor.name,
      price,
      url: competitor.url,
      lastUpdated: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    };
  });
};

// Генерация случайных изображений товара
const generateProductImages = (productId: string, category: ProductCategory): ProductImage[] => {
  const numberOfImages = randomInt(1, 5);
  const images: ProductImage[] = [];

  // Маппинг категорий на имена файлов заполнителей
  const categoryToPlaceholder: Record<ProductCategory, string> = {
    [ProductCategory.ELECTRONICS]: 'electronics',
    [ProductCategory.BEAUTY]: 'beauty',
    [ProductCategory.HEALTH]: 'health',
    [ProductCategory.HOME]: 'home',
    [ProductCategory.SPORTS]: 'sports',
    [ProductCategory.TOYS]: 'toys',
    [ProductCategory.FASHION]: 'fashion',
    [ProductCategory.FOOD]: 'food',
    [ProductCategory.OTHER]: 'default'
  };

  const placeholderName = categoryToPlaceholder[category] || 'default';

  for (let i = 0; i < numberOfImages; i++) {
    const isMain = i === 0;
    images.push({
      id: `img-${productId}-${i}`,
      url: `/images/placeholders/${placeholderName}.svg`,
      isMain,
      sortOrder: i
    });
  }

  return images;
};

// Генерация случайных атрибутов товара
const generateProductAttributes = (category: ProductCategory): ProductAttribute[] => {
  const attributesByCategory: Record<ProductCategory, Record<string, string[]>> = {
    [ProductCategory.ELECTRONICS]: {
      'Цвет': ['Черный', 'Белый', 'Серебристый', 'Золотой', 'Синий', 'Красный'],
      'Память': ['64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ'],
      'Процессор': ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7'],
      'Экран': ['IPS', 'OLED', 'AMOLED', 'Retina', 'Super AMOLED']
    },
    [ProductCategory.CLOTHING]: {
      'Цвет': ['Черный', 'Белый', 'Синий', 'Красный', 'Зеленый', 'Желтый', 'Серый'],
      'Размер': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      'Материал': ['Хлопок', 'Полиэстер', 'Шерсть', 'Лен', 'Деним', 'Кожа'],
      'Сезон': ['Весна/Лето', 'Осень/Зима', 'Всесезонный']
    },
    // Для остальных категорий аналогично...
    [ProductCategory.OTHER]: {
      'Цвет': ['Разный'],
      'Размер': ['Разный'],
      'Материал': ['Разный']
    }
  };

  const attributes: ProductAttribute[] = [];
  const categoryAttrs = attributesByCategory[category] || attributesByCategory[ProductCategory.OTHER];

  Object.entries(categoryAttrs).forEach(([name, values], index) => {
    if (randomBoolean(0.8)) { // 80% вероятность добавления атрибута
      attributes.push({
        id: `attr-${index}`,
        name,
        value: randomItem(values)
      });
    }
  });

  return attributes;
};

// Генерация случайной информации о складе
const generateStockInfo = (): StockInfo => {
  const available = randomInt(0, 100);
  const reserved = randomInt(0, Math.min(available, 20));

  const stockInfo: StockInfo = {
    available,
    reserved
  };

  if (randomBoolean(0.7)) { // 70% вероятность добавления информации о поступлении
    stockInfo.inbound = randomInt(10, 50);
    stockInfo.nextDeliveryDate = randomDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000), // Завтра
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Через 30 дней
    );
  }

  return stockInfo;
};

// Генерация случайной статистики продаж
const generateSalesStats = (): SalesStats => {
  const totalSold = randomInt(0, 1000);
  const lastMonthSold = randomInt(0, Math.min(totalSold, 100));
  const lastWeekSold = randomInt(0, Math.min(lastMonthSold, 30));

  return {
    totalSold,
    lastMonthSold,
    lastWeekSold,
    averageRating: Math.round((3 + Math.random() * 2) * 10) / 10, // От 3.0 до 5.0 с шагом 0.1
    reviewsCount: randomInt(0, 100)
  };
};

// Генерация случайного товара
export const generateMockProduct = (id: string): Product => {
  const category = randomItem(Object.values(ProductCategory));
  const brand = randomItem(brandsByCategory[category]);
  const subcategory = randomItem(subcategoriesByCategory[category]);
  const title = generateProductName(category, brand);
  const description = generateProductDescription(title, category, brand);
  const basePrice = generatePrice(category);

  // Генерация цены со скидкой (30% вероятность)
  const hasDiscount = randomBoolean(0.3);
  const oldPrice = hasDiscount ? Math.round(basePrice * (1 + Math.random() * 0.3) / 10) * 10 : undefined;

  // Генерация себестоимости (70% от базовой цены +/- 10%)
  const costPrice = Math.round(basePrice * 0.7 * (0.9 + Math.random() * 0.2) / 10) * 10;

  // Генерация рекомендованной цены (110% от базовой цены +/- 5%)
  const recommendedPrice = Math.round(basePrice * 1.1 * (0.95 + Math.random() * 0.1) / 10) * 10;

  return {
    id,
    ozonId: `OZ-${randomInt(1000000, 9999999)}`,
    title,
    description,
    sku: generateSku(),
    barcode: generateBarcode(),
    category,
    subcategory,
    brand,
    price: {
      current: basePrice,
      old: oldPrice,
      min: Math.round(costPrice * 1.1 / 10) * 10, // Минимальная цена = себестоимость + 10%
      max: Math.round(basePrice * 1.3 / 10) * 10, // Максимальная цена = базовая цена + 30%
      recommended: recommendedPrice,
      costPrice,
      competitorPrices: generateCompetitorPrices(basePrice)
    },
    stock: generateStockInfo(),
    status: randomItem(Object.values(ProductStatus)),
    images: generateProductImages(id, category),
    attributes: generateProductAttributes(category),
    salesStats: generateSalesStats(),
    createdAt: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
    updatedAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    appliedStrategyId: randomBoolean(0.3) ? `strategy-${randomInt(1, 5)}` : undefined
  };
};

// Генерация массива случайных товаров
export const generateMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }, (_, index) =>
    generateMockProduct(`product-${index + 1}`)
  );
};

// Экспорт массива из 100 случайных товаров
export const mockProducts: Product[] = generateMockProducts(100);

// Добавляем товары с ID product-1 и product-2, чтобы исправить ошибки
if (!mockProducts.find(p => p.id === 'product-1')) {
  mockProducts.push(generateMockProduct('product-1'));
}

if (!mockProducts.find(p => p.id === 'product-2')) {
  mockProducts.push(generateMockProduct('product-2'));
}

// Создаем отдельный массив товаров для Ozon
export const mockOzonProducts: Product[] = mockProducts
  .filter(product => Math.random() > 0.3 || product.id === 'product-1' || product.id === 'product-2') // Берем примерно 70% товаров и обязательно product-1 и product-2
  .map(product => ({
    ...product,
    ozonId: `OZ-${randomInt(1000000, 9999999)}`, // Добавляем ID Ozon
    // Добавляем специфичные для Ozon поля
    status: Math.random() > 0.2 ? ProductStatus.ACTIVE : randomItem(Object.values(ProductStatus)),
    // Добавляем информацию о продажах на Ozon
    salesStats: {
      ...product.salesStats,
      ozonSales: {
        lastWeek: randomInt(0, 20),
        lastMonth: randomInt(20, 100),
        total: randomInt(100, 1000)
      }
    }
  }));

// Убедимся, что товары с ID product-1 и product-2 есть в списке Ozon товаров
const product1 = mockProducts.find(p => p.id === 'product-1');
const product2 = mockProducts.find(p => p.id === 'product-2');

if (product1 && !mockOzonProducts.find(p => p.id === 'product-1')) {
  mockOzonProducts.push({
    ...product1,
    ozonId: `OZ-${randomInt(1000000, 9999999)}`,
    status: ProductStatus.ACTIVE,
    salesStats: {
      ...product1.salesStats,
      ozonSales: {
        lastWeek: randomInt(0, 20),
        lastMonth: randomInt(20, 100),
        total: randomInt(100, 1000)
      }
    }
  });
}

if (product2 && !mockOzonProducts.find(p => p.id === 'product-2')) {
  mockOzonProducts.push({
    ...product2,
    ozonId: `OZ-${randomInt(1000000, 9999999)}`,
    status: ProductStatus.ACTIVE,
    salesStats: {
      ...product2.salesStats,
      ozonSales: {
        lastWeek: randomInt(0, 20),
        lastMonth: randomInt(20, 100),
        total: randomInt(100, 1000)
      }
    }
  });
}

// Логирование для отладки
console.log('mockData.ts: Generated mock products:', mockProducts.length);
console.log('mockData.ts: Generated mock Ozon products:', mockOzonProducts.length);
