import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Icon,
  useDisclosure,
  useColorModeValue,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListIcon,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FaQuestionCircle,
  FaRocket,
  FaChartLine,
  FaUsers,
  FaCog,
  FaMoneyBillWave,
  FaShoppingCart,
  FaRobot,
  FaTruck,
  FaCheckCircle,
  FaPlay,
  FaBook,
  FaLightbulb,
} from 'react-icons/fa';

interface HelpTopic {
  id: string;
  title: string;
  icon: any;
  category: string;
  difficulty: 'Начинающий' | 'Средний' | 'Продвинутый';
  description: string;
  steps: string[];
  tips: string[];
  videoUrl?: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Начало работы',
    icon: FaRocket,
    category: 'Основы',
    difficulty: 'Начинающий',
    description: 'Первые шаги в системе автоматизации ценообразования',
    steps: [
      'Зарегистрируйтесь в системе',
      'Подключите API ключи Ozon',
      'Импортируйте ваши товары',
      'Настройте первую стратегию ценообразования',
      'Запустите мониторинг цен'
    ],
    tips: [
      'Начните с 5-10 товаров для тестирования',
      'Используйте консервативные стратегии в начале',
      'Регулярно проверяйте результаты первую неделю'
    ]
  },
  {
    id: 'product-management',
    title: 'Управление товарами',
    icon: FaShoppingCart,
    category: 'Товары',
    difficulty: 'Начинающий',
    description: 'Как добавлять, редактировать и управлять товарами',
    steps: [
      'Перейдите в раздел "Мои товары"',
      'Нажмите "Добавить товар" или импортируйте из Ozon',
      'Заполните информацию о товаре',
      'Установите минимальную цену',
      'Сохраните изменения'
    ],
    tips: [
      'Всегда устанавливайте минимальную цену для защиты от убытков',
      'Используйте понятные названия для товаров',
      'Регулярно обновляйте информацию о товарах'
    ]
  },
  {
    id: 'pricing-strategies',
    title: 'Стратегии ценообразования',
    icon: FaChartLine,
    category: 'Стратегии',
    difficulty: 'Средний',
    description: 'Создание и настройка автоматических стратегий цен',
    steps: [
      'Откройте раздел "Управление" → "Стратегии"',
      'Выберите тип стратегии (конкурентная, маржинальная, динамическая)',
      'Настройте параметры стратегии',
      'Примените стратегию к товарам',
      'Мониторьте результаты'
    ],
    tips: [
      'Конкурентная стратегия - для высококонкурентных товаров',
      'Маржинальная стратегия - для уникальных товаров',
      'Динамическая стратегия - для сезонных товаров'
    ]
  },
  {
    id: 'competitor-linking',
    title: 'Связывание с конкурентами',
    icon: FaUsers,
    category: 'Конкуренты',
    difficulty: 'Средний',
    description: 'Как найти и связать товары с конкурентами',
    steps: [
      'Выберите товар в списке',
      'Нажмите "Связать с конкурентами"',
      'Найдите аналогичные товары конкурентов',
      'Выберите релевантных конкурентов',
      'Сохраните связи'
    ],
    tips: [
      'Выбирайте конкурентов с похожими характеристиками товара',
      'Не связывайте с подозрительными продавцами',
      'Регулярно проверяйте актуальность связей'
    ]
  },
  {
    id: 'auto-regulation',
    title: 'Автоматическое регулирование',
    icon: FaRobot,
    category: 'Автоматизация',
    difficulty: 'Продвинутый',
    description: 'Настройка полностью автоматического изменения цен',
    steps: [
      'Перейдите в "Автоматическое регулирование"',
      'Включите автоматизацию для товаров',
      'Настройте частоту проверки цен',
      'Установите лимиты изменения цен',
      'Активируйте систему'
    ],
    tips: [
      'Начните с небольших изменений цен (5-10%)',
      'Установите уведомления о больших изменениях',
      'Регулярно анализируйте логи изменений'
    ]
  },
  {
    id: 'analytics',
    title: 'Аналитика и отчеты',
    icon: FaChartLine,
    category: 'Аналитика',
    difficulty: 'Средний',
    description: 'Анализ эффективности и создание отчетов',
    steps: [
      'Откройте раздел "Аналитика"',
      'Выберите период для анализа',
      'Изучите графики продаж и прибыли',
      'Сравните эффективность стратегий',
      'Экспортируйте отчеты'
    ],
    tips: [
      'Анализируйте данные еженедельно',
      'Сравнивайте периоды до и после автоматизации',
      'Обращайте внимание на сезонные тренды'
    ]
  },
  {
    id: 'logistics',
    title: 'Логистическая оптимизация',
    icon: FaTruck,
    category: 'Логистика',
    difficulty: 'Продвинутый',
    description: 'Управление складскими остатками и поставками',
    steps: [
      'Перейдите в "Логистическая оптимизация"',
      'Настройте уведомления о низких остатках',
      'Планируйте поставки на основе прогнозов',
      'Мониторьте слоты доставки',
      'Оптимизируйте складские процессы'
    ],
    tips: [
      'Поддерживайте страховой запас',
      'Используйте прогнозы спроса для планирования',
      'Мониторьте доступность слотов доставки'
    ]
  }
];

