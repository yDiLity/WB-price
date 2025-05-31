import { useEffect, useState } from 'react'
import { Box, Text, VStack, HStack, Progress } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const MotionBox = motion(Box)
const MotionText = motion(Text)

interface StatItemProps {
  label: string
  value: number
  suffix: string
  color: string
  delay?: number
}

const StatItem = ({ label, value, suffix, color, delay = 0 }: StatItemProps) => {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        let start = 0
        const increment = value / 60 // 60 frames for smooth animation
        const timer = setInterval(() => {
          start += increment
          if (start >= value) {
            setDisplayValue(value)
            clearInterval(timer)
          } else {
            setDisplayValue(Math.floor(start))
          }
        }, 16) // ~60fps
        
        return () => clearInterval(timer)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [isInView, value, delay])

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      <VStack spacing={4} align="center">
        <Box position="relative" w="120px" h="120px">
          {/* Круговой прогресс */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            borderRadius="full"
            border="8px solid"
            borderColor="gray.200"
          />
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            borderRadius="full"
            border="8px solid"
            borderColor={color}
            borderTopColor="transparent"
            borderRightColor="transparent"
            initial={{ rotate: 0 }}
            animate={isInView ? { rotate: (displayValue / value) * 360 } : { rotate: 0 }}
            transition={{ duration: 2, delay: delay / 1000 }}
            style={{
              background: `conic-gradient(${color} ${(displayValue / value) * 360}deg, transparent 0deg)`,
            }}
          />
          
          {/* Центральное значение */}
          <VStack
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            spacing={0}
          >
            <MotionText
              fontSize="2xl"
              fontWeight="black"
              color={color}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: (delay + 500) / 1000 }}
            >
              {displayValue}{suffix}
            </MotionText>
          </VStack>
        </Box>
        
        <Text
          fontSize="md"
          fontWeight="semibold"
          textAlign="center"
          color="gray.600"
        >
          {label}
        </Text>
      </VStack>
    </MotionBox>
  )
}

const AnimatedStats = () => {
  const stats = [
    { label: 'Рост прибыли', value: 30, suffix: '%', color: 'blue.500', delay: 0 },
    { label: 'ROI', value: 15, suffix: 'x', color: 'green.500', delay: 200 },
    { label: 'Мониторинг', value: 24, suffix: '/7', color: 'purple.500', delay: 400 },
  ]

  return (
    <HStack spacing={12} justify="center" wrap="wrap">
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </HStack>
  )
}

export default AnimatedStats
