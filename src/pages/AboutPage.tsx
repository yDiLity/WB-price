import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            О сервисе Ozon Slot Finder
          </Heading>
          <Text fontSize="lg" maxW="container.md" mx="auto">
            Ozon Slot Finder — это инструмент, который помогает продавцам на Ozon 
            находить свободные слоты для поставки товаров на склады через кроссдокинг и прямые поставки.
          </Text>
        </Box>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={8} 
          align="center"
        >
          <Box flex="1">
            <Heading as="h2" size="lg" mb={4}>
              Наша миссия
            </Heading>
            <Text>
              Мы стремимся упростить логистику для продавцов на Ozon, помогая им 
              оптимизировать процесс поставки товаров и сократить время простоя. 
              Наш сервис автоматизирует поиск доступных слотов, уведомляет пользователей 
              об их появлении и позволяет быстро бронировать их.
            </Text>
          </Box>
          <Box 
            flex="1" 
            borderRadius="md" 
            overflow="hidden"
            boxShadow="md"
          >
            <Image 
              src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
              alt="Логистика" 
              w="full"
            />
          </Box>
        </Flex>
        
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Часто задаваемые вопросы
          </Heading>
          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Как работает Ozon Slot Finder?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                Ozon Slot Finder регулярно проверяет наличие свободных слотов на складах Ozon 
                через API маркетплейса. Когда появляются новые слоты, соответствующие вашим 
                критериям, система отправляет уведомление. Вы можете настроить фильтры по 
                складам, датам и типам поставок, чтобы получать только релевантные уведомления.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Нужен ли мне API-ключ Ozon?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                Для базового функционала (поиск слотов и уведомления) API-ключ не требуется. 
                Однако для автоматического бронирования слотов вам потребуется добавить свой 
                API-ключ Ozon в настройках профиля. Это позволит системе бронировать слоты 
                от вашего имени без необходимости входить в личный кабинет Ozon.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Какие типы уведомлений доступны?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                В настоящее время мы поддерживаем уведомления по email, push-уведомления 
                в браузере и уведомления в Telegram. Вы можете настроить предпочтительные 
                каналы уведомлений в настройках профиля.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Сколько стоит использование сервиса?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                В настоящее время сервис находится в бета-тестировании и доступен бесплатно. 
                В будущем планируется введение платных тарифов с расширенным функционалом, 
                но базовые возможности останутся бесплатными.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
        
        <Box 
          bg={useColorModeValue('blue.50', 'blue.900')} 
          p={8} 
          borderRadius="md"
          textAlign="center"
        >
          <Heading as="h3" size="md" mb={4}>
            Готовы начать оптимизировать свою логистику?
          </Heading>
          <Button 
            as={RouterLink}
            to={isAuthenticated ? '/slots' : '/register'}
            colorScheme="blue" 
            size="lg"
          >
            {isAuthenticated ? 'Перейти к поиску слотов' : 'Зарегистрироваться бесплатно'}
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
