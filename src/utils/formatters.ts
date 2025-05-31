/**
 * Форматирует цену в рублях
 * @param price Цена в рублях
 * @returns Отформатированная строка с ценой
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Форматирует дату в локальном формате
 * @param date Дата для форматирования
 * @param includeTime Включать ли время в результат
 * @returns Отформатированная строка с датой
 */
export const formatDate = (date: Date | string, includeTime: boolean = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('ru-RU', options);
};

/**
 * Форматирует процент
 * @param value Значение в процентах
 * @param decimals Количество знаков после запятой
 * @returns Отформатированная строка с процентом
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Форматирует большие числа (тысячи, миллионы)
 * @param value Число для форматирования
 * @returns Отформатированная строка с числом
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} млн`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} тыс`;
  }
  return value.toString();
};

/**
 * Сокращает текст до указанной длины
 * @param text Исходный текст
 * @param maxLength Максимальная длина
 * @returns Сокращенный текст с многоточием в конце
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Форматирует размер файла в байтах в человекочитаемый формат
 * @param bytes Размер в байтах
 * @returns Отформатированная строка с размером
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Байт';
  
  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Форматирует телефонный номер в российском формате
 * @param phone Номер телефона (может содержать только цифры или быть в любом формате)
 * @returns Отформатированный номер телефона
 */
export const formatPhone = (phone: string): string => {
  // Оставляем только цифры
  const digits = phone.replace(/\D/g, '');
  
  // Проверяем, что это российский номер (начинается с 7 или 8 и содержит 11 цифр)
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    const countryCode = '7';
    const areaCode = digits.substring(1, 4);
    const firstPart = digits.substring(4, 7);
    const secondPart = digits.substring(7, 9);
    const thirdPart = digits.substring(9, 11);
    
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
  }
  
  // Если формат не соответствует российскому, возвращаем как есть
  return phone;
};

/**
 * Форматирует строку в "CamelCase" (первая буква каждого слова заглавная)
 * @param str Исходная строка
 * @returns Отформатированная строка
 */
export const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Форматирует число с разделителями групп разрядов
 * @param num Число для форматирования
 * @returns Отформатированная строка с числом
 */
export const formatNumberWithSeparators = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Форматирует время в формате "чч:мм:сс"
 * @param seconds Количество секунд
 * @returns Отформатированная строка со временем
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Форматирует дату в относительном формате (например, "5 минут назад")
 * @param date Дата для форматирования
 * @returns Отформатированная строка с относительной датой
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'только что';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')} назад`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${pluralize(months, 'месяц', 'месяца', 'месяцев')} назад`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${pluralize(years, 'год', 'года', 'лет')} назад`;
  }
};

/**
 * Вспомогательная функция для склонения слов в зависимости от числа
 * @param count Число
 * @param one Форма для 1
 * @param few Форма для 2-4
 * @param many Форма для 5-20
 * @returns Правильная форма слова
 */
export const pluralize = (count: number, one: string, few: string, many: string): string => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return one;
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return few;
  } else {
    return many;
  }
};
