import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Code,
  Divider,
  useColorModeValue,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  ShieldIcon,
  TimeIcon,
  LockIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { FaLock, FaRobot, FaServer, FaEye } from 'react-icons/fa';

export default function SecurityGuidePage() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const codeBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box textAlign="center" className="purple-section-border" p={6}>
          <Icon as={FaLock} boxSize={12} color="purple.500" mb={4} />
          <Heading as="h1" size="xl" mb={4} color="purple.600">
            🛡️ Полный чек-лист безопасности Wildberries
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Как гарантированно избежать блокировки на WB и других маркетплейсах
          </Text>
        </Box>

        {/* Критическое предупреждение */}
        <Alert status="error" className="purple-alert-border">
          <AlertIcon />
          <Box>
            <AlertTitle>⚠️ Критически важно!</AlertTitle>
            <AlertDescription>
              Несоблюдение этих правил может привести к блокировке вашего аккаунта и потере бизнеса.
              Следуйте всем 12 правилам без исключений.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Основные разделы */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card className="purple-card-border" bg={cardBg}>
            <CardBody textAlign="center">
              <Icon as={FaServer} boxSize={8} color="blue.500" mb={3} />
              <Heading size="md" mb={2}>Техническая защита</Heading>
              <Text fontSize="sm" color="gray.600">
                Прокси, User-Agent, задержки
              </Text>
            </CardBody>
          </Card>

          <Card className="purple-card-border" bg={cardBg}>
            <CardBody textAlign="center">
              <Icon as={FaRobot} boxSize={8} color="green.500" mb={3} />
              <Heading size="md" mb={2}>API Wildberries</Heading>
              <Text fontSize="sm" color="gray.600">
                Лимиты, кеширование, квоты
              </Text>
            </CardBody>
          </Card>

          <Card className="purple-card-border" bg={cardBg}>
            <CardBody textAlign="center">
              <LockIcon boxSize={8} color="orange.500" mb={3} />
              <Heading size="md" mb={2}>Юридическая защита</Heading>
              <Text fontSize="sm" color="gray.600">
                Договоры, персональные данные
              </Text>
            </CardBody>
          </Card>

          <Card className="purple-card-border" bg={cardBg}>
            <CardBody textAlign="center">
              <Icon as={FaEye} boxSize={8} color="purple.500" mb={3} />
              <Heading size="md" mb={2}>Мониторинг</Heading>
              <Text fontSize="sm" color="gray.600">
                Алерты, резервные каналы
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Детальный чек-лист */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="lg">📋 Детальный чек-лист (12 правил)</Heading>
          </CardHeader>
          <CardBody>
            <Accordion allowMultiple>
              {/* Техническая безопасность */}
              <AccordionItem>
                <AccordionButton className="purple-button-border">
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={FaServer} color="blue.500" />
                      <Text fontWeight="bold">1. Техническая безопасность</Text>
                      <Badge colorScheme="red">Критично</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="purple.600">① Ротация IP и прокси</Text>
                      <List spacing={2} mt={2}>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Используйте резидентные/мобильные прокси (Luminati, Smartproxy)
                        </ListItem>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          1 IP = не чаще 1 запроса/5 сек
                        </ListItem>
                      </List>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`proxies = {
  "http": "http://user:pass@proxy_ip:port",
  "https": "http://user:pass@proxy_ip:port"
}
requests.get(url, proxies=proxies)`}
                        </Code>
                      </Box>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">② User-Agent и заголовки</Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`headers = {
  "User-Agent": random.choice(["Mozilla/5.0 (Windows)", "iPhone Mobile Safari"]),
  "Accept-Language": "ru-RU,ru;q=0.9"
}`}
                        </Code>
                      </Box>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">③ Задержки между запросами</Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`import time
