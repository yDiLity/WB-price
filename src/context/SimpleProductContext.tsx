import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductFilters, ProductSearchResult, ProductCategory, ProductStatus } from '../types/product';
import { realSellerProducts } from '../services/realProductData';

// Базовая структура контекста
interface SimpleProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchResult: ProductSearchResult | null;
  selectedProduct: Product | null;
  filters: ProductFilters;
  selectProduct: (product: Product | null) => void;
  setFilters: (newFilters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
}

// Создание контекста
const SimpleProductContext = createContext<SimpleProductContextType | undefined>(undefined);

// Начальные фильтры
const initialFilters: ProductFilters = {
  page: 1,
  limit: 10,
  sortBy: 'title',
  sortOrder: 'asc'
};

// Провайдер контекста
export const SimpleProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Используем реальные данные продавца yDiLity ООО
  const [products, setProducts] = useState<Product[]>(realSellerProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);

  // Создаем простой объект результатов поиска
  const searchResult: ProductSearchResult = {
    items: products,
    total: realSellerProducts.length,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(realSellerProducts.length / filters.limit)
  };

  // Выбор товара
  const selectProduct = (product: Product | null) => {
    setSelectedProduct(product);
  };

  // Установка фильтров
  const setFilters = (newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFiltersState(initialFilters);
  };

  // Значение контекста
  const contextValue: SimpleProductContextType = {
    products,
    isLoading,
    error,
    searchResult,
    selectedProduct,
    filters,
    selectProduct,
    setFilters,
    resetFilters
  };

  return (
    <SimpleProductContext.Provider value={contextValue}>
      {children}
    </SimpleProductContext.Provider>
  );
};

// Хук для использования контекста
export const useSimpleProducts = () => {
  const context = useContext(SimpleProductContext);

  if (context === undefined) {
    throw new Error('useSimpleProducts must be used within a SimpleProductProvider');
  }

  return context;
};
