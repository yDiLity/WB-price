// 📊 Extended Data Table Component - WB Price Optimizer
import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Input,
  Select,
  Flex,
  useColorModeValue,
  Tooltip,
  Progress,
  Icon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaEye, FaArrowUp, FaArrowDown, FaDownload, FaSync } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { wildberriesApi } from '../../services/wildberriesApi'
import { demoWildberriesApi } from '../../services/demoWildberriesApi'

// 📋 WB Data Structure - Adapted for Wildberries
interface ExtendedDataRow {
  id: string
  supplierCabinet: string // 1. Кабинет поставщика
  supplierArticle: string // 2. Артикул поставщика
  productName: string // 3. Название товара
  wbArticle: string // 4. Артикул WB
  currentStatus: string // 5. Текущий статус товара
  yourWbSalePrice: number // 6. Ваша цена продажи на WB
  wbCrossedPrice: number // 7. Зачеркнутая цена на WB
  customerPrice: number // 8. Цена для покупателя
  wbExtraDiscountPercent: number // 9. Доп скидка от WB в %
  considerWbCard: boolean // 10. Учитывать карту WB
  wbCardPrice: number // 11. Цена по карте WB
  wbCardDiscountPercent: number // 12. Скидка по WB карте в %
  competitorPrice: number // 13. Цена у связанных конкурентов
  calculatedCustomerPrice: number // 14. Расчетная цена для покупателя
  calculatedWbSalePrice: number // 15. Расчетная цена продажи на WB
  currentRCPrice: number // 16. Ваша текущая цена РЦ
  rcMarkupDiscountPercent: number // 17. Доп наценка/скидка к РЦ по прочим стратегиям в %
  currentCalculationPrice: number // 18. Текущая цена для расчетов цены продажи
  minSalePrice: number // 19. Минимальная цена продажи
  newWbUploadPrice: number // 20. Новая цена выгрузки на WB
  newMarkupDiscountPercent: number // 21. Новая наценка (+) скидка (-) в %
  previousMarkupDiscountPercent: number // 22. Предыдущая наценка (+) скидка (-) в %
  markupStatus: string // 23. Статус наценки
  lastPriceCheckDateTime: string // 24. Дата и время последней проверки цены
}

