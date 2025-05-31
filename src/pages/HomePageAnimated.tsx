import { Box, Text, Button, Container, Heading, SimpleGrid, Icon, useColorModeValue, VStack, Badge, HStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link } from 'react-router-dom'
import { FaRobot, FaChartLine, FaShieldAlt, FaCog, FaRocket, FaStar, FaUsers, FaTrophy } from 'react-icons/fa'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Простые анимации
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const HomePage = () => {
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box>
      {/* Hero Section */}
      <Box
        position="relative"
        bgGradient={useColorModeValue(
          'linear(to-br, blue.50, purple.50, pink.50)',
          'linear(to-br, blue.900, purple.900, pink.900)'
        )}
        py={{ base: 20, md: 32 }}
        textAlign="center"
        overflow="hidden"
        minH="80vh"
        display="flex"
        alignItems="center"
      >
        {/* Анимированные элементы фона */}
        <Box
          position="absolute"
          top="10%"
          left="10%"
          w="100px"
          h="100px"
          bgGradient="linear(to-r, blue.400, purple.500)"
          borderRadius="full"
          opacity="0.1"
          animation={`${float} 6s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          top="60%"
          right="15%"
          w="80px"
          h="80px"
          bgGradient="linear(to-r, pink.400, orange.500)"
          borderRadius="full"
          opacity="0.1"
          animation={`${float} 8s ease-in-out infinite reverse`}
        />

        <Container maxW="container.xl" position="relative" zIndex="1">
          <VStack spacing={8}>
            {/* Заголовок */}
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <VStack spacing={4}>
                <Heading
                  as="h1"
                  size="3xl"
                  mb={4}
                  bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  🚀 Ozon Price Optimizer Pro
                </Heading>
                <Badge
                  colorScheme="purple"
                  variant="solid"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  animation={`${pulse} 2s infinite`}
                >
                  ✨ ИИ-Powered Platform ✨
                </Badge>
              </VStack>
            </MotionBox>

            {/* Описание */}
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Text
                fontSize="2xl"
                mb={6}
                color={textColor}
                maxW="3xl"
                mx="auto"
                fontWeight="medium"
                lineHeight="tall"
              >
                🎯 Автоматизированная система ИИ-ценообразования для продавцов Ozon.
                <br />
                💰 Увеличьте прибыль на <Text as="span" color="green.500" fontWeight="bold">30%</Text> с помощью умных стратегий ценообразования!
              </Text>
            </MotionBox>

            {/* Кнопки */}
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <VStack spacing={4}>
                <HStack spacing={6} flexWrap="wrap" justify="center">
                  <MotionButton
                    size="xl"
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                      transform: "translateY(-2px)",
                      boxShadow: "xl"
                    }}
                    leftIcon={<FaRocket />}
                    px={8}
                    py={6}
                    fontSize="lg"
                    borderRadius="full"
                    transition="all 0.3s"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚀 Начать бесплатно
                  </MotionButton>
                  <MotionButton
                    as={Link}
                    to="/about"
                    size="xl"
                    variant="outline"
                    borderColor="purple.400"
                    color="purple.500"
                    _hover={{
                      bg: "purple.50",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                    px={8}
                    py={6}
                    fontSize="lg"
                    borderRadius="full"
                    transition="all 0.3s"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📖 Узнать больше
                  </MotionButton>
                </HStack>

                {/* Социальное доказательство */}
                <HStack spacing={6} mt={6}>
                  <HStack>
                    <Icon as={FaUsers} color="green.500" />
                    <Text fontSize="sm" color={textColor}>
                      <Text as="span" fontWeight="bold" color="green.500">1000+</Text> продавцов
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaStar} color="yellow.500" />
                    <Text fontSize="sm" color={textColor}>
                      <Text as="span" fontWeight="bold" color="yellow.500">4.9/5</Text> рейтинг
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaTrophy} color="orange.500" />
                    <Text fontSize="sm" color={textColor}>
                      <Text as="span" fontWeight="bold" color="orange.500">#1</Text> в России
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={24}>
        <VStack spacing={16}>
          <MotionBox
            textAlign="center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Heading
              as="h2"
              size="2xl"
              mb={4}
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              ✨ Ключевые возможности ✨
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
              Революционные технологии для максимизации вашей прибыли
            </Text>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {/* ИИ-аналитика */}
            <MotionBox
              p={8}
              bgGradient={useColorModeValue(
                'linear(to-br, blue.50, blue.100)',
                'linear(to-br, blue.800, blue.900)'
              )}
              borderRadius="2xl"
              textAlign="center"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.600')}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              _hover={{
                transform: 'translateY(-10px)',
                boxShadow: '2xl',
                transition: 'all 0.3s'
              }}
            >
              <VStack spacing={4}>
                <Box
                  w={20}
                  h={20}
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={`${pulse} 3s infinite`}
                  boxShadow="lg"
                >
                  <Icon as={FaRobot} w={10} h={10} color="white" />
                </Box>
                <Heading as="h3" size="lg" color="blue.600">
                  🤖 ИИ-аналитика
                </Heading>
                <Text color={textColor} fontSize="md" lineHeight="tall">
                  Прогнозирование спроса и оптимизация цен с использованием передовых алгоритмов машинного обучения
                </Text>
                <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                  GPT-4 Powered
                </Badge>
              </VStack>
            </MotionBox>

            {/* Динамическое ценообразование */}
            <MotionBox
              p={8}
              bgGradient={useColorModeValue(
                'linear(to-br, green.50, green.100)',
                'linear(to-br, green.800, green.900)'
              )}
              borderRadius="2xl"
              textAlign="center"
              border="1px solid"
              borderColor={useColorModeValue('green.200', 'green.600')}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              _hover={{
                transform: 'translateY(-10px)',
                boxShadow: '2xl',
                transition: 'all 0.3s'
              }}
            >
              <VStack spacing={4}>
                <Box
                  w={20}
                  h={20}
                  bgGradient="linear(to-r, green.400, green.600)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={`${pulse} 3s infinite 0.5s`}
                  boxShadow="lg"
                >
                  <Icon as={FaChartLine} w={10} h={10} color="white" />
                </Box>
                <Heading as="h3" size="lg" color="green.600">
                  📈 Динамическое ценообразование
                </Heading>
                <Text color={textColor} fontSize="md" lineHeight="tall">
                  Автоматическая корректировка цен в зависимости от спроса, конкуренции и сезонности
                </Text>
                <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                  Real-time
                </Badge>
              </VStack>
            </MotionBox>

            {/* Защита от конкуренции */}
            <MotionBox
              p={8}
              bgGradient={useColorModeValue(
                'linear(to-br, purple.50, purple.100)',
                'linear(to-br, purple.800, purple.900)'
              )}
              borderRadius="2xl"
              textAlign="center"
              border="1px solid"
              borderColor={useColorModeValue('purple.200', 'purple.600')}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              _hover={{
                transform: 'translateY(-10px)',
                boxShadow: '2xl',
                transition: 'all 0.3s'
              }}
            >
              <VStack spacing={4}>
                <Box
                  w={20}
                  h={20}
                  bgGradient="linear(to-r, purple.400, purple.600)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={`${pulse} 3s infinite 1s`}
                  boxShadow="lg"
                >
                  <Icon as={FaShieldAlt} w={10} h={10} color="white" />
                </Box>
                <Heading as="h3" size="lg" color="purple.600">
                  🛡️ Защита от конкуренции
                </Heading>
                <Text color={textColor} fontSize="md" lineHeight="tall">
                  Обнаружение демпинга, фейковых магазинов и накрутки отзывов конкурентами
                </Text>
                <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
                  Anti-Fraud
                </Badge>
              </VStack>
            </MotionBox>

            {/* Гибкие стратегии */}
            <MotionBox
              p={8}
              bgGradient={useColorModeValue(
                'linear(to-br, orange.50, orange.100)',
                'linear(to-br, orange.800, orange.900)'
              )}
              borderRadius="2xl"
              textAlign="center"
              border="1px solid"
              borderColor={useColorModeValue('orange.200', 'orange.600')}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              _hover={{
                transform: 'translateY(-10px)',
                boxShadow: '2xl',
                transition: 'all 0.3s'
              }}
            >
              <VStack spacing={4}>
                <Box
                  w={20}
                  h={20}
                  bgGradient="linear(to-r, orange.400, orange.600)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={`${pulse} 3s infinite 1.5s`}
                  boxShadow="lg"
                >
                  <Icon as={FaCog} w={10} h={10} color="white" />
                </Box>
                <Heading as="h3" size="lg" color="orange.600">
                  ⚙️ Гибкие стратегии
                </Heading>
                <Text color={textColor} fontSize="md" lineHeight="tall">
                  Настраиваемые стратегии ценообразования для разных категорий товаров и сезонов
                </Text>
                <Badge colorScheme="orange" variant="subtle" px={3} py={1} borderRadius="full">
                  Customizable
                </Badge>
              </VStack>
            </MotionBox>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}

export default HomePage
