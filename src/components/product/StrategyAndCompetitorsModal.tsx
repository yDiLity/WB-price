import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react';
import { ChevronRightIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { Product, CompetitorProduct } from '../../types/product';
import { PricingStrategy } from './StrategySelectionModal';

// Импортируем компоненты для выбора стратегии и связывания с конкурентами
import StrategySelection from './StrategySelection';
import CompetitorLinking from './CompetitorLinking';

interface StrategyAndCompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (product: Product, competitors: CompetitorProduct[], strategy: PricingStrategy) => void;
}

/**
 * Модальное окно для выбора стратегии и связывания с конкурентами
 */
export default function StrategyAndCompetitorsModal({
  isOpen,
  onClose,
  product,
  onSave
}: StrategyAndCompetitorsModalProps) {
  // Состояние для выбранной стратегии
  const [selectedStrategy, setSelectedStrategy] = useState<PricingStrategy | null>(null);
  
  // Состояние для выбранных конкурентов
  const [selectedCompetitors, setSelectedCompetitors] = useState<CompetitorProduct[]>([]);
  
  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Состояние для блокировки вкладки конкурентов
  const [isCompetitorsTabDisabled, setIsCompetitorsTabDisabled] = useState<boolean>(true);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Toast для уведомлений
  const toast = useToast();
  
  // Сбрасываем состояние при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setSelectedStrategy(null);
      setSelectedCompetitors([]);
      setActiveTab(0);
      setIsCompetitorsTabDisabled(true);
    }
  }, [isOpen]);
  
  // Обработчик выбора стратегии
  const handleStrategySelect = (strategy: PricingStrategy) => {
    setSelectedStrategy(strategy);
    setIsCompetitorsTabDisabled(false);
    
    // Показываем уведомление
    toast({
      title: 'Стратегия выбрана',
      description: `Стратегия "${strategy.name}" выбрана. Теперь вы можете связать товар с конкурентами.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Переходим на вкладку связывания с конкурентами
    setTimeout(() => {
      setActiveTab(1);
    }, 500);
  };
  
  // Обработчик выбора конкурентов
  const handleCompetitorsSelect = (competitors: CompetitorProduct[]) => {
    setSelectedCompetitors(competitors);
  };
  
  // Обработчик сохранения
  const handleSave = () => {
    if (!selectedStrategy) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо выбрать стратегию ценообразования',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onSave(product, selectedCompetitors, selectedStrategy);
    onClose();
  };
  
  // Обработчик изменения вкладки
  const handleTabChange = (index: number) => {
    if (index === 1 && isCompetitorsTabDisabled) {
      toast({
        title: 'Сначала выберите стратегию',
        description: 'Перед связыванием с конкурентами необходимо выбрать стратегию ценообразования',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setActiveTab(index);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg={headerBg} borderTopRadius="md">
          <Flex justify="space-between" align="center">
            <Text>Стратегия и связывание с конкурентами</Text>
            <Badge colorScheme="blue" fontSize="md" px={2} py={1} borderRadius="md">
              {product.title}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          <Tabs index={activeTab} onChange={handleTabChange} variant="enclosed" colorScheme="blue">
            <TabList bg={headerBg} px={4} pt={2}>
              <Tab>1. Выбор стратегии</Tab>
              <Tab isDisabled={isCompetitorsTabDisabled}>2. Связывание с конкурентами</Tab>
            </TabList>
            
            <TabPanels>
              {/* Вкладка выбора стратегии */}
              <TabPanel p={0}>
                <Box p={4}>
                  <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Выберите стратегию ценообразования для товара
                  </Text>
                  
                  <StrategySelection 
                    product={product} 
                    onSelectStrategy={handleStrategySelect} 
                  />
                </Box>
              </TabPanel>
              
              {/* Вкладка связывания с конкурентами */}
              <TabPanel p={0}>
                {isCompetitorsTabDisabled ? (
                  <Alert status="warning" m={4}>
                    <AlertIcon />
                    <AlertTitle>Сначала выберите стратегию!</AlertTitle>
                    <AlertDescription>
                      Перед связыванием с конкурентами необходимо выбрать стратегию ценообразования
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Box p={4}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontSize="lg" fontWeight="bold">
                        Связывание товара с конкурентами
                      </Text>
                      
                      {selectedStrategy && (
                        <Badge colorScheme="green" p={2} borderRadius="md">
                          <Flex align="center" gap={2}>
                            <InfoIcon />
                            <Text>Выбрана стратегия: {selectedStrategy.name}</Text>
                          </Flex>
                        </Badge>
                      )}
                    </Flex>
                    
                    <CompetitorLinking 
                      product={product} 
                      onSelectCompetitors={handleCompetitorsSelect} 
                      initialCompetitors={product.linkedCompetitors || []}
                    />
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Отмена
          </Button>
          
          <Button 
            colorScheme="blue" 
            onClick={handleSave}
            isDisabled={!selectedStrategy || selectedCompetitors.length === 0}
          >
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
