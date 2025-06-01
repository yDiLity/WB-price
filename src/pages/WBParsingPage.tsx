import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react';
import { FaSpider, FaShieldAlt, FaRocket, FaChartLine } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import WBParsingTest from '../components/parsing/WBParsingTest';
import SystemTestPanel from '../components/testing/SystemTestPanel';
import { wbParsingService } from '../services/wbParsingService';

export default function WBParsingPage() {
  const [parsingStats, setParsingStats] = useState<any>(null);
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    // Загружаем статистику парсинга
    const loadStats = () => {
      const stats = wbParsingService.getParsingStats();
      setParsingStats(stats);
    };

    loadStats();
    const interval = setInterval(loadStats, 10000); // Обновляем каждые 10 секунд

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <VStack spacing={4} textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaSpider} boxSize={12} color="purple.500" />
          <Heading as="h1" size="xl" color="purple.600">
            🕷️ Парсинг Wildberries
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Система безопасного парсинга данных с Wildberries с защитой от блокировок
            и автоматическим извлечением информации о товарах и конкурентах
          </Text>

          <HStack spacing={4} mt={4}>
            <Badge colorScheme="green" size="lg" p={2}>
              ✅ Защита от блокировок
            </Badge>
            <Badge colorScheme="blue" size="lg" p={2}>
              🕷️ Real-time парсинг
            </Badge>
            <Badge colorScheme="purple" size="lg" p={2}>
              📊 Автоматический анализ
            </Badge>
          </HStack>
        </VStack>

        {/* Статистика парсинга */}
        {parsingStats && (
          <Card className="purple-card-border" bg={cardBg}>
            <CardHeader>
              <Heading size="md">📊 Статистика парсинга</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Stat className="purple-stat-border" p={4} borderRadius="md">
                  <StatLabel>Всего запросов</StatLabel>
                  <StatNumber color="blue.500">{parsingStats.totalRequests}</StatNumber>
                  <StatHelpText>с начала сессии</StatHelpText>
                </Stat>

                <Stat className="purple-stat-border" p={4} borderRadius="md">
                  <StatLabel>Запросов в минуту</StatLabel>
                  <StatNumber color="green.500">
                    {parsingStats.requestsPerMinute.toFixed(1)}
                  </StatNumber>
                  <StatHelpText>текущая скорость</StatHelpText>
                </Stat>

                <Stat className="purple-stat-border" p={4} borderRadius="md">
                  <StatLabel>Последний запрос</StatLabel>
                  <StatNumber color="purple.500">
                    {parsingStats.lastRequestTime
                      ? new Date(parsingStats.lastRequestTime).toLocaleTimeString()
                      : 'Нет данных'
                    }
                  </StatNumber>
                  <StatHelpText>время</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Важная информация */}
        <VStack spacing={4}>
          <Alert status="success" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🎯 Что умеет наш парсер</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  • <strong>Поиск товаров</strong> по любым запросам с фильтрацией<br/>
                  • <strong>Извлечение данных</strong>: цены, рейтинги, отзывы, продавцы<br/>
                  • <strong>Мониторинг конкурентов</strong> в реальном времени<br/>
                  • <strong>Автоматическая защита</strong> от всех видов блокировок
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="info" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>🛡️ Система защиты</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  Парсер использует <strong>7-уровневую защиту</strong>: эмуляция мобильных устройств,
                  ротация прокси, человеческие паттерны, деконструкция API, анти-отладка,
                  гео-распределение и экстренные протоколы при блокировках.
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>

          <Alert status="warning" className="purple-alert-border">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertTitle>⚠️ Ограничения и рекомендации</AlertTitle>
              <AlertDescription>
                <Text fontSize="sm">
                  • <strong>Не злоупотребляйте</strong> - система автоматически ограничивает частоту запросов<br/>
                  • <strong>Соблюдайте ToS</strong> - используйте данные только для анализа конкурентов<br/>
                  • <strong>Мониторьте статистику</strong> - следите за успешностью запросов<br/>
                  • <strong>Сообщайте о проблемах</strong> - система адаптируется к изменениям WB
                </Text>
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>

        {/* Основной контент */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList className="purple-tab-border">
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaSpider} />
                <Text>Тестирование парсинга</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaChartLine} />
                <Text>Мониторинг конкурентов</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FaShieldAlt} />
                <Text>Настройки защиты</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Тестирование парсинга */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={8} align="stretch">
                {/* Панель тестирования системы */}
                <SystemTestPanel />

                <Divider />

                {/* Детальное тестирование парсинга */}
                <WBParsingTest />
              </VStack>
            </TabPanel>

            {/* Мониторинг конкурентов */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="info" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      <strong>🚧 В разработке:</strong> Модуль автоматического мониторинга конкурентов.
                      Будет включать: настройку автоматических проверок цен, уведомления об изменениях,
                      анализ трендов и автоматические отчеты.
                    </Text>
                  </AlertDescription>
                </Alert>

                <Box className="purple-container-border" p={6} borderRadius="md">
                  <VStack spacing={4}>
                    <Icon as={FaChartLine} boxSize={16} color="gray.400" />
                    <Heading size="md" color="gray.500">
                      Автоматический мониторинг
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Здесь будет настройка автоматического мониторинга цен конкурентов,
                      уведомления об изменениях и аналитика трендов
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>

            {/* Настройки защиты */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Alert status="success" className="purple-alert-border">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      <strong>🛡️ Автоматическая защита:</strong> Все настройки защиты применяются
                      автоматически. Система самостоятельно адаптируется к изменениям и обеспечивает
                      максимальную безопасность парсинга.
                    </Text>
                  </AlertDescription>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card className="purple-card-border" bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">⏱️ Интервалы запросов</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Минимальная задержка:</Text>
                          <Badge colorScheme="green">5 секунд</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Длинная пауза:</Text>
                          <Badge colorScheme="blue">каждые 100 запросов</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Человеческие паттерны:</Text>
                          <Badge colorScheme="purple">активны</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card className="purple-card-border" bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">🛡️ Уровни защиты</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Эмуляция устройств:</Text>
                          <Badge colorScheme="green">✅ Активна</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Ротация прокси:</Text>
                          <Badge colorScheme="green">✅ Активна</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Анти-отладка:</Text>
                          <Badge colorScheme="green">✅ Активна</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Технические детали */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="md">🔧 Технические возможности</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <VStack align="start" spacing={3}>
                <Heading size="sm" color="purple.600">Извлекаемые данные</Heading>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>• Название товара</Text>
                  <Text>• Цена и старая цена</Text>
                  <Text>• Рейтинг и количество отзывов</Text>
                  <Text>• Информация о продавце</Text>
                  <Text>• Категория и бренд</Text>
                  <Text>• Изображения товара</Text>
                  <Text>• Наличие на складе</Text>
                  <Text>• Позиция в поиске</Text>
                </VStack>
              </VStack>

              <VStack align="start" spacing={3}>
                <Heading size="sm" color="purple.600">Возможности поиска</Heading>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>• Поиск по ключевым словам</Text>
                  <Text>• Фильтрация по категориям</Text>
                  <Text>• Диапазон цен</Text>
                  <Text>• Сортировка результатов</Text>
                  <Text>• Пагинация страниц</Text>
                  <Text>• Ограничение количества</Text>
                  <Text>• Поиск конкурентов</Text>
                  <Text>• Детальная информация</Text>
                </VStack>
              </VStack>

              <VStack align="start" spacing={3}>
                <Heading size="sm" color="purple.600">Защита и безопасность</Heading>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>• Эмуляция мобильных устройств</Text>
                  <Text>• Ротация User-Agent</Text>
                  <Text>• Прокси-серверы</Text>
                  <Text>• Человеческие задержки</Text>
                  <Text>• Деконструкция запросов</Text>
                  <Text>• Анти-отладочная защита</Text>
                  <Text>• Гео-распределение</Text>
                  <Text>• Экстренные протоколы</Text>
                </VStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
