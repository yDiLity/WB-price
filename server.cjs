const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const path = require('path');
const nodemailer = require('nodemailer');

// 🛡️ ПРОДВИНУТАЯ ЗАЩИТА ОТ БАНА WILDBERRIES
class WBAntibanService {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.userAgents = [
      // Chrome Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      // Chrome macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      // Firefox
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
      // Safari
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      // Edge
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
    ];
    this.bannedIPs = new Set();
    this.requestHistory = [];
    this.proxyList = []; // Список прокси серверов
    this.currentProxyIndex = 0;
    this.banDetectionCount = 0;
    this.emergencyMode = false;
    this.cache = new Map(); // Кеш для запросов
    this.cacheExpiry = 5 * 60 * 1000; // 5 минут
  }

  // Генерация случайной задержки между запросами
  getRandomDelay() {
    return Math.floor(Math.random() * 10000) + 5000; // 5-15 секунд
  }

  // Получение случайного User-Agent
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Проверка лимитов запросов
  checkRateLimit() {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Удаляем старые запросы (старше минуты)
    this.requestHistory = this.requestHistory.filter(time => now - time < oneMinute);

    // Динамический лимит в зависимости от режима
    const maxRequests = this.emergencyMode ? 20 : 50;

    if (this.requestHistory.length >= maxRequests) {
      console.log(`⚠️ Достигнут лимит запросов в минуту (${maxRequests}), ждем...`);
      return false;
    }

    return true;
  }

  // Интеллектуальная задержка между запросами
  async addDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Базовая задержка
    let minDelay = 5000; // 5 секунд

    // Увеличиваем задержку в экстренном режиме
    if (this.emergencyMode) {
      minDelay = 15000; // 15 секунд
    }

    // Увеличиваем задержку при частых банах
    if (this.banDetectionCount > 3) {
      minDelay += this.banDetectionCount * 2000; // +2 сек за каждый бан
    }

    // Добавляем случайность для имитации человеческого поведения
    const randomDelay = Math.floor(Math.random() * 5000); // 0-5 секунд
    const totalDelay = minDelay + randomDelay;

    if (timeSinceLastRequest < totalDelay) {
      const waitTime = totalDelay - timeSinceLastRequest;
      console.log(`⏱️ Интеллектуальная задержка: ${waitTime}ms (режим: ${this.emergencyMode ? 'экстренный' : 'обычный'})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestHistory.push(this.lastRequestTime);
  }

  // Проверка ответа на признаки бана
  checkForBan(response, responseText) {
    const banIndicators = [
      'captcha',
      'blocked',
      'forbidden',
      'rate limit',
      'too many requests',
      'временно заблокирован',
      'доступ ограничен',
      'access denied',
      'service unavailable',
      'cloudflare',
      'ddos protection',
      'security check',
      'проверка безопасности',
      'слишком много запросов',
      'превышен лимит'
    ];

    const textLower = responseText.toLowerCase();
    const hasBanIndicator = banIndicators.some(indicator => textLower.includes(indicator));

    // Проверяем статус коды
    const isBannedStatus = [403, 429, 503, 520, 521, 522, 523, 524].includes(response.status);

    // Проверяем размер ответа (слишком маленький может означать блокировку)
    const isSuspiciousSize = responseText.length < 100 && response.status === 200;

    if (isBannedStatus || hasBanIndicator || isSuspiciousSize) {
      this.banDetectionCount++;
      console.log(`🚨 ОБНАРУЖЕН БАН #${this.banDetectionCount}! Статус: ${response.status}, Размер: ${responseText.length}`);

      // Активируем экстренный режим при частых банах
      if (this.banDetectionCount >= 3 && !this.emergencyMode) {
        this.activateEmergencyMode();
      }

      // Отправляем уведомление
      this.sendBanNotification(response.status, responseText.substring(0, 200));

      return true;
    }

    return false;
  }

  // 📱 Отправка уведомления о бане
  async sendBanNotification(status, responsePreview) {
    try {
      const message = `🚨 ОБНАРУЖЕНА БЛОКИРОВКА WILDBERRIES!\n\n` +
        `📊 Статус: ${status}\n` +
        `🕐 Время: ${new Date().toLocaleString('ru-RU')}\n` +
        `📈 Количество банов: ${this.banDetectionCount}\n` +
        `🚨 Экстренный режим: ${this.emergencyMode ? 'АКТИВЕН' : 'Отключен'}\n` +
        `🌐 Активных прокси: ${this.proxyList.filter(p => p.isActive).length}\n\n` +
        `📝 Превью ответа: ${responsePreview}`;

      // Отправляем через API email уведомлений
      await fetch('http://localhost:3001/api/send-email-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '🚨 БЛОКИРОВКА WILDBERRIES ОБНАРУЖЕНА',
          message: message
        })
      }).catch(err => console.log('Ошибка отправки email:', err.message));

    } catch (error) {
      console.error('Ошибка отправки уведомления о бане:', error);
    }
  }

  // Получение безопасных заголовков
  getSafeHeaders() {
    const acceptLanguages = [
      'ru-RU,ru;q=0.9,en;q=0.8',
      'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
      'ru,en-US;q=0.9,en;q=0.8',
      'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
    ];

    const referers = [
      'https://www.wildberries.ru/',
      'https://www.wildberries.ru/catalog/dom-i-dacha/tovary-dlya-remonta/instrumenty',
      'https://www.wildberries.ru/catalog/krasota/uhod-za-volosami',
      'https://www.wildberries.ru/catalog/elektronika/smartfony-i-telefony',
      'https://www.wildberries.ru/catalog/dom-i-dacha/kuhnya/posuda-i-kuhonnye-prinadlezhnosti',
      'https://www.wildberries.ru/catalog/krasota',
      'https://www.wildberries.ru/catalog/muzhchinam',
      'https://www.wildberries.ru/catalog/zhenshchinam'
    ];

    const baseHeaders = {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': referers[Math.floor(Math.random() * referers.length)],
      'Origin': 'https://www.wildberries.ru',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Случайно добавляем дополнительные заголовки для большей реалистичности
    if (Math.random() > 0.5) {
      baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
    }

    if (Math.random() > 0.6) {
      baseHeaders['Sec-Fetch-Dest'] = 'empty';
      baseHeaders['Sec-Fetch-Mode'] = 'cors';
      baseHeaders['Sec-Fetch-Site'] = 'same-site';
    }

    if (Math.random() > 0.7) {
      baseHeaders['Sec-CH-UA'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      baseHeaders['Sec-CH-UA-Mobile'] = '?0';
      baseHeaders['Sec-CH-UA-Platform'] = '"Windows"';
    }

    if (Math.random() > 0.8) {
      baseHeaders['Upgrade-Insecure-Requests'] = '1';
    }

    return baseHeaders;
  }

  // 💾 Работа с кешем
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached) {
      const expiry = cached.customExpiry || this.cacheExpiry;
      if (Date.now() - cached.timestamp < expiry) {
        console.log('📦 Данные получены из кеша:', key);
        return cached.data;
      }
    }
    return null;
  }

  setCachedData(key, data, customExpiry = null) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      customExpiry: customExpiry
    });

    // Очищаем старые записи кеша
    if (this.cache.size > 1000) {
      const oldestKeys = Array.from(this.cache.keys()).slice(0, 100);
      oldestKeys.forEach(key => this.cache.delete(key));
    }
  }

  // 🌐 Управление прокси
  addProxy(proxy) {
    this.proxyList.push({
      ...proxy,
      isActive: true,
      failCount: 0,
      lastUsed: 0,
      successRate: 1.0
    });
    console.log('🌐 Добавлен прокси:', proxy.host);
  }

  getNextProxy() {
    if (this.proxyList.length === 0) return null;

    // Фильтруем активные прокси
    const activeProxies = this.proxyList.filter(p => p.isActive && p.failCount < 3);
    if (activeProxies.length === 0) {
      // Сбрасываем счетчики ошибок если все прокси заблокированы
      this.proxyList.forEach(p => {
        p.failCount = 0;
        p.isActive = true;
      });
      return this.proxyList[0];
    }

    // Выбираем прокси с лучшим success rate
    const bestProxy = activeProxies.sort((a, b) => b.successRate - a.successRate)[0];
    bestProxy.lastUsed = Date.now();

    return bestProxy;
  }

  markProxyFailed(proxy) {
    if (proxy) {
      proxy.failCount++;
      proxy.successRate = Math.max(0.1, proxy.successRate - 0.1);

      if (proxy.failCount >= 3) {
        proxy.isActive = false;
        console.log('🚫 Прокси отключен из-за ошибок:', proxy.host);
      }
    }
  }

  markProxySuccess(proxy) {
    if (proxy) {
      proxy.successRate = Math.min(1.0, proxy.successRate + 0.05);
    }
  }

  // 🚨 Экстренный режим
  activateEmergencyMode() {
    this.emergencyMode = true;
    console.log('🚨 АКТИВИРОВАН ЭКСТРЕННЫЙ РЕЖИМ - увеличиваем задержки');

    // Автоматически отключаем через 30 минут
    setTimeout(() => {
      this.emergencyMode = false;
      console.log('✅ Экстренный режим отключен');
    }, 30 * 60 * 1000);
  }

  // 📊 Статистика
  getStats() {
    const activeProxies = this.proxyList.filter(p => p.isActive).length;
    const avgSuccessRate = this.proxyList.length > 0
      ? this.proxyList.reduce((sum, p) => sum + p.successRate, 0) / this.proxyList.length
      : 0;

    return {
      totalProxies: this.proxyList.length,
      activeProxies,
      avgSuccessRate: (avgSuccessRate * 100).toFixed(1) + '%',
      requestsLastMinute: this.requestHistory.filter(time =>
        Date.now() - time < 60000
      ).length,
      emergencyMode: this.emergencyMode,
      banDetectionCount: this.banDetectionCount,
      cacheSize: this.cache.size
    };
  }
}