// 🎨 Mock Data - Exact Structure from Photo
const generateMockData = (): ExtendedDataRow[] => {
  const suppliers = ['ООО "Поставщик 1"', 'ИП Иванов', 'ООО "Торг"', 'ИП Петров', 'ООО "Снаб"']
  const statuses = ['Активен', 'На модерации', 'Заблокирован', 'Архив', 'Черновик']
  const markupStatuses = ['Применена', 'Ожидает', 'Отклонена', 'В обработке']

  return Array.from({ length: 50 }, (_, i) => {
    const basePrice = Math.round((Math.random() * 5000 + 500) * 100) / 100
    const rcPrice = Math.round((basePrice * 0.8) * 100) / 100
    const competitorPrice = Math.round((basePrice * (0.9 + Math.random() * 0.2)) * 100) / 100

    return {
      id: `prod-${i + 1}`,
      supplierCabinet: suppliers[Math.floor(Math.random() * suppliers.length)],
      supplierArticle: `ART-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      productName: `Товар ${i + 1} - Название продукта для продажи`,
      wbArticle: `WB${Math.floor(Math.random() * 900000000) + 100000000}`,
      currentStatus: statuses[Math.floor(Math.random() * statuses.length)],
      yourWbSalePrice: basePrice,
      wbCrossedPrice: Math.round((basePrice * 1.2) * 100) / 100,
      customerPrice: Math.round((basePrice * 0.95) * 100) / 100,
      wbExtraDiscountPercent: Math.round((Math.random() * 15) * 10) / 10,
      considerWbCard: Math.random() > 0.5,
      wbCardPrice: Math.round((basePrice * 0.9) * 100) / 100,
      wbCardDiscountPercent: Math.round((Math.random() * 10 + 5) * 10) / 10,
      competitorPrice: competitorPrice,
      calculatedCustomerPrice: Math.round((competitorPrice * 0.98) * 100) / 100,
      calculatedWbSalePrice: Math.round((competitorPrice * 1.05) * 100) / 100,
      currentRCPrice: rcPrice,
      rcMarkupDiscountPercent: Math.round((Math.random() * 20 - 10) * 10) / 10,
      currentCalculationPrice: Math.round((rcPrice * 1.1) * 100) / 100,
      minSalePrice: Math.round((rcPrice * 0.9) * 100) / 100,
      newWbUploadPrice: Math.round((basePrice * (0.95 + Math.random() * 0.1)) * 100) / 100,
      newMarkupDiscountPercent: Math.round((Math.random() * 10 - 5) * 10) / 10,
      previousMarkupDiscountPercent: Math.round((Math.random() * 10 - 5) * 10) / 10,
      markupStatus: markupStatuses[Math.floor(Math.random() * markupStatuses.length)],
      lastPriceCheckDateTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
}

const ExtendedDataTable: React.FC = () => {
  const [data, setData] = useState<ExtendedDataRow[]>(generateMockData())
  const [sortField, setSortField] = useState<keyof ExtendedDataRow>('productName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const toast = useToast()

  // 🎨 Theme colors
  const headerBg = useColorModeValue('blue.500', 'blue.600')
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 🔄 Auto-update prices based on competitor prices
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData =>
        prevData.map(row => {
          // Simulate competitor price changes
          const newCompetitorPrice = row.competitorPrice * (0.95 + Math.random() * 0.1)
          const newCalculatedPrice = Math.round((newCompetitorPrice * 0.98) * 100) / 100
          const newWbPrice = Math.round((newCalculatedPrice * 1.02) * 100) / 100

          return {
            ...row,
            competitorPrice: Math.round(newCompetitorPrice * 100) / 100,
            calculatedCustomerPrice: newCalculatedPrice,
            newWbUploadPrice: newWbPrice,
            lastPriceCheckDateTime: new Date().toISOString(),
          }
        })
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // 🔄 Manual refresh function
  const refreshData = async () => {
    setIsUpdating(true)

    try {
      const isDemoMode = localStorage.getItem('wb_demo_mode') === 'true'

      if (isDemoMode) {
        // Демо-режим: обновляем моковые данные
        setTimeout(() => {
          setData(generateMockData())
          setIsUpdating(false)
          toast({
            title: 'Данные обновлены (Демо)',
            description: 'Тестовые данные успешно обновлены',
            status: 'success',
            duration: 2000,
            isClosable: true,
          })
        }, 1000)
      } else {
        // Реальный режим: загружаем данные из API
        try {
          const products = await wildberriesApi.getProducts(50, 0)
          const prices = await wildberriesApi.getPrices()
          const stocks = await wildberriesApi.getStocks()

          // Преобразуем данные API в формат таблицы
          const apiData: ExtendedDataRow[] = products.map((product, index) => {
            const price = prices.find(p => p.nmId === product.nmID)
            const stock = stocks.find(s => s.nmId === product.nmID)

            return {
              id: `api-${product.nmID}`,
              supplierCabinet: 'Ваш кабинет',
              supplierArticle: product.vendorCode,
              productName: product.title,
              wbArticle: product.nmID.toString(),
              currentStatus: stock?.quantity > 0 ? 'Активен' : 'Нет в наличии',
              yourWbSalePrice: price?.price || product.sizes[0]?.price || 0,
              wbCrossedPrice: (price?.price || 0) * 1.2,
              customerPrice: (price?.price || 0) * 0.95,
              wbExtraDiscountPercent: price?.discount || 0,
              considerWbCard: true,
              wbCardPrice: (price?.price || 0) * 0.9,
              wbCardDiscountPercent: 10,
              competitorPrice: (price?.price || 0) * 1.1,
              calculatedCustomerPrice: (price?.price || 0) * 0.98,
              calculatedWbSalePrice: (price?.price || 0) * 1.02,
              currentRCPrice: (price?.price || 0) * 0.8,
              rcMarkupDiscountPercent: 0,
              currentCalculationPrice: (price?.price || 0) * 0.85,
              minSalePrice: (price?.price || 0) * 0.7,
              newWbUploadPrice: price?.price || 0,
              newMarkupDiscountPercent: 0,
              previousMarkupDiscountPercent: 0,
              markupStatus: 'Применена',
              lastPriceCheckDateTime: new Date().toISOString(),
            }
          })

          setData(apiData)
          setIsUpdating(false)
          toast({
            title: 'Данные обновлены (API)',
            description: `Загружено ${apiData.length} товаров из Wildberries`,
            status: 'success',
            duration: 2000,
            isClosable: true,
          })
        } catch (error) {
          console.error('Ошибка загрузки данных:', error)
          setIsUpdating(false)
          toast({
            title: 'Ошибка загрузки',
            description: 'Не удалось загрузить данные из API. Проверьте настройки.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      }
    } catch (error) {
      setIsUpdating(false)
      toast({
        title: 'Ошибка обновления',
        description: 'Произошла ошибка при обновлении данных',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 🔄 Sorting and filtering
  const sortedAndFilteredData = useMemo(() => {
    let filtered = data.filter(row => {
      const matchesSearch = row.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           row.supplierArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           row.supplierCabinet.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !filterStatus || row.currentStatus === filterStatus
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }, [data, sortField, sortDirection, searchTerm, filterStatus])

  // 📊 Export to Excel function
  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(sortedAndFilteredData.map(row => ({
        'Кабинет поставщика': row.supplierCabinet,
        'Артикул поставщика': row.supplierArticle,
        'Название товара': row.productName,
        'Артикул WB': row.wbArticle,
        'Статус': row.currentStatus,
        'Цена продажи WB': row.yourWbSalePrice,
        'Зачеркнутая цена': row.wbCrossedPrice,
        'Цена покупателя': row.customerPrice,
        'Скидка WB %': row.wbExtraDiscountPercent,
        'Карта WB': row.considerWbCard ? 'Да' : 'Нет',
        'Цена по карте': row.wbCardPrice,
        'Скидка по карте %': row.wbCardDiscountPercent,
        'Цена конкурентов': row.competitorPrice,
        'Расчетная цена покупателя': row.calculatedCustomerPrice,
        'Расчетная цена WB': row.calculatedWbSalePrice,
        'Текущая РЦ': row.currentRCPrice,
        'Наценка/скидка РЦ %': row.rcMarkupDiscountPercent,
        'Цена для расчетов': row.currentCalculationPrice,
        'Минимальная цена': row.minSalePrice,
        'Новая цена WB': row.newWbUploadPrice,
        'Новая наценка %': row.newMarkupDiscountPercent,
        'Предыдущая наценка %': row.previousMarkupDiscountPercent,
        'Статус наценки': row.markupStatus,
        'Последняя проверка': new Date(row.lastPriceCheckDateTime).toLocaleString('ru-RU'),
      })))

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'WB Товары')

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      saveAs(blob, `wb-products-${new Date().toISOString().split('T')[0]}.xlsx`)

      toast({
        title: 'Экспорт завершен',
        description: 'Файл Excel успешно сохранен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать файл Excel',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 🎯 Handle sorting
  const handleSort = (field: keyof ExtendedDataRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }



  // 💰 Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // 📊 Format percentage
  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  // 📅 Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box>
      {/* 🔍 Filters and Actions */}
      <Flex gap={4} mb={4} wrap="wrap" justify="space-between" align="center">
        <Flex gap={4} wrap="wrap">
          <Input
            placeholder="Поиск по названию, артикулу или кабинету..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="350px"
          />
          <Select
            placeholder="Все статусы"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            maxW="200px"
          >
            <option value="Активен">Активен</option>
            <option value="На модерации">На модерации</option>
            <option value="Заблокирован">Заблокирован</option>
            <option value="Архив">Архив</option>
            <option value="Черновик">Черновик</option>
          </Select>
        </Flex>

        <Flex gap={2}>
          <Button
            leftIcon={<Icon as={FaDownload} />}
            colorScheme="green"
            size="sm"
            onClick={exportToExcel}
          >
            Экспорт Excel
          </Button>
          <Button
            leftIcon={<Icon as={FaSync} />}
            colorScheme="blue"
            size="sm"
            onClick={refreshData}
            isLoading={isUpdating}
            loadingText="Обновление..."
          >
            Обновить
          </Button>
        </Flex>
      </Flex>

      {/* 📊 Main Table */}
      <Box
        bg={tableBg}
        borderRadius="lg"
        borderWidth="2px"
        borderColor="blue.500"
        boxShadow="lg"
        position="relative"
        overflow="hidden"
      >
        {/* Scroll hint */}
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="blue.500"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
          zIndex={10}
          opacity={0.8}
        >
          ← Прокрутите горизонтально →
        </Box>

        <TableContainer
          overflowX="auto"
          overflowY="auto"
          maxH="70vh"
          css={{
            '&::-webkit-scrollbar': {
              height: '12px',
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f5f9',
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #3182ce, #2c5aa0)',
              borderRadius: '6px',
              border: '2px solid #f1f5f9',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(45deg, #2c5aa0, #2a4a7c)',
            },
            '&::-webkit-scrollbar-corner': {
              background: '#f1f5f9',
            },
          }}
        >
        <Table variant="striped" colorScheme="blue" size="sm" className="purple-table-border">
          <Thead bg={headerBg}>
            <Tr>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Кабинет поставщика</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Артикул поставщика</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Название товара</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Артикул WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Текущий статус товара</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Ваша цена продажи на WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Зачеркнутая цена на WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Цена для покупателя</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Доп скидка от WB в %</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Учитывать карту WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Цена по карте WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Скидка по WB карте в %</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Цена у связанных конкурентов</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Расчетная цена для покупателя</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Расчетная цена продажи на WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Ваша текущая цена РЦ</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Доп наценка/скидка к РЦ по прочим стратегиям в %</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Текущая цена для расчетов цены продажи</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Минимальная цена продажи</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Новая цена выгрузки на WB</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Новая наценка (+) скидка (-) в %</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Предыдущая наценка (+) скидка (-) в %</Th>
              <Th color="white" fontSize="xs" p={2} borderRight="1px solid" borderRightColor="blue.400">Статус наценки</Th>
              <Th color="white" fontSize="xs" p={2}>Дата и время последней проверки цены</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedAndFilteredData.map((row) => (
              <Tr key={row.id} _hover={{ bg: hoverBg }}>
                {/* 1. Кабинет поставщика */}
                <Td fontSize="xs" p={2} maxW="120px" borderRight="1px solid" borderRightColor={borderColor}>
                  <Text isTruncated>{row.supplierCabinet}</Text>
                </Td>

                {/* 2. Артикул поставщика */}
                <Td fontSize="xs" p={2} fontFamily="mono" borderRight="1px solid" borderRightColor={borderColor}>
                  {row.supplierArticle}
                </Td>

                {/* 3. Название товара */}
                <Td fontSize="xs" p={2} maxW="200px" borderRight="1px solid" borderRightColor={borderColor}>
                  <Tooltip label={row.productName}>
                    <Text isTruncated>{row.productName}</Text>
                  </Tooltip>
                </Td>

                {/* 4. Артикул WB */}
                <Td fontSize="xs" p={2} fontFamily="mono" borderRight="1px solid" borderRightColor={borderColor}>
                  {row.wbArticle}
                </Td>

                {/* 5. Текущий статус товара */}
                <Td fontSize="xs" p={2} borderRight="1px solid" borderRightColor={borderColor}>
                  <Badge size="sm" colorScheme={
                    row.currentStatus === 'Активен' ? 'green' :
                    row.currentStatus === 'На модерации' ? 'yellow' :
                    row.currentStatus === 'Заблокирован' ? 'red' : 'gray'
                  }>
                    {row.currentStatus}
                  </Badge>
                </Td>

                {/* 6. Ваша цена продажи на WB */}
                <Td fontSize="xs" p={2} isNumeric fontWeight="bold" borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.yourWbSalePrice)}
                </Td>

                {/* 7. Зачеркнутая цена на WB */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  <Text textDecoration="line-through" color="gray.500">
                    {formatCurrency(row.wbCrossedPrice)}
                  </Text>
                </Td>

                {/* 8. Цена для покупателя */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.customerPrice)}
                </Td>

                {/* 9. Доп скидка от WB в % */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatPercent(row.wbExtraDiscountPercent)}
                </Td>

                {/* 10. Учитывать карту WB */}
                <Td fontSize="xs" p={2} textAlign="center" borderRight="1px solid" borderRightColor={borderColor}>
                  <Badge colorScheme={row.considerWbCard ? 'green' : 'gray'} size="sm">
                    {row.considerWbCard ? 'Да' : 'Нет'}
                  </Badge>
                </Td>

                {/* 11. Цена по карте WB */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.wbCardPrice)}
                </Td>

                {/* 12. Скидка по WB карте в % */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatPercent(row.wbCardDiscountPercent)}
                </Td>

                {/* 13. Цена у связанных конкурентов */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.competitorPrice)}
                </Td>

                {/* 14. Расчетная цена для покупателя */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.calculatedCustomerPrice)}
                </Td>

                {/* 15. Расчетная цена продажи на WB */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.calculatedWbSalePrice)}
                </Td>

                {/* 16. Ваша текущая цена РЦ */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.currentRCPrice)}
                </Td>

                {/* 17. Доп наценка/скидка к РЦ по прочим стратегиям в % */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  <Text color={row.rcMarkupDiscountPercent >= 0 ? 'green.500' : 'red.500'}>
                    {row.rcMarkupDiscountPercent >= 0 ? '+' : ''}{formatPercent(row.rcMarkupDiscountPercent)}
                  </Text>
                </Td>

                {/* 18. Текущая цена для расчетов цены продажи */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.currentCalculationPrice)}
                </Td>

                {/* 19. Минимальная цена продажи */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.minSalePrice)}
                </Td>

                {/* 20. Новая цена выгрузки на WB */}
                <Td fontSize="xs" p={2} isNumeric fontWeight="bold" color="blue.500" borderRight="1px solid" borderRightColor={borderColor}>
                  {formatCurrency(row.newWbUploadPrice)}
                </Td>

                {/* 21. Новая наценка (+) скидка (-) в % */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  <Text color={row.newMarkupDiscountPercent >= 0 ? 'green.500' : 'red.500'}>
                    {row.newMarkupDiscountPercent >= 0 ? '+' : ''}{formatPercent(row.newMarkupDiscountPercent)}
                  </Text>
                </Td>

                {/* 22. Предыдущая наценка (+) скидка (-) в % */}
                <Td fontSize="xs" p={2} isNumeric borderRight="1px solid" borderRightColor={borderColor}>
                  <Text color="gray.500">
                    {row.previousMarkupDiscountPercent >= 0 ? '+' : ''}{formatPercent(row.previousMarkupDiscountPercent)}
                  </Text>
                </Td>

                {/* 23. Статус наценки */}
                <Td fontSize="xs" p={2} borderRight="1px solid" borderRightColor={borderColor}>
                  <Badge size="sm" colorScheme={
                    row.markupStatus === 'Применена' ? 'green' :
                    row.markupStatus === 'Ожидает' ? 'yellow' :
                    row.markupStatus === 'Отклонена' ? 'red' : 'blue'
                  }>
                    {row.markupStatus}
                  </Badge>
                </Td>

                {/* 24. Дата и время последней проверки цены */}
                <Td fontSize="xs" p={2}>
                  {formatDate(row.lastPriceCheckDateTime)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        </TableContainer>
      </Box>

      {/* 📊 Summary */}
      <Box mt={4} p={4} bg={tableBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            Показано {sortedAndFilteredData.length} из {data.length} записей
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="green" variant="subtle">
              🔄 Автообновление: 30 сек
            </Badge>
            <Badge colorScheme="blue" variant="subtle">
              📊 Excel экспорт доступен
            </Badge>
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}

export default ExtendedDataTable
