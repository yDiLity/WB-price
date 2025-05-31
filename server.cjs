const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const path = require('path');
const nodemailer = require('nodemailer');

// Импортируем модули
const logisticsRouter = require('./server/logistics');
const competitorsRouter = require('./server/routes/competitors');

// Создаем экземпляр Express
const app = express();
const port = 3000;

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

// Подключаем модули
app.use('/api/logistics', logisticsRouter);
app.use('/api/competitors', competitorsRouter);

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`OpenAI API ${openai ? 'configured' : 'not configured'}`);
  console.log(`Logistics module initialized`);
});
