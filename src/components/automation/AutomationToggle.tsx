import React, { useState, useEffect } from 'react';
import {
  Box,
  Switch,
  FormControl,
  FormLabel,
  Text,
  Badge,
  HStack,
  VStack,
  Tooltip,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiZap, FiShield } from 'react-icons/fi';
import { automationService } from '../../services/automationService';
import { AutomationSettings } from '../../types/automation';

interface AutomationToggleProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
  compact?: boolean; // Компактный режим для отображения в списке товаров
}

export const AutomationToggle: React.FC<AutomationToggleProps> = ({
  productId,
  productTitle,
  currentPrice,
  compact = false,
}) => {
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'white');
  const helperTextColor = useColorModeValue('gray.500', 'gray.200');
  const successBg = useColorModeValue('green.50', 'green.900');
  const successBorder = useColorModeValue('green.400', 'green.500');
  const successText = useColorModeValue('green.700', 'green.200');

  useEffect(() => {
    loadSettings();
  }, [productId]);

  const loadSettings = () => {
    try {
      const currentSettings = automationService.getAutomationSettings(productId);
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading automation settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (enabled: boolean) => {
    try {
      automationService.toggleOzonAutoUpdate(productId, enabled);
      loadSettings(); // Перезагружаем настройки

      toast({
        title: enabled ? '🚀 Автообновление включено' : '⏸️ Автообновление отключено',
        description: enabled
          ? `Цены для "${productTitle}" будут изменяться автоматически`
          : `Изменения цен для "${productTitle}" потребуют подтверждения`,
        status: enabled ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить настройки автоматизации',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading || !settings) {
    return (
      <Box p={2}>
        <Text fontSize="sm" color="gray.500">Загрузка...</Text>
      </Box>
    );
  }

  if (compact) {
    // Компактный режим для списка товаров
    return (
      <Tooltip
        label={
          settings.ozonAutoUpdate
            ? '🚀 Автообновление активно - цены изменяются автоматически на Ozon'
            : '⏸️ Автообновление отключено - требуется ручное подтверждение'
        }
        placement="top"
      >
        <Box>
          <FormControl display="flex" alignItems="center">
            <HStack spacing={2}>
              <FiZap color={settings.ozonAutoUpdate ? '#48BB78' : '#A0AEC0'} />
              <Switch
                size="sm"
                isChecked={settings.ozonAutoUpdate}
                onChange={(e) => handleToggle(e.target.checked)}
                colorScheme="green"
              />
              <Badge
                colorScheme={settings.ozonAutoUpdate ? 'green' : 'gray'}
                fontSize="xs"
              >
                {settings.ozonAutoUpdate ? 'AUTO' : 'MANUAL'}
              </Badge>
            </HStack>
          </FormControl>
        </Box>
      </Tooltip>
    );
  }

  // Полный режим
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <FiZap color={settings.ozonAutoUpdate ? '#48BB78' : '#A0AEC0'} />
            <Text fontWeight="semibold">Автообновление Ozon</Text>
            <Badge colorScheme="blue" fontSize="xs">24/7</Badge>
          </HStack>
          <Badge
            colorScheme={settings.ozonAutoUpdate ? 'green' : 'gray'}
            fontSize="sm"
          >
            {settings.ozonAutoUpdate ? 'Активно' : 'Отключено'}
          </Badge>
        </HStack>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor={`auto-${productId}`} mb="0" flex="1">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                Изменять цены автоматически без подтверждения
              </Text>
              <Text fontSize="xs" color={helperTextColor}>
                Текущая цена: {currentPrice} ₽ • Мониторинг: каждые 5 минут
              </Text>
            </VStack>
          </FormLabel>
          <Switch
            id={`auto-${productId}`}
            size="lg"
            isChecked={settings.ozonAutoUpdate}
            onChange={(e) => handleToggle(e.target.checked)}
            colorScheme="green"
          />
        </FormControl>

        {settings.ozonAutoUpdate && (
          <Box p={2} bg={successBg} borderRadius="md" borderLeft="4px solid" borderLeftColor={successBorder}>
            <HStack>
              <FiShield color={useColorModeValue('#48BB78', '#68D391')} />
              <Text fontSize="xs" color={successText}>
                <strong>Безопасность:</strong> Макс. изменение {settings.maxPriceChangePercent}% •
                Макс. {settings.maxDailyChanges} раз/день •
                Пауза {settings.minTimeBetweenChanges} мин
              </Text>
            </HStack>
          </Box>
        )}

        <Text fontSize="xs" color={helperTextColor}>
          💡 24/7 мониторинг всегда активен и отслеживает цены конкурентов.
          Автообновление определяет, будут ли цены изменяться без подтверждения.
        </Text>
      </VStack>
    </Box>
  );
};