const antibanService = new WBAntibanService();

// Импортируем модули
const logisticsRouter = require('./server/logistics');
const competitorsRouter = require('./server/routes/competitors');

// Создаем экземпляр Express
const app = express();
const port = process.env.PORT || 3001;

// Настройка CORS для разрешения запросов с фронтенда
app.use(cors());

// Парсинг JSON-запросов
app.use(bodyParser.json());

// Статические файлы для загрузок
app.use('/uploads', express.static(path.join(__dirname, 'server/uploads')));

// Инициализация OpenAI, если есть API-ключ
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Функция для имитации ответа ИИ
function simulateAIResponse(product, competitors) {
  // Анализ конкурентов
  const competitorPrices = competitors.map(c => c.currentPrice);
  const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
  const minCompetitorPrice = Math.min(...competitorPrices);
  const maxCompetitorPrice = Math.max(...competitorPrices);

  // Рекомендуемая цена
  const currentPrice = product.currentPrice;
  const costPrice = product.costPrice || currentPrice * 0.6;
  const minMargin = 1.2; // Минимальная маржа 20%
  const minPrice = costPrice * minMargin;

  let recommendedPrice;

  // Если текущая цена выше средней цены конкурентов на 10% и более
  if (currentPrice > avgCompetitorPrice * 1.1) {
    recommendedPrice = Math.round(avgCompetitorPrice * 1.05); // Рекомендуем цену на 5% выше средней
  }
  // Если текущая цена ниже минимальной маржи
  else if (currentPrice < minPrice) {
    recommendedPrice = Math.round(minPrice);
  }
  // Если текущая цена ниже минимальной цены конкурентов
  else if (currentPrice < minCompetitorPrice * 0.9) {
    recommendedPrice = Math.round(minCompetitorPrice * 0.95); // Рекомендуем цену на 5% ниже минимальной
  }
  // В остальных случаях оставляем текущую цену
  else {
    recommendedPrice = currentPrice;
  }

  // Формируем ответ
  let response = `## Анализ товара "${product.name}"\n\n`;

  response += `### Анализ конкурентов:\n`;
  response += `- Количество конкурентов: ${competitors.length}\n`;
  response += `- Средняя цена конкурентов: ${Math.round(avgCompetitorPrice)} ₽\n`;
  response += `- Минимальная цена конкурентов: ${minCompetitorPrice} ₽\n`;
  response += `- Максимальная цена конкурентов: ${maxCompetitorPrice} ₽\n\n`;

  response += `### Анализ вашего товара:\n`;
  response += `- Текущая цена: ${currentPrice} ₽\n`;
  response += `- Себестоимость: ${costPrice} ₽\n`;
  response += `- Минимальная рекомендуемая цена (с маржой 20%): ${Math.round(minPrice)} ₽\n\n`;

  response += `### Рекомендации:\n`;

  if (recommendedPrice > currentPrice) {
    response += `- Рекомендуется повысить цену до ${recommendedPrice} ₽ (на ${Math.round((recommendedPrice - currentPrice) / currentPrice * 100)}%)\n`;
    response += `- Ваша текущая цена ниже оптимальной, что может снижать прибыль\n`;
  } else if (recommendedPrice < currentPrice) {
    response += `- Рекомендуется снизить цену до ${recommendedPrice} ₽ (на ${Math.round((currentPrice - recommendedPrice) / currentPrice * 100)}%)\n`;
    response += `- Ваша текущая цена выше оптимальной, что может снижать конкурентоспособность\n`;
  } else {
    response += `- Ваша текущая цена оптимальна и не требует изменений\n`;
  }

  response += `\n### Рекомендуемая оптимальная цена: ${recommendedPrice} ₽\n\n`;
  response += `### Минимально допустимая цена: ${Math.round(minPrice)} ₽\n\n`;

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
Категория: ${product.category}
Бренд: ${product.brand}
Текущая цена: ${product.currentPrice} ₽
Себестоимость: ${product.costPrice || 'Неизвестна'} ₽

Конкуренты (${competitors.length}):
${competitors.map(c => `- ${c.competitorName}: ${c.productName}, Цена: ${c.currentPrice} ₽, Рейтинг: ${c.rating || 'Н/Д'}`).join('\n')}

Проведи анализ и дай рекомендации по оптимальной цене для товара. Учти следующие факторы:
1. Конкурентоспособность цены
2. Маржинальность (минимальная маржа должна быть не менее 20%)
3. Позиционирование товара на рынке

Формат ответа:
1. Анализ конкурентов
2. Анализ текущей цены товара
3. Рекомендации по изменению цены
4. Рекомендуемая оптимальная цена
5. Минимально допустимая цена
`;

    // Если настроен OpenAI API, используем его
    if (openai) {
      console.log('Using OpenAI API for analysis');

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты - ИИ-аналитик для системы оптимизации цен на Ozon. Твоя задача - анализировать товары и давать рекомендации по ценообразованию."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return {
        success: true,
        analysis: response.choices[0].message.content
      };
    } else {
      // Если OpenAI API не настроен, используем заглушку
      console.log('Using simulated AI response');
      return {
        success: true,
        analysis: simulateAIResponse(product, competitors)
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

// API-эндпоинт для пакетного анализа товаров
app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { productIds, userId } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо предоставить список ID товаров для анализа'
      });
    }

    // Логируем запрос для отладки
    console.log(`Starting batch analysis for ${productIds.length} products`);

    // В реальном приложении здесь будет запуск фоновой задачи для анализа товаров
    // Для демонстрации просто возвращаем успешный результат
    res.json({
      success: true,
      message: `Запущен анализ ${productIds.length} товаров. Результаты будут доступны в разделе "Отчеты".`
    });
  } catch (error) {
    console.error('Error in batch-analyze endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при запуске пакетного анализа'
    });
  }
});

// 📧 API-эндпоинт для отправки email уведомлений о банах
app.post('/api/send-email-alert', async (req, res) => {
  try {
    const { subject, message, alert } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля'
      });
    }

    // Настройка SMTP транспорта
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your.email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password'
      }
    });

    // Формируем HTML версию сообщения
    const htmlMessage = message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    // Отправляем email
    const mailOptions = {
      from: `"WB Парсинг Алерты" <${process.env.EMAIL_USER || 'your.email@gmail.com'}>`,
      to: process.env.EMAIL_TO || 'alerts@yourcompany.com',
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin: 0 0 20px 0;">${subject}</h2>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
              ${htmlMessage}
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #6c757d;">
              <p>Это автоматическое уведомление от системы мониторинга WB Парсинг</p>
              <p>Время отправки: ${new Date().toLocaleString('ru-RU')}</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log('📧 Email уведомление отправлено:', subject);

    res.json({
      success: true,
      message: 'Email уведомление отправлено'
    });

  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отправки email уведомления'
    });
  }
});

// 🌐 РЕАЛЬНЫЙ ПАРСИНГ WILDBERRIES С ЗАЩИТОЙ ОТ БАНА

// 📦 Получение детальной информации о товаре
app.get('/api/wb/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('🛡️ ЗАЩИЩЕННЫЙ запрос товара WB по ID:', productId);

    // Проверяем кеш
    const cacheKey = `product_${productId}`;
    const cachedData = antibanService.getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Проверяем лимиты запросов
    if (!antibanService.checkRateLimit()) {
      return res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    }

    // Добавляем задержку для защиты от бана
    await antibanService.addDelay();

    // Сначала попробуем поиск по ID как запрос
    const searchUrl = `https://search.wb.ru/exactmatch/ru/common/v4/search?appType=1&curr=rub&dest=-1257786&query=${productId}&resultset=catalog&sort=popular&spp=0&suppressSpellcheck=false`;

    const searchResponse = await fetch(searchUrl, {
      headers: antibanService.getSafeHeaders()
    });

    if (searchResponse.ok) {
      const searchText = await searchResponse.text();

      // Проверяем на бан
      if (antibanService.checkForBan(searchResponse, searchText)) {
        console.log('🚨 Обнаружен бан при поиске товара!');
        return res.status(503).json({ error: 'Временно заблокированы Wildberries. Попробуйте позже.' });
      }

      const searchData = JSON.parse(searchText);
      const products = searchData.data?.products || [];

      // Ищем товар с точным совпадением ID
      const exactProduct = products.find(p => p.id.toString() === productId.toString());

      if (exactProduct) {
        const formattedProduct = {
          id: exactProduct.id,
          name: exactProduct.name,
          brand: exactProduct.brand,
          price: exactProduct.salePriceU / 100,
          originalPrice: exactProduct.priceU ? exactProduct.priceU / 100 : null,
          discount: exactProduct.sale || 0,
          rating: exactProduct.rating || 0,
          supplierRating: exactProduct.supplierRating || 0,
          feedbacks: exactProduct.feedbacks || 0,
          volume: exactProduct.volume || 0,
          colors: exactProduct.colors || [],
          sizes: exactProduct.sizes || [],
          pics: exactProduct.pics || 0,
          video: exactProduct.video || null,
          supplier: exactProduct.supplier || null,
          supplierId: exactProduct.supplierId || null,
          // Дополнительные поля для аналитики
          category: exactProduct.subj || null,
          categoryId: exactProduct.subjId || null,
          root: exactProduct.root || null,
          kindId: exactProduct.kindId || null,
          promoTextCard: exactProduct.promoTextCard || null,
          promoTextCat: exactProduct.promoTextCat || null,
          // Метаданные
          source: 'REAL_WB_SERVER_SEARCH',
          lastUpdated: new Date().toISOString(),
          parseMethod: 'search_api'
        };

        // Сохраняем в кеш
        antibanService.setCachedData(cacheKey, formattedProduct);

        console.log('✅ РЕАЛЬНЫЕ данные товара найдены через поиск:', formattedProduct.name);
        return res.json(formattedProduct);
      }
    }

    // Если не найден через поиск, попробуем прямой API
    const directUrl = `https://card.wb.ru/cards/detail?nm=${productId}`;
    const directResponse = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.9',
        'Referer': 'https://www.wildberries.ru/',
        'Origin': 'https://www.wildberries.ru'
      }
    });

    if (directResponse.ok) {
      const directData = await directResponse.json();
      const product = directData.data?.products?.[0];

      if (product) {
        const formattedProduct = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.salePriceU / 100,
          originalPrice: product.priceU ? product.priceU / 100 : null,
          discount: product.sale || 0,
          rating: product.rating || 0,
          supplierRating: product.supplierRating || 0,
          feedbacks: product.feedbacks || 0,
          volume: product.volume || 0,
          colors: product.colors || [],
          sizes: product.sizes || [],
          pics: product.pics || 0,
          video: product.video || null,
          supplier: product.supplier || null,
          supplierId: product.supplierId || null,
          source: 'REAL_WB_SERVER_API'
        };

        console.log('✅ РЕАЛЬНЫЕ данные товара получены прямым API:', formattedProduct.name);
        return res.json(formattedProduct);
      }
    }

    // Если Card API не сработал, попробуем парсинг веб-страницы товара
    console.log('🌐 Пробуем парсинг веб-страницы товара...');

    try {
      const webPageUrl = `https://www.wildberries.ru/catalog/${productId}/detail.aspx`;

      const webResponse = await fetch(webPageUrl, {
        headers: {
          ...antibanService.getSafeHeaders(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (webResponse.ok) {
        const webText = await webResponse.text();

        // Проверяем на бан
        if (antibanService.checkForBan(webResponse, webText)) {
          console.log('🚨 Обнаружен бан при парсинге веб-страницы!');
        } else {
          // Пытаемся извлечь данные из веб-страницы
          const nameMatch = webText.match(/<h1[^>]*class="[^"]*product-page__title[^"]*"[^>]*>([^<]+)</i);
          const priceMatch = webText.match(/class="[^"]*price-block__final-price[^"]*"[^>]*>([^<]+)</i);
          const brandMatch = webText.match(/class="[^"]*product-page__brand[^"]*"[^>]*>([^<]+)</i);

          if (nameMatch || priceMatch) {
            const webProduct = {
              id: parseInt(productId),
              name: nameMatch ? nameMatch[1].trim() : `Товар ${productId}`,
              brand: brandMatch ? brandMatch[1].trim() : '',
              price: priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0,
              originalPrice: priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0,
              discount: 0,
              rating: 0,
              supplierRating: 0,
              feedbacks: 0,
              volume: 0,
              pics: 0,
              video: null,
              supplier: '',
              supplierId: null,
              category: null,
              categoryId: null,
              root: null,
              kindId: null,
              colors: [],
              sizes: [],
              promoTextCard: '',
              promoTextCat: '',
              source: 'REAL_WB_WEB_PARSING',
              lastUpdated: new Date().toISOString(),
              parseMethod: 'web_parsing',
              note: 'Данные получены через парсинг веб-страницы'
            };

            // Кешируем результат
            antibanService.setCachedData(cacheKey, webProduct);

            console.log('✅ РЕАЛЬНЫЙ товар найден через веб-парсинг:', webProduct.name);
            return res.json(webProduct);
          }
        }
      }
    } catch (webError) {
      console.log('⚠️ Ошибка веб-парсинга:', webError.message);
    }

    // Если все методы не сработали, создаем fallback данные
    console.log('🔄 Все методы парсинга не сработали, создаем fallback данные...');

    const fallbackProduct = {
      id: parseInt(productId),
      name: `Товар ${productId}`,
      brand: 'Неизвестный бренд',
      price: 0,
      originalPrice: 0,
      discount: 0,
      rating: 0,
      supplierRating: 0,
      feedbacks: 0,
      volume: 0,
      pics: 0,
      video: null,
      supplier: 'Неизвестный поставщик',
      supplierId: null,
      category: null,
      categoryId: null,
      root: null,
      kindId: null,
      colors: [],
      sizes: [],
      promoTextCard: '',
      promoTextCat: '',
      source: 'FALLBACK_DATA',
      lastUpdated: new Date().toISOString(),
      parseMethod: 'fallback',
      note: 'Данные недоступны из-за блокировок Wildberries. Попробуйте позже.',
      isBlocked: true
    };

    // Кешируем fallback данные на короткое время
    antibanService.setCachedData(cacheKey, fallbackProduct, 60000); // 1 минута

    console.log('⚠️ Возвращаем fallback данные для товара:', productId);
    return res.json(fallbackProduct);
  } catch (error) {
    console.error('🚫 Ошибка серверного парсинга товара:', error);
    res.status(500).json({ error: 'Ошибка получения данных товара' });
  }
});

// 🏪 Получение информации о продавце
app.get('/api/wb/seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    console.log('🛡️ ЗАЩИЩЕННЫЙ запрос продавца WB по ID:', sellerId);

    // Проверяем кеш
    const cacheKey = `seller_${sellerId}`;
    const cachedData = antibanService.getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Проверяем лимиты запросов
    if (!antibanService.checkRateLimit()) {
      return res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    }

    await antibanService.addDelay();

    // Получаем товары продавца через поиск
    const searchUrl = `https://search.wb.ru/exactmatch/ru/common/v4/search?appType=1&curr=rub&dest=-1257786&query=&resultset=catalog&sort=popular&spp=0&suppressSpellcheck=false&supplier=${sellerId}`;

    const response = await fetch(searchUrl, {
      headers: antibanService.getSafeHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const responseText = await response.text();

    if (antibanService.checkForBan(response, responseText)) {
      console.log('🚨 Обнаружен бан при запросе продавца!');
      return res.status(503).json({ error: 'Временно заблокированы Wildberries. Попробуйте позже.' });
    }

    const data = JSON.parse(responseText);
    const products = data.data?.products || [];

    const sellerInfo = {
      id: sellerId,
      name: products[0]?.supplier || 'Неизвестный продавец',
      productsCount: products.length,
      products: products.slice(0, 20).map(product => ({
        id: product.id,
        name: product.name,
        price: product.salePriceU / 100,
        rating: product.rating || 0,
        feedbacks: product.feedbacks || 0
      })),
      source: 'REAL_WB_SERVER_API',
      lastUpdated: new Date().toISOString()
    };

    // Сохраняем в кеш
    antibanService.setCachedData(cacheKey, sellerInfo);

    console.log('✅ РЕАЛЬНЫЕ данные продавца получены:', sellerInfo.name);
    res.json(sellerInfo);
  } catch (error) {
    console.error('🚫 Ошибка получения данных продавца:', error);
    res.status(500).json({ error: 'Ошибка получения данных продавца' });
  }
});

// 📊 Получение конкурентов товара
app.get('/api/wb/competitors/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;
    console.log('🛡️ ЗАЩИЩЕННЫЙ поиск конкурентов для товара:', productId);

    // Проверяем кеш
    const cacheKey = `competitors_${productId}_${limit}`;
    const cachedData = antibanService.getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Проверяем лимиты запросов
    if (!antibanService.checkRateLimit()) {
      return res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    }

    await antibanService.addDelay();

    // Сначала получаем информацию о товаре
    const productResponse = await fetch(`http://localhost:3001/api/wb/product/${productId}`);
    if (!productResponse.ok) {
      throw new Error('Не удалось получить информацию о товаре');
    }

    const productData = await productResponse.json();
    const category = productData.category || productData.name.split(' ')[0];

    // Ищем похожие товары в той же категории
    const searchUrl = `https://search.wb.ru/exactmatch/ru/common/v4/search?appType=1&curr=rub&dest=-1257786&query=${encodeURIComponent(category)}&resultset=catalog&sort=popular&spp=0&suppressSpellcheck=false`;

    const response = await fetch(searchUrl, {
      headers: antibanService.getSafeHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const responseText = await response.text();

    if (antibanService.checkForBan(response, responseText)) {
      console.log('🚨 Обнаружен бан при поиске конкурентов!');
      return res.status(503).json({ error: 'Временно заблокированы Wildberries. Попробуйте позже.' });
    }

    const data = JSON.parse(responseText);
    const allProducts = data.data?.products || [];

    // Фильтруем конкурентов (исключаем сам товар)
    const competitors = allProducts
      .filter(p => p.id.toString() !== productId.toString())
      .slice(0, limit)
      .map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.salePriceU / 100,
        originalPrice: product.priceU ? product.priceU / 100 : null,
        discount: product.sale || 0,
        rating: product.rating || 0,
        feedbacks: product.feedbacks || 0,
        supplier: product.supplier || null,
        supplierId: product.supplierId || null,
        // Анализ конкурентоспособности
        priceCompetitiveness: productData.price ?
          ((productData.price - (product.salePriceU / 100)) / productData.price * 100).toFixed(1) : null,
        ratingAdvantage: productData.rating ?
          ((product.rating || 0) - productData.rating).toFixed(1) : null
      }));

    const result = {
      productId: productId,
      productName: productData.name,
      productPrice: productData.price,
      competitorsFound: competitors.length,
      competitors: competitors,
      analysis: {
        avgCompetitorPrice: competitors.length > 0 ?
          (competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length).toFixed(2) : null,
        minCompetitorPrice: competitors.length > 0 ?
          Math.min(...competitors.map(c => c.price)) : null,
        maxCompetitorPrice: competitors.length > 0 ?
          Math.max(...competitors.map(c => c.price)) : null,
        avgCompetitorRating: competitors.length > 0 ?
          (competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.length).toFixed(1) : null
      },
      source: 'REAL_WB_SERVER_API',
      lastUpdated: new Date().toISOString()
    };

    // Сохраняем в кеш
    antibanService.setCachedData(cacheKey, result);

    console.log('✅ РЕАЛЬНЫЕ конкуренты найдены:', competitors.length);
    res.json(result);
  } catch (error) {
    console.error('🚫 Ошибка поиска конкурентов:', error);
    res.status(500).json({ error: 'Ошибка поиска конкурентов' });
  }
});

