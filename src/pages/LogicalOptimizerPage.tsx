// 🧠 Страница объяснения логического оптимизатора
import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Code,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaBrain,
  FaRobot,
  FaChartLine,
  FaCog,
  FaLightbulb,
  FaCheckCircle,
  FaArrowRight,
  FaCalculator,
  FaDatabase,
  FaSync,
} from 'react-icons/fa';

const LogicalOptimizerPage = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      {/* Заголовок */}
      <VStack spacing={6} align="center" mb={12}>
        <HStack spacing={3}>
          <Icon as={FaBrain} boxSize={12} color="purple.500" />
          <Heading size="2xl" color="purple.600" _dark={{ color: 'purple.300' }}>
            Логический Оптимизатор
          </Heading>
        </HStack>
        <Text fontSize="xl" color={textColor} textAlign="center" maxW="3xl">
          Интеллектуальная система автоматического ценообразования на основе машинного обучения и логических алгоритмов
        </Text>
      </VStack>

      {/* Что это такое */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" mb={8}>
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="blue.600" _dark={{ color: 'blue.300' }}>
              🤖 Что такое Логический Оптимизатор?
            </Heading>
            
            <Text fontSize="lg" lineHeight="tall" color={textColor}>
              <strong>Логический Оптимизатор</strong> — это ядро нашей системы ценообразования, которое использует 
              искусственный интеллект для анализа рыночных данных и принятия оптимальных решений по ценам.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="start" spacing={4}>
                <Heading size="md" color="green.600">🧠 Как работает мозг системы:</Heading>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <strong>Анализирует</strong> цены конкурентов в реальном времени
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <strong>Изучает</strong> поведение покупателей и спрос
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <strong>Прогнозирует</strong> оптимальные цены для максимизации прибыли
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <strong>Автоматически</strong> корректирует цены по заданным стратегиям
                  </ListItem>
                </List>
              </VStack>

              <VStack align="start" spacing={4}>
                <Heading size="md" color="orange.600">⚡ Ключевые возможности:</Heading>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={FaArrowRight} color="orange.500" />
                    <strong>Машинное обучение</strong> на исторических данных
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaArrowRight} color="orange.500" />
                    <strong>Логические правила</strong> ценообразования
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaArrowRight} color="orange.500" />
                    <strong>Защита от демпинга</strong> и ценовых войн
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaArrowRight} color="orange.500" />
                    <strong>Адаптация</strong> к изменениям рынка
                  </ListItem>
                </List>
              </VStack>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Алгоритмы работы */}
      <VStack spacing={8} mb={12}>
        <Heading size="lg" textAlign="center" color="purple.600" _dark={{ color: 'purple.300' }}>
          🔬 Алгоритмы и технологии
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
          <Card bg={bgColor} borderColor="blue.200" borderWidth="2px">
            <CardBody textAlign="center" p={6}>
              <Icon as={FaDatabase} boxSize={12} color="blue.500" mb={4} />
              <Heading size="md" mb={3} color="blue.600">Анализ данных</Heading>
              <Text fontSize="sm" color={textColor}>
                Обработка больших объемов данных о ценах, продажах и поведении конкурентов
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor="green.200" borderWidth="2px">
            <CardBody textAlign="center" p={6}>
              <Icon as={FaCalculator} boxSize={12} color="green.500" mb={4} />
              <Heading size="md" mb={3} color="green.600">Математические модели</Heading>
              <Text fontSize="sm" color={textColor}>
                Сложные алгоритмы оптимизации для поиска идеального баланса цены и прибыли
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor="purple.200" borderWidth="2px">
            <CardBody textAlign="center" p={6}>
              <Icon as={FaSync} boxSize={12} color="purple.500" mb={4} />
              <Heading size="md" mb={3} color="purple.600">Обучение в реальном времени</Heading>
              <Text fontSize="sm" color={textColor}>
                Постоянное улучшение алгоритмов на основе результатов продаж
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      {/* Примеры работы */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" mb={8}>
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="orange.600" _dark={{ color: 'orange.300' }}>
              📊 Примеры логических решений
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Badge colorScheme="blue" mb={3} fontSize="sm" px={3} py={1}>СЦЕНАРИЙ 1</Badge>
                <Text fontWeight="bold" mb={2}>Конкурент снизил цену на 10%</Text>
                <Text fontSize="sm" color={textColor} mb={3}>
                  Оптимизатор анализирует: эластичность спроса, маржинальность, историю продаж
                </Text>
                <Alert status="success" size="sm">
                  <AlertIcon />
                  <Text fontSize="xs">
                    <strong>Решение:</strong> Снизить цену на 7%, сохранив конкурентоспособность и прибыльность
                  </Text>
                </Alert>
              </Box>

              <Box>
                <Badge colorScheme="green" mb={3} fontSize="sm" px={3} py={1}>СЦЕНАРИЙ 2</Badge>
                <Text fontWeight="bold" mb={2}>Высокий спрос, низкие остатки</Text>
                <Text fontSize="sm" color={textColor} mb={3}>
                  Система видит: рост конверсии, уменьшение остатков, стабильный спрос
                </Text>
                <Alert status="info" size="sm">
                  <AlertIcon />
                  <Text fontSize="xs">
                    <strong>Решение:</strong> Поднять цену на 5-15% для максимизации прибыли
                  </Text>
                </Alert>
              </Box>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Технические детали */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="red.600" _dark={{ color: 'red.300' }}>
              ⚙️ Технические особенности
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <VStack align="start" spacing={4}>
                <Heading size="md" color="purple.600">🔧 Архитектура системы:</Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>
                    <Code>Neural Networks</Code> - для прогнозирования спроса
                  </ListItem>
                  <ListItem>
                    <Code>Decision Trees</Code> - для логических правил
                  </ListItem>
                  <ListItem>
                    <Code>Genetic Algorithms</Code> - для оптимизации стратегий
                  </ListItem>
                  <ListItem>
                    <Code>Real-time Processing</Code> - обработка данных в реальном времени
                  </ListItem>
                </List>
              </VStack>

              <VStack align="start" spacing={4}>
                <Heading size="md" color="blue.600">📈 Метрики эффективности:</Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>
                    <strong>Точность прогнозов:</strong> 94.7%
                  </ListItem>
                  <ListItem>
                    <strong>Скорость реакции:</strong> &lt; 30 секунд
                  </ListItem>
                  <ListItem>
                    <strong>Увеличение прибыли:</strong> в среднем +30%
                  </ListItem>
                  <ListItem>
                    <strong>Снижение ручной работы:</strong> 95%
                  </ListItem>
                </List>
              </VStack>
            </SimpleGrid>

            <Divider />

            <Alert status="warning">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Важно понимать:</Text>
                <Text fontSize="sm">
                  Логический оптимизатор — это не просто автоматизация, а интеллектуальная система, 
                  которая учится и адаптируется к вашему бизнесу, обеспечивая максимальную эффективность ценообразования.
                </Text>
              </VStack>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default LogicalOptimizerPage;
