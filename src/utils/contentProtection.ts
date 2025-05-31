/**
 * Утилиты для защиты контента от автоматического копирования
 */

// Функция для добавления невидимых символов в текст
export const obfuscateText = (text: string): string => {
  // Добавляем невидимые символы между буквами
  // Это затрудняет автоматическое копирование текста
  const zeroWidthSpace = '​'; // Zero-width space (U+200B)
  let result = '';

  for (let i = 0; i < text.length; i++) {
    result += text[i];
    if (i < text.length - 1) {
      result += zeroWidthSpace;
    }
  }

  return result;
};

// Функция для создания водяного знака
export const createWatermark = (text: string = 'Защищено'): HTMLDivElement => {
  const watermark = document.createElement('div');
  watermark.className = 'content-watermark';
  watermark.style.position = 'fixed';
  watermark.style.top = '0';
  watermark.style.left = '0';
  watermark.style.width = '100%';
  watermark.style.height = '100%';
  watermark.style.pointerEvents = 'none';
  watermark.style.zIndex = '1000';
  watermark.style.opacity = '0.03';
  watermark.style.userSelect = 'none';

  // Создаем фон с узором вместо повторяющегося текста
  const pattern = document.createElement('div');
  pattern.style.position = 'absolute';
  pattern.style.top = '0';
  pattern.style.left = '0';
  pattern.style.width = '100%';
  pattern.style.height = '100%';
  pattern.style.backgroundImage = 'linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.05) 75%, transparent 75%, transparent)';
  pattern.style.backgroundSize = '50px 50px';
  watermark.appendChild(pattern);

  // Добавляем небольшой текст в углу
  const textElement = document.createElement('div');
  textElement.textContent = text;
  textElement.style.position = 'fixed';
  textElement.style.right = '10px';
  textElement.style.bottom = '10px';
  textElement.style.fontSize = '12px';
  textElement.style.color = 'rgba(0, 0, 0, 0.3)';
  textElement.style.fontWeight = 'normal';
  watermark.appendChild(textElement);

  return watermark;
};

// Функция для добавления водяного знака на страницу
export const addWatermark = (text?: string): void => {
  // Проверяем, есть ли уже водяной знак
  const existingWatermark = document.querySelector('.content-watermark');
  if (existingWatermark) {
    existingWatermark.remove();
  }

  const watermark = createWatermark(text);
  document.body.appendChild(watermark);
};

// Функция для предотвращения выделения текста
export const preventTextSelection = (): void => {
  const style = document.createElement('style');
  style.id = 'prevent-selection-style';
  style.textContent = `
    body {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Разрешаем выделение в полях ввода */
    input, textarea {
      -webkit-user-select: auto;
      -moz-user-select: auto;
      -ms-user-select: auto;
      user-select: auto;
    }
  `;

  document.head.appendChild(style);
};

// Функция для разрешения выделения текста
export const allowTextSelection = (): void => {
  const style = document.getElementById('prevent-selection-style');
  if (style) {
    style.remove();
  }
};

// Функция для предотвращения копирования текста
export const preventCopy = (): void => {
  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Можно заменить скопированный текст на свой
      const clipboardData = e.clipboardData;
      if (clipboardData) {
        clipboardData.setData('text/plain', 'Копирование запрещено. Контент защищен © Ozon Price Optimizer Pro');
      }
    }
  };

  document.addEventListener('copy', handleCopy);

  // Сохраняем ссылку на обработчик в window для возможности его удаления
  (window as any).__copyHandler = handleCopy;
};

// Функция для разрешения копирования текста
export const allowCopy = (): void => {
  const handler = (window as any).__copyHandler;
  if (handler) {
    document.removeEventListener('copy', handler);
    delete (window as any).__copyHandler;
  }
};

// Функция для обнаружения попыток скрапинга
export const detectScraping = (): void => {
  // Проверяем User-Agent на наличие признаков ботов
  const userAgent = navigator.userAgent.toLowerCase();
  const botPatterns = [
    'bot', 'spider', 'crawl', 'scrape', 'fetch', 'http', 'java', 'python',
    'perl', 'ruby', 'go-http', 'wget', 'curl', 'request', 'axios', 'puppeteer'
  ];

  const isBot = botPatterns.some(pattern => userAgent.includes(pattern));

  if (isBot) {
    // Если обнаружен бот, можно перенаправить на страницу с капчей
    // или показать альтернативный контент
    console.warn('Bot detected:', userAgent);

    // Можно добавить код для перенаправления или показа капчи
    // window.location.href = '/captcha';
  }

  // Проверяем, не запущен ли сайт в iframe (защита от фрейминга)
  if (window.self !== window.top) {
    // Сайт загружен в iframe
    console.warn('Site loaded in iframe, possible scraping attempt');

    // Можно запретить загрузку в iframe
    // window.top.location = window.self.location;
  }
};

// Функция для инициализации всех защит
export const initContentProtection = (options: {
  preventSelection?: boolean;
  preventCopying?: boolean;
  addWatermarks?: boolean;
  detectScrapers?: boolean;
} = {}): void => {
  const {
    preventSelection = true,
    preventCopying = true,
    addWatermarks = true,
    detectScrapers = true
  } = options;

  if (preventSelection) {
    preventTextSelection();
  }

  if (preventCopying) {
    preventCopy();
  }

  if (addWatermarks) {
    addWatermark();
  }

  if (detectScrapers) {
    detectScraping();
  }
};
