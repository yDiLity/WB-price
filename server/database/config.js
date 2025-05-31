require('dotenv').config();

// Определяем тип базы данных
const DB_TYPE = process.env.DATABASE_TYPE || process.env.DB_TYPE || 'memory'; // auto, postgresql, sqlite, memory

// Функция для автоматического определения доступной БД
async function detectAvailableDatabase() {
  // Если явно указан memory, используем его
  if (DB_TYPE === 'memory') {
    console.log('🧠 Using In-Memory database as specified');
    return 'memory';
  }

  // Сначала пробуем PostgreSQL
  if (DB_TYPE === 'auto' || DB_TYPE === 'postgresql') {
    try {
      const { Pool } = require('pg');
      const testPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'ozon_price_optimizer',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        connectionTimeoutMillis: 2000
      });

      await testPool.query('SELECT NOW()');
      await testPool.end();
      console.log('🔍 PostgreSQL detected and available');
      return 'postgresql';
    } catch (error) {
      console.log('⚠️  PostgreSQL not available:', error.message);
    }
  }

  // Если PostgreSQL недоступен, используем In-Memory
  console.log('🔄 Falling back to In-Memory database');
  return 'memory';
}

// Экспортируем конфигурацию в зависимости от доступной БД
let dbConfig;

async function initializeDatabase() {
  const dbType = await detectAvailableDatabase();

  if (dbType === 'postgresql') {
    console.log('📊 Using PostgreSQL database');
    dbConfig = require('./postgresql-config');
  } else if (dbType === 'sqlite') {
    console.log('📁 Using SQLite database');
    dbConfig = require('./sqlite-config');
  } else {
    console.log('🧠 Using In-Memory database');
    dbConfig = require('./memory-config');

    // Заполняем тестовыми данными
    await dbConfig.seedTestData();
  }

  return dbConfig;
}

module.exports = { initializeDatabase };
