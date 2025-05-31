import { Box, VStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaRocket } from 'react-icons/fa'

const MotionBox = motion(Box)

const BrandLoader = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
    >
      <VStack spacing={8}>
        {/* Анимированная ракета */}
        <MotionBox
          initial={{ y: 0, rotate: 0 }}
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Box
            w="80px"
            h="80px"
            bg="rgba(255, 255, 255, 0.9)"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 0 30px rgba(255, 255, 255, 0.3)"
          >
            <FaRocket size="40px" color="#667eea" />
          </Box>
        </MotionBox>

        {/* Анимированный текст */}
        <VStack spacing={4}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Text
              fontSize="2xl"
              fontWeight="black"
              color="white"
              textAlign="center"
            >
              Ozon Price Optimizer Pro
            </Text>
          </MotionBox>

          {/* Прогресс-бар */}
          <MotionBox
            w="200px"
            h="4px"
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="full"
            overflow="hidden"
          >
            <MotionBox
              h="100%"
              bg="rgba(255, 255, 255, 0.9)"
              borderRadius="full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </MotionBox>

          {/* Загрузочные точки */}
          <Box display="flex" gap={2}>
            {[0, 1, 2].map((i) => (
              <MotionBox
                key={i}
                w="8px"
                h="8px"
                bg="rgba(255, 255, 255, 0.9)"
                borderRadius="full"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </Box>
        </VStack>
      </VStack>
    </Box>
  )
}

export default BrandLoader
