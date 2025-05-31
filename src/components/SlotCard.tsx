import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { Slot, SlotType } from '../types';
import { useSlots } from '../context/SlotContext';
import { useAuth } from '../context/AuthContext';

interface SlotCardProps {
  slot: Slot;
}

export default function SlotCard({ slot }: SlotCardProps) {
  const { bookSlot } = useSlots();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const handleBookSlot = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в систему для бронирования слота',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const success = await bookSlot(slot.id);
      if (success) {
        toast({
          title: 'Слот забронирован',
          description: `Вы успешно забронировали слот на ${formatDate(slot.date)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка бронирования',
        description: 'Не удалось забронировать слот. Пожалуйста, попробуйте позже.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const slotTypeBg = slot.type === SlotType.CROSSDOCKING ? 'purple.100' : 'green.100';
  const slotTypeColor = slot.type === SlotType.CROSSDOCKING ? 'purple.700' : 'green.700';

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <Flex direction="column" height="100%">
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm">{slot.warehouseName}</Heading>
          <Badge 
            px={2} 
            py={1} 
            borderRadius="full" 
            bg={slotTypeBg} 
            color={slotTypeColor}
          >
            {slot.type === SlotType.CROSSDOCKING ? 'Кроссдокинг' : 'Прямая поставка'}
          </Badge>
        </Flex>
        
        <Text fontWeight="medium" mb={1}>
          {formatDate(slot.date)}
        </Text>
        
        <Text mb={3}>
          Время: {slot.startTime} - {slot.endTime}
        </Text>
        
        <Box mt="auto">
          {slot.available ? (
            <Button
              colorScheme="blue"
              size="sm"
              width="full"
              onClick={handleBookSlot}
            >
              Забронировать
            </Button>
          ) : (
            <Tooltip label="Этот слот уже занят">
              <Button
                colorScheme="gray"
                size="sm"
                width="full"
                isDisabled
              >
                Недоступен
              </Button>
            </Tooltip>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
