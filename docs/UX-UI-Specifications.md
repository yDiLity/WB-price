# 🎨 UX/UI Спецификации и Дизайн-система

**Версия:** 1.0  
**Дата:** 27 января 2025  
**Проект:** Ozon Slot Finder & Price Optimizer Pro

---

## 📱 Мобильные Wireframes

### Главная страница (Mobile)
```
┌─────────────────────┐
│ ☰  Ozon Pro    🔔👤 │
├─────────────────────┤
│                     │
│ 📊 Сегодня          │
│ ┌─────────────────┐ │
│ │ 🚚 Слоты: 12    │ │
│ │ 💰 Цены: 8      │ │
│ │ 📦 Товары: 45   │ │
│ └─────────────────┘ │
│                     │
│ 🔥 Критические      │
│ ┌─────────────────┐ │
│ │ ⚠️ Слот Москва   │ │
│ │ iPhone 15 Pro   │ │
│ │ 14:00-16:00     │ │
│ │ [Забронировать] │ │
│ └─────────────────┘ │
│                     │
│ 📈 Аналитика        │
│ ┌─────────────────┐ │
│ │ Прибыль ↗️ +23%  │ │
│ │ [График]        │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ 🏠 📊 🚚 💰 ⚙️      │
└─────────────────────┘
```

### Мониторинг слотов (Mobile)
```
┌─────────────────────┐
│ ← 🚚 Слоты     🔍   │
├─────────────────────┤
│ Фильтры:            │
│ [Склад ▼] [Дата ▼] │
│                     │
│ 🟢 Доступные        │
│ ┌─────────────────┐ │
│ │ 📍 Москва-Север │ │
│ │ 📅 27.01.2025   │ │
│ │ ⏰ 14:00-16:00  │ │
│ │ 📦 Электроника  │ │
│ │ 👥 15/20 мест   │ │
│ │ ⭐⭐⭐⭐⭐ AI    │ │
│ │ [🎯 Забронир.]  │ │
│ └─────────────────┘ │
│                     │
│ 🟡 Ожидаемые        │
│ ┌─────────────────┐ │
│ │ 📍 СПб-Юг       │ │
│ │ 📅 28.01.2025   │ │
│ │ 🎯 85% через 4ч │ │
│ │ [🔔 Уведомить]  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 🎨 Дизайн-система

### Цветовая палитра

#### Основные цвета
```css
:root {
  /* Primary - Синий */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-900: #1e3a8a;

  /* Secondary - Бирюзовый */
  --secondary-50: #f0fdfa;
  --secondary-100: #ccfbf1;
  --secondary-500: #14b8a6;
  --secondary-600: #0d9488;
  --secondary-900: #134e4a;

  /* Accent - Фиолетовый */
  --accent-50: #faf5ff;
  --accent-100: #f3e8ff;
  --accent-500: #8b5cf6;
  --accent-600: #7c3aed;
  --accent-900: #581c87;

  /* Success - Зеленый */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;

  /* Warning - Оранжевый */
  --warning-50: #fff7ed;
  --warning-500: #f97316;
  --warning-600: #ea580c;

  /* Error - Красный */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  /* Neutral - Серый */
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-500: #6b7280;
  --neutral-700: #374151;
  --neutral-900: #111827;
}
```

#### Темная тема
```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  
  --border-primary: #334155;
  --border-secondary: #475569;
}
```

### Типографика

#### Шрифтовая система
```css
/* Основной шрифт */
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Моноширинный */
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Размеры */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Высота строки */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Вес шрифта */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Компоненты

#### Кнопки
```css
/* Базовая кнопка */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 44px; /* Accessibility */
  
  &:focus {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }
}

/* Варианты */
.btn-primary {
  background: var(--primary-500);
  color: white;
  
  &:hover {
    background: var(--primary-600);
    transform: translateY(-1px);
  }
}

.btn-secondary {
  background: var(--secondary-500);
  color: white;
}

.btn-outline {
  border: 1px solid var(--primary-500);
  color: var(--primary-500);
  background: transparent;
}

/* Размеры */
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
```

#### Карточки
```css
.card {
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid var(--border-primary);
}
```

#### Формы
```css
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--error-500);
}
```

---

## 📐 Сетка и Layout

### CSS Grid система
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### Flexbox утилиты
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }

.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
```

---

## 🎭 Анимации и переходы

### Базовые анимации
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Transition классы
```css
.transition-all { transition: all 0.3s ease; }
.transition-colors { transition: color 0.2s ease, background-color 0.2s ease; }
.transition-transform { transition: transform 0.2s ease; }

.hover\:scale-105:hover { transform: scale(1.05); }
.hover\:scale-110:hover { transform: scale(1.1); }
.hover\:-translate-y-1:hover { transform: translateY(-0.25rem); }
.hover\:-translate-y-2:hover { transform: translateY(-0.5rem); }
```

### Prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ♿ Accessibility Guidelines

### ARIA Labels и роли
```html
<!-- Навигация -->
<nav aria-label="Основная навигация">
  <ul role="menubar">
    <li role="none">
      <a href="/" role="menuitem" aria-current="page">Главная</a>
    </li>
  </ul>
</nav>

<!-- Кнопки -->
<button 
  aria-label="Забронировать слот на складе Москва"
  aria-describedby="slot-details"
>
  Забронировать
</button>

<!-- Формы -->
<label for="product-name">Название товара</label>
<input 
  id="product-name" 
  type="text" 
  aria-required="true"
  aria-describedby="name-error"
>
<div id="name-error" role="alert" aria-live="polite">
  Поле обязательно для заполнения
</div>
```

### Keyboard Navigation
```css
/* Видимый фокус */
*:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-500);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Screen Reader Support
```css
/* Скрыть визуально, но оставить для скринридеров */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Показать только для скринридеров при фокусе */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```
