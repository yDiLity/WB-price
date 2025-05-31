import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon } from '@chakra-ui/icons';
import { SuspiciousActivityAlert as AlertType, SuspiciousActivityType } from '../types';
import { useProducts } from '../context/ProductContext';

interface SuspiciousActivityAlertProps {
  alert: AlertType;
}

export default function SuspiciousActivityAlert({ alert }: SuspiciousActivityAlertProps) {
  const { resolveSuspiciousActivity } = useProducts();
  
  // Получаем цвет и название для типа алерта
  const getAlertTypeInfo = (type: SuspiciousActivityType) => {
    switch (type) {
      case SuspiciousActivityType.FAKE_REVIEWS:
        return { color: 'orange', name: 'Фейковые отзывы' };
      case SuspiciousActivityType.FAKE_SHOP:
        return { color: 'red', name: 'Фейковый магазин' };
      case SuspiciousActivityType.DUMPING:
        return { color: 'purple', name: 'Демпинг' };
      default:
        return { color: 'gray', name: 'Неизвестно' };
    }
  };
  
  const alertTypeInfo = getAlertTypeInfo(alert.type);
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Обработчик разрешения алерта
  const handleResolve = async () => {
    await resolveSuspiciousActivity(alert.id);
  };
  
  // Цвета для компонента
  const bgColor = useColorModeValue(
    alert.isResolved ? 'gray.50' : 'white', 
    alert.isResolved ? 'gray.700' : 'gray.600'
  );
  const borderColor = useColorModeValue(
    alert.isResolved ? 'gray.200' : `${alertTypeInfo.color}.200`,
    alert.isResolved ? 'gray.600' : `${alertTypeInfo.color}.500`
  );
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
      opacity={alert.isResolved ? 0.7 : 1}
      transition="all 0.2s"
      position="relative"
      _hover={{ boxShadow: alert.isResolved ? 'none' : 'sm' }}
    >
      {alert.isResolved && (
        <Badge 
          position="absolute" 
          top={2} 
          right={2} 
          colorScheme="green"
          fontSize="xs"
        >
          Разрешено
        </Badge>
      )}
      
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Box>
          <Flex align="center" mb={1}>
            <Badge colorScheme={alertTypeInfo.color} mr={2}>
              {alertTypeInfo.name}
            </Badge>
            <Text fontSize="sm" color="gray.500">
              {formatDate(alert.date)}
            </Text>
          </Flex>
          <Text fontWeight="bold" mb={1}>
            {alert.competitorName}
          </Text>
        </Box>
        
        {!alert.isResolved && (
          <Tooltip label="Отметить как разрешенное">
            <IconButton
              icon={<CheckIcon />}
              aria-label="Разрешить"
              size="sm"
              colorScheme="green"
              variant="outline"
              onClick={handleResolve}
            />
          </Tooltip>
        )}
      </Flex>
      
      <Text mb={3}>{alert.description}</Text>
      
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <InfoIcon color="blue.500" mr={1} />
          <Text fontSize="sm" color="blue.500">
            {alert.recommendedAction}
          </Text>
        </Flex>
        
        {!alert.isResolved && (
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            as="a"
            href={`/products/${alert.productId}`}
          >
            Перейти к товару
          </Button>
        )}
      </Flex>
    </Box>
  );
}
