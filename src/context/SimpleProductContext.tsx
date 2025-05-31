import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductFilters, ProductSearchResult, ProductCategory, ProductStatus } from '../types/product';
import { mockProducts } from '../services/mockData';

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
  // Используем моковые данные напрямую
  const [products, setProducts] = useState<Product[]>(mockProducts.slice(0, 20));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);

  // Создаем простой объект результатов поиска
  const searchResult: ProductSearchResult = {
    items: products,
    total: mockProducts.length,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(mockProducts.length / filters.limit)
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
