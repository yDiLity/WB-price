import { 
  Box, 
  Button, 
  Checkbox, 
  CheckboxGroup, 
  Flex, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  Stack, 
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { SlotFilters as SlotFiltersType, SlotType, Warehouse } from '../types';
import { useSlots } from '../context/SlotContext';

interface SlotFiltersProps {
  onApplyFilters: () => void;
}

export default function SlotFilters({ onApplyFilters }: SlotFiltersProps) {
  const { warehouses, filters, setFilters } = useSlots();
  const [localFilters, setLocalFilters] = useState<SlotFiltersType>(filters);
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleWarehouseChange = (selectedWarehouses: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      warehouseIds: selectedWarehouses
    }));
  };

  const handleTypeChange = (selectedTypes: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      types: selectedTypes as SlotType[]
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    const emptyFilters: SlotFiltersType = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
    onApplyFilters();
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      p={5} 
      bg={bgColor} 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Фильтры</Heading>
        
        <FormControl>
          <FormLabel>Склады</FormLabel>
          <CheckboxGroup 
            colorScheme="blue" 
            value={localFilters.warehouseIds || []}
            onChange={handleWarehouseChange}
          >
            <Stack spacing={2}>
              {warehouses.map((warehouse: Warehouse) => (
                <Checkbox key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </FormControl>
        
        <FormControl>
          <FormLabel>Тип поставки</FormLabel>
          <CheckboxGroup 
            colorScheme="blue" 
            value={localFilters.types || []}
            onChange={handleTypeChange}
          >
            <Stack spacing={2}>
              <Checkbox value={SlotType.CROSSDOCKING}>Кроссдокинг</Checkbox>
              <Checkbox value={SlotType.DIRECT}>Прямая поставка</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>
        
        <FormControl>
          <FormLabel>Период</FormLabel>
          <Stack spacing={2}>
            <Flex gap={2} direction={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel fontSize="sm">С</FormLabel>
                <Input 
                  type="date" 
                  value={localFilters.startDate || ''} 
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">По</FormLabel>
                <Input 
                  type="date" 
                  value={localFilters.endDate || ''} 
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </FormControl>
            </Flex>
          </Stack>
        </FormControl>
        
        <Flex gap={2} mt={2}>
          <Button 
            colorScheme="blue" 
            onClick={handleApplyFilters}
            flexGrow={1}
          >
            Применить
          </Button>
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
          >
            Сбросить
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
