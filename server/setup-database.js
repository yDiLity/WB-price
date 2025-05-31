const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Функция для создания базы данных
async function createDatabase() {
  console.log('🔧 Setting up PostgreSQL database...');

  // Попробуем разные варианты подключения
  const connectionOptions = [
    {
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'Qazwsx123',
      port: 5432,
    },
    {
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'postgres',
      port: 5432,
    },
    {
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'admin',
      port: 5432,
    }
  ];

  let systemPool = null;
  let connectionSuccessful = false;

  for (const config of connectionOptions) {
    try {
      console.log(`🔍 Trying connection with user: ${config.user}, password: ${config.password ? '***' : 'empty'}`);
      systemPool = new Pool({
        ...config,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 5000,
      });

      await systemPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connection successful!');
      connectionSuccessful = true;
      break;
    } catch (error) {
      console.log(`❌ Failed with user ${config.user}:`, error.message);
      if (systemPool) {
        await systemPool.end();
        systemPool = null;
      }
    }
  }

  if (!connectionSuccessful) {
    throw new Error('Could not connect to PostgreSQL with any credentials');
  }

  try {

    // Проверяем, существует ли база данных
    const dbName = process.env.DB_NAME || 'ozon_price_optimizer';
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbExists = await systemPool.query(checkDbQuery, [dbName]);

    if (dbExists.rows.length === 0) {
      console.log(`📊 Creating database: ${dbName}`);
      await systemPool.query(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully!');
    } else {
      console.log(`📊 Database ${dbName} already exists`);
    }

    await systemPool.end();

    // Теперь подключаемся к нашей базе данных для создания схемы
    const appPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });

    // Читаем и выполняем SQL схему
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    try {
      // Выполняем весь SQL как одну команду
      await appPool.query(schemaSql);
      console.log('✅ Database schema created successfully!');
    } catch (error) {
      // Игнорируем ошибки "уже существует"
      if (!error.message.includes('already exists') &&
          !error.message.includes('уже существует') &&
          !error.message.includes('relation') &&
          !error.message.includes('отношение')) {
        console.warn('⚠️  SQL schema warning:', error.message);
      } else {
        console.log('✅ Database schema already exists, skipping...');
      }
    }

    // Добавляем тестовые данные
    console.log('📝 Adding test data...');
    await addTestData(appPool);

    await appPool.end();
    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('💡 Make sure PostgreSQL is running and credentials are correct');
    console.error('💡 Current settings:');
    console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`   Port: ${process.env.DB_PORT || 5432}`);
    console.error(`   User: ${process.env.DB_USER || 'postgres'}`);
    console.error(`   Database: ${process.env.DB_NAME || 'ozon_price_optimizer'}`);
    process.exit(1);
  }
}

// Функция для добавления тестовых данных
async function addTestData(pool) {
  try {
    // Добавляем тестового пользователя
    const userResult = await pool.query(`
      INSERT INTO users (telegram_chat_id, name, username, email, role, api_key)
      VALUES (123456789, 'Test User', 'testuser', 'test@example.com', 'admin', 'test_api_key_12345')
      ON CONFLICT (telegram_chat_id) DO NOTHING
      RETURNING id
    `);

    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      // Получаем существующего пользователя
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE telegram_chat_id = $1',
        [123456789]
      );
      userId = existingUser.rows[0].id;
    }

    // Добавляем тестовые категории
    try {
      await pool.query(`
        INSERT INTO categories (name, ozon_category_id, description, commission_rate)
        VALUES
          ('Электроника', 15621, 'Электронные товары и гаджеты', 5.00),
          ('Одежда', 7500, 'Мужская и женская одежда', 8.00),
          ('Дом и сад', 6000, 'Товары для дома и сада', 6.00)
      `);
    } catch (error) {
      // Игнорируем ошибки дублирования
      if (!error.message.includes('duplicate') && !error.message.includes('дублирует')) {
        console.warn('⚠️  Categories warning:', error.message);
      }
    }

    // Добавляем тестовые товары
    try {
      await pool.query(`
        INSERT INTO products (user_id, ozon_product_id, sku, name, current_price, cost_price, min_price, max_price, stock_quantity, rating, review_count, auto_pricing_enabled)
        VALUES
          ($1, 123456, 'SKU001', 'Смартфон Samsung Galaxy', 25000.00, 20000.00, 22000.00, 30000.00, 50, 4.5, 120, true),
          ($1, 123457, 'SKU002', 'Наушники Apple AirPods', 15000.00, 12000.00, 13000.00, 18000.00, 30, 4.8, 85, true),
          ($1, 123458, 'SKU003', 'Футболка хлопковая', 1500.00, 800.00, 1000.00, 2000.00, 100, 4.2, 45, false)
      `, [userId]);
    } catch (error) {
      // Игнорируем ошибки дублирования
      if (!error.message.includes('duplicate') && !error.message.includes('дублирует')) {
        console.warn('⚠️  Products warning:', error.message);
      }
    }

    // Добавляем тестовые слоты поставок
    try {
      await pool.query(`
        INSERT INTO delivery_slots (warehouse_id, warehouse_name, warehouse_region, slot_date, time_slot, slot_type, capacity, used_capacity, price, is_available, ai_rating, priority)
        VALUES
          ('WH001', 'Склад Москва-1', 'Московская область', CURRENT_DATE + INTERVAL '1 day', '09:00-12:00', 'FBS', 100, 25, 500.00, true, 85, 'high'),
          ('WH002', 'Склад СПб-1', 'Ленинградская область', CURRENT_DATE + INTERVAL '2 days', '14:00-17:00', 'FBO', 150, 50, 750.00, true, 92, 'critical'),
          ('WH003', 'Склад Екатеринбург', 'Свердловская область', CURRENT_DATE + INTERVAL '3 days', '10:00-13:00', 'Crossdocking', 80, 10, 400.00, true, 78, 'medium')
      `);
    } catch (error) {
      // Игнорируем ошибки дублирования
      if (!error.message.includes('duplicate') && !error.message.includes('дублирует')) {
        console.warn('⚠️  Delivery slots warning:', error.message);
      }
    }

    console.log('✅ Test data added successfully!');

  } catch (error) {
    console.error('⚠️  Error adding test data:', error.message);
  }
}

// Запускаем настройку
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };
