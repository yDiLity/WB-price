# API Testing Guide для Ozon Price Optimizer Pro

## Базовая настройка

### 1. Получение API ключа
После создания пользователя в базе данных, API ключ будет сгенерирован автоматически.
Для тестирования можно использовать ключ из тестовых данных.

### 2. Аутентификация
Все API запросы требуют заголовок:
```
X-API-Key: your_api_key_here
```

## Основные API endpoints

### Пользователь
```bash
# Получить профиль пользователя
GET /api/user/profile

# Ответ:
{
  "user": {
    "id": "uuid",
    "name": "Тестовый Пользователь",
    "email": "test@example.com",
    "role": "admin"
  },
  "stats": {
    "products_count": 3,
    "unread_alerts": 0,
    "slot_bookings": 0,
    "avg_price": 13190.00
  }
}
```

### Товары
```bash
# Получить список товаров
GET /api/products?limit=10&offset=0&search=Samsung

# Создать новый товар
POST /api/products
{
  "name": "iPhone 15 Pro",
  "sku": "APPLE-IP15P-256GB",
  "current_price": 89990,
  "cost_price": 70000,
  "min_price": 85000,
  "max_price": 95000,
  "auto_pricing_enabled": true,
  "pricing_strategy": "balanced"
}

# Получить детали товара
GET /api/products/{product_id}

# Обновить цену товара
PUT /api/products/{product_id}/price
{
  "price": 87990,
  "reason": "competitor_analysis"
}
```

### Слоты поставок
```bash
# Получить доступные слоты
GET /api/delivery-slots?warehouse_region=Московская&slot_type=FBS&date_from=2025-05-30

# Забронировать слот
POST /api/delivery-slots/{slot_id}/book
{
  "notes": "Срочная поставка"
}

# Получить список складов
GET /api/warehouses

# Статистика по датам
GET /api/delivery-slots/stats?days=14
```

### Автоматическое ценообразование
```bash
# Статус сервиса ценообразования
GET /api/pricing/status

# Запустить сервис
POST /api/pricing/start

# Остановить сервис
POST /api/pricing/stop

# Принудительное обновление цен
POST /api/pricing/force-update

# Анализ эффективности
GET /api/pricing/effectiveness?days=30
```

### Аналитика
```bash
# Дашборд пользователя
GET /api/analytics/dashboard?days=30

# Прогноз продаж
GET /api/analytics/forecast?days=7

# Записать метрику
POST /api/analytics/record
{
  "productId": "product_uuid",
  "metricType": "sales",
  "value": 25990,
  "additionalData": {
    "source": "ozon",
    "region": "moscow"
  }
}

# Очистить кеш аналитики
DELETE /api/analytics/cache
```

### Системная информация
```bash
# Статус системы
GET /api/system/status

# Ответ:
{
  "database": {
    "connected": true,
    "timestamp": "2025-05-30T12:46:00.000Z"
  },
  "pricing": {
    "isRunning": true,
    "totalUpdates": 15,
    "successfulUpdates": 12,
    "failedUpdates": 3,
    "lastRunTime": "2025-05-30T12:45:00.000Z",
    "averageUpdateTime": 1250
  },
  "analytics": {
    "cache": {
      "size": 5,
      "timeout": 300000,
      "keys": ["dashboard_user1_30", "forecast_user1_7"]
    }
  },
  "server": {
    "uptime": 3600,
    "memory": {
      "rss": 45678912,
      "heapTotal": 20971520,
      "heapUsed": 15728640
    },
    "version": "v22.14.0"
  }
}
```

## Примеры использования

### 1. Создание товара и настройка автоценообразования
```bash
# 1. Создать товар
curl -X POST http://localhost:3000/api/products \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Смартфон Xiaomi 14",
    "sku": "XIAOMI-14-256GB",
    "current_price": 45990,
    "cost_price": 35000,
    "min_price": 42000,
    "max_price": 50000,
    "auto_pricing_enabled": true,
    "pricing_strategy": "aggressive"
  }'

# 2. Запустить автоматическое ценообразование
curl -X POST http://localhost:3000/api/pricing/start \
  -H "X-API-Key: your_api_key"

# 3. Проверить статус
curl -X GET http://localhost:3000/api/pricing/status \
  -H "X-API-Key: your_api_key"
```

### 2. Мониторинг и аналитика
```bash
# 1. Записать продажу
curl -X POST http://localhost:3000/api/analytics/record \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_uuid",
    "metricType": "sales",
    "value": 45990
  }'

# 2. Получить дашборд
curl -X GET http://localhost:3000/api/analytics/dashboard?days=30 \
  -H "X-API-Key: your_api_key"

# 3. Получить прогноз
curl -X GET http://localhost:3000/api/analytics/forecast?days=7 \
  -H "X-API-Key: your_api_key"
```

### 3. Управление слотами поставок
```bash
# 1. Найти доступные слоты
curl -X GET "http://localhost:3000/api/delivery-slots?warehouse_region=Московская&slot_type=FBS&min_capacity=5" \
  -H "X-API-Key: your_api_key"

# 2. Забронировать слот
curl -X POST http://localhost:3000/api/delivery-slots/slot_uuid/book \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Поставка товаров на склад"
  }'
```

## Коды ошибок

- `401` - Неверный или отсутствующий API ключ
- `404` - Ресурс не найден
- `400` - Неверные параметры запроса
- `500` - Внутренняя ошибка сервера

## Лимиты

- Максимум 1000 товаров на пользователя в одном запросе
- Кэш аналитики обновляется каждые 5 минут
- Автоматическое ценообразование запускается каждые 5 минут
- Максимальное изменение цены за раз: 30%
