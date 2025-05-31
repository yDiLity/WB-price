// In-Memory Database для демонстрации
// Простая реализация для быстрого тестирования без внешних зависимостей

const { v4: uuidv4 } = require('uuid');

// Хранилища данных в памяти
const tables = {
  users: new Map(),
  categories: new Map(),
  products: new Map(),
  competitors: new Map(),
  price_history: new Map(),
  pricing_strategies: new Map(),
  delivery_slots: new Map(),
  slot_bookings: new Map(),
  alerts: new Map(),
  analytics_data: new Map(),
  migrations: new Map()
};

// Функция для выполнения запросов (совместимость с PostgreSQL API)
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    // Простая обработка основных SQL команд
    const sqlUpper = text.trim().toUpperCase();
    
    if (sqlUpper.startsWith('SELECT NOW()') || sqlUpper.startsWith('SELECT DATETIME')) {
      // Проверка подключения
      return {
        rows: [{
          current_time: new Date().toISOString(),
          version: 'In-Memory Database v1.0'
        }],
        rowCount: 1
      };
    }
    
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM USERS')) {
      // Запросы к пользователям
      const users = Array.from(tables.users.values());
      return { rows: users, rowCount: users.length };
    }
    
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM PRODUCTS')) {
      // Запросы к товарам
      const products = Array.from(tables.products.values());
      return { rows: products, rowCount: products.length };
    }
    
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('FROM DELIVERY_SLOTS')) {
      // Запросы к слотам
      const slots = Array.from(tables.delivery_slots.values());
      return { rows: slots, rowCount: slots.length };
    }
    
    if (sqlUpper.includes('INSERT INTO USERS')) {
      // Создание пользователя
      const id = uuidv4();
      const user = {
        id,
        telegram_chat_id: params[1] || null,
        name: params[2] || 'Test User',
        username: params[3] || 'testuser',
        email: params[4] || 'test@example.com',
        password_hash: params[5] || null,
        role: params[6] || 'user',
        notifications_enabled: params[7] !== false,
        api_key: params[8] || 'api_' + Math.random().toString(36).substr(2, 16),
        ozon_api_key: params[9] || null,
        ozon_client_id: params[10] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        is_active: true
      };
      
      tables.users.set(id, user);
      return { rows: [user], rowCount: 1 };
    }
    
    if (sqlUpper.includes('INSERT INTO PRODUCTS')) {
      // Создание товара
      const id = uuidv4();
      const product = {
        id,
        user_id: params[1],
        ozon_product_id: params[2] || null,
        sku: params[3] || null,
        name: params[4] || 'Test Product',
        category_id: params[5] || null,
        brand: params[6] || null,
        current_price: parseFloat(params[7]) || 0,
        cost_price: parseFloat(params[8]) || 0,
        min_price: parseFloat(params[9]) || 0,
        max_price: parseFloat(params[10]) || 0,
        recommended_price: parseFloat(params[11]) || 0,
        stock_quantity: parseInt(params[12]) || 0,
        rating: parseFloat(params[13]) || 0,
        review_count: parseInt(params[14]) || 0,
        image_url: params[15] || null,
        description: params[16] || null,
        is_active: params[17] !== false,
        auto_pricing_enabled: params[18] || false,
        pricing_strategy: params[19] || 'balanced',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tables.products.set(id, product);
      return { rows: [product], rowCount: 1 };
    }
    
    if (sqlUpper.includes('INSERT INTO DELIVERY_SLOTS')) {
      // Создание слота
      const id = uuidv4();
      const slot = {
        id,
        warehouse_id: params[1] || 'DEMO001',
        warehouse_name: params[2] || 'Demo Warehouse',
        warehouse_region: params[3] || 'Demo Region',
        slot_date: params[4] || new Date().toISOString().split('T')[0],
        time_slot: params[5] || '09:00-12:00',
        slot_type: params[6] || 'FBS',
        capacity: parseInt(params[7]) || 10,
        used_capacity: parseInt(params[8]) || 0,
        price: parseFloat(params[9]) || 0,
        is_available: params[10] !== false,
        ai_rating: parseInt(params[11]) || 0,
        priority: params[12] || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tables.delivery_slots.set(id, slot);
      return { rows: [slot], rowCount: 1 };
    }
    
    // Для остальных запросов возвращаем пустой результат
    console.log('Unhandled query:', text.substring(0, 100) + '...');
    return { rows: [], rowCount: 0 };
    
  } catch (error) {
    console.error('Memory database query error:', {
      text: text.substring(0, 100) + '...',
      error: error.message,
      duration: Date.now() - start + 'ms'
    });
    throw error;
  }
};

// Функция для транзакций
const transaction = async (callback) => {
  // В in-memory базе транзакции не нужны, просто выполняем callback
  const client = {
    query: async (text, params) => {
      return query(text, params);
    }
  };
  
  return callback(client);
};

