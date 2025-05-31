import {
  Product,
  ProductFilters,
  ProductSearchResult,
  ProductCategory,
  ProductStatus
} from '../types/product';
import { mockProducts, mockOzonProducts, generateMockProduct } from './mockData';

// Класс для работы с API товаров
class ProductService {
  private products: Product[] = [...mockProducts];

  constructor() {
    console.log('ProductService initialized with', this.products.length, 'products');
  }

  // Получение всех товаров с фильтрацией и пагинацией
  async getProducts(filters: ProductFilters = {}): Promise<ProductSearchResult> {
    console.log('ProductService.getProducts called with filters:', filters);

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredProducts = [...this.products];
    console.log('Initial products count:', filteredProducts.length);

    // Применение фильтров
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.ozonId?.toLowerCase().includes(searchLower)
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

    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        filters.inStock ? product.stock.available > 0 : true
      );
    }

    if (filters.withStrategy !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        filters.withStrategy ? !!product.appliedStrategyId : true
      );
    }

    // Сортировка
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;

      filteredProducts.sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return sortOrder * a.title.localeCompare(b.title);
          case 'price':
            return sortOrder * (a.price.current - b.price.current);
          case 'stock':
            return sortOrder * (a.stock.available - b.stock.available);
          case 'sales':
            return sortOrder * ((a.salesStats?.totalSold || 0) - (b.salesStats?.totalSold || 0));
          case 'rating':
            return sortOrder * ((a.salesStats?.averageRating || 0) - (b.salesStats?.averageRating || 0));
          case 'created':
            return sortOrder * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          case 'updated':
            return sortOrder * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          default:
            return 0;
        }
      });
    }

    // Пагинация
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    console.log('After filtering and sorting:', filteredProducts.length, 'products');
    console.log('After pagination:', paginatedProducts.length, 'products');
    console.log('Page:', page, 'of', Math.ceil(filteredProducts.length / limit));

    const result = {
      items: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit)
    };

    console.log('Returning result:', result);
    return result;
  }

  // Получение товара по ID
  async getProductById(id: string): Promise<Product | null> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));

    const product = this.products.find(p => p.id === id);
    return product || null;
  }

  // Создание нового товара
  async createProduct(productData: Partial<Product>): Promise<Product> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 700));

    const newId = `product-${this.products.length + 1}`;
    const newProduct = generateMockProduct(newId);

    // Заменяем сгенерированные данные на переданные
    const product: Product = {
      ...newProduct,
      ...productData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(product);
    return product;
  }

  // Обновление товара
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 600));

    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProduct: Product = {
      ...this.products[index],
      ...productData,
      updatedAt: new Date()
    };

    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  // Удаление товара
  async deleteProduct(id: string): Promise<boolean> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }

  // Применение стратегии ценообразования к товару
  async applyPricingStrategy(productId: string, strategyId: string): Promise<Product | null> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) return null;

    const updatedProduct: Product = {
      ...this.products[index],
      appliedStrategyId: strategyId,
      updatedAt: new Date()
    };

    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  // Отмена применения стратегии ценообразования к товару
  async removePricingStrategy(productId: string): Promise<Product | null> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) return null;

    const updatedProduct: Product = {
      ...this.products[index],
      appliedStrategyId: undefined,
      updatedAt: new Date()
    };

    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  // Получение статистики по товарам
  async getProductsStats(): Promise<{
    totalProducts: number;
    byCategory: Record<ProductCategory, number>;
    byStatus: Record<ProductStatus, number>;
    withStrategy: number;
    outOfStock: number;
    averagePrice: number;
  }> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400));

    const stats = {
      totalProducts: this.products.length,
      byCategory: {} as Record<ProductCategory, number>,
      byStatus: {} as Record<ProductStatus, number>,
      withStrategy: 0,
      outOfStock: 0,
      averagePrice: 0
    };

    // Инициализация счетчиков категорий и статусов
    Object.values(ProductCategory).forEach(category => {
      stats.byCategory[category] = 0;
    });

    Object.values(ProductStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });

    // Подсчет статистики
    let totalPrice = 0;

    this.products.forEach(product => {
      // По категориям
      stats.byCategory[product.category]++;

      // По статусам
      stats.byStatus[product.status]++;

      // С примененной стратегией
      if (product.appliedStrategyId) {
        stats.withStrategy++;
      }

      // Без остатка на складе
      if (product.stock.available === 0) {
        stats.outOfStock++;
      }

      // Сумма цен для расчета средней
      totalPrice += product.price.current;
    });

    // Расчет средней цены
    stats.averagePrice = Math.round(totalPrice / this.products.length);

    return stats;
  }
}

// Экспорт экземпляра сервиса
export const productService = new ProductService();
