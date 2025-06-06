# 📊 Руководство по Excel-таблице отслеживания

## 🎯 Что мы создали

Интерактивная Excel-подобная таблица для отслеживания товаров с автоматической синхронизацией данных между всеми компонентами приложения.

## ✨ Основные возможности

### 📋 **Автоматическая синхронизация**
- ✅ При добавлении конкурента → данные автоматически попадают в таблицу
- ✅ При изменении цены → обновляется в реальном времени
- ✅ При применении стратегии → сохраняется в таблице
- ✅ Автосохранение каждые 2 секунды

### 🔍 **Фильтрация и поиск**
- 🔎 Поиск по названию товара или конкуренту
- 📂 Фильтр по категориям
- 💰 Фильтр по позиции цены (лучшая/средняя/высокая)
- ⚡ Фильтр по статусу мониторинга
- 🚨 Показать только товары с алертами
- 📊 Сортировка по любому столбцу

### 📤 **Экспорт данных**
- 📄 Экспорт в CSV/Excel формат
- 📅 Автоматическое именование файлов с датой
- 🔢 Полная информация о товарах и конкурентах

## 🚀 Как использовать

### 1. **Переход к таблице**
```
Главное меню → "📊 Таблица отслеживания"
```

### 2. **Просмотр данных**
- **Товар**: название, категория, изображение
- **Наша цена**: текущая цена + изменения
- **Конкуренты**: количество и цены конкурентов
- **Мин/Макс/Сред**: анализ цен конкурентов
- **Позиция**: ваша позиция относительно конкурентов
- **Стратегия**: применённая стратегия ценообразования
- **Статус**: состояние мониторинга
- **Алерты**: количество предупреждений

### 3. **Автоматическое обновление**
Данные обновляются автоматически при:
- Добавлении конкурентов через "Связывание товара с конкурентами"
- Изменении цен в любом компоненте
- Применении стратегий ценообразования

### 4. **Экспорт в Excel**
```
Кнопка "Экспорт в Excel" → Скачивается CSV файл
```

## 🔧 Технические детали

### **Архитектура синхронизации**
```typescript
// Сервис синхронизации
TrackedProductsService
├── notifyCompetitorLinked()    // Уведомление о новом конкуренте
├── notifyPriceChanged()        // Уведомление об изменении цены
├── notifyStrategyApplied()     // Уведомление о стратегии
└── localStorage sync           // Синхронизация между вкладками
```

### **Автосохранение**
- ⏰ Сохранение каждые 2 секунды при изменениях
- 💾 Данные сохраняются в localStorage
- 🔄 Восстановление при перезагрузке страницы

### **События синхронизации**
```typescript
// Пример использования в компонентах
const { notifyCompetitorLinked } = useTrackedProductsSync();

// При добавлении конкурента
notifyCompetitorLinked(productId, competitor, 'ComponentName');
```

## 📊 Структура данных Excel

### **Столбцы экспорта:**
1. **ID товара** - уникальный идентификатор
2. **Название товара** - полное название
3. **Категория** - категория товара
4. **Наша цена** - текущая цена
5. **Изменение цены** - изменение и процент
6. **Конкуренты** - список конкурентов с ценами
7. **Мин. цена конкурентов** - минимальная цена
8. **Макс. цена конкурентов** - максимальная цена
9. **Средняя цена** - средняя цена конкурентов
10. **Позиция** - позиция вашей цены
11. **Стратегия** - применённая стратегия
12. **Статус мониторинга** - состояние отслеживания
13. **Алерты** - количество предупреждений
14. **Последнее обновление** - время последнего обновления

## 🎨 Визуальные индикаторы

### **Цветовая схема:**
- 🟢 **Зелёный** - лучшая цена, активный мониторинг
- 🔴 **Красный** - высокая цена, ошибки
- 🟡 **Жёлтый** - средняя цена, пауза в мониторинге
- 🟠 **Оранжевый** - алерты, требуют внимания
- 🔵 **Синий** - информационные данные

### **Иконки изменений:**
- 📈 **Рост цены** - красная стрелка вверх
- 📉 **Снижение цены** - зелёная стрелка вниз
- ➖ **Без изменений** - серая линия

## 🔄 Workflow использования

### **Типичный сценарий:**
1. **Добавляете товар** в систему
2. **Связываете с конкурентами** через модальное окно
3. **Применяете стратегию** ценообразования
4. **Данные автоматически** появляются в Excel-таблице
5. **Мониторите изменения** в реальном времени
6. **Экспортируете отчёты** для анализа

### **Автоматизация:**
- 🤖 Автоматическое обновление цен конкурентов
- 📊 Автоматический расчёт позиции
- 🚨 Автоматические алерты при критических изменениях
- 💾 Автоматическое сохранение всех изменений

## 🛠️ Настройки

### **Автосохранение:**
- Переключатель в правом верхнем углу
- Показывает время последнего сохранения
- Можно отключить для ручного управления

### **Фильтры:**
- Сохраняются в сессии браузера
- Применяются мгновенно
- Влияют на экспорт данных

## 📈 Статистика

В верхней части отображается:
- **Всего товаров** в отслеживании
- **Активный мониторинг** - количество активных товаров
- **С алертами** - товары, требующие внимания
- **Лучшая цена** - товары с оптимальной ценой

## 🎯 Преимущества

✅ **Централизованный просмотр** всех данных
✅ **Автоматическая синхронизация** между компонентами
✅ **Экспорт для анализа** в Excel/Google Sheets
✅ **Фильтрация и поиск** для быстрого доступа
✅ **Визуальные индикаторы** для быстрой оценки
✅ **Автосохранение** для надёжности данных

---

**🚀 Готово! Теперь у вас есть полнофункциональная Excel-таблица для отслеживания товаров с автоматической синхронизацией!**
