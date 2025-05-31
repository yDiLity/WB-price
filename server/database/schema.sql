-- Ozon Price Optimizer Pro Database Schema
-- Создание базы данных для системы оптимизации цен

-- Расширения PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_chat_id BIGINT UNIQUE,
    name VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    notifications_enabled BOOLEAN DEFAULT true,
    api_key VARCHAR(255) UNIQUE,
    ozon_api_key VARCHAR(255),
    ozon_client_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Таблица категорий товаров
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ozon_category_id BIGINT,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ozon_product_id BIGINT,
    sku VARCHAR(255),
    name VARCHAR(500) NOT NULL,
    category_id UUID REFERENCES categories(id),
    brand VARCHAR(255),
    current_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    recommended_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_pricing_enabled BOOLEAN DEFAULT false,
    pricing_strategy VARCHAR(50) DEFAULT 'balanced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица конкурентов
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ozon_seller_id BIGINT,
    price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    stock_status VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Таблица истории изменения цен
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_reason VARCHAR(255),
    change_type VARCHAR(50), -- manual, automatic, competitor_based, ai_recommended
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица стратегий ценообразования
CREATE TABLE pricing_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type VARCHAR(50), -- aggressive, balanced, premium, ai_optimized
    min_margin_percent DECIMAL(5,2) DEFAULT 10.00,
    max_discount_percent DECIMAL(5,2) DEFAULT 20.00,
    competitor_factor DECIMAL(3,2) DEFAULT 1.00,
    demand_factor DECIMAL(3,2) DEFAULT 1.00,
    stock_factor DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица слотов поставок
CREATE TABLE delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id VARCHAR(255),
    warehouse_name VARCHAR(255),
    warehouse_region VARCHAR(255),
    slot_date DATE,
    time_slot VARCHAR(50),
    slot_type VARCHAR(50), -- FBS, FBO, Crossdocking
    capacity INTEGER,
    used_capacity INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    ai_rating INTEGER DEFAULT 0, -- 0-100
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица бронирований слотов
CREATE TABLE slot_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES delivery_slots(id) ON DELETE CASCADE,
    booking_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Таблица алертов и уведомлений
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50), -- price_change, competitor_alert, slot_available, suspicious_activity
    title VARCHAR(255),
    message TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    is_read BOOLEAN DEFAULT false,
    action_required BOOLEAN DEFAULT false,
    related_product_id UUID REFERENCES products(id),
    related_slot_id UUID REFERENCES delivery_slots(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица аналитических данных
CREATE TABLE analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    metric_type VARCHAR(50), -- sales, profit, views, conversions
    metric_value DECIMAL(15,2),
    metric_date DATE,
    additional_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации производительности
CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_ozon_id ON products(ozon_product_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_competitors_product_id ON competitors(product_id);
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_created_at ON price_history(created_at);
CREATE INDEX idx_delivery_slots_date ON delivery_slots(slot_date);
CREATE INDEX idx_delivery_slots_available ON delivery_slots(is_available);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_unread ON alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_analytics_user_product ON analytics_data(user_id, product_id);
CREATE INDEX idx_analytics_date ON analytics_data(metric_date);

-- Триггеры для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_strategies_updated_at BEFORE UPDATE ON pricing_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_slots_updated_at BEFORE UPDATE ON delivery_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
