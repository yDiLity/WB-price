import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Divider,
  useColorModeValue,
  Icon,
  Flex,
  Badge,
  Heading
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { FaRobot, FaBell, FaHistory, FaCog, FaChartLine, FaClock, FaUsers, FaLightbulb } from 'react-icons/fa';

/**
 * Компонент с подробными инструкциями по использованию мониторинга цен
 */
const MonitoringGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  // Разделы руководства
  const guideSections = [
    {
      id: 'overview',
      title: 'Обзор мониторинга цен',
      icon: FaLightbulb,
      content: (
        <VStack align="stretch" spacing={3}>
          <Text>
            Мониторинг цен позволяет автоматически отслеживать цены конкурентов и реагировать на их изменения.
            Это помогает поддерживать конкурентоспособность ваших товаров и оптимизировать ценовую стратегию.
          </Text>
          
          <Text fontWeight="medium">Основные возможности:</Text>
          <List spacing={2}>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>Автоматическое отслеживание цен конкурентов</Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>Настройка правил автоматического изменения цен</Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>Получение уведомлений об изменениях цен</Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>Анализ динамики цен и истории мониторинга</Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>Настройка расписания мониторинга</Text>
            </ListItem>
          </List>
        </VStack>
      )
    },
    {
      id: 'setup',
      title: 'Настройка мониторинга',
      icon: FaCog,
      content: (
        <VStack align="stretch" spacing={3}>
          <Text>
            Для начала работы с мониторингом цен необходимо выполнить несколько шагов:
          </Text>
          
          <List spacing={2}>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 1:</strong> Выберите товар для мониторинга из выпадающего списка в верхней части страницы.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 2:</strong> Перейдите на вкладку "Общие настройки" и включите автоматический мониторинг цен.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 3:</strong> Установите интервал проверки цен конкурентов.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 4:</strong> Включите или отключите дополнительные функции (отслеживание цен конкурентов, автоматическое изменение цен, уведомления).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 5:</strong> Нажмите кнопку "Сохранить настройки".
              </Text>
            </ListItem>
          </List>
          
          <Box p={3} bg={headerBg} borderRadius="md">
            <HStack>
              <Icon as={InfoIcon} color="blue.500" />
              <Text fontWeight="medium">Важно:</Text>
            </HStack>
            <Text mt={1}>
              Для работы мониторинга необходимо добавить связанных конкурентов на странице "Связанные товары".
              Без связанных конкурентов мониторинг не будет работать.
            </Text>
          </Box>
        </VStack>
      )
    },
    {
      id: 'auto-pricing',
      title: 'Автоматическое изменение цен',
      icon: FaRobot,
      content: (
        <VStack align="stretch" spacing={3}>
          <Text>
            Автоматическое изменение цен позволяет системе автоматически реагировать на изменения цен конкурентов
            в соответствии с настроенными правилами.
          </Text>
          
          <Text fontWeight="medium">Как настроить правила:</Text>
          <List spacing={2}>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 1:</strong> Перейдите на вкладку "Автоматическое изменение цен".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 2:</strong> Нажмите кнопку "Добавить правило".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 3:</strong> Введите название правила.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 4:</strong> Настройте условие срабатывания правила (тип условия, значение, единица измерения).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 5:</strong> Настройте действие, которое будет выполнено при срабатывании правила (тип действия, значение, единица измерения).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 6:</strong> Нажмите кнопку "Добавить правило".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 7:</strong> После добавления всех правил нажмите кнопку "Сохранить правила".
              </Text>
            </ListItem>
          </List>
          
          <Box p={3} bg={headerBg} borderRadius="md">
            <HStack>
              <Icon as={InfoIcon} color="blue.500" />
              <Text fontWeight="medium">Совет:</Text>
            </HStack>
            <Text mt={1}>
              Вы можете создать несколько правил с разными условиями и действиями.
              Например, одно правило для снижения цены при конкуренции, другое для повышения цены при отсутствии конкуренции.
            </Text>
          </Box>
        </VStack>
      )
    },
    {
      id: 'alerts',
      title: 'Настройка уведомлений',
      icon: FaBell,
      content: (
        <VStack align="stretch" spacing={3}>
          <Text>
            Уведомления позволяют получать информацию об изменениях цен конкурентов и срабатывании правил
            автоматического изменения цен.
          </Text>
          
          <Text fontWeight="medium">Как настроить уведомления:</Text>
          <List spacing={2}>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 1:</strong> Перейдите на вкладку "Уведомления".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 2:</strong> Нажмите кнопку "Добавить уведомление".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 3:</strong> Введите название уведомления.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 4:</strong> Настройте условие срабатывания уведомления (тип условия, значение, единица измерения).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 5:</strong> Выберите каналы уведомлений (Email, Telegram, SMS, Push).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 6:</strong> Нажмите кнопку "Добавить уведомление".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 7:</strong> После добавления всех уведомлений нажмите кнопку "Сохранить настройки".
              </Text>
            </ListItem>
          </List>
          
          <Box p={3} bg={headerBg} borderRadius="md">
            <HStack>
              <Icon as={WarningIcon} color="orange.500" />
              <Text fontWeight="medium">Примечание:</Text>
            </HStack>
            <Text mt={1}>
              Для получения уведомлений через Telegram необходимо подключить Telegram-бот в настройках профиля.
              Для получения SMS-уведомлений необходимо указать номер телефона в настройках профиля.
            </Text>
          </Box>
        </VStack>
      )
    },
    {
      id: 'schedule',
      title: 'Настройка расписания',
      icon: FaClock,
      content: (
        <VStack align="stretch" spacing={3}>
          <Text>
            Расписание позволяет настроить автоматический запуск мониторинга цен в определенное время.
          </Text>
          
          <Text fontWeight="medium">Как настроить расписание:</Text>
          <List spacing={2}>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 1:</strong> Перейдите на вкладку "Расписание".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 2:</strong> Нажмите кнопку "Добавить расписание".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 3:</strong> Выберите тип расписания (ежедневно, еженедельно, пользовательский интервал).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 4:</strong> Настройте параметры расписания (время, дни недели, интервал).
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 5:</strong> Нажмите кнопку "Добавить расписание".
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 6:</strong> После добавления всех расписаний нажмите кнопку "Сохранить расписание".
              </Text>
            </ListItem>
          </List>
          
          <Box p={3} bg={headerBg} borderRadius="md">
            <HStack>
              <Icon as={InfoIcon} color="blue.500" />
              <Text fontWeight="medium">Совет:</Text>
            </HStack>
            <Text mt={1}>
              Рекомендуется настроить расписание мониторинга на время, когда нагрузка на сервер минимальна,
              например, ночью или рано утром.
            </Text>
          </Box>
        </VStack>
      )
    },
    {
      id: 'bulk',
      title: 'Массовое применение правил',
      icon: FaUsers,
      content: (
        <VStack align="stretch" spacing={3}>
          <Text>
            Массовое применение правил позволяет применить одно правило автоматического изменения цен
            к нескольким товарам одновременно.
          </Text>
          
          <Text fontWeight="medium">Как применить правила массово:</Text>
          <List spacing={2}>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 1:</strong> Нажмите кнопку "Массовое применение правил" в верхней части страницы.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 2:</strong> Настройте правило автоматического изменения цен.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 3:</strong> Выберите товары, к которым нужно применить правило.
              </Text>
            </ListItem>
            <ListItem display="flex">
              <ListIcon as={CheckIcon} color="green.500" mt={1} />
              <Text>
                <strong>Шаг 4:</strong> Нажмите кнопку "Применить правила".
              </Text>
            </ListItem>
          </List>
          
          <Box p={3} bg={headerBg} borderRadius="md">
            <HStack>
              <Icon as={InfoIcon} color="blue.500" />
              <Text fontWeight="medium">Примечание:</Text>
            </HStack>
            <Text mt={1}>
              Массовое применение правил добавляет новое правило к существующим правилам каждого выбранного товара.
              Если вы хотите заменить существующие правила, сначала удалите их на странице "Связанные товары".
            </Text>
          </Box>
        </VStack>
      )
    }
  ];
  
  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Руководство по мониторингу цен</Heading>
        <Badge colorScheme="blue" fontSize="sm" p={1}>
          Подробная инструкция
        </Badge>
      </Flex>
      
      <Text mb={4} color={textColor}>
        Это руководство поможет вам настроить и использовать функции мониторинга цен.
        Выберите интересующий вас раздел, чтобы узнать больше.
      </Text>
      
      <Accordion allowToggle>
        {guideSections.map(section => (
          <AccordionItem key={section.id} borderColor={borderColor}>
            <AccordionButton py={3}>
              <HStack flex="1" textAlign="left">
                <Icon as={section.icon} color="blue.500" />
                <Text fontWeight="medium">{section.title}</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {section.content}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default MonitoringGuide;
