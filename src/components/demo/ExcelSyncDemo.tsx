import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { FiPlay, FiRefreshCw, FiDatabase, FiTrendingUp } from 'react-icons/fi';
import { useTrackedProductsSync } from '../../services/trackedProductsService';

const ExcelSyncDemo: React.FC = () => {
  const toast = useToast();
  const { notifyCompetitorLinked, notifyPriceChanged, notifyStrategyApplied } = useTrackedProductsSync();

  // Состояния для демо
  const [selectedProductId, setSelectedProductId] = useState('product-1');
  const [competitorName, setCompetitorName] = useState('Конкурент Демо');
  const [competitorPrice, setCompetitorPrice] = useState(1500);
  const [newPrice, setNewPrice] = useState(1450);
  const [oldPrice, setOldPrice] = useState(1500);

  // Демо товары
  const demoProducts = [
    { id: 'product-1', name: 'iPhone 15 Pro 128GB' },
    { id: 'product-2', name: 'Samsung Galaxy S24' },
    { id: 'product-3', name: 'MacBook Air M3' }
  ];

  // Демо добавления конкурента
  const handleAddCompetitorDemo = () => {
    notifyCompetitorLinked(
      selectedProductId,
      {
        id: `demo-comp-${Date.now()}`,
        name: competitorName,
        price: competitorPrice,
        url: 'https://example.com/competitor'
      },
      'ExcelSyncDemo'
    );

    toast({
      title: '🎯 Конкурент добавлен!',
      description: `Данные автоматически отправлены в Excel-таблицу`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  // Демо изменения цены
  const handlePriceChangeDemo = () => {
    notifyPriceChanged(
      selectedProductId,
      oldPrice,
      newPrice,
      'Демо изменение цены',
      'ExcelSyncDemo'
    );

    toast({
      title: '💰 Цена изменена!',
      description: `Изменение автоматически отражено в Excel-таблице`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  // Демо применения стратегии
  const handleStrategyDemo = () => {
    notifyStrategyApplied(
      selectedProductId,
      {
        strategy: {
          id: 'demo-strategy',
          name: 'Агрессивная стратегия',
          type: 'undercut_by_percent',
          parameters: { percentReduction: 5 }
        },
        competitorsCount: 3,
        estimatedPrice: newPrice
      },
      'ExcelSyncDemo'
    );

    toast({
      title: '⚡ Стратегия применена!',
      description: `Стратегия автоматически сохранена в Excel-таблице`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Заголовок */}
        <Card>
          <CardHeader>
            <HStack>
              <FiDatabase size={24} />
              <Heading size="lg">🔄 Демо синхронизации с Excel-таблицей</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Автоматическая синхронизация!</AlertTitle>
                <AlertDescription>
                  Все изменения автоматически попадают в Excel-таблицу отслеживания.
                  Откройте вкладку "📊 Таблица отслеживания" чтобы увидеть результат.
                </AlertDescription>
              </Box>
            </Alert>
          </CardBody>
        </Card>

        {/* Статистика */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat>
            <StatLabel>Синхронизированных товаров</StatLabel>
            <StatNumber>12</StatNumber>
            <StatHelpText>в Excel-таблице</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Связанных конкурентов</StatLabel>
            <StatNumber>47</StatNumber>
            <StatHelpText>автоматически отслеживаются</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Изменений цен</StatLabel>
            <StatNumber>156</StatNumber>
            <StatHelpText>за последние 24 часа</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Демо действия */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Добавление конкурента */}
          <Card>
            <CardHeader>
              <Heading size="md">1️⃣ Добавить конкурента</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {demoProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>

                <Input
                  placeholder="Название конкурента"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                />

                <NumberInput
                  value={competitorPrice}
                  onChange={(_, value) => setCompetitorPrice(value)}
                  min={0}
                >
                  <NumberInputField placeholder="Цена конкурента" />
                </NumberInput>

                <Button
                  leftIcon={<FiPlay />}
                  colorScheme="blue"
                  onClick={handleAddCompetitorDemo}
                  width="full"
                >
                  Добавить конкурента
                </Button>

                <Code fontSize="xs" p={2} borderRadius="md" width="full">
                  notifyCompetitorLinked(productId, competitor)
                </Code>
              </VStack>
            </CardBody>
          </Card>

          {/* Изменение цены */}
          <Card>
            <CardHeader>
              <Heading size="md">2️⃣ Изменить цену</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <NumberInput
                  value={oldPrice}
                  onChange={(_, value) => setOldPrice(value)}
                  min={0}
                >
                  <NumberInputField placeholder="Старая цена" />
                </NumberInput>

                <NumberInput
                  value={newPrice}
                  onChange={(_, value) => setNewPrice(value)}
                  min={0}
                >
                  <NumberInputField placeholder="Новая цена" />
                </NumberInput>

                <HStack width="full">
                  <Text fontSize="sm">Изменение:</Text>
                  <Badge
                    colorScheme={newPrice > oldPrice ? 'red' : 'green'}
                  >
                    {newPrice > oldPrice ? '+' : ''}{newPrice - oldPrice} ₽
                  </Badge>
                </HStack>

                <Button
                  leftIcon={<FiTrendingUp />}
                  colorScheme="green"
                  onClick={handlePriceChangeDemo}
                  width="full"
                >
                  Изменить цену
                </Button>

                <Code fontSize="xs" p={2} borderRadius="md" width="full">
                  notifyPriceChanged(productId, oldPrice, newPrice)
                </Code>
              </VStack>
            </CardBody>
          </Card>

          {/* Применение стратегии */}
          <Card>
            <CardHeader>
              <Heading size="md">3️⃣ Применить стратегию</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Alert status="warning" size="sm" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Стратегия будет применена к выбранному товару
                  </Text>
                </Alert>

                <Box p={3} bg="gray.50" borderRadius="md" width="full">
                  <Text fontSize="sm" fontWeight="bold">Агрессивная стратегия</Text>
                  <Text fontSize="xs" color="gray.600">
                    Снижение на 5% от цены конкурентов
                  </Text>
                </Box>

                <HStack width="full">
                  <Text fontSize="sm">Расчетная цена:</Text>
                  <Badge colorScheme="purple">
                    {newPrice.toLocaleString()} ₽
                  </Badge>
                </HStack>

                <Button
                  leftIcon={<FiRefreshCw />}
                  colorScheme="purple"
                  onClick={handleStrategyDemo}
                  width="full"
                >
                  Применить стратегию
                </Button>

                <Code fontSize="xs" p={2} borderRadius="md" width="full">
                  notifyStrategyApplied(productId, strategy)
                </Code>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Divider />

        {/* Инструкция */}
        <Card>
          <CardHeader>
            <Heading size="md">📋 Как это работает</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="start">
              <Text>
                <strong>1.</strong> Выполните любое из действий выше
              </Text>
              <Text>
                <strong>2.</strong> Перейдите на страницу "📊 Таблица отслеживания"
              </Text>
              <Text>
                <strong>3.</strong> Увидите, как данные автоматически обновились в таблице
              </Text>
              <Text>
                <strong>4.</strong> Экспортируйте данные в Excel файл
              </Text>
              
              <Alert status="success" mt={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Автосохранение включено!</AlertTitle>
                  <AlertDescription>
                    Все изменения автоматически сохраняются и синхронизируются между компонентами
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ExcelSyncDemo;
