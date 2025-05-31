import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  useColorModeValue,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  SimpleGrid
} from '@chakra-ui/react';
import {
  SearchIcon,
  RepeatIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  TimeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon
} from '@chakra-ui/icons';
import { useOzonProducts } from '../context/OzonProductContext';
import { Product } from '../types/product';
import { priceChangeService, PriceChange } from '../services/priceChangeService';

/**
 * Страница для отображения изменений цен
 */
export default function PriceChangesPage() {
  // Получаем данные из контекста
  const { products, isLoading, error, loadProducts } = useOzonProducts();
  const toast = useToast();

  // Загружаем товары при монтировании компонента
  useEffect(() => {
    console.log('PriceChangesPage: принудительная загрузка товаров');
    loadProducts();

    // Логируем товары с примененными стратегиями
    console.log('Товары с примененными стратегиями:',
      products.filter(p => p.appliedStrategyId).length);

    // Логируем товары с связанными конкурентами
    console.log('Товары с связанными конкурентами:',
      products.filter(p => p.linkedCompetitors && p.linkedCompetitors.length > 0).length);

    // Логируем все товары
    console.log('Всего товаров:', products.length);

    // Логируем все изменения цен
    console.log('Все изменения цен:', priceChangeService.getAllPriceChanges().length);

    // Добавляем тестовые изменения цен, если их нет
    if (priceChangeService.getAllPriceChanges().length === 0 && products.length > 0) {
      console.log('Добавляем тестовые изменения цен');

      // Берем первые 3 товара для тестовых изменений
      const testProducts = products.slice(0, 3);

      testProducts.forEach(product => {
        // Создаем тестовые изменения цен
        const testChanges = [
          {
            id: `change-test-1-${product.id}`,
            productId: product.id,
            productTitle: product.title,
            productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
            oldPrice: product.price.current,
            newPrice: Math.round(product.price.current * 0.95),
            changePercent: -5,
            changeAmount: Math.round(product.price.current * 0.05),
            reason: 'Применение стратегии ценообразования',
            strategyId: 'strategy-1',
            strategyName: 'Снижение на 5%',
            timestamp: new Date(),
            status: 'pending',
            competitorId: 'comp-1',
            competitorName: 'Конкурент 1',
            competitorPrice: Math.round(product.price.current * 0.97)
          },
          {
            id: `change-test-2-${product.id}`,
            productId: product.id,
            productTitle: product.title,
            productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
            oldPrice: Math.round(product.price.current * 0.95),
            newPrice: Math.round(product.price.current * 0.93),
            changePercent: -2,
            changeAmount: Math.round(product.price.current * 0.02),
            reason: 'Снижение цены конкурентом',
            strategyId: 'strategy-1',
            strategyName: 'Снижение на 5%',
            timestamp: new Date(Date.now() - 86400000), // вчера
            status: 'applied',
            competitorId: 'comp-2',
            competitorName: 'Конкурент 2',
            competitorPrice: Math.round(product.price.current * 0.94)
          }
        ];

        // Добавляем тестовые изменения в сервис
        testChanges.forEach(change => {
          priceChangeService.addPriceChange(change);
        });
      });

      // Обновляем состояние компонента
      setPriceChanges(priceChangeService.getAllPriceChanges());
      setFilteredChanges(priceChangeService.getAllPriceChanges());

      console.log('Добавлены тестовые изменения цен, всего:', priceChangeService.getAllPriceChanges().length);
    }
  }, [products.length]);

  // Состояние для фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('today');
  const [selectedDirection, setSelectedDirection] = useState<string>('');

  // Состояние для отображения изменений цен
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [filteredChanges, setFilteredChanges] = useState<PriceChange[]>([]);
  const [expandedChangeId, setExpandedChangeId] = useState<string | null>(null);

  // Состояние для хранения ID удаленных строк
  const [deletedRowIds, setDeletedRowIds] = useState<string[]>([]);

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Загрузка изменений цен из сервиса
  useEffect(() => {
    console.log('PriceChangesPage: useEffect для загрузки изменений цен');
    console.log('Количество продуктов:', products.length);

    // Загружаем сохраненные удаленные ID из localStorage
    const savedDeletedIds = localStorage.getItem('deletedRowIds');
    if (savedDeletedIds) {
      const parsedIds = JSON.parse(savedDeletedIds);
      console.log('Загружены удаленные ID из localStorage:', parsedIds);
      setDeletedRowIds(parsedIds);
    } else {
      console.log('Нет сохраненных удаленных ID в localStorage');
    }

    // Получаем все изменения цен из сервиса
    const allChanges = priceChangeService.getAllPriceChanges();
    console.log('Получены изменения цен из сервиса:', allChanges.length);

    // Если в сервисе нет изменений, но есть продукты, генерируем моковые данные
    if (allChanges.length === 0 && products.length > 0) {
      console.log('Генерация моковых данных для изменений цен');

      // Для каждого продукта с привязанными конкурентами генерируем изменение цены
      products.forEach(product => {
        console.log('Проверка продукта для генерации изменений:', {
          id: product.id,
          title: product.title,
          hasLinkedCompetitors: !!product.linkedCompetitors && product.linkedCompetitors.length > 0,
          linkedCompetitorsCount: product.linkedCompetitors?.length || 0,
          appliedStrategyId: product.appliedStrategyId
        });

        if (product.linkedCompetitors && product.linkedCompetitors.length > 0 && product.appliedStrategyId) {
          console.log('Продукт имеет связанных конкурентов и стратегию, генерируем изменение цены');

          // Находим стратегию для продукта (в реальном приложении это будет запрос к API)
          // Здесь используем моковую стратегию
          const mockStrategy = {
            id: product.appliedStrategyId,
            name: 'Снижение на 5%',
            type: 'undercut_by_percent' as any,
            parameters: {
              percentReduction: 5
            }
          };
          console.log('Используем моковую стратегию:', mockStrategy);

          // Генерируем изменение цены
          const priceChange = priceChangeService.generatePriceChange(
            product,
            mockStrategy as any,
            product.linkedCompetitors
          );

          // Если изменение сгенерировано, добавляем его в сервис
          if (priceChange) {
            console.log('Изменение цены сгенерировано, добавляем в сервис');
            priceChangeService.addPriceChange(priceChange);
          } else {
            console.log('Не удалось сгенерировать изменение цены');
          }
        }
      });

      // Если у нас все еще нет изменений, генерируем моковые данные
      if (priceChangeService.getAllPriceChanges().length === 0) {
        console.log('Генерация базовых моковых данных для изменений цен');

        products.forEach(product => {
          // Создаем уникальные ID для строк
          const changeId1 = `change-1-${product.id}`;
          const changeId2 = `change-2-${product.id}`;
          const changeId3 = `change-3-${product.id}`;

          // Проверяем, не были ли эти строки удалены ранее
          const deletedIds = savedDeletedIds ? JSON.parse(savedDeletedIds) : [];

          // Изменение цены на основе стратегии
          if (!deletedIds.includes(changeId1)) {
            console.log('Генерация моковых данных для изменения 1:', changeId1);
            const change1: PriceChange = {
              id: changeId1,
              productId: product.id,
              productTitle: product.title,
              productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
              oldPrice: product.price.current,
              newPrice: Math.round(product.price.current * 0.95),
              changePercent: -5,
              changeAmount: Math.round(product.price.current * 0.05),
              reason: 'Применение стратегии ценообразования',
              strategyId: 'strategy-1',
              strategyName: 'Снижение на 5%',
              timestamp: new Date(Date.now() - Math.random() * 86400000),
              status: 'applied'
            };
            priceChangeService.addPriceChange(change1);
          }

          // Изменение цены из-за конкурента
          if (!deletedIds.includes(changeId2)) {
            console.log('Генерация моковых данных для изменения 2:', changeId2);
            const change2: PriceChange = {
              id: changeId2,
              productId: product.id,
              productTitle: product.title,
              productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
              oldPrice: Math.round(product.price.current * 0.95),
              newPrice: Math.round(product.price.current * 0.93),
              changePercent: -2,
              changeAmount: Math.round(product.price.current * 0.02),
              reason: 'Снижение цены конкурентом',
              strategyId: 'strategy-1',
              strategyName: 'Снижение на 5%',
              competitorId: 'competitor-1',
              competitorName: 'Конкурент ООО',
              competitorPrice: Math.round(product.price.current * 0.94),
              timestamp: new Date(Date.now() - Math.random() * 43200000),
              status: 'pending'
            };
            priceChangeService.addPriceChange(change2);
          }

          // Отклоненное изменение цены
          if (!deletedIds.includes(changeId3)) {
            console.log('Генерация моковых данных для изменения 3:', changeId3);
            const change3: PriceChange = {
              id: changeId3,
              productId: product.id,
              productTitle: product.title,
              productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
              oldPrice: Math.round(product.price.current * 0.93),
              newPrice: Math.round(product.price.current * 0.85),
              changePercent: -8,
              changeAmount: Math.round(product.price.current * 0.08),
              reason: 'Снижение цены конкурентом',
              strategyId: 'strategy-1',
              strategyName: 'Снижение на 5%',
              competitorId: 'competitor-2',
              competitorName: 'Другой конкурент',
              competitorPrice: Math.round(product.price.current * 0.86),
              timestamp: new Date(Date.now() - Math.random() * 21600000),
              status: 'rejected'
            };
            priceChangeService.addPriceChange(change3);
          }
        });
      }
    }

    // Получаем обновленные изменения цен из сервиса
    const updatedChanges = priceChangeService.getAllPriceChanges();
    console.log('Обновленные изменения цен из сервиса:', updatedChanges.length);
    setPriceChanges(updatedChanges);
    setFilteredChanges(updatedChanges);
  }, [products]);

  // Фильтрация изменений цен
  useEffect(() => {
    if (priceChanges.length > 0) {
      let filtered = [...priceChanges];

      // Фильтрация по поисковому запросу
      if (searchTerm) {
        filtered = filtered.filter(change =>
          change.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          change.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (change.strategyName && change.strategyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (change.competitorName && change.competitorName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Фильтрация по статусу
      if (selectedStatus) {
        filtered = filtered.filter(change => change.status === selectedStatus);
      }

      // Фильтрация по временному интервалу
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      switch (selectedTimeframe) {
        case 'today':
          filtered = filtered.filter(change => change.timestamp >= today);
          break;
        case 'yesterday':
          filtered = filtered.filter(change => change.timestamp >= yesterday && change.timestamp < today);
          break;
        case 'week':
          filtered = filtered.filter(change => change.timestamp >= lastWeek);
          break;
        case 'month':
          filtered = filtered.filter(change => change.timestamp >= lastMonth);
          break;
      }

      // Фильтрация по направлению изменения
      if (selectedDirection) {
        if (selectedDirection === 'up') {
          filtered = filtered.filter(change => change.changePercent > 0);
        } else if (selectedDirection === 'down') {
          filtered = filtered.filter(change => change.changePercent < 0);
        }
      }

      setFilteredChanges(filtered);
    }
  }, [priceChanges, searchTerm, selectedStatus, selectedTimeframe, selectedDirection]);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Обработчик применения изменения цены
  const handleApplyChange = (changeId: string) => {
    // Применяем изменение через сервис
    priceChangeService.applyPriceChange(changeId);

    // Обновляем состояние компонента
    const updatedChanges = priceChangeService.getAllPriceChanges();
    setPriceChanges(updatedChanges);

    // В реальном приложении здесь также будет запрос к API для обновления цены товара

    toast({
      title: 'Изменение применено',
      description: 'Новая цена успешно применена к товару',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик отклонения изменения цены
  const handleRejectChange = (changeId: string) => {
    // Отклоняем изменение через сервис
    priceChangeService.rejectPriceChange(changeId);

    // Обновляем состояние компонента
    const updatedChanges = priceChangeService.getAllPriceChanges();
    setPriceChanges(updatedChanges);

    toast({
      title: 'Изменение отклонено',
      description: 'Изменение цены было отклонено',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик сброса всех изменений цен
  const handleResetAllChanges = () => {
    // В реальном приложении здесь будет запрос к API для сброса всех изменений

    // Подтверждение действия
    if (window.confirm('Вы уверены, что хотите сбросить все изменения цен? Это действие нельзя отменить.')) {
      // Сбрасываем все изменения, помечая их как отклоненные
      setPriceChanges(prev => prev.map(change =>
        change.status === 'pending' ? { ...change, status: 'rejected' } : change
      ));

      toast({
        title: 'Изменения сброшены',
        description: 'Все ожидающие изменения цен были отклонены',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик удаления строк с данными по статусу
  const handleDeleteChangesByStatus = (status: string) => {
    // В реальном приложении здесь будет запрос к API для удаления записей

    // Подтверждение действия
    if (window.confirm(`Вы уверены, что хотите удалить все записи со статусом "${status === 'applied' ? 'Применено' : status === 'rejected' ? 'Отклонено' : status === 'failed' ? 'Ошибка' : 'Ожидает'}"? Это действие нельзя отменить.`)) {
      // Получаем ID всех строк с указанным статусом
      const idsToDelete = priceChanges
        .filter(change => change.status === status)
        .map(change => change.id);

      // Добавляем их в список удаленных
      const newDeletedIds = [...deletedRowIds, ...idsToDelete];
      setDeletedRowIds(newDeletedIds);

      // Сохраняем список удаленных ID в localStorage
      localStorage.setItem('deletedRowIds', JSON.stringify(newDeletedIds));

      // Удаляем записи с указанным статусом
      setPriceChanges(prev => prev.filter(change => change.status !== status));

      toast({
        title: 'Записи удалены',
        description: `Все строки со статусом "${status === 'applied' ? 'Применено' : status === 'rejected' ? 'Отклонено' : status === 'failed' ? 'Ошибка' : 'Ожидает'}" были удалены из таблицы`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик удаления старых записей
  const handleDeleteOldChanges = (days: number) => {
    // В реальном приложении здесь будет запрос к API для удаления старых записей

    // Подтверждение действия
    if (window.confirm(`Вы уверены, что хотите удалить все записи старше ${days} дней? Это действие нельзя отменить.`)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Получаем ID всех строк старше указанного периода
      const idsToDelete = priceChanges
        .filter(change => new Date(change.timestamp || new Date()) < cutoffDate)
        .map(change => change.id);

      // Добавляем их в список удаленных
      const newDeletedIds = [...deletedRowIds, ...idsToDelete];
      setDeletedRowIds(newDeletedIds);

      // Сохраняем список удаленных ID в localStorage
      localStorage.setItem('deletedRowIds', JSON.stringify(newDeletedIds));

      // Удаляем записи старше указанного периода
      setPriceChanges(prev => prev.filter(change =>
        new Date(change.timestamp || new Date()) >= cutoffDate
      ));

      toast({
        title: 'Старые записи удалены',
        description: `Все строки с данными старше ${days} дней были удалены из таблицы`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик удаления строки с данными
  const handleDeleteChange = (changeId: string) => {
    // В реальном приложении здесь будет запрос к API для удаления записи

    // Удаляем запись через сервис
    priceChangeService.deletePriceChange(changeId);

    // Обновляем состояние компонента
    const updatedChanges = priceChangeService.getAllPriceChanges();
    setPriceChanges(updatedChanges);

    // Обновляем список удаленных ID
    const savedDeletedIds = localStorage.getItem('deletedRowIds');
    if (savedDeletedIds) {
      setDeletedRowIds(JSON.parse(savedDeletedIds));
    }

    toast({
      title: 'Запись удалена',
      description: 'Строка с данными была удалена из таблицы',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик удаления всех строк с данными
  const handleDeleteAllChanges = () => {
    // В реальном приложении здесь будет запрос к API для удаления всех записей

    // Подтверждение действия
    if (window.confirm('Вы уверены, что хотите удалить ВСЕ записи из таблицы? Это действие нельзя отменить.')) {
      // Удаляем все записи через сервис
      priceChangeService.clearAllPriceChanges();

      // Обновляем состояние компонента
      setPriceChanges([]);
      setFilteredChanges([]);

      // Обновляем список удаленных ID
      const savedDeletedIds = localStorage.getItem('deletedRowIds');
      if (savedDeletedIds) {
        setDeletedRowIds(JSON.parse(savedDeletedIds));
      }

      toast({
        title: 'Все записи удалены',
        description: 'Все строки с данными были удалены из таблицы',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик восстановления удаленных строк
  const handleRestoreDeletedRows = () => {
    // Подтверждение действия
    if (window.confirm('Вы уверены, что хотите восстановить все удаленные строки? Это действие нельзя отменить.')) {
      // Очищаем список удаленных ID
      setDeletedRowIds([]);

      // Очищаем localStorage
      localStorage.removeItem('deletedRowIds');

      // Перезагружаем страницу для восстановления данных
      window.location.reload();

      toast({
        title: 'Строки восстановлены',
        description: 'Все удаленные строки были восстановлены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Получение статистики по изменениям цен
  const getStats = () => {
    const totalChanges = priceChanges.length;
    const appliedChanges = priceChanges.filter(change => change.status === 'applied').length;
    const pendingChanges = priceChanges.filter(change => change.status === 'pending').length;
    const rejectedChanges = priceChanges.filter(change => change.status === 'rejected').length;

    const priceIncreases = priceChanges.filter(change => change.changePercent > 0).length;
    const priceDecreases = priceChanges.filter(change => change.changePercent < 0).length;

    const totalChangeAmount = priceChanges.reduce((sum, change) => {
      if (change.status === 'applied') {
        return sum + (change.newPrice - change.oldPrice);
      }
      return sum;
    }, 0);

    return {
      totalChanges,
      appliedChanges,
      pendingChanges,
      rejectedChanges,
      priceIncreases,
      priceDecreases,
      totalChangeAmount
    };
  };

  const stats = getStats();

  return (
    <Container maxW="container.xl" py={8}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        gap={4}
      >
        <VStack align="flex-start" spacing={1}>
          <Heading as="h1" size="xl">Изменения в цене</Heading>
          <Text color="gray.500" fontSize="md">
            Отслеживание и управление изменениями цен на товары
          </Text>
        </VStack>

        <HStack spacing={2}>
          <Tooltip label="Обновить данные">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Обновить данные"
              variant="outline"
              isLoading={isLoading}
              onClick={() => {
                // Принудительно обновляем данные
                loadProducts();

                // Добавляем тестовые изменения цен
                if (products.length > 0) {
                  // Берем первые 3 товара для тестовых изменений
                  const testProducts = products.slice(0, 3);

                  testProducts.forEach(product => {
                    // Создаем тестовые изменения цен
                    const testChanges = [
                      {
                        id: `change-test-1-${product.id}-${Date.now()}`,
                        productId: product.id,
                        productTitle: product.title,
                        productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
                        oldPrice: product.price.current,
                        newPrice: Math.round(product.price.current * 0.95),
                        changePercent: -5,
                        changeAmount: Math.round(product.price.current * 0.05),
                        reason: 'Применение стратегии ценообразования',
                        strategyId: 'strategy-1',
                        strategyName: 'Снижение на 5%',
                        timestamp: new Date(),
                        status: 'pending',
                        competitorId: 'comp-1',
                        competitorName: 'Конкурент 1',
                        competitorPrice: Math.round(product.price.current * 0.97)
                      },
                      {
                        id: `change-test-2-${product.id}-${Date.now()}`,
                        productId: product.id,
                        productTitle: product.title,
                        productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
                        oldPrice: Math.round(product.price.current * 0.95),
                        newPrice: Math.round(product.price.current * 0.93),
                        changePercent: -2,
                        changeAmount: Math.round(product.price.current * 0.02),
                        reason: 'Снижение цены конкурентом',
                        strategyId: 'strategy-1',
                        strategyName: 'Снижение на 5%',
                        timestamp: new Date(Date.now() - 86400000), // вчера
                        status: 'applied',
                        competitorId: 'comp-2',
                        competitorName: 'Конкурент 2',
                        competitorPrice: Math.round(product.price.current * 0.94)
                      }
                    ];

                    // Добавляем тестовые изменения в сервис
                    testChanges.forEach(change => {
                      priceChangeService.addPriceChange(change);
                    });
                  });

                  // Обновляем состояние компонента
                  setPriceChanges(priceChangeService.getAllPriceChanges());
                  setFilteredChanges(priceChangeService.getAllPriceChanges());

                  // Показываем уведомление
                  toast({
                    title: 'Данные обновлены',
                    description: 'Тестовые изменения цен добавлены',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            />
          </Tooltip>

          <Button
            colorScheme="blue"
            leftIcon={<RepeatIcon />}
            onClick={() => {
              // Принудительно обновляем данные
              loadProducts();

              // Добавляем тестовые изменения цен
              if (products.length > 0) {
                // Берем первые 3 товара для тестовых изменений
                const testProducts = products.slice(0, 3);

                testProducts.forEach(product => {
                  // Создаем тестовые изменения цен
                  const testChanges = [
                    {
                      id: `change-test-1-${product.id}-${Date.now()}`,
                      productId: product.id,
                      productTitle: product.title,
                      productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
                      oldPrice: product.price.current,
                      newPrice: Math.round(product.price.current * 0.95),
                      changePercent: -5,
                      changeAmount: Math.round(product.price.current * 0.05),
                      reason: 'Применение стратегии ценообразования',
                      strategyId: 'strategy-1',
                      strategyName: 'Снижение на 5%',
                      timestamp: new Date(),
                      status: 'pending',
                      competitorId: 'comp-1',
                      competitorName: 'Конкурент 1',
                      competitorPrice: Math.round(product.price.current * 0.97)
                    },
                    {
                      id: `change-test-2-${product.id}-${Date.now()}`,
                      productId: product.id,
                      productTitle: product.title,
                      productImage: product.images && product.images.length > 0 ? product.images[0].url : undefined,
                      oldPrice: Math.round(product.price.current * 0.95),
                      newPrice: Math.round(product.price.current * 0.93),
                      changePercent: -2,
                      changeAmount: Math.round(product.price.current * 0.02),
                      reason: 'Снижение цены конкурентом',
                      strategyId: 'strategy-1',
                      strategyName: 'Снижение на 5%',
                      timestamp: new Date(Date.now() - 86400000), // вчера
                      status: 'applied',
                      competitorId: 'comp-2',
                      competitorName: 'Конкурент 2',
                      competitorPrice: Math.round(product.price.current * 0.94)
                    }
                  ];

                  // Добавляем тестовые изменения в сервис
                  testChanges.forEach(change => {
                    priceChangeService.addPriceChange(change);
                  });
                });

                // Обновляем состояние компонента
                setPriceChanges(priceChangeService.getAllPriceChanges());
                setFilteredChanges(priceChangeService.getAllPriceChanges());

                // Показываем уведомление
                toast({
                  title: 'Данные обновлены',
                  description: 'Тестовые изменения цен добавлены',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });

                // Перезагружаем страницу через 1 секунду
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            }}
          >
            Обновить данные
          </Button>
        </HStack>
      </Flex>

      {/* Статистика */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        <Stat
          bg={useColorModeValue('blue.50', 'blue.900')}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Всего изменений</StatLabel>
          <StatNumber>{stats.totalChanges}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            За последние 30 дней
          </StatHelpText>
        </Stat>

        <Stat
          bg={useColorModeValue('green.50', 'green.900')}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Применено</StatLabel>
          <StatNumber>{stats.appliedChanges}</StatNumber>
          <StatHelpText>
            {stats.totalChanges > 0 ? `${((stats.appliedChanges / stats.totalChanges) * 100).toFixed(0)}% от общего числа` : '0%'}
          </StatHelpText>
        </Stat>

        <Stat
          bg={useColorModeValue('yellow.50', 'yellow.900')}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Ожидает</StatLabel>
          <StatNumber>{stats.pendingChanges}</StatNumber>
          <StatHelpText>
            Требуется ваше решение
          </StatHelpText>
        </Stat>

        <Stat
          bg={useColorModeValue('red.50', 'red.900')}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel>Отклонено</StatLabel>
          <StatNumber>{stats.rejectedChanges}</StatNumber>
          <StatHelpText>
            {stats.totalChanges > 0 ? `${((stats.rejectedChanges / stats.totalChanges) * 100).toFixed(0)}% от общего числа` : '0%'}
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Панель управления данными */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm">Управление строками таблицы</Heading>
          <HStack spacing={2}>
            <Button
              colorScheme="blue"
              leftIcon={<RepeatIcon />}
              onClick={handleResetAllChanges}
              size="sm"
            >
              Сбросить все ожидающие
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<RepeatIcon />}
              onClick={handleRestoreDeletedRows}
              size="sm"
            >
              Восстановить удаленные строки
            </Button>
          </HStack>
        </Flex>

        <Flex
          wrap="wrap"
          gap={2}
          p={4}
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>Удалить строки по статусу:</Text>
            <Flex gap={2}>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDeleteChangesByStatus('applied')}
              >
                Примененные
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDeleteChangesByStatus('rejected')}
              >
                Отклоненные
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDeleteChangesByStatus('failed')}
              >
                С ошибками
              </Button>
            </Flex>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>Удалить строки по времени:</Text>
            <Flex gap={2}>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDeleteOldChanges(7)}
              >
                Старше 7 дней
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDeleteOldChanges(30)}
              >
                Старше 30 дней
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => handleDeleteOldChanges(90)}
              >
                Старше 90 дней
              </Button>
            </Flex>
          </Box>

          <Box ml="auto" alignSelf="flex-end">
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<DeleteIcon />}
              onClick={handleDeleteAllChanges}
              variant="solid"
              fontWeight="bold"
            >
              УДАЛИТЬ ВСЕ СТРОКИ
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Панель фильтров */}
      <Box
        mb={6}
        p={4}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          align={{ base: 'stretch', md: 'center' }}
          flexWrap="wrap"
        >
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Поиск по названию или причине"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="Все статусы"
            maxW={{ base: '100%', md: '200px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="pending">Ожидает</option>
            <option value="applied">Применено</option>
            <option value="rejected">Отклонено</option>
            <option value="failed">Ошибка</option>
          </Select>

          <Select
            placeholder="Период"
            maxW={{ base: '100%', md: '200px' }}
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="today">Сегодня</option>
            <option value="yesterday">Вчера</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="">Все время</option>
          </Select>

          <Select
            placeholder="Направление"
            maxW={{ base: '100%', md: '200px' }}
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
          >
            <option value="up">Повышение цены</option>
            <option value="down">Снижение цены</option>
            <option value="">Любое изменение</option>
          </Select>

          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('');
              setSelectedTimeframe('today');
              setSelectedDirection('');
            }}
          >
            Сбросить
          </Button>
        </Flex>
      </Box>

      {/* Список изменений цен */}
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      ) : filteredChanges.length === 0 ? (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>Нет изменений цен, соответствующих фильтрам</Text>
        </Alert>
      ) : (
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="sm"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg={headerBg}>
              <Tr>
                <Th width="40px"></Th>
                <Th>Товар</Th>
                <Th>Изменение</Th>
                <Th>Причина</Th>
                <Th>Дата</Th>
                <Th>Статус</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredChanges.map(change => {
                const isExpanded = expandedChangeId === change.id;

                return (
                  <React.Fragment key={change.id}>
                    <Tr>
                      <Td>
                        <IconButton
                          aria-label={isExpanded ? "Свернуть" : "Развернуть"}
                          icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedChangeId(isExpanded ? null : change.id)}
                        />
                      </Td>
                      <Td>
                        <Flex align="center" gap={3}>
                          {change.productImage ? (
                            <Image
                              src={change.productImage}
                              alt={change.productTitle}
                              boxSize="40px"
                              objectFit="contain"
                              borderRadius="md"
                            />
                          ) : (
                            <Box
                              boxSize="40px"
                              bg="gray.100"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="xs" color="gray.500">Нет</Text>
                            </Box>
                          )}
                          <Text fontWeight="medium" noOfLines={1}>{change.productTitle}</Text>
                        </Flex>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <HStack>
                            <Text fontWeight="bold" color={change.changePercent < 0 ? "green.500" : "red.500"}>
                              {change.changePercent < 0 ? "-" : "+"}
                              {Math.abs(change.changeAmount).toLocaleString('ru-RU')} ₽
                            </Text>
                            <Badge
                              colorScheme={change.changePercent < 0 ? "green" : "red"}
                              variant="solid"
                              borderRadius="full"
                            >
                              {change.changePercent < 0 ? "" : "+"}
                              {change.changePercent}%
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {formatPrice(change.oldPrice)} → {formatPrice(change.newPrice)}
                          </Text>
                        </VStack>
                      </Td>
                      <Td maxW="200px" isTruncated title={change.reason}>
                        {change.reason}
                      </Td>
                      <Td fontSize="sm">
                        {formatDate(change.timestamp)}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            change.status === 'applied' ? 'green' :
                            change.status === 'pending' ? 'yellow' :
                            change.status === 'rejected' ? 'red' :
                            'gray'
                          }
                          variant="solid"
                          borderRadius="full"
                          px={2}
                          py={1}
                        >
                          {change.status === 'applied' ? 'Применено' :
                           change.status === 'pending' ? 'Ожидает' :
                           change.status === 'rejected' ? 'Отклонено' :
                           'Ошибка'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {change.status === 'pending' && (
                            <>
                              <Tooltip label="Применить">
                                <IconButton
                                  icon={<CheckIcon />}
                                  aria-label="Применить"
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => handleApplyChange(change.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Отклонить">
                                <IconButton
                                  icon={<CloseIcon />}
                                  aria-label="Отклонить"
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleRejectChange(change.id)}
                                />
                              </Tooltip>
                            </>
                          )}
                          <Tooltip label="Подробности">
                            <IconButton
                              icon={<InfoIcon />}
                              aria-label="Подробности"
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedChangeId(isExpanded ? null : change.id)}
                            />
                          </Tooltip>
                          <Tooltip label="Удалить строку">
                            <IconButton
                              icon={<DeleteIcon />}
                              aria-label="Удалить строку"
                              size="sm"
                              colorScheme="red"
                              variant="solid"
                              onClick={() => {
                                if (window.confirm('Вы уверены, что хотите удалить эту строку из таблицы?')) {
                                  handleDeleteChange(change.id);
                                }
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>

                    {isExpanded && (
                      <Tr>
                        <Td colSpan={7} p={0}>
                          <Box p={4} bg={headerBg}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <Box>
                                <Heading size="sm" mb={3}>Детали изменения</Heading>
                                <VStack align="start" spacing={2}>
                                  <HStack>
                                    <Text fontWeight="bold" width="150px">Старая цена:</Text>
                                    <Text>{formatPrice(change.oldPrice)}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="150px">Новая цена:</Text>
                                    <Text>{formatPrice(change.newPrice)}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="150px">Изменение:</Text>
                                    <Text color={change.changePercent < 0 ? "green.500" : "red.500"}>
                                      {change.changePercent < 0 ? "-" : "+"}
                                      {Math.abs(change.changeAmount).toLocaleString('ru-RU')} ₽
                                      ({Math.abs(change.changePercent)}%)
                                    </Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="150px">Дата и время:</Text>
                                    <Text>{formatDate(change.timestamp)}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="150px">Причина:</Text>
                                    <Text>{change.reason}</Text>
                                  </HStack>
                                  {change.strategyName && (
                                    <HStack>
                                      <Text fontWeight="bold" width="150px">Стратегия:</Text>
                                      <Text>{change.strategyName}</Text>
                                    </HStack>
                                  )}
                                </VStack>
                              </Box>

                              {change.competitorName && (
                                <Box>
                                  <Heading size="sm" mb={3}>Информация о конкуренте</Heading>
                                  <VStack align="start" spacing={2}>
                                    <HStack>
                                      <Text fontWeight="bold" width="150px">Конкурент:</Text>
                                      <Text>{change.competitorName}</Text>
                                    </HStack>
                                    {change.competitorPrice && (
                                      <HStack>
                                        <Text fontWeight="bold" width="150px">Цена конкурента:</Text>
                                        <Text>{formatPrice(change.competitorPrice)}</Text>
                                      </HStack>
                                    )}
                                    <HStack>
                                      <Text fontWeight="bold" width="150px">Разница с конкурентом:</Text>
                                      <Text color={change.newPrice <= (change.competitorPrice || 0) ? "green.500" : "red.500"}>
                                        {change.newPrice <= (change.competitorPrice || 0) ? "-" : "+"}
                                        {Math.abs(change.newPrice - (change.competitorPrice || 0)).toLocaleString('ru-RU')} ₽
                                        ({Math.abs(((change.newPrice / (change.competitorPrice || 1)) - 1) * 100).toFixed(1)}%)
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </Box>
                              )}
                            </SimpleGrid>

                            {change.status === 'pending' && (
                              <Flex justify="flex-end" mt={4}>
                                <Button
                                  colorScheme="red"
                                  variant="outline"
                                  mr={3}
                                  onClick={() => handleRejectChange(change.id)}
                                >
                                  Отклонить
                                </Button>
                                <Button
                                  colorScheme="green"
                                  onClick={() => handleApplyChange(change.id)}
                                >
                                  Применить
                                </Button>
                              </Flex>
                            )}
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
}
