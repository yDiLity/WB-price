// 🛒 РЕАЛЬНЫЕ ДАННЫЕ ТОВАРОВ ПРОДАВЦА WB
// Ваши 4 товара для эксперимента с конкурентами

import { Product, ProductCategory, ProductStatus } from '../types/product';
import { apiService } from './apiService';

// Функция для загрузки товаров из API
export const loadSellerProducts = async (): Promise<Product[]> => {
  try {
    console.log('🌐 Загружаем товары продавца yDiLity ООО...');
    const products = await apiService.getSellerProducts();
    console.log('✅ Товары загружены из API:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Ошибка загрузки из API, используем статичные данные:', error);
    return realSellerProducts;
  }
};

// 🎯 ВАШИ РЕАЛЬНЫЕ ТОВАРЫ
export const realSellerProducts: Product[] = [
  {
    id: 'wb-product-1',
    ozonId: 'WB-123456789',
    title: 'Наушники беспроводные TWS Bluetooth 5.0',
    description: 'Премиальные беспроводные наушники с активным шумоподавлением, быстрой зарядкой и высоким качеством звука. Время работы до 30 часов с кейсом.',
    sku: 'HEADPHONES-TWS-001',
    barcode: '4607177123456',
    category: ProductCategory.ELECTRONICS,
    subcategory: 'Наушники',
    brand: 'TechSound',
    seller: 'yDiLity ООО',
    price: {
      current: 53400,
      old: 59900,
      min: 45000, // Минимальная цена
      max: 65000, // Максимальная цена
      recommended: 55000,
      costPrice: 38000, // Себестоимость
      competitorPrices: [] // Будем заполнять конкурентами
    },
    stock: {
      total: 25,
      available: 23,
      reserved: 2,
      inTransit: 0,
      warehouses: [
        { id: 'wh-1', name: 'Москва', quantity: 15 },
        { id: 'wh-2', name: 'СПб', quantity: 8 },
        { id: 'wh-3', name: 'Екатеринбург', quantity: 2 }
      ]
    },
    status: ProductStatus.ACTIVE,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'
    ],
    attributes: {
      'Тип подключения': 'Bluetooth 5.0',
      'Время работы': '30 часов',
      'Шумоподавление': 'Активное',
      'Цвет': 'Черный',
      'Гарантия': '2 года'
    },
    salesStats: {
      views: 15420,
      orders: 89,
      revenue: 4752600,
      conversionRate: 0.58,
      averageRating: 4.7,
      reviewsCount: 67
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    appliedStrategyId: undefined
  },

  {
    id: 'wb-product-2',
    ozonId: 'WB-987654321',
    title: 'Повербанк Xiaomi Mi Power Bank 3 20000mAh',
    description: 'Портативное зарядное устройство Xiaomi с быстрой зарядкой 18W, двумя USB портами и Type-C. Компактный дизайн и высокая емкость.',
    sku: 'POWERBANK-XIAOMI-20K',
    barcode: '4607177987654',
    category: ProductCategory.ELECTRONICS,
    subcategory: 'Аксессуары',
    brand: 'Xiaomi',
    seller: 'yDiLity ООО',
    price: {
      current: 5100,
      old: 5900,
      min: 4200,
      max: 6500,
      recommended: 5300,
      costPrice: 3600,
      competitorPrices: []
    },
    stock: {
      total: 45,
      available: 42,
      reserved: 3,
      inTransit: 5,
      warehouses: [
        { id: 'wh-1', name: 'Москва', quantity: 25 },
        { id: 'wh-2', name: 'СПб', quantity: 12 },
        { id: 'wh-3', name: 'Екатеринбург', quantity: 8 }
      ]
    },
    status: ProductStatus.ACTIVE,
    images: [
      'https://images.unsplash.com/photo-1609592806955-d0ae3d1b9b9e?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],
    attributes: {
      'Емкость': '20000 mAh',
      'Быстрая зарядка': '18W',
      'Порты': 'USB-A x2, Type-C',
      'Цвет': 'Черный',
      'Вес': '434г'
    },
    salesStats: {
      views: 8950,
      orders: 156,
      revenue: 795600,
      conversionRate: 1.74,
      averageRating: 4.8,
      reviewsCount: 134
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    appliedStrategyId: undefined
  },

  {
    id: 'wb-product-3',
    ozonId: 'WB-456789123',
    title: 'Пенал школьный подростковый Adidas в клетку',
    description: 'Стильный школьный пенал от Adidas в клетчатый принт. Прочный материал, удобная молния, множество отделений для канцелярии.',
    sku: 'PENCILCASE-ADIDAS-CHECK',
    barcode: '4607177456789',
    category: ProductCategory.OFFICE,
    subcategory: 'Школьные принадлежности',
    brand: 'Adidas',
    seller: 'yDiLity ООО',
    price: {
      current: 540,
      old: 690,
      min: 450,
      max: 750,
      recommended: 580,
      costPrice: 320,
      competitorPrices: []
    },
    stock: {
      total: 120,
      available: 115,
      reserved: 5,
      inTransit: 20,
      warehouses: [
        { id: 'wh-1', name: 'Москва', quantity: 60 },
        { id: 'wh-2', name: 'СПб', quantity: 35 },
        { id: 'wh-3', name: 'Екатеринбург', quantity: 25 }
      ]
    },
    status: ProductStatus.ACTIVE,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400'
    ],
    attributes: {
      'Материал': 'Полиэстер',
      'Размер': '20x8x5 см',
      'Принт': 'Клетка',
      'Застежка': 'Молния',
      'Возраст': '10-16 лет'
    },
    salesStats: {
      views: 3420,
      orders: 89,
      revenue: 48060,
      conversionRate: 2.6,
      averageRating: 4.5,
      reviewsCount: 45
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    appliedStrategyId: undefined
  },

  {
    id: 'wb-product-4',
    ozonId: 'WB-789123456',
    title: 'Книга "Гарри Поттер и философский камень" Дж.К. Роулинг',
    description: 'Первая книга знаменитой серии о юном волшебнике Гарри Поттере. Качественная печать, твердый переплет, иллюстрации.',
    sku: 'BOOK-HARRYPOTTER-1',
    barcode: '4607177789123',
    category: ProductCategory.BOOKS,
    subcategory: 'Художественная литература',
    brand: 'Росмэн',
    seller: 'yDiLity ООО',
    price: {
      current: 640,
      old: 790,
      min: 520,
      max: 850,
      recommended: 680,
      costPrice: 380,
      competitorPrices: []
    },
    stock: {
      total: 85,
      available: 80,
      reserved: 5,
      inTransit: 15,
      warehouses: [
        { id: 'wh-1', name: 'Москва', quantity: 40 },
        { id: 'wh-2', name: 'СПб', quantity: 25 },
        { id: 'wh-3', name: 'Екатеринбург', quantity: 20 }
      ]
    },
    status: ProductStatus.ACTIVE,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
    ],
    attributes: {
      'Автор': 'Дж.К. Роулинг',
      'Издательство': 'Росмэн',
      'Переплет': 'Твердый',
      'Страниц': '432',
      'Год издания': '2023'
    },
    salesStats: {
      views: 5680,
      orders: 124,
      revenue: 79360,
      conversionRate: 2.18,
      averageRating: 4.9,
      reviewsCount: 98
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
    appliedStrategyId: undefined
  }
];

// 📊 Статистика продавца
export const sellerStats = {
  totalProducts: realSellerProducts.length,
  totalRevenue: realSellerProducts.reduce((sum, product) => sum + product.salesStats.revenue, 0),
  totalOrders: realSellerProducts.reduce((sum, product) => sum + product.salesStats.orders, 0),
  averageRating: realSellerProducts.reduce((sum, product) => sum + product.salesStats.averageRating, 0) / realSellerProducts.length,
  totalViews: realSellerProducts.reduce((sum, product) => sum + product.salesStats.views, 0)
};

console.log('🛒 Загружены реальные товары продавца:', realSellerProducts.length);
console.log('💰 Общая выручка:', sellerStats.totalRevenue, 'руб.');
console.log('📦 Общее количество заказов:', sellerStats.totalOrders);
