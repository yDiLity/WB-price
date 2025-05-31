const { query, transaction } = require('../database/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id;
    this.telegram_chat_id = data.telegram_chat_id;
    this.name = data.name;
    this.username = data.username;
    this.email = data.email;
    this.role = data.role;
    this.notifications_enabled = data.notifications_enabled;
    this.api_key = data.api_key;
    this.ozon_api_key = data.ozon_api_key;
    this.ozon_client_id = data.ozon_client_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.last_login = data.last_login;
    this.is_active = data.is_active;
  }

  // Создание нового пользователя
  static async create(userData) {
    try {
      const id = uuidv4();
      const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : null;
      const apiKey = 'api_' + Math.random().toString(36).substr(2, 16);

      const result = await query(`
        INSERT INTO users (
          id, telegram_chat_id, name, username, email, password_hash,
          role, notifications_enabled, api_key, ozon_api_key, ozon_client_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        id,
        userData.telegram_chat_id,
        userData.name,
        userData.username,
        userData.email,
        hashedPassword,
        userData.role || 'user',
        userData.notifications_enabled !== false,
        apiKey,
        userData.ozon_api_key,
        userData.ozon_client_id
      ]);

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Поиск пользователя по ID
  static async findById(id) {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Поиск пользователя по Telegram Chat ID
  static async findByTelegramChatId(chatId) {
    try {
      const result = await query('SELECT * FROM users WHERE telegram_chat_id = $1 AND is_active = true', [chatId]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by Telegram Chat ID:', error);
      throw error;
    }
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    try {
      const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Поиск пользователя по API ключу
  static async findByApiKey(apiKey) {
    try {
      const result = await query('SELECT * FROM users WHERE api_key = $1 AND is_active = true', [apiKey]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by API key:', error);
      throw error;
    }
  }

  // Аутентификация пользователя
  static async authenticate(email, password) {
    try {
      const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = new User(result.rows[0]);
      const isValidPassword = await bcrypt.compare(password, result.rows[0].password_hash);
      
      if (!isValidPassword) {
        return null;
      }

      // Обновляем время последнего входа
      await user.updateLastLogin();
      
      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Генерация JWT токена
  generateToken() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email, 
        role: this.role 
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
  }

  // Обновление времени последнего входа
  async updateLastLogin() {
    try {
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [this.id]);
      this.last_login = new Date();
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Обновление данных пользователя
  async update(updateData) {
    try {
      const allowedFields = [
        'name', 'username', 'email', 'notifications_enabled',
        'ozon_api_key', 'ozon_client_id'
      ];

      const updates = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        return this;
      }

      values.push(this.id);
      const result = await query(`
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Изменение пароля
  async changePassword(newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        hashedPassword,
        this.id
      ]);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Деактивация пользователя
  async deactivate() {
    try {
      await query('UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [this.id]);
      this.is_active = false;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Получение статистики пользователя
  async getStats() {
    try {
      const result = await query(`
        SELECT 
          (SELECT COUNT(*) FROM products WHERE user_id = $1 AND is_active = true) as products_count,
          (SELECT COUNT(*) FROM alerts WHERE user_id = $1 AND is_read = false) as unread_alerts,
          (SELECT COUNT(*) FROM slot_bookings WHERE user_id = $1) as slot_bookings,
          (SELECT AVG(current_price) FROM products WHERE user_id = $1 AND is_active = true) as avg_price
      `, [this.id]);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Получение всех пользователей (для админов)
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(`
        SELECT * FROM users 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows.map(row => new User(row));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Преобразование в JSON (без чувствительных данных)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
