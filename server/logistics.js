/**
 * Модуль логистического оптимизатора для Ozon Price Optimizer Pro
 * 
 * Отвечает за:
 * - Получение данных об остатках товаров через Ozon Stock API
 * - Импорт данных о поставках из CSV-файлов (1С/Excel)
 * - Оптимизацию цен на основе остатков и сроков поставки
 */

const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Настройка хранилища для загружаемых файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Создаем роутер для логистического модуля
const router = express.Router();

// Моковые данные о поставках (в реальном приложении будут храниться в БД)
let deliveries = [
  { product_id: '123456', quantity: 50, expected_date: '2025-06-01' },
  { product_id: '789012', quantity: 30, expected_date: '2025-05-25' },
  { product_id: '345678', quantity: 100, expected_date: '2025-06-10' }
];

/**
 * Функция для оптимизации цены на основе остатков и поставок
 * @param {number} currentPrice - Текущая цена товара
 * @param {number} stock - Количество товара на складе
 * @param {Date|null} nextDeliveryDate - Дата следующей поставки (null если нет запланированных поставок)
 * @returns {Object} - Оптимизированная цена и рекомендации
 */
function optimizePrice(currentPrice, stock, nextDeliveryDate) {
  let optimizedPrice = currentPrice;
  let recommendation = '';
  let priceChange = 0;

  // Логика оптимизации согласно PRD
  if (stock < 10) {
    // Если остатки < 10 шт, увеличиваем цену на 10%
    optimizedPrice = currentPrice * 1.1;
    priceChange = 10;
    recommendation = 'Низкий остаток товара. Рекомендуется повысить цену для максимизации прибыли с ограниченного запаса.';
  } else if (nextDeliveryDate) {
    // Проверяем, будет ли поставка в течение 7 дней
    const today = new Date();
    const deliveryDate = new Date(nextDeliveryDate);
    const daysUntilDelivery = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDelivery < 7) {
      // Если поставка через < 7 дней, снижаем цену на 5%
      optimizedPrice = currentPrice * 0.95;
      priceChange = -5;
      recommendation = `Поставка через ${daysUntilDelivery} дней. Рекомендуется снизить цену для ускорения продаж перед пополнением запасов.`;
    } else {
      // Стандартная цена
      recommendation = 'Оптимальный уровень запасов. Рекомендуется сохранить текущую цену.';
    }
  } else {
    // Нет данных о поставках
    recommendation = 'Нет данных о будущих поставках. Рекомендуется сохранить текущую цену.';
  }

  return {
    originalPrice: currentPrice,
    optimizedPrice: Math.round(optimizedPrice),
    priceChange: priceChange,
    recommendation: recommendation
  };
}

/**
 * Получение ближайшей даты поставки для товара
 * @param {string} productId - ID товара
 * @returns {string|null} - Дата поставки или null, если поставок нет
 */
function getNextDeliveryDate(productId) {
  const productDeliveries = deliveries.filter(d => d.product_id === productId);
  
  if (productDeliveries.length === 0) {
    return null;
  }
  
  // Сортируем поставки по дате и берем ближайшую
  productDeliveries.sort((a, b) => new Date(a.expected_date) - new Date(b.expected_date));
  return productDeliveries[0].expected_date;
}

// API-эндпоинт для получения оптимизированной цены товара
router.post('/optimize-price', async (req, res) => {
  try {
    const { productId, currentPrice, stock } = req.body;
    
    if (!productId || currentPrice === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать ID товара, текущую цену и остаток'
      });
    }
    
    // Получаем дату следующей поставки
    const nextDeliveryDate = getNextDeliveryDate(productId);
    
    // Оптимизируем цену
    const result = optimizePrice(currentPrice, stock, nextDeliveryDate);
    
    res.json({
      success: true,
      data: {
        ...result,
        nextDeliveryDate
      }
    });
  } catch (error) {
    console.error('Error in optimize-price endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при оптимизации цены'
    });
  }
});

// API-эндпоинт для получения данных об остатках товаров через Ozon Stock API
router.post('/get-stock', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать массив ID товаров'
      });
    }
    
    // В реальном приложении здесь будет запрос к Ozon Stock API
    // Для демонстрации возвращаем моковые данные
    const stockData = productIds.map(id => ({
      product_id: id,
      stock: Math.floor(Math.random() * 50), // Случайное количество от 0 до 49
      reserved: Math.floor(Math.random() * 10) // Случайное количество зарезервированных товаров
    }));
    
    res.json({
      success: true,
      data: stockData
    });
  } catch (error) {
    console.error('Error in get-stock endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при получении данных об остатках'
    });
  }
});

// API-эндпоинт для получения данных о поставках
router.get('/deliveries', (req, res) => {
  try {
    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Error in deliveries endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при получении данных о поставках'
    });
  }
});

// API-эндпоинт для добавления данных о поставке
router.post('/deliveries', (req, res) => {
  try {
    const { product_id, quantity, expected_date } = req.body;
    
    if (!product_id || !quantity || !expected_date) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать ID товара, количество и ожидаемую дату поставки'
      });
    }
    
    // Добавляем новую поставку
    const newDelivery = {
      product_id,
      quantity: parseInt(quantity),
      expected_date
    };
    
    deliveries.push(newDelivery);
    
    res.json({
      success: true,
      data: newDelivery
    });
  } catch (error) {
    console.error('Error in add delivery endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при добавлении данных о поставке'
    });
  }
});

// API-эндпоинт для импорта данных о поставках из CSV-файла
router.post('/import-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не был загружен'
      });
    }
    
    const results = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Обрабатываем данные из CSV
        const importedDeliveries = results.map(row => ({
          product_id: row.product_id || row.sku || row.id,
          quantity: parseInt(row.quantity || row.count || '0'),
          expected_date: row.expected_date || row.delivery_date || row.date
        }));
        
        // Добавляем импортированные поставки к существующим
        deliveries = [...deliveries, ...importedDeliveries];
        
        // Удаляем временный файл
        fs.unlinkSync(req.file.path);
        
        res.json({
          success: true,
          message: `Импортировано ${importedDeliveries.length} записей о поставках`,
          data: importedDeliveries
        });
      });
  } catch (error) {
    console.error('Error in import-csv endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при импорте данных из CSV'
    });
  }
});

module.exports = router;