const HelpSystem: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const categories = [
    { id: 'all', name: 'Все темы', icon: FaBook },
    { id: 'Основы', name: 'Основы', icon: FaRocket },
    { id: 'Товары', name: 'Товары', icon: FaShoppingCart },
    { id: 'Стратегии', name: 'Стратегии', icon: FaChartLine },
    { id: 'Конкуренты', name: 'Конкуренты', icon: FaUsers },
    { id: 'Автоматизация', name: 'Автоматизация', icon: FaRobot },
    { id: 'Аналитика', name: 'Аналитика', icon: FaChartLine },
    { id: 'Логистика', name: 'Логистика', icon: FaTruck },
  ];

  const filteredTopics = selectedCategory === 'all'
    ? helpTopics
    : helpTopics.filter(topic => topic.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Начинающий': return 'green';
      case 'Средний': return 'yellow';
      case 'Продвинутый': return 'red';
      default: return 'gray';
    }
  };

  return (
    <>
      {/* Плавающая кнопка помощи */}
      <Tooltip label="Помощь и обучение" hasArrow placement="left">
        <Button
          position="fixed"
          bottom="20px"
          right="20px"
          size="lg"
          colorScheme="blue"
          borderRadius="full"
          boxShadow="lg"
          zIndex={1000}
          onClick={onOpen}
          _hover={{
            transform: 'scale(1.1)',
            boxShadow: 'xl'
          }}
          transition="all 0.2s"
        >
          <Icon as={FaQuestionCircle} boxSize={6} />
        </Button>
      </Tooltip>

      {/* Модальное окно помощи */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <HStack>
              <Icon as={FaLightbulb} color="yellow.500" />
              <Text>Центр помощи и обучения</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Категории */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  📚 Выберите категорию:
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={selectedCategory === category.id ? 'solid' : 'outline'}
                      colorScheme="blue"
                      leftIcon={<Icon as={category.icon} />}
                      onClick={() => setSelectedCategory(category.id)}
                      mb={2}
                    >
                      {category.name}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <Divider />

              {/* Список тем */}
              <Accordion allowMultiple>
                {filteredTopics.map((topic) => (
                  <AccordionItem key={topic.id} border="1px solid" borderColor={borderColor} borderRadius="lg" mb={4}>
                    <AccordionButton p={4}>
                      <HStack flex="1" textAlign="left" spacing={4}>
                        <Icon as={topic.icon} boxSize={6} color="blue.500" />
                        <VStack align="start" spacing={1} flex="1">
                          <HStack>
                            <Text fontWeight="bold" fontSize="lg">{topic.title}</Text>
                            <Badge colorScheme={getDifficultyColor(topic.difficulty)}>
                              {topic.difficulty}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color={textColor}>
                            {topic.description}
                          </Text>
                        </VStack>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={4}>
                        {/* Пошаговая инструкция */}
                        <Box>
                          <Text fontWeight="bold" mb={3} color="blue.600">
                            📋 Пошаговая инструкция:
                          </Text>
                          <List spacing={2}>
                            {topic.steps.map((step, index) => (
                              <ListItem key={index}>
                                <ListIcon as={FaCheckCircle} color="green.500" />
                                <Text as="span" fontSize="sm">{step}</Text>
                              </ListItem>
                            ))}
                          </List>
                        </Box>

                        {/* Полезные советы */}
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">💡 Полезные советы:</AlertTitle>
                            <AlertDescription fontSize="sm">
                              <List spacing={1} mt={2}>
                                {topic.tips.map((tip, index) => (
                                  <ListItem key={index}>
                                    <Text>• {tip}</Text>
                                  </ListItem>
                                ))}
                              </List>
                            </AlertDescription>
                          </Box>
                        </Alert>

                        {/* Кнопка действия */}
                        <HStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<Icon as={FaPlay} />}
                            onClick={() => {
                              // Логика перехода к соответствующей странице
                              const routes: Record<string, string> = {
                                'getting-started': '/dashboard',
                                'product-management': '/wb-products',
                                'pricing-strategies': '/strategies',
                                'competitor-linking': '/linked-products',
                                'auto-regulation': '/auto-price-regulation',
                                'analytics': '/metrics',
                                'logistics': '/logistics'
                              };

                              const route = routes[topic.id];
                              if (route) {
                                window.location.href = route;
                              }
                            }}
                          >
                            Попробовать сейчас
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="green"
                            leftIcon={<Icon as={FaBook} />}
                            onClick={() => {
                              // Показываем подробную информацию в алерте
                              alert(`📚 Подробное руководство: "${topic.title}"\n\n📝 Описание:\n${topic.description}\n\n📋 Пошаговые инструкции:\n${topic.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n💡 Полезные советы:\n${topic.tips.map(tip => `• ${tip}`).join('\n')}\n\n🎯 Уровень сложности: ${topic.difficulty}\n\n📞 Нужна помощь? Обращайтесь в Telegram: @ozon_optimizer_support`);
                            }}
                          >
                            Подробное руководство
                          </Button>
                          {topic.videoUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              leftIcon={<Icon as={FaPlay} />}
                            >
                              Видео-урок
                            </Button>
                          )}
                        </HStack>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Дополнительная помощь */}
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>🎯 Нужна персональная помощь?</AlertTitle>
                  <AlertDescription>
                    Свяжитесь с нашей службой поддержки через Telegram: <Code>@ozon_optimizer_support</Code>
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HelpSystem;
