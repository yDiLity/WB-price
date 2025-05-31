const { Pool } = require('pg');
require('dotenv').config();

// Конфигурация подключения к PostgreSQL
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ozon_price_optimizer',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  
  // Настройки пула соединений для высокой производительности
  max: 20, // максимальное количество соединений в пуле
  idleTimeoutMillis: 30000, // время ожидания перед закрытием неактивного соединения
  connectionTimeoutMillis: 2000, // время ожидания подключения
  
  // SSL настройки для продакшена
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

// Создание пула соединений
const pool = new Pool(dbConfig);

// Обработка ошибок подключения
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Функция для выполнения запросов с обработкой ошибок
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Логирование медленных запросов (> 100ms)
    if (duration > 100) {
      console.log('Slow query detected:', {
        text: text.substring(0, 100) + '...',
        duration: duration + 'ms',
        rows: res.rowCount
      });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', {
      text: text.substring(0, 100) + '...',
      error: error.message,
      duration: Date.now() - start + 'ms'
    });
    throw error;
  }
};

// Функция для получения клиента из пула (для транзакций)
const getClient = async () => {
  const client = await pool.connect();
  
  // Добавляем метод query с логированием
  const originalQuery = client.query;
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await originalQuery.call(client, text, params);
      const duration = Date.now() - start;
      
      if (duration > 100) {
        console.log('Slow transaction query:', {
          text: text.substring(0, 100) + '...',
          duration: duration + 'ms',
          rows: res.rowCount
        });
      }
      
      return res;
    } catch (error) {
      console.error('Transaction query error:', {
        text: text.substring(0, 100) + '...',
        error: error.message,
        duration: Date.now() - start + 'ms'
      });
      throw error;
    }
  };
  
  return client;
};

// Функция для выполнения транзакций
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Функция для проверки подключения к базе данных
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log('✅ PostgreSQL connection successful:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
    });
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

// Функция для получения статистики пула соединений
const getPoolStats = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    type: 'PostgreSQL'
  };
};

// Функция для корректного закрытия пула при завершении приложения
const closePool = async () => {
  try {
    await pool.end();
    console.log('PostgreSQL pool closed successfully');
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error);
  }
};

// Обработка сигналов завершения приложения
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  getPoolStats,
  closePool
};
