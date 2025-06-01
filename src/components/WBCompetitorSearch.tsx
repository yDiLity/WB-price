import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Image,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { FaSearch, FaShieldAlt, FaEye, FaLink, FaRocket } from 'react-icons/fa';
import { wildberriesApi } from '../services/wildberriesApi';
import { wbParsingService } from '../services/wbParsingService';
import { antiBanService } from '../services/antiBanService';

interface WBCompetitor {
  id: number;
  name: string;
  brand: string;
  seller: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  url: string;
  image: string;
  isAvailable: boolean;
  position?: number;
}

interface WBSearchResult {
  competitors: WBCompetitor[];
  totalFound: number;
  searchQuery: string;
  timestamp: string;
  protectionStatus: {
    proxiesActive: number;
    fingerprintRotated: boolean;
    requestsSafe: boolean;
  };
}

export default function WBCompetitorSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<WBSearchResult | null>(null);
  const [protectionStats, setProtectionStats] = useState({
    requestsToday: 0,
    bansPrevented: 0,
    proxiesActive: 3,
    lastRotation: new Date()
  });

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Поиск конкурентов с защитой от банов
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название товара для поиска',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);

    try {
      console.log('🔍 Начинаем защищенный поиск на WB:', searchQuery);

      // Используем защищенный парсинг WB
      const result = await wbParsingService.searchProducts({
        query: searchQuery,
        limit: 20,
        sort: 'popular'
      });

      if (result.success && result.data) {
        const competitors: WBCompetitor[] = result.data.map((item: any, index: number) => ({
          id: item.id || item.nmID,
          name: item.name || item.title,
          brand: item.brand || 'Неизвестно',
          seller: item.seller || 'Неизвестно',
          price: item.price || item.salePriceU / 100,
          originalPrice: item.originalPrice || item.priceU / 100,
          discount: item.discount,
          rating: item.rating || 0,
          reviewsCount: item.reviewsCount || item.feedbacks || 0,
          url: `https://www.wildberries.ru/catalog/${item.id}/detail.aspx`,
          image: item.image || item.pics?.[0] || '',
          isAvailable: item.isAvailable !== false,
          position: index + 1
        }));

        const searchResult: WBSearchResult = {
          competitors,
          totalFound: competitors.length,
          searchQuery,
          timestamp: new Date().toISOString(),
          protectionStatus: {
            proxiesActive: 3,
            fingerprintRotated: true,
            requestsSafe: true
          }
        };

        setSearchResults(searchResult);

        // Обновляем статистику защиты
        setProtectionStats(prev => ({
          ...prev,
          requestsToday: prev.requestsToday + 1,
          bansPrevented: prev.bansPrevented + (result.bansPrevented || 0)
        }));

        toast({
          title: 'Поиск завершен!',
          description: `Найдено ${competitors.length} товаров с реальными ценами`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Ошибка поиска');
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast({
        title: 'Ошибка поиска',
        description: error instanceof Error ? error.message : 'Не удалось выполнить поиск',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Принудительная ротация защиты
  const handleForceRotation = () => {
    antiBanService.forceRotation();
    setProtectionStats(prev => ({
      ...prev,
      lastRotation: new Date()
    }));
    toast({
      title: 'Защита обновлена',
      description: 'Fingerprint и прокси ротированы',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Заголовок */}
        <Card bg={cardBg} borderWidth="2px" borderColor="purple.500">
          <CardHeader>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="purple.600">
                  🛒 Поиск конкурентов Wildberries
                </Heading>
                <Text color="gray.500">
                  Реальные цены с защитой от банов
                </Text>
              </VStack>
              <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                ЗАЩИЩЕНО
              </Badge>
            </HStack>
          </CardHeader>
        </Card>

        {/* Статистика защиты */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Запросов сегодня</StatLabel>
            <StatNumber color="blue.500">{protectionStats.requestsToday}</StatNumber>
            <StatHelpText>Безопасно выполнено</StatHelpText>
          </Stat>

          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Банов предотвращено</StatLabel>
            <StatNumber color="green.500">{protectionStats.bansPrevented}</StatNumber>
            <StatHelpText>Система защиты работает</StatHelpText>
          </Stat>

          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Активных прокси</StatLabel>
            <StatNumber color="purple.500">{protectionStats.proxiesActive}</StatNumber>
            <StatHelpText>Ротация активна</StatHelpText>
          </Stat>

          <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <StatLabel>Последняя ротация</StatLabel>
            <StatNumber fontSize="sm" color="orange.500">
              {protectionStats.lastRotation.toLocaleTimeString()}
            </StatNumber>
            <StatHelpText>Fingerprint обновлен</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Поиск */}
        <Card bg={cardBg} borderWidth="2px" borderColor="blue.500">
          <CardBody>
            <VStack spacing={4} align="stretch">
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
                <Tooltip label="Обновить защиту">
                  <IconButton
                    icon={<FaShieldAlt />}
                    aria-label="Обновить защиту"
                    colorScheme="green"
                    variant="outline"
                    size="lg"
                    onClick={handleForceRotation}
                  />
                </Tooltip>
              </HStack>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Защищенный поиск</Text>
                  <Text fontSize="sm">
                    Используются прокси, ротация fingerprint и задержки для предотвращения банов
                  </Text>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Результаты поиска */}
        {searchResults && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">
                  Найдено товаров: {searchResults.totalFound}
                </Heading>
                <Badge colorScheme="blue">
                  {searchResults.searchQuery}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {searchResults.competitors.map((competitor) => (
                  <Card key={competitor.id} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Image
                            src={competitor.image}
                            alt={competitor.name}
                            boxSize="60px"
                            objectFit="cover"
                            borderRadius="md"
                            fallbackSrc="https://via.placeholder.com/60"
                          />
                          <VStack align="start" spacing={1} flex="1">
                            <Text fontSize="sm" fontWeight="bold" noOfLines={2}>
                              {competitor.name}
                            </Text>
                            <Badge colorScheme="purple" fontSize="xs">
                              {competitor.brand}
                            </Badge>
                          </VStack>
                        </HStack>

                        <Divider />

                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color="green.500">
                              {formatPrice(competitor.price)}
                            </Text>
                            {competitor.originalPrice && competitor.originalPrice > competitor.price && (
                              <Text fontSize="sm" textDecoration="line-through" color="gray.500">
                                {formatPrice(competitor.originalPrice)}
                              </Text>
                            )}
                          </VStack>
                          <VStack align="end" spacing={0}>
                            <Text fontSize="sm">⭐ {competitor.rating.toFixed(1)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {competitor.reviewsCount} отзывов
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<FaEye />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => window.open(competitor.url, '_blank')}
                          >
                            Смотреть
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FaLink />}
                            colorScheme="green"
                            variant="outline"
                          >
                            Связать
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}
