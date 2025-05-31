require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');
const axios = require('axios');

// Импорт модулей базы данных
const { initializeDatabase } = require('./database/config');
const User = require('./models/User');
const Product = require('./models/Product');
const DeliverySlot = require('./models/DeliverySlot');

// Импорт сервисов
const pricingService = require('./services/PricingService');
const analyticsService = require('./services/AnalyticsService');

// Инициализация Express с оптимизацией для большого количества запросов
const app = express();

// Инициализация базы данных
async function initializeDatabaseConnection() {
  console.log('🔄 Initializing database connection...');

  try {
    const dbConfig = await initializeDatabase();
    const isConnected = await dbConfig.testConnection();

    if (isConnected) {
      console.log('✅ Database connected successfully');

      // Инициализируем PricingService с базой данных
      pricingService.setDatabase(dbConfig);

      // Запускаем сервис автоматического ценообразования
      console.log('🚀 Starting pricing service...');
      pricingService.start();
    } else {
      console.error('❌ Failed to connect to database');
      console.log('⚠️  Running in fallback mode without database');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️  Running in fallback mode without database');
  }
}

// Запускаем инициализацию базы данных
initializeDatabaseConnection();

// Настройка CORS для безопасности
app.use(cors({
  origin: '*', // В продакшене лучше указать конкретные домены
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Увеличиваем лимит размера JSON-запросов
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Добавляем базовую защиту
app.use((req, res, next) => {
  // Защита от XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Запрет встраивания в iframe
  res.setHeader('X-Frame-Options', 'DENY');
  // Запрет угадывания MIME-типа
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Статические файлы
app.use(express.static('public'));

// Добавляем логирование запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Инициализация Telegram-бота
const token = '7417338072:AAFG5p7TWvZuvbTr38r91Q8VFCfDotxR0ak'; // Явно указываем токен
console.log('Using token:', token);

// Настройки для обработки большого количества запросов
const botOptions = {
  polling: true,
  // Увеличиваем лимит одновременных запросов
  request: {
    agentOptions: {
      keepAlive: true,
      keepAliveMsecs: 4000,
      maxSockets: 100,
      maxFreeSockets: 10
    }
  }
};

const bot = new TelegramBot(token, botOptions);

// Обработка ошибок бота
bot.on('polling_error', (error) => {
  console.error('Telegram bot polling error:', error);
  // Перезапускаем поллинг при ошибке
  setTimeout(() => {
    bot.stopPolling().then(() => {
      console.log('Restarting polling after error...');
      bot.startPolling();
    });
  }, 5000);
});

// Логирование запуска бота
console.log('Telegram bot started successfully with optimized settings');

// Инициализация OpenAI
// В реальном приложении ключ должен храниться в переменных окружения
// const OPENAI_API_KEY = 'sk-your-openai-api-key';
let openai = null;

// Для демонстрации работаем без реального API ключа
console.log('OpenAI API not configured, using fallback analysis');

// Функция-заглушка для имитации работы ИИ
function simulateAIResponse(prompt) {
  // Анализируем запрос и генерируем ответ на основе ключевых слов
  const isAboutPrice = prompt.toLowerCase().includes('цен') || prompt.toLowerCase().includes('price');
  const isAboutCompetitors = prompt.toLowerCase().includes('конкурент') || prompt.toLowerCase().includes('competitor');
  const isAboutOptimization = prompt.toLowerCase().includes('оптимиз') || prompt.toLowerCase().includes('optimiz');

  let response = "# Анализ товара\n\n";

  // Извлекаем название товара из промпта
  const productNameMatch = prompt.match(/Товар: ([^\n]+)/);
  const productName = productNameMatch ? productNameMatch[1] : "товара";

  // Извлекаем текущую цену из промпта
  const currentPriceMatch = prompt.match(/Текущая цена: (\d+)/);
  const currentPrice = currentPriceMatch ? parseInt(currentPriceMatch[1]) : 1000;

  // Генерируем рекомендуемую цену
  const recommendedPrice = Math.round(currentPrice * (Math.random() * 0.2 + 0.9)); // -10% до +10%

  response += `## Рекомендации по ценообразованию для ${productName}\n\n`;

  if (isAboutPrice) {
    response += `### Анализ цены\n\n`;
    response += `Текущая цена товара составляет ${currentPrice} ₽. На основе анализа рынка и конкурентов, `;

    if (recommendedPrice > currentPrice) {
      response += `рекомендуется повысить цену до ${recommendedPrice} ₽, что позволит увеличить маржинальность без существенного влияния на объем продаж.\n\n`;
    } else {
      response += `рекомендуется снизить цену до ${recommendedPrice} ₽, что позволит увеличить объем продаж и улучшить конкурентное положение.\n\n`;
    }
  }

  if (isAboutCompetitors) {
    response += `### Анализ конкурентов\n\n`;
    response += `Основные конкуренты в данной категории предлагают аналогичные товары по ценам от ${Math.round(currentPrice * 0.8)} ₽ до ${Math.round(currentPrice * 1.2)} ₽. `;
    response += `Ваше ценовое предложение находится ${currentPrice > recommendedPrice ? 'выше' : 'ниже'} среднего по рынку.\n\n`;
  }

  if (isAboutOptimization) {
    response += `### Стратегия оптимизации\n\n`;
    response += `Для оптимизации продаж рекомендуется:\n\n`;
    response += `1. Установить цену в диапазоне ${Math.round(recommendedPrice * 0.95)} - ${Math.round(recommendedPrice * 1.05)} ₽\n`;
    response += `2. Мониторить реакцию рынка на изменение цены\n`;
    response += `3. Корректировать цену каждые 7-14 дней в зависимости от спроса\n`;
    response += `4. Рассмотреть возможность акционных предложений в периоды низкого спроса\n\n`;
  }

  response += `### Рекомендуемая оптимальная цена: ${recommendedPrice} ₽\n\n`;
  response += `### Минимально допустимая цена: ${Math.round(currentPrice * 0.8)} ₽\n\n`;

  response += `Данный анализ основан на текущих рыночных тенденциях и может требовать корректировки при изменении конкурентной среды.`;

  return response;
}

// Функция для анализа товара с помощью ИИ
async function analyzeProductWithAI(product, competitors) {
  try {
    // Формируем запрос к ИИ
    const prompt = `
Проанализируй данные о товаре и его конкурентах на маркетплейсе Ozon:

Товар: ${product.name}
Текущая цена: ${product.currentPrice} ₽
Себестоимость: ${product.costPrice} ₽
Рейтинг: ${product.rating}
Количество отзывов: ${product.reviewCount}

Конкуренты:
${competitors.map(c => `- ${c.name}: ${c.price} ₽, рейтинг: ${c.rating}, отзывов: ${c.reviewCount}`).join('\n')}

Предоставь анализ по следующим пунктам:
1. Оптимальная цена для максимизации прибыли
2. Конкурентное положение товара
3. Рекомендации по улучшению позиции
4. Прогноз продаж при разных ценовых стратегиях
`;

    // Если OpenAI API настроен, используем его
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Ты - эксперт по ценообразованию и аналитике товаров на маркетплейсах. Твоя задача - анализировать данные о товарах и конкурентах, чтобы предоставить оптимальные рекомендации по ценообразованию." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        return {
          success: true,
          analysis: response.choices[0].message.content
        };
      } catch (error) {
        console.error('Error with OpenAI API, falling back to simulated response:', error);
        // Если произошла ошибка с API, используем заглушку
        return {
          success: true,
          analysis: simulateAIResponse(prompt)
        };
      }
    } else {
      // Если OpenAI API не настроен, используем заглушку
      console.log('Using simulated AI response');
      return {
        success: true,
        analysis: simulateAIResponse(prompt)
      };
    }
  } catch (error) {
    console.error('Error analyzing product with AI:', error);
    return {
      success: false,
      message: 'Ошибка при анализе товара с помощью ИИ: ' + error.message
    };
  }
}

// Хранилище данных (в реальном приложении это должна быть база данных)
const users = {};
const pendingActions = {};
const productCache = {};
const connectedUsers = {};
const requestStats = {
  totalRequests: 0,
  requestsPerMinute: 0,
  lastMinuteRequests: 0,
  lastMinuteTimestamp: Date.now(),
  requestsPerUser: {}
};

// Система ограничения запросов
const rateLimits = {
  // Максимальное количество запросов в минуту от одного пользователя
  perUserPerMinute: 60,
  // Максимальное количество запросов в минуту от всех пользователей
  globalPerMinute: 1000
};

// Функция для проверки ограничений запросов
function checkRateLimit(chatId) {
  const now = Date.now();

  // Обновляем статистику запросов
  requestStats.totalRequests++;

  // Обновляем статистику запросов в минуту
  if (now - requestStats.lastMinuteTimestamp > 60000) {
    requestStats.requestsPerMinute = requestStats.lastMinuteRequests;
    requestStats.lastMinuteRequests = 0;
    requestStats.lastMinuteTimestamp = now;
  }
  requestStats.lastMinuteRequests++;

  // Обновляем статистику запросов по пользователям
  if (!requestStats.requestsPerUser[chatId]) {
    requestStats.requestsPerUser[chatId] = {
      count: 0,
      timestamp: now
    };
  }

  // Сбрасываем счетчик, если прошла минута
  if (now - requestStats.requestsPerUser[chatId].timestamp > 60000) {
    requestStats.requestsPerUser[chatId].count = 0;
    requestStats.requestsPerUser[chatId].timestamp = now;
  }

  requestStats.requestsPerUser[chatId].count++;

  // Проверяем ограничения
  if (requestStats.requestsPerUser[chatId].count > rateLimits.perUserPerMinute) {
    console.log(`Rate limit exceeded for user ${chatId}: ${requestStats.requestsPerUser[chatId].count} requests per minute`);
    return false;
  }

  if (requestStats.lastMinuteRequests > rateLimits.globalPerMinute) {
    console.log(`Global rate limit exceeded: ${requestStats.lastMinuteRequests} requests per minute`);
    return false;
  }

  return true;
}

// Запускаем периодический вывод статистики
setInterval(() => {
  console.log(`Stats: ${requestStats.totalRequests} total requests, ${requestStats.requestsPerMinute} requests per minute, ${Object.keys(connectedUsers).length} connected users`);
}, 60000);

// Общий пароль для всех пользователей
const COMMON_PASSWORD = 'ozonpro2025';
console.log('Using common password for all users:', COMMON_PASSWORD);

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Проверяем ограничение запросов
  if (!checkRateLimit(chatId)) {
    bot.sendMessage(
      chatId,
      `⚠️ Слишком много запросов. Пожалуйста, попробуйте позже.`
    );
    return;
  }

  // Отправляем приветственное сообщение с фотографией
  bot.sendPhoto(
    chatId,
    './public/images/ozon_logo.png', // Используем локальное изображение
    {
      caption: `👋 Добро пожаловать в Ozon Price Optimizer Pro Bot!\n\n` +
               `Этот бот поможет вам управлять ценами на товары в Ozon и получать уведомления о важных событиях.\n\n` +
               `Для начала работы, пожалуйста, введите пароль: ozonpro2025`,
      parse_mode: 'Markdown'
    }
  ).catch(error => {
    console.error('Error sending photo:', error);
    // Если отправка фото не удалась, отправляем обычное сообщение
    bot.sendMessage(
      chatId,
      `👋 Добро пожаловать в Ozon Price Optimizer Pro Bot!\n\n` +
      `Этот бот поможет вам управлять ценами на товары в Ozon и получать уведомления о важных событиях.\n\n` +
      `Для начала работы, пожалуйста, введите пароль.`
    );
  });
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `🔍 *Справка по командам*\n\n` +
    `*/start* - Начать работу с ботом\n` +
    `*/help* - Показать справку\n` +
    `*/status* - Проверить статус подключения\n` +
    `*/products* - Показать список товаров\n` +
    `*/analyze* _[ID товара]_ - Анализ товара с помощью ИИ\n` +
    `*/price* _[ID товара] [новая цена]_ - Изменить цену товара\n\n` +
    `Вы также можете отвечать на уведомления об изменении цен, чтобы подтвердить или отклонить их.`,
    { parse_mode: 'Markdown' }
  );
});

