import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  ProductFilters,
  ProductSearchResult,
  ProductCategory,
  ProductStatus
} from '../types/product';
import { productService } from '../services/productService';
import { useToast } from '@chakra-ui/react';

// Интерфейс контекста товаров
interface ProductContextType {
  // Данные
  products: Product[];
  selectedProduct: Product | null;
  searchResult: ProductSearchResult | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  stats: {
    totalProducts: number;
    byCategory: Record<ProductCategory, number>;
    byStatus: Record<ProductStatus, number>;
    withStrategy: number;
    outOfStock: number;
    averagePrice: number;
  } | null;

  // Методы
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  loadProductById: (id: string) => Promise<Product | null>;
  createProduct: (productData: Partial<Product>) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  applyPricingStrategy: (productId: string, strategyId: string) => Promise<Product | null>;
  removePricingStrategy: (productId: string) => Promise<Product | null>;
  loadProductStats: () => Promise<void>;
  setFilters: (newFilters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  selectProduct: (product: Product | null) => void;
}

// Создание контекста
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Начальные фильтры
const initialFilters: ProductFilters = {
  page: 1,
  limit: 10,
  sortBy: 'title',
  sortOrder: 'asc'
};

// Провайдер контекста
export const ProductProviderNew: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResult, setSearchResult] = useState<ProductSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);
  const [stats, setStats] = useState<ProductContextType['stats']>(null);

  const toast = useToast();

  // Загрузка товаров при монтировании компонента
  useEffect(() => {
    loadProducts();
    loadProductStats();
  }, []);

  // Загрузка товаров с фильтрацией
  const loadProducts = async (newFilters?: ProductFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || filters;
      const result = await productService.getProducts(filtersToUse);

      setSearchResult(result);
      setProducts(result.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке товаров';
      setError(errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка товара по ID
  const loadProductById = async (id: string) => {
    // Проверяем, не загружен ли уже этот товар
    if (selectedProduct && selectedProduct.id === id) {
      return selectedProduct;
    }

    setIsLoading(true);
    setError(null);

    console.log('loadProductById - id:', id);

    try {
      const product = await productService.getProductById(id);

      if (product) {
        setSelectedProduct(product);
      }
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке товара';
      setError(errorMessage);
      console.error('loadProductById - error:', errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Создание товара
  const createProduct = async (productData: Partial<Product>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newProduct = await productService.createProduct(productData);

      // Обновляем список товаров и статистику
      loadProducts();
      loadProductStats();

      toast({
        title: 'Товар создан',
        description: `Товар "${newProduct.title}" успешно создан`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при создании товара';
      setError(errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление товара
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedProduct = await productService.updateProduct(id, productData);

      if (updatedProduct) {
        // Обновляем список товаров и статистику
        loadProducts();
        loadProductStats();

        // Если это выбранный товар, обновляем его
        if (selectedProduct && selectedProduct.id === id) {
          setSelectedProduct(updatedProduct);
        }

        // Уведомление убрано для уменьшения спама
      }

      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обновлении товара';
      setError(errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление товара
  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await productService.deleteProduct(id);

      if (success) {
        // Обновляем список товаров и статистику
        loadProducts();
        loadProductStats();

        // Если это выбранный товар, сбрасываем его
        if (selectedProduct && selectedProduct.id === id) {
          setSelectedProduct(null);
        }

        toast({
          title: 'Товар удален',
          description: 'Товар успешно удален',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при удалении товара';
      setError(errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Применение стратегии ценообразования к товару
  const applyPricingStrategy = async (productId: string, strategyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedProduct = await productService.applyPricingStrategy(productId, strategyId);

      if (updatedProduct) {
        // Обновляем список товаров и статистику
        loadProducts();
        loadProductStats();

        // Если это выбранный товар, обновляем его
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updatedProduct);
        }

        toast({
          title: 'Стратегия применена',
          description: `Стратегия ценообразования успешно применена к товару "${updatedProduct.title}"`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при применении стратегии';
      setError(errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Отмена применения стратегии ценообразования к товару
  const removePricingStrategy = async (productId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedProduct = await productService.removePricingStrategy(productId);

      if (updatedProduct) {
        // Обновляем список товаров и статистику
        loadProducts();
        loadProductStats();

        // Если это выбранный товар, обновляем его
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updatedProduct);
        }

        toast({
          title: 'Стратегия отменена',
          description: `Стратегия ценообразования успешно отменена для товара "${updatedProduct.title}"`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при отмене стратегии';
      setError(errorMessage);

      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка статистики по товарам
  const loadProductStats = async () => {
    try {
      const productStats = await productService.getProductsStats();
      setStats(productStats);
    } catch (err) {
      console.error('Ошибка при загрузке статистики товаров:', err);
    }
  };

  // Установка фильтров и загрузка товаров с новыми фильтрами
  const setFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFiltersState(updatedFilters);
    loadProducts(updatedFilters);
  };

  // Сброс фильтров к начальным значениям
  const resetFilters = () => {
    setFiltersState(initialFilters);
    loadProducts(initialFilters);
  };

  // Выбор товара
  const selectProduct = (product: Product | null) => {
    setSelectedProduct(product);
  };

  // Значение контекста
  const contextValue: ProductContextType = {
    products,
    selectedProduct,
    searchResult,
    isLoading,
    error,
    filters,
    stats,
    loadProducts,
    loadProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    applyPricingStrategy,
    removePricingStrategy,
    loadProductStats,
    setFilters,
    resetFilters,
    selectProduct
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

// Хук для использования контекста
export const useProductsNew = () => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error('useProductsNew must be used within a ProductProviderNew');
  }

  return context;
};
