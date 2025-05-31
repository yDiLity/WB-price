// 🎭 Demo Wildberries API Service
// Демо-сервис с реалистичными данными для тестирования без реального API

import { WBProduct, WBPriceInfo, WBStock } from './wildberriesApi'

// 🎯 Реалистичные категории товаров WB
const categories = [
  'Женская одежда', 'Мужская одежда', 'Детская одежда', 'Обувь',
  'Аксессуары', 'Красота', 'Здоровье', 'Дом и дача', 'Электроника',
  'Спорт и отдых', 'Автотовары', 'Книги', 'Канцтовары', 'Зоотовары'
]

// 🏷️ Реалистичные бренды
const brands = [
  'ZARA', 'H&M', 'Nike', 'Adidas', 'Apple', 'Samsung', 'Xiaomi',
  'Uniqlo', 'Mango', 'Bershka', 'Pull&Bear', 'Stradivarius',
  'Reserved', 'Cropp', 'House', 'Mohito', 'Sinsay'
]

// 🎨 Генератор реалистичных названий товаров
const productNames = [
  'Футболка базовая хлопковая',
  'Джинсы прямого кроя',
  'Платье летнее с принтом',
  'Кроссовки для бега',
  'Рюкзак городской',
  'Смартфон с двойной камерой',
  'Наушники беспроводные',
  'Куртка демисезонная',
  'Свитер оверсайз',
  'Брюки классические',
  'Блузка шифоновая',
  'Ботинки зимние',
  'Сумка кожаная',
  'Часы наручные',
  'Кепка бейсболка'
]

class DemoWildberriesApiService {
  private demoProducts: WBProduct[] = []
  private demoPrices: WBPriceInfo[] = []
  private demoStocks: WBStock[] = []

  constructor() {
    this.generateDemoData()
  }

  // 🎲 Генерация демо-данных
  private generateDemoData() {
    // Генерируем 50 демо-товаров
    for (let i = 1; i <= 50; i++) {
      const nmID = 100000000 + i
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const productName = productNames[Math.floor(Math.random() * productNames.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]

      // Товар
      const product: WBProduct = {
        nmID,
        vendorCode: `ART-${String(i).padStart(6, '0')}`,
        brand,
        title: `${brand} ${productName}`,
        photos: [
          `https://basket-01.wb.ru/vol${Math.floor(nmID/100000)}/part${Math.floor(nmID/1000)}/${nmID}/images/big/1.jpg`,
          `https://basket-01.wb.ru/vol${Math.floor(nmID/100000)}/part${Math.floor(nmID/1000)}/${nmID}/images/big/2.jpg`
        ],
        video: '',
        dimensions: {
          length: Math.floor(Math.random() * 50) + 10,
          width: Math.floor(Math.random() * 30) + 5,
          height: Math.floor(Math.random() * 20) + 2
        },
        characteristics: [
          { id: 1, name: 'Состав', value: 'Хлопок 95%, Эластан 5%' },
          { id: 2, name: 'Страна производства', value: 'Турция' },
          { id: 3, name: 'Сезон', value: 'Всесезонный' }
        ],
        sizes: [
          {
            chrtID: nmID * 10 + 1,
            techSize: 'M',
            wbSize: '46',
            price: Math.floor(Math.random() * 5000) + 500,
            discountedPrice: Math.floor(Math.random() * 4000) + 400,
            qty: Math.floor(Math.random() * 100)
          }
        ],
        tags: [category, brand, 'новинка'],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Цена
      const price: WBPriceInfo = {
        nmId: nmID,
        price: product.sizes[0].price,
        discount: Math.floor(Math.random() * 50),
        promoCode: Math.floor(Math.random() * 20)
      }

      // Остатки
      const stock: WBStock = {
        lastChangeDate: new Date().toISOString(),
        supplierArticle: product.vendorCode,
        techSize: 'M',
        barcode: `${nmID}${Math.floor(Math.random() * 1000)}`,
        quantity: Math.floor(Math.random() * 100),
        isSupply: Math.random() > 0.5,
        isRealization: Math.random() > 0.3,
        quantityFull: Math.floor(Math.random() * 150),
        warehouse: Math.floor(Math.random() * 10) + 1,
        nmId: nmID,
        subject: category,
        category: category,
        brand: brand,
        SCCode: `SC${Math.floor(Math.random() * 1000000)}`,
        Price: product.sizes[0].price,
        Discount: price.discount
      }

      this.demoProducts.push(product)
      this.demoPrices.push(price)
      this.demoStocks.push(stock)
    }
  }

  // 📦 Получение списка товаров (демо)
  async getProducts(limit = 100, offset = 0): Promise<WBProduct[]> {
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 500))

    return this.demoProducts.slice(offset, offset + limit)
  }

