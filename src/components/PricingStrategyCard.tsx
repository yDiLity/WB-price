import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Switch,
  Divider,
  Collapse,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, SettingsIcon } from '@chakra-ui/icons';
import { PricingStrategy, PricingStrategyType } from '../types';

interface PricingStrategyCardProps {
  strategy: PricingStrategy;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onApply: (id: string) => void;
}

export default function PricingStrategyCard({
  strategy,
  onToggleActive,
  onEdit,
  onDelete,
  onApply
}: PricingStrategyCardProps) {
  const { isOpen, onToggle } = useDisclosure();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Получаем цвет и название для типа стратегии
  const getStrategyTypeInfo = (type: PricingStrategyType) => {
    switch (type) {
      case PricingStrategyType.AGGRESSIVE:
        return { color: 'red', name: 'Агрессивная' };
      case PricingStrategyType.PREMIUM:
        return { color: 'purple', name: 'Премиум' };
      case PricingStrategyType.STOCK_CLEARANCE:
        return { color: 'orange', name: 'Очистка склада' };
      case PricingStrategyType.CUSTOM:
        return { color: 'blue', name: 'Кастомная' };
      default:
        return { color: 'gray', name: 'Неизвестно' };
    }
  };
  
  const strategyTypeInfo = getStrategyTypeInfo(strategy.type);
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Обработчик переключения активности стратегии
  const handleToggleActive = async () => {
    setIsUpdating(true);
    try {
      await onToggleActive(strategy.id, !strategy.isActive);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Цвета для компонента
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const ruleBgColor = useColorModeValue('gray.50', 'gray.800');
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
      opacity={strategy.isActive ? 1 : 0.7}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="lg" fontWeight="bold">
            {strategy.name}
          </Text>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<SettingsIcon />}
              variant="ghost"
              size="sm"
              aria-label="Действия"
            />
            <MenuList>
              <MenuItem onClick={() => onEdit(strategy.id)}>Редактировать</MenuItem>
              <MenuItem onClick={() => onApply(strategy.id)}>Применить к товарам</MenuItem>
              <MenuItem onClick={() => onDelete(strategy.id)} color="red.500">Удалить</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        
        <Flex mb={3}>
          <Badge colorScheme={strategyTypeInfo.color} mr={2}>
            {strategyTypeInfo.name}
          </Badge>
          <Text fontSize="sm" color="gray.500">
            Обновлено: {formatDate(strategy.updatedAt)}
          </Text>
        </Flex>
        
        <Flex justify="space-between" align="center" mb={3}>
          <Flex align="center">
            <Text mr={2}>Активна</Text>
            <Switch
              isChecked={strategy.isActive}
              onChange={handleToggleActive}
              colorScheme="blue"
              isDisabled={isUpdating}
            />
          </Flex>
          
          <Button
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onToggle}
            variant="outline"
            size="sm"
          >
            {isOpen ? 'Скрыть правила' : 'Показать правила'}
          </Button>
        </Flex>
        
        <Collapse in={isOpen} animateOpacity>
          <Divider mb={3} />
          <Text fontWeight="medium" mb={2}>Правила ({strategy.rules.length})</Text>
          
          {strategy.rules.map((rule, index) => (
            <Box
              key={rule.id}
              p={3}
              mb={2}
              borderRadius="md"
              bg={ruleBgColor}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex justify="space-between" mb={1}>
                <Badge>Приоритет: {rule.priority}</Badge>
                <Text fontSize="sm" color="gray.500">#{index + 1}</Text>
              </Flex>
              <Text fontWeight="medium" mb={1}>Условие:</Text>
              <Box
                p={2}
                borderRadius="md"
                bg={useColorModeValue('gray.100', 'gray.700')}
                fontFamily="monospace"
                fontSize="sm"
                mb={2}
              >
                {rule.condition}
              </Box>
              <Text fontWeight="medium" mb={1}>Действие:</Text>
              <Box
                p={2}
                borderRadius="md"
                bg={useColorModeValue('gray.100', 'gray.700')}
                fontFamily="monospace"
                fontSize="sm"
              >
                {rule.action}
              </Box>
            </Box>
          ))}
          
          {strategy.rules.length === 0 && (
            <Text fontSize="sm" color="gray.500">
              Нет правил для этой стратегии
            </Text>
          )}
        </Collapse>
      </Box>
      
      <Divider />
      
      <Flex p={4} justify="space-between" align="center">
        <Text fontSize="sm" color="gray.500">
          Создано: {formatDate(strategy.createdAt)}
        </Text>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={() => onApply(strategy.id)}
          isDisabled={!strategy.isActive}
        >
          Применить
        </Button>
      </Flex>
    </Box>
  );
}
