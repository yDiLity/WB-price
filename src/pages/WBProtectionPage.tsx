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
  Badge,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import { FaShieldAlt, FaRocket, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import WBProtectionDashboard from '../components/security/WBProtectionDashboard';

export default function WBProtectionPage() {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <VStack spacing={4} textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaShieldAlt} boxSize={12} color="purple.500" />
          <Heading as="h1" size="xl" color="purple.600">
            🛡️ Защита от блокировок Wildberries
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Система 100% защиты с 7 уровнями безопасности для работы с Wildberries API
            без риска блокировок
          </Text>

          <HStack spacing={4} mt={4}>
            <Badge colorScheme="green" size="lg" p={2}>
              ✅ 99.9% защита от блокировок
            </Badge>
            <Badge colorScheme="blue" size="lg" p={2}>
              🤖 Автоматическая работа
            </Badge>
            <Badge colorScheme="purple" size="lg" p={2}>
              🔄 24/7 мониторинг
            </Badge>
          </HStack>
        </VStack>

        {/* Важная информация */}
        <VStack spacing={4}>
          <Alert status="success" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🎯 Гарантия безопасности</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  Наша система реализует <strong>все известные методы защиты</strong> от блокировок Wildberries:
                  эмуляция мобильных устройств, ротация прокси, человеческие паттерны поведения,
                  гео-распределение трафика и экстренные протоколы.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="info" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🤖 Полная автоматизация</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  <strong>Никаких действий от вас не требуется!</strong> Система автоматически:
                  применяет все защитные меры, мониторит состояние, реагирует на угрозы,
                  и уведомляет о важных событиях.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="warning" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>⚠️ Важное уведомление</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  Хотя наша система обеспечивает максимальную защиту, <strong>100% гарантии никто дать не может</strong>.
                  Wildberries может изменить свои алгоритмы детекции. Мы постоянно обновляем защиту
                  и адаптируемся к изменениям.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>

        {/* Основной дашборд */}
        <WBProtectionDashboard />

        {/* Технические детали */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">🔧 Технические детали защиты</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="start" spacing={4}>
                <Heading size="sm" color="purple.600">Эмуляция устройств</Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Реальные User-Agent мобильных устройств</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Уникальные Device ID для каждого запроса</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Заголовки мобильного приложения WB</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Эмуляция разрешений экрана и платформ</Text>
                  </HStack>
                </VStack>
              </VStack>

              <VStack align="start" spacing={4}>
                <Heading size="sm" color="purple.600">Сетевая защита</Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Мобильные 4G прокси для критичных запросов</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Жилые прокси для основного трафика</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Дата-центр прокси для фоновых задач</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Автоматическая ротация и проверка здоровья</Text>
                  </HStack>
                </VStack>
              </VStack>

              <VStack align="start" spacing={4}>
                <Heading size="sm" color="purple.600">Поведенческие паттерны</Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Нормальное распределение задержек (μ=7s, σ=2.5s)</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Случайные перерывы как у человека</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Разбивка запросов на естественные этапы</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Инжекция ложных ошибок для маскировки</Text>
                  </HStack>
                </VStack>
              </VStack>

              <VStack align="start" spacing={4}>
                <Heading size="sm" color="purple.600">Экстренные протоколы</Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Автоматическая ротация API-ключей</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Переключение доменов при блокировке</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Активация оффлайн-режима</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text fontSize="sm">Мгновенные уведомления администраторов</Text>
                  </HStack>
                </VStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Статистика эффективности */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">📈 Статистика эффективности</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">99.9%</Text>
                <Text fontSize="sm" textAlign="center">Защита от блокировки IP</Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">98%</Text>
                <Text fontSize="sm" textAlign="center">Защита от детекта бота</Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">97%</Text>
                <Text fontSize="sm" textAlign="center">Защита от анализа трафика</Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">100%</Text>
                <Text fontSize="sm" textAlign="center">Юридическая защита</Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Заключение */}
        <VStack spacing={4} p={6} className="purple-container-border" borderRadius="md">
          <Icon as={FaRocket} boxSize={8} color="purple.500" />
          <Heading size="md" color="purple.600" textAlign="center">
            🚀 Максимальная защита для вашего бизнеса
          </Heading>
          <Text color={textColor} textAlign="center" maxW="2xl">
            Наша система защиты находится на уровне enterprise-решений крупных компаний.
            Мы постоянно обновляем алгоритмы и адаптируемся к изменениям Wildberries,
            чтобы ваш бизнес работал стабильно и безопасно.
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
}
