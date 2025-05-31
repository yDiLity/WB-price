import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link
} from '@chakra-ui/react';
import { FaLock, FaExternalLinkAlt } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import SecuritySettings from '../components/security/SecuritySettings';

export default function SecuritySettingsPage() {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <VStack spacing={4} textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaLock} boxSize={12} color="purple.500" />
          <Heading as="h1" size="xl" color="purple.600">
            🛡️ Настройки безопасности
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Настройте параметры безопасности для защиты от блокировок Wildberries API.
            Все настройки применяются в реальном времени.
          </Text>

          <HStack spacing={4} mt={4}>
            <Button
              as={RouterLink}
              to="/security-guide"
              leftIcon={<Icon as={FaExternalLinkAlt} />}
              colorScheme="purple"
              variant="outline"
              size="sm"
              className="purple-button-border"
            >
              📋 Полный чек-лист безопасности
            </Button>
          </HStack>
        </VStack>

        {/* Предупреждение */}
        <Alert status="warning" className="purple-alert-border">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>⚠️ Важно для безопасности!</AlertTitle>
            <AlertDescription>
              <Text fontSize="sm">
                • Используйте только качественные резидентные прокси<br/>
                • Не превышайте лимиты API (100 запросов/минуту)<br/>
                • Настройте Telegram уведомления для мониторинга блокировок<br/>
                • Регулярно проверяйте логи на предмет подозрительной активности
              </Text>
            </AlertDescription>
          </VStack>
        </Alert>

        {/* Компонент настроек */}
        <SecuritySettings />

        {/* Дополнительная информация */}
        <Alert status="info" className="purple-alert-border">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>💡 Рекомендации</AlertTitle>
            <AlertDescription>
              <Text fontSize="sm">
                • <strong>Прокси:</strong> Используйте 5-10 качественных прокси для ротации<br/>
                • <strong>Задержки:</strong> Минимум 5-15 секунд между запросами<br/>
                • <strong>Кеширование:</strong> Включите для снижения нагрузки на API<br/>
                • <strong>Мониторинг:</strong> Настройте Telegram бота для получения алертов<br/>
                • <strong>Резерв:</strong> Подготовьте альтернативные источники данных
              </Text>
            </AlertDescription>
          </VStack>
        </Alert>

        {/* Ссылки на документацию */}
        <VStack spacing={4} p={6} className="purple-container-border" borderRadius="md">
          <Heading size="md" color="purple.600">📚 Полезные ресурсы</Heading>
          <VStack spacing={2} align="stretch">
            <Link
              href="https://suppliers-api.wildberries.ru/swagger/"
              isExternal
              color="blue.500"
              fontSize="sm"
              className="purple-border"
              p={2}
              borderRadius="md"
              _hover={{ bg: 'blue.50' }}
            >
              📖 Документация Wildberries API <Icon as={FaExternalLinkAlt} ml={1} />
            </Link>

            <Link
              href="https://dev.wildberries.ru/"
              isExternal
              color="blue.500"
              fontSize="sm"
              className="purple-border"
              p={2}
              borderRadius="md"
              _hover={{ bg: 'blue.50' }}
            >
              🔧 Портал разработчиков WB <Icon as={FaExternalLinkAlt} ml={1} />
            </Link>

            <Link
              as={RouterLink}
              to="/security-guide"
              color="purple.500"
              fontSize="sm"
              className="purple-border"
              p={2}
              borderRadius="md"
              _hover={{ bg: 'purple.50' }}
            >
              🛡️ Полный чек-лист безопасности (12 правил)
            </Link>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  );
}
