import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Select,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Badge,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider
} from '@chakra-ui/react';
import { FiDownload, FiClock, FiSettings } from 'react-icons/fi';

interface AutoExportSettingsProps {
  onExportNow?: () => void;
}

export const AutoExportSettings: React.FC<AutoExportSettingsProps> = ({ onExportNow }) => {
  const [isAutoExportEnabled, setIsAutoExportEnabled] = useState(false);
  const [exportInterval, setExportInterval] = useState(30); // минуты
  const [lastExportTime, setLastExportTime] = useState<Date | null>(null);
  const [nextExportTime, setNextExportTime] = useState<Date | null>(null);
  const [stopAutoExport, setStopAutoExport] = useState<(() => void) | null>(null);
  const toast = useToast();

  // Загружаем настройки из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoExportSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setIsAutoExportEnabled(settings.enabled || false);
        setExportInterval(settings.interval || 30);
        if (settings.lastExportTime) {
          setLastExportTime(new Date(settings.lastExportTime));
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек автоэкспорта:', error);
      }
    }
  }, []);

  // Сохраняем настройки в localStorage
  const saveSettings = (enabled: boolean, interval: number) => {
    const settings = {
      enabled,
      interval,
      lastExportTime: lastExportTime?.toISOString()
    };
    localStorage.setItem('autoExportSettings', JSON.stringify(settings));
  };

  // Запуск автоматического экспорта
  const startAutoExport = async () => {
    try {
      const { excelService } = await import('../../services/excelService');
      
      const dataProvider = () => {
        // Здесь должна быть логика получения актуальных данных
        // Пока возвращаем пустые массивы
        return {
          products: [],
          competitors: [],
          priceChanges: []
        };
      };

      const stopFunction = excelService.scheduleAutoExport(dataProvider, exportInterval);
      setStopAutoExport(() => stopFunction);

      // Вычисляем время следующего экспорта
      const nextTime = new Date();
      nextTime.setMinutes(nextTime.getMinutes() + exportInterval);
      setNextExportTime(nextTime);

      toast({
        title: '🤖 Автоэкспорт запущен',
        description: `Excel файлы будут создаваться каждые ${exportInterval} минут`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Ошибка запуска автоэкспорта:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось запустить автоматический экспорт',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Остановка автоматического экспорта
  const stopAutoExportFunction = () => {
    if (stopAutoExport) {
      stopAutoExport();
      setStopAutoExport(null);
      setNextExportTime(null);
      
      toast({
        title: '⏹️ Автоэкспорт остановлен',
        description: 'Автоматическое создание Excel файлов отключено',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Обработчик изменения состояния автоэкспорта
  const handleAutoExportToggle = (enabled: boolean) => {
    setIsAutoExportEnabled(enabled);
    saveSettings(enabled, exportInterval);

    if (enabled) {
      startAutoExport();
    } else {
      stopAutoExportFunction();
    }
  };

  // Обработчик изменения интервала
  const handleIntervalChange = (newInterval: number) => {
    setExportInterval(newInterval);
    saveSettings(isAutoExportEnabled, newInterval);

    // Если автоэкспорт включен, перезапускаем с новым интервалом
    if (isAutoExportEnabled) {
      stopAutoExportFunction();
      setTimeout(() => startAutoExport(), 100);
    }
  };

  // Ручной экспорт
  const handleManualExport = () => {
    if (onExportNow) {
      onExportNow();
      setLastExportTime(new Date());
      saveSettings(isAutoExportEnabled, exportInterval);
    }
  };

  // Форматирование времени
  const formatTime = (date: Date | null) => {
    if (!date) return 'Никогда';
    return date.toLocaleString('ru-RU');
  };

  // Время до следующего экспорта
  const getTimeUntilNext = () => {
    if (!nextExportTime) return null;
    const now = new Date();
    const diff = nextExportTime.getTime() - now.getTime();
    if (diff <= 0) return 'Скоро';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes}м ${seconds}с`;
  };

  return (
    <Card>
      <CardHeader>
        <HStack>
          <FiSettings />
          <Heading size="md">⚙️ Настройки Excel экспорта</Heading>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Ручной экспорт */}
          <Box>
            <FormLabel fontWeight="semibold">📊 Ручной экспорт</FormLabel>
            <HStack>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                onClick={handleManualExport}
                size="sm"
              >
                Скачать Excel сейчас
              </Button>
              <Text fontSize="sm" color="gray.500">
                Последний экспорт: {formatTime(lastExportTime)}
              </Text>
            </HStack>
          </Box>

          <Divider />

          {/* Автоматический экспорт */}
          <Box>
            <FormControl display="flex" alignItems="center" mb={4}>
              <FormLabel htmlFor="auto-export" mb="0" fontWeight="semibold">
                🤖 Автоматический экспорт
              </FormLabel>
              <Switch
                id="auto-export"
                isChecked={isAutoExportEnabled}
                onChange={(e) => handleAutoExportToggle(e.target.checked)}
                colorScheme="green"
              />
            </FormControl>

            {isAutoExportEnabled && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm">⏰ Интервал экспорта</FormLabel>
                  <Select
                    value={exportInterval}
                    onChange={(e) => handleIntervalChange(Number(e.target.value))}
                    size="sm"
                  >
                    <option value={15}>Каждые 15 минут</option>
                    <option value={30}>Каждые 30 минут</option>
                    <option value={60}>Каждый час</option>
                    <option value={120}>Каждые 2 часа</option>
                    <option value={360}>Каждые 6 часов</option>
                    <option value={720}>Каждые 12 часов</option>
                    <option value={1440}>Каждый день</option>
                  </Select>
                </FormControl>

                <Alert status="info" size="sm">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">
                      <strong>Статус:</strong> {isAutoExportEnabled ? 'Активен' : 'Отключен'}
                    </Text>
                    {nextExportTime && (
                      <>
                        <Text fontSize="sm">
                          <strong>Следующий экспорт:</strong> {formatTime(nextExportTime)}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Осталось:</strong> <Badge colorScheme="green">{getTimeUntilNext()}</Badge>
                        </Text>
                      </>
                    )}
                  </VStack>
                </Alert>
              </VStack>
            )}
          </Box>

          {/* Информация */}
          <Alert status="warning" size="sm">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Важно:</strong> Excel файлы будут автоматически скачиваться в папку загрузок. 
              Убедитесь, что у браузера есть разрешение на скачивание файлов.
            </Text>
          </Alert>
        </VStack>
      </CardBody>
    </Card>
  );
};
