import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import CategorySelector from '../components/CategorySelector';
import CategorySpecificMetrics from '../components/CategorySpecificMetrics';
import CategoryPricingStrategies from '../components/CategoryPricingStrategies';
import { getCategoryPath, getAllCategories } from '../data/categories';

export default function CategoryInsightsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryPath, setCategoryPath] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();
  
  // Цвета
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Обновляем путь категории при изменении выбранной категории
  useEffect(() => {
    if (selectedCategoryId) {
      setCategoryPath(getCategoryPath(selectedCategoryId));
    } else {
      setCategoryPath([]);
    }
  }, [selectedCategoryId]);
  
  // Обработчик выбора категории
  const handleCategoryChange = (categories: string[]) => {
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0]);
    } else {
      setSelectedCategoryId('');
    }
  };
  
  // Обработчик применения стратегии
  const handleApplyStrategy = (strategyId: string) => {
    toast({
      title: 'Стратегия применена',
      description: `Стратегия "${strategyId}" успешно применена к выбранной категории`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={2}>Аналитика по категориям</Heading>
      <Text color="gray.600" mb={6}>
        Специализированные метрики и стратегии ценообразования для разных категорий товаров
      </Text>
      
      <Box 
        p={4} 
        bg={cardBg} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor={borderColor}
        boxShadow="sm"
        mb={6}
      >
        <Heading size="md" mb={4}>Выберите категорию</Heading>
        <CategorySelector
          selectedCategories={selectedCategoryId ? [selectedCategoryId] : []}
          onChange={handleCategoryChange}
          maxSelections={1}
          placeholder="Выберите категорию для анализа"
        />
      </Box>
      
      {selectedCategoryId ? (
        <>
          {categoryPath.length > 0 && (
            <Breadcrumb 
              separator={<ChevronRightIcon color="gray.500" />} 
              mb={4}
              fontSize="sm"
            >
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Категории</BreadcrumbLink>
              </BreadcrumbItem>
              
              {categoryPath.map((category, index) => (
                <BreadcrumbItem 
                  key={category.id} 
                  isCurrentPage={index === categoryPath.length - 1}
                >
                  <BreadcrumbLink href="#">{category.name}</BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
          
          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue" mb={6}>
            <TabList>
              <Tab>Специфические метрики</Tab>
              <Tab>Стратегии ценообразования</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel px={0}>
                <CategorySpecificMetrics categoryId={selectedCategoryId} />
              </TabPanel>
              
              <TabPanel px={0}>
                <CategoryPricingStrategies 
                  categoryId={selectedCategoryId} 
                  onSelectStrategy={handleApplyStrategy}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Box 
            p={4} 
            bg={cardBg} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor={borderColor}
            boxShadow="sm"
            mb={6}
          >
            <Heading size="md" mb={4}>Рекомендации ИИ для категории</Heading>
            <Text mb={4}>
              На основе анализа данных о товарах в выбранной категории, ИИ предлагает следующие рекомендации:
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Оптимальная наценка</AlertTitle>
                  <AlertDescription>
                    Рекомендуемая наценка для данной категории составляет 25-35%, что выше среднего показателя по маркетплейсу (20-25%).
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Потенциал роста</AlertTitle>
                  <AlertDescription>
                    Категория показывает стабильный рост спроса на 15% в год. Рекомендуется увеличить ассортимент.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Сезонность</AlertTitle>
                  <AlertDescription>
                    Выявлена сильная сезонность с пиками в ноябре-декабре. Рекомендуется заранее планировать запасы.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Конкуренция</AlertTitle>
                  <AlertDescription>
                    Средний уровень конкуренции. Основное конкурентное преимущество - скорость доставки и наличие товара.
                  </AlertDescription>
                </Box>
              </Alert>
            </SimpleGrid>
          </Box>
        </>
      ) : (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Выберите категорию</AlertTitle>
            <AlertDescription>
              Для просмотра специфических метрик и стратегий ценообразования выберите категорию товаров.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Container>
  );
}
