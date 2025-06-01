# 🔗 Реальные API эндпоинты Wildberries

## 📋 **Обзор API Wildberries**

Wildberries предоставляет два типа API:
1. **Официальные API** (требуют авторизации)
2. **Публичные эндпоинты** (без авторизации, для парсинга)

---

## 🏢 **1. Официальные API Wildberries**

### **Получение доступа:**
1. Зарегистрируйтесь как продавец: https://seller.wildberries.ru/
2. Перейдите в "Настройки" → "Доступ к API"
3. Создайте токен для нужной категории

### **Базовые URL:**
```
Контент:      https://content-api.wildberries.ru
Статистика:   https://statistics-api.wildberries.ru
Маркетплейс:  https://marketplace-api.wildberries.ru
Цены:         https://discounts-prices-api.wildberries.ru
Продвижение:  https://advert-api.wildberries.ru
```

### **Основные методы:**

#### **Работа с товарами:**
```
GET  /content/v2/get/cards/list          - Список карточек товаров
POST /content/v2/cards/upload            - Создание карточек
POST /content/v2/cards/update            - Редактирование карточек
GET  /content/v2/object/parent/all       - Категории товаров
GET  /content/v2/object/all              - Список предметов
```

#### **Цены и скидки:**
```
POST /api/v2/upload/task                 - Установить цены
GET  /api/v2/list/goods/filter           - Получить товары с ценами
GET  /api/v2/history/tasks               - Состояние загрузки
```

#### **Статистика:**
```
GET  /api/v1/supplier/sales              - Продажи
GET  /api/v1/supplier/orders             - Заказы
GET  /api/v1/supplier/stocks             - Остатки
```

---

## 🌐 **2. Публичные API эндпоинты (для парсинга)**

### **Поиск товаров:**
```
URL: https://search.wb.ru/exactmatch/ru/common/v4/search
Метод: GET
Параметры:
  - query: поисковый запрос
  - resultset: catalog
  - limit: количество товаров (макс 100)
  - offset: смещение для пагинации
  - sort: popular|priceup|pricedown|rate|newly

Пример:
https://search.wb.ru/exactmatch/ru/common/v4/search?query=iPhone&resultset=catalog&limit=20&offset=0&sort=popular
```

### **Карточка товара:**
```
URL: https://card.wb.ru/cards/detail
Метод: GET
Параметры:
  - nm: артикул товара (ID)
  - curr: валюта (rub)
  - dest: регион доставки
  - regions: список регионов
  - spp: параметр скидки

Пример:
https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&regions=80,64,83,4,38,115,30,33,70,69,68,86,75,40,1,66,48,110,31,22,71,114&spp=27&nm=123456789
```

### **Альтернативная карточка товара:**
```
URL: https://card.wb.ru/cards/v2/detail
Метод: GET
Параметры: аналогичные основной карточке
```

### **Каталог товаров:**
```
URL: https://catalog.wb.ru/catalog
Метод: GET
Используется для получения структуры каталога
```

---

## 🛡️ **3. Защита от блокировок**

### **Обязательные заголовки:**
```javascript
{
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ru-RU,ru;q=0.9',
  'Origin': 'https://www.wildberries.ru',
  'Referer': 'https://www.wildberries.ru/',
  'Sec-Ch-Ua': '"Chromium";v="120", "Not A(Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site'
}
```

### **Лимиты запросов:**
- **Минимальная задержка:** 5 секунд между запросами
- **Максимальная частота:** 50-60 запросов в минуту
- **Длинная пауза:** каждые 100 запросов - 2 минуты

### **Рекомендации:**
1. Используйте ротацию прокси
2. Меняйте User-Agent
3. Добавляйте случайные задержки 5-15 секунд
4. Мониторьте HTTP статусы (403, 429, 503)
5. Реализуйте автоматическое восстановление

---

## 📊 **4. Структура ответов**

### **Поиск товаров:**
```json
{
  "data": {
    "products": [
      {
        "id": 123456789,
        "name": "Название товара",
        "priceU": 150000,
        "salePriceU": 200000,
        "rating": 4.5,
        "feedbacks": 123,
        "supplier": "Продавец",
        "supplierId": 12345,
        "subj_name": "Категория",
        "brand": "Бренд",
        "pics": [123456789]
      }
    ]
  },
  "metadata": {
    "total": 1000,
    "page": 1
  }
}
```

### **Карточка товара:**
```json
{
  "data": {
    "products": [
      {
        "id": 123456789,
        "name": "Название товара",
        "priceU": 150000,
        "salePriceU": 200000,
        "rating": 4.5,
        "feedbacks": 123,
        "supplier": "Продавец",
        "totalQuantity": 50,
        "pics": [123456789],
        "colors": [...],
        "sizes": [...]
      }
    ]
  }
}
```

---

## ⚠️ **5. Важные замечания**

1. **Цены в копейках:** Все цены возвращаются в копейках (умножить на 100)
2. **Изображения:** Формируются по формуле на основе pics
3. **Регионы:** Влияют на цены и наличие товаров
4. **Блокировки:** При превышении лимитов возможны временные блокировки
5. **Изменения API:** Эндпоинты могут изменяться без предупреждения

---

## 🚀 **6. Примеры использования в коде**

### **Поиск товаров:**
```javascript
const searchProducts = async (query) => {
  const url = `https://search.wb.ru/exactmatch/ru/common/v4/search?query=${encodeURIComponent(query)}&resultset=catalog&limit=20&offset=0&sort=popular`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://www.wildberries.ru/'
    }
  });
  
  return await response.json();
};
```

### **Получение карточки товара:**
```javascript
const getProductCard = async (productId) => {
  const url = `https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&regions=80,64,83,4,38,115,30,33,70,69,68,86,75,40,1,66,48,110,31,22,71,114&spp=27&nm=${productId}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://www.wildberries.ru/catalog/'
    }
  });
  
  return await response.json();
};
```

---

## 📞 **7. Поддержка и документация**

- **Официальная документация:** https://dev.wildberries.ru/
- **Техподдержка API:** dev-info@rwb.ru
- **Telegram канал:** @wb_api_notifications
- **Статус API:** https://dev.wildberries.ru/wb-status

---

**⚡ Готово! Теперь у вас есть полная информация о реальных API эндпоинтах Wildberries для интеграции в ваш проект.**
