const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Путь к файлу базы данных SQLite
const dbPath = path.join(__dirname, '..', 'data', 'ozon_price_optimizer.db');

// Создаем директорию для данных если её нет
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Создание подключения к SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');

    // Настройка SQLite для лучшей производительности
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 1000000');
    db.run('PRAGMA temp_store = memory');
  }
});

// Функция для выполнения запросов (совместимость с PostgreSQL API)
const query = async (text, params = []) => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    try {
      // Преобразуем PostgreSQL синтаксис в SQLite
      let sqliteQuery = text
        .replace(/\$(\d+)/g, '?') // Заменяем $1, $2 на ?
        .replace(/RETURNING \*/g, '') // Убираем RETURNING *
        .replace(/uuid_generate_v4\(\)/g, "lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))")
        .replace(/CURRENT_TIMESTAMP/g, "datetime('now')")
        .replace(/CURRENT_DATE/g, "date('now')")
        .replace(/INTERVAL '(\d+) days'/g, "'+$1 days'")
        .replace(/ILIKE/g, 'LIKE')
        .replace(/BIGINT/g, 'INTEGER')
        .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL')
        .replace(/VARCHAR\(\d+\)/g, 'TEXT')
        .replace(/BOOLEAN/g, 'INTEGER')
        .replace(/JSONB/g, 'TEXT')
        .replace(/UUID/g, 'TEXT');

      if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
        // SELECT запросы
        db.all(sqliteQuery, params, (err, rows) => {
          if (err) {
            console.error('Database query error:', {
              text: text.substring(0, 100) + '...',
              error: err.message,
              duration: Date.now() - start + 'ms'
            });
            reject(err);
          } else {
            const duration = Date.now() - start;
            if (duration > 100) {
              console.log('Slow query detected:', {
                text: text.substring(0, 100) + '...',
                duration: duration + 'ms',
                rows: rows.length
              });
            }
            resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
          }
        });
      } else if (sqliteQuery.trim().toUpperCase().startsWith('INSERT')) {
        // INSERT запросы
        db.run(sqliteQuery, params, function(err) {
          if (err) {
            console.error('Database query error:', {
              text: text.substring(0, 100) + '...',
              error: err.message,
              duration: Date.now() - start + 'ms'
            });
            reject(err);
          } else {
            // Для INSERT с RETURNING эмулируем возврат данных
            if (text.includes('RETURNING')) {
              const tableName = text.match(/INSERT INTO (\w+)/i)?.[1];
              if (tableName && this.lastID) {
                db.get(`SELECT * FROM ${tableName} WHERE rowid = ?`, [this.lastID], (err, row) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({ rows: row ? [row] : [], rowCount: this.changes });
                  }
                });
              } else {
                resolve({ rows: [], rowCount: this.changes });
              }
            } else {
              resolve({ rows: [], rowCount: this.changes });
            }
          }
        });
      } else {
        // UPDATE, DELETE и другие запросы
        db.run(sqliteQuery, params, function(err) {
          if (err) {
            console.error('Database query error:', {
              text: text.substring(0, 100) + '...',
              error: err.message,
              duration: Date.now() - start + 'ms'
            });
            reject(err);
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        });
      }
    } catch (error) {
      console.error('Database query error:', {
        text: text.substring(0, 100) + '...',
        error: error.message,
        duration: Date.now() - start + 'ms'
      });
      reject(error);
    }
  });
};

// Функция для транзакций
const transaction = async (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }

        const client = {
          query: async (text, params) => {
            return query(text, params);
          }
        };

        Promise.resolve(callback(client))
          .then(result => {
            db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          })
          .catch(error => {
            db.run('ROLLBACK', () => {
              reject(error);
            });
          });
      });
    });
  });
};

// Функция для получения клиента (для совместимости)
const getClient = async () => {
  return {
    query: query,
    release: () => {} // SQLite не требует освобождения соединений
  };
};

// Функция для проверки подключения
const testConnection = async () => {
  try {
    const result = await query("SELECT datetime('now') as current_time, sqlite_version() as version");
    console.log('✅ SQLite connection successful:', {
      time: result.rows[0].current_time,
      version: 'SQLite ' + result.rows[0].version
    });
    return true;
  } catch (error) {
    console.error('❌ SQLite connection failed:', error.message);
    return false;
  }
};

// Функция для получения статистики
const getPoolStats = () => {
  return {
    totalCount: 1,
    idleCount: 1,
    waitingCount: 0,
    type: 'SQLite'
  };
};

// Функция для закрытия базы данных
const closePool = async () => {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing SQLite database:', err.message);
      } else {
        console.log('SQLite database closed successfully');
      }
      resolve();
    });
  });
};

// Обработка сигналов завершения приложения
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = {
  db,
  query,
  getClient,
  transaction,
  testConnection,
  getPoolStats,
  closePool
};
