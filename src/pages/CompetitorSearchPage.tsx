import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import CompetitorSearch from '../components/CompetitorSearch'

const CompetitorSearchPage: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* 📋 Заголовок страницы */}
          <VStack spacing={4} align="center" textAlign="center">
            <Heading size="xl" color={textColor}>
              🔍 Поиск конкурентов на Wildberries
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Найдите конкурентов для ваших товаров, сравните цены и добавьте их в систему мониторинга
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="green" px={3} py={1}>
                Реальные данные WB
              </Badge>
              <Badge colorScheme="blue" px={3} py={1}>
                Безопасный парсинг
              </Badge>
              <Badge colorScheme="purple" px={3} py={1}>
                Защита от банов
              </Badge>
            </HStack>
          </VStack>

          {/* ⚠️ Важная информация */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Как работает поиск конкурентов</AlertTitle>
              <AlertDescription>
                <VStack align="start" spacing={1} mt={2}>
                  <Text>• Поиск выполняется через публичные API Wildberries</Text>
                  <Text>• Система автоматически контролирует скорость запросов</Text>
                  <Text>• Максимум 60 запросов в час для защиты от блокировки</Text>
                  <Text>• Получаем: название, бренд, продавца, цену, рейтинг</Text>
                  <Text>• Все найденные товары можно добавить в мониторинг</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>

          {/* 🔍 Компонент поиска */}
          <CompetitorSearch />

          {/* 📊 Дополнительная информация */}
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Рекомендации по поиску</AlertTitle>
              <AlertDescription>
                <VStack align="start" spacing={1} mt={2}>
                  <Text>• Используйте конкретные названия товаров</Text>
                  <Text>• Добавляйте бренд или категорию для точности</Text>
                  <Text>• Избегайте слишком общих запросов</Text>
                  <Text>• Проверяйте актуальность цен на сайте WB</Text>
                  <Text>• Выбирайте только релевантных конкурентов</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>

          {/* 🎯 Примеры поисковых запросов */}
          <Box p={6} bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" borderWidth="1px">
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={textColor}>
                💡 Примеры эффективных поисковых запросов
              </Heading>
              
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="green.600">✅ Хорошие запросы:</Text>
                <VStack align="start" spacing={1} pl={4}>
                  <Text fontSize="sm">• "iPhone 15 Pro чехол"</Text>
                  <Text fontSize="sm">• "Nike кроссовки мужские"</Text>
                  <Text fontSize="sm">• "Xiaomi наушники беспроводные"</Text>
                  <Text fontSize="sm">• "Samsung Galaxy S24 защитное стекло"</Text>
                </VStack>
                
                <Text fontWeight="medium" color="red.600" mt={4}>❌ Плохие запросы:</Text>
                <VStack align="start" spacing={1} pl={4}>
                  <Text fontSize="sm">• "телефон" (слишком общий)</Text>
                  <Text fontSize="sm">• "одежда" (слишком широкий)</Text>
                  <Text fontSize="sm">• "товар" (бессмысленный)</Text>
                  <Text fontSize="sm">• "купить дешево" (нерелевантный)</Text>
                </VStack>
              </VStack>
            </VStack>
          </Box>

          {/* 🚀 Следующие шаги */}
          <Alert status="success" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Что делать после поиска?</AlertTitle>
              <AlertDescription>
                <VStack align="start" spacing={1} mt={2}>
                  <Text>1. Выберите релевантных конкурентов кликом по карточкам</Text>
                  <Text>2. Перейдите в раздел "Связанные товары" для настройки мониторинга</Text>
                  <Text>3. Настройте стратегии ценообразования</Text>
                  <Text>4. Включите автоматическое регулирование цен</Text>
                  <Text>5. Отслеживайте изменения в разделе "Изменения цен"</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  )
}

export default CompetitorSearchPage