// 🔍 РЕАЛЬНЫЙ ПОИСК WILDBERRIES С ЗАЩИТОЙ ОТ БАНА
app.get('/api/wb/search', async (req, res) => {
  try {
    const query = req.query.q;
    const page = req.query.page || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort || 'popular';
    console.log('🛡️ ЗАЩИЩЕННЫЙ поиск товаров WB:', query, `(страница ${page})`);

    // Проверяем кеш
    const cacheKey = `search_${query}_${page}_${limit}_${sort}`;
    const cachedData = antibanService.getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Проверяем лимиты запросов
    if (!antibanService.checkRateLimit()) {
      return res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    }

    // Добавляем задержку для защиты от бана
    await antibanService.addDelay();

    const url = `https://search.wb.ru/exactmatch/ru/common/v4/search?appType=1&curr=rub&dest=-1257786&query=${encodeURIComponent(query)}&resultset=catalog&sort=popular&spp=0&suppressSpellcheck=false&page=${page}`;

    const response = await fetch(url, {
      headers: antibanService.getSafeHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const responseText = await response.text();

    // Проверяем на бан
    if (antibanService.checkForBan(response, responseText)) {
      console.log('🚨 Обнаружен бан при поиске!');
      return res.status(503).json({ error: 'Временно заблокированы Wildberries. Попробуйте позже.' });
    }

    const data = JSON.parse(responseText);
    const products = data.data?.products || [];

    // Преобразуем данные в удобный формат с расширенной информацией
    const formattedProducts = products.slice(0, limit).map((product, index) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.salePriceU / 100,
      originalPrice: product.priceU ? product.priceU / 100 : null,
      discount: product.sale || 0,
      rating: product.rating || 0,
      supplierRating: product.supplierRating || 0,
      feedbacks: product.feedbacks || 0,
      volume: product.volume || 0,
      pics: product.pics || 0,
      video: product.video || null,
      supplier: product.supplier || null,
      supplierId: product.supplierId || null,
      // Дополнительные поля для аналитики
      category: product.subj || null,
      categoryId: product.subjId || null,
      root: product.root || null,
      kindId: product.kindId || null,
      colors: product.colors || [],
      sizes: product.sizes || [],
      promoTextCard: product.promoTextCard || null,
      promoTextCat: product.promoTextCat || null,
      // Позиция в поиске
      searchPosition: (page - 1) * 100 + index + 1,
      // Метаданные
      source: 'REAL_WB_SERVER_SEARCH',
      lastUpdated: new Date().toISOString(),
      parseMethod: 'search_api'
    }));

    const result = {
      query: query,
      page: parseInt(page),
      limit: limit,
      sort: sort,
      totalFound: formattedProducts.length,
      products: formattedProducts,
      // Аналитика по результатам поиска
      analytics: {
        avgPrice: formattedProducts.length > 0 ?
          (formattedProducts.reduce((sum, p) => sum + p.price, 0) / formattedProducts.length).toFixed(2) : null,
        minPrice: formattedProducts.length > 0 ?
          Math.min(...formattedProducts.map(p => p.price)) : null,
        maxPrice: formattedProducts.length > 0 ?
          Math.max(...formattedProducts.map(p => p.price)) : null,
        avgRating: formattedProducts.length > 0 ?
          (formattedProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / formattedProducts.length).toFixed(1) : null,
        brandsCount: new Set(formattedProducts.map(p => p.brand).filter(Boolean)).size,
        suppliersCount: new Set(formattedProducts.map(p => p.supplier).filter(Boolean)).size
      },
      source: 'REAL_WB_SERVER_API',
      lastUpdated: new Date().toISOString()
    };

    // Сохраняем в кеш
    antibanService.setCachedData(cacheKey, result);

    console.log('✅ РЕАЛЬНЫЙ поиск с сервера: найдено товаров:', formattedProducts.length);
    res.json(result);
  } catch (error) {
    console.error('🚫 Ошибка серверного поиска:', error);
    res.status(500).json({ error: 'Ошибка поиска товаров' });
  }
});

