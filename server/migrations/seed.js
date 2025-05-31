const { query, transaction, testConnection } = require('../database/config');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Функция для заполнения базы данных тестовыми данными
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }
    
    await transaction(async (client) => {
      // 1. Создаем тестового пользователя
      console.log('👤 Creating test users...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userId = uuidv4();
      
      await client.query(`
        INSERT INTO users (id, telegram_chat_id, name, username, email, password_hash, role, api_key, ozon_api_key, ozon_client_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO NOTHING
      `, [
        userId,
        123456789,
        'Тестовый Пользователь',
        'test_user',
        'test@example.com',
        hashedPassword,
        'admin',
        'api_key_' + Math.random().toString(36).substr(2, 9),
        'ozon_api_key_test',
        'ozon_client_id_test'
      ]);
      
      // 2. Создаем категории товаров
      console.log('📂 Creating product categories...');
      
      const categories = [
        { name: 'Электроника', ozon_category_id: 15621, commission_rate: 8.5 },
        { name: 'Одежда и обувь', ozon_category_id: 7500, commission_rate: 12.0 },
        { name: 'Дом и сад', ozon_category_id: 6500, commission_rate: 10.0 },
        { name: 'Красота и здоровье', ozon_category_id: 6000, commission_rate: 15.0 },
        { name: 'Спорт и отдых', ozon_category_id: 9200, commission_rate: 11.0 }
      ];
      
      const categoryIds = {};
      for (const category of categories) {
        const categoryId = uuidv4();
        categoryIds[category.name] = categoryId;
        
        await client.query(`
          INSERT INTO categories (id, name, ozon_category_id, commission_rate)
          VALUES ($1, $2, $3, $4)
        `, [categoryId, category.name, category.ozon_category_id, category.rate]);
      }
      
      // 3. Создаем тестовые товары
      console.log('📦 Creating test products...');
      
      const products = [
        {
          name: 'Смартфон Samsung Galaxy A54',
          category: 'Электроника',
          sku: 'SAMSUNG-A54-128GB',
          ozon_product_id: 1001,
          current_price: 25990,
          cost_price: 20000,
          min_price: 23000,
          max_price: 30000,
          stock_quantity: 15,
          rating: 4.5,
          review_count: 127
        },
        {
          name: 'Кроссовки Nike Air Max 270',
          category: 'Одежда и обувь',
          sku: 'NIKE-AM270-42',
          ozon_product_id: 1002,
          current_price: 8990,
          cost_price: 6500,
          min_price: 7500,
          max_price: 12000,
          stock_quantity: 8,
          rating: 4.7,
          review_count: 89
        },
        {
          name: 'Кофеварка Philips HD7434',
          category: 'Дом и сад',
          sku: 'PHILIPS-HD7434',
          ozon_product_id: 1003,
          current_price: 4590,
          cost_price: 3200,
          min_price: 3800,
          max_price: 6000,
          stock_quantity: 12,
          rating: 4.3,
          review_count: 45
        }
      ];
      
      const productIds = [];
      for (const product of products) {
        const productId = uuidv4();
        productIds.push(productId);
        
        await client.query(`
          INSERT INTO products (
            id, user_id, ozon_product_id, sku, name, category_id,
            current_price, cost_price, min_price, max_price,
            stock_quantity, rating, review_count, auto_pricing_enabled
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          productId, userId, product.ozon_product_id, product.sku, product.name,
          categoryIds[product.category], product.current_price, product.cost_price,
          product.min_price, product.max_price, product.stock_quantity,
          product.rating, product.review_count, true
        ]);
      }
      
      // 4. Создаем конкурентов
      console.log('🏪 Creating competitors...');
      
      const competitors = [
        { product_idx: 0, name: 'TechStore', price: 24990, rating: 4.2, review_count: 89 },
        { product_idx: 0, name: 'ElectroWorld', price: 26500, rating: 4.6, review_count: 156 },
        { product_idx: 1, name: 'SportShop', price: 8500, rating: 4.4, review_count: 67 },
        { product_idx: 1, name: 'RunningGear', price: 9200, rating: 4.8, review_count: 134 },
        { product_idx: 2, name: 'HomeAppliances', price: 4200, rating: 4.1, review_count: 23 }
      ];
      
      for (const competitor of competitors) {
        await client.query(`
          INSERT INTO competitors (product_id, name, price, rating, review_count, stock_status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          productIds[competitor.product_idx],
          competitor.name,
          competitor.price,
          competitor.rating,
          competitor.review_count,
          'in_stock'
        ]);
      }
      
      // 5. Создаем стратегии ценообразования
      console.log('💰 Creating pricing strategies...');
      
      const strategies = [
        {
          name: 'Агрессивная',
          strategy_type: 'aggressive',
          min_margin_percent: 5.0,
          max_discount_percent: 25.0,
          competitor_factor: 0.95
        },
        {
          name: 'Сбалансированная',
          strategy_type: 'balanced',
          min_margin_percent: 15.0,
          max_discount_percent: 15.0,
          competitor_factor: 1.0
        },
        {
          name: 'Премиум',
          strategy_type: 'premium',
          min_margin_percent: 25.0,
          max_discount_percent: 5.0,
          competitor_factor: 1.05
        }
      ];
      
      for (const strategy of strategies) {
        await client.query(`
          INSERT INTO pricing_strategies (
            user_id, name, description, strategy_type,
            min_margin_percent, max_discount_percent, competitor_factor
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          userId,
          strategy.name,
          `Стратегия ${strategy.name.toLowerCase()} ценообразования`,
          strategy.strategy_type,
          strategy.min_margin_percent,
          strategy.max_discount_percent,
          strategy.competitor_factor
        ]);
      }
      
      // 6. Создаем слоты поставок
      console.log('🚚 Creating delivery slots...');
      
      const warehouses = [
        { id: 'MSK001', name: 'Москва Север', region: 'Московская область' },
        { id: 'SPB001', name: 'СПб Пулково', region: 'Ленинградская область' },
        { id: 'EKB001', name: 'Екатеринбург', region: 'Свердловская область' }
      ];
      
      const today = new Date();
      for (let i = 1; i <= 14; i++) {
        const slotDate = new Date(today);
        slotDate.setDate(today.getDate() + i);
        
        for (const warehouse of warehouses) {
          for (const timeSlot of ['09:00-12:00', '12:00-15:00', '15:00-18:00']) {
            await client.query(`
              INSERT INTO delivery_slots (
                warehouse_id, warehouse_name, warehouse_region,
                slot_date, time_slot, slot_type, capacity, used_capacity,
                price, is_available, ai_rating, priority
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              warehouse.id,
              warehouse.name,
              warehouse.region,
              slotDate.toISOString().split('T')[0],
              timeSlot,
              Math.random() > 0.5 ? 'FBS' : 'FBO',
              Math.floor(Math.random() * 50) + 10,
              Math.floor(Math.random() * 20),
              Math.floor(Math.random() * 500) + 200,
              Math.random() > 0.3,
              Math.floor(Math.random() * 100),
              ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
            ]);
          }
        }
      }
      
      console.log('✅ Database seeding completed successfully!');
    });
    
    // Показываем статистику
    const stats = await getDatabaseStats();
    console.log('📊 Database statistics:');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   - ${table}: ${count} records`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    return false;
  }
}

// Функция для получения статистики базы данных
async function getDatabaseStats() {
  const tables = [
    'users', 'categories', 'products', 'competitors',
    'pricing_strategies', 'delivery_slots', 'alerts'
  ];
  
  const stats = {};
  
  for (const table of tables) {
    try {
      const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = parseInt(result.rows[0].count);
    } catch (error) {
      stats[table] = 0;
    }
  }
  
  return stats;
}

// Функция для очистки тестовых данных
async function clearTestData() {
  console.log('🧹 Clearing test data...');
  
  try {
    const tables = [
      'alerts', 'analytics_data', 'slot_bookings', 'delivery_slots',
      'price_history', 'competitors', 'products', 'pricing_strategies',
      'categories', 'users'
    ];
    
    for (const table of tables) {
      await query(`DELETE FROM ${table}`);
      console.log(`   - Cleared table: ${table}`);
    }
    
    console.log('✅ Test data cleared successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    return false;
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'clear':
      clearTestData().then(() => process.exit(0));
      break;
    case 'stats':
      getDatabaseStats().then(stats => {
        console.log('📊 Database statistics:', stats);
        process.exit(0);
      });
      break;
    default:
      seedDatabase().then(() => process.exit(0));
  }
}

module.exports = {
  seedDatabase,
  clearTestData,
  getDatabaseStats
};
