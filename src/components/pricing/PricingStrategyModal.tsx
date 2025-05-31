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
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Box,
  Text,
  Flex,
  Divider,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Tooltip,
  IconButton,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  useToast
} from '@chakra-ui/react';
import { InfoIcon, QuestionIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { FiZap, FiShield } from 'react-icons/fi';
import { Product, CompetitorPrice } from '../../types/product';
import { formatPrice } from '../../utils/formatters';
import { automationService } from '../../services/automationService';

// Типы стратегий ценообразования
export enum PricingStrategyType {
  COMPETITOR_BASED = 'COMPETITOR_BASED',
  MARGIN_BASED = 'MARGIN_BASED',
  DYNAMIC = 'DYNAMIC',
  CUSTOM = 'CUSTOM'
}

// Интерфейс для настроек стратегии
export interface PricingStrategySettings {
  type: PricingStrategyType;
  name: string;
  description?: string;

  // Для стратегии на основе конкурентов
  competitorId?: string;
  priceDifference?: number; // в процентах
  priceDifferenceType?: 'percentage' | 'absolute';

  // Для стратегии на основе маржи
  targetMargin?: number; // в процентах

  // Для динамической стратегии
  minPrice?: number;
  maxPrice?: number;
  adjustmentInterval?: number; // в часах

  // Общие настройки
  enableAutoUpdate?: boolean;
  updateFrequency?: number; // в часах

  // Дополнительные настройки
  ignoreOutOfStock?: boolean;
  roundPrices?: boolean;
  roundingPrecision?: number;
}

interface PricingStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onApplyStrategy: (productId: string, strategy: PricingStrategySettings) => void;
  existingStrategy?: PricingStrategySettings;
}

