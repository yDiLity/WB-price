// 📊 Extended Data Page - Comprehensive Product Analytics
import React, { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  Badge,
  Icon,
  Flex,
  Button,
  ButtonGroup,
} from '@chakra-ui/react'
import {
  FaChartLine,
  FaShoppingCart,
  FaRubleSign,
  FaUsers,
  FaEye,
  FaDownload,
  FaFilter,
  FaCog,
} from 'react-icons/fa'
import ExtendedDataTable from '../components/tables/ExtendedDataTable'
import WBApiKeySetup from '../components/WBApiKeySetup'

const ExtendedDataPage: React.FC = () => {
  // 🔑 API Key state
  const [hasApiKey, setHasApiKey] = useState(false)

  // 🎨 Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const accentColor = useColorModeValue('blue.500', 'blue.400')

  // 📊 Mock statistics
  const stats = [
    {
      label: 'Общая выручка',
      value: '2,847,392',
      unit: '₽',
      change: 12.5,
      icon: FaRubleSign,
      color: 'green',
    },
    {
      label: 'Активных товаров',
      value: '1,247',
      unit: 'шт',
      change: 8.2,
      icon: FaShoppingCart,
      color: 'blue',
    },
    {
      label: 'Средняя маржа',
      value: '23.4',
      unit: '%',
      change: -2.1,
      icon: FaChartLine,
      color: 'purple',
    },
    {
      label: 'Конкурентов',
      value: '15,892',
      unit: 'шт',
      change: 5.7,
      icon: FaUsers,
      color: 'orange',
    },
  ]

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="full" py={8}>
        <VStack spacing={8} align="stretch">
          {/* 📋 Header */}
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={accentColor}>
                  📊 Расширенная аналитика товаров WB
                </Heading>
                <Text color="gray.600">
                  Полная таблица данных с детальной информацией по всем товарам Wildberries
                </Text>
              </VStack>

              <ButtonGroup size="sm" variant="outline">
                <Button leftIcon={<Icon as={FaFilter} />}>
                  Фильтры
                </Button>
                <Button leftIcon={<Icon as={FaDownload} />} colorScheme="green">
                  Экспорт Excel
                </Button>
                <Button leftIcon={<Icon as={FaCog} />}>
                  Настройки
                </Button>
              </ButtonGroup>
            </HStack>

            {/* 📊 Statistics Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
              {stats.map((stat, index) => (
                <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                          <StatLabel fontSize="sm" color="gray.600">
                            {stat.label}
                          </StatLabel>
                          <StatNumber fontSize="2xl" fontWeight="bold">
                            {stat.value}
                            <Text as="span" fontSize="lg" color="gray.500" ml={1}>
                              {stat.unit}
                            </Text>
                          </StatNumber>
                          <StatHelpText mb={0}>
                            <StatArrow type={stat.change > 0 ? 'increase' : 'decrease'} />
                            {Math.abs(stat.change)}%
                          </StatHelpText>
                        </VStack>
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg={`${stat.color}.100`}
                          color={`${stat.color}.600`}
                        >
                          <Icon as={stat.icon} boxSize={6} />
                        </Box>
                      </HStack>
                    </Stat>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* 🔑 API Key Setup */}
          <WBApiKeySetup onApiKeySet={setHasApiKey} />

          {/* 🏷️ Features Badge */}
          <Flex wrap="wrap" gap={2}>
            <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
              <Icon as={FaEye} mr={2} />
              Детальный просмотр
            </Badge>
            <Badge colorScheme="green" variant="subtle" px={3} py={1}>
              📊 20+ колонок данных
            </Badge>
            <Badge colorScheme="purple" variant="subtle" px={3} py={1}>
              🔄 Автообновление
            </Badge>
            <Badge colorScheme="orange" variant="subtle" px={3} py={1}>
              📈 Аналитика в реальном времени
            </Badge>
            <Badge colorScheme="red" variant="subtle" px={3} py={1}>
              ⚡ Быстрая фильтрация
            </Badge>
          </Flex>

          {/* 📊 Main Table */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">Таблица товаров</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Полная информация по всем товарам с возможностью сортировки и фильтрации
                    </Text>
                  </VStack>

                  <Badge colorScheme="green" variant="solid" px={3} py={1}>
                    🔄 Обновлено только что
                  </Badge>
                </HStack>

                {/* 📋 Extended Data Table */}
                <ExtendedDataTable />
              </VStack>
            </CardBody>
          </Card>

          {/* 📊 Additional Info */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FaChartLine} color="blue.500" />
                    <Heading size="sm">Аналитика</Heading>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Данные обновляются каждые 15 минут. Последнее обновление: только что
                  </Text>
                  <Badge colorScheme="blue" size="sm">
                    Автоматическое обновление включено
                  </Badge>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FaUsers} color="green.500" />
                    <Heading size="sm">Конкуренты</Heading>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Отслеживается 15,892 конкурентов по 1,247 товарам
                  </Text>
                  <Badge colorScheme="green" size="sm">
                    Мониторинг активен
                  </Badge>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FaRubleSign} color="purple.500" />
                    <Heading size="sm">Прибыльность</Heading>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Средняя маржинальность составляет 23.4% по всем товарам
                  </Text>
                  <Badge colorScheme="purple" size="sm">
                    Выше среднего по рынку
                  </Badge>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}

export default ExtendedDataPage