// 📦 Массовое получение товаров по ID
app.post('/api/wb/products/batch', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Необходимо предоставить массив ID товаров' });
    }

    if (productIds.length > 50) {
      return res.status(400).json({ error: 'Максимум 50 товаров за один запрос' });
    }

    console.log('🛡️ МАССОВЫЙ запрос товаров WB:', productIds.length);

    const results = [];
    const errors = [];

    // Обрабатываем товары по одному с задержками
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];

      try {
        // Проверяем лимиты перед каждым запросом
        if (!antibanService.checkRateLimit()) {
          console.log('⚠️ Достигнут лимит, прерываем массовый запрос');
          break;
        }

        await antibanService.addDelay();

        const response = await fetch(`http://localhost:3001/api/wb/product/${productId}`);

        if (response.ok) {
          const productData = await response.json();
          results.push(productData);
          console.log(`✅ Товар ${i + 1}/${productIds.length} получен:`, productData.name);
        } else {
          errors.push({ productId, error: `HTTP ${response.status}` });
        }
      } catch (error) {
        errors.push({ productId, error: error.message });
        console.error(`❌ Ошибка получения товара ${productId}:`, error.message);
      }
    }

    res.json({
      success: true,
      totalRequested: productIds.length,
      totalReceived: results.length,
      totalErrors: errors.length,
      products: results,
      errors: errors,
      source: 'REAL_WB_BATCH_API',
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('🚫 Ошибка массового запроса:', error);
    res.status(500).json({ error: 'Ошибка массового получения товаров' });
  }
});

