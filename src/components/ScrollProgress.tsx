import { useEffect, useState } from 'react'
import { Box, Progress } from '@chakra-ui/react'
import { motion, useScroll, useSpring } from 'framer-motion'

const MotionBox = motion(Box)

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setScrollProgress(latest * 100)
    })
    return unsubscribe
  }, [scrollYProgress])

  return (
    <>
      {/* Прогресс-бар сверху */}
      <MotionBox
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="4px"
        background="linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
        transformOrigin="0%"
        style={{ scaleX }}
        zIndex="9999"
        boxShadow="0 0 10px rgba(102, 126, 234, 0.5)"
      />
      
      {/* Круговой индикатор справа */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex="9998"
        w="60px"
        h="60px"
        borderRadius="full"
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(10px)"
        boxShadow="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px solid"
        borderColor="purple.200"
        transition="all 0.3s"
        _hover={{
          transform: 'scale(1.1)',
          boxShadow: 'xl',
        }}
      >
        <Box position="relative" w="40px" h="40px">
          <Progress
            value={scrollProgress}
            size="lg"
            colorScheme="purple"
            borderRadius="full"
            bg="gray.200"
            sx={{
              '& > div': {
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              },
            }}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            fontSize="xs"
            fontWeight="bold"
            color="purple.600"
          >
            {Math.round(scrollProgress)}%
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default ScrollProgress
