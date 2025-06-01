import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tooltip,
  Divider,
  useColorModeValue,
  Heading,
  HStack,
  VStack,
  Image,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Select
} from '@chakra-ui/react';
import {
  ExternalLinkIcon,
  DeleteIcon,
  SearchIcon,
  RepeatIcon,
  InfoIcon,
  LinkIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types/product';

interface CompetitorLinksOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  linkedCompetitors: CompetitorProduct[];
  onRemoveCompetitor?: (competitorId: string) => void;
}

/**
 * Компонент для отображения обзора всех связанных конкурентов
 */
export default function CompetitorLinksOverview({
  isOpen,
  onClose,
  product,
  linkedCompetitors,
  onRemoveCompetitor
}: CompetitorLinksOverviewProps) {
  // Состояние для фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  
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
  
  // Фильтрация конкурентов
  const filteredCompetitors = linkedCompetitors.filter(competitor => {
    const matchesSearch = searchTerm === '' || 
      competitor.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competitor.competitorName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesMarketplace = selectedMarketplace === '' || 
      (selectedMarketplace === 'ozon' && (
        competitor.competitorName.toLowerCase().includes('ozon') || 
        competitor.url.toLowerCase().includes('ozon.ru')
      )) ||
      (selectedMarketplace === 'wildberries' && (
        competitor.competitorName.toLowerCase().includes('wildberries') || 
        competitor.url.toLowerCase().includes('wildberries.ru')
      )) ||
      (selectedMarketplace === 'aliexpress' && (
        competitor.competitorName.toLowerCase().includes('aliexpress') || 
        competitor.url.toLowerCase().includes('aliexpress.ru')
      )) ||
      (selectedMarketplace === 'yandex' && (
        competitor.competitorName.toLowerCase().includes('яндекс') || 
        competitor.url.toLowerCase().includes('market.yandex.ru')
      ));
      
    return matchesSearch && matchesMarketplace;
  });
  
  // Получение уникальных маркетплейсов
  const getMarketplaces = () => {
    const marketplaces = new Set<string>();
    
    linkedCompetitors.forEach(competitor => {
      if (competitor.url.includes('ozon.ru') || competitor.competitorName.toLowerCase().includes('ozon')) {
        marketplaces.add('ozon');
      } else if (competitor.url.includes('wildberries.ru') || competitor.competitorName.toLowerCase().includes('wildberries')) {
        marketplaces.add('wildberries');
      } else if (competitor.url.includes('aliexpress.ru') || competitor.competitorName.toLowerCase().includes('aliexpress')) {
        marketplaces.add('aliexpress');
      } else if (competitor.url.includes('market.yandex.ru') || competitor.competitorName.toLowerCase().includes('яндекс')) {
        marketplaces.add('yandex');
      } else {
        marketplaces.add('other');
      }
    });
    
    return Array.from(marketplaces);
  };
  
  // Обработчик удаления конкурента
  const handleRemoveCompetitor = (competitorId: string) => {
    if (onRemoveCompetitor) {
      onRemoveCompetitor(competitorId);
    }
  };
  
  // Получение цвета для разницы в цене
  const getPriceDiffColor = (priceDiff: number) => {
    if (priceDiff < -10) return 'green.500';
    if (priceDiff < 0) return 'green.400';
    if (priceDiff === 0) return 'gray.500';
    if (priceDiff > 10) return 'red.500';
    return 'red.400';
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg={headerBg} borderTopRadius="md">
          <Flex justify="space-between" align="center">
            <Text>Обзор связанных конкурентов</Text>
            <Badge colorScheme="blue" fontSize="md" px={2} py={1} borderRadius="md">
              {linkedCompetitors.length} связей
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          {/* Информация о товаре */}
          <Box p={6} borderBottomWidth="1px" borderColor={borderColor}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Flex gap={4}>
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0].url} 
                    alt={product.title}
                    boxSize="100px"
                    objectFit="contain"
                    borderRadius="md"
                    border="1px solid"
                    borderColor={borderColor}
                  />
                ) : (
                  <Box 
                    boxSize="100px" 
                    bg="gray.100" 
                    borderRadius="md" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                  >
                    <Text color="gray.500">Нет фото</Text>
                  </Box>
                )}
                
                <VStack align="flex-start" spacing={1}>
                  <Heading size="md">{product.title}</Heading>
                  <HStack>
                    <Badge colorScheme="purple">{product.category}</Badge>
                    <Badge colorScheme={product.stock.available > 0 ? "green" : "red"}>
                      {product.stock.available > 0 ? `В наличии: ${product.stock.available}` : "Нет в наличии"}
                    </Badge>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {formatPrice(product.price.current)}
                  </Text>
                </VStack>
              </Flex>
              
              <Box>
                <Heading size="sm" mb={2}>Связанные маркетплейсы</Heading>
                <HStack spacing={2} flexWrap="wrap">
                  {getMarketplaces().map(marketplace => (
                    <Badge 
                      key={marketplace}
                      colorScheme={
                        marketplace === 'ozon' ? 'blue' :
                        marketplace === 'wildberries' ? 'purple' :
                        marketplace === 'aliexpress' ? 'orange' :
                        marketplace === 'yandex' ? 'yellow' : 'gray'
                      }
                      px={3}
                      py={1}
                      borderRadius="full"
                      cursor="pointer"
                      onClick={() => setSelectedMarketplace(selectedMarketplace === marketplace ? '' : marketplace)}
                      variant={selectedMarketplace === marketplace ? "solid" : "subtle"}
                    >
                      {marketplace === 'ozon' ? 'Ozon' :
                       marketplace === 'wildberries' ? 'Wildberries' :
                       marketplace === 'aliexpress' ? 'AliExpress' :
                       marketplace === 'yandex' ? 'Яндекс.Маркет' : 'Другие'}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            </SimpleGrid>
          </Box>
          
          {/* Фильтры */}
          <Box p={4} bg={headerBg}>
            <Flex gap={4} flexWrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Поиск по названию или магазину" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                placeholder="Все маркетплейсы"
                maxW="200px"
                value={selectedMarketplace}
                onChange={(e) => setSelectedMarketplace(e.target.value)}
              >
                <option value="wildberries">Wildberries</option>
                <option value="ozon">Ozon</option>
                <option value="aliexpress">AliExpress</option>
                <option value="yandex">Яндекс.Маркет</option>
                <option value="other">Другие</option>
              </Select>
              
              <Button 
                leftIcon={<RepeatIcon />} 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMarketplace('');
                }}
              >
                Сбросить
              </Button>
            </Flex>
          </Box>
          
          {/* Таблица связанных конкурентов */}
          {filteredCompetitors.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Маркетплейс</Th>
                    <Th>Название товара</Th>
                    <Th isNumeric>Цена</Th>
                    <Th isNumeric>Разница</Th>
                    <Th>Обновлено</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCompetitors.map(competitor => {
                    const priceDiff = ((competitor.price - product.price.current) / product.price.current) * 100;
                    const isOzonCompetitor = competitor.competitorName.toLowerCase().includes('ozon') || 
                                            competitor.url.toLowerCase().includes('ozon.ru');
                    
                    return (
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
                          <Text color={getPriceDiffColor(priceDiff)}>
                            {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                          </Text>
                        </Td>
                        <Td fontSize="sm">
                          {formatDate(competitor.lastUpdated)}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {competitor.url && (
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
                            )}
                            
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
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Alert status="info" m={6}>
              <AlertIcon />
              {linkedCompetitors.length > 0 
                ? 'Нет конкурентов, соответствующих фильтрам' 
                : 'Нет связанных конкурентов'}
            </Alert>
          )}
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button onClick={onClose}>Закрыть</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
