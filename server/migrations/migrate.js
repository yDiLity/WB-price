const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('../database/config');

// Функция для выполнения миграций
async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    // Проверяем подключение к базе данных
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }
    
    // Читаем файл схемы
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing database schema...');
    
    // Разбиваем SQL на отдельные команды
    const commands = schemaSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    // Выполняем каждую команду отдельно
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        await query(command);
        console.log(`✅ Command ${i + 1}/${commands.length} executed successfully`);
      } catch (error) {
        // Игнорируем ошибки "already exists"
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Command ${i + 1}/${commands.length} skipped (already exists)`);
        } else {
          console.error(`❌ Command ${i + 1}/${commands.length} failed:`, error.message);
          throw error;
        }
      }
    }
    
    // Создаем таблицу для отслеживания миграций
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Записываем информацию о выполненной миграции
    await query(`
      INSERT INTO migrations (name) 
      VALUES ('initial_schema') 
      ON CONFLICT (name) DO NOTHING
    `);
    
    console.log('🎉 Database migrations completed successfully!');
    
    // Показываем статистику созданных таблиц
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Функция для отката миграций (для разработки)
async function rollbackMigrations() {
  console.log('🔄 Rolling back database migrations...');
  
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }
    
    // Получаем список всех таблиц
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('🗑️  Dropping tables...');
    
    // Удаляем все таблицы
    for (const row of tablesResult.rows) {
      await query(`DROP TABLE IF EXISTS ${row.table_name} CASCADE`);
      console.log(`   - Dropped table: ${row.table_name}`);
    }
    
    // Удаляем расширения
    await query('DROP EXTENSION IF EXISTS "uuid-ossp"');
    await query('DROP EXTENSION IF EXISTS "pg_trgm"');
    
    console.log('✅ Rollback completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    return false;
  }
}

// Функция для проверки статуса миграций
async function checkMigrationStatus() {
  try {
    const result = await query('SELECT * FROM migrations ORDER BY executed_at');
    console.log('📋 Migration status:');
    
    if (result.rows.length === 0) {
      console.log('   No migrations executed yet');
    } else {
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.name} - ${row.executed_at}`);
      });
    }
    
    return result.rows;
  } catch (error) {
    console.log('   ⚠️  Migrations table not found - database not initialized');
    return [];
  }
}

// Запуск миграций если файл вызван напрямую
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'rollback':
      rollbackMigrations().then(() => process.exit(0));
      break;
    case 'status':
      checkMigrationStatus().then(() => process.exit(0));
      break;
    default:
      runMigrations().then(() => process.exit(0));
  }
}

module.exports = {
  runMigrations,
  rollbackMigrations,
  checkMigrationStatus
};
