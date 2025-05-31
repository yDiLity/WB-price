const express = require('express');
const axios = require('axios');
const router = express.Router();

// Моковые данные для конкурентов
const mockCompetitors = [
  { id: 'comp-1', name: 'МегаМаркет', url: 'https://megamarket.ru' },
  { id: 'comp-2', name: 'Яндекс.Маркет', url: 'https://market.yandex.ru' },
  { id: 'comp-3', name: 'Wildberries', url: 'https://wildberries.ru' },
  { id: 'comp-4', name: 'AliExpress', url: 'https://aliexpress.ru' },
  { id: 'comp-5', name: 'СберМегаМаркет', url: 'https://sbermegamarket.ru' },
  { id: 'comp-6', name: 'DNS', url: 'https://dns-shop.ru' },
  { id: 'comp-7', name: 'М.Видео', url: 'https://mvideo.ru' },
  { id: 'comp-8', name: 'Эльдорадо', url: 'https://eldorado.ru' },
  { id: 'comp-9', name: 'Ситилинк', url: 'https://citilink.ru' },
  { id: 'comp-10', name: 'Lamoda', url: 'https://lamoda.ru' },
  { id: 'comp-ozon', name: 'Ozon', url: 'https://ozon.ru' }
];

// Моковые данные для товаров по категориям
const mockProductsByCategory = {
  'смартфон': [
    { name: 'Смартфон Apple iPhone 13', variants: ['64GB', '128GB', '256GB'], colors: ['черный', 'белый', 'синий', 'красный'] },
    { name: 'Смартфон Samsung Galaxy S21', variants: ['128GB', '256GB'], colors: ['черный', 'серебристый', 'фиолетовый'] },
    { name: 'Смартфон Xiaomi Redmi Note 10', variants: ['64GB', '128GB'], colors: ['черный', 'белый', 'зеленый'] },
    { name: 'Смартфон Google Pixel 6', variants: ['128GB', '256GB'], colors: ['черный', 'серый', 'зеленый'] },
    { name: 'Смартфон OnePlus 9', variants: ['128GB', '256GB'], colors: ['черный', 'серебристый', 'синий'] }
  ],
  'ноутбук': [
    { name: 'Ноутбук Apple MacBook Air', variants: ['M1', 'M2'], colors: ['серебристый', 'серый космос', 'золотой'] },
    { name: 'Ноутбук HP Pavilion', variants: ['i5', 'i7'], colors: ['серебристый', 'черный', 'синий'] },
    { name: 'Ноутбук Lenovo ThinkPad', variants: ['i5', 'i7', 'Ryzen 5'], colors: ['черный', 'серебристый'] },
    { name: 'Ноутбук Acer Aspire', variants: ['i3', 'i5', 'i7'], colors: ['черный', 'серебристый', 'синий'] },
    { name: 'Ноутбук ASUS ZenBook', variants: ['i5', 'i7'], colors: ['серебристый', 'синий', 'розовый'] }
  ],
  'телевизор': [
    { name: 'Телевизор Samsung', variants: ['43"', '50"', '55"', '65"'], colors: ['черный'] },
    { name: 'Телевизор LG', variants: ['43"', '50"', '55"', '65"', '75"'], colors: ['черный', 'серебристый'] },
    { name: 'Телевизор Sony', variants: ['50"', '55"', '65"', '75"'], colors: ['черный'] },
    { name: 'Телевизор Philips', variants: ['43"', '50"', '55"', '65"'], colors: ['черный', 'серебристый'] },
    { name: 'Телевизор Xiaomi', variants: ['43"', '50"', '55"', '65"'], colors: ['черный'] }
  ],
  'наушники': [
    { name: 'Наушники Apple AirPods', variants: ['2', '3', 'Pro', 'Max'], colors: ['белый', 'черный'] },
    { name: 'Наушники Samsung Galaxy Buds', variants: ['Live', 'Pro', 'Pro 2'], colors: ['черный', 'белый', 'фиолетовый'] },
    { name: 'Наушники Sony WH-1000XM4', variants: ['стандарт'], colors: ['черный', 'серебристый', 'синий'] },
    { name: 'Наушники JBL', variants: ['T110', 'T290', 'Live 300'], colors: ['черный', 'белый', 'синий', 'красный'] },
    { name: 'Наушники Beats', variants: ['Solo', 'Studio', 'Powerbeats'], colors: ['черный', 'красный', 'белый'] }
  ],
  'clinique': [
    { name: 'Clinique Moisture Surge', variants: ['50мл', '75мл', '125мл'], colors: [] },
    { name: 'Clinique Even Better', variants: ['30мл', '50мл'], colors: ['светлый', 'средний', 'темный'] },
    { name: 'Clinique Happy', variants: ['50мл', '100мл'], colors: [] },
    { name: 'Clinique All About Eyes', variants: ['15мл', '30мл'], colors: [] },
    { name: 'Clinique Dramatically Different', variants: ['50мл', '125мл', '200мл'], colors: [] }
  ],
  'default': [
    { name: 'Товар 1', variants: ['стандарт', 'премиум'], colors: ['черный', 'белый', 'синий'] },
    { name: 'Товар 2', variants: ['малый', 'средний', 'большой'], colors: ['черный', 'белый', 'красный'] },
    { name: 'Товар 3', variants: ['базовый', 'расширенный'], colors: ['черный', 'серебристый'] },
    { name: 'Товар 4', variants: ['эконом', 'стандарт', 'люкс'], colors: ['черный', 'белый', 'зеленый'] },
    { name: 'Товар 5', variants: ['версия 1', 'версия 2'], colors: ['черный', 'серый', 'синий'] }
  ]
};

