import { 
  Box, 
  Container, 
  Flex, 
  Grid, 
  Heading, 
  Text, 
  Button, 
  Spinner, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  useBreakpointValue
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaSync } from 'react-icons/fa';
import SlotCard from '../components/SlotCard';
import SlotFilters from '../components/SlotFilters';
import { useSlots } from '../context/SlotContext';

export default function SlotsPage() {
  const { slots, isLoading, error, fetchSlots } = useSlots();
  
  useEffect(() => {
    fetchSlots();
  }, []);

  const handleRefresh = () => {
    fetchSlots();
  };

  const columnCount = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  return (
    <Container maxW="7xl" py={8}>
      <Heading as="h1" mb={6}>Поиск слотов</Heading>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        gap={6}
      >
        {/* Фильтры */}
        <Box 
          width={{ base: '100%', md: '300px' }} 
          flexShrink={0}
        >
          <SlotFilters onApplyFilters={fetchSlots} />
        </Box>
        
        {/* Список слотов */}
        <Box flex="1">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="medium">
              {slots.length > 0 
                ? `Найдено слотов: ${slots.length}` 
                : 'Нет доступных слотов'}
            </Text>
            <Button
              leftIcon={<FaSync />}
              onClick={handleRefresh}
              isLoading={isLoading}
              size="sm"
            >
              Обновить
            </Button>
          </Flex>
          
          {isLoading ? (
            <Flex justify="center" align="center" height="300px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertTitle mr={2}>Ошибка!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : slots.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle mr={2}>Нет слотов</AlertTitle>
              <AlertDescription>
                По вашему запросу не найдено доступных слотов. Попробуйте изменить параметры фильтрации или проверить позже.
              </AlertDescription>
            </Alert>
          ) : (
            <Grid 
              templateColumns={`repeat(${columnCount}, 1fr)`} 
              gap={4}
            >
              {slots.map(slot => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </Grid>
          )}
        </Box>
      </Flex>
    </Container>
  );
}