// Обработка команды /status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;

  if (!users[chatId]) {
    bot.sendMessage(chatId, '⚠️ Вы не авторизованы. Пожалуйста, введите пароль для доступа к боту.');
    return;
  }

  bot.sendMessage(
    chatId,
    `✅ *Статус подключения*\n\n` +
    `Вы авторизованы как: *${users[chatId].name || 'Пользователь'}*\n` +
    `Chat ID: \`${chatId}\`\n` +
    `Уведомления: *${users[chatId].notifications ? 'Включены' : 'Отключены'}*\n\n` +
    `Используйте этот Chat ID в настройках приложения Ozon Price Optimizer Pro для получения уведомлений.`,
    { parse_mode: 'Markdown' }
  );
});

// Обработка команды /products с оптимизацией для большого количества запросов
bot.onText(/\/products/, async (msg) => {
  const chatId = msg.chat.id;

  // Проверка авторизации
  if (!users[chatId]) {
    bot.sendMessage(chatId, '⚠️ Вы не авторизованы. Пожалуйста, введите пароль для доступа к боту.');
    return;
  }

  // Отправляем сообщение о загрузке
  const loadingMessage = await bot.sendMessage(chatId, '🔍 Загрузка списка товаров...');

  try {
    // Используем кеширование для уменьшения нагрузки
    // Проверяем, есть ли кешированные данные не старше 5 минут
    const now = Date.now();
    const cacheTime = 5 * 60 * 1000; // 5 минут

    let mockProducts;

    if (productCache[chatId] && productCache[chatId].timestamp && (now - productCache[chatId].timestamp < cacheTime)) {
      // Используем кешированные данные
      console.log(`Using cached products for chat ${chatId}`);
      mockProducts = productCache[chatId].products;
    } else {
      // В реальном приложении здесь будет запрос к API
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Генерируем тестовые данные
      mockProducts = generateMockProducts(5);

      // Сохраняем в кеш с временной меткой
      productCache[chatId] = {
        products: mockProducts,
        timestamp: now
      };
    }

    // Формируем сообщение порциями для оптимизации
    let message = '📋 *Список товаров*\n\n';

    // Используем более эффективный способ формирования строки
    const productMessages = mockProducts.map((product, index) => {
      return [
        `*${index + 1}. ${product.name}*`,
        `   ID: \`${product.id}\``,
        `   Цена: *${product.currentPrice.toLocaleString()} ₽*`,
        `   Рекомендуемая цена: *${product.recommendedPrice.toLocaleString()} ₽*\n`
      ].join('\n');
    });

    message += productMessages.join('');
    message += '\nДля анализа товара используйте команду:\n';
    message += '`/analyze [ID товара]`\n\n';
    message += 'Для изменения цены используйте команду:\n';
    message += '`/price [ID товара] [новая цена]`';

    // Редактируем исходное сообщение вместо отправки нового
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: loadingMessage.message_id,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error fetching products:', error);

    // Обработка ошибок с повторными попытками
    try {
      await bot.editMessageText('❌ Ошибка при получении списка товаров. Пожалуйста, попробуйте позже.', {
        chat_id: chatId,
        message_id: loadingMessage.message_id
      });
    } catch (editError) {
      // Если не удалось отредактировать, отправляем новое сообщение
      bot.sendMessage(chatId, '❌ Ошибка при получении списка товаров. Пожалуйста, попробуйте позже.');
    }
  }
});

