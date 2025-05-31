import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  useDisclosure,
  Fade,
  HStack,
  VStack,
  Badge,
  Text
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function SecurityNotification() {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Показываем уведомление через 3 секунды после загрузки
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    // Автоматически скрываем через 10 секунд
    const autoHideTimer = setTimeout(() => {
      onClose();
    }, 13000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, [onClose]);

  if (!showNotification || !isOpen) return null;

  return (
    <Fade in={isOpen}>
      <Box
        position="fixed"
        bottom={4}
        right={4}
        zIndex={9999}
        maxW="400px"
      >
        <Alert
          status="success"
          variant="subtle"
          borderRadius="md"
          boxShadow="lg"
          className="purple-alert-border"
          pr={8}
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm" mb={1}>
              🛡️ Защита активирована!
            </AlertTitle>
            <AlertDescription fontSize="xs">
              <VStack align="start" spacing={1}>
                <Text>
                  Все API запросы к Wildberries теперь защищены автоматически
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="green" size="xs">Прокси ротация</Badge>
                  <Badge colorScheme="blue" size="xs">User-Agent</Badge>
                  <Badge colorScheme="purple" size="xs">Задержки</Badge>
                  <Badge colorScheme="orange" size="xs">Кеширование</Badge>
                </HStack>
                <Text color="gray.600" fontSize="xs">
                  Никаких дополнительных действий не требуется
                </Text>
              </VStack>
            </AlertDescription>
          </Box>
          <CloseButton
            position="absolute"
            right={2}
            top={2}
            onClick={onClose}
            size="sm"
          />
        </Alert>
      </Box>
    </Fade>
  );
}

// Компонент для отображения в дашборде
export function SecurityDashboardWidget() {
  return (
    <Alert
      status="info"
      variant="left-accent"
      borderRadius="md"
      className="purple-alert-border"
    >
      <AlertIcon />
      <Box>
        <AlertTitle fontSize="sm">
          🛡️ Автоматическая защита от блокировок
        </AlertTitle>
        <AlertDescription fontSize="xs">
          <VStack align="start" spacing={1}>
            <Text>
              Система автоматически применяет все меры безопасности:
            </Text>
            <Text>
              • Ротация прокси и User-Agent<br/>
              • Интеллектуальные задержки между запросами<br/>
              • Кеширование для снижения нагрузки<br/>
              • Мониторинг блокировок в реальном времени
            </Text>
            <Badge colorScheme="green" size="sm" mt={1}>
              ✅ Все настроено автоматически
            </Badge>
          </VStack>
        </AlertDescription>
      </Box>
    </Alert>
  );
}
