const { query, transaction } = require('../database/config');
const { v4: uuidv4 } = require('uuid');

class Product {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.ozon_product_id = data.ozon_product_id;
    this.sku = data.sku;
    this.name = data.name;
    this.category_id = data.category_id;
    this.brand = data.brand;
    this.current_price = parseFloat(data.current_price) || 0;
    this.cost_price = parseFloat(data.cost_price) || 0;
    this.min_price = parseFloat(data.min_price) || 0;
    this.max_price = parseFloat(data.max_price) || 0;
    this.recommended_price = parseFloat(data.recommended_price) || 0;
    this.stock_quantity = parseInt(data.stock_quantity) || 0;
    this.rating = parseFloat(data.rating) || 0;
    this.review_count = parseInt(data.review_count) || 0;
    this.image_url = data.image_url;
    this.description = data.description;
    this.is_active = data.is_active;
    this.auto_pricing_enabled = data.auto_pricing_enabled;
    this.pricing_strategy = data.pricing_strategy;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Создание нового товара
  static async create(productData) {
    try {
      const id = uuidv4();
      
      const result = await query(`
        INSERT INTO products (
          id, user_id, ozon_product_id, sku, name, category_id, brand,
          current_price, cost_price, min_price, max_price, recommended_price,
          stock_quantity, rating, review_count, image_url, description,
          is_active, auto_pricing_enabled, pricing_strategy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `, [
        id,
        productData.user_id,
        productData.ozon_product_id,
        productData.sku,
        productData.name,
        productData.category_id,
        productData.brand,
        productData.current_price || 0,
        productData.cost_price || 0,
        productData.min_price || 0,
        productData.max_price || 0,
        productData.recommended_price || 0,
        productData.stock_quantity || 0,
        productData.rating || 0,
        productData.review_count || 0,
        productData.image_url,
        productData.description,
        productData.is_active !== false,
        productData.auto_pricing_enabled || false,
        productData.pricing_strategy || 'balanced'
      ]);

      return new Product(result.rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Поиск товара по ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1 AND p.is_active = true
      `, [id]);
      
      if (result.rows.length === 0) return null;
      
      const product = new Product(result.rows[0]);
      product.category_name = result.rows[0].category_name;
      return product;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      throw error;
    }
  }

  // Получение товаров пользователя
  static async findByUserId(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        search = '',
        category_id = null,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = options;

      let whereClause = 'WHERE p.user_id = $1 AND p.is_active = true';
      const params = [userId];
      let paramIndex = 2;

      if (search) {
        whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (category_id) {
        whereClause += ` AND p.category_id = $${paramIndex}`;
        params.push(category_id);
        paramIndex++;
      }

      const result = await query(`
        SELECT p.*, c.name as category_name,
               (SELECT COUNT(*) FROM competitors WHERE product_id = p.id AND is_active = true) as competitors_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.${sort_by} ${sort_order}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      return result.rows.map(row => {
        const product = new Product(row);
        product.category_name = row.category_name;
        product.competitors_count = parseInt(row.competitors_count) || 0;
        return product;
      });
    } catch (error) {
      console.error('Error finding products by user ID:', error);
      throw error;
    }
  }

  // Обновление цены товара
  async updatePrice(newPrice, changeReason = 'manual', changedBy = null) {
    try {
      return await transaction(async (client) => {
        // Сохраняем историю изменения цены
        await client.query(`
          INSERT INTO price_history (product_id, old_price, new_price, change_reason, change_type, changed_by)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [this.id, this.current_price, newPrice, changeReason, 'manual', changedBy]);

        // Обновляем цену товара
        const result = await client.query(`
          UPDATE products 
          SET current_price = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `, [newPrice, this.id]);

        if (result.rows.length > 0) {
          Object.assign(this, result.rows[0]);
        }

        return this;
      });
    } catch (error) {
      console.error('Error updating product price:', error);
      throw error;
    }
  }

  // Получение конкурентов товара
  async getCompetitors() {
    try {
      const result = await query(`
        SELECT * FROM competitors 
        WHERE product_id = $1 AND is_active = true
        ORDER BY price ASC
      `, [this.id]);

      return result.rows;
    } catch (error) {
      console.error('Error getting product competitors:', error);
      throw error;
    }
  }

  // Получение истории изменения цен
  async getPriceHistory(limit = 50) {
    try {
      const result = await query(`
        SELECT ph.*, u.name as changed_by_name
        FROM price_history ph
        LEFT JOIN users u ON ph.changed_by = u.id
        WHERE ph.product_id = $1
        ORDER BY ph.created_at DESC
        LIMIT $2
      `, [this.id, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  }

  // Расчет рекомендуемой цены на основе конкурентов
  async calculateRecommendedPrice() {
    try {
      const competitors = await this.getCompetitors();
      
      if (competitors.length === 0) {
        return this.current_price;
      }

      // Простая логика: средняя цена конкурентов с учетом стратегии
      const avgCompetitorPrice = competitors.reduce((sum, comp) => sum + parseFloat(comp.price), 0) / competitors.length;
      const minCompetitorPrice = Math.min(...competitors.map(comp => parseFloat(comp.price)));
      
      let recommendedPrice;
      
      switch (this.pricing_strategy) {
        case 'aggressive':
          // На 5% ниже минимальной цены конкурентов
          recommendedPrice = minCompetitorPrice * 0.95;
          break;
        case 'premium':
          // На 10% выше средней цены
          recommendedPrice = avgCompetitorPrice * 1.1;
          break;
        case 'balanced':
        default:
          // Средняя цена конкурентов
          recommendedPrice = avgCompetitorPrice;
          break;
      }

      // Проверяем ограничения
      if (this.min_price > 0 && recommendedPrice < this.min_price) {
        recommendedPrice = this.min_price;
      }
      if (this.max_price > 0 && recommendedPrice > this.max_price) {
        recommendedPrice = this.max_price;
      }

      // Обновляем рекомендуемую цену в базе
      await query(`
        UPDATE products 
        SET recommended_price = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [recommendedPrice, this.id]);

      this.recommended_price = recommendedPrice;
      return recommendedPrice;
    } catch (error) {
      console.error('Error calculating recommended price:', error);
      throw error;
    }
  }

  // Обновление данных товара
  async update(updateData) {
    try {
      const allowedFields = [
        'name', 'brand', 'current_price', 'cost_price', 'min_price', 'max_price',
        'stock_quantity', 'rating', 'review_count', 'image_url', 'description',
        'auto_pricing_enabled', 'pricing_strategy'
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
        UPDATE products 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Деактивация товара
  async deactivate() {
    try {
      await query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [this.id]);
      this.is_active = false;
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  }

  // Получение аналитики по товару
  async getAnalytics(days = 30) {
    try {
      const result = await query(`
        SELECT 
          metric_type,
          SUM(metric_value) as total_value,
          AVG(metric_value) as avg_value,
          COUNT(*) as data_points
        FROM analytics_data 
        WHERE product_id = $1 
        AND metric_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY metric_type
      `, [this.id]);

      return result.rows.reduce((acc, row) => {
        acc[row.metric_type] = {
          total: parseFloat(row.total_value) || 0,
          average: parseFloat(row.avg_value) || 0,
          dataPoints: parseInt(row.data_points) || 0
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting product analytics:', error);
      throw error;
    }
  }

  // Проверка прибыльности
  getMargin() {
    if (this.cost_price <= 0) return 0;
    return ((this.current_price - this.cost_price) / this.current_price) * 100;
  }

  // Проверка необходимости обновления цены
  needsPriceUpdate() {
    if (!this.auto_pricing_enabled) return false;
    if (this.recommended_price <= 0) return false;
    
    const priceDifference = Math.abs(this.current_price - this.recommended_price);
    const percentageDifference = (priceDifference / this.current_price) * 100;
    
    // Обновляем цену если разница больше 5%
    return percentageDifference > 5;
  }
}

module.exports = Product;
