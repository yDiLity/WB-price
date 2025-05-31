-- Ozon Price Optimizer Pro SQLite Schema
-- Создание базы данных для системы оптимизации цен (SQLite версия)

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    telegram_chat_id INTEGER UNIQUE,
    name TEXT,
    username TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    notifications_enabled INTEGER DEFAULT 1,
    api_key TEXT UNIQUE,
    ozon_api_key TEXT,
    ozon_client_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    is_active INTEGER DEFAULT 1
);

-- Таблица категорий товаров
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    name TEXT NOT NULL,
    ozon_category_id INTEGER,
    parent_id TEXT REFERENCES categories(id),
    description TEXT,
    commission_rate REAL DEFAULT 0.00,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    ozon_product_id INTEGER,
    sku TEXT,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),
    brand TEXT,
    current_price REAL,
    cost_price REAL,
    min_price REAL,
    max_price REAL,
    recommended_price REAL,
    stock_quantity INTEGER DEFAULT 0,
    rating REAL DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    image_url TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    auto_pricing_enabled INTEGER DEFAULT 0,
    pricing_strategy TEXT DEFAULT 'balanced',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Таблица конкурентов
CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ozon_seller_id INTEGER,
    price REAL,
    rating REAL DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    stock_status TEXT,
    last_updated TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1
);

-- Таблица истории изменения цен
CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    old_price REAL,
    new_price REAL,
    change_reason TEXT,
    change_type TEXT, -- manual, automatic, competitor_based, ai_recommended
    changed_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Таблица стратегий ценообразования
CREATE TABLE IF NOT EXISTS pricing_strategies (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    strategy_type TEXT, -- aggressive, balanced, premium, ai_optimized
    min_margin_percent REAL DEFAULT 10.00,
    max_discount_percent REAL DEFAULT 20.00,
    competitor_factor REAL DEFAULT 1.00,
    demand_factor REAL DEFAULT 1.00,
    stock_factor REAL DEFAULT 1.00,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Таблица слотов поставок
CREATE TABLE IF NOT EXISTS delivery_slots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    warehouse_id TEXT,
    warehouse_name TEXT,
    warehouse_region TEXT,
    slot_date TEXT,
    time_slot TEXT,
    slot_type TEXT, -- FBS, FBO, Crossdocking
    capacity INTEGER,
    used_capacity INTEGER DEFAULT 0,
    price REAL,
    is_available INTEGER DEFAULT 1,
    ai_rating INTEGER DEFAULT 0, -- 0-100
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Таблица бронирований слотов
CREATE TABLE IF NOT EXISTS slot_bookings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    slot_id TEXT REFERENCES delivery_slots(id) ON DELETE CASCADE,
    booking_status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
    booking_date TEXT DEFAULT (datetime('now')),
    notes TEXT
);

-- Таблица алертов и уведомлений
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    alert_type TEXT, -- price_change, competitor_alert, slot_available, suspicious_activity
    title TEXT,
    message TEXT,
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    is_read INTEGER DEFAULT 0,
    action_required INTEGER DEFAULT 0,
    related_product_id TEXT REFERENCES products(id),
    related_slot_id TEXT REFERENCES delivery_slots(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Таблица аналитических данных
CREATE TABLE IF NOT EXISTS analytics_data (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    metric_type TEXT, -- sales, profit, views, conversions
    metric_value REAL,
    metric_date TEXT,
    additional_data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Таблица миграций
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    executed_at TEXT DEFAULT (datetime('now'))
);

-- Индексы для оптимизации производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_ozon_id ON products(ozon_product_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_competitors_product_id ON competitors(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_date ON delivery_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_available ON delivery_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_analytics_user_product ON analytics_data(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_data(metric_date);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_products_updated_at 
    AFTER UPDATE ON products
    FOR EACH ROW
    BEGIN
        UPDATE products SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_pricing_strategies_updated_at 
    AFTER UPDATE ON pricing_strategies
    FOR EACH ROW
    BEGIN
        UPDATE pricing_strategies SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_delivery_slots_updated_at 
    AFTER UPDATE ON delivery_slots
    FOR EACH ROW
    BEGIN
        UPDATE delivery_slots SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