const PricingStrategyModal: React.FC<PricingStrategyModalProps> = ({
  isOpen,
  onClose,
  product,
  onApplyStrategy,
  existingStrategy
}) => {
  // Состояние для настроек стратегии
  const [strategy, setStrategy] = useState<PricingStrategySettings>({
    type: PricingStrategyType.COMPETITOR_BASED,
    name: 'Новая стратегия',
    enableAutoUpdate: true,
    updateFrequency: 24,
    roundPrices: true,
    roundingPrecision: 0,
    ...existingStrategy
  });

  // Состояние для предпросмотра цены
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);

  // Состояние для автоматизации
  const [ozonAutoUpdate, setOzonAutoUpdate] = useState(false);
  const [automationSettings, setAutomationSettings] = useState<any>(null);

  const toast = useToast();

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Загрузка настроек автоматизации при открытии модального окна
  useEffect(() => {
    if (product && isOpen) {
      const settings = automationService.getAutomationSettings(product.id);
      setAutomationSettings(settings);
      setOzonAutoUpdate(settings.ozonAutoUpdate);
    }
  }, [product, isOpen]);

  // Обновление предпросмотра цены при изменении стратегии
  useEffect(() => {
    if (!product) return;

    // Расчет предварительной цены на основе выбранной стратегии
    let newPrice = product.price.current;

    switch (strategy.type) {
      case PricingStrategyType.COMPETITOR_BASED:
        if (strategy.competitorId && product.price.competitorPrices) {
          const competitor = product.price.competitorPrices.find(
            c => c.id === strategy.competitorId
          );

          if (competitor) {
            if (strategy.priceDifferenceType === 'percentage' && strategy.priceDifference) {
              newPrice = competitor.price * (1 + strategy.priceDifference / 100);
            } else if (strategy.priceDifferenceType === 'absolute' && strategy.priceDifference) {
              newPrice = competitor.price + strategy.priceDifference;
            }
          }
        }
        break;

      case PricingStrategyType.MARGIN_BASED:
        if (product.price.costPrice && strategy.targetMargin) {
          newPrice = product.price.costPrice / (1 - strategy.targetMargin / 100);
        }
        break;

      case PricingStrategyType.DYNAMIC:
        // Для демонстрации просто устанавливаем среднюю цену между мин. и макс.
        if (strategy.minPrice !== undefined && strategy.maxPrice !== undefined) {
          newPrice = (strategy.minPrice + strategy.maxPrice) / 2;
        }
        break;

      default:
        break;
    }

    // Округление цены, если включено
    if (strategy.roundPrices && strategy.roundingPrecision !== undefined) {
      const multiplier = Math.pow(10, strategy.roundingPrecision);
      newPrice = Math.round(newPrice / multiplier) * multiplier;
    }

    setPreviewPrice(newPrice);
  }, [product, strategy]);

  // Обработчик изменения настроек стратегии
  const handleStrategyChange = <K extends keyof PricingStrategySettings>(
    key: K,
    value: PricingStrategySettings[K]
  ) => {
    setStrategy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Обработчик переключения автоматизации Ozon
  const handleOzonAutoUpdateToggle = (enabled: boolean) => {
    if (product) {
      automationService.toggleOzonAutoUpdate(product.id, enabled);
      setOzonAutoUpdate(enabled);

      toast({
        title: enabled ? 'Автообновление включено' : 'Автообновление отключено',
        description: enabled
          ? 'Цены будут изменяться на Ozon автоматически без подтверждения'
          : 'Изменения цен потребуют ручного подтверждения',
        status: enabled ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик применения стратегии
  const handleApplyStrategy = () => {
    if (product) {
      onApplyStrategy(product.id, strategy);

      // Если включено автообновление, показываем дополнительное уведомление
      if (ozonAutoUpdate) {
        toast({
          title: 'Стратегия применена с автообновлением',
          description: 'Цены будут автоматически изменяться на Ozon согласно выбранной стратегии',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    }
  };

  // Если товар не выбран, не отображаем модальное окно
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text>Настройка стратегии ценообразования</Text>
            <Badge colorScheme="blue" fontSize="0.8em" p={1}>
              {product.title}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Основные настройки стратегии */}
            <Box>
              <FormControl mb={4}>
                <FormLabel>Название стратегии</FormLabel>
                <Input
                  value={strategy.name}
                  onChange={(e) => handleStrategyChange('name', e.target.value)}
                  placeholder="Введите название стратегии"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Тип стратегии</FormLabel>
                <Select
                  value={strategy.type}
                  onChange={(e) => handleStrategyChange('type', e.target.value as PricingStrategyType)}
                >
                  <option value={PricingStrategyType.COMPETITOR_BASED}>На основе конкурентов</option>
                  <option value={PricingStrategyType.MARGIN_BASED}>На основе маржи</option>
                  <option value={PricingStrategyType.DYNAMIC}>Динамическая</option>
                  <option value={PricingStrategyType.CUSTOM}>Пользовательская</option>
                </Select>
                <FormHelperText>
                  Выберите тип стратегии ценообразования для вашего товара
                </FormHelperText>
              </FormControl>
            </Box>

            <Divider />

            {/* Настройки в зависимости от типа стратегии */}
            <Box>
              {strategy.type === PricingStrategyType.COMPETITOR_BASED && (
                <>
                  <Text fontSize="lg" fontWeight="medium" mb={4}>
                    Настройки стратегии на основе конкурентов
                  </Text>

                  <FormControl mb={4}>
                    <FormLabel>Выберите конкурента</FormLabel>
                    <Select
                      value={strategy.competitorId || ''}
                      onChange={(e) => handleStrategyChange('competitorId', e.target.value)}
                    >
                      <option value="">Выберите конкурента</option>
                      {product.price.competitorPrices?.map(competitor => (
                        <option key={competitor.id} value={competitor.id}>
                          {competitor.name} - {formatPrice(competitor.price)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>Тип разницы в цене</FormLabel>
                    <RadioGroup
                      value={strategy.priceDifferenceType || 'percentage'}
                      onChange={(value) => handleStrategyChange('priceDifferenceType', value as 'percentage' | 'absolute')}
                    >
                      <Stack direction="row">
                        <Radio value="percentage">Процент (%)</Radio>
                        <Radio value="absolute">Абсолютное значение (₽)</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>
                      {strategy.priceDifferenceType === 'percentage'
                        ? 'Разница в процентах (%)'
                        : 'Разница в рублях (₽)'}
                    </FormLabel>
                    <Flex>
                      <NumberInput
                        value={strategy.priceDifference || 0}
                        onChange={(_, value) => handleStrategyChange('priceDifference', value)}
                        min={-50}
                        max={50}
                        step={1}
                        mr={4}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>

                      <Slider
                        flex="1"
                        min={-50}
                        max={50}
                        step={1}
                        value={strategy.priceDifference || 0}
                        onChange={(value) => handleStrategyChange('priceDifference', value)}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Flex>
                    <FormHelperText>
                      {strategy.priceDifferenceType === 'percentage'
                        ? 'Положительное значение означает, что ваша цена будет выше цены конкурента, отрицательное - ниже'
                        : 'Положительное значение добавляется к цене конкурента, отрицательное - вычитается'}
                    </FormHelperText>
                  </FormControl>
                </>
              )}

              {strategy.type === PricingStrategyType.MARGIN_BASED && (
                <>
                  <Text fontSize="lg" fontWeight="medium" mb={4}>
                    Настройки стратегии на основе маржи
                  </Text>

                  <FormControl mb={4}>
                    <FormLabel>Целевая маржа (%)</FormLabel>
                    <Flex>
                      <NumberInput
                        value={strategy.targetMargin || 30}
                        onChange={(_, value) => handleStrategyChange('targetMargin', value)}
                        min={0}
                        max={100}
                        step={1}
                        mr={4}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>

                      <Slider
                        flex="1"
                        min={0}
                        max={100}
                        step={1}
                        value={strategy.targetMargin || 30}
                        onChange={(value) => handleStrategyChange('targetMargin', value)}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Flex>
                    <FormHelperText>
                      Установите целевую маржу для автоматического расчета цены на основе себестоимости
                    </FormHelperText>
                  </FormControl>

                  {!product.price.costPrice && (
                    <Alert status="warning" mb={4}>
                      <AlertIcon />
                      <AlertDescription>
                        Для этого товара не указана себестоимость. Пожалуйста, добавьте себестоимость для корректной работы стратегии.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {strategy.type === PricingStrategyType.DYNAMIC && (
                <>
                  <Text fontSize="lg" fontWeight="medium" mb={4}>
                    Настройки динамической стратегии
                  </Text>

                  <HStack spacing={4} mb={4}>
                    <FormControl>
                      <FormLabel>Минимальная цена (₽)</FormLabel>
                      <NumberInput
                        value={strategy.minPrice || product.price.min || 0}
                        onChange={(_, value) => handleStrategyChange('minPrice', value)}
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Максимальная цена (₽)</FormLabel>
                      <NumberInput
                        value={strategy.maxPrice || product.price.max || product.price.current * 1.5}
                        onChange={(_, value) => handleStrategyChange('maxPrice', value)}
                        min={strategy.minPrice || 0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <FormControl mb={4}>
                    <FormLabel>Интервал корректировки (часы)</FormLabel>
                    <NumberInput
                      value={strategy.adjustmentInterval || 6}
                      onChange={(_, value) => handleStrategyChange('adjustmentInterval', value)}
                      min={1}
                      max={24}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Как часто система будет автоматически корректировать цену в пределах указанного диапазона
                    </FormHelperText>
                  </FormControl>
                </>
              )}

              {strategy.type === PricingStrategyType.CUSTOM && (
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Пользовательская стратегия</AlertTitle>
                    <AlertDescription>
                      Для настройки пользовательской стратегии обратитесь к администратору системы.
                      Пользовательские стратегии позволяют создавать сложные правила ценообразования
                      с учетом множества факторов.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Общие настройки */}
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Общие настройки
              </Text>

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="auto-update" mb="0">
                  Автоматическое обновление
                </FormLabel>
                <Switch
                  id="auto-update"
                  isChecked={strategy.enableAutoUpdate}
                  onChange={(e) => handleStrategyChange('enableAutoUpdate', e.target.checked)}
                />
              </FormControl>

              {strategy.enableAutoUpdate && (
                <FormControl mb={4}>
                  <FormLabel>Частота обновления (часы)</FormLabel>
                  <NumberInput
                    value={strategy.updateFrequency || 24}
                    onChange={(_, value) => handleStrategyChange('updateFrequency', value)}
                    min={1}
                    max={168}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    Как часто система будет проверять и обновлять цену товара
                  </FormHelperText>
                </FormControl>
              )}

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="round-prices" mb="0">
                  Округлять цены
                </FormLabel>
                <Switch
                  id="round-prices"
                  isChecked={strategy.roundPrices}
                  onChange={(e) => handleStrategyChange('roundPrices', e.target.checked)}
                />
              </FormControl>

              {strategy.roundPrices && (
                <FormControl mb={4}>
                  <FormLabel>Точность округления</FormLabel>
                  <Select
                    value={strategy.roundingPrecision}
                    onChange={(e) => handleStrategyChange('roundingPrecision', parseInt(e.target.value))}
                  >
                    <option value="0">До целых (1234 ₽)</option>
                    <option value="-1">До десятков (1230 ₽)</option>
                    <option value="-2">До сотен (1200 ₽)</option>
                    <option value="1">До десятых (1234.5 ₽)</option>
                  </Select>
                </FormControl>
              )}

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="ignore-out-of-stock" mb="0">
                  Игнорировать товары не в наличии
                </FormLabel>
                <Switch
                  id="ignore-out-of-stock"
                  isChecked={strategy.ignoreOutOfStock}
                  onChange={(e) => handleStrategyChange('ignoreOutOfStock', e.target.checked)}
                />
              </FormControl>
            </Box>

            <Divider />

            {/* Автоматизация Ozon */}
            <Box>
              <HStack mb={4}>
                <FiZap />
                <Text fontSize="lg" fontWeight="medium">
                  🚀 Автоматизация Ozon
                </Text>
                <Badge colorScheme="green">24/7</Badge>
              </HStack>

              <Alert status={ozonAutoUpdate ? 'success' : 'warning'} mb={4} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">
                    {ozonAutoUpdate ? 'Автообновление активно' : 'Автообновление отключено'}
                  </AlertTitle>
                  <AlertDescription fontSize="xs">
                    {ozonAutoUpdate
                      ? 'Цены будут изменяться на Ozon автоматически без подтверждения'
                      : 'Все изменения цен потребуют ручного подтверждения'
                    }
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="ozon-auto-update" mb="0" flex="1">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <FiShield />
                      <Text fontWeight="semibold">Изменять цены на Ozon автоматически</Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      При включении цены будут обновляться без вашего участия согласно стратегии
                    </Text>
                  </VStack>
                </FormLabel>
                <Switch
                  id="ozon-auto-update"
                  size="lg"
                  isChecked={ozonAutoUpdate}
                  onChange={(e) => handleOzonAutoUpdateToggle(e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>

              {ozonAutoUpdate && (
                <Alert status="info" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    <strong>Внимание:</strong> При включенном автообновлении система будет изменять цены
                    на Ozon без вашего подтверждения. 24/7 мониторинг отслеживает конкурентов каждые 5 минут.
                  </AlertDescription>
                </Alert>
              )}

              <Text fontSize="sm" color={textColor}>
                💡 <strong>24/7 мониторинг всегда активен</strong> - система отслеживает цены конкурентов
                круглосуточно. Автообновление определяет, будут ли цены изменяться автоматически.
              </Text>
            </Box>

            <Divider />

            {/* Предпросмотр результата */}
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              bg={useColorModeValue('gray.50', 'gray.700')}
            >
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Предпросмотр результата
              </Text>

              <Flex justify="space-between" align="center">
                <Box>
                  <Text color={textColor}>Текущая цена:</Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {formatPrice(product.price.current)}
                  </Text>
                </Box>

                <Box textAlign="center">
                  <Text color={textColor}>Изменение:</Text>
                  {previewPrice !== null && (
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      color={previewPrice > product.price.current ? 'green.500' :
                             previewPrice < product.price.current ? 'red.500' : 'gray.500'}
                    >
                      {previewPrice > product.price.current ? '+' : ''}
                      {formatPrice(previewPrice - product.price.current)}
                      ({((previewPrice / product.price.current - 1) * 100).toFixed(1)}%)
                    </Text>
                  )}
                </Box>

                <Box textAlign="right">
                  <Text color={textColor}>Новая цена:</Text>
                  {previewPrice !== null ? (
                    <Text fontSize="xl" fontWeight="bold" color="blue.500">
                      {formatPrice(previewPrice)}
                    </Text>
                  ) : (
                    <Text fontSize="xl" fontWeight="bold" color="gray.500">
                      —
                    </Text>
                  )}
                </Box>
              </Flex>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button
            colorScheme={ozonAutoUpdate ? "green" : "blue"}
            onClick={handleApplyStrategy}
            leftIcon={ozonAutoUpdate ? <FiZap /> : <CheckIcon />}
          >
            {ozonAutoUpdate ? 'Применить с автообновлением' : 'Применить стратегию'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PricingStrategyModal;