// Обработка команды /analyze
bot.onText(/\/analyze (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const productId = match[1];

  // Проверяем ограничение запросов
  if (!checkRateLimit(chatId)) {
    bot.sendMessage(
      chatId,
      `⚠️ Слишком много запросов. Пожалуйста, попробуйте позже.`
    );
    return;
  }

  if (!users[chatId]) {
    bot.sendMessage(chatId, '⚠️ Вы не авторизованы. Пожалуйста, введите пароль для доступа к боту.');
    return;
  }

  // Отправляем сообщение о загрузке
  const loadingMessage = await bot.sendMessage(chatId, `🔍 Анализирую товар с ID: ${productId}...`);

  try {
    // Находим товар в кеше
    const products = productCache[chatId]?.products || productCache[chatId] || generateMockProducts(5);
    const product = products.find(p => p.id === productId);

    if (!product) {
      await bot.editMessageText('❌ Товар с указанным ID не найден. Используйте команду /products для просмотра списка товаров.', {
        chat_id: chatId,
        message_id: loadingMessage.message_id
      });
      return;
    }

    // Генерируем тестовые данные для конкурентов
    const competitors = [];
    const competitorCount = Math.floor(Math.random() * 5) + 3; // 3-7 конкурентов

    for (let i = 0; i < competitorCount; i++) {
      const priceVariation = (Math.random() * 0.4) - 0.2; // -20% до +20%
      const price = Math.round(product.currentPrice * (1 + priceVariation));

      competitors.push({
        name: `Конкурент ${i+1}`,
        price: price,
        rating: (Math.random() * 2) + 3, // Рейтинг от 3 до 5
        reviewCount: Math.floor(Math.random() * 100) + 5 // 5-105 отзывов
      });
    }

    // Добавляем данные о себестоимости и рейтинге, если их нет
    const enrichedProduct = {
      ...product,
      costPrice: product.costPrice || Math.round(product.currentPrice * 0.6), // Примерная себестоимость
      rating: product.rating || (Math.random() * 2) + 3, // Рейтинг от 3 до 5
      reviewCount: product.reviewCount || Math.floor(Math.random() * 100) + 10 // 10-110 отзывов
    };

    // Используем улучшенный ИИ-анализ
    let analysis;

    if (openai) {
      // Используем OpenAI для анализа
      const aiResult = await analyzeProductWithAI(enrichedProduct, competitors);

      if (aiResult.success) {
        // Если анализ с помощью ИИ успешен, используем его
        analysis = `📊 *ИИ-анализ товара "${product.name}"*\n\n`;
        analysis += `*Текущая цена:* ${product.currentPrice.toLocaleString()} ₽\n`;
        analysis += `*Себестоимость:* ${enrichedProduct.costPrice.toLocaleString()} ₽\n`;
        analysis += `*Рейтинг:* ${enrichedProduct.rating.toFixed(1)} (${enrichedProduct.reviewCount} отзывов)\n\n`;
        analysis += `*Анализ конкурентов:*\n`;
        analysis += `- Количество конкурентов: ${competitors.length}\n`;
        analysis += `- Средняя цена конкурентов: ${Math.round(competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length).toLocaleString()} ₽\n\n`;
        analysis += `*Анализ ИИ:*\n${aiResult.analysis}\n\n`;
        analysis += `Для изменения цены используйте команду:\n`;
        analysis += `/price ${product.id} [новая цена]`;
      } else {
        // Если анализ с помощью ИИ не удался, используем стандартный анализ
        console.warn('AI analysis failed, falling back to standard analysis');
        analysis = await generateAIAnalysis(enrichedProduct);
      }
    } else {
      // Если OpenAI не настроен, используем стандартный анализ
      analysis = await generateAIAnalysis(enrichedProduct);
    }

    // Редактируем исходное сообщение вместо отправки нового
    await bot.editMessageText(analysis, {
      chat_id: chatId,
      message_id: loadingMessage.message_id,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error analyzing product:', error);

    // Обработка ошибок с повторными попытками
    try {
      await bot.editMessageText('❌ Ошибка при анализе товара. Пожалуйста, попробуйте позже.', {
        chat_id: chatId,
        message_id: loadingMessage.message_id
      });
    } catch (editError) {
      // Если не удалось отредактировать, отправляем новое сообщение
      bot.sendMessage(chatId, '❌ Ошибка при анализе товара. Пожалуйста, попробуйте позже.');
    }
  }
});

// Обработка команды /price
bot.onText(/\/price (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const productId = match[1];
  const newPrice = parseFloat(match[2]);

  if (!users[chatId]) {
    bot.sendMessage(chatId, '⚠️ Вы не авторизованы. Пожалуйста, введите пароль для доступа к боту.');
    return;
  }

  if (isNaN(newPrice) || newPrice <= 0) {
    bot.sendMessage(chatId, '❌ Некорректная цена. Пожалуйста, введите положительное число.');
    return;
  }

  try {
    // Находим товар в кеше
    const products = productCache[chatId] || generateMockProducts(5);
    const product = products.find(p => p.id === productId);

    if (!product) {
      bot.sendMessage(chatId, '❌ Товар с указанным ID не найден. Используйте команду /products для просмотра списка товаров.');
      return;
    }

    // Создаем уникальный идентификатор для действия
    const actionId = `price_${Date.now()}`;

    // Сохраняем информацию о действии
    pendingActions[actionId] = {
      type: 'price_change',
      productId,
      oldPrice: product.currentPrice,
      newPrice,
      chatId,
      timestamp: Date.now()
    };

    // Отправляем сообщение с подтверждением
    const message = `⚠️ *Подтверждение изменения цены*\n\n` +
      `Товар: *${product.name}*\n` +
      `Текущая цена: *${product.currentPrice.toLocaleString()} ₽*\n` +
      `Новая цена: *${newPrice.toLocaleString()} ₽*\n` +
      `Изменение: *${((newPrice - product.currentPrice) / product.currentPrice * 100).toFixed(2)}%*\n\n` +
      `Вы уверены, что хотите изменить цену?`;

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Подтвердить', callback_data: `confirm_${actionId}` },
            { text: '❌ Отменить', callback_data: `cancel_${actionId}` }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Error changing price:', error);
    bot.sendMessage(chatId, '❌ Ошибка при изменении цены. Пожалуйста, попробуйте позже.');
  }
});

// Обработка callback-запросов (кнопки)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('confirm_')) {
    const actionId = data.replace('confirm_', '');
    const action = pendingActions[actionId];

    if (!action) {
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Действие устарело или не найдено.' });
      return;
    }

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Обновляем цену товара
    if (action.type === 'price_change') {
      // Находим товар в кеше
      const products = productCache[chatId] || [];
      const product = products.find(p => p.id === action.productId);

      if (product) {
        product.currentPrice = action.newPrice;
      }

      bot.answerCallbackQuery(callbackQuery.id, { text: 'Цена успешно изменена!' });
      bot.editMessageText(
        `✅ *Цена успешно изменена*\n\n` +
        `Товар: *${product ? product.name : 'Неизвестный товар'}*\n` +
        `Старая цена: *${action.oldPrice.toLocaleString()} ₽*\n` +
        `Новая цена: *${action.newPrice.toLocaleString()} ₽*\n` +
        `Изменение: *${((action.newPrice - action.oldPrice) / action.oldPrice * 100).toFixed(2)}%*`,
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [] }
        }
      );
    }

    // Удаляем действие из списка ожидающих
    delete pendingActions[actionId];
  } else if (data.startsWith('cancel_')) {
    const actionId = data.replace('cancel_', '');
    const action = pendingActions[actionId];

    if (!action) {
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Действие устарело или не найдено.' });
      return;
    }

    bot.answerCallbackQuery(callbackQuery.id, { text: 'Действие отменено.' });
    bot.editMessageText(
      `❌ *Действие отменено*\n\n` +
      `Изменение цены отменено.`,
      {
        chat_id: chatId,
        message_id: callbackQuery.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [] }
      }
    );

    // Удаляем действие из списка ожидающих
    delete pendingActions[actionId];
  }
});

