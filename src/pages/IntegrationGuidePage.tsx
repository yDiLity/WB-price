import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Code,
  Link,
  Button,
  Image,
  Flex,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody
} from '@chakra-ui/react';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

export default function IntegrationGuidePage() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const codeBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Руководство по интеграции</Heading>

      <Tabs colorScheme="blue" isLazy>
        <TabList mb={6}>
          <Tab>API Ozon</Tab>
          <Tab>Telegram-бот</Tab>
          <Tab>ИИ-функциональность</Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка API Ozon */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
              <CardHeader>
                <Heading size="md">Интеграция с API Ozon</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Для работы с API Ozon вам потребуется получить Client ID и API-ключ в личном кабинете продавца Ozon.
                </Text>

                <Heading size="sm" mb={3}>Шаги для получения доступа к API Ozon:</Heading>
                <OrderedList spacing={3} mb={6}>
                  <ListItem>
                    Войдите в личный кабинет продавца Ozon по адресу{' '}
                    <Link href="https://seller.ozon.ru/" isExternal color="blue.500">
                      https://seller.ozon.ru/ <ExternalLinkIcon mx="2px" />
                    </Link>
                  </ListItem>
                  <ListItem>
                    Перейдите в раздел <strong>Настройки</strong> → <strong>API-ключи</strong>
                  </ListItem>
                  <ListItem>
                    Нажмите кнопку <strong>Создать ключ</strong>
                  </ListItem>
                  <ListItem>
                    Укажите название ключа (например, "Ozon Price Optimizer Pro") и нажмите <strong>Создать</strong>
                  </ListItem>
                  <ListItem>
                    Система сгенерирует Client ID и API-ключ. <strong>Важно:</strong> API-ключ будет показан только один раз, сохраните его в надежном месте
                  </ListItem>
                </OrderedList>

                <Alert status="info" borderRadius="md" mb={6}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Важно!</Text>
                    <Text>
                      API-ключ Ozon дает доступ к вашему аккаунту продавца. Никогда не передавайте его третьим лицам и не публикуйте в открытом доступе.
                    </Text>
                  </Box>
                </Alert>

                <Heading size="sm" mb={3}>Доступные методы API Ozon:</Heading>
                <Text mb={3}>
                  Ozon Price Optimizer Pro использует следующие методы API Ozon:
                </Text>
                <UnorderedList spacing={2} mb={6}>
                  <ListItem><Code>/v2/product/list</Code> - получение списка товаров</ListItem>
                  <ListItem><Code>/v1/product/info/prices</Code> - получение информации о ценах</ListItem>
                  <ListItem><Code>/v1/product/update/price</Code> - обновление цен товаров</ListItem>
                  <ListItem><Code>/v1/analytics/stock</Code> - получение информации об остатках</ListItem>
                  <ListItem><Code>/v1/analytics/data</Code> - получение аналитических данных</ListItem>
                </UnorderedList>

                <Heading size="sm" mb={3}>Пример запроса к API Ozon:</Heading>
                <Box bg={codeBg} p={4} borderRadius="md" fontFamily="monospace" fontSize="sm" mb={6} overflowX="auto">
                  <Text>POST https://api-seller.ozon.ru/v2/product/list</Text>
                  <Text>Headers:</Text>
                  <Text ml={4}>Client-Id: 123456</Text>
                  <Text ml={4}>Api-Key: 11111111-1111-1111-1111-111111111111</Text>
                  <Text ml={4}>Content-Type: application/json</Text>
                  <Text>Body:</Text>
                  <Text ml={4}>{'{'}</Text>
                  <Text ml={8}>"limit": 100,</Text>
                  <Text ml={8}>"offset": 0</Text>
                  <Text ml={4}>{'}'}</Text>
                </Box>

                <Flex justify="center">
                  <Button
                    as={RouterLink}
                    to="/settings"
                    colorScheme="blue"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Перейти к настройкам API
                  </Button>
                </Flex>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Документация API Ozon</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Полная документация по API Ozon доступна в личном кабинете продавца в разделе <strong>Настройки</strong> → <strong>API-ключи</strong> → <strong>Документация</strong>.
                </Text>

                <Text mb={4}>
                  Также вы можете ознакомиться с документацией по следующим ссылкам:
                </Text>

                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={ExternalLinkIcon} color="blue.500" />
                    <Link href="https://docs.ozon.ru/api/seller/" isExternal color="blue.500">
                      Документация API Ozon для продавцов
                    </Link>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={ExternalLinkIcon} color="blue.500" />
                    <Link href="https://github.com/ozonmp/ozon-seller-api-client" isExternal color="blue.500">
                      GitHub-репозиторий с примерами использования API
                    </Link>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={ExternalLinkIcon} color="blue.500" />
                    <Link href="https://seller.ozon.ru/apiref/" isExternal color="blue.500">
                      Справочник API Ozon
                    </Link>
                  </ListItem>
                </List>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Вкладка Telegram-бот */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
              <CardHeader>
                <Heading size="md">Подключение к Telegram-боту</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Для получения уведомлений в Telegram мы создали официального бота Ozon Price Optimizer Pro.
                </Text>

                <Heading size="sm" mb={3}>Шаги для подключения к Telegram-боту:</Heading>
                <OrderedList spacing={3} mb={6}>
                  <ListItem>
                    Откройте нашего официального бота <strong>@OzonPriceOptimizerBot</strong> в Telegram
                  </ListItem>
                  <ListItem>
                    Отправьте команду <Code>/start</Code>
                  </ListItem>
                  <ListItem>
                    Введите общий пароль для авторизации: <Code>ozonpro2025</Code>
                  </ListItem>
                  <ListItem>
                    После успешной авторизации вы получите свой уникальный Chat ID
                  </ListItem>
                  <ListItem>
                    Используйте этот Chat ID в настройках приложения для получения уведомлений
                  </ListItem>
                </OrderedList>

                <Alert status="info" borderRadius="md" mb={6}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Важно!</Text>
                    <Text>
                      Каждый пользователь получает уникальный Chat ID, даже если все используют один и тот же пароль.
                      Это обеспечивает безопасность и позволяет отправлять уведомления конкретному пользователю.
                    </Text>
                  </Box>
                </Alert>

                <Alert status="info" borderRadius="md" mb={6}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Важно!</Text>
                    <Text>
                      Токен бота дает полный доступ к управлению вашим ботом. Никогда не передавайте его третьим лицам и не публикуйте в открытом доступе.
                    </Text>
                  </Box>
                </Alert>

                <Heading size="sm" mb={3}>Получение Chat ID:</Heading>
                <Text mb={3}>
                  Для отправки сообщений вам также потребуется узнать ваш Chat ID в Telegram:
                </Text>
                <OrderedList spacing={3} mb={6}>
                  <ListItem>
                    Найдите бота <strong>@userinfobot</strong> в Telegram
                  </ListItem>
                  <ListItem>
                    Отправьте ему любое сообщение
                  </ListItem>
                  <ListItem>
                    Бот ответит вам сообщением, содержащим ваш Chat ID (например, <Code>123456789</Code>)
                  </ListItem>
                </OrderedList>

                <Heading size="sm" mb={3}>Настройка уведомлений:</Heading>
                <Text mb={3}>
                  После создания бота и получения Chat ID вы можете настроить уведомления в Ozon Price Optimizer Pro:
                </Text>
                <OrderedList spacing={3} mb={6}>
                  <ListItem>
                    Перейдите в раздел <strong>Настройки</strong> → <strong>Telegram-бот</strong>
                  </ListItem>
                  <ListItem>
                    Введите токен бота и ваш Chat ID
                  </ListItem>
                  <ListItem>
                    Нажмите кнопку <strong>Подключить Telegram-бота</strong>
                  </ListItem>
                  <ListItem>
                    Отправьте тестовое сообщение, чтобы проверить работу бота
                  </ListItem>
                </OrderedList>

                <Flex justify="center">
                  <Button
                    as="a"
                    href="https://t.me/OzonPriceOptimizerBot"
                    target="_blank"
                    colorScheme="blue"
                    rightIcon={<ExternalLinkIcon />}
                    mr={4}
                  >
                    Открыть нашего бота
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/settings"
                    colorScheme="blue"
                    variant="outline"
                  >
                    Перейти к настройкам
                  </Button>
                </Flex>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
              <CardHeader>
                <Heading size="md">Примеры уведомлений</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Вот примеры уведомлений, которые вы будете получать в Telegram:
                </Text>

                <Heading size="sm" mb={3}>Уведомление о изменении цены:</Heading>
                <Box bg={codeBg} p={4} borderRadius="md" fontFamily="monospace" fontSize="sm" mb={6}>
                  <Text fontWeight="bold">Изменение цены товара</Text>
                  <Text></Text>
                  <Text>Товар: Samsung Смартфон S 12</Text>
                  <Text>Старая цена: 24 990 ₽</Text>
                  <Text>Новая цена: 22 990 ₽</Text>
                  <Text>Изменение: -8.00%</Text>
                  <Text>Причина: Реакция на снижение цены конкурентом</Text>
                  <Text></Text>
                  <Text fontStyle="italic">Для управления ценами перейдите в личный кабинет Ozon Price Optimizer Pro</Text>
                </Box>

                <Heading size="sm" mb={3}>Уведомление о подозрительной активности:</Heading>
                <Box bg={codeBg} p={4} borderRadius="md" fontFamily="monospace" fontSize="sm" mb={6}>
                  <Text fontWeight="bold">⚠️ Обнаружена подозрительная активность!</Text>
                  <Text></Text>
                  <Text>Тип: Демпинг</Text>
                  <Text>Товар: Apple Наушники Pro 3</Text>
                  <Text>Конкурент: TechZone</Text>
                  <Text>Описание: Цена на AirPods 4990 ₽ (рыночная 12990 ₽)</Text>
                  <Text></Text>
                  <Text fontWeight="bold">Рекомендуемое действие:</Text>
                  <Text>Подать жалобу через Ozon API</Text>
                  <Text></Text>
                  <Text fontStyle="italic">Для подробной информации перейдите в личный кабинет Ozon Price Optimizer Pro</Text>
                </Box>

                <Heading size="sm" mb={3}>Уведомление о рекомендованной цене:</Heading>
                <Box bg={codeBg} p={4} borderRadius="md" fontFamily="monospace" fontSize="sm" mb={6}>
                  <Text fontWeight="bold">💡 Рекомендация по цене</Text>
                  <Text></Text>
                  <Text>Товар: Xiaomi Планшет Lite 5</Text>
                  <Text>Текущая цена: 15 990 ₽</Text>
                  <Text>Рекомендуемая цена: 17 490 ₽ (на 9.38% выше)</Text>
                  <Text></Text>
                  <Text fontStyle="italic">Для применения рекомендации перейдите в личный кабинет Ozon Price Optimizer Pro</Text>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Вкладка ИИ-функциональность */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm" mb={6}>
              <CardHeader>
                <Heading size="md">ИИ-функциональность</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Ozon Price Optimizer Pro использует передовые алгоритмы искусственного интеллекта для оптимизации цен и обнаружения подозрительной активности конкурентов.
                </Text>

                <Heading size="sm" mb={3}>Основные ИИ-модули:</Heading>
                <List spacing={4} mb={6}>
                  <ListItem>
                    <Flex align="start">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Box>
                        <Text fontWeight="bold">Прогнозирование спроса</Text>
                        <Text>Анализирует исторические данные о продажах и предсказывает будущий спрос на товары с учетом сезонности, трендов и других факторов.</Text>
                      </Box>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex align="start">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Box>
                        <Text fontWeight="bold">Reinforcement Learning</Text>
                        <Text>Использует алгоритмы обучения с подкреплением для автоматической корректировки цен в зависимости от реакции рынка.</Text>
                      </Box>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex align="start">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Box>
                        <Text fontWeight="bold">Анализ отзывов (NLP)</Text>
                        <Text>Анализирует отзывы покупателей с помощью обработки естественного языка для выявления сильных и слабых сторон товаров.</Text>
                      </Box>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex align="start">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Box>
                        <Text fontWeight="bold">Обнаружение аномалий</Text>
                        <Text>Выявляет подозрительную активность конкурентов, такую как демпинг, фейковые отзывы и фейковые магазины.</Text>
                      </Box>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex align="start">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Box>
                        <Text fontWeight="bold">Персонализация</Text>
                        <Text>Адаптирует стратегии ценообразования под конкретные товары и категории на основе их уникальных характеристик.</Text>
                      </Box>
                    </Flex>
                  </ListItem>
                </List>

                <Alert status="info" borderRadius="md" mb={6}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Важно!</Text>
                    <Text>
                      ИИ-функциональность требует доступа к историческим данным о продажах и ценах. Чем больше данных вы предоставите, тем точнее будут прогнозы и рекомендации.
                    </Text>
                  </Box>
                </Alert>

                <Heading size="sm" mb={3}>Как это работает:</Heading>
                <OrderedList spacing={3} mb={6}>
                  <ListItem>
                    <Text fontWeight="medium">Сбор данных</Text>
                    <Text>Система собирает данные о ваших товарах, ценах конкурентов, продажах и отзывах покупателей.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">Анализ данных</Text>
                    <Text>ИИ-алгоритмы анализируют собранные данные, выявляют закономерности и тренды.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">Генерация рекомендаций</Text>
                    <Text>На основе анализа система генерирует рекомендации по оптимальным ценам для каждого товара.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">Применение изменений</Text>
                    <Text>Вы можете применить рекомендованные изменения вручную или настроить автоматическое применение.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">Обучение на результатах</Text>
                    <Text>Система анализирует результаты примененных изменений и корректирует свои алгоритмы для повышения точности будущих рекомендаций.</Text>
                  </ListItem>
                </OrderedList>

                <Flex justify="center">
                  <Button
                    as={RouterLink}
                    to="/settings"
                    colorScheme="blue"
                  >
                    Настроить ИИ-функциональность
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
