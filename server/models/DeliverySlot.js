const { query, transaction } = require('../database/config');
const { v4: uuidv4 } = require('uuid');

class DeliverySlot {
  constructor(data) {
    this.id = data.id;
    this.warehouse_id = data.warehouse_id;
    this.warehouse_name = data.warehouse_name;
    this.warehouse_region = data.warehouse_region;
    this.slot_date = data.slot_date;
    this.time_slot = data.time_slot;
    this.slot_type = data.slot_type;
    this.capacity = parseInt(data.capacity) || 0;
    this.used_capacity = parseInt(data.used_capacity) || 0;
    this.price = parseFloat(data.price) || 0;
    this.is_available = data.is_available;
    this.ai_rating = parseInt(data.ai_rating) || 0;
    this.priority = data.priority;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Создание нового слота
  static async create(slotData) {
    try {
      const id = uuidv4();
      
      const result = await query(`
        INSERT INTO delivery_slots (
          id, warehouse_id, warehouse_name, warehouse_region,
          slot_date, time_slot, slot_type, capacity, used_capacity,
          price, is_available, ai_rating, priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        id,
        slotData.warehouse_id,
        slotData.warehouse_name,
        slotData.warehouse_region,
        slotData.slot_date,
        slotData.time_slot,
        slotData.slot_type,
        slotData.capacity || 0,
        slotData.used_capacity || 0,
        slotData.price || 0,
        slotData.is_available !== false,
        slotData.ai_rating || 0,
        slotData.priority || 'medium'
      ]);

      return new DeliverySlot(result.rows[0]);
    } catch (error) {
      console.error('Error creating delivery slot:', error);
      throw error;
    }
  }

  // Поиск слота по ID
  static async findById(id) {
    try {
      const result = await query('SELECT * FROM delivery_slots WHERE id = $1', [id]);
      return result.rows.length > 0 ? new DeliverySlot(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding delivery slot by ID:', error);
      throw error;
    }
  }

  // Поиск доступных слотов с фильтрами
  static async findAvailable(filters = {}) {
    try {
      const {
        warehouse_id = null,
        warehouse_region = null,
        slot_type = null,
        date_from = null,
        date_to = null,
        min_capacity = null,
        max_price = null,
        priority = null,
        limit = 50,
        offset = 0,
        sort_by = 'slot_date',
        sort_order = 'ASC'
      } = filters;

      let whereClause = 'WHERE is_available = true';
      const params = [];
      let paramIndex = 1;

      if (warehouse_id) {
        whereClause += ` AND warehouse_id = $${paramIndex}`;
        params.push(warehouse_id);
        paramIndex++;
      }

      if (warehouse_region) {
        whereClause += ` AND warehouse_region ILIKE $${paramIndex}`;
        params.push(`%${warehouse_region}%`);
        paramIndex++;
      }

      if (slot_type) {
        whereClause += ` AND slot_type = $${paramIndex}`;
        params.push(slot_type);
        paramIndex++;
      }

      if (date_from) {
        whereClause += ` AND slot_date >= $${paramIndex}`;
        params.push(date_from);
        paramIndex++;
      }

      if (date_to) {
        whereClause += ` AND slot_date <= $${paramIndex}`;
        params.push(date_to);
        paramIndex++;
      }

      if (min_capacity) {
        whereClause += ` AND (capacity - used_capacity) >= $${paramIndex}`;
        params.push(min_capacity);
        paramIndex++;
      }

      if (max_price) {
        whereClause += ` AND price <= $${paramIndex}`;
        params.push(max_price);
        paramIndex++;
      }

      if (priority) {
        whereClause += ` AND priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      const result = await query(`
        SELECT *,
               (capacity - used_capacity) as available_capacity,
               CASE 
                 WHEN priority = 'critical' THEN 4
                 WHEN priority = 'high' THEN 3
                 WHEN priority = 'medium' THEN 2
                 ELSE 1
               END as priority_score
        FROM delivery_slots
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}, priority_score DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      return result.rows.map(row => {
        const slot = new DeliverySlot(row);
        slot.available_capacity = parseInt(row.available_capacity) || 0;
        slot.priority_score = parseInt(row.priority_score) || 1;
        return slot;
      });
    } catch (error) {
      console.error('Error finding available delivery slots:', error);
      throw error;
    }
  }

  // Получение слотов по складу
  static async findByWarehouse(warehouseId, options = {}) {
    try {
      const {
        date_from = null,
        date_to = null,
        include_unavailable = false,
        limit = 100,
        offset = 0
      } = options;

      let whereClause = 'WHERE warehouse_id = $1';
      const params = [warehouseId];
      let paramIndex = 2;

      if (!include_unavailable) {
        whereClause += ' AND is_available = true';
      }

      if (date_from) {
        whereClause += ` AND slot_date >= $${paramIndex}`;
        params.push(date_from);
        paramIndex++;
      }

      if (date_to) {
        whereClause += ` AND slot_date <= $${paramIndex}`;
        params.push(date_to);
        paramIndex++;
      }

      const result = await query(`
        SELECT *,
               (capacity - used_capacity) as available_capacity
        FROM delivery_slots
        ${whereClause}
        ORDER BY slot_date ASC, time_slot ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      return result.rows.map(row => {
        const slot = new DeliverySlot(row);
        slot.available_capacity = parseInt(row.available_capacity) || 0;
        return slot;
      });
    } catch (error) {
      console.error('Error finding slots by warehouse:', error);
      throw error;
    }
  }

  // Бронирование слота
  async book(userId, notes = '') {
    try {
      return await transaction(async (client) => {
        // Проверяем доступность слота
        const slotCheck = await client.query(
          'SELECT * FROM delivery_slots WHERE id = $1 FOR UPDATE',
          [this.id]
        );

        if (slotCheck.rows.length === 0) {
          throw new Error('Slot not found');
        }

        const slot = slotCheck.rows[0];
        if (!slot.is_available || slot.used_capacity >= slot.capacity) {
          throw new Error('Slot is not available');
        }

        // Создаем бронирование
        const bookingId = uuidv4();
        await client.query(`
          INSERT INTO slot_bookings (id, user_id, slot_id, booking_status, notes)
          VALUES ($1, $2, $3, $4, $5)
        `, [bookingId, userId, this.id, 'confirmed', notes]);

        // Увеличиваем использованную емкость
        const newUsedCapacity = slot.used_capacity + 1;
        const isStillAvailable = newUsedCapacity < slot.capacity;

        await client.query(`
          UPDATE delivery_slots 
          SET used_capacity = $1, is_available = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [newUsedCapacity, isStillAvailable, this.id]);

        this.used_capacity = newUsedCapacity;
        this.is_available = isStillAvailable;

        return {
          booking_id: bookingId,
          slot: this,
          status: 'confirmed'
        };
      });
    } catch (error) {
      console.error('Error booking delivery slot:', error);
      throw error;
    }
  }

  // Отмена бронирования
  async cancelBooking(bookingId) {
    try {
      return await transaction(async (client) => {
        // Проверяем существование бронирования
        const bookingCheck = await client.query(
          'SELECT * FROM slot_bookings WHERE id = $1 AND slot_id = $2',
          [bookingId, this.id]
        );

        if (bookingCheck.rows.length === 0) {
          throw new Error('Booking not found');
        }

        // Отменяем бронирование
        await client.query(`
          UPDATE slot_bookings 
          SET booking_status = 'cancelled'
          WHERE id = $1
        `, [bookingId]);

        // Уменьшаем использованную емкость
        const newUsedCapacity = Math.max(0, this.used_capacity - 1);
        
        await client.query(`
          UPDATE delivery_slots 
          SET used_capacity = $1, is_available = true, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [newUsedCapacity, this.id]);

        this.used_capacity = newUsedCapacity;
        this.is_available = true;

        return {
          booking_id: bookingId,
          slot: this,
          status: 'cancelled'
        };
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Обновление AI рейтинга слота
  async updateAIRating(rating, factors = {}) {
    try {
      await query(`
        UPDATE delivery_slots 
        SET ai_rating = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [rating, this.id]);

      this.ai_rating = rating;

      // Логируем факторы, влияющие на рейтинг
      if (Object.keys(factors).length > 0) {
        console.log(`AI Rating updated for slot ${this.id}:`, {
          rating,
          factors,
          warehouse: this.warehouse_name,
          date: this.slot_date,
          time: this.time_slot
        });
      }

      return this;
    } catch (error) {
      console.error('Error updating AI rating:', error);
      throw error;
    }
  }

  // Получение статистики по слоту
  async getBookingStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
          COUNT(CASE WHEN booking_status = 'pending' THEN 1 END) as pending_bookings
        FROM slot_bookings 
        WHERE slot_id = $1
      `, [this.id]);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting booking stats:', error);
      throw error;
    }
  }

  // Получение всех складов
  static async getWarehouses() {
    try {
      const result = await query(`
        SELECT DISTINCT 
          warehouse_id, 
          warehouse_name, 
          warehouse_region,
          COUNT(*) as total_slots,
          COUNT(CASE WHEN is_available = true THEN 1 END) as available_slots
        FROM delivery_slots 
        GROUP BY warehouse_id, warehouse_name, warehouse_region
        ORDER BY warehouse_name
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting warehouses:', error);
      throw error;
    }
  }

  // Получение статистики по датам
  static async getDateStats(days = 14) {
    try {
      const result = await query(`
        SELECT 
          slot_date,
          COUNT(*) as total_slots,
          COUNT(CASE WHEN is_available = true THEN 1 END) as available_slots,
          AVG(price) as avg_price,
          SUM(capacity - used_capacity) as total_capacity
        FROM delivery_slots 
        WHERE slot_date >= CURRENT_DATE 
        AND slot_date <= CURRENT_DATE + INTERVAL '${days} days'
        GROUP BY slot_date
        ORDER BY slot_date
      `);

      return result.rows.map(row => ({
        date: row.slot_date,
        totalSlots: parseInt(row.total_slots) || 0,
        availableSlots: parseInt(row.available_slots) || 0,
        avgPrice: parseFloat(row.avg_price) || 0,
        totalCapacity: parseInt(row.total_capacity) || 0
      }));
    } catch (error) {
      console.error('Error getting date stats:', error);
      throw error;
    }
  }

  // Проверка доступности
  isAvailable() {
    return this.is_available && this.used_capacity < this.capacity;
  }

  // Получение доступной емкости
  getAvailableCapacity() {
    return Math.max(0, this.capacity - this.used_capacity);
  }

  // Получение процента заполненности
  getOccupancyRate() {
    if (this.capacity <= 0) return 0;
    return (this.used_capacity / this.capacity) * 100;
  }
}

module.exports = DeliverySlot;
