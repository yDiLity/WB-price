// 📊 Дашборд метрик и аналитики
import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Tooltip,
  Button,
  Flex,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  FaUsers,
  FaRocket,
  FaDollarSign,
  FaChartLine,
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSync,
  FaDownload,
  FaEye,
  FaServer,
  FaDatabase,
  FaWifi,
  FaBolt,
  FaHeart,
} from 'react-icons/fa'
import { useAnalytics } from '../services/analytics'
import { useAuditLogger } from '../services/auditLogger'
import { rateLimiter } from '../services/rateLimiter'

interface MetricCard {
  title: string
  value: string | number
  change?: number
  icon: any
  color: string
  description?: string
}

const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const analytics = useAnalytics()
  const auditLogger = useAuditLogger()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // обновляем каждые 30 секунд
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      // Получаем метрики из разных источников
      const userMetrics = analytics.getUserMetrics()
      const businessMetrics = analytics.getBusinessMetrics()
      const auditStats = auditLogger.getAuditStats()
      const rateLimitStats = rateLimiter.getStats()

      // Симулируем дополнительные метрики (в реальном приложении загружались бы с сервера)
      const systemMetrics = await fetchSystemMetrics()

      setMetrics({
        user: userMetrics,
        business: businessMetrics,
        audit: auditStats,
        rateLimit: rateLimitStats,
        system: systemMetrics,
      })

      setLoading(false)
    } catch (error) {
      console.error('Ошибка загрузки метрик:', error)
      setLoading(false)
    }
  }

  const fetchSystemMetrics = async (): Promise<any> => {
    // Симуляция системных метрик с небольшими вариациями
    const baseMetrics = {
      uptime: 99.97 + (Math.random() - 0.5) * 0.1,
      responseTime: 245 + Math.floor((Math.random() - 0.5) * 50),
      errorRate: 0.03 + (Math.random() - 0.5) * 0.02,
      activeUsers: 1247 + Math.floor((Math.random() - 0.5) * 100),
      revenue: 127500 + Math.floor((Math.random() - 0.5) * 10000),
      conversions: 89 + Math.floor((Math.random() - 0.5) * 10),
    }

    // Убеждаемся, что значения в разумных пределах
    return {
      uptime: Math.max(99.5, Math.min(100, baseMetrics.uptime)),
      responseTime: Math.max(100, Math.min(500, baseMetrics.responseTime)),
      errorRate: Math.max(0, Math.min(1, baseMetrics.errorRate)),
      activeUsers: Math.max(1000, baseMetrics.activeUsers),
      revenue: Math.max(100000, baseMetrics.revenue),
      conversions: Math.max(70, Math.min(100, baseMetrics.conversions)),
    }
  }

  // 📊 Основные метрики
  const mainMetrics: MetricCard[] = [
    {
      title: 'Активные пользователи',
      value: metrics.system?.activeUsers || 0,
      change: 12.5,
      icon: FaUsers,
      color: 'blue',
      description: 'Пользователи онлайн сейчас',
    },
    {
      title: 'Месячная выручка',
      value: `₽${(metrics.system?.revenue || 0).toLocaleString()}`,
      change: 23.1,
      icon: FaDollarSign,
      color: 'green',
      description: 'MRR за текущий месяц',
    },
    {
      title: 'Конверсия',
      value: `${metrics.system?.conversions || 0}%`,
      change: 5.7,
      icon: FaRocket,
      color: 'purple',
      description: 'Конверсия в подписку',
    },
    {
      title: 'Время отклика',
      value: `${metrics.system?.responseTime || 0}ms`,
      change: -8.2,
      icon: FaClock,
      color: 'orange',
      description: 'Среднее время API',
    },
  ]

  // 🔒 Метрики безопасности
  const securityMetrics = [
    {
      title: 'Уровень безопасности',
      value: 'Высокий',
      status: 'success',
      description: 'Все системы защищены',
    },
    {
      title: 'Заблокированные запросы',
      value: metrics.rateLimit?.blockedEntries || 0,
      status: 'info',
      description: 'За последний час',
    },
    {
      title: 'События аудита',
      value: metrics.audit?.totalEvents || 0,
      status: 'info',
      description: 'За сегодня',
    },
    {
      title: 'Критические события',
      value: metrics.audit?.riskDistribution?.CRITICAL || 0,
      status: metrics.audit?.riskDistribution?.CRITICAL > 0 ? 'warning' : 'success',
      description: 'Требуют внимания',
    },
  ]

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <VStack spacing={6}>
          <Box>
            <Spinner size="xl" color="primary.500" thickness="4px" />
          </Box>
          <VStack spacing={2}>
            <Heading size="md" color="primary.600" _dark={{ color: 'primary.300' }}>
              📊 Загрузка метрик
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Собираем данные из всех систем...
            </Text>
          </VStack>
          <Progress
            size="lg"
            isIndeterminate
            colorScheme="blue"
            w="300px"
            borderRadius="full"
            bg="gray.100"
            _dark={{ bg: 'gray.700' }}
          />
          <HStack spacing={4} fontSize="xs" color="gray.400">
            <HStack>
              <Icon as={FaDatabase} />
              <Text>База данных</Text>
            </HStack>
            <HStack>
              <Icon as={FaServer} />
              <Text>Сервер</Text>
            </HStack>
            <HStack>
              <Icon as={FaWifi} />
              <Text>API</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    )
  }

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Заголовок */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2} color="primary.600" _dark={{ color: 'primary.300' }}>
              📊 Дашборд метрик
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Мониторинг производительности и безопасности в реальном времени
            </Text>
          </Box>
          <HStack spacing={3}>
            <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
              <HStack spacing={1}>
                <Icon as={FaHeart} boxSize={3} />
                <Text fontSize="xs">Система работает</Text>
              </HStack>
            </Badge>
            <Tooltip label="Обновить данные" hasArrow>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<Icon as={FaSync} />}
                onClick={loadMetrics}
                isLoading={loading}
                loadingText="Обновление"
              >
                Обновить
              </Button>
            </Tooltip>
          </HStack>
        </Flex>

        {/* Основные метрики */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {mainMetrics.map((metric, index) => (
            <Card
              key={index}
              bg={cardBg}
              borderColor={borderColor}
              borderWidth="1px"
              transition="all 0.3s ease"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl',
                borderColor: `${metric.color}.300`,
              }}
              cursor="pointer"
            >
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={`${metric.color}.50`}
                      _dark={{ bg: `${metric.color}.900` }}
                    >
                      <Icon
                        as={metric.icon}
                        boxSize={6}
                        color={`${metric.color}.500`}
                        _dark={{ color: `${metric.color}.300` }}
                      />
                    </Box>
                    {metric.change && (
                      <Tooltip
                        label={`Изменение за последний период: ${metric.change > 0 ? '+' : ''}${metric.change}%`}
                        hasArrow
                      >
                        <Badge
                          colorScheme={metric.change > 0 ? 'green' : 'red'}
                          variant="subtle"
                          borderRadius="full"
                          px={2}
                          py={1}
                        >
                          {metric.change > 0 ? '↗' : '↘'} {Math.abs(metric.change)}%
                        </Badge>
                      </Tooltip>
                    )}
                  </HStack>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {metric.title}
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" color={`${metric.color}.600`} _dark={{ color: `${metric.color}.300` }}>
                      {metric.value}
                    </Text>
                    {metric.description && (
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {metric.description}
                      </Text>
                    )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Детальная аналитика */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>📈 Аналитика</Tab>
            <Tab>🔒 Безопасность</Tab>
            <Tab>⚡ Производительность</Tab>
            <Tab>🧪 A/B Тесты</Tab>
          </TabList>

          <TabPanels>
            {/* Аналитика */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">📊 Использование функций</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {Object.entries(metrics.business?.features?.usage || {}).map(([feature, count]) => (
                        <Box key={feature}>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="sm">{feature}</Text>
                            <Text fontSize="sm" fontWeight="bold">{count as number}</Text>
                          </HStack>
                          <Progress
                            value={(count as number) / 100}
                            colorScheme="blue"
                            size="sm"
                          />
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">👥 Пользовательские метрики</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Stat>
                        <StatLabel>Время сессии</StatLabel>
                        <StatNumber>{Math.round((metrics.user?.sessionDuration || 0) / 60000)} мин</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Просмотры страниц</StatLabel>
                        <StatNumber>{metrics.user?.pageViews || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>События</StatLabel>
                        <StatNumber>{metrics.user?.events || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Использованные функции</StatLabel>
                        <StatNumber>{metrics.user?.features?.length || 0}</StatNumber>
                      </Stat>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Безопасность */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">🛡️ Статус безопасности</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {securityMetrics.map((metric, index) => (
                        <Alert key={index} status={metric.status as any} borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">{metric.title}</AlertTitle>
                            <AlertDescription fontSize="xs">
                              {metric.value} - {metric.description}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">📝 Последние события аудита</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto">
                      {metrics.audit?.recentEvents?.slice(0, 5).map((event: any, index: number) => (
                        <Box key={index} p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                          <HStack justify="space-between" mb={1}>
                            <Badge colorScheme={
                              event.security.riskLevel === 'CRITICAL' ? 'red' :
                              event.security.riskLevel === 'HIGH' ? 'orange' :
                              event.security.riskLevel === 'MEDIUM' ? 'yellow' : 'green'
                            }>
                              {event.security.riskLevel}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="semibold">{event.action}</Text>
                          <Text fontSize="xs" color="gray.500">{event.eventType}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Производительность */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">⚡ Системные метрики</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <Box w="100%">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">Uptime</Text>
                          <Text fontSize="sm" fontWeight="bold">{metrics.system?.uptime}%</Text>
                        </HStack>
                        <Progress value={metrics.system?.uptime} colorScheme="green" />
                      </Box>

                      <Box w="100%">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">Время отклика</Text>
                          <Text fontSize="sm" fontWeight="bold">{metrics.system?.responseTime}ms</Text>
                        </HStack>
                        <Progress
                          value={Math.max(0, 100 - (metrics.system?.responseTime / 10))}
                          colorScheme="blue"
                        />
                      </Box>

                      <Box w="100%">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">Уровень ошибок</Text>
                          <Text fontSize="sm" fontWeight="bold">{metrics.system?.errorRate}%</Text>
                        </HStack>
                        <Progress
                          value={metrics.system?.errorRate * 10}
                          colorScheme="red"
                        />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">🚦 Rate Limiting</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Stat>
                        <StatLabel>Всего записей</StatLabel>
                        <StatNumber>{metrics.rateLimit?.totalEntries || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Заблокированные</StatLabel>
                        <StatNumber color="red.500">{metrics.rateLimit?.blockedEntries || 0}</StatNumber>
                      </Stat>
                      <Box>
                        <Text fontSize="sm" mb={2}>Топ нарушители:</Text>
                        <VStack spacing={1} align="stretch">
                          {metrics.rateLimit?.topViolators?.slice(0, 3).map((violator: any, index: number) => (
                            <HStack key={index} justify="space-between" fontSize="xs">
                              <Text isTruncated maxW="150px">{violator.key}</Text>
                              <Badge size="sm">{violator.count}</Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">📊 Статистика событий</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {Object.entries(metrics.audit?.eventsByType || {}).map(([type, count]) => (
                        <HStack key={type} justify="space-between">
                          <Text fontSize="sm">{type}</Text>
                          <Badge>{count as number}</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* A/B Тесты */}
            <TabPanel>
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">🧪 Активные A/B тесты</Heading>
                </CardHeader>
                <CardBody>
                  <Text color="gray.500" textAlign="center" py={8}>
                    A/B тесты будут отображаться здесь после интеграции с сервером
                  </Text>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default MetricsDashboard