// Функция для получения клиента (для совместимости)
const getClient = async () => {
  return {
    query: query,
    release: () => {} // Ничего не делаем
  };
};

// Функция для проверки подключения
const testConnection = async () => {
  try {
    const result = await query("SELECT datetime('now') as current_time, 'In-Memory' as version");
    console.log('✅ In-Memory database connection successful:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version
    });
    return true;
  } catch (error) {
    console.error('❌ In-Memory database connection failed:', error.message);
    return false;
  }
};

// Функция для получения статистики
const getPoolStats = () => {
  return {
    totalCount: 1,
    idleCount: 1,
    waitingCount: 0,
    type: 'In-Memory',
    tablesCount: Object.keys(tables).length,
    recordsCount: Object.values(tables).reduce((sum, table) => sum + table.size, 0)
  };
};

// Функция для закрытия базы данных
const closePool = async () => {
  try {
    // Очищаем все таблицы
    Object.values(tables).forEach(table => table.clear());
    console.log('In-Memory database cleared successfully');
  } catch (error) {
    console.error('Error clearing In-Memory database:', error);
  }
};

// Функция для заполнения тестовыми данными
const seedTestData = async () => {
  console.log('🌱 Seeding test data...');
  
  try {
    // Создаем тестового пользователя
    const userId = uuidv4();
    const testUser = {
      id: userId,
      telegram_chat_id: 123456789,
      name: 'Тестовый Пользователь',
      username: 'test_user',
      email: 'test@example.com',
      password_hash: '$2b$10$example.hash',
      role: 'admin',
      notifications_enabled: true,
      api_key: 'test_api_key_12345',
      ozon_api_key: 'ozon_test_key',
      ozon_client_id: 'ozon_test_client',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
      is_active: true
    };
    
    tables.users.set(userId, testUser);
    
    // Создаем тестовые товары
    const products = [
      {
        name: 'Смартфон Samsung Galaxy A54',
        sku: 'SAMSUNG-A54-128GB',
        current_price: 25990,
        cost_price: 20000,
        min_price: 23000,
        max_price: 30000,
        auto_pricing_enabled: true
      },
      {
        name: 'Кроссовки Nike Air Max 270',
        sku: 'NIKE-AM270-42',
        current_price: 8990,
        cost_price: 6500,
        min_price: 7500,
        max_price: 12000,
        auto_pricing_enabled: true
      },
      {
        name: 'Кофеварка Philips HD7434',
        sku: 'PHILIPS-HD7434',
        current_price: 4590,
        cost_price: 3200,
        min_price: 3800,
        max_price: 6000,
        auto_pricing_enabled: false
      }
    ];
    
    products.forEach(productData => {
      const productId = uuidv4();
      const product = {
        id: productId,
        user_id: userId,
        ozon_product_id: Math.floor(Math.random() * 10000) + 1000,
        sku: productData.sku,
        name: productData.name,
        category_id: null,
        brand: productData.name.split(' ')[0],
        current_price: productData.current_price,
        cost_price: productData.cost_price,
        min_price: productData.min_price,
        max_price: productData.max_price,
        recommended_price: productData.current_price,
        stock_quantity: Math.floor(Math.random() * 20) + 5,
        rating: (Math.random() * 2) + 3,
        review_count: Math.floor(Math.random() * 100) + 10,
        image_url: null,
        description: `Описание товара: ${productData.name}`,
        is_active: true,
        auto_pricing_enabled: productData.auto_pricing_enabled,
        pricing_strategy: 'balanced',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tables.products.set(productId, product);
    });
    
    // Создаем тестовые слоты
    const today = new Date();
    for (let i = 1; i <= 10; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      
      const slotId = uuidv4();
      const slot = {
        id: slotId,
        warehouse_id: `DEMO00${i % 3 + 1}`,
        warehouse_name: `Склад ${i % 3 + 1}`,
        warehouse_region: ['Московская область', 'СПб', 'Екатеринбург'][i % 3],
        slot_date: slotDate.toISOString().split('T')[0],
        time_slot: ['09:00-12:00', '12:00-15:00', '15:00-18:00'][i % 3],
        slot_type: Math.random() > 0.5 ? 'FBS' : 'FBO',
        capacity: Math.floor(Math.random() * 50) + 10,
        used_capacity: Math.floor(Math.random() * 20),
        price: Math.floor(Math.random() * 500) + 200,
        is_available: Math.random() > 0.3,
        ai_rating: Math.floor(Math.random() * 100),
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tables.delivery_slots.set(slotId, slot);
    }
    
    console.log('✅ Test data seeded successfully!');
    console.log(`📊 Created: ${tables.users.size} users, ${tables.products.size} products, ${tables.delivery_slots.size} slots`);
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    return false;
  }
};

module.exports = {
  query,
  getClient,
  transaction,
  testConnection,
  getPoolStats,
  closePool,
  seedTestData,
  tables // Экспортируем для прямого доступа к данным
};
