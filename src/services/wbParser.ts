// 🕷️ Wildberries Safe Parser Service
// Безопасный парсинг WB с защитой от банов

export interface WBCompetitor {
  id: number
  name: string
  brand: string
  seller: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewsCount: number
  url: string
  image: string
  isAvailable: boolean
}

export interface WBSearchResult {
  competitors: WBCompetitor[]
  totalFound: number
  searchQuery: string
  timestamp: string
}

class WildberriesParser {
  private lastRequestTime = 0
  private requestCount = 0
  private readonly MIN_DELAY = 1000 // 1 секунда минимум
  private readonly MAX_DELAY = 5000 // 5 секунд максимум
  private readonly MAX_REQUESTS_PER_HOUR = 60
  private readonly REQUEST_RESET_TIME = 60 * 60 * 1000 // 1 час

  // 🎭 Массив User-Agent для ротации
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  constructor() {
    // Сброс счетчика запросов каждый час
    setInterval(() => {
      this.requestCount = 0
    }, this.REQUEST_RESET_TIME)
  }

  // 🛡️ Проверка лимитов
  private checkRateLimit(): boolean {
    if (this.requestCount >= this.MAX_REQUESTS_PER_HOUR) {
      console.warn('Rate limit exceeded. Please wait before making more requests.')
      return false
    }
    return true
  }

  // ⏱️ Умная задержка между запросами
  private async smartDelay(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    // Случайная задержка от 1 до 5 секунд
    const randomDelay = Math.random() * (this.MAX_DELAY - this.MIN_DELAY) + this.MIN_DELAY
    const requiredDelay = Math.max(0, randomDelay - timeSinceLastRequest)
    
    if (requiredDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, requiredDelay))
    }
    
    this.lastRequestTime = Date.now()
    this.requestCount++
  }

  // 🎭 Получение случайного User-Agent
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  // 🔄 Безопасный HTTP запрос с retry
  private async safeRequest(url: string, retries = 3): Promise<any> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded')
    }

    await this.smartDelay()

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
          }
        })

        if (response.status === 429) {
          // Rate limit - увеличиваем задержку
          const delay = Math.pow(2, attempt) * 1000 // Экспоненциальная задержка
          console.warn(`Rate limited, waiting ${delay}ms before retry ${attempt}/${retries}`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        console.warn(`Request attempt ${attempt}/${retries} failed:`, error)
        
        if (attempt === retries) {
          throw error
        }
        
        // Экспоненциальная задержка перед повтором
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // 🔍 Поиск конкурентов по запросу
  async searchCompetitors(query: string, limit = 20): Promise<WBSearchResult> {
    try {
      console.log(`🔍 Searching for: "${query}"`)
      
      // Используем публичный API поиска WB
      const searchUrl = `https://search.wb.ru/exactmatch/ru/common/v4/search?appType=1&curr=rub&dest=-1257786&query=${encodeURIComponent(query)}&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false`
      
      const data = await this.safeRequest(searchUrl)
      
      if (!data?.data?.products) {
        return {
          competitors: [],
          totalFound: 0,
          searchQuery: query,
          timestamp: new Date().toISOString()
        }
      }

      const products = data.data.products.slice(0, limit)
      
      const competitors: WBCompetitor[] = products.map((product: any) => {
        const price = product.salePriceU ? product.salePriceU / 100 : 0
        const originalPrice = product.priceU ? product.priceU / 100 : price
        const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

        return {
          id: product.id,
          name: product.name || 'Товар без названия',
          brand: product.brand || 'Неизвестный бренд',
          seller: product.supplier || 'Неизвестный продавец',
          price: price,
          originalPrice: originalPrice > price ? originalPrice : undefined,
          discount: discount > 0 ? discount : undefined,
          rating: product.rating ? Math.round(product.rating * 10) / 10 : 0,
          reviewsCount: product.feedbacks || 0,
          url: `https://www.wildberries.ru/catalog/${product.id}/detail.aspx`,
          image: product.pics && product.pics.length > 0 
            ? `https://basket-${String(product.id).slice(0, 2).padStart(2, '0')}.wb.ru/vol${String(product.id).slice(0, -5)}/part${String(product.id).slice(0, -3)}/${product.id}/images/big/1.jpg`
            : '',
          isAvailable: product.totalQuantity > 0
        }
      })

      console.log(`✅ Found ${competitors.length} competitors for "${query}"`)

      return {
        competitors,
        totalFound: data.data.total || competitors.length,
        searchQuery: query,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error searching competitors:', error)
      
      // Возвращаем пустой результат вместо ошибки
      return {
        competitors: [],
        totalFound: 0,
        searchQuery: query,
        timestamp: new Date().toISOString()
      }
    }
  }

  // 📊 Получение детальной информации о товаре
  async getProductDetails(productId: number): Promise<WBCompetitor | null> {
    try {
      console.log(`📊 Getting details for product: ${productId}`)
      
      const detailUrl = `https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&nm=${productId}`
      
      const data = await this.safeRequest(detailUrl)
      
      if (!data?.data?.products?.[0]) {
        return null
      }

      const product = data.data.products[0]
      const price = product.salePriceU ? product.salePriceU / 100 : 0
      const originalPrice = product.priceU ? product.priceU / 100 : price

      return {
        id: product.id,
        name: product.name || 'Товар без названия',
        brand: product.brand || 'Неизвестный бренд',
        seller: product.supplier || 'Неизвестный продавец',
        price: price,
        originalPrice: originalPrice > price ? originalPrice : undefined,
        discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
        rating: product.rating ? Math.round(product.rating * 10) / 10 : 0,
        reviewsCount: product.feedbacks || 0,
        url: `https://www.wildberries.ru/catalog/${product.id}/detail.aspx`,
        image: product.pics && product.pics.length > 0 
          ? `https://basket-${String(product.id).slice(0, 2).padStart(2, '0')}.wb.ru/vol${String(product.id).slice(0, -5)}/part${String(product.id).slice(0, -3)}/${product.id}/images/big/1.jpg`
          : '',
        isAvailable: product.totalQuantity > 0
      }

    } catch (error) {
      console.error(`Error getting product details for ${productId}:`, error)
      return null
    }
  }

  // 📈 Мониторинг цен конкурентов
  async monitorCompetitorPrices(productIds: number[]): Promise<WBCompetitor[]> {
    const results: WBCompetitor[] = []
    
    console.log(`📈 Monitoring prices for ${productIds.length} products`)
    
    for (const productId of productIds) {
      try {
        const product = await this.getProductDetails(productId)
        if (product) {
          results.push(product)
        }
        
        // Дополнительная задержка между запросами при мониторинге
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`Error monitoring product ${productId}:`, error)
      }
    }
    
    console.log(`✅ Successfully monitored ${results.length} products`)
    return results
  }

  // 📊 Получение статистики парсера
  getStats() {
    return {
      requestCount: this.requestCount,
      maxRequestsPerHour: this.MAX_REQUESTS_PER_HOUR,
      remainingRequests: this.MAX_REQUESTS_PER_HOUR - this.requestCount,
      lastRequestTime: this.lastRequestTime,
      isRateLimited: this.requestCount >= this.MAX_REQUESTS_PER_HOUR
    }
  }
}

// Экспортируем единственный экземпляр
export const wbParser = new WildberriesParser()
export default wbParser
