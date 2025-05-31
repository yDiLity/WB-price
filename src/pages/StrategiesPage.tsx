import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  useBreakpointValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import StrategyCard from '../components/strategy/StrategyCard';
import StrategyTemplateSelector from '../components/strategy/StrategyTemplateSelector';
import StrategyConfigurationForm from '../components/strategy/StrategyConfigurationForm';
import {
  PricingStrategy,
  StrategyTemplate,
  StrategyStatus,
  strategyTemplates,
  Competitor
} from '../types/strategy';

export default function StrategiesPage() {
  // Состояния
  const [strategies, setStrategies] = useState<PricingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [displayStrategies, setDisplayStrategies] = useState<PricingStrategy[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Модальные окна
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Цвета для светлой/темной темы
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Получаем количество колонок в зависимости от размера экрана
  const columnCount = useBreakpointValue({ base: 1, md: 2, lg: 3 }) || 1;

  // Загрузка стратегий при монтировании компонента
  useEffect(() => {
    loadStrategies();
  }, []);

  // Загрузка стратегий
  const loadStrategies = async () => {
    setIsLoading(true);

    try {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем тестовые данные
      setTimeout(() => {
        setStrategies([]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading strategies:', error);
      setIsLoading(false);
    }
  };

  // Тестовые данные о конкурентах
  const competitors: Competitor[] = [
    { id: 'comp-1', name: 'Конкурент 1' },
    { id: 'comp-2', name: 'Конкурент 2' },
    { id: 'comp-3', name: 'Конкурент 3' },
    { id: 'comp-4', name: 'Конкурент 4' },
    { id: 'comp-5', name: 'Конкурент 5' }
  ];

  // Фильтруем и сортируем стратегии при изменении поиска или сортировки
  useEffect(() => {
    let result = [...strategies];

    // Применяем поиск
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(strategy =>
        strategy.name.toLowerCase().includes(lowerSearchTerm) ||
        strategy.type.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Применяем сортировку
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setDisplayStrategies(result);
  }, [strategies, searchTerm, sortBy]);

  // Обработчик выбора шаблона стратегии
  const handleSelectTemplate = (template: StrategyTemplate) => {
    setSelectedTemplate(template);
    setActiveTab(1); // Переключаемся на вкладку настройки
  };

  // Обработчик сохранения стратегии
  const handleSaveStrategy = (strategy: PricingStrategy) => {
    setStrategies(prev => [...prev, strategy]);

    toast({
      title: 'Стратегия создана',
      description: `Стратегия "${strategy.name}" успешно создана`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    // Закрываем модальное окно и сбрасываем состояние
    onClose();
    setSelectedTemplate(null);
    setActiveTab(0);
  };

  // Обработчик отмены создания стратегии
  const handleCancelStrategy = () => {
    setSelectedTemplate(null);
    setActiveTab(0);
    onClose();
  };

  // Обработчики для стратегий
  const handleToggleStatus = (strategyId: string, newStatus: StrategyStatus) => {
    setStrategies(prev =>
      prev.map(strategy =>
        strategy.id === strategyId
          ? { ...strategy, status: newStatus, updatedAt: new Date() }
          : strategy
      )
    );

    toast({
      title: 'Статус изменен',
      description: `Статус стратегии изменен на "${newStatus === StrategyStatus.ACTIVE ? 'Активна' : newStatus === StrategyStatus.PAUSED ? 'Приостановлена' : 'Черновик'}"`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditStrategy = (strategy: PricingStrategy) => {
    // В реальном приложении здесь будет открытие модального окна с формой редактирования
    console.log('Редактирование стратегии:', strategy);

    toast({
      title: 'Редактирование',
      description: `Редактирование стратегии "${strategy.name}"`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteStrategy = (strategyId: string) => {
    setStrategies(prev => prev.filter(strategy => strategy.id !== strategyId));

    toast({
      title: 'Стратегия удалена',
      description: 'Стратегия успешно удалена',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDuplicateStrategy = (strategy: PricingStrategy) => {
    const newStrategy: PricingStrategy = {
      ...strategy,
      id: `strategy-${Date.now()}`,
      name: `${strategy.name} (копия)`,
      status: StrategyStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setStrategies(prev => [...prev, newStrategy]);

    toast({
      title: 'Стратегия дублирована',
      description: `Создана копия стратегии "${strategy.name}"`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Стратегии ценообразования</Heading>

      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        mb={6}
        gap={4}
      >
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Поиск стратегий..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Flex gap={4}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            width={{ base: '100%', md: '200px' }}
          >
            <option value="name">По названию</option>
            <option value="type">По типу</option>
            <option value="date_asc">По дате (сначала старые)</option>
            <option value="date_desc">По дате (сначала новые)</option>
            <option value="status">По статусу</option>
          </Select>

          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={onOpen}
          >
            Создать стратегию
          </Button>
        </Flex>
      </Flex>

      <Text fontSize="lg" fontWeight="medium" mb={4}>
        {isLoading
          ? 'Загрузка стратегий...'
          : `Найдено стратегий: ${displayStrategies.length}`}
      </Text>

      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : displayStrategies.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>
            Стратегии не найдены. Создайте новую стратегию ценообразования.
          </Text>
        </Alert>
      ) : (
        <SimpleGrid columns={columnCount} spacing={4}>
          {displayStrategies.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEdit={handleEditStrategy}
              onDelete={handleDeleteStrategy}
              onDuplicate={handleDuplicateStrategy}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Модальное окно для создания новой стратегии */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancelStrategy}
        size="5xl"
        scrollBehavior="inside"
        motionPreset="slideInBottom"
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(5px)"
        />
        <ModalContent
          borderRadius="xl"
          boxShadow="xl"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="8px"
            bg="blue.500"
          />
          <ModalHeader
            pt={6}
            pb={4}
            fontSize="2xl"
            fontWeight="bold"
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.100', 'gray.700')}
          >
            Создание новой стратегии ценообразования
          </ModalHeader>
          <ModalCloseButton size="lg" top="3" right="3" />
          <ModalBody p={0}>
            <Tabs
              index={activeTab}
              onChange={setActiveTab}
              colorScheme="blue"
              variant="enclosed"
              isFitted
            >
              <TabList
                bg={useColorModeValue('gray.50', 'gray.800')}
                borderBottomWidth="1px"
                borderBottomColor={useColorModeValue('gray.100', 'gray.700')}
                px={4}
              >
                <Tab
                  fontWeight="medium"
                  _selected={{
                    color: 'blue.500',
                    borderBottomColor: 'blue.500',
                    fontWeight: 'bold'
                  }}
                  py={4}
                >
                  <Flex align="center">
                    <Box
                      mr={2}
                      p={1}
                      borderRadius="full"
                      bg={activeTab === 0 ? 'blue.100' : 'gray.100'}
                      color={activeTab === 0 ? 'blue.700' : 'gray.500'}
                      fontWeight="bold"
                      width="24px"
                      height="24px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      1
                    </Box>
                    Выбор шаблона
                  </Flex>
                </Tab>
                <Tab
                  isDisabled={!selectedTemplate}
                  fontWeight="medium"
                  _selected={{
                    color: 'blue.500',
                    borderBottomColor: 'blue.500',
                    fontWeight: 'bold'
                  }}
                  py={4}
                >
                  <Flex align="center">
                    <Box
                      mr={2}
                      p={1}
                      borderRadius="full"
                      bg={activeTab === 1 ? 'blue.100' : 'gray.100'}
                      color={activeTab === 1 ? 'blue.700' : 'gray.500'}
                      fontWeight="bold"
                      width="24px"
                      height="24px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      2
                    </Box>
                    Настройка параметров
                  </Flex>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} py={0}>
                  <StrategyTemplateSelector
                    templates={strategyTemplates}
                    onSelectTemplate={handleSelectTemplate}
                  />
                </TabPanel>

                <TabPanel px={6} py={6}>
                  {selectedTemplate && (
                    <StrategyConfigurationForm
                      template={selectedTemplate}
                      competitors={competitors}
                      onSaveStrategy={handleSaveStrategy}
                      onCancel={handleCancelStrategy}
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          {activeTab === 0 && (
            <ModalFooter
              borderTopWidth="1px"
              borderTopColor={useColorModeValue('gray.100', 'gray.700')}
              py={4}
            >
              <Button
                variant="outline"
                mr={3}
                onClick={handleCancelStrategy}
                size="lg"
                borderRadius="lg"
              >
                Отмена
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => selectedTemplate && setActiveTab(1)}
                isDisabled={!selectedTemplate}
                size="lg"
                borderRadius="lg"
                rightIcon={<Box as="span" fontSize="xl">→</Box>}
              >
                Далее
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
}
