import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  useColorModeValue,
  useToast,
  Flex,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Icon,
  Spinner,
  Card,
  CardBody,
  SimpleGrid,
  Divider
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaPlus, FaFileImport, FaShoppingCart, FaRocket, FaCloudUploadAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProductsNew } from '../context/ProductContextNew';
import OzonCardEditor from '../components/ozon/OzonCardEditor';
import OzonCardImportModal from '../components/ozon/OzonCardImportModal';
import { OzonCardData, Product } from '../types/product';
import ProductSelectModal from '../components/product/ProductSelectModal';

/**
 * Страница для создания новой карточки товара Ozon
 */
const CreateOzonCardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { createProduct, updateProduct, loadProductById } = useProductsNew();

  // Состояния
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cardData, setCardData] = useState<OzonCardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Получаем productId из URL параметров, если он есть
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get('productId');

    if (productId) {
      setIsLoadingProduct(true);
      loadProductById(productId)
        .then(product => {
          if (product) {
            setSelectedProduct(product);

            // Создаем новую карточку на основе выбранного товара
            const newCard: OzonCardData = {
              status: 'draft',
              title: product.title,
              description: product.description || '',
              brand: product.brand || '',
              barcode: product.barcode,
              images: product.images.map(img => img.url),
              attributes: [],
              specifications: [],
              categoryId: product.category,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            setCardData(newCard);
            setActiveTab(1); // Переключаемся на вкладку редактирования
          } else {
            toast({
              title: 'Ошибка',
              description: 'Товар не найден',
              status: 'error',
              duration: 5000,
              isClosable: true
            });
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке товара:', error);
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить товар',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        })
        .finally(() => {
          setIsLoadingProduct(false);
        });
    }
  }, [location.search, loadProductById, toast]);

  // Цвета
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const gradientBg = useColorModeValue(
    'linear(to-r, blue.50, purple.50, teal.50)',
    'linear(to-r, blue.900, purple.900, teal.900)'
  );

  // Обработчик выбора товара
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsProductSelectOpen(false);

    // Создаем новую карточку на основе выбранного товара
    const newCard: OzonCardData = {
      status: 'draft',
      title: product.title,
      description: product.description || '',
      brand: product.brand || '',
      barcode: product.barcode,
      images: product.images.map(img => img.url),
      attributes: [],
      specifications: [],
      categoryId: product.category,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCardData(newCard);
    setActiveTab(1); // Переключаемся на вкладку редактирования
  };

  // Обработчик создания новой карточки без товара
  const handleCreateNewCard = () => {
    const newCard: OzonCardData = {
      status: 'draft',
      title: '',
      description: '',
      brand: '',
      images: [],
      attributes: [],
      specifications: [],
      categoryId: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCardData(newCard);
    setActiveTab(1); // Переключаемся на вкладку редактирования
  };

  // Обработчик импорта карточки
  const handleImportCard = (importedCard: OzonCardData) => {
    setCardData(importedCard);
    setIsImportModalOpen(false);
    setActiveTab(1); // Переключаемся на вкладку редактирования
  };

  // Обработчик сохранения карточки
  const handleSaveCard = async (savedCardData: OzonCardData) => {
    setIsLoading(true);

    try {
      if (selectedProduct) {
        // Обновляем существующий товар с новой карточкой
        await updateProduct(selectedProduct.id, {
          ozonCardData: savedCardData
        });

        toast({
          title: 'Карточка сохранена',
          description: 'Карточка товара Ozon успешно сохранена',
          status: 'success',
          duration: 5000,
          isClosable: true
        });

        // Перенаправляем на страницу карточки
        navigate(`/ozon-card/${selectedProduct.id}`);
      } else {
        // Создаем новый товар с карточкой
        const newProduct = await createProduct({
          title: savedCardData.title,
          description: savedCardData.description,
          brand: savedCardData.brand,
          barcode: savedCardData.barcode,
          category: savedCardData.categoryId as any,
          status: 'active' as any,
          price: {
            current: 0,
            costPrice: 0
          },
          stock: {
            available: 0,
            reserved: 0
          },
          images: savedCardData.images.map((url, index) => ({
            id: `img-${index}`,
            url,
            isMain: index === 0,
            sortOrder: index
          })),
          ozonCardData: savedCardData
        });

        if (newProduct) {
          toast({
            title: 'Товар и карточка созданы',
            description: 'Новый товар и карточка Ozon успешно созданы',
            status: 'success',
            duration: 5000,
            isClosable: true
          });

          // Перенаправляем на страницу карточки
          navigate(`/ozon-card/${newProduct.id}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при сохранении карточки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить карточку товара',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик отмены
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box minH="100vh" bgGradient={gradientBg}>
      <Container maxW="container.xl" py={8}>
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/products')}
              _hover={{ color: 'blue.500', textDecoration: 'none' }}
              transition="all 0.2s"
            >
              Товары
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="blue.500" fontWeight="semibold">
              Создание карточки Ozon
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Card bg={cardBgColor} shadow="xl" borderRadius="2xl" mb={8}>
          <CardBody p={8}>
            <VStack spacing={4} align="center" textAlign="center">
              <HStack spacing={4}>
                <Icon as={FaRocket} boxSize={8} color="blue.500" />
                <Heading as="h1" size="xl" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
                  Создание карточки товара Ozon
                </Heading>
                <Badge
                  colorScheme="blue"
                  fontSize="md"
                  p={2}
                  borderRadius="full"
                  boxShadow="md"
                >
                  BETA
                </Badge>
              </HStack>

              <Text color={textColor} fontSize="lg" maxW="2xl">
                Создайте профессиональную карточку товара для публикации на Ozon Marketplace
                с помощью нашего удобного редактора
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {isLoadingProduct ? (
          <Card bg={cardBgColor} shadow="lg" borderRadius="xl">
            <CardBody>
              <Flex justify="center" align="center" minHeight="300px">
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text fontSize="lg" color={textColor}>Загрузка товара...</Text>
                </VStack>
              </Flex>
            </CardBody>
          </Card>
        ) : (
          <Card bg={cardBgColor} shadow="lg" borderRadius="xl" mb={6}>
            <CardBody p={6}>
              <Tabs
                index={activeTab}
                onChange={setActiveTab}
                colorScheme="blue"
                variant="enclosed"
              >
                <TabList
                  borderRadius="lg"
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  borderWidth="1px"
                  borderColor={useColorModeValue('blue.200', 'blue.700')}
                  p={1}
                >
                  <Tab
                    _selected={{
                      bg: 'blue.500',
                      color: 'white',
                      borderRadius: 'lg',
                      shadow: 'md'
                    }}
                    _hover={{
                      bg: useColorModeValue('blue.100', 'blue.800')
                    }}
                    fontWeight="semibold"
                    color={useColorModeValue('blue.600', 'blue.300')}
                    transition="all 0.2s"
                  >
                    Выбор товара
                  </Tab>
                  <Tab
                    isDisabled={!cardData}
                    _selected={{
                      bg: 'blue.500',
                      color: 'white',
                      borderRadius: 'lg',
                      shadow: 'md'
                    }}
                    _hover={{
                      bg: useColorModeValue('blue.100', 'blue.800')
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed'
                    }}
                    fontWeight="semibold"
                    color={useColorModeValue('blue.600', 'blue.300')}
                    transition="all 0.2s"
                  >
                    Редактирование карточки
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel px={0} py={6}>
                    <VStack spacing={8} align="stretch">
                      <Alert
                        status="info"
                        borderRadius="xl"
                        bg={useColorModeValue('blue.50', 'blue.900')}
                        border="1px"
                        borderColor={useColorModeValue('blue.200', 'blue.700')}
                      >
                        <AlertIcon color="blue.500" />
                        <Text color={useColorModeValue('blue.800', 'blue.200')}>
                          Выберите существующий товар для создания карточки Ozon или создайте новую карточку с нуля
                        </Text>
                      </Alert>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Card
                          bg={useColorModeValue('blue.50', 'blue.900')}
                          borderWidth="2px"
                          borderColor={useColorModeValue('blue.200', 'blue.600')}
                          _hover={{
                            borderColor: 'blue.400',
                            transform: 'translateY(-4px)',
                            shadow: 'xl',
                            bg: useColorModeValue('blue.100', 'blue.800')
                          }}
                          transition="all 0.3s ease"
                          cursor="pointer"
                          onClick={() => setIsProductSelectOpen(true)}
                        >
                          <CardBody textAlign="center" p={6}>
                            <VStack spacing={4}>
                              <Box
                                p={3}
                                borderRadius="full"
                                bg={useColorModeValue('blue.100', 'blue.800')}
                              >
                                <Icon as={FaShoppingCart} boxSize={8} color="blue.500" />
                              </Box>
                              <Heading size="md" color={useColorModeValue('blue.600', 'blue.300')}>
                                Выбрать товар
                              </Heading>
                              <Text color={useColorModeValue('blue.500', 'blue.400')} fontSize="sm">
                                Создайте карточку на основе существующего товара из вашего каталога
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card
                          bg={useColorModeValue('teal.50', 'teal.900')}
                          borderWidth="2px"
                          borderColor={useColorModeValue('teal.200', 'teal.600')}
                          _hover={{
                            borderColor: 'teal.400',
                            transform: 'translateY(-4px)',
                            shadow: 'xl',
                            bg: useColorModeValue('teal.100', 'teal.800')
                          }}
                          transition="all 0.3s ease"
                          cursor="pointer"
                          onClick={handleCreateNewCard}
                        >
                          <CardBody textAlign="center" p={6}>
                            <VStack spacing={4}>
                              <Box
                                p={3}
                                borderRadius="full"
                                bg={useColorModeValue('teal.100', 'teal.800')}
                              >
                                <Icon as={FaPlus} boxSize={8} color="teal.500" />
                              </Box>
                              <Heading size="md" color={useColorModeValue('teal.600', 'teal.300')}>
                                Создать новую
                              </Heading>
                              <Text color={useColorModeValue('teal.500', 'teal.400')} fontSize="sm">
                                Создайте карточку товара с нуля, заполнив все необходимые поля
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card
                          bg={useColorModeValue('purple.50', 'purple.900')}
                          borderWidth="2px"
                          borderColor={useColorModeValue('purple.200', 'purple.600')}
                          _hover={{
                            borderColor: 'purple.400',
                            transform: 'translateY(-4px)',
                            shadow: 'xl',
                            bg: useColorModeValue('purple.100', 'purple.800')
                          }}
                          transition="all 0.3s ease"
                          cursor="pointer"
                          onClick={() => setIsImportModalOpen(true)}
                        >
                          <CardBody textAlign="center" p={6}>
                            <VStack spacing={4}>
                              <Box
                                p={3}
                                borderRadius="full"
                                bg={useColorModeValue('purple.100', 'purple.800')}
                              >
                                <Icon as={FaFileImport} boxSize={8} color="purple.500" />
                              </Box>
                              <Heading size="md" color={useColorModeValue('purple.600', 'purple.300')}>
                                Импортировать
                              </Heading>
                              <Text color={useColorModeValue('purple.500', 'purple.400')} fontSize="sm">
                                Загрузите готовую карточку из файла или другого источника
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {selectedProduct && (
                        <Alert
                          status="success"
                          borderRadius="xl"
                          bg={useColorModeValue('green.50', 'green.900')}
                          border="1px"
                          borderColor={useColorModeValue('green.200', 'green.700')}
                        >
                          <AlertIcon color="green.500" />
                          <VStack align="start" spacing={1}>
                            <Text color={useColorModeValue('green.800', 'green.200')} fontWeight="semibold">
                              Товар выбран успешно!
                            </Text>
                            <Text color={useColorModeValue('green.700', 'green.300')}>
                              <strong>{selectedProduct.title}</strong>
                            </Text>
                          </VStack>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>

              <TabPanel>
                {cardData && (
                  <OzonCardEditor
                    cardData={cardData}
                    onSave={handleSaveCard}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                  />
                )}
              </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        )}

        <Divider my={8} />

        <Card
          bg={useColorModeValue('orange.50', 'orange.900')}
          borderColor={useColorModeValue('orange.200', 'orange.700')}
          borderWidth="1px"
          borderRadius="xl"
        >
          <CardBody p={6}>
            <HStack spacing={4} align="start">
              <Icon as={FaCloudUploadAlt} boxSize={6} color="orange.500" mt={1} />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color={useColorModeValue('orange.800', 'orange.200')}>
                  📋 Примечание о бета-версии
                </Text>
                <Text color={useColorModeValue('orange.700', 'orange.300')} fontSize="sm">
                  Функция создания карточек товаров для Ozon находится в бета-версии.
                  В настоящее время данные сохраняются только локально и не отправляются на Ozon.
                  После получения API доступа функция будет полностью интегрирована с платформой Ozon.
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Модальное окно выбора товара */}
        <ProductSelectModal
          isOpen={isProductSelectOpen}
          onClose={() => setIsProductSelectOpen(false)}
          onSelect={handleProductSelect}
        />

        {/* Модальное окно импорта карточки */}
        <OzonCardImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportCard}
        />
      </Container>
    </Box>
  );
};

export default CreateOzonCardPage;
