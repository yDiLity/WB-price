// 🛒 Wildberries API Service
// Интеграция с API Wildberries для получения данных о товарах

import { securityService } from './securityService'

export interface WBProduct {
  nmID: number
  vendorCode: string
  brand: string
  title: string
  photos: string[]
  video: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  characteristics: Array<{
    id: number
    name: string
    value: string
  }>
  sizes: Array<{
    chrtID: number
    techSize: string
    wbSize: string
    price: number
    discountedPrice: number
    qty: number
  }>
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface WBPriceInfo {
  nmId: number
  price: number
  discount: number
  promoCode: number
}

export interface WBStock {
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  isSupply: boolean
  isRealization: boolean
  quantityFull: number
  warehouse: number
  nmId: number
  subject: string
  category: string
  brand: string
  SCCode: string
  Price: number
  Discount: number
}

class WildberriesApiService {
  private baseUrl = 'https://suppliers-api.wildberries.ru'
  private contentBaseUrl = 'https://content-api.wildberries.ru'
  private statisticsBaseUrl = 'https://statistics-api.wildberries.ru'
  private advertisingBaseUrl = 'https://advert-api.wildberries.ru'

  private apiKey: string | null = null

  constructor() {
    // Получаем API ключ из localStorage или переменных окружения
    this.apiKey = localStorage.getItem('wb_api_key') || import.meta.env.VITE_WB_API_KEY || null
  }

  // 🔑 Установка API ключа
  setApiKey(key: string) {
    this.apiKey = key
    localStorage.setItem('wb_api_key', key)
  }

  // 🔑 Получение API ключа
  getApiKey(): string | null {
    return this.apiKey
  }

  // 🔑 Проверка наличия API ключа
  hasApiKey(): boolean {
    return !!this.apiKey
  }

  // 📦 Получение списка товаров
  async getProducts(limit = 100, offset = 0): Promise<WBProduct[]> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      console.log('🛡️ Безопасный запрос товаров WB через securityService')
      const response = await securityService.secureRequest(`${this.contentBaseUrl}/content/v1/cards/cursor/list`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sort: {
            cursor: {
              limit: limit,
              offset: offset
            },
            filter: {
              withPhoto: -1
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data.data?.cards || []
    } catch (error) {
      console.error('Ошибка получения товаров:', error)
      throw error
    }
  }

  // 💰 Получение информации о ценах
  async getPrices(): Promise<WBPriceInfo[]> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      console.log('🛡️ Безопасный запрос цен WB через securityService')
      const response = await securityService.secureRequest(`${this.baseUrl}/public/api/v1/info`, {
        headers: {
          'Authorization': this.apiKey,
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data || []
    } catch (error) {
      console.error('Ошибка получения цен:', error)
      throw error
    }
  }

  // 📊 Получение остатков товаров
  async getStocks(dateFrom?: string): Promise<WBStock[]> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      const params = new URLSearchParams()
      if (dateFrom) {
        params.append('dateFrom', dateFrom)
      }

      const response = await fetch(`${this.baseUrl}/api/v3/stocks/${params.toString() ? '?' + params.toString() : ''}`, {
        headers: {
          'Authorization': this.apiKey,
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data || []
    } catch (error) {
      console.error('Ошибка получения остатков:', error)
      throw error
    }
  }

  // 💰 Обновление цен товаров
  async updatePrices(prices: Array<{ nmId: number; price: number }>): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      const response = await fetch(`${this.baseUrl}/public/api/v1/prices`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prices)
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Ошибка обновления цен:', error)
      throw error
    }
  }

  // 📈 Получение статистики продаж
  async getSalesStatistics(dateFrom: string, dateTo: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      const response = await fetch(`${this.statisticsBaseUrl}/api/v1/supplier/sales?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
        headers: {
          'Authorization': this.apiKey,
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data || []
    } catch (error) {
      console.error('Ошибка получения статистики:', error)
      throw error
    }
  }

  // 🔍 Поиск товаров конкурентов (публичный API) - КРИТИЧНО ВАЖНО ДЛЯ БЕЗОПАСНОСТИ!
  async searchCompetitorProducts(query: string): Promise<any[]> {
    try {
      console.log('🛡️ КРИТИЧЕСКИЙ запрос поиска конкурентов WB через securityService')
      console.log('🔒 Применяются ВСЕ защиты: прокси, задержки, User-Agent, кеширование')

      // Используем публичный поиск WB (без API ключа) через безопасный сервис
      const url = `https://search.wb.ru/exactmatch/ru/common/v4/search?appType=1&curr=rub&dest=-1257786&query=${encodeURIComponent(query)}&resultset=catalog&sort=popular&spp=0&suppressSpellcheck=false`
      const response = await securityService.secureRequest(url)

      if (!response.ok) {
        throw new Error(`Ошибка поиска: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Поиск конкурентов выполнен безопасно')
      return data.data?.products || []
    } catch (error) {
      console.error('🚫 Ошибка поиска конкурентов:', error)
      throw error
    }
  }

  // 🏪 Получение информации о складах
  async getWarehouses(): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v3/warehouses`, {
        headers: {
          'Authorization': this.apiKey,
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data || []
    } catch (error) {
      console.error('Ошибка получения складов:', error)
      throw error
    }
  }

  // 🚚 Получение информации о поставках
  async getSupplies(): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v3/supplies`, {
        headers: {
          'Authorization': this.apiKey,
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      return data || []
    } catch (error) {
      console.error('Ошибка получения поставок:', error)
      throw error
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const wildberriesApi = new WildberriesApiService()
export default wildberriesApi
