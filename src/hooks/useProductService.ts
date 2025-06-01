import { useState, useCallback } from 'react';
import {
  Product,
  ProductFilters,
  ProductSearchResult,
  CompetitorPrice,
  ProductStatus,
  ProductCategory
} from '../types/product';
import { PricingStrategySettings } from '../components/pricing/PricingStrategyModal';
import { useToast } from '@chakra-ui/react';
import { realSellerProducts } from '../services/realProductData';
import { useApiMode } from './useApiMode';

// Интерфейс для сервиса товаров
interface ProductService {
  // Получение товаров
  getProducts: (filters?: ProductFilters) => Promise<ProductSearchResult>;
  getProductById: (id: string) => Promise<Product | null>;

  // Управление товарами
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Управление стратегиями
  applyPricingStrategy: (productId: string, strategy: PricingStrategySettings) => Promise<boolean>;
  removePricingStrategy: (productId: string) => Promise<boolean>;

  // Аналитика
  getPriceHistory: (productId: string, period?: string) => Promise<{ date: string; price: number }[]>;
  getSalesData: (productId: string, period?: string) => Promise<{ date: string; sales: number; revenue: number }[]>;
  getCompetitorPrices: (productId: string) => Promise<CompetitorPrice[]>;

  // Статистика
  getProductStats: () => Promise<{
    totalProducts: number;
    byCategory: Record<ProductCategory, number>;
    byStatus: Record<ProductStatus, number>;
    withStrategy: number;
    outOfStock: number;
    averagePrice: number;
  }>;
}