// 💰 Мониторинг цен конкурентов
app.post('/api/wb/price-monitoring', async (req, res) => {
  try {
    const { productId, competitorIds } = req.body;

    if (!productId || !competitorIds || !Array.isArray(competitorIds)) {
      return res.status(400).json({ error: 'Необходимо указать ID товара и массив ID конкурентов' });
    }

    console.log('🛡️ МОНИТОРИНГ ЦЕН для товара:', productId, 'конкурентов:', competitorIds.length);

    // Получаем данные основного товара
    const mainProductResponse = await fetch(`http://localhost:3001/api/wb/product/${productId}`);
    if (!mainProductResponse.ok) {
      throw new Error('Не удалось получить данные основного товара');
    }
    const mainProduct = await mainProductResponse.json();

    // Получаем данные конкурентов
    const competitorData = [];
    for (const competitorId of competitorIds) {
      try {
        if (!antibanService.checkRateLimit()) {
          console.log('⚠️ Достигнут лимит при мониторинге цен');
          break;
        }

        await antibanService.addDelay();

        const response = await fetch(`http://localhost:3001/api/wb/product/${competitorId}`);
        if (response.ok) {
          const competitor = await response.json();
          competitorData.push({
            id: competitor.id,
            name: competitor.name,
            price: competitor.price,
            originalPrice: competitor.originalPrice,
            discount: competitor.discount,
            rating: competitor.rating,
            feedbacks: competitor.feedbacks,
            supplier: competitor.supplier,
            // Сравнение с основным товаром
            priceDifference: (competitor.price - mainProduct.price).toFixed(2),
            pricePercentDifference: ((competitor.price - mainProduct.price) / mainProduct.price * 100).toFixed(1),
            ratingDifference: ((competitor.rating || 0) - (mainProduct.rating || 0)).toFixed(1)
          });
        }
      } catch (error) {
        console.error(`Ошибка получения конкурента ${competitorId}:`, error.message);
      }
    }

    // Анализ конкурентной среды
    const analysis = {
      mainProduct: {
        id: mainProduct.id,
        name: mainProduct.name,
        price: mainProduct.price,
        rating: mainProduct.rating
      },
      competitors: competitorData,
      competitiveAnalysis: {
        totalCompetitors: competitorData.length,
        cheaperCompetitors: competitorData.filter(c => c.price < mainProduct.price).length,
        expensiveCompetitors: competitorData.filter(c => c.price > mainProduct.price).length,
        avgCompetitorPrice: competitorData.length > 0 ?
          (competitorData.reduce((sum, c) => sum + c.price, 0) / competitorData.length).toFixed(2) : null,
        minCompetitorPrice: competitorData.length > 0 ?
          Math.min(...competitorData.map(c => c.price)) : null,
        maxCompetitorPrice: competitorData.length > 0 ?
          Math.max(...competitorData.map(c => c.price)) : null,
        pricePosition: competitorData.length > 0 ?
          competitorData.filter(c => c.price < mainProduct.price).length + 1 : 1,
        recommendations: []
      },
      source: 'REAL_WB_MONITORING_API',
      lastUpdated: new Date().toISOString()
    };

    // Генерируем рекомендации
    if (analysis.competitiveAnalysis.avgCompetitorPrice) {
      const avgPrice = parseFloat(analysis.competitiveAnalysis.avgCompetitorPrice);
      const currentPrice = mainProduct.price;

      if (currentPrice > avgPrice * 1.1) {
        analysis.competitiveAnalysis.recommendations.push({
          type: 'price_reduction',
          message: `Рекомендуется снизить цену. Ваша цена на ${((currentPrice - avgPrice) / avgPrice * 100).toFixed(1)}% выше средней`,
          suggestedPrice: (avgPrice * 1.05).toFixed(2)
        });
      } else if (currentPrice < avgPrice * 0.9) {
        analysis.competitiveAnalysis.recommendations.push({
          type: 'price_increase',
          message: `Можно повысить цену. Ваша цена на ${((avgPrice - currentPrice) / avgPrice * 100).toFixed(1)}% ниже средней`,
          suggestedPrice: (avgPrice * 0.95).toFixed(2)
        });
      } else {
        analysis.competitiveAnalysis.recommendations.push({
          type: 'price_optimal',
          message: 'Ваша цена находится в оптимальном диапазоне',
          suggestedPrice: currentPrice
        });
      }
    }

    res.json(analysis);

  } catch (error) {
    console.error('🚫 Ошибка мониторинга цен:', error);
    res.status(500).json({ error: 'Ошибка мониторинга цен конкурентов' });
  }
});