// Обработка текстовых сообщений (для авторизации)
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/') && !users[msg.chat.id]) {
    const chatId = msg.chat.id;
    const password = msg.text.trim();

    // Проверяем пароль (общий для всех)
    if (password === COMMON_PASSWORD) {
      // Генерируем уникальный идентификатор для пользователя
      const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Сохраняем информацию о пользователе
      users[chatId] = {
        chatId,
        userId,
        name: msg.from.first_name,
        username: msg.from.username,
        notifications: true,
        authorized: true,
        connectedAt: new Date().toISOString()
      };

      // Добавляем пользователя в список подключенных
      connectedUsers[chatId] = {
        chatId,
        userId,
        name: msg.from.first_name,
        username: msg.from.username,
        connectedAt: new Date().toISOString()
      };

      bot.sendMessage(
        chatId,
        `✅ *Авторизация успешна!*\n\n` +
        `Добро пожаловать, ${msg.from.first_name}!\n\n` +
        `Ваш Chat ID: \`${chatId}\`\n\n` +
        `Используйте этот Chat ID в настройках приложения Ozon Price Optimizer Pro для получения уведомлений.\n\n` +
        `Введите /help для получения списка доступных команд.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      bot.sendMessage(chatId, '❌ Неверный пароль. Пожалуйста, попробуйте еще раз.');
    }
  }
});

// API-эндпоинт для отправки уведомлений
app.post('/api/notify', async (req, res) => {
  try {
    const { chatId, type, data } = req.body;

    if (!chatId || !type || !data) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // Проверяем, авторизован ли пользователь
    if (!users[chatId] || !users[chatId].authorized) {
      return res.status(403).json({ success: false, message: 'User not authorized' });
    }

    let message = '';
    let options = { parse_mode: 'Markdown' };

    switch (type) {
      case 'price_change':
        message = generatePriceChangeNotification(data);
        break;
      case 'suspicious_activity':
        message = generateSuspiciousActivityNotification(data);
        break;
      case 'recommended_price':
        message = generateRecommendedPriceNotification(data);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }

    await bot.sendMessage(chatId, message, options);

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Генерация тестовых товаров
function generateMockProducts(count) {
  const products = [];

  const categories = ['Электроника', 'Бытовая техника', 'Одежда', 'Детские товары', 'Красота и здоровье'];
  const brands = ['Apple', 'Samsung', 'Xiaomi', 'LG', 'Sony', 'Nike', 'Adidas', 'Lego', 'L\'Oreal'];

  for (let i = 0; i < count; i++) {
    const categoryIndex = i % categories.length;
    const brandIndex = i % brands.length;

    const basePrice = 5000 + Math.floor(Math.random() * 15000);
    const recommendedPrice = basePrice * (1 + (Math.random() * 0.2 - 0.1));

    let productName = '';
    const category = categories[categoryIndex];
    const brand = brands[brandIndex];

    switch (category) {
      case 'Электроника':
        productName = `${brand} Смартфон Pro ${i + 1}`;
        break;
      case 'Бытовая техника':
        productName = `${brand} Холодильник Smart ${i + 1}`;
        break;
      case 'Одежда':
        productName = `${brand} Футболка Sport ${i + 1}`;
        break;
      case 'Детские товары':
        productName = `${brand} Конструктор "Приключения" ${i + 1}`;
        break;
      case 'Красота и здоровье':
        productName = `${brand} Шампунь "Сияние" ${i + 1}`;
        break;
      default:
        productName = `${brand} Товар ${i + 1}`;
    }

    products.push({
      id: `product-${i + 1}`,
      name: productName,
      category,
      brand,
      currentPrice: basePrice,
      recommendedPrice,
      stock: Math.floor(Math.random() * 50)
    });
  }

  return products;
}

// Генерация анализа товара с помощью ИИ
async function generateAIAnalysis(product) {
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY') {
      // Если есть API-ключ OpenAI, используем его
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты - ИИ-аналитик для системы оптимизации цен на Ozon. Твоя задача - анализировать товары и давать рекомендации по ценообразованию."
          },
          {
            role: "user",
            content: `Проанализируй товар и дай рекомендации по ценообразованию:\n\nНазвание: ${product.name}\nКатегория: ${product.category}\nБренд: ${product.brand}\nТекущая цена: ${product.currentPrice} ₽\nРекомендуемая цена: ${product.recommendedPrice} ₽\nОстаток на складе: ${product.stock} шт.`
          }
        ],
        max_tokens: 500
      });

      return `🔍 *ИИ-анализ товара*\n\n${response.choices[0].message.content}`;
    } else {
      // Если нет API-ключа, используем заглушку
      const priceDiff = ((product.recommendedPrice - product.currentPrice) / product.currentPrice * 100).toFixed(2);
      const isPriceHigher = product.recommendedPrice > product.currentPrice;

      let analysis = `🔍 *ИИ-анализ товара*\n\n`;
      analysis += `*Товар:* ${product.name}\n`;
      analysis += `*Категория:* ${product.category}\n`;
      analysis += `*Бренд:* ${product.brand}\n\n`;

      analysis += `*Текущая ситуация:*\n`;
      analysis += `- Текущая цена: *${product.currentPrice.toLocaleString()} ₽*\n`;
      analysis += `- Рекомендуемая цена: *${product.recommendedPrice.toLocaleString()} ₽* (${isPriceHigher ? '+' : ''}${priceDiff}%)\n`;
      analysis += `- Остаток на складе: *${product.stock} шт.*\n\n`;

      analysis += `*Анализ рынка:*\n`;
      if (product.stock < 10) {
        analysis += `- Низкий уровень запасов может указывать на высокий спрос\n`;
        analysis += `- Рекомендуется ${isPriceHigher ? 'повысить' : 'сохранить'} цену для максимизации прибыли\n`;
      } else if (product.stock > 30) {
        analysis += `- Высокий уровень запасов может указывать на низкий спрос\n`;
        analysis += `- Рекомендуется ${!isPriceHigher ? 'снизить' : 'пересмотреть'} цену для ускорения продаж\n`;
      } else {
        analysis += `- Средний уровень запасов указывает на стабильный спрос\n`;
        analysis += `- Рекомендуется ${isPriceHigher ? 'постепенно повышать' : 'постепенно снижать'} цену для оптимизации прибыли\n`;
      }

      analysis += `\n*Рекомендации:*\n`;
      if (Math.abs(priceDiff) < 5) {
        analysis += `- Текущая цена близка к оптимальной, значительные изменения не требуются\n`;
        analysis += `- Рекомендуется мониторить цены конкурентов и корректировать при необходимости\n`;
      } else if (isPriceHigher) {
        analysis += `- Рекомендуется повысить цену до *${product.recommendedPrice.toLocaleString()} ₽*\n`;
        analysis += `- Повышение можно провести постепенно, в несколько этапов\n`;
        analysis += `- Мониторить реакцию рынка после каждого повышения\n`;
      } else {
        analysis += `- Рекомендуется снизить цену до *${product.recommendedPrice.toLocaleString()} ₽*\n`;
        analysis += `- Снижение поможет увеличить объем продаж и оборот\n`;
        analysis += `- Рассмотреть возможность акций и специальных предложений\n`;
      }

      return analysis;
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return '❌ Ошибка при генерации ИИ-анализа. Пожалуйста, попробуйте позже.';
  }
}

// Генерация уведомления об изменении цены
function generatePriceChangeNotification(data) {
  const { product, oldPrice, newPrice, reason } = data;
  const priceDiff = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);

  return `📊 *Изменение цены товара*\n\n` +
    `Товар: *${product.name}*\n` +
    `Старая цена: *${oldPrice.toLocaleString()} ₽*\n` +
    `Новая цена: *${newPrice.toLocaleString()} ₽*\n` +
    `Изменение: *${priceDiff}%*\n` +
    `Причина: ${reason}\n\n` +
    `_Для управления ценами перейдите в личный кабинет Ozon Price Optimizer Pro_`;
}

// Генерация уведомления о подозрительной активности
function generateSuspiciousActivityNotification(data) {
  const { type, product, competitor, description, recommendedAction } = data;

  let typeText = 'Неизвестно';
  switch (type) {
    case 'fake_reviews':
      typeText = 'Фейковые отзывы';
      break;
    case 'fake_shop':
      typeText = 'Фейковый магазин';
      break;
    case 'dumping':
      typeText = 'Демпинг';
      break;
  }

  return `⚠️ *Обнаружена подозрительная активность!*\n\n` +
    `Тип: *${typeText}*\n` +
    `Товар: *${product.name}*\n` +
    `Конкурент: *${competitor}*\n` +
    `Описание: ${description}\n\n` +
    `*Рекомендуемое действие:*\n` +
    `${recommendedAction}\n\n` +
    `_Для подробной информации перейдите в личный кабинет Ozon Price Optimizer Pro_`;
}

// Генерация уведомления о рекомендованной цене
function generateRecommendedPriceNotification(data) {
  const { product, currentPrice, recommendedPrice } = data;
  const priceDiff = ((recommendedPrice - currentPrice) / currentPrice * 100).toFixed(2);
  const diffText = recommendedPrice > currentPrice ? `на ${priceDiff}% выше` : `на ${Math.abs(Number(priceDiff))}% ниже`;

  return `💡 *Рекомендация по цене*\n\n` +
    `Товар: *${product.name}*\n` +
    `Текущая цена: *${currentPrice.toLocaleString()} ₽*\n` +
    `Рекомендуемая цена: *${recommendedPrice.toLocaleString()} ₽* (${diffText})\n\n` +
    `_Для применения рекомендации перейдите в личный кабинет Ozon Price Optimizer Pro_`;
}

// API-эндпоинт для получения списка подключенных пользователей
app.get('/api/connected-users', (req, res) => {
  try {
    // В реальном приложении здесь должна быть проверка авторизации

    // Подготавливаем список подключенных пользователей
    const usersList = Object.values(connectedUsers).map(user => ({
      chatId: user.chatId,
      name: user.name,
      username: user.username || 'Нет имени пользователя',
      connectedAt: user.connectedAt
    }));

    res.json({ success: true, users: usersList });
  } catch (error) {
    console.error('Error getting connected users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для отправки тестового сообщения пользователю
app.post('/api/send-test-message', (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ success: false, message: 'Missing required parameter: chatId' });
    }

    // Проверяем, существует ли пользователь с таким Chat ID
    if (!connectedUsers[chatId]) {
      return res.status(404).json({ success: false, message: 'User with this Chat ID not found' });
    }

    // Отправляем тестовое сообщение с фотографией
    try {
      bot.sendPhoto(
        chatId,
        './public/images/ozon_logo.png', // Используем локальное изображение с логотипом
        {
          caption: `🔔 *Тестовое сообщение*\n\n` +
                  `Это тестовое сообщение от Ozon Price Optimizer Pro.\n\n` +
                  `Если вы получили это сообщение и изображение, значит ваш Chat ID правильно настроен и вы будете получать уведомления с графиками цен и рекомендациями.`,
          parse_mode: 'Markdown'
        }
      ).then(() => {
        res.json({ success: true });
      }).catch(photoError => {
        console.error('Error sending photo in test message:', photoError);
        // Если отправка фото не удалась, отправляем обычное сообщение
        bot.sendMessage(
          chatId,
          `🔔 *Тестовое сообщение*\n\n` +
          `Это тестовое сообщение от Ozon Price Optimizer Pro.\n\n` +
          `Если вы получили это сообщение, значит ваш Chat ID правильно настроен и вы будете получать уведомления.`,
          { parse_mode: 'Markdown' }
        ).then(() => {
          res.json({ success: true });
        });
      });
    } catch (error) {
      console.error('Error in send-test-message endpoint:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для удаления пользователя
app.delete('/api/connected-users/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;

    // Проверяем, существует ли пользователь с таким Chat ID
    if (!connectedUsers[chatId]) {
      return res.status(404).json({ success: false, message: 'User with this Chat ID not found' });
    }

    // Отправляем уведомление об удалении
    bot.sendMessage(
      chatId,
      `⚠️ *Ваше подключение было удалено*\n\n` +
      `Вы больше не будете получать уведомления от Ozon Price Optimizer Pro.\n\n` +
      `Если вы хотите снова получать уведомления, отправьте команду /start и введите пароль.`,
      { parse_mode: 'Markdown' }
    );

    // Удаляем пользователя из списка авторизованных и подключенных
    delete users[chatId];
    delete connectedUsers[chatId];

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для получения статистики сервера
app.get('/api/stats', (req, res) => {
  try {
    // В реальном приложении здесь должна быть проверка авторизации

    // Получаем информацию о системе
    const os = require('os');
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100 + ' GB',
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100 + ' GB',
      uptime: Math.floor(os.uptime() / 3600) + ' hours ' + Math.floor((os.uptime() % 3600) / 60) + ' minutes'
    };

    // Собираем статистику
    const stats = {
      system: systemInfo,
      server: {
        uptime: Math.floor(process.uptime() / 3600) + ' hours ' + Math.floor((process.uptime() % 3600) / 60) + ' minutes',
        nodeVersion: process.version,
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / (1024 * 1024) * 100) / 100 + ' MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024) * 100) / 100 + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024) * 100) / 100 + ' MB'
        }
      },
      requests: {
        total: requestStats.totalRequests,
        perMinute: requestStats.requestsPerMinute,
        currentMinute: requestStats.lastMinuteRequests
      },
      users: {
        total: Object.keys(connectedUsers).length,
        active: Object.keys(users).length
      },
      rateLimits: {
        perUserPerMinute: rateLimits.perUserPerMinute,
        globalPerMinute: rateLimits.globalPerMinute
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для проверки работоспособности сервера (health check)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API-эндпоинт для анализа товара с помощью ИИ
app.post('/api/analyze-product', async (req, res) => {
  try {
    const { product, competitors } = req.body;

    // Проверяем наличие необходимых данных
    if (!product || !competitors) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо предоставить данные о товаре и конкурентах'
      });
    }

    // Логируем запрос для отладки
    console.log('Analyzing product:', product.name);

    // Анализируем товар с помощью ИИ
    const result = await analyzeProductWithAI(product, competitors);

    // Возвращаем результат
    res.json(result);
  } catch (error) {
    console.error('Error in analyze-product endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при анализе товара'
    });
  }
});

// API-эндпоинт для получения рекомендаций по оптимизации цены
app.post('/api/optimize-price', async (req, res) => {
  try {
    const { product, marketData, targetProfit } = req.body;

    // Проверяем наличие необходимых данных
    if (!product || !marketData) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо предоставить данные о товаре и рынке'
      });
    }

    // Если OpenAI не настроен, используем алгоритмический подход
    if (!openai) {
      // Простой алгоритм оптимизации цены
      const competitors = marketData.competitors || [];
      const avgCompetitorPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) /
                                (competitors.length || 1);

      // Базовая рекомендация на основе себестоимости и средней цены конкурентов
      const minPrice = product.costPrice * 1.2; // Минимальная маржа 20%
      const recommendedPrice = Math.max(
        minPrice,
        avgCompetitorPrice * 0.95 // Немного ниже среднего по рынку
      );

      return res.json({
        success: true,
        recommendation: {
          recommendedPrice: Math.round(recommendedPrice),
          minPrice: Math.round(minPrice),
          marketAverage: Math.round(avgCompetitorPrice),
          explanation: 'Рекомендация основана на алгоритмическом анализе цен конкурентов и себестоимости товара.'
        }
      });
    }

    // Используем ИИ для более сложного анализа
    const prompt = `
Оптимизируй цену для товара на маркетплейсе Ozon:

Товар: ${product.name}
Текущая цена: ${product.currentPrice} ₽
Себестоимость: ${product.costPrice} ₽
Целевая прибыль: ${targetProfit || 'максимальная'}

Данные о рынке:
- Средняя цена в категории: ${marketData.categoryAvgPrice} ₽
- Диапазон цен в категории: от ${marketData.minPrice} ₽ до ${marketData.maxPrice} ₽
- Количество конкурентов: ${marketData.competitors?.length || 0}

${marketData.competitors ? `Основные конкуренты:
${marketData.competitors.slice(0, 5).map(c => `- ${c.name}: ${c.price} ₽, рейтинг: ${c.rating}`).join('\n')}` : ''}

Предоставь:
1. Рекомендуемую оптимальную цену
2. Минимально допустимую цену для сохранения прибыльности
3. Объяснение рекомендации
`;

    // Переменная для хранения ответа ИИ
    let aiResponse;

    // Если OpenAI API настроен, используем его
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Ты - эксперт по ценообразованию на маркетплейсах. Твоя задача - рассчитать оптимальную цену для товара на основе данных о рынке и себестоимости." },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 800
        });

        // Обрабатываем ответ ИИ
        aiResponse = response.choices[0].message.content;
      } catch (error) {
        console.error('Error with OpenAI API, falling back to simulated response:', error);
        // Если произошла ошибка с API, используем заглушку
        aiResponse = simulateAIResponse(prompt);
      }
    } else {
      // Если OpenAI API не настроен, используем заглушку
      console.log('Using simulated AI response for price optimization');
      aiResponse = simulateAIResponse(prompt);
    }

    // Извлекаем рекомендуемую цену из ответа ИИ (это упрощенный пример)
    let recommendedPrice = 0;
    let minPrice = 0;

    // Простой парсинг ответа (в реальном приложении нужен более надежный парсер)
    const priceMatch = aiResponse.match(/Рекомендуемая оптимальная цена:?\s*(\d+[\d\s]*)/i);
    if (priceMatch && priceMatch[1]) {
      recommendedPrice = parseInt(priceMatch[1].replace(/\s/g, ''));
    }

    const minPriceMatch = aiResponse.match(/Минимально допустимая цена:?\s*(\d+[\d\s]*)/i);
    if (minPriceMatch && minPriceMatch[1]) {
      minPrice = parseInt(minPriceMatch[1].replace(/\s/g, ''));
    }

    // Если не удалось извлечь цены, используем алгоритмический подход
    if (!recommendedPrice) {
      recommendedPrice = Math.round(product.costPrice * 1.5);
    }

    if (!minPrice) {
      minPrice = Math.round(product.costPrice * 1.2);
    }

    res.json({
      success: true,
      recommendation: {
        recommendedPrice,
        minPrice,
        explanation: aiResponse,
        aiGenerated: true
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

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // В продакшене здесь можно добавить отправку уведомлений администратору
});

// Обработка необработанных отклонений промисов
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // В продакшене здесь можно добавить отправку уведомлений администратору
});

// Запуск сервера с обработкой ошибок
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Telegram bot started. Common password: ${COMMON_PASSWORD}`);
  console.log(`Server ready to handle high load of requests`);
});

