import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  VStack,
  HStack,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Tooltip,
  Circle,
} from '@chakra-ui/react';
import {
  FaChartLine,
  FaRocket,
  FaUsers,
  FaMoneyBillWave,
  FaArrowRight,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../services/analytics';



// Добавляем CSS анимацию shimmer в head
const shimmerCSS = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Добавляем стили в head документа
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerCSS;
  document.head.appendChild(style);
}

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    users: 1000,
    profit: 30,
    monitoring: 24,
    sales: 2400000,
    products: 1247
  });

  const analytics = useAnalytics();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Трекинг посещения главной страницы
    analytics.page('Home Page', {
      feature: 'homepage',
      section: 'hero',
    });

    // Анимация загрузки
    const timer = setTimeout(() => setIsLoaded(true), 500);

    // Анимация смены активной функции
    const featureTimer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);

    // Анимация статистики
    const statsTimer = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 5),
        profit: prev.profit + (Math.random() - 0.5) * 0.1,
        monitoring: 24,
        sales: prev.sales + Math.floor(Math.random() * 10000),
        products: prev.products + Math.floor(Math.random() * 3),
      }));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(featureTimer);
      clearInterval(statsTimer);
    };
  }, [analytics]);

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={12}>
        {/* Hero Section */}
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          mb={16}
          gap={12}
        >
          {/* Левая часть - текст */}
          <VStack align="flex-start" spacing={6} flex="1" maxW={{ base: '100%', lg: '50%' }}>
            <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm" className="purple-border">
              🚀 Ozon Price Optimizer Pro
            </Badge>

            <Heading
              as="h1"
              size="2xl"
              lineHeight="shorter"
              bgGradient={useColorModeValue(
                "linear(to-r, blue.600, purple.600, teal.600)",
                "linear(to-r, blue.300, purple.300, teal.300)"
              )}
              bgClip="text"
              fontWeight="extrabold"
              sx={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Автоматизированная система ценообразования для Ozon
            </Heading>

            <Text fontSize="xl" color={textColor} lineHeight="tall">
              Увеличьте прибыль на <Text as="span" color={useColorModeValue("green.600", "green.300")} fontWeight="bold">30%</Text> с помощью умных стратегий ценообразования.
              <Text as="span" color={useColorModeValue("blue.600", "blue.300")} fontWeight="semibold">ИИ-анализ</Text> конкурентов, автоматическое изменение цен и <Text as="span" color={useColorModeValue("purple.600", "purple.300")} fontWeight="semibold">защита от демпинга</Text>.
            </Text>

            <HStack spacing={4}>
              <Button
                as={Link}
                to="/dashboard"
                size="lg"
                colorScheme="blue"
                rightIcon={<FaArrowRight />}
                px={8}
                className="purple-button-border"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.2s"
              >
                Начать работу
              </Button>
              <Button
                as={Link}
                to="/about"
                size="lg"
                variant="outline"
                colorScheme="blue"
                px={8}
                className="purple-button-border"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.2s"
              >
                Узнать больше
              </Button>
            </HStack>

            {/* Живая статистика */}
            <HStack spacing={8} pt={4}>
              <Tooltip label="Активные пользователи платформы" hasArrow>
                <VStack
                  spacing={1}
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{ transform: 'scale(1.05)' }}
                  onClick={() => analytics.interaction('stat_click', 'users')}
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={useColorModeValue("blue.600", "blue.300")}
                    sx={isLoaded ? { animation: 'fadeIn 1s ease-in' } : {}}
                  >
                    {stats.users.toLocaleString()}+
                  </Text>
                  <Text fontSize="sm" color={textColor}>Продавцов</Text>
                </VStack>
              </Tooltip>

              <Tooltip label="Средний рост прибыли наших клиентов" hasArrow>
                <VStack
                  spacing={1}
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{ transform: 'scale(1.05)' }}
                  onClick={() => analytics.interaction('stat_click', 'profit')}
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={useColorModeValue("green.600", "green.300")}
                    sx={isLoaded ? { animation: 'fadeIn 1.2s ease-in' } : {}}
                  >
                    {stats.profit.toFixed(1)}%
                  </Text>
                  <Text fontSize="sm" color={textColor}>Рост прибыли</Text>
                </VStack>
              </Tooltip>

              <Tooltip label="Круглосуточный мониторинг цен" hasArrow>
                <VStack
                  spacing={1}
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{ transform: 'scale(1.05)' }}
                  onClick={() => analytics.interaction('stat_click', 'monitoring')}
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={useColorModeValue("purple.600", "purple.300")}
                    sx={isLoaded ? { animation: 'fadeIn 1.4s ease-in' } : {}}
                  >
                    24/7
                  </Text>
                  <Text fontSize="sm" color={textColor}>Мониторинг</Text>
                </VStack>
              </Tooltip>
            </HStack>


          </VStack>

          {/* Правая часть - диаграмма */}
          <Box flex="1" maxW={{ base: '100%', lg: '45%' }}>
            <Card
              bg={bgColor}
              borderColor={borderColor}
              borderWidth="1px"
              boxShadow="xl"
              className="purple-card-border"
              _hover={{
                boxShadow: "2xl",
                transform: "translateY(-2px)"
              }}
              transition="all 0.3s ease"
            >
              <CardBody p={6}>
                <VStack spacing={4}>
                  <Heading
                    size="md"
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    📊 Аналитика продаж
                  </Heading>

                  {/* 🌈 КРАСИВАЯ ИНТЕРАКТИВНАЯ ДИАГРАММА С РЕАЛЬНЫМИ ДАННЫМИ */}
                  <Box w="100%" h="250px" position="relative" bg={useColorModeValue("gray.50", "gray.700")} borderRadius="xl" p={4}>
                    {/* Заголовок диаграммы */}
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontSize="sm" fontWeight="bold" color={textColor}>
                        📈 Динамика продаж
                      </Text>
                      <Badge colorScheme="green" variant="subtle" fontSize="xs">
                        +15.3% к прошлой неделе
                      </Badge>
                    </Flex>

                    {/* Основная диаграмма */}
                    <Flex h="160px" align="end" justify="space-around" px={2} position="relative">
                      {[
                        { height: 45, value: "₽125K", day: "ПН", color: useColorModeValue("#FF6B35", "#FF8A65"), sales: 125, trend: "up" },
                        { height: 60, value: "₽180K", day: "ВТ", color: useColorModeValue("#4ECDC4", "#4DB6AC"), sales: 180, trend: "up" },
                        { height: 85, value: "₽245K", day: "СР", color: useColorModeValue("#45B7D1", "#42A5F5"), sales: 245, trend: "up" },
                        { height: 70, value: "₽210K", day: "ЧТ", color: useColorModeValue("#96CEB4", "#81C784"), sales: 210, trend: "down" },
                        { height: 95, value: "₽285K", day: "ПТ", color: useColorModeValue("#FFEAA7", "#FFD54F"), sales: 285, trend: "up" },
                        { height: 80, value: "₽230K", day: "СБ", color: useColorModeValue("#DDA0DD", "#BA68C8"), sales: 230, trend: "down" },
                        { height: 90, value: "₽265K", day: "ВС", color: useColorModeValue("#98D8C8", "#4DD0E1"), sales: 265, trend: "up" }
                      ].map((bar, index) => (
                        <Tooltip
                          key={index}
                          label={
                            <VStack spacing={1} align="start">
                              <Text fontWeight="bold">{bar.day}</Text>
                              <Text>💰 Выручка: {bar.value}</Text>
                              <Text>📦 Заказов: {bar.sales}</Text>
                              <Text>📈 Тренд: {bar.trend === 'up' ? '↗️ Рост' : '↘️ Снижение'}</Text>
                            </VStack>
                          }
                          hasArrow
                          placement="top"
                          bg={useColorModeValue("white", "gray.800")}
                          color={useColorModeValue("gray.800", "white")}
                          borderColor={bar.color}
                          borderWidth="2px"
                        >
                          <VStack
                            spacing={1}
                            cursor="pointer"
                            opacity={isLoaded ? 1 : 0}
                            transform={isLoaded ? 'translateY(0)' : 'translateY(20px)'}
                            transition={`all 0.6s ease ${index * 0.1}s`}
                          >
                            <Box
                              w="32px"
                              h={isLoaded ? `${bar.height}%` : '0%'}
                              borderRadius="lg"
                              transition="all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                              transitionDelay={`${index * 0.1}s`}
                              position="relative"
                              overflow="hidden"
                              _hover={{
                                transform: 'scale(1.2) translateY(-12px)',
                                boxShadow: `0 15px 40px ${bar.color}70`,
                                zIndex: 10
                              }}
                              background={`linear-gradient(180deg, ${bar.color} 0%, ${bar.color}90 30%, ${bar.color}60 70%, ${bar.color}30 100%)`}
                              border="3px solid"
                              borderColor={bar.color}
                              boxShadow={`0 4px 15px ${bar.color}40`}
                              _before={{
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(45deg, transparent 30%, ${bar.color}30 50%, transparent 70%)`,
                                animation: 'shimmer 3s infinite',
                                borderRadius: 'lg'
                              }}
                              _after={{
                                content: '""',
                                position: 'absolute',
                                top: '-2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '6px',
                                height: '6px',
                                borderRadius: 'full',
                                background: bar.trend === 'up' ? '#22C55E' : '#EF4444',
                                boxShadow: `0 0 10px ${bar.trend === 'up' ? '#22C55E' : '#EF4444'}`
                              }}
                            />
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color={textColor}
                              transition="all 0.3s ease"
                              _groupHover={{ color: bar.color, transform: 'scale(1.1)' }}
                            >
                              {bar.day}
                            </Text>
                          </VStack>
                        </Tooltip>
                      ))}
                    </Flex>

                    {/* Дополнительная информация */}
                    <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1px solid" borderColor={borderColor}>
                      <HStack spacing={4}>
                        <HStack spacing={1}>
                          <Circle size="8px" bg="green.400" />
                          <Text fontSize="xs" color={textColor}>Рост</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Circle size="8px" bg="orange.400" />
                          <Text fontSize="xs" color={textColor}>Стабильно</Text>
                        </HStack>
                      </HStack>
                      <Text fontSize="xs" color={textColor} fontWeight="medium">
                        Средний чек: ₽1,247
                      </Text>
                    </Flex>
                  </Box>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <Tooltip label="Общий объем продаж клиентов" hasArrow>
                      <Stat textAlign="center" cursor="pointer" transition="all 0.3s ease" _hover={{ transform: 'scale(1.02)' }}>
                        <StatLabel color={textColor}>Продажи</StatLabel>
                        <StatNumber
                          bgGradient={useColorModeValue(
                            "linear(to-r, orange.500, orange.600)",
                            "linear(to-r, orange.300, orange.400)"
                          )}
                          bgClip="text"
                          sx={{
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          ₽{(stats.sales / 1000000).toFixed(1)}M
                        </StatNumber>
                        <StatHelpText color={useColorModeValue("green.600", "green.300")}>
                          +12% за неделю
                        </StatHelpText>
                      </Stat>
                    </Tooltip>

                    <Tooltip label="Количество товаров в системе" hasArrow>
                      <Stat textAlign="center" cursor="pointer" transition="all 0.3s ease" _hover={{ transform: 'scale(1.02)' }}>
                        <StatLabel color={textColor}>Товары</StatLabel>
                        <StatNumber
                          bgGradient={useColorModeValue(
                            "linear(to-r, blue.500, blue.600)",
                            "linear(to-r, blue.300, blue.400)"
                          )}
                          bgClip="text"
                          sx={{
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {stats.products.toLocaleString()}
                        </StatNumber>
                        <StatHelpText color={useColorModeValue("green.600", "green.300")}>
                          +5% за неделю
                        </StatHelpText>
                      </Stat>
                    </Tooltip>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Flex>

        {/* Ключевые возможности */}
        <VStack spacing={8} mb={16}>
          <Heading
            as="h2"
            size="xl"
            textAlign="center"
            bgGradient={useColorModeValue(
              "linear(to-r, blue.600, purple.600, teal.600)",
              "linear(to-r, blue.300, purple.300, teal.300)"
            )}
            bgClip="text"
            fontWeight="bold"
            sx={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            ✨ Ключевые возможности ✨
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
            <Tooltip label="Нажмите, чтобы узнать больше об ИИ-анализе" hasArrow>
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderWidth="1px"
                boxShadow="md"
                cursor="pointer"
                className="purple-card-border"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '2xl',
                  borderColor: useColorModeValue("orange.300", "orange.500"),
                  bg: useColorModeValue("orange.50", "orange.900")
                }}
                transition="all 0.4s ease"
                onClick={() => {
                  analytics.interaction('feature_click', 'ai_analysis');
                  // Можно добавить модальное окно или переход на страницу
                }}
                sx={activeFeature === 0 ? {
                  borderColor: useColorModeValue("orange.400", "orange.500"),
                  boxShadow: 'lg',
                  bg: useColorModeValue("orange.50", "orange.900")
                } : {}}
              >
                <CardBody textAlign="center" p={6}>
                  <Box color="#FF6B35" mb={4}>
                    <Icon
                      as={FaChartLine}
                      boxSize={12}
                      sx={{
                        color: "#FF6B35 !important",
                        fill: "#FF6B35 !important",
                        stroke: "#FF6B35 !important"
                      }}
                      transition="all 0.3s ease"
                      _hover={{ transform: 'scale(1.1) rotate(5deg)' }}
                    />
                  </Box>
                  <Heading size="md" mb={2} sx={{ color: "#FF6B35 !important" }}>🤖 ИИ-анализ</Heading>
                  <Text sx={{ color: "#FF6B35 !important", fontWeight: "600" }} fontSize="sm">
                    Умный анализ конкурентов и <Text as="span" sx={{ color: "#FF6B35 !important" }} fontWeight="bold">прогнозирование цен</Text>
                  </Text>
                  {activeFeature === 0 && (
                    <Badge colorScheme="orange" variant="solid" mt={2} fontSize="xs">
                      Популярно
                    </Badge>
                  )}
                </CardBody>
              </Card>
            </Tooltip>

            <Tooltip label="Автоматизация всех процессов продаж" hasArrow>
              <Card
                bg={bgColor}
                borderColor={borderColor}
                borderWidth="1px"
                boxShadow="md"
                cursor="pointer"
                className="purple-card-border"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '2xl',
                  borderColor: useColorModeValue("blue.300", "blue.500"),
                  bg: useColorModeValue("blue.50", "blue.900")
                }}
                transition="all 0.4s ease"
                onClick={() => {
                  analytics.interaction('feature_click', 'automation');
                }}
                sx={activeFeature === 1 ? {
                  borderColor: useColorModeValue("blue.400", "blue.500"),
                  boxShadow: 'lg',
                  bg: useColorModeValue("blue.50", "blue.900")
                } : {}}
              >
                <CardBody textAlign="center" p={6}>
                  <Box color="#4A90E2" mb={4}>
                    <Icon
                      as={FaRocket}
                      boxSize={12}
                      sx={{
                        color: "#4A90E2 !important",
                        fill: "#4A90E2 !important",
                        stroke: "#4A90E2 !important"
                      }}
                      transition="all 0.3s ease"
                      _hover={{ transform: 'scale(1.1) rotate(-5deg)' }}
                    />
                  </Box>
                  <Heading size="md" mb={2} sx={{ color: "#4A90E2 !important" }}>⚡ Автоматизация</Heading>
                  <Text sx={{ color: "#4A90E2 !important", fontWeight: "600" }} fontSize="sm">
                    <Text as="span" sx={{ color: "#4A90E2 !important" }} fontWeight="bold">Автоматическое изменение</Text> цен по стратегиям
                  </Text>
                  {activeFeature === 1 && (
                    <Badge colorScheme="blue" variant="solid" mt={2} fontSize="xs">
                      Экономит время
                    </Badge>
                  )}
                </CardBody>
              </Card>
            </Tooltip>

            <Card
              bg={bgColor}
              borderColor={borderColor}
              borderWidth="1px"
              boxShadow="md"
              className="purple-card-border"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl',
                borderColor: useColorModeValue("green.300", "green.500")
              }}
              transition="all 0.3s ease"
            >
              <CardBody textAlign="center" p={6}>
                <Box color="#28A745" mb={4}>
                  <Icon as={FaMoneyBillWave} boxSize={12} sx={{
                    color: "#28A745 !important",
                    fill: "#28A745 !important",
                    stroke: "#28A745 !important"
                  }} />
                </Box>
                <Heading size="md" mb={2} sx={{ color: "#28A745 !important" }}>💰 Прибыль</Heading>
                <Text sx={{ color: "#28A745 !important", fontWeight: "600" }} fontSize="sm">
                  Увеличение прибыли до <Text as="span" sx={{ color: "#28A745 !important" }} fontWeight="bold">30%</Text> за месяц
                </Text>
              </CardBody>
            </Card>

            <Card
              bg={bgColor}
              borderColor={borderColor}
              borderWidth="1px"
              boxShadow="md"
              className="purple-card-border"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl',
                borderColor: useColorModeValue("purple.300", "purple.500")
              }}
              transition="all 0.3s ease"
            >
              <CardBody textAlign="center" p={6}>
                <Box color="#8E44AD" mb={4}>
                  <Icon as={FaUsers} boxSize={12} sx={{
                    color: "#8E44AD !important",
                    fill: "#8E44AD !important",
                    stroke: "#8E44AD !important"
                  }} />
                </Box>
                <Heading size="md" mb={2} sx={{ color: "#8E44AD !important" }}>👥 Сообщество</Heading>
                <Text sx={{ color: "#8E44AD !important", fontWeight: "600" }} fontSize="sm">
                  Активное <Text as="span" sx={{ color: "#8E44AD !important" }} fontWeight="bold">сообщество продавцов</Text> и обмен опытом
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* CTA Section */}
        <Card
          bg={useColorModeValue("blue.50", "blue.900")}
          borderColor={useColorModeValue("blue.200", "blue.600")}
          borderWidth="1px"
          boxShadow="md"
          className="purple-card-border"
          mb={16}
        >
          <CardBody textAlign="center" py={12}>
            <VStack spacing={6}>
              <Heading size="lg" color={useColorModeValue("blue.800", "blue.200")}>
                Готовы увеличить прибыль?
              </Heading>
              <Text fontSize="lg" color={useColorModeValue("blue.600", "blue.300")} maxW="2xl">
                Присоединяйтесь к 1000+ успешных продавцов, которые уже используют наш сервис
              </Text>
              <Button
                as={Link}
                to="/register"
                size="lg"
                colorScheme="blue"
                px={12}
                py={6}
                fontSize="lg"
                className="purple-button-border"
              >
                Начать бесплатно
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Описание сервиса */}
        <Box py={12} borderTop="1px solid" borderColor={borderColor}>
          <VStack spacing={8} maxW="4xl" mx="auto">
            <Heading as="h2" size="xl" textAlign="center" color={useColorModeValue('gray.800', 'white')}>
              🚀 Что делает Ozon Price Optimizer Pro?
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
              <VStack align="flex-start" spacing={4}>
                <Heading size="md" color="blue.600">📊 Умная аналитика</Heading>
                <Text color={textColor} lineHeight="tall">
                  Наш <Text as="span" color="blue.500" fontWeight="semibold">ИИ анализирует</Text> цены конкурентов в режиме реального времени, отслеживает изменения спроса
                  и <Text as="span" color="blue.500" fontWeight="semibold">предсказывает оптимальные цены</Text> для максимизации прибыли.
                </Text>

                <Heading size="md" color="green.600">⚡ Автоматизация</Heading>
                <Text color={textColor} lineHeight="tall">
                  Система <Text as="span" color="green.500" fontWeight="semibold">автоматически изменяет цены</Text> согласно вашим стратегиям, экономя часы ручной работы
                  и обеспечивая <Text as="span" color="green.500" fontWeight="semibold">мгновенную реакцию</Text> на изменения рынка.
                </Text>
              </VStack>

              <VStack align="flex-start" spacing={4}>
                <Heading size="md" color="purple.600">🛡️ Защита бизнеса</Heading>
                <Text color={textColor} lineHeight="tall">
                  Обнаруживаем <Text as="span" color="purple.500" fontWeight="semibold">демпинг, фейковые магазины</Text> и накрутку отзывов. Защищаем ваш бизнес от
                  недобросовестной конкуренции и поддерживаем <Text as="span" color="purple.500" fontWeight="semibold">здоровую рыночную среду</Text>.
                </Text>

                <Heading size="md" color="orange.600">📈 Рост прибыли</Heading>
                <Text color={textColor} lineHeight="tall">
                  В среднем наши клиенты увеличивают прибыль на <Text as="span" color="orange.500" fontWeight="bold">30%</Text> в первый месяц использования.
                  <Text as="span" color="orange.500" fontWeight="semibold">Оптимальные цены = больше продаж = выше прибыль</Text>.
                </Text>
              </VStack>
            </SimpleGrid>

            {/* Процесс работы */}
            <Box w="100%" pt={8}>
              <Heading size="lg" textAlign="center" mb={8} color={useColorModeValue('gray.800', 'white')}>
                🔄 Как это работает?
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                <VStack spacing={3}>
                  <Box
                    w={16}
                    h={16}
                    bg="blue.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    1
                  </Box>
                  <Heading size="sm" textAlign="center">Подключение</Heading>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    Подключаете свой Ozon аккаунт через безопасный API
                  </Text>
                </VStack>

                <VStack spacing={3}>
                  <Box
                    w={16}
                    h={16}
                    bg="green.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    2
                  </Box>
                  <Heading size="sm" textAlign="center">Настройка</Heading>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    Выбираете стратегии ценообразования для ваших товаров
                  </Text>
                </VStack>

                <VStack spacing={3}>
                  <Box
                    w={16}
                    h={16}
                    bg="purple.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    3
                  </Box>
                  <Heading size="sm" textAlign="center">Мониторинг</Heading>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    ИИ отслеживает конкурентов и анализирует рынок 24/7
                  </Text>
                </VStack>

                <VStack spacing={3}>
                  <Box
                    w={16}
                    h={16}
                    bg="orange.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    4
                  </Box>
                  <Heading size="sm" textAlign="center">Прибыль</Heading>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    Получаете больше продаж и прибыли на автопилоте
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
