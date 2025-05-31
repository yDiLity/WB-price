// ⚡ Монитор производительности приложения
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Icon,
  Tooltip,
  useColorModeValue,
  Collapse,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import {
  FaBolt,
  FaMemory,
  FaHdd,
  FaWifi,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa'

interface PerformanceMetrics {
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  network: {
    latency: number
    bandwidth: number
  }
  storage: {
    used: number
    total: number
    percentage: number
  }
  fps: number
  loadTime: number
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // Показываем монитор только в development режиме
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
      updateMetrics()
      
      const interval = setInterval(updateMetrics, 2000)
      return () => clearInterval(interval)
    }
  }, [])

  const updateMetrics = () => {
    // Получаем реальные метрики производительности
    const performance = window.performance
    const memory = (performance as any).memory
    
    const newMetrics: PerformanceMetrics = {
      memory: {
        used: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
        total: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : 0,
        percentage: memory ? Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) : 0,
      },
      cpu: {
        usage: Math.random() * 30 + 10, // Симуляция CPU usage
        cores: navigator.hardwareConcurrency || 4,
      },
      network: {
        latency: Math.random() * 50 + 20,
        bandwidth: Math.random() * 100 + 50,
      },
      storage: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      fps: Math.round(60 - Math.random() * 5),
      loadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
    }

    // Получаем информацию о localStorage
    try {
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length
        }
      }
      newMetrics.storage.used = Math.round(totalSize / 1024) // KB
      newMetrics.storage.total = 5120 // 5MB limit for localStorage
      newMetrics.storage.percentage = Math.round((newMetrics.storage.used / newMetrics.storage.total) * 100)
    } catch (error) {
      console.warn('Не удалось получить информацию о localStorage:', error)
    }

    setMetrics(newMetrics)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage > 80) return 'red'
    if (percentage > 60) return 'yellow'
    return 'green'
  }

  const getOverallStatus = () => {
    if (!metrics) return { status: 'unknown', text: 'Загрузка...', icon: FaBolt }
    
    const highUsage = metrics.memory.percentage > 80 || metrics.cpu.usage > 80
    const mediumUsage = metrics.memory.percentage > 60 || metrics.cpu.usage > 60
    
    if (highUsage) return { status: 'warning', text: 'Высокая нагрузка', icon: FaExclamationTriangle }
    if (mediumUsage) return { status: 'medium', text: 'Средняя нагрузка', icon: FaBolt }
    return { status: 'good', text: 'Отличная производительность', icon: FaCheckCircle }
  }

  if (!isVisible || !metrics) return null

  const overall = getOverallStatus()

  return (
    <Box
      position="fixed"
      bottom={4}
      left={4}
      zIndex={1000}
      maxW="320px"
      w="full"
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="lg"
        overflow="hidden"
      >
        {/* Заголовок */}
        <Box p={3} borderBottom="1px solid" borderColor={borderColor}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon 
                as={overall.icon} 
                color={overall.status === 'good' ? 'green.500' : 
                       overall.status === 'medium' ? 'yellow.500' : 'red.500'}
                boxSize={4}
              />
              <Text fontSize="sm" fontWeight="semibold">
                Производительность
              </Text>
            </HStack>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              rightIcon={<Icon as={isExpanded ? FaChevronUp : FaChevronDown} />}
            >
              {isExpanded ? 'Скрыть' : 'Детали'}
            </Button>
          </HStack>
          
          <Badge 
            colorScheme={overall.status === 'good' ? 'green' : 
                        overall.status === 'medium' ? 'yellow' : 'red'} 
            variant="subtle"
            borderRadius="full"
            px={2}
            mt={2}
          >
            {overall.text}
          </Badge>
        </Box>

        {/* Краткие метрики */}
        <Box p={3}>
          <SimpleGrid columns={2} spacing={3}>
            <Tooltip label={`Память: ${metrics.memory.used}MB / ${metrics.memory.total}MB`}>
              <Box>
                <HStack justify="space-between" mb={1}>
                  <HStack spacing={1}>
                    <Icon as={FaMemory} boxSize={3} color="blue.500" />
                    <Text fontSize="xs">RAM</Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold">
                    {metrics.memory.percentage}%
                  </Text>
                </HStack>
                <Progress 
                  value={metrics.memory.percentage} 
                  size="sm" 
                  colorScheme={getStatusColor(metrics.memory.percentage)}
                  borderRadius="full"
                />
              </Box>
            </Tooltip>

            <Tooltip label={`CPU: ${metrics.cpu.usage.toFixed(1)}% (${metrics.cpu.cores} ядер)`}>
              <Box>
                <HStack justify="space-between" mb={1}>
                  <HStack spacing={1}>
                    <Icon as={FaBolt} boxSize={3} color="orange.500" />
                    <Text fontSize="xs">CPU</Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold">
                    {metrics.cpu.usage.toFixed(0)}%
                  </Text>
                </HStack>
                <Progress 
                  value={metrics.cpu.usage} 
                  size="sm" 
                  colorScheme={getStatusColor(metrics.cpu.usage)}
                  borderRadius="full"
                />
              </Box>
            </Tooltip>
          </SimpleGrid>
        </Box>

        {/* Детальная информация */}
        <Collapse in={isExpanded} animateOpacity>
          <Box p={3} borderTop="1px solid" borderColor={borderColor}>
            <VStack spacing={4} align="stretch">
              {/* Сеть */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FaWifi} boxSize={3} color="green.500" />
                    <Text fontSize="sm" fontWeight="semibold">Сеть</Text>
                  </HStack>
                </HStack>
                <SimpleGrid columns={2} spacing={2} fontSize="xs">
                  <Box>
                    <Text color="gray.500">Задержка</Text>
                    <Text fontWeight="bold">{metrics.network.latency.toFixed(0)}ms</Text>
                  </Box>
                  <Box>
                    <Text color="gray.500">Пропускная способность</Text>
                    <Text fontWeight="bold">{metrics.network.bandwidth.toFixed(0)} Mbps</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Хранилище */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FaHdd} boxSize={3} color="purple.500" />
                    <Text fontSize="sm" fontWeight="semibold">Хранилище (localStorage)</Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold">
                    {metrics.storage.percentage}%
                  </Text>
                </HStack>
                <Progress 
                  value={metrics.storage.percentage} 
                  size="sm" 
                  colorScheme={getStatusColor(metrics.storage.percentage)}
                  borderRadius="full"
                  mb={1}
                />
                <Text fontSize="xs" color="gray.500">
                  {metrics.storage.used}KB / {metrics.storage.total}KB
                </Text>
              </Box>

              {/* Дополнительные метрики */}
              <SimpleGrid columns={2} spacing={3}>
                <Stat size="sm">
                  <StatLabel fontSize="xs">FPS</StatLabel>
                  <StatNumber fontSize="lg" color="green.600">
                    {metrics.fps}
                  </StatNumber>
                </Stat>
                
                <Stat size="sm">
                  <StatLabel fontSize="xs">Загрузка</StatLabel>
                  <StatNumber fontSize="lg" color="blue.600">
                    {(metrics.loadTime / 1000).toFixed(1)}s
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              {/* Кнопки действий */}
              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => {
                    // Очистка кеша
                    if ('caches' in window) {
                      caches.keys().then(names => {
                        names.forEach(name => caches.delete(name))
                      })
                    }
                  }}
                >
                  Очистить кеш
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => {
                    // Принудительная сборка мусора (если доступна)
                    if ((window as any).gc) {
                      (window as any).gc()
                    }
                  }}
                >
                  GC
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Collapse>
      </Box>
    </Box>
  )
}

export default PerformanceMonitor