// Настройка таймаута сервера
server.timeout = 120000; // 2 минуты

// Обработка сигналов завершения для корректного закрытия
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// API-эндпоинт для анализа товара с помощью ИИ
app.post('/api/analyze-product', async (req, res) => {
  try {
    const { product, competitors } = req.body;

    if (!product || !competitors) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // Анализируем товар с помощью ИИ
    const result = await analyzeProductWithAI(product, competitors);

    if (result.success) {
      res.json({ success: true, analysis: result.analysis });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in analyze-product endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для получения списка товаров
app.get('/api/products', (req, res) => {
  try {
    // В реальном приложении здесь будет запрос к базе данных
    // Для демонстрации возвращаем тестовые данные
    const products = [
      // Электроника
      {
        id: 'product-1',
        name: 'Смартфон Samsung Galaxy S21',
        category: 'Электроника',
        subcategory: 'Смартфоны и телефоны',
        brand: 'Samsung',
        currentPrice: 59990,
        costPrice: 35000,
        rating: 4.7,
        reviewCount: 128
      },
      {
        id: 'product-2',
        name: 'Ноутбук Apple MacBook Air',
        category: 'Электроника',
        subcategory: 'Ноутбуки и компьютеры',
        brand: 'Apple',
        currentPrice: 89990,
        costPrice: 65000,
        rating: 4.9,
        reviewCount: 256
      },
      {
        id: 'product-3',
        name: 'Наушники Sony WH-1000XM4',
        category: 'Электроника',
        subcategory: 'Аксессуары и комплектующие',
        brand: 'Sony',
        currentPrice: 27990,
        costPrice: 15000,
        rating: 4.8,
        reviewCount: 189
      },
      {
        id: 'product-4',
        name: 'Умные часы Apple Watch Series 7',
        category: 'Электроника',
        subcategory: 'Умные часы и браслеты',
        brand: 'Apple',
        currentPrice: 36990,
        costPrice: 22000,
        rating: 4.6,
        reviewCount: 112
      },
      {
        id: 'product-5',
        name: 'Планшет Samsung Galaxy Tab S7',
        category: 'Электроника',
        subcategory: 'Планшеты и электронные книги',
        brand: 'Samsung',
        currentPrice: 49990,
        costPrice: 30000,
        rating: 4.5,
        reviewCount: 95
      },

      // Одежда и обувь
      {
        id: 'product-6',
        name: 'Куртка зимняя Columbia',
        category: 'Одежда, обувь и аксессуары',
        subcategory: 'Мужская одежда',
        brand: 'Columbia',
        currentPrice: 12990,
        costPrice: 7500,
        rating: 4.6,
        reviewCount: 87
      },
      {
        id: 'product-7',
        name: 'Кроссовки Nike Air Max',
        category: 'Одежда, обувь и аксессуары',
        subcategory: 'Мужская обувь',
        brand: 'Nike',
        currentPrice: 8990,
        costPrice: 4500,
        rating: 4.8,
        reviewCount: 156
      },

      // Красота и здоровье
      {
        id: 'product-8',
        name: 'Парфюмерная вода Chanel Coco Mademoiselle',
        category: 'Красота и здоровье',
        subcategory: 'Парфюмерия',
        brand: 'Chanel',
        currentPrice: 9890,
        costPrice: 5200,
        rating: 4.9,
        reviewCount: 312
      },
      {
        id: 'product-9',
        name: 'Набор косметики для лица Clinique',
        category: 'Красота и здоровье',
        subcategory: 'Уход за лицом',
        brand: 'Clinique',
        currentPrice: 5490,
        costPrice: 2800,
        rating: 4.7,
        reviewCount: 78
      },

      // Дом и сад
      {
        id: 'product-10',
        name: 'Диван-кровать IKEA БЕДИНГЕ',
        category: 'Дом и сад',
        subcategory: 'Мебель',
        brand: 'IKEA',
        currentPrice: 24990,
        costPrice: 15000,
        rating: 4.3,
        reviewCount: 45
      },
      {
        id: 'product-11',
        name: 'Комплект постельного белья Tac',
        category: 'Дом и сад',
        subcategory: 'Текстиль',
        brand: 'Tac',
        currentPrice: 3990,
        costPrice: 1800,
        rating: 4.5,
        reviewCount: 124
      },

      // Детские товары
      {
        id: 'product-12',
        name: 'Конструктор LEGO Star Wars',
        category: 'Детские товары',
        subcategory: 'Игрушки и игры',
        brand: 'LEGO',
        currentPrice: 7990,
        costPrice: 4200,
        rating: 4.9,
        reviewCount: 87
      },

      // Продукты питания
      {
        id: 'product-13',
        name: 'Кофе в зернах Lavazza Crema e Aroma',
        category: 'Продукты питания',
        subcategory: 'Чай и кофе',
        brand: 'Lavazza',
        currentPrice: 1290,
        costPrice: 650,
        rating: 4.7,
        reviewCount: 203
      },

      // Спорт и отдых
      {
        id: 'product-14',
        name: 'Велосипед горный Merida Big.Nine',
        category: 'Спорт и отдых',
        subcategory: 'Велосипеды и самокаты',
        brand: 'Merida',
        currentPrice: 54990,
        costPrice: 32000,
        rating: 4.8,
        reviewCount: 34
      },

      // Книги
      {
        id: 'product-15',
        name: 'Книга "Гарри Поттер и философский камень"',
        category: 'Книги',
        subcategory: 'Художественная литература',
        brand: 'Росмэн',
        currentPrice: 790,
        costPrice: 350,
        rating: 4.9,
        reviewCount: 456
      }
    ];

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для получения информации о конкретном товаре
app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;

    // В реальном приложении здесь будет запрос к базе данных
    // Для демонстрации используем тестовые данные
    // Получаем список всех товаров
    const allProducts = [
      // Электроника
      {
        id: 'product-1',
        name: 'Смартфон Samsung Galaxy S21',
        category: 'Электроника',
        subcategory: 'Смартфоны и телефоны',
        brand: 'Samsung',
        currentPrice: 59990,
        costPrice: 35000,
        rating: 4.7,
        reviewCount: 128
      },
      {
        id: 'product-2',
        name: 'Ноутбук Apple MacBook Air',
        category: 'Электроника',
        subcategory: 'Ноутбуки и компьютеры',
        brand: 'Apple',
        currentPrice: 89990,
        costPrice: 65000,
        rating: 4.9,
        reviewCount: 256
      },
      {
        id: 'product-3',
        name: 'Наушники Sony WH-1000XM4',
        category: 'Электроника',
        subcategory: 'Аксессуары и комплектующие',
        brand: 'Sony',
        currentPrice: 27990,
        costPrice: 15000,
        rating: 4.8,
        reviewCount: 189
      },
      {
        id: 'product-4',
        name: 'Умные часы Apple Watch Series 7',
        category: 'Электроника',
        subcategory: 'Умные часы и браслеты',
        brand: 'Apple',
        currentPrice: 36990,
        costPrice: 22000,
        rating: 4.6,
        reviewCount: 112
      },
      {
        id: 'product-5',
        name: 'Планшет Samsung Galaxy Tab S7',
        category: 'Электроника',
        subcategory: 'Планшеты и электронные книги',
        brand: 'Samsung',
        currentPrice: 49990,
        costPrice: 30000,
        rating: 4.5,
        reviewCount: 95
      },

      // Одежда и обувь
      {
        id: 'product-6',
        name: 'Куртка зимняя Columbia',
        category: 'Одежда, обувь и аксессуары',
        subcategory: 'Мужская одежда',
        brand: 'Columbia',
        currentPrice: 12990,
        costPrice: 7500,
        rating: 4.6,
        reviewCount: 87
      },
      {
        id: 'product-7',
        name: 'Кроссовки Nike Air Max',
        category: 'Одежда, обувь и аксессуары',
        subcategory: 'Мужская обувь',
        brand: 'Nike',
        currentPrice: 8990,
        costPrice: 4500,
        rating: 4.8,
        reviewCount: 156
      },

      // Красота и здоровье
      {
        id: 'product-8',
        name: 'Парфюмерная вода Chanel Coco Mademoiselle',
        category: 'Красота и здоровье',
        subcategory: 'Парфюмерия',
        brand: 'Chanel',
        currentPrice: 9890,
        costPrice: 5200,
        rating: 4.9,
        reviewCount: 312
      },
      {
        id: 'product-9',
        name: 'Набор косметики для лица Clinique',
        category: 'Красота и здоровье',
        subcategory: 'Уход за лицом',
        brand: 'Clinique',
        currentPrice: 5490,
        costPrice: 2800,
        rating: 4.7,
        reviewCount: 78
      },

      // Дом и сад
      {
        id: 'product-10',
        name: 'Диван-кровать IKEA БЕДИНГЕ',
        category: 'Дом и сад',
        subcategory: 'Мебель',
        brand: 'IKEA',
        currentPrice: 24990,
        costPrice: 15000,
        rating: 4.3,
        reviewCount: 45
      },
      {
        id: 'product-11',
        name: 'Комплект постельного белья Tac',
        category: 'Дом и сад',
        subcategory: 'Текстиль',
        brand: 'Tac',
        currentPrice: 3990,
        costPrice: 1800,
        rating: 4.5,
        reviewCount: 124
      },

      // Детские товары
      {
        id: 'product-12',
        name: 'Конструктор LEGO Star Wars',
        category: 'Детские товары',
        subcategory: 'Игрушки и игры',
        brand: 'LEGO',
        currentPrice: 7990,
        costPrice: 4200,
        rating: 4.9,
        reviewCount: 87
      },

      // Продукты питания
      {
        id: 'product-13',
        name: 'Кофе в зернах Lavazza Crema e Aroma',
        category: 'Продукты питания',
        subcategory: 'Чай и кофе',
        brand: 'Lavazza',
        currentPrice: 1290,
        costPrice: 650,
        rating: 4.7,
        reviewCount: 203
      },

      // Спорт и отдых
      {
        id: 'product-14',
        name: 'Велосипед горный Merida Big.Nine',
        category: 'Спорт и отдых',
        subcategory: 'Велосипеды и самокаты',
        brand: 'Merida',
        currentPrice: 54990,
        costPrice: 32000,
        rating: 4.8,
        reviewCount: 34
      },

      // Книги
      {
        id: 'product-15',
        name: 'Книга "Гарри Поттер и философский камень"',
        category: 'Книги',
        subcategory: 'Художественная литература',
        brand: 'Росмэн',
        currentPrice: 790,
        costPrice: 350,
        rating: 4.9,
        reviewCount: 456
      }
    ];

    // Преобразуем массив в объект для быстрого поиска по ID
    const products = {};
    allProducts.forEach(product => {
      products[product.id] = product;
    });

    const product = products[id];

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для автоматического поиска конкурентов
app.post('/api/fetch-competitors', async (req, res) => {
  try {
    const { productName, category, brand } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // В реальном приложении здесь будет запрос к API маркетплейса или парсинг данных
    // Для демонстрации генерируем тестовые данные

    // Имитация задержки запроса
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Генерация случайных конкурентов
    const generateCompetitors = (count, basePrice) => {
      const competitors = [];
      const brands = ['Samsung', 'Apple', 'Sony', 'Xiaomi', 'Huawei', 'LG', 'Asus', 'Lenovo', 'HP', 'Dell'];
      const brandToExclude = brand || '';

      for (let i = 0; i < count; i++) {
        // Выбираем бренд, отличный от исходного товара
        let competitorBrand;
        do {
          competitorBrand = brands[Math.floor(Math.random() * brands.length)];
        } while (competitorBrand === brandToExclude);

        // Генерируем случайную цену в диапазоне ±20% от базовой
        const priceVariation = basePrice * (0.8 + Math.random() * 0.4);
        const price = Math.round(priceVariation / 10) * 10; // Округляем до десятков

        // Генерируем случайный рейтинг и количество отзывов
        const rating = (3.5 + Math.random() * 1.5).toFixed(1);
        const reviewCount = Math.floor(Math.random() * 200) + 10;

        competitors.push({
          name: `${competitorBrand} ${category} ${i + 1}`,
          price,
          rating: parseFloat(rating),
          reviewCount
        });
      }

      return competitors;
    };

    const basePrice = Math.floor(Math.random() * 50000) + 10000;
    const competitors = generateCompetitors(5, basePrice);

    // Рассчитываем статистику по ценам
    const prices = competitors.map(c => c.price);
    const categoryAvgPrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    res.json({
      success: true,
      competitors,
      categoryAvgPrice,
      minPrice,
      maxPrice
    });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для планирования регулярного анализа
app.post('/api/schedule-analysis', (req, res) => {
  try {
    const { productId, frequency, time, userId } = req.body;

    if (!productId || !frequency || !time) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // В реальном приложении здесь будет сохранение задачи в базу данных и настройка планировщика
    // Для демонстрации просто логируем данные и возвращаем успешный результат
    console.log(`Scheduled analysis for product ${productId} with frequency ${frequency} at ${time} for user ${userId || 'anonymous'}`);

    res.json({
      success: true,
      message: 'Analysis scheduled successfully',
      schedule: {
        productId,
        frequency,
        time,
        userId,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Следующий запуск через 24 часа
      }
    });
  } catch (error) {
    console.error('Error scheduling analysis:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API-эндпоинт для пакетного анализа товаров
app.post('/api/batch-analyze', (req, res) => {
  try {
    const { productIds, userId } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing or invalid product IDs' });
    }

    // В реальном приложении здесь будет запуск фоновой задачи для анализа всех товаров
    // Для демонстрации просто логируем данные и возвращаем успешный результат
    console.log(`Batch analysis started for ${productIds.length} products for user ${userId || 'anonymous'}`);
    console.log('Products:', productIds);

    res.json({
      success: true,
      message: 'Batch analysis started',
      jobId: `batch-${Date.now()}`,
      productCount: productIds.length,
      estimatedCompletionTime: new Date(Date.now() + productIds.length * 30 * 1000).toISOString() // Примерно 30 секунд на товар
    });
  } catch (error) {
    console.error('Error starting batch analysis:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== API ENDPOINTS ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ ====================

// Middleware для аутентификации API
const authenticateAPI = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const user = await User.findByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// API для получения информации о пользователе
app.get('/api/user/profile', authenticateAPI, async (req, res) => {
  try {
    const stats = await req.user.getStats();
    res.json({
      user: req.user.toJSON(),
      stats
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// API для получения товаров пользователя
app.get('/api/products', authenticateAPI, async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      search = '',
      category_id = null,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const products = await Product.findByUserId(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      search,
      category_id,
      sort_by,
      sort_order
    });

    res.json({
      products,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: products.length
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// API для создания нового товара
app.post('/api/products', authenticateAPI, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      user_id: req.user.id
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// API для получения конкретного товара
app.get('/api/products/:id', authenticateAPI, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const competitors = await product.getCompetitors();
    const priceHistory = await product.getPriceHistory(20);
    const analytics = await product.getAnalytics(30);

    res.json({
      product,
      competitors,
      priceHistory,
      analytics
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// API для обновления цены товара
app.put('/api/products/:id/price', authenticateAPI, async (req, res) => {
  try {
    const { price, reason = 'manual' } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const product = await Product.findById(req.params.id);

    if (!product || product.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.updatePrice(price, reason, req.user.id);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// API для получения доступных слотов поставок
app.get('/api/delivery-slots', authenticateAPI, async (req, res) => {
  try {
    const filters = {
      warehouse_id: req.query.warehouse_id,
      warehouse_region: req.query.warehouse_region,
      slot_type: req.query.slot_type,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      min_capacity: req.query.min_capacity ? parseInt(req.query.min_capacity) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      priority: req.query.priority,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      sort_by: req.query.sort_by || 'slot_date',
      sort_order: req.query.sort_order || 'ASC'
    };

    const slots = await DeliverySlot.findAvailable(filters);
    res.json({ slots });
  } catch (error) {
    console.error('Error getting delivery slots:', error);
    res.status(500).json({ error: 'Failed to get delivery slots' });
  }
});

// API для бронирования слота
app.post('/api/delivery-slots/:id/book', authenticateAPI, async (req, res) => {
  try {
    const { notes = '' } = req.body;
    const slot = await DeliverySlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    const booking = await slot.book(req.user.id, notes);
    res.json(booking);
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: error.message || 'Failed to book slot' });
  }
});

// API для получения складов
app.get('/api/warehouses', authenticateAPI, async (req, res) => {
  try {
    const warehouses = await DeliverySlot.getWarehouses();
    res.json({ warehouses });
  } catch (error) {
    console.error('Error getting warehouses:', error);
    res.status(500).json({ error: 'Failed to get warehouses' });
  }
});

// API для получения статистики по датам
app.get('/api/delivery-slots/stats', authenticateAPI, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 14;
    const stats = await DeliverySlot.getDateStats(days);
    res.json({ stats });
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    res.status(500).json({ error: 'Failed to get delivery stats' });
  }
});

// API для автоматического обновления цен
app.post('/api/products/auto-price-update', authenticateAPI, async (req, res) => {
  try {
    const products = await Product.findByUserId(req.user.id, {
      limit: 1000 // Получаем все товары пользователя
    });

    const updatedProducts = [];

    for (const product of products) {
      if (product.auto_pricing_enabled && product.needsPriceUpdate()) {
        await product.calculateRecommendedPrice();

        if (product.recommended_price > 0) {
          await product.updatePrice(
            product.recommended_price,
            'automatic_optimization',
            req.user.id
          );
          updatedProducts.push(product);
        }
      }
    }

    res.json({
      success: true,
      updatedCount: updatedProducts.length,
      products: updatedProducts
    });
  } catch (error) {
    console.error('Error in auto price update:', error);
    res.status(500).json({ error: 'Failed to update prices automatically' });
  }
});

// ==================== API ENDPOINTS ДЛЯ СЕРВИСОВ ====================

// API для управления сервисом ценообразования
app.get('/api/pricing/status', authenticateAPI, (req, res) => {
  try {
    const stats = pricingService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting pricing status:', error);
    res.status(500).json({ error: 'Failed to get pricing status' });
  }
});

app.post('/api/pricing/start', authenticateAPI, (req, res) => {
  try {
    pricingService.start();
    res.json({ success: true, message: 'Pricing service started' });
  } catch (error) {
    console.error('Error starting pricing service:', error);
    res.status(500).json({ error: 'Failed to start pricing service' });
  }
});

app.post('/api/pricing/stop', authenticateAPI, (req, res) => {
  try {
    pricingService.stop();
    res.json({ success: true, message: 'Pricing service stopped' });
  } catch (error) {
    console.error('Error stopping pricing service:', error);
    res.status(500).json({ error: 'Failed to stop pricing service' });
  }
});

app.post('/api/pricing/force-update', authenticateAPI, async (req, res) => {
  try {
    const result = await pricingService.forceUpdateUser(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error in force update:', error);
    res.status(500).json({ error: 'Failed to force update prices' });
  }
});

app.get('/api/pricing/effectiveness', authenticateAPI, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const effectiveness = await pricingService.analyzeEffectiveness(req.user.id, days);
    res.json(effectiveness);
  } catch (error) {
    console.error('Error getting pricing effectiveness:', error);
    res.status(500).json({ error: 'Failed to get pricing effectiveness' });
  }
});

// API для аналитики
app.get('/api/analytics/dashboard', authenticateAPI, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const dashboard = await analyticsService.getUserDashboard(req.user.id, days);
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to get analytics dashboard' });
  }
});

app.get('/api/analytics/forecast', authenticateAPI, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const forecast = await analyticsService.getSalesForecast(req.user.id, days);
    res.json(forecast);
  } catch (error) {
    console.error('Error getting sales forecast:', error);
    res.status(500).json({ error: 'Failed to get sales forecast' });
  }
});

app.post('/api/analytics/record', authenticateAPI, async (req, res) => {
  try {
    const { productId, metricType, value, additionalData } = req.body;

    if (!productId || !metricType || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const success = await analyticsService.recordMetric(
      req.user.id,
      productId,
      metricType,
      value,
      additionalData
    );

    if (success) {
      res.json({ success: true, message: 'Metric recorded successfully' });
    } else {
      res.status(500).json({ error: 'Failed to record metric' });
    }
  } catch (error) {
    console.error('Error recording metric:', error);
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

app.delete('/api/analytics/cache', authenticateAPI, (req, res) => {
  try {
    analyticsService.clearUserCache(req.user.id);
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// API для системной информации
app.get('/api/system/status', authenticateAPI, async (req, res) => {
  try {
    const pricingStats = pricingService.getStats();
    const cacheStats = analyticsService.getCacheStats();

    res.json({
      database: {
        connected: true,
        timestamp: new Date()
      },
      pricing: pricingStats,
      analytics: {
        cache: cacheStats
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// ==================== ВЕБ-МАРШРУТЫ ====================

// Главная страница
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ozon Price Optimizer Pro</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                max-width: 800px;
                padding: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            .subtitle {
                font-size: 1.2em;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .feature h3 {
                margin-top: 0;
                color: #ffd700;
            }
            .api-section {
                margin-top: 40px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 15px;
            }
            .api-endpoint {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px;
                margin: 10px 0;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                text-align: left;
            }
            .status {
                display: inline-block;
                padding: 5px 15px;
                background: #4CAF50;
                border-radius: 20px;
                font-size: 0.9em;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Ozon Price Optimizer Pro</h1>
            <div class="status">✅ Сервер работает</div>
            <p class="subtitle">Профессиональная система автоматизации ценообразования для продавцов Ozon</p>

            <div class="features">
                <div class="feature">
                    <h3>🤖 Автоматическое ценообразование</h3>
                    <p>ИИ-алгоритмы для оптимизации цен в реальном времени</p>
                </div>
                <div class="feature">
                    <h3>📊 Аналитика и прогнозы</h3>
                    <p>Детальная аналитика продаж и прогнозирование трендов</p>
                </div>
                <div class="feature">
                    <h3>🔔 Telegram уведомления</h3>
                    <p>Мгновенные уведомления о важных событиях</p>
                </div>
                <div class="feature">
                    <h3>📦 Управление поставками</h3>
                    <p>Мониторинг и бронирование слотов поставок</p>
                </div>
            </div>

            <div class="api-section">
                <h3>🔗 API Endpoints</h3>
                <div class="api-endpoint">GET /api/products - Список товаров</div>
                <div class="api-endpoint">GET /api/delivery-slots - Слоты поставок</div>
                <div class="api-endpoint">GET /api/analytics/dashboard - Аналитика</div>
                <div class="api-endpoint">GET /api/system/status - Статус системы</div>
                <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
                    Для доступа к API используйте заголовок: <code>X-API-Key: test_api_key_12345</code>
                </p>
            </div>

            <div style="margin-top: 40px;">
                <h3>📱 Telegram Bot</h3>
                <p>Пароль для доступа: <strong>ozonpro2025</strong></p>
                <p style="font-size: 0.9em; opacity: 0.8;">
                    Найдите бота по токену и начните работу с командой /start
                </p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// API документация
app.get('/api', (req, res) => {
  res.json({
    name: 'Ozon Price Optimizer Pro API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      products: '/api/products',
      deliverySlots: '/api/delivery-slots',
      analytics: '/api/analytics/dashboard',
      system: '/api/system/status'
    },
    authentication: 'X-API-Key header required',
    testApiKey: 'test_api_key_12345'
  });
});

// Функция корректного завершения работы
async function gracefulShutdown() {
  console.log('Received shutdown signal, closing server and bot...');

  try {
    // Останавливаем сервисы
    pricingService.stop();
    console.log('Pricing service stopped');

    // Останавливаем поллинг бота
    await bot.stopPolling();
    console.log('Bot polling stopped');

    // Закрываем пул соединений с базой данных
    try {
      const dbConfig = await initializeDatabase();
      await dbConfig.closePool();
      console.log('Database connections closed');
    } catch (error) {
      console.log('Database already closed or not initialized');
    }

    // Закрываем HTTP-сервер
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Если сервер не закрылся за 10 секунд, принудительно завершаем процесс
    setTimeout(() => {
      console.log('Forcing process exit after timeout');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}
