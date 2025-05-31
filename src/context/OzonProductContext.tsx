import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  ProductFilters,
  ProductSearchResult,
  ProductCategory,
  ProductStatus
} from '../types/product';
import { useAuth } from './AuthContext';
import { useToast } from '@chakra-ui/react';
import { OzonApiServiceFactory } from '../services/ozonApiServiceFactory';

// Интерфейс контекста товаров Ozon
interface OzonProductContextType {
  // Данные
  products: Product[];
  selectedProduct: Product | null;
  searchResult: ProductSearchResult | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  stats: {
    totalProducts: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    withStrategy: number;
    outOfStock: number;
    averagePrice: number;
  } | null;

  // Методы
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  loadProductById: (id: string) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
  applyPricingStrategy: (productId: string, strategyId: string) => Promise<Product | null>;
  removePricingStrategy: (productId: string) => Promise<Product | null>;
  saveCompetitorLinks: (productId: string, competitors: any[]) => Promise<Product | null>;
  loadProductStats: () => Promise<void>;
  setFilters: (newFilters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  selectProduct: (product: Product | null) => void;
}

// Создание контекста
const OzonProductContext = createContext<OzonProductContextType | undefined>(undefined);

// Начальные фильтры
const initialFilters: ProductFilters = {
  page: 1,
  limit: 10,
  sortBy: 'title',
  sortOrder: 'asc'
};

// Провайдер контекста
export const OzonProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResult, setSearchResult] = useState<ProductSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);
  const [stats, setStats] = useState<OzonProductContextType['stats']>(null);

  const toast = useToast();
  const apiServiceFactory = OzonApiServiceFactory.getInstance();

  // Получаем сервис API Ozon для текущего пользователя
  const getApiService = () => {
    // Если пользователь не авторизован, используем моковый сервис
    const userId = user?.id || 'guest';
    const credentials = user?.ozonApiCredentials || null;

    return apiServiceFactory.getProductService(userId, credentials, 'ozon');
  };

  // Загрузка товаров при изменении пользователя или его учетных данных API
  useEffect(() => {
    // Загружаем товары даже если API не настроен
    loadProducts();
    loadProductStats();
  }, [user?.id, user?.ozonApiCredentials?.isValid]);

  // Загрузка товаров с фильтрацией
  const loadProducts = async (newFilters?: ProductFilters) => {
    // Даже если API не настроен, мы все равно загружаем моковые данные
    setIsLoading(true);
    setError(null);

    try {
      const apiService = getApiService();
      const filtersToUse = newFilters || filters;
      const result = await apiService.getProducts(filtersToUse);

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
    setIsLoading(true);
    setError(null);

    try {
      const apiService = getApiService();
      const product = await apiService.getProductById(id);

      if (product) {
        setSelectedProduct(product);
      }

      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке товара';
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
      const apiService = getApiService();
      const updatedProduct = await apiService.updateProduct(id, productData);

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

  // Применение стратегии ценообразования к товару
  const applyPricingStrategy = async (productId: string, strategyId: string) => {
    setIsLoading(true);
    setError(null);

    console.log('applyPricingStrategy вызван с параметрами:', { productId, strategyId });

    try {
      const apiService = getApiService();
      console.log('Получен API сервис:', apiService);

      const updatedProduct = await apiService.applyPricingStrategy(productId, strategyId);
      console.log('Результат применения стратегии:', updatedProduct);

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

        console.log('Стратегия успешно применена к товару');
      }

      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при применении стратегии';
      setError(errorMessage);

      console.error('Ошибка при применении стратегии:', err);

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
      const apiService = getApiService();
      const updatedProduct = await apiService.removePricingStrategy(productId);

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

  // Сохранение связей с конкурентами
  const saveCompetitorLinks = async (productId: string, competitors: any[]) => {
    setIsLoading(true);
    setError(null);

    console.log('saveCompetitorLinks вызван с параметрами:', { productId, competitors });

    try {
      // Находим товар в списке
      const product = products.find(p => p.id === productId);
      console.log('Найден товар:', product);

      if (!product) {
        throw new Error(`Товар с ID ${productId} не найден`);
      }

      // Создаем обновленный товар с новыми связями
      const updatedProduct = {
        ...product,
        linkedCompetitors: competitors
      };
      console.log('Обновленный товар с новыми связями:', updatedProduct);

      // Обновляем товар через API
      const result = await updateProduct(productId, updatedProduct);
      console.log('Результат обновления товара:', result);

      if (result) {
        // Показываем уведомление об успешном сохранении
        toast({
          title: 'Связи сохранены',
          description: `Связи с конкурентами для товара "${result.title}" успешно сохранены`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Если у товара есть примененная стратегия, генерируем изменение цены
        console.log('Проверка наличия стратегии:', {
          appliedStrategyId: result.appliedStrategyId,
          competitorsLength: competitors.length
        });

        if (result.appliedStrategyId && competitors.length > 0) {
          try {
            console.log('Начинаем генерацию изменения цены');
            // Импортируем сервис стратегий
            const { strategyService } = await import('../services/strategyService');
            console.log('Сервис стратегий импортирован');

            // Импортируем сервис изменения цен
            const { priceChangeService } = await import('../services/priceChangeService');
            console.log('Сервис изменения цен импортирован');
            console.log('Текущее количество изменений цен:', priceChangeService.getAllPriceChanges().length);

            // Применяем стратегию к товару
            strategyService.applyStrategy(result, result.appliedStrategyId, competitors);
            console.log('Стратегия применена к товару');

            // Проверяем, были ли сгенерированы изменения цен
            const priceChanges = priceChangeService.getAllPriceChanges();
            console.log('После применения стратегии количество изменений цен:', priceChanges.length);

            if (priceChanges.length > 0) {
              console.log('Последнее изменение цены:', priceChanges[0]);
            }

            // Показываем уведомление о генерации изменения цены
            toast({
              title: 'Изменение цены сгенерировано',
              description: `На основе стратегии и связанных конкурентов сгенерировано изменение цены для товара "${result.title}"`,
              status: 'info',
              duration: 5000,
              isClosable: true,
            });
          } catch (error) {
            console.error('Ошибка при генерации изменения цены:', error);
          }
        } else {
          console.log('Не удалось сгенерировать изменение цены: нет стратегии или конкурентов');
          console.log('Детали:', {
            appliedStrategyId: result.appliedStrategyId,
            competitorsLength: competitors.length
          });
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при сохранении связей с конкурентами';
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
    // Загружаем статистику даже если API не настроен
    try {
      const apiService = getApiService();
      const productStats = await apiService.getProductsStats();
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
  const contextValue: OzonProductContextType = {
    products,
    selectedProduct,
    searchResult,
    isLoading,
    error,
    filters,
    stats,
    loadProducts,
    loadProductById,
    updateProduct,
    applyPricingStrategy,
    removePricingStrategy,
    saveCompetitorLinks,
    loadProductStats,
    setFilters,
    resetFilters,
    selectProduct
  };

  return (
    <OzonProductContext.Provider value={contextValue}>
      {children}
    </OzonProductContext.Provider>
  );
};

// Хук для использования контекста
export const useOzonProducts = () => {
  const context = useContext(OzonProductContext);

  if (context === undefined) {
    throw new Error('useOzonProducts must be used within an OzonProductProvider');
  }

  return context;
};
