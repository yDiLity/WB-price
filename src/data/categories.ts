// Структура категорий товаров Ozon
export interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

// Расширенный список категорий товаров Ozon
export const ozonCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Электроника',
    subcategories: [
      { id: 'smartphones', name: 'Смартфоны и телефоны' },
      { id: 'laptops', name: 'Ноутбуки и компьютеры' },
      { id: 'tablets', name: 'Планшеты и электронные книги' },
      { id: 'tv', name: 'Телевизоры и аудиотехника' },
      { id: 'photo', name: 'Фото- и видеотехника' },
      { id: 'accessories', name: 'Аксессуары и комплектующие' },
      { id: 'wearables', name: 'Умные часы и браслеты' },
      { id: 'gaming', name: 'Игровые приставки и аксессуары' }
    ]
  },
  {
    id: 'home_appliances',
    name: 'Бытовая техника',
    subcategories: [
      { id: 'large_appliances', name: 'Крупная бытовая техника' },
      { id: 'small_appliances', name: 'Мелкая бытовая техника' },
      { id: 'kitchen_appliances', name: 'Техника для кухни' },
      { id: 'climate_equipment', name: 'Климатическая техника' },
      { id: 'beauty_appliances', name: 'Техника для красоты и здоровья' }
    ]
  },
  {
    id: 'clothing',
    name: 'Одежда, обувь и аксессуары',
    subcategories: [
      { id: 'women_clothing', name: 'Женская одежда' },
      { id: 'men_clothing', name: 'Мужская одежда' },
      { id: 'kids_clothing', name: 'Детская одежда' },
      { id: 'women_shoes', name: 'Женская обувь' },
      { id: 'men_shoes', name: 'Мужская обувь' },
      { id: 'kids_shoes', name: 'Детская обувь' },
      { id: 'bags', name: 'Сумки и рюкзаки' },
      { id: 'accessories', name: 'Аксессуары и украшения' },
      { id: 'watches', name: 'Часы' }
    ]
  },
  {
    id: 'beauty',
    name: 'Красота и здоровье',
    subcategories: [
      { id: 'makeup', name: 'Макияж' },
      { id: 'perfume', name: 'Парфюмерия' },
      { id: 'hair_care', name: 'Уход за волосами' },
      { id: 'face_care', name: 'Уход за лицом' },
      { id: 'body_care', name: 'Уход за телом' },
      { id: 'oral_care', name: 'Уход за полостью рта' },
      { id: 'health_products', name: 'Товары для здоровья' }
    ]
  },
  {
    id: 'home',
    name: 'Дом и сад',
    subcategories: [
      { id: 'furniture', name: 'Мебель' },
      { id: 'textiles', name: 'Текстиль' },
      { id: 'kitchen', name: 'Посуда и кухонные принадлежности' },
      { id: 'decor', name: 'Декор и интерьер' },
      { id: 'lighting', name: 'Освещение' },
      { id: 'storage', name: 'Хранение вещей' },
      { id: 'garden', name: 'Сад и огород' },
      { id: 'tools', name: 'Инструменты и строительство' }
    ]
  },
  {
    id: 'kids',
    name: 'Детские товары',
    subcategories: [
      { id: 'toys', name: 'Игрушки и игры' },
      { id: 'baby_products', name: 'Товары для малышей' },
      { id: 'school', name: 'Товары для школы' },
      { id: 'feeding', name: 'Кормление и уход' },
      { id: 'strollers', name: 'Коляски и автокресла' },
      { id: 'kids_furniture', name: 'Детская мебель' }
    ]
  },
  {
    id: 'sports',
    name: 'Спорт и отдых',
    subcategories: [
      { id: 'sportswear', name: 'Спортивная одежда и обувь' },
      { id: 'fitness', name: 'Фитнес и тренажеры' },
      { id: 'outdoor', name: 'Туризм и отдых на природе' },
      { id: 'bicycles', name: 'Велосипеды и самокаты' },
      { id: 'winter_sports', name: 'Зимние виды спорта' },
      { id: 'water_sports', name: 'Водные виды спорта' },
      { id: 'team_sports', name: 'Командные виды спорта' }
    ]
  },
  {
    id: 'auto',
    name: 'Автотовары',
    subcategories: [
      { id: 'auto_electronics', name: 'Автоэлектроника и навигация' },
      { id: 'auto_parts', name: 'Запчасти и аксессуары' },
      { id: 'auto_chemicals', name: 'Автохимия и автокосметика' },
      { id: 'tires_wheels', name: 'Шины и диски' },
      { id: 'auto_tools', name: 'Инструменты и оборудование' }
    ]
  },
  {
    id: 'books',
    name: 'Книги',
    subcategories: [
      { id: 'fiction', name: 'Художественная литература' },
      { id: 'non_fiction', name: 'Нехудожественная литература' },
      { id: 'educational', name: 'Учебная литература' },
      { id: 'children_books', name: 'Детская литература' },
      { id: 'comics', name: 'Комиксы и манга' },
      { id: 'foreign', name: 'Иностранная литература' }
    ]
  },
  {
    id: 'food',
    name: 'Продукты питания',
    subcategories: [
      { id: 'grocery', name: 'Бакалея' },
      { id: 'sweets', name: 'Сладости и снеки' },
      { id: 'drinks', name: 'Напитки' },
      { id: 'tea_coffee', name: 'Чай и кофе' },
      { id: 'healthy_food', name: 'Здоровое питание' },
      { id: 'gourmet', name: 'Деликатесы' }
    ]
  },
  {
    id: 'pet_supplies',
    name: 'Зоотовары',
    subcategories: [
      { id: 'dog', name: 'Товары для собак' },
      { id: 'cat', name: 'Товары для кошек' },
      { id: 'fish', name: 'Аквариумистика' },
      { id: 'bird', name: 'Товары для птиц' },
      { id: 'rodent', name: 'Товары для грызунов' },
      { id: 'pet_food', name: 'Корма для животных' }
    ]
  },
  {
    id: 'jewelry',
    name: 'Ювелирные изделия',
    subcategories: [
      { id: 'gold', name: 'Золотые украшения' },
      { id: 'silver', name: 'Серебряные украшения' },
      { id: 'bijouterie', name: 'Бижутерия' },
      { id: 'watches_luxury', name: 'Премиальные часы' }
    ]
  }
];

// Плоский список всех категорий для удобного поиска
export const getAllCategories = (): { id: string; name: string; parentId?: string }[] => {
  const result: { id: string; name: string; parentId?: string }[] = [];
  
  ozonCategories.forEach(category => {
    result.push({ id: category.id, name: category.name });
    
    if (category.subcategories) {
      category.subcategories.forEach(subcategory => {
        result.push({
          id: subcategory.id,
          name: subcategory.name,
          parentId: category.id
        });
      });
    }
  });
  
  return result;
};

// Получение полного пути категории (для хлебных крошек)
export const getCategoryPath = (categoryId: string): { id: string; name: string }[] => {
  const result: { id: string; name: string }[] = [];
  
  // Поиск категории верхнего уровня
  const topCategory = ozonCategories.find(c => c.id === categoryId);
  if (topCategory) {
    result.push({ id: topCategory.id, name: topCategory.name });
    return result;
  }
  
  // Поиск подкатегории
  for (const category of ozonCategories) {
    if (category.subcategories) {
      const subcategory = category.subcategories.find(sc => sc.id === categoryId);
      if (subcategory) {
        result.push({ id: category.id, name: category.name });
        result.push({ id: subcategory.id, name: subcategory.name });
        return result;
      }
    }
  }
  
  return result;
};
