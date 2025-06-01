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

  // 🔍 Поиск товаров конкурентов - РЕАЛЬНЫЙ ПАРСИНГ через сервер!
  async searchCompetitorProducts(query: string): Promise<any[]> {
    try {
      console.log('🛡️ РЕАЛЬНЫЙ поиск конкурентов WB через серверный прокси')

      // Используем серверный прокси для реального парсинга
      const response = await fetch(`/api/wb/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`Ошибка поиска конкурентов: ${response.status}`)
      }

      const products = await response.json()
      console.log('✅ РЕАЛЬНЫЙ поиск конкурентов выполнен через сервер:', products.length)
      return products
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

  // 📂 Получение категорий (предметов) из API
  async getCategories(): Promise<any[]> {
    try {
      console.log('🛡️ Безопасный запрос категорий WB через securityService')

      // Используем публичный API для получения категорий
      const response = await securityService.secureRequest(`${this.contentBaseUrl}/content/v2/directory/tnved`, {
        headers: {
          'Authorization': this.apiKey || '',
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Категории получены:', data)
      return data || []
    } catch (error) {
      console.error('🚫 Ошибка получения категорий:', error)
      throw error
    }
  }

  // 📋 Получение предметов (subjects)
  async getSubjects(): Promise<any[]> {
    try {
      console.log('🛡️ Безопасный запрос предметов WB через securityService')

      const response = await securityService.secureRequest(`${this.contentBaseUrl}/content/v2/object/all`, {
        headers: {
          'Authorization': this.apiKey || '',
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Предметы получены:', data)
      return data || []
    } catch (error) {
      console.error('🚫 Ошибка получения предметов:', error)
      throw error
    }
  }

  // 🏷️ Получение характеристик для предмета
  async getCharacteristics(subjectId: number): Promise<any[]> {
    try {
      console.log('🛡️ Безопасный запрос характеристик WB через securityService')

      const response = await securityService.secureRequest(`${this.contentBaseUrl}/content/v2/object/charcs/${subjectId}`, {
        headers: {
          'Authorization': this.apiKey || '',
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Характеристики получены:', data)
      return data || []
    } catch (error) {
      console.error('🚫 Ошибка получения характеристик:', error)
      throw error
    }
  }

  // 🌐 ПУБЛИЧНОЕ API WILDBERRIES (БЕЗ КЛЮЧА)

  // 📦 Получение данных о товаре по ID (публичное API) - РЕАЛЬНЫЙ ПАРСИНГ через сервер!
  async getPublicProductById(productId: number): Promise<any> {
    try {
      console.log('🌐 РЕАЛЬНЫЙ запрос товара WB по ID через серверный прокси:', productId)

      // Используем серверный прокси для обхода CORS
      const response = await fetch(`/api/wb/product/${productId}`)

      if (!response.ok) {
        throw new Error(`Ошибка серверного API: ${response.status}`)
      }

      const product = await response.json()
      console.log('✅ РЕАЛЬНЫЕ данные товара получены через сервер:', product.name)
      return product
    } catch (error) {
      console.error('🚫 Ошибка получения публичных данных товара:', error)
      throw error
    }
  }

  // 🔍 Публичный поиск товаров - РЕАЛЬНЫЙ ПАРСИНГ через сервер!
  async publicSearchProducts(query: string, page: number = 1): Promise<any[]> {
    try {
      console.log('🌐 РЕАЛЬНЫЙ поиск товаров WB через серверный прокси:', query)

      // Используем серверный прокси для обхода CORS
      const response = await fetch(`/api/wb/search?q=${encodeURIComponent(query)}&page=${page}`)

      if (!response.ok) {
        throw new Error(`Ошибка серверного поиска: ${response.status}`)
      }

      const products = await response.json()
      console.log('✅ РЕАЛЬНЫЙ поиск через сервер: найдено товаров:', products.length)
      return products
    } catch (error) {
      console.error('🚫 Ошибка публичного поиска:', error)
      throw error
    }
  }

  // 📊 Получение данных о категории (публичное API)
  async getPublicCategoryData(categoryId: number): Promise<any> {
    try {
      console.log('🌐 Публичный запрос данных категории WB:', categoryId)

      const url = `https://catalog.wb.ru/catalog/${categoryId}/catalog?appType=1&curr=rub&dest=-1257786&sort=popular&spp=0`

      const response = await securityService.secureRequest(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.wildberries.ru/'
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения категории: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Данные категории получены')
      return data
    } catch (error) {
      console.error('🚫 Ошибка получения данных категории:', error)
      throw error
    }
  }

  // 💰 Получение истории цен (публичное API)
  async getPublicPriceHistory(productId: number): Promise<any> {
    try {
      console.log('🌐 Публичный запрос истории цен WB:', productId)

      // Используем API для получения базовой информации о цене
      const productData = await this.getPublicProductById(productId)

      // Возвращаем текущие данные о цене (история цен требует более сложной логики)
      return {
        currentPrice: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.discount,
        lastUpdated: new Date().toISOString(),
        // Для полной истории цен нужно использовать сторонние сервисы или парсинг
        history: []
      }
    } catch (error) {
      console.error('🚫 Ошибка получения истории цен:', error)
      throw error
    }
  }

  // 🏪 Получение информации о продавце (публичное API)
  async getPublicSellerInfo(sellerId: number): Promise<any> {
    try {
      console.log('🌐 Публичный запрос информации о продавце WB:', sellerId)

      const url = `https://card.wb.ru/cards/detail?nm=${sellerId}`

      const response = await securityService.secureRequest(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.wildberries.ru/'
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения данных продавца: ${response.status}`)
      }

      const data = await response.json()
      const product = data.data?.products?.[0]

      if (product) {
        return {
          supplierId: product.supplierId,
          supplier: product.supplier,
          supplierRating: product.supplierRating,
          supplierFlags: product.supplierFlags || 0
        }
      }

      throw new Error('Данные продавца не найдены')
    } catch (error) {
      console.error('🚫 Ошибка получения информации о продавце:', error)
      throw error
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const wildberriesApi = new WildberriesApiService()
export default wildberriesApi
