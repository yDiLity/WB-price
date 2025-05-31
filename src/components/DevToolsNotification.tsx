// 🛠️ Уведомление о React DevTools для разработчиков
import React, { useState, useEffect } from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Link,
  HStack,
  Icon,
  useColorModeValue,
  Collapse,
  Button,
} from '@chakra-ui/react'
import { FaReact, FaDownload, FaTools } from 'react-icons/fa'

const DevToolsNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Проверяем, установлены ли React DevTools
    const hasReactDevTools = 
      typeof window !== 'undefined' && 
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__

    // Проверяем, было ли уведомление уже скрыто
    const wasDismissed = localStorage.getItem('devtools-notification-dismissed') === 'true'

    // Показываем уведомление только в development режиме и если DevTools не установлены
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment && !hasReactDevTools && !wasDismissed) {
      // Показываем уведомление через 3 секунды после загрузки
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('devtools-notification-dismissed', 'true')
  }

  const handleInstall = () => {
    // Открываем ссылку на React DevTools
    window.open('https://reactjs.org/link/react-devtools', '_blank')
    handleDismiss()
  }

  if (isDismissed || !isVisible) {
    return null
  }

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={9999}
      maxW="400px"
      w="full"
    >
      <Collapse in={isVisible} animateOpacity>
        <Alert
          status="info"
          variant="subtle"
          borderRadius="lg"
          boxShadow="lg"
          border="1px solid"
          borderColor={useColorModeValue('blue.200', 'blue.600')}
          bg={useColorModeValue('blue.50', 'blue.900')}
          p={4}
        >
          <AlertIcon as={FaReact} color="blue.500" />
          <Box flex="1">
            <AlertTitle fontSize="sm" mb={1}>
              🛠️ React DevTools
            </AlertTitle>
            <AlertDescription fontSize="xs" mb={3}>
              Установите React DevTools для улучшения опыта разработки
            </AlertDescription>
            
            <HStack spacing={2}>
              <Button
                size="xs"
                colorScheme="blue"
                variant="solid"
                leftIcon={<Icon as={FaDownload} />}
                onClick={handleInstall}
              >
                Установить
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleDismiss}
              >
                Скрыть
              </Button>
            </HStack>
          </Box>
          <CloseButton
            size="sm"
            onClick={handleDismiss}
            position="absolute"
            right={2}
            top={2}
          />
        </Alert>
      </Collapse>
    </Box>
  )
}

export default DevToolsNotification
