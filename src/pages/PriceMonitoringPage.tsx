import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Spinner,
  useDisclosure
} from '@chakra-ui/react';
import { CheckIcon, RepeatIcon, SettingsIcon, TimeIcon } from '@chakra-ui/icons';
import { FaRobot, FaBell, FaHistory, FaCog, FaChartLine, FaClock, FaUsers, FaLightbulb } from 'react-icons/fa';
import { useOzonProducts } from '../context/OzonProductContext';
import AutoPricingRules from '../components/product/AutoPricingRules';
import PriceAlertSettings from '../components/product/PriceAlertSettings';
import MonitoringHistory from '../components/product/MonitoringHistory';
import PriceMonitoringChart from '../components/product/PriceMonitoringChart';
import MonitoringScheduler from '../components/product/MonitoringScheduler';
import BulkAutoPricingModal from '../components/product/BulkAutoPricingModal';
import MonitoringGuide from '../components/product/MonitoringGuide';
import HelpTooltip from '../components/common/HelpTooltip';

/**
 * Страница настройки мониторинга цен
 */
export default function PriceMonitoringPage() {
  // Состояние для настроек мониторинга
  const [monitoringInterval, setMonitoringInterval] = useState<number>(24);
  const [isAutoMonitoringEnabled, setIsAutoMonitoringEnabled] = useState<boolean>(true);
  const [isCompetitorPriceTrackingEnabled, setIsCompetitorPriceTrackingEnabled] = useState<boolean>(true);
  const [isAutoPricingEnabled, setIsAutoPricingEnabled] = useState<boolean>(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Состояние для модального окна массового применения правил
  const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onClose: onBulkModalClose } = useDisclosure();

  // Получаем продукты из контекста
  const { products, isLoading: isProductsLoading, error, updateProduct } = useOzonProducts();

  // Toast для уведомлений
  const toast = useToast();

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Устанавливаем первый продукт как выбранный при загрузке
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Обработчик сохранения настроек мониторинга
  const handleSaveMonitoringSettings = () => {
    // В реальном приложении здесь будет запрос к API для сохранения настроек

    toast({
      title: 'Настройки сохранены',
      description: 'Настройки мониторинга цен сохранены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Обработчик запуска мониторинга
  const handleRunMonitoring = () => {
    setIsLoading(true);

    // В реальном приложении здесь будет запрос к API для запуска мониторинга
    // Для демонстрации используем setTimeout

    setTimeout(() => {
      setIsLoading(false);

      toast({
        title: 'Мониторинг запущен',
        description: 'Мониторинг цен успешно запущен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  };

  // Обработчик сохранения правил автоматического изменения цен
  const handleSaveAutoPricingRules = (rules: any[]) => {
    // В реальном приложении здесь будет запрос к API для сохранения правил
    console.log('Сохранены правила автоматического изменения цен:', rules);

    if (selectedProduct) {
      // Обновляем продукт с новыми правилами
      const updatedProduct = {
        ...selectedProduct,
        autoPricingRules: rules,
        autoPricingEnabled: rules.length > 0
      };

      updateProduct(selectedProduct.id, updatedProduct);
    }
  };

  // Обработчик сохранения настроек уведомлений
  const handleSaveAlerts = (alerts: any[]) => {
    // В реальном приложении здесь будет запрос к API для сохранения уведомлений
    console.log('Сохранены настройки уведомлений:', alerts);

    if (selectedProduct) {
      // Обновляем продукт с новыми уведомлениями
      const updatedProduct = {
        ...selectedProduct,
        priceAlerts: alerts
      };

      updateProduct(selectedProduct.id, updatedProduct);
    }
  };

  // Обработчик сохранения расписания мониторинга
  const handleSaveSchedule = (schedule: any[]) => {
    console.log('Сохранено расписание мониторинга:', schedule);

    if (selectedProduct) {
      // Обновляем продукт с новым расписанием
      const updatedProduct = {
        ...selectedProduct,
        monitoringSchedule: schedule
      };

      updateProduct(selectedProduct.id, updatedProduct);

      toast({
        title: 'Расписание сохранено',
        description: 'Расписание мониторинга цен сохранено',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик массового применения правил
  const handleBulkApplyRules = async (productIds: string[], rule: any) => {
    console.log('Массовое применение правил:', { productIds, rule });

    // Применяем правило к каждому выбранному продукту
    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);

      if (product) {
        // Создаем или обновляем список правил
        const existingRules = product.autoPricingRules || [];
        const updatedRules = [...existingRules, rule];

        // Обновляем продукт
        const updatedProduct = {
          ...product,
          autoPricingRules: updatedRules,
          autoPricingEnabled: true
        };

        await updateProduct(productId, updatedProduct);
      }
    }
  };

  // Получение выбранного продукта
  const selectedProduct = products.find(product => product.id === selectedProductId);

  // Получение связанных конкурентов для выбранного продукта
  const linkedCompetitors = selectedProduct?.linkedCompetitors || [];

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={2}>Мониторинг цен</Heading>
      <Text color={textColor} mb={6}>
        Настройте автоматический мониторинг цен конкурентов и правила изменения цен
      </Text>

      <HStack spacing={4} mb={6}>
        <FormControl width="300px">
          <HStack>
            <FormLabel>Выберите товар</FormLabel>
            <HelpTooltip
              label="Выбор товара для мониторинга"
              description="Выберите товар, для которого вы хотите настроить мониторинг цен конкурентов."
              steps={[
                "Выберите товар из выпадающего списка",
                "После выбора товара вы сможете настроить параметры мониторинга",
                "Для каждого товара можно настроить свои правила и расписание"
              ]}
            />
          </HStack>
          <Select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            isDisabled={isProductsLoading || products.length === 0}
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button
          colorScheme="blue"
          leftIcon={<RepeatIcon />}
          onClick={handleRunMonitoring}
          isLoading={isLoading}
          isDisabled={!selectedProductId}
          mt="auto"
        >
          Запустить мониторинг
        </Button>
      </HStack>

      {isProductsLoading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      ) : !selectedProduct ? (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Text>Выберите товар для настройки мониторинга</Text>
        </Alert>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <HStack>
              <Button
                colorScheme="blue"
                leftIcon={<RepeatIcon />}
                onClick={handleRunMonitoring}
                isLoading={isLoading}
                isDisabled={!selectedProductId}
              >
                Запустить мониторинг
              </Button>
              <HelpTooltip
                label="Запуск мониторинга цен"
                description="Запускает проверку цен конкурентов для выбранного товара."
                steps={[
                  "Система проверит цены всех связанных конкурентов",
                  "Применит настроенные правила автоматического изменения цен",
                  "Отправит уведомления, если настроены соответствующие правила"
                ]}
              />
            </HStack>

            <HStack>
              <Button
                colorScheme="teal"
                leftIcon={<Icon as={FaUsers} />}
                onClick={onBulkModalOpen}
              >
                Массовое применение правил
              </Button>
              <HelpTooltip
                label="Массовое применение правил"
                description="Позволяет применить одно правило автоматического изменения цен к нескольким товарам одновременно."
                steps={[
                  "Настройте правило автоматического изменения цен",
                  "Выберите товары, к которым нужно применить правило",
                  "Нажмите кнопку 'Применить правила'"
                ]}
              />
            </HStack>
          </Flex>

          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>
                <HStack>
                  <Icon as={FaCog} />
                  <Text>Общие настройки</Text>
                  <HelpTooltip
                    label="Общие настройки мониторинга"
                    description="Настройка основных параметров мониторинга цен."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaRobot} />
                  <Text>Автоматическое изменение цен</Text>
                  <HelpTooltip
                    label="Автоматическое изменение цен"
                    description="Настройка правил автоматического изменения цен в зависимости от цен конкурентов."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaBell} />
                  <Text>Уведомления</Text>
                  <HelpTooltip
                    label="Уведомления о ценах"
                    description="Настройка уведомлений об изменениях цен конкурентов."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaClock} />
                  <Text>Расписание</Text>
                  <HelpTooltip
                    label="Расписание мониторинга"
                    description="Настройка расписания автоматического запуска мониторинга цен."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaChartLine} />
                  <Text>Динамика цен</Text>
                  <HelpTooltip
                    label="Динамика цен"
                    description="Визуализация изменений цен товара и конкурентов."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaHistory} />
                  <Text>История мониторинга</Text>
                  <HelpTooltip
                    label="История мониторинга"
                    description="Просмотр истории проверок цен и изменений цен."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaLightbulb} />
                  <Text>Руководство</Text>
                  <HelpTooltip
                    label="Руководство пользователя"
                    description="Подробные инструкции по использованию функций мониторинга цен."
                    placement="bottom"
                  />
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
                  <CardHeader>
                    <Heading size="md">Общие настройки мониторинга</Heading>
                    <Text mt={2} color={textColor}>
                      Настройте параметры автоматического мониторинга цен конкурентов
                    </Text>
                  </CardHeader>

                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <Switch
                          id="auto-monitoring"
                          isChecked={isAutoMonitoringEnabled}
                          onChange={() => setIsAutoMonitoringEnabled(!isAutoMonitoringEnabled)}
                          colorScheme="blue"
                          size="lg"
                        />
                        <FormLabel htmlFor="auto-monitoring" mb="0" ml={3}>
                          <HStack>
                            <Text fontWeight="medium">Автоматический мониторинг цен</Text>
                            <HelpTooltip
                              label="Автоматический мониторинг цен"
                              description="Включение/отключение автоматического мониторинга цен конкурентов."
                              steps={[
                                "Включите эту опцию, чтобы система автоматически проверяла цены конкурентов",
                                "Настройте интервал проверки в часах",
                                "Система будет проверять цены конкурентов с заданным интервалом"
                              ]}
                            />
                          </HStack>
                          <Text fontSize="sm" color={textColor}>
                            Система будет автоматически проверять цены конкурентов с заданным интервалом
                          </Text>
                        </FormLabel>
                      </FormControl>

                      <HStack>
                        <FormControl>
                          <FormLabel>Интервал проверки (часы)</FormLabel>
                          <NumberInput
                            value={monitoringInterval}
                            onChange={(_, value) => setMonitoringInterval(value)}
                            min={1}
                            max={168} // 1 неделя
                            isDisabled={!isAutoMonitoringEnabled}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <Box>
                          <Text fontWeight="medium">Следующая проверка:</Text>
                          <HStack color={isAutoMonitoringEnabled ? 'green.500' : textColor}>
                            <TimeIcon />
                            <Text>{isAutoMonitoringEnabled ? 'Через 2 часа 15 минут' : 'Отключено'}</Text>
                          </HStack>
                        </Box>
                      </HStack>

                      <Divider />

                      <FormControl display="flex" alignItems="center">
                        <Switch
                          id="competitor-tracking"
                          isChecked={isCompetitorPriceTrackingEnabled}
                          onChange={() => setIsCompetitorPriceTrackingEnabled(!isCompetitorPriceTrackingEnabled)}
                          colorScheme="blue"
                          size="lg"
                        />
                        <FormLabel htmlFor="competitor-tracking" mb="0" ml={3}>
                          <Text fontWeight="medium">Отслеживание цен конкурентов</Text>
                          <Text fontSize="sm" color={textColor}>
                            Система будет отслеживать изменения цен связанных конкурентов
                          </Text>
                        </FormLabel>
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <Switch
                          id="auto-pricing"
                          isChecked={isAutoPricingEnabled}
                          onChange={() => setIsAutoPricingEnabled(!isAutoPricingEnabled)}
                          colorScheme="blue"
                          size="lg"
                        />
                        <FormLabel htmlFor="auto-pricing" mb="0" ml={3}>
                          <Text fontWeight="medium">Автоматическое изменение цен</Text>
                          <Text fontSize="sm" color={textColor}>
                            Система будет автоматически изменять цены товаров в соответствии с настроенными правилами
                          </Text>
                        </FormLabel>
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <Switch
                          id="notifications"
                          isChecked={isNotificationsEnabled}
                          onChange={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                          colorScheme="blue"
                          size="lg"
                        />
                        <FormLabel htmlFor="notifications" mb="0" ml={3}>
                          <Text fontWeight="medium">Уведомления об изменениях цен</Text>
                          <Text fontSize="sm" color={textColor}>
                            Система будет отправлять уведомления об изменениях цен конкурентов
                          </Text>
                        </FormLabel>
                      </FormControl>

                      <Divider />

                      <HStack>
                        <Text fontWeight="medium">Связанные конкуренты:</Text>
                        <Badge colorScheme="blue">{linkedCompetitors.length}</Badge>
                      </HStack>

                      {linkedCompetitors.length === 0 ? (
                        <Alert status="warning">
                          <AlertIcon />
                          <Text>У выбранного товара нет связанных конкурентов. Добавьте конкурентов для мониторинга цен.</Text>
                        </Alert>
                      ) : (
                        <Text fontSize="sm" color={textColor}>
                          Мониторинг настроен для {linkedCompetitors.length} конкурентов. Вы можете добавить или удалить конкурентов на странице связанных товаров.
                        </Text>
                      )}

                      <Flex justify="flex-end">
                        <Button
                          colorScheme="green"
                          leftIcon={<CheckIcon />}
                          onClick={handleSaveMonitoringSettings}
                        >
                          Сохранить настройки
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0}>
                <AutoPricingRules
                  product={selectedProduct}
                  onSaveRules={handleSaveAutoPricingRules}
                />
              </TabPanel>

              <TabPanel px={0}>
                <PriceAlertSettings
                  product={selectedProduct}
                  onSaveAlerts={handleSaveAlerts}
                />
              </TabPanel>

              <TabPanel px={0}>
                <MonitoringScheduler
                  product={selectedProduct}
                  onSaveSchedule={handleSaveSchedule}
                  onRunMonitoring={handleRunMonitoring}
                />
              </TabPanel>

              <TabPanel px={0}>
                <PriceMonitoringChart
                  product={selectedProduct}
                  competitors={linkedCompetitors}
                  onRunMonitoring={handleRunMonitoring}
                />
              </TabPanel>

              <TabPanel px={0}>
                <MonitoringHistory
                  product={selectedProduct}
                  competitors={linkedCompetitors}
                  onRunMonitoring={handleRunMonitoring}
                />
              </TabPanel>

              <TabPanel px={0}>
                <MonitoringGuide />
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Модальное окно для массового применения правил */}
          <BulkAutoPricingModal
            isOpen={isBulkModalOpen}
            onClose={onBulkModalClose}
            products={products}
            onApplyRules={handleBulkApplyRules}
          />
        </>
      )}
    </Container>
  );
}
