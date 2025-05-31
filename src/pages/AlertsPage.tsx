import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Badge,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import SuspiciousActivityAlert from '../components/SuspiciousActivityAlert';
import { useProducts } from '../context/ProductContext';
import { SuspiciousActivityAlert as AlertType, SuspiciousActivityType } from '../types';

export default function AlertsPage() {
  const { suspiciousActivities, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showResolved, setShowResolved] = useState(false);
  const [displayAlerts, setDisplayAlerts] = useState<AlertType[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // Фильтруем и сортируем алерты при изменении поиска, сортировки или статуса
  useEffect(() => {
    let result = [...suspiciousActivities];
    
    // Фильтруем по статусу
    if (!showResolved) {
      result = result.filter(alert => !alert.isResolved);
    }
    
    // Фильтруем по типу (если выбрана вкладка)
    if (activeTab > 0) {
      const alertTypes = [
        SuspiciousActivityType.FAKE_REVIEWS,
        SuspiciousActivityType.FAKE_SHOP,
        SuspiciousActivityType.DUMPING
      ];
      result = result.filter(alert => alert.type === alertTypes[activeTab - 1]);
    }
    
    // Применяем поиск
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(alert => 
        alert.competitorName.toLowerCase().includes(lowerSearchTerm) ||
        alert.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Применяем сортировку
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'competitor':
          return a.competitorName.localeCompare(b.competitorName);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    
    setDisplayAlerts(result);
  }, [suspiciousActivities, searchTerm, sortBy, showResolved, activeTab]);
  
  // Получаем количество алертов по типам
  const getAlertCountByType = (type: SuspiciousActivityType) => {
    return suspiciousActivities.filter(alert => 
      alert.type === type && (!showResolved ? !alert.isResolved : true)
    ).length;
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Алерты подозрительной активности</Heading>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', md: 'center' }} 
        mb={6}
        gap={4}
      >
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Поиск алертов..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Flex gap={4} align="center">
          <Select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            width={{ base: '100%', md: '200px' }}
          >
            <option value="date_desc">По дате (сначала новые)</option>
            <option value="date_asc">По дате (сначала старые)</option>
            <option value="competitor">По конкуренту</option>
            <option value="type">По типу</option>
          </Select>
          
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="show-resolved" mb="0" fontSize="sm" whiteSpace="nowrap">
              Показать разрешенные
            </FormLabel>
            <Switch 
              id="show-resolved" 
              isChecked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>
        </Flex>
      </Flex>
      
      <Tabs 
        colorScheme="blue" 
        mb={6}
        onChange={(index) => setActiveTab(index)}
      >
        <TabList>
          <Tab>
            Все
            <Badge ml={2} colorScheme="blue" borderRadius="full">
              {suspiciousActivities.filter(a => !showResolved ? !a.isResolved : true).length}
            </Badge>
          </Tab>
          <Tab>
            Фейковые отзывы
            <Badge ml={2} colorScheme="orange" borderRadius="full">
              {getAlertCountByType(SuspiciousActivityType.FAKE_REVIEWS)}
            </Badge>
          </Tab>
          <Tab>
            Фейковые магазины
            <Badge ml={2} colorScheme="red" borderRadius="full">
              {getAlertCountByType(SuspiciousActivityType.FAKE_SHOP)}
            </Badge>
          </Tab>
          <Tab>
            Демпинг
            <Badge ml={2} colorScheme="purple" borderRadius="full">
              {getAlertCountByType(SuspiciousActivityType.DUMPING)}
            </Badge>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <AlertsList 
              alerts={displayAlerts} 
              isLoading={isLoading} 
              error={error}
            />
          </TabPanel>
          <TabPanel px={0}>
            <AlertsList 
              alerts={displayAlerts} 
              isLoading={isLoading} 
              error={error}
            />
          </TabPanel>
          <TabPanel px={0}>
            <AlertsList 
              alerts={displayAlerts} 
              isLoading={isLoading} 
              error={error}
            />
          </TabPanel>
          <TabPanel px={0}>
            <AlertsList 
              alerts={displayAlerts} 
              isLoading={isLoading} 
              error={error}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

interface AlertsListProps {
  alerts: AlertType[];
  isLoading: boolean;
  error: string | null;
}

function AlertsList({ alerts, isLoading, error }: AlertsListProps) {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="300px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }
  
  if (alerts.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text>
          Алерты не найдены. Возможно, все алерты уже разрешены или нет подозрительной активности.
        </Text>
      </Alert>
    );
  }
  
  return (
    <Stack spacing={4}>
      {alerts.map(alert => (
        <SuspiciousActivityAlert key={alert.id} alert={alert} />
      ))}
    </Stack>
  );
}
