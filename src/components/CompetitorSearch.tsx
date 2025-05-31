import React, { useState } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  Image,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Link,
  Flex,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaSearch, FaExternalLinkAlt, FaStar, FaShoppingCart, FaEye } from 'react-icons/fa'
import { wbParser, WBCompetitor, WBSearchResult } from '../services/wbParser'

const CompetitorSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<WBSearchResult | null>(null)
  const [selectedCompetitors, setSelectedCompetitors] = useState<Set<number>>(new Set())
  const toast = useToast()

  // 🎨 Theme colors
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')

  // 🔍 Поиск конкурентов
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Ошибка поиска',
        description: 'Введите поисковый запрос',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSearching(true)
    
    try {
      const result = await wbParser.searchCompetitors(searchQuery.trim(), 20)
      setSearchResult(result)
      
      if (result.competitors.length === 0) {
        toast({
          title: 'Товары не найдены',
          description: 'Попробуйте изменить поисковый запрос',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Поиск завершен',
          description: `Найдено ${result.competitors.length} товаров`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось выполнить поиск. Попробуйте позже.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSearching(false)
    }
  }

  // 🎯 Выбор/отмена конкурента
  const toggleCompetitor = (competitorId: number) => {
    const newSelected = new Set(selectedCompetitors)
    if (newSelected.has(competitorId)) {
      newSelected.delete(competitorId)
    } else {
      newSelected.add(competitorId)
    }
    setSelectedCompetitors(newSelected)
  }

  // 💰 Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // ⭐ Рендер рейтинга
  const renderRating = (rating: number, reviewsCount: number) => (
    <HStack spacing={1}>
      <FaStar color="#FFD700" size="12px" />
      <Text fontSize="sm" color="gray.600">
        {rating.toFixed(1)} ({reviewsCount})
      </Text>
    </HStack>
  )

  // 📊 Статистика парсера
  const parserStats = wbParser.getStats()

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* 🔍 Поиск */}
        <Card bg={cardBg} borderWidth="2px" borderColor="blue.500">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                🔍 Поиск конкурентов на Wildberries
              </Text>
              
              <HStack>
                <Input
                  placeholder="Введите название товара для поиска..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  size="lg"
                />
                <Button
                  leftIcon={<FaSearch />}
                  colorScheme="blue"
                  onClick={handleSearch}
                  isLoading={isSearching}
                  loadingText="Поиск..."
                  size="lg"
                  minW="120px"
                >
                  Найти
                </Button>
              </HStack>

              {/* 📊 Статистика API */}
              <HStack spacing={4} p={3} bg="blue.50" borderRadius="md">
                <Stat size="sm">
                  <StatLabel>Запросов использовано</StatLabel>
                  <StatNumber>{parserStats.requestCount}/{parserStats.maxRequestsPerHour}</StatNumber>
                  <StatHelpText>в час</StatHelpText>
                </Stat>
                <Box flex={1}>
                  <Text fontSize="xs" mb={1}>Лимит запросов:</Text>
                  <Progress 
                    value={(parserStats.requestCount / parserStats.maxRequestsPerHour) * 100} 
                    colorScheme={parserStats.isRateLimited ? "red" : "blue"}
                    size="sm"
                  />
                </Box>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* ⚠️ Предупреждение о лимитах */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Безопасный парсинг</AlertTitle>
            <AlertDescription>
              Система автоматически контролирует скорость запросов для защиты от блокировки. 
              Максимум 60 запросов в час с умными задержками.
            </AlertDescription>
          </Box>
        </Alert>

        {/* 🔄 Индикатор загрузки */}
        {isSearching && (
          <Flex justify="center" align="center" py={8}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="blue.600">Ищем конкурентов на Wildberries...</Text>
              <Text fontSize="sm" color="gray.500">
                Это может занять несколько секунд
              </Text>
            </VStack>
          </Flex>
        )}

        {/* 📋 Результаты поиска */}
        {searchResult && searchResult.competitors.length > 0 && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    📋 Результаты поиска: "{searchResult.searchQuery}"
                  </Text>
                  <Badge colorScheme="blue" px={3} py={1}>
                    Найдено: {searchResult.totalFound}
                  </Badge>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {searchResult.competitors.map((competitor) => (
                    <Card
                      key={competitor.id}
                      bg={selectedCompetitors.has(competitor.id) ? "blue.50" : cardBg}
                      borderWidth="2px"
                      borderColor={selectedCompetitors.has(competitor.id) ? "blue.500" : borderColor}
                      cursor="pointer"
                      onClick={() => toggleCompetitor(competitor.id)}
                      _hover={{ borderColor: "blue.400", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      <CardBody p={4}>
                        <VStack spacing={3} align="stretch">
                          {/* 🖼️ Изображение товара */}
                          {competitor.image && (
                            <Image
                              src={competitor.image}
                              alt={competitor.name}
                              borderRadius="md"
                              maxH="150px"
                              objectFit="cover"
                              fallbackSrc="https://via.placeholder.com/150x150/E2E8F0/718096?text=No+Image"
                            />
                          )}

                          {/* 📝 Информация о товаре */}
                          <VStack spacing={2} align="stretch">
                            <Text fontWeight="bold" fontSize="sm" noOfLines={2} color={textColor}>
                              {competitor.name}
                            </Text>
                            
                            <HStack justify="space-between">
                              <Badge colorScheme="purple" size="sm">
                                {competitor.brand}
                              </Badge>
                              <Badge 
                                colorScheme={competitor.isAvailable ? "green" : "red"} 
                                size="sm"
                              >
                                {competitor.isAvailable ? "В наличии" : "Нет в наличии"}
                              </Badge>
                            </HStack>

                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                              Продавец: {competitor.seller}
                            </Text>

                            {/* 💰 Цена */}
                            <HStack justify="space-between" align="center">
                              <VStack spacing={0} align="start">
                                <Text fontWeight="bold" fontSize="lg" color="green.600">
                                  {formatPrice(competitor.price)}
                                </Text>
                                {competitor.originalPrice && competitor.discount && (
                                  <HStack spacing={1}>
                                    <Text fontSize="xs" textDecoration="line-through" color="gray.500">
                                      {formatPrice(competitor.originalPrice)}
                                    </Text>
                                    <Badge colorScheme="red" size="sm">
                                      -{competitor.discount}%
                                    </Badge>
                                  </HStack>
                                )}
                              </VStack>
                            </HStack>

                            {/* ⭐ Рейтинг */}
                            {renderRating(competitor.rating, competitor.reviewsCount)}

                            {/* 🔗 Ссылка на товар */}
                            <Link
                              href={competitor.url}
                              isExternal
                              color="blue.500"
                              fontSize="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HStack spacing={1}>
                                <FaExternalLinkAlt size="12px" />
                                <Text>Открыть на WB</Text>
                              </HStack>
                            </Link>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>

                {/* 🎯 Выбранные конкуренты */}
                {selectedCompetitors.size > 0 && (
                  <Alert status="success">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Выбрано конкурентов: {selectedCompetitors.size}</AlertTitle>
                      <AlertDescription>
                        Нажмите на карточки товаров для выбора/отмены. 
                        Выбранные конкуренты будут добавлены для мониторинга цен.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  )
}

export default CompetitorSearch
