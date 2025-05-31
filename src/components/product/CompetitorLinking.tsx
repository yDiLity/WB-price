import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  Image,
  useColorModeValue,
  Tooltip,
  HStack,
  VStack,
  Divider,
  Select
} from '@chakra-ui/react';
import {
  SearchIcon,
  ExternalLinkIcon,
  AddIcon,
  DeleteIcon,
  RepeatIcon,
  CheckIcon
} from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types/product';
import { mockCompetitors } from '../../services/mockData';

interface CompetitorLinkingProps {
  product: Product;
  onSelectCompetitors: (competitors: CompetitorProduct[]) => void;
  initialCompetitors?: CompetitorProduct[];
}

/**
 * Компонент для связывания товара с конкурентами
 */
export default function CompetitorLinking({
  product,
  onSelectCompetitors,
  initialCompetitors = []
}: CompetitorLinkingProps) {
  // Состояние для поиска
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<CompetitorProduct[]>([]);
  
  // Состояние для выбранных конкурентов
  const [selectedCompetitors, setSelectedCompetitors] = useState<CompetitorProduct[]>(initialCompetitors);
  
  // Состояние для фильтрации
  const [showOnlyOzon, setShowOnlyOzon] = useState<boolean>(false);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Обработчик поиска конкурентов
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Имитация задержки API
    setTimeout(() => {
      // Генерация случайных результатов поиска
      const results: CompetitorProduct[] = [];
      
      // Добавляем 5-10 случайных конкурентов
      const numberOfResults = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < numberOfResults; i++) {
        const competitor = mockCompetitors[Math.floor(Math.random() * mockCompetitors.length)];
        const price = Math.round(product.price.current * (0.85 + Math.random() * 0.3));
        
        results.push({
          id: `comp-${Date.now()}-${i}`,
          competitorId: competitor.id,
          competitorName: competitor.name,
          productTitle: `${searchTerm} (${competitor.name})`,
          price,
          url: competitor.url + '/product/' + Math.floor(Math.random() * 1000000),
          lastUpdated: new Date()
        });
      }
      
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };
  
  // Обработчик добавления конкурента
  const handleAddCompetitor = (competitor: CompetitorProduct) => {
    if (!selectedCompetitors.find(c => c.id === competitor.id)) {
      const updatedCompetitors = [...selectedCompetitors, competitor];
      setSelectedCompetitors(updatedCompetitors);
      onSelectCompetitors(updatedCompetitors);
    }
  };
  
  // Обработчик удаления конкурента
  const handleRemoveCompetitor = (competitorId: string) => {
    const updatedCompetitors = selectedCompetitors.filter(c => c.id !== competitorId);
    setSelectedCompetitors(updatedCompetitors);
    onSelectCompetitors(updatedCompetitors);
  };
  
  // Фильтрация результатов поиска
  const filteredSearchResults = showOnlyOzon
    ? searchResults.filter(c => c.competitorName.toLowerCase().includes('ozon') || c.url.toLowerCase().includes('ozon.ru'))
    : searchResults;
  
  // Получение цвета для разницы в цене
  const getPriceDiffColor = (competitorPrice: number) => {
    const priceDiff = ((competitorPrice - product.price.current) / product.price.current) * 100;
    
    if (priceDiff < -10) return 'green.500';
    if (priceDiff < 0) return 'green.400';
    if (priceDiff === 0) return 'gray.500';
    if (priceDiff > 10) return 'red.500';
    return 'red.400';
  };
  
  // Получение текста для разницы в цене
  const getPriceDiffText = (competitorPrice: number) => {
    const priceDiff = competitorPrice - product.price.current;
    const priceDiffPercent = (priceDiff / product.price.current) * 100;
    
    return `${priceDiff > 0 ? '+' : ''}${priceDiff.toLocaleString('ru-RU')} ₽ (${priceDiffPercent.toFixed(1)}%)`;
  };
  
  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Поиск конкурентов</Tab>
          <Tab>Связанные конкуренты ({selectedCompetitors.length})</Tab>
        </TabList>
        
        <TabPanels>
          {/* Вкладка поиска конкурентов */}
          <TabPanel p={0}>
            <Box p={4}>
              <Flex mb={4} gap={4} align="center" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                <InputGroup flex="1">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Введите название товара или SKU"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </InputGroup>
                
                <Button
                  colorScheme="blue"
                  onClick={handleSearch}
                  isLoading={isSearching}
                  loadingText="Поиск..."
                  minW="120px"
                >
                  Найти
                </Button>
                
                <Checkbox
                  isChecked={showOnlyOzon}
                  onChange={(e) => setShowOnlyOzon(e.target.checked)}
                >
                  Только Ozon
                </Checkbox>
              </Flex>
              
              {isSearching ? (
                <Flex justify="center" align="center" height="200px">
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                </Flex>
              ) : searchResults.length === 0 ? (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text>Введите название товара или SKU и нажмите "Найти"</Text>
                </Alert>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>Маркетплейс</Th>
                        <Th>Название товара</Th>
                        <Th isNumeric>Цена</Th>
                        <Th isNumeric>Разница</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredSearchResults.map(competitor => (
                        <Tr key={competitor.id}>
                          <Td>
                            <Badge
                              colorScheme={
                                competitor.url.includes('ozon.ru') ? 'blue' :
                                competitor.url.includes('wildberries.ru') ? 'purple' :
                                competitor.url.includes('aliexpress.ru') ? 'orange' :
                                competitor.url.includes('market.yandex.ru') ? 'yellow' : 'gray'
                              }
                              px={2}
                              py={1}
                            >
                              {competitor.competitorName}
                            </Badge>
                          </Td>
                          <Td maxW="300px" isTruncated title={competitor.productTitle}>
                            {competitor.productTitle}
                          </Td>
                          <Td isNumeric fontWeight="bold">
                            {formatPrice(competitor.price)}
                          </Td>
                          <Td isNumeric>
                            <Text color={getPriceDiffColor(competitor.price)}>
                              {getPriceDiffText(competitor.price)}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Открыть страницу товара">
                                <IconButton
                                  icon={<ExternalLinkIcon />}
                                  aria-label="Открыть страницу товара"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => window.open(competitor.url, '_blank')}
                                />
                              </Tooltip>
                              
                              <Tooltip label="Добавить связь">
                                <IconButton
                                  icon={<AddIcon />}
                                  aria-label="Добавить связь"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="green"
                                  onClick={() => handleAddCompetitor(competitor)}
                                  isDisabled={selectedCompetitors.some(c => c.id === competitor.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* Вкладка связанных конкурентов */}
          <TabPanel p={0}>
            <Box p={4}>
              {selectedCompetitors.length === 0 ? (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text>Нет связанных конкурентов. Добавьте конкурентов на вкладке "Поиск конкурентов"</Text>
                </Alert>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>Маркетплейс</Th>
                        <Th>Название товара</Th>
                        <Th isNumeric>Цена</Th>
                        <Th isNumeric>Разница</Th>
                        <Th>Действия</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedCompetitors.map(competitor => (
                        <Tr key={competitor.id}>
                          <Td>
                            <Badge
                              colorScheme={
                                competitor.url.includes('ozon.ru') ? 'blue' :
                                competitor.url.includes('wildberries.ru') ? 'purple' :
                                competitor.url.includes('aliexpress.ru') ? 'orange' :
                                competitor.url.includes('market.yandex.ru') ? 'yellow' : 'gray'
                              }
                              px={2}
                              py={1}
                            >
                              {competitor.competitorName}
                            </Badge>
                          </Td>
                          <Td maxW="300px" isTruncated title={competitor.productTitle}>
                            {competitor.productTitle}
                          </Td>
                          <Td isNumeric fontWeight="bold">
                            {formatPrice(competitor.price)}
                          </Td>
                          <Td isNumeric>
                            <Text color={getPriceDiffColor(competitor.price)}>
                              {getPriceDiffText(competitor.price)}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Открыть страницу товара">
                                <IconButton
                                  icon={<ExternalLinkIcon />}
                                  aria-label="Открыть страницу товара"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => window.open(competitor.url, '_blank')}
                                />
                              </Tooltip>
                              
                              <Tooltip label="Удалить связь">
                                <IconButton
                                  icon={<DeleteIcon />}
                                  aria-label="Удалить связь"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveCompetitor(competitor.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