time.sleep(random.uniform(5, 15))  # Случайная задержка`}
                        </Code>
                      </Box>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Работа с API */}
              <AccordionItem>
                <AccordionButton className="purple-button-border">
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={FaRobot} color="green.500" />
                      <Text fontWeight="bold">2. Работа с API Wildberries</Text>
                      <Badge colorScheme="orange">Важно</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="purple.600">④ Соблюдайте лимиты API</Text>
                      <List spacing={2} mt={2}>
                        <ListItem>
                          <ListIcon as={WarningIcon} color="orange.500" />
                          WB OpenAPI: Не более 100 запросов/минуту
                        </ListItem>
                        <ListItem>
                          <ListIcon as={InfoIcon} color="blue.500" />
                          Seller API: Проверяйте квоты в документации
                        </ListItem>
                      </List>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑤ Кешируйте данные</Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`import redis
r = redis.Redis(host="localhost", port=6379)

if r.get("product_123"):  # Проверяем кеш
    data = r.get("product_123")
else:
    data = requests.get(wb_api_url).json()
    r.set("product_123", data, ex=3600)  # Кеш на 1 час`}
                        </Code>
                      </Box>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Юридическая защита */}
              <AccordionItem>
                <AccordionButton className="purple-button-border">
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <LockIcon color="orange.500" />
                      <Text fontWeight="bold">3. Юридическая защита</Text>
                      <Badge colorScheme="yellow">Средний риск</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑥ Официальные договоры с клиентами</Text>
                      <Alert status="info" size="sm" mt={2}>
                        <AlertIcon />
                        <Text fontSize="sm">
                          Пропишите: "Сервис не несет ответственности за блокировку аккаунтов WB из-за нарушений правил маркетплейса"
                        </Text>
                      </Alert>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑦ Не парсите контакты и персональные данные</Text>
                      <Alert status="warning" size="sm" mt={2}>
                        <AlertIcon />
                        <Text fontSize="sm">
                          Это нарушает ФЗ-152 "О персональных данных" → риск штрафов
                        </Text>
                      </Alert>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Обход защиты */}
              <AccordionItem>
                <AccordionButton className="purple-button-border">
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={FaEye} color="purple.500" />
                      <Text fontWeight="bold">4. Обход защиты маркетплейсов</Text>
                      <Badge colorScheme="purple">Продвинутый</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑧ Эмуляция поведения человека</Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`from selenium.webdriver.common.action_chains import ActionChains
actions = ActionChains(driver)
actions.move_to_element(element).pause(2).click().perform()  # "Человеческие" клики`}
                        </Code>
                      </Box>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑨ Используйте мобильные API</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        WB слабее защищает m.wildberries.ru
                      </Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`mobile_api = "https://m.wildberries.ru/api/catalog/{id}/detail.aspx"`}
                        </Code>
                      </Box>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑩ Обход капчи</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        Сервисы: Anti-Captcha, 2Captcha (цены от 0,5 ₽/капча)
                      </Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`from python_anticaptcha import AnticaptchaClient
client = AnticaptchaClient("API_KEY")
task = client.create_task(image_url)
captcha_text = task.join()  # Получаем текст капчи`}
                        </Code>
                      </Box>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Резервные каналы */}
              <AccordionItem>
                <AccordionButton className="purple-button-border">
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <RepeatIcon color="blue.500" />
                      <Text fontWeight="bold">5. Резервные каналы и мониторинг</Text>
                      <Badge colorScheme="blue">Критично</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑪ Альтернативные источники данных</Text>
                      <List spacing={2} mt={2}>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Яндекс.Маркет API (через партнерские программы)
                        </ListItem>
                        <ListItem>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          Публичные CSV-выгрузки (прайсы поставщиков)
                        </ListItem>
                      </List>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" color="purple.600">⑫ Мониторинг блокировок</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        Настройте Sentry или Telegram-бота для алертов
                      </Text>
                      <Box bg={codeBg} p={3} borderRadius="md" mt={2}>
                        <Code fontSize="sm">
                          {`if "blocked" in response.text:
    requests.post(f"https://api.telegram.org/botTOKEN/sendMessage?chat_id=123&text=WB API заблокирован!")`}
                        </Code>
                      </Box>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>

        {/* Таблица рисков */}
        <Card className="purple-card-border" bg={cardBg}>
          <CardHeader>
            <Heading size="lg">📊 Таблица рисков блокировки</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer className="purple-table-border">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Правило</Th>
                    <Th>Риск без соблюдения</Th>
                    <Th>Как проверить?</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Прокси + ротация IP</Td>
                    <Td><Badge colorScheme="red">🔴 Высокий</Badge></Td>
                    <Td>Проверять IP на whoer.net</Td>
                  </Tr>
                  <Tr>
                    <Td>Соблюдение лимитов API</Td>
                    <Td><Badge colorScheme="red">🔴 Высокий</Badge></Td>
                    <Td>Логировать запросы</Td>
                  </Tr>
                  <Tr>
                    <Td>Отказ от парсинга контактов</Td>
                    <Td><Badge colorScheme="yellow">🟡 Средний</Badge></Td>
                    <Td>Юридический аудит</Td>
                  </Tr>
                  <Tr>
                    <Td>Кеширование данных</Td>
                    <Td><Badge colorScheme="green">🟢 Низкий</Badge></Td>
                    <Td>Мониторинг дублей запросов</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Что делать при блокировке */}
        <Alert status="warning" className="purple-alert-border">
          <AlertIcon />
          <Box>
            <AlertTitle>🚨 Что делать, если всё же заблокировали?</AlertTitle>
            <AlertDescription>
              <List spacing={1} mt={2}>
                <ListItem>1. Смените инфраструктуру: новые IP, домен, хостинг</ListItem>
                <ListItem>2. Напишите в поддержку WB: "Мы устранили нарушения, просим разблокировать доступ"</ListItem>
                <ListItem>3. Верните деньги клиентам за нерабочие дни (если это прописано в договоре)</ListItem>
              </List>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Container>
  );
}