  // 💰 Получение информации о ценах (демо)
  async getPrices(): Promise<WBPriceInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return this.demoPrices
  }

  // 📊 Получение остатков товаров (демо)
  async getStocks(dateFrom?: string): Promise<WBStock[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return this.demoStocks
  }

  // 💰 Обновление цен товаров (демо)
  async updatePrices(prices: Array<{ nmId: number; price: number }>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 800))

    // Обновляем демо-данные
    prices.forEach(({ nmId, price }) => {
      const priceIndex = this.demoPrices.findIndex(p => p.nmId === nmId)
      if (priceIndex !== -1) {
        this.demoPrices[priceIndex].price = price
      }

      const productIndex = this.demoProducts.findIndex(p => p.nmID === nmId)
      if (productIndex !== -1) {
        this.demoProducts[productIndex].sizes[0].price = price
      }
    })

    return true
  }

  // 📈 Получение статистики продаж (демо)
  async getSalesStatistics(dateFrom: string, dateTo: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600))

    return this.demoProducts.map(product => ({
      nmId: product.nmID,
      vendorCode: product.vendorCode,
      brand: product.brand,
      subject: product.characteristics[0]?.value || 'Товар',
      category: product.tags[0] || 'Категория',
      sales: Math.floor(Math.random() * 100),
      revenue: Math.floor(Math.random() * 50000),
      orders: Math.floor(Math.random() * 80),
      clicks: Math.floor(Math.random() * 1000),
      ctr: (Math.random() * 10).toFixed(2),
      date: dateFrom
    }))
  }

  // 🔍 Поиск товаров конкурентов (демо)
  async searchCompetitorProducts(query: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 700))

    // В демо-режиме генерируем реалистичных конкурентов
    const competitors = []
    for (let i = 1; i <= 10; i++) {
      const basePrice = Math.floor(Math.random() * 5000) + 500
      const discount = Math.floor(Math.random() * 50)
      const originalPrice = Math.floor(basePrice / (1 - discount / 100))

      competitors.push({
        id: 200000000 + i,
        name: `${query} ${brands[Math.floor(Math.random() * brands.length)]} ${productNames[Math.floor(Math.random() * productNames.length)]}`,
        brand: brands[Math.floor(Math.random() * brands.length)],
        seller: `ООО "Поставщик ${i}"`,
        price: basePrice,
        originalPrice: discount > 0 ? originalPrice : undefined,
        discount: discount > 0 ? discount : undefined,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewsCount: Math.floor(Math.random() * 1000) + 10,
        url: `https://www.wildberries.ru/catalog/200000${i}/detail.aspx`,
        image: `https://via.placeholder.com/300x400/4299e1/ffffff?text=Товар+${i}`,
        isAvailable: Math.random() > 0.1 // 90% товаров в наличии
      })
    }

    return competitors
  }

  // 🏪 Получение информации о складах (демо)
  async getWarehouses(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return [
      { id: 1, name: 'Коледино', address: 'Московская область', type: 'Основной' },
      { id: 2, name: 'Подольск', address: 'Московская область', type: 'Дополнительный' },
      { id: 3, name: 'Электросталь', address: 'Московская область', type: 'Основной' },
      { id: 4, name: 'Казань', address: 'Республика Татарстан', type: 'Региональный' },
      { id: 5, name: 'Екатеринбург', address: 'Свердловская область', type: 'Региональный' }
    ]
  }

  // 🚚 Получение информации о поставках (демо)
  async getSupplies(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400))

    return [
      {
        id: 'WB-SUP-001',
        name: 'Поставка №1',
        status: 'В пути',
        warehouse: 'Коледино',
        items: Math.floor(Math.random() * 100) + 50,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expectedAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'WB-SUP-002',
        name: 'Поставка №2',
        status: 'Принята',
        warehouse: 'Подольск',
        items: Math.floor(Math.random() * 80) + 30,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  // 🔄 Обновление демо-данных
  refreshDemoData() {
    this.demoProducts = []
    this.demoPrices = []
    this.demoStocks = []
    this.generateDemoData()
  }
}

// Экспортируем единственный экземпляр демо-сервиса
export const demoWildberriesApi = new DemoWildberriesApiService()
export default demoWildberriesApi