// Хук для работы с сервисом товаров
export const useProductService = (): ProductService => {
  const toast = useToast();
  const { isApiMode, toggleApiMode } = useApiMode();

  console.log('useProductService hook initialized, isApiMode:', isApiMode);

  // Получение списка товаров с фильтрацией
  const getProducts = useCallback(async (filters?: ProductFilters): Promise<ProductSearchResult> => {
    try {
      console.log('getProducts called with filters:', filters);

      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🛒 Using REAL seller products:', realSellerProducts.length);
      let filteredProducts = [...realSellerProducts];

      // Применяем фильтры, если они указаны
      if (filters) {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.sku.toLowerCase().includes(searchLower) ||
            (product.brand && product.brand.toLowerCase().includes(searchLower))
          );
        }

        if (filters.category) {
          filteredProducts = filteredProducts.filter(product =>
            product.category === filters.category
          );
        }

        if (filters.status) {
          filteredProducts = filteredProducts.filter(product =>
            product.status === filters.status
          );
        }

        if (filters.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product =>
            product.price.current >= filters.minPrice!
          );
        }

        if (filters.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product =>
            product.price.current <= filters.maxPrice!
          );
        }

        if (filters.inStock) {
          filteredProducts = filteredProducts.filter(product =>
            product.stock.available > 0
          );
        }

        if (filters.withStrategy) {
          filteredProducts = filteredProducts.filter(product =>
            product.appliedStrategyId !== undefined
          );
        }

        // Сортировка
        if (filters.sortBy) {
          filteredProducts.sort((a, b) => {
            let valueA: any;
            let valueB: any;

            switch (filters.sortBy) {
              case 'title':
                valueA = a.title;
                valueB = b.title;
                break;
              case 'price':
                valueA = a.price.current;
                valueB = b.price.current;
                break;
              case 'stock':
                valueA = a.stock.available;
                valueB = b.stock.available;
                break;
              case 'created':
                valueA = new Date(a.createdAt).getTime();
                valueB = new Date(b.createdAt).getTime();
                break;
              case 'updated':
                valueA = new Date(a.updatedAt).getTime();
                valueB = new Date(b.updatedAt).getTime();
                break;
              default:
                valueA = a.title;
                valueB = b.title;
            }

            if (typeof valueA === 'string' && typeof valueB === 'string') {
              return filters.sortOrder === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
            } else {
              return filters.sortOrder === 'asc'
                ? valueA - valueB
                : valueB - valueA;
            }
          });
        }
      }

      // Пагинация
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      console.log('Filtered products:', filteredProducts.length);
      console.log('Paginated products:', paginatedProducts.length);
      console.log('Page:', page, 'Limit:', limit);

      const result = {
        items: paginatedProducts,
        total: filteredProducts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredProducts.length / limit)
      };

      console.log('Returning result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Ошибка при загрузке товаров',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  }, [toast]);

  // Получение товара по ID
  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 300));

      const product = realSellerProducts.find(p => p.id === id);

      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      toast({
        title: 'Ошибка при загрузке товара',
        description: `Не удалось загрузить товар с ID ${id}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Создание нового товара
  const createProduct = useCallback(async (product: Partial<Product>): Promise<Product> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Создаем новый товар с уникальным ID
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        title: product.title || 'Новый товар',
        description: product.description || '',
        sku: product.sku || `SKU-${Date.now()}`,
        category: product.category || ProductCategory.OTHER,
        price: product.price || { current: 0 },
        stock: product.stock || { available: 0, reserved: 0 },
        status: product.status || ProductStatus.INACTIVE,
        images: product.images || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...product
      };

      // В реальном приложении здесь будет добавление товара в базу данных
      // Для демонстрации просто возвращаем созданный товар

      toast({
        title: 'Товар создан',
        description: `Товар "${newProduct.title}" успешно создан`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Ошибка при создании товара',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  }, [toast]);

  // Обновление товара
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      const productIndex = realSellerProducts.findIndex(p => p.id === id);

      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // Обновляем товар
      const updatedProduct: Product = {
        ...realSellerProducts[productIndex],
        ...updates,
        updatedAt: new Date()
      };

      // В реальном приложении здесь будет обновление товара в базе данных
      // Для демонстрации просто возвращаем обновленный товар

      // Уведомление убрано для уменьшения спама

      return updatedProduct;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      toast({
        title: 'Ошибка при обновлении товара',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  }, [toast]);

  // Удаление товара
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      const productIndex = realSellerProducts.findIndex(p => p.id === id);

      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // В реальном приложении здесь будет удаление товара из базы данных
      // Для демонстрации просто возвращаем успешный результат

      toast({
        title: 'Товар удален',
        description: `Товар успешно удален`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return true;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      toast({
        title: 'Ошибка при удалении товара',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);

  // Применение стратегии ценообразования к товару
  const applyPricingStrategy = useCallback(async (
    productId: string,
    strategy: PricingStrategySettings
  ): Promise<boolean> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      const productIndex = realSellerProducts.findIndex(p => p.id === productId);

      if (productIndex === -1) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // В реальном приложении здесь будет применение стратегии к товару
      // Для демонстрации просто возвращаем успешный результат

      toast({
        title: 'Стратегия применена',
        description: `Стратегия "${strategy.name}" успешно применена к товару`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return true;
    } catch (error) {
      console.error(`Error applying pricing strategy to product with ID ${productId}:`, error);
      toast({
        title: 'Ошибка при применении стратегии',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);

  // Удаление стратегии ценообразования с товара
  const removePricingStrategy = useCallback(async (productId: string): Promise<boolean> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      const productIndex = mockProducts.findIndex(p => p.id === productId);

      if (productIndex === -1) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // В реальном приложении здесь будет удаление стратегии с товара
      // Для демонстрации просто возвращаем успешный результат

      toast({
        title: 'Стратегия удалена',
        description: `Стратегия успешно удалена с товара`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return true;
    } catch (error) {
      console.error(`Error removing pricing strategy from product with ID ${productId}:`, error);
      toast({
        title: 'Ошибка при удалении стратегии',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);

  // Получение истории цен товара
  const getPriceHistory = useCallback(async (
    productId: string,
    period?: string
  ): Promise<{ date: string; price: number }[]> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации генерируем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Генерация моковых данных для истории цен
      const today = new Date();
      const data: { date: string; price: number }[] = [];

      let daysCount: number;
      switch (period) {
        case '7days':
          daysCount = 7;
          break;
        case '30days':
          daysCount = 30;
          break;
        case '90days':
          daysCount = 90;
          break;
        case '1year':
          daysCount = 365;
          break;
        default:
          daysCount = 30;
      }

      // Находим товар для получения текущей цены
      const product = mockProducts.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Начальная цена (примерно текущая цена товара)
      let price = product.price.current;

      for (let i = daysCount; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Случайное изменение цены в пределах ±5%
        const change = price * (Math.random() * 0.1 - 0.05);
        price += Math.round(change);

        // Гарантируем, что цена не станет отрицательной
        if (price < 100) price = 100;

        data.push({
          date: date.toISOString().split('T')[0],
          price
        });
      }

      return data;
    } catch (error) {
      console.error(`Error fetching price history for product with ID ${productId}:`, error);
      toast({
        title: 'Ошибка при загрузке истории цен',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  }, [toast]);

  // Получение данных о продажах товара
  const getSalesData = useCallback(async (
    productId: string,
    period?: string
  ): Promise<{ date: string; sales: number; revenue: number }[]> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации генерируем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Генерация моковых данных для продаж
      const today = new Date();
      const data: { date: string; sales: number; revenue: number }[] = [];

      let daysCount: number;
      switch (period) {
        case '7days':
          daysCount = 7;
          break;
        case '30days':
          daysCount = 30;
          break;
        case '90days':
          daysCount = 90;
          break;
        case '1year':
          daysCount = 365;
          break;
        default:
          daysCount = 30;
      }

      // Находим товар для получения цены
      const product = mockProducts.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Базовая цена товара для расчета выручки
      const basePrice = product.price.current;

      for (let i = daysCount; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Случайное количество продаж
        const sales = Math.floor(Math.random() * 10);

        // Выручка = количество продаж * цена
        const revenue = sales * basePrice;

        data.push({
          date: date.toISOString().split('T')[0],
          sales,
          revenue
        });
      }

      return data;
    } catch (error) {
      console.error(`Error fetching sales data for product with ID ${productId}:`, error);
      toast({
        title: 'Ошибка при загрузке данных о продажах',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  }, [toast]);

  // Получение цен конкурентов для товара
  const getCompetitorPrices = useCallback(async (productId: string): Promise<CompetitorPrice[]> => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      const product = mockProducts.find(p => p.id === productId);

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      return product.price.competitorPrices || [];
    } catch (error) {
      console.error(`Error fetching competitor prices for product with ID ${productId}:`, error);
      toast({
        title: 'Ошибка при загрузке цен конкурентов',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  }, [toast]);

  // Получение статистики по товарам
  const getProductStats = useCallback(async () => {
    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные

      // Задержка для имитации запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Подсчет статистики
      const totalProducts = mockProducts.length;

      // Статистика по категориям
      const byCategory: Record<ProductCategory, number> = {} as Record<ProductCategory, number>;
      Object.values(ProductCategory).forEach(category => {
        byCategory[category] = mockProducts.filter(p => p.category === category).length;
      });

      // Статистика по статусам
      const byStatus: Record<ProductStatus, number> = {} as Record<ProductStatus, number>;
      Object.values(ProductStatus).forEach(status => {
        byStatus[status] = mockProducts.filter(p => p.status === status).length;
      });

      // Товары со стратегией
      const withStrategy = mockProducts.filter(p => p.appliedStrategyId).length;

      // Товары не в наличии
      const outOfStock = mockProducts.filter(p => p.stock.available === 0).length;

      // Средняя цена
      const totalPrice = mockProducts.reduce((sum, p) => sum + p.price.current, 0);
      const averagePrice = totalPrice / totalProducts;

      return {
        totalProducts,
        byCategory,
        byStatus,
        withStrategy,
        outOfStock,
        averagePrice
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      toast({
        title: 'Ошибка при загрузке статистики',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });

      // Возвращаем пустую статистику в случае ошибки
      return {
        totalProducts: 0,
        byCategory: {} as Record<ProductCategory, number>,
        byStatus: {} as Record<ProductStatus, number>,
        withStrategy: 0,
        outOfStock: 0,
        averagePrice: 0
      };
    }
  }, [toast]);

  return {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    applyPricingStrategy,
    removePricingStrategy,
    getPriceHistory,
    getSalesData,
    getCompetitorPrices,
    getProductStats
  };
};