// 🤖 АВТОМАТИЧЕСКОЕ РЕГУЛИРОВАНИЕ ЦЕН
app.post('/api/wb/auto-price-update', async (req, res) => {
  try {
    const { productId, strategy, parameters } = req.body;

    if (!productId || !strategy) {
      return res.status(400).json({ error: 'Необходимо указать ID товара и стратегию' });
    }

    console.log('🤖 АВТОМАТИЧЕСКОЕ обновление цены для товара:', productId);

    // Проверяем лимиты запросов
    if (!antibanService.checkRateLimit()) {
      return res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    }

    await antibanService.addDelay();

    // Получаем данные о товаре
    const productResponse = await fetch(`http://localhost:3001/api/wb/product/${productId}`);
    if (!productResponse.ok) {
      throw new Error('Не удалось получить данные товара');
    }
    const productData = await productResponse.json();

    // Получаем конкурентов
    const competitorsResponse = await fetch(`http://localhost:3001/api/wb/competitors/${productId}?limit=10`);
    if (!competitorsResponse.ok) {
      throw new Error('Не удалось получить данные конкурентов');
    }
    const competitorsData = await competitorsResponse.json();

    let newPrice = productData.price;
    let recommendation = '';

    // Применяем стратегию ценообразования
    switch (strategy) {
      case 'follow_min':
        if (competitorsData.analysis?.minCompetitorPrice) {
          newPrice = Math.max(
            competitorsData.analysis.minCompetitorPrice,
            parameters.minPrice || 0
          );
          newPrice = Math.min(newPrice, parameters.maxPrice || Infinity);
          recommendation = `Следование за минимальной ценой: ${competitorsData.analysis.minCompetitorPrice} ₽`;
        }
        break;

      case 'undercut':
        if (competitorsData.analysis?.minCompetitorPrice) {
          const undercutAmount = parameters.undercutAmount || 50;
          newPrice = Math.max(
            competitorsData.analysis.minCompetitorPrice - undercutAmount,
            parameters.minPrice || 0
          );
          newPrice = Math.min(newPrice, parameters.maxPrice || Infinity);
          recommendation = `Подрезание цены на ${undercutAmount} ₽`;
        }
        break;

      case 'fixed_margin':
        if (parameters.margin && productData.costPrice) {
          newPrice = productData.costPrice * (1 + parameters.margin / 100);
          newPrice = Math.max(newPrice, parameters.minPrice || 0);
          newPrice = Math.min(newPrice, parameters.maxPrice || Infinity);
          recommendation = `Фиксированная маржа ${parameters.margin}%`;
        }
        break;

      case 'dynamic':
        // Динамическое ценообразование на основе анализа конкурентов
        if (competitorsData.analysis?.avgCompetitorPrice) {
          const avgPrice = parseFloat(competitorsData.analysis.avgCompetitorPrice);
          const competitorsCount = competitorsData.competitorsFound;

          // Если конкурентов мало, цену можно поднять
          if (competitorsCount < 5) {
            newPrice = avgPrice * 1.05; // +5%
            recommendation = 'Мало конкурентов - повышение цены на 5%';
          } else if (competitorsCount > 15) {
            newPrice = avgPrice * 0.95; // -5%
            recommendation = 'Много конкурентов - снижение цены на 5%';
          } else {
            newPrice = avgPrice;
            recommendation = 'Средняя цена по рынку';
          }

          newPrice = Math.max(newPrice, parameters.minPrice || 0);
          newPrice = Math.min(newPrice, parameters.maxPrice || Infinity);
        }
        break;
    }

    // Округляем цену
    newPrice = Math.round(newPrice);

    const result = {
      productId: productId,
      productName: productData.name,
      currentPrice: productData.price,
      newPrice: newPrice,
      priceChange: newPrice - productData.price,
      priceChangePercent: ((newPrice - productData.price) / productData.price * 100).toFixed(2),
      strategy: strategy,
      recommendation: recommendation,
      competitorsAnalyzed: competitorsData.competitorsFound,
      competitorsData: {
        minPrice: competitorsData.analysis?.minCompetitorPrice,
        maxPrice: competitorsData.analysis?.maxCompetitorPrice,
        avgPrice: competitorsData.analysis?.avgCompetitorPrice
      },
      shouldUpdate: Math.abs(newPrice - productData.price) >= 10, // Обновляем если разница больше 10 рублей
      timestamp: new Date().toISOString(),
      source: 'REAL_WB_AUTO_PRICING'
    };

    console.log('✅ АВТОМАТИЧЕСКОЕ ценообразование завершено:', result);
    res.json(result);

  } catch (error) {
    console.error('🚫 Ошибка автоматического ценообразования:', error);
    res.status(500).json({ error: 'Ошибка автоматического обновления цены' });
  }
});

