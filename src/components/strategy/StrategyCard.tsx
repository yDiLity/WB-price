import { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useColorModeValue,
  Tooltip,
  HStack,
  VStack,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  EditIcon, 
  DeleteIcon, 
  CopyIcon, 
  SettingsIcon,
  InfoIcon,
  TimeIcon
} from '@chakra-ui/icons';
import { PricingStrategy, StrategyStatus, StrategyType } from '../../types/strategy';

// Иконки для разных типов стратегий
const strategyTypeIcons = {
  [StrategyType.COMPETITOR_BASED]: '👥',
  [StrategyType.MARGIN_BASED]: '💰',
  [StrategyType.MARKET_POSITION]: '📊',
  [StrategyType.TIME_BASED]: '⏱️',
  [StrategyType.STOCK_BASED]: '📦',
  [StrategyType.CUSTOM]: '⚙️'
};

// Названия типов стратегий на русском
const strategyTypeNames = {
  [StrategyType.COMPETITOR_BASED]: 'На основе конкурентов',
  [StrategyType.MARGIN_BASED]: 'На основе маржи',
  [StrategyType.MARKET_POSITION]: 'Позиция на рынке',
  [StrategyType.TIME_BASED]: 'По времени',
  [StrategyType.STOCK_BASED]: 'По остаткам',
  [StrategyType.CUSTOM]: 'Пользовательская'
};

// Статусы стратегий на русском
const strategyStatusNames = {
  [StrategyStatus.ACTIVE]: 'Активна',
  [StrategyStatus.PAUSED]: 'Приостановлена',
  [StrategyStatus.DRAFT]: 'Черновик'
};

// Цвета для статусов
const strategyStatusColors = {
  [StrategyStatus.ACTIVE]: 'green',
  [StrategyStatus.PAUSED]: 'orange',
  [StrategyStatus.DRAFT]: 'gray'
};

interface StrategyCardProps {
  strategy: PricingStrategy;
  onEdit: (strategy: PricingStrategy) => void;
  onDelete: (strategyId: string) => void;
  onDuplicate: (strategy: PricingStrategy) => void;
  onToggleStatus: (strategyId: string, newStatus: StrategyStatus) => void;
}

export default function StrategyCard({
  strategy,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus
}: StrategyCardProps) {
  const { isOpen, onToggle } = useDisclosure();
  
  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Обработчик изменения статуса
  const handleToggleStatus = () => {
    let newStatus: StrategyStatus;
    
    switch (strategy.status) {
      case StrategyStatus.ACTIVE:
        newStatus = StrategyStatus.PAUSED;
        break;
      case StrategyStatus.PAUSED:
        newStatus = StrategyStatus.ACTIVE;
        break;
      case StrategyStatus.DRAFT:
        newStatus = StrategyStatus.ACTIVE;
        break;
      default:
        newStatus = StrategyStatus.ACTIVE;
    }
    
    onToggleStatus(strategy.id, newStatus);
  };
  
  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={2}>
          <HStack spacing={2}>
            <Text fontSize="xl">{strategyTypeIcons[strategy.type]}</Text>
            <Heading size="md" noOfLines={1}>{strategy.name}</Heading>
          </HStack>
          
          <HStack spacing={2}>
            <Badge colorScheme={strategyStatusColors[strategy.status]} px={2} py={1} borderRadius="full">
              {strategyStatusNames[strategy.status]}
            </Badge>
            
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                aria-label="Действия"
              />
              <MenuList>
                <MenuItem icon={<EditIcon />} onClick={() => onEdit(strategy)}>
                  Редактировать
                </MenuItem>
                <MenuItem icon={<CopyIcon />} onClick={() => onDuplicate(strategy)}>
                  Дублировать
                </MenuItem>
                <Divider />
                <MenuItem 
                  icon={strategy.status === StrategyStatus.ACTIVE ? <TimeIcon /> : <InfoIcon />}
                  onClick={handleToggleStatus}
                >
                  {strategy.status === StrategyStatus.ACTIVE 
                    ? 'Приостановить' 
                    : strategy.status === StrategyStatus.PAUSED 
                      ? 'Активировать' 
                      : 'Запустить'}
                </MenuItem>
                <Divider />
                <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => onDelete(strategy.id)}>
                  Удалить
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Text fontSize="sm" color={textColor} noOfLines={2} mb={3}>
          {strategy.description}
        </Text>
        
        <HStack spacing={4} mb={2}>
          <Tooltip label="Тип стратегии">
            <Badge variant="outline" px={2} py={1} borderRadius="full">
              {strategyTypeNames[strategy.type]}
            </Badge>
          </Tooltip>
          
          <Tooltip label="Количество правил">
            <Badge variant="outline" px={2} py={1} borderRadius="full">
              {strategy.rules.length} {strategy.rules.length === 1 ? 'правило' : 
               strategy.rules.length > 1 && strategy.rules.length < 5 ? 'правила' : 'правил'}
            </Badge>
          </Tooltip>
          
          <Tooltip label="Количество товаров">
            <Badge variant="outline" px={2} py={1} borderRadius="full">
              {strategy.appliedToProducts.length} {strategy.appliedToProducts.length === 1 ? 'товар' : 
               strategy.appliedToProducts.length > 1 && strategy.appliedToProducts.length < 5 ? 'товара' : 'товаров'}
            </Badge>
          </Tooltip>
        </HStack>
        
        <Flex justify="space-between" fontSize="xs" color={textColor}>
          <Text>Создано: {formatDate(strategy.createdAt)}</Text>
          {strategy.lastRunAt && (
            <Text>Последний запуск: {formatDate(strategy.lastRunAt)}</Text>
          )}
        </Flex>
        
        <Button
          size="sm"
          variant="ghost"
          width="100%"
          mt={2}
          rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={onToggle}
        >
          {isOpen ? 'Скрыть правила' : 'Показать правила'}
        </Button>
      </Box>
      
      <Collapse in={isOpen} animateOpacity>
        <Box 
          p={4} 
          borderTopWidth="1px" 
          borderColor={borderColor}
          bg={useColorModeValue('gray.50', 'gray.800')}
        >
          <Heading size="sm" mb={3}>Правила стратегии</Heading>
          
          <VStack spacing={2} align="stretch">
            {strategy.rules.map((rule, index) => (
              <Flex
                key={index}
                p={3}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                bg={cardBg}
                alignItems="center"
                justifyContent="space-between"
              >
                <Text fontSize="sm">{rule.description}</Text>
                <Badge colorScheme="blue">Приоритет: {rule.priority}</Badge>
              </Flex>
            ))}
          </VStack>
          
          <Flex justify="flex-end" mt={4}>
            <Button size="sm" colorScheme="blue" onClick={() => onEdit(strategy)}>
              Редактировать правила
            </Button>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
}