// Поиск конкурентов
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10, only_ozon = 0, product_name = '' } = req.query;

    console.log('Запрос на поиск конкурентов:', { query, limit, only_ozon, product_name });

    // Проверяем, есть ли поисковый запрос
    if (!query) {
      return res.status(400).json({ error: 'Поисковый запрос обязателен' });
    }

    // Здесь должен быть реальный запрос к API Ozon
    // В данном примере мы генерируем моковые данные

    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Фильтруем конкурентов, если нужно только Ozon
    let availableCompetitors = [...mockCompetitors];
    if (parseInt(only_ozon) === 1) {
      availableCompetitors = availableCompetitors.filter(
        c => c.name.toLowerCase().includes('ozon') || c.url.toLowerCase().includes('ozon.ru')
      );
    }

    // Определяем категорию товара на основе запроса
    let category = 'default';
    const lowerQuery = query.toLowerCase();

    for (const cat of Object.keys(mockProductsByCategory)) {
      if (lowerQuery.includes(cat)) {
        category = cat;
        break;
      }
    }

    // Если запрос содержит "clinique", используем категорию clinique
    if (lowerQuery.includes('clinique') || product_name.toLowerCase().includes('clinique')) {
      category = 'clinique';
    }

    // Получаем шаблоны товаров для данной категории
    const productTemplates = mockProductsByCategory[category] || mockProductsByCategory.default;

    // Генерация результатов поиска на основе шаблонов
    const numberOfResults = Math.min(parseInt(limit), 10);
    const products = [];

    for (let i = 0; i < numberOfResults; i++) {
      // Выбираем случайный шаблон товара
      const template = productTemplates[i % productTemplates.length];

      // Выбираем случайного конкурента
      const competitor = availableCompetitors[Math.floor(Math.random() * availableCompetitors.length)];

      // Выбираем случайный вариант и цвет
      const variant = template.variants[Math.floor(Math.random() * template.variants.length)];
      const color = template.colors.length > 0
        ? template.colors[Math.floor(Math.random() * template.colors.length)]
        : '';

      // Формируем название товара
      let title = template.name;
      if (variant) title += ` ${variant}`;
      if (color) title += ` ${color}`;

      // Генерируем случайную цену в диапазоне ±20% от 10000
      const basePrice = 10000;
      const price = Math.round(basePrice * (0.8 + Math.random() * 0.4));

      // Генерируем уникальный ID
      const id = Math.floor(Math.random() * 10000000);

      products.push({
        id: `${id}`,
        title: title,
        price,
        seller: {
          id: competitor.id,
          name: competitor.name
        },
        url: `${competitor.url}/product/${id}`,
        image_url: `https://via.placeholder.com/150?text=${encodeURIComponent(title.substring(0, 20))}`
      });
    }

    res.json({
      products,
      total: products.length
    });
  } catch (error) {
    console.error('Ошибка при поиске конкурентов:', error);
    res.status(500).json({ error: 'Ошибка сервера при поиске конкурентов' });
  }
});

module.exports = router;