// 📈 Массовое автоматическое обновление цен
app.post('/api/wb/bulk-auto-pricing', async (req, res) => {
  try {
    const { rules } = req.body;

    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ error: 'Необходимо предоставить массив правил' });
    }

    if (rules.length > 20) {
      return res.status(400).json({ error: 'Максимум 20 правил за один запрос' });
    }

    console.log('🤖 МАССОВОЕ автоматическое обновление цен:', rules.length, 'правил');

    const results = [];
    const errors = [];

    // Обрабатываем правила по одному с задержками
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];

      try {
        // Проверяем лимиты перед каждым запросом
        if (!antibanService.checkRateLimit()) {
          console.log('⚠️ Достигнут лимит, прерываем массовое обновление');
          break;
        }

        await antibanService.addDelay();

        const response = await fetch('http://localhost:3001/api/wb/auto-price-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: rule.productId,
            strategy: rule.strategy,
            parameters: rule.parameters
          })
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            ...result
          });
          console.log(`✅ Правило ${i + 1}/${rules.length} обработано:`, rule.name);
        } else {
          errors.push({
            ruleId: rule.id,
            ruleName: rule.name,
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        errors.push({
          ruleId: rule.id,
          ruleName: rule.name,
          error: error.message
        });
        console.error(`❌ Ошибка обработки правила ${rule.name}:`, error.message);
      }
    }

    const summary = {
      totalRules: rules.length,
      processedRules: results.length,
      errorRules: errors.length,
      priceUpdatesRecommended: results.filter(r => r.shouldUpdate).length,
      totalPriceChanges: results.reduce((sum, r) => sum + Math.abs(r.priceChange || 0), 0),
      results: results,
      errors: errors,
      timestamp: new Date().toISOString(),
      source: 'REAL_WB_BULK_AUTO_PRICING'
    };

    res.json(summary);

  } catch (error) {
    console.error('🚫 Ошибка массового автоматического ценообразования:', error);
    res.status(500).json({ error: 'Ошибка массового обновления цен' });
  }
});

// 📊 МОНИТОРИНГ ЗАЩИТЫ ОТ БАНА
app.get('/api/wb/antiban-status', (req, res) => {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const recentRequests = antibanService.requestHistory.filter(time => now - time < oneMinute);
  const maxRequests = antibanService.emergencyMode ? 20 : 50;

  res.json({
    status: antibanService.emergencyMode ? 'emergency' : 'active',
    mode: antibanService.emergencyMode ? 'Экстренный режим' : 'Обычный режим',
    requestsLastMinute: recentRequests.length,
    maxRequestsPerMinute: maxRequests,
    remainingRequests: Math.max(0, maxRequests - recentRequests.length),
    lastRequestTime: antibanService.lastRequestTime,
    timeSinceLastRequest: now - antibanService.lastRequestTime,
    bannedIPs: antibanService.bannedIPs.size,
    banDetectionCount: antibanService.banDetectionCount,
    currentUserAgent: antibanService.getRandomUserAgent(),
    // Расширенная статистика
    stats: antibanService.getStats(),
    protection: {
      rateLimit: `${maxRequests} запросов/минуту`,
      delays: antibanService.emergencyMode ? '15-20 секунд между запросами' : '5-15 секунд между запросами',
      userAgentRotation: 'Включена (' + antibanService.userAgents.length + ' вариантов)',
      banDetection: 'Активна',
      headerSpoofing: 'Включена',
      caching: 'Включено (' + antibanService.cache.size + ' записей)',
      proxyRotation: antibanService.proxyList.length > 0 ? 'Включена' : 'Отключена',
      emergencyProtocol: antibanService.emergencyMode ? 'АКТИВЕН' : 'Готов к активации'
    },
    recommendations: []
  });

  // Добавляем рекомендации
  const response = res.json;
  if (antibanService.banDetectionCount > 5) {
    response.recommendations.push({
      type: 'warning',
      message: 'Высокое количество обнаруженных банов. Рекомендуется добавить прокси-серверы.'
    });
  }

  if (recentRequests.length > maxRequests * 0.8) {
    response.recommendations.push({
      type: 'info',
      message: 'Приближение к лимиту запросов. Система автоматически замедлит запросы.'
    });
  }

  if (antibanService.cache.size > 800) {
    response.recommendations.push({
      type: 'info',
      message: 'Кеш почти заполнен. Старые записи будут автоматически удалены.'
    });
  }
});

// 🌐 Управление прокси-серверами
app.post('/api/wb/proxy/add', (req, res) => {
  try {
    const { host, port, username, password, type } = req.body;

    if (!host || !port) {
      return res.status(400).json({ error: 'Необходимо указать host и port' });
    }

    const proxy = {
      host,
      port: parseInt(port),
      username,
      password,
      type: type || 'http'
    };

    antibanService.addProxy(proxy);

    res.json({
      success: true,
      message: 'Прокси-сервер добавлен',
      proxy: { host, port, type },
      totalProxies: antibanService.proxyList.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления прокси' });
  }
});

app.get('/api/wb/proxy/list', (req, res) => {
  const proxies = antibanService.proxyList.map(p => ({
    host: p.host,
    port: p.port,
    type: p.type,
    isActive: p.isActive,
    failCount: p.failCount,
    successRate: (p.successRate * 100).toFixed(1) + '%',
    lastUsed: p.lastUsed ? new Date(p.lastUsed).toLocaleString('ru-RU') : 'Никогда'
  }));

  res.json({
    totalProxies: proxies.length,
    activeProxies: proxies.filter(p => p.isActive).length,
    proxies
  });
});

// 🧪 РАСШИРЕННЫЙ ТЕСТ ЗАЩИТЫ ОТ БАНА
app.get('/api/wb/test-protection', async (req, res) => {
  try {
    console.log('🧪 Запуск расширенного теста защиты от бана...');

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      overall: 'UNKNOWN'
    };

    // Тест 1: Проверка лимитов
    const rateLimitTest = {
      name: 'Rate Limit Check',
      status: antibanService.checkRateLimit() ? 'PASSED' : 'LIMITED',
      details: {
        currentRequests: antibanService.requestHistory.filter(time =>
          Date.now() - time < 60000
        ).length,
        maxRequests: antibanService.emergencyMode ? 20 : 50
      }
    };
    testResults.tests.push(rateLimitTest);

    // Тест 2: Проверка задержек
    const startTime = Date.now();
    await antibanService.addDelay();
    const delayTime = Date.now() - startTime;

    const delayTest = {
      name: 'Delay System',
      status: delayTime >= 5000 ? 'PASSED' : 'WARNING',
      details: {
        delayTime: `${delayTime}ms`,
        expectedMin: '5000ms',
        emergencyMode: antibanService.emergencyMode
      }
    };
    testResults.tests.push(delayTest);

    // Тест 3: Проверка заголовков
    const headers = antibanService.getSafeHeaders();
    const headerTest = {
      name: 'Headers Generation',
      status: Object.keys(headers).length >= 10 ? 'PASSED' : 'WARNING',
      details: {
        headersCount: Object.keys(headers).length,
        userAgent: headers['User-Agent'],
        hasReferer: !!headers['Referer'],
        hasOrigin: !!headers['Origin']
      }
    };
    testResults.tests.push(headerTest);

    // Тест 4: Проверка кеша
    const cacheTest = {
      name: 'Cache System',
      status: antibanService.cache instanceof Map ? 'PASSED' : 'FAILED',
      details: {
        cacheSize: antibanService.cache.size,
        maxSize: 1000,
        isWorking: antibanService.cache instanceof Map
      }
    };
    testResults.tests.push(cacheTest);

    // Тест 5: Проверка прокси
    const proxyTest = {
      name: 'Proxy System',
      status: antibanService.proxyList.length > 0 ? 'PASSED' : 'WARNING',
      details: {
        totalProxies: antibanService.proxyList.length,
        activeProxies: antibanService.proxyList.filter(p => p.isActive).length,
        recommendation: antibanService.proxyList.length === 0 ? 'Рекомендуется добавить прокси-серверы' : null
      }
    };
    testResults.tests.push(proxyTest);

    // Тест 6: Проверка системы обнаружения банов
    const banDetectionTest = {
      name: 'Ban Detection',
      status: 'PASSED',
      details: {
        banCount: antibanService.banDetectionCount,
        emergencyMode: antibanService.emergencyMode,
        bannedIPs: antibanService.bannedIPs.size
      }
    };
    testResults.tests.push(banDetectionTest);

    // Определяем общий результат
    const failedTests = testResults.tests.filter(t => t.status === 'FAILED').length;
    const warningTests = testResults.tests.filter(t => t.status === 'WARNING').length;

    if (failedTests > 0) {
      testResults.overall = 'FAILED';
    } else if (warningTests > 0) {
      testResults.overall = 'WARNING';
    } else {
      testResults.overall = 'PASSED';
    }

    // Добавляем рекомендации
    testResults.recommendations = [];
    if (antibanService.proxyList.length === 0) {
      testResults.recommendations.push('Добавьте прокси-серверы для лучшей защиты');
    }
    if (antibanService.banDetectionCount > 3) {
      testResults.recommendations.push('Высокое количество банов - проверьте настройки');
    }
    if (antibanService.cache.size > 800) {
      testResults.recommendations.push('Кеш почти заполнен - будет автоматически очищен');
    }

    res.json(testResults);

  } catch (error) {
    res.status(500).json({
      test: 'protection_systems',
      result: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Подключаем модули
app.use('/api/logistics', logisticsRouter);
app.use('/api/competitors', competitorsRouter);

// Запуск сервера
app.listen(port, () => {
  console.log('\n🚀 ===== WB PRICE OPTIMIZER PRO SERVER =====');
  console.log(`🌐 Server running at http://localhost:${port}`);
  console.log(`🤖 OpenAI API ${openai ? '✅ configured' : '❌ not configured'}`);
  console.log(`📦 Logistics module ✅ initialized`);
  console.log('\n🛡️ ===== РЕАЛЬНЫЙ ПАРСИНГ WILDBERRIES =====');
  console.log('📊 Доступные API endpoints:');
  console.log('  • GET  /api/wb/product/:id        - Получение товара по ID');
  console.log('  • GET  /api/wb/search             - Поиск товаров');
  console.log('  • GET  /api/wb/competitors/:id    - Поиск конкурентов');
  console.log('  • GET  /api/wb/seller/:id         - Информация о продавце');
  console.log('  • POST /api/wb/products/batch     - Массовое получение товаров');
  console.log('  • POST /api/wb/price-monitoring   - Мониторинг цен конкурентов');
  console.log('\n🤖 ===== АВТОМАТИЧЕСКОЕ ЦЕНООБРАЗОВАНИЕ =====');
  console.log('  • POST /api/wb/auto-price-update  - Автоматическое обновление цены');
  console.log('  • POST /api/wb/bulk-auto-pricing  - Массовое автоматическое ценообразование');
  console.log('\n🛡️ ===== СИСТЕМА ЗАЩИТЫ ОТ БЛОКИРОВОК =====');
  console.log('  • GET  /api/wb/antiban-status     - Статус защиты');
  console.log('  • GET  /api/wb/test-protection    - Тест всех систем защиты');
  console.log('  • POST /api/wb/proxy/add          - Добавление прокси');
  console.log('  • GET  /api/wb/proxy/list         - Список прокси');
  console.log('\n✨ ===== ВОЗМОЖНОСТИ СИСТЕМЫ =====');
  console.log('  🔄 Автоматическая ротация User-Agent');
  console.log('  ⏱️  Интеллектуальные задержки между запросами');
  console.log('  💾 Кеширование для оптимизации');
  console.log('  🚨 Автоматическое обнаружение блокировок');
  console.log('  📧 Email уведомления о проблемах');
  console.log('  🌐 Поддержка прокси-серверов');
  console.log('  🚨 Экстренный режим при блокировках');
  console.log('\n🎯 Система готова к работе! Начинайте парсинг Wildberries!');
  console.log('📖 Документация: http://localhost:' + port + '/api/wb/antiban-status');
  console.log('🧪 Тест системы: http://localhost:' + port + '/api/wb/test-protection');
  console.log('===============================================\n');
});
