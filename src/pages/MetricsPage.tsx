// 📊 Страница метрик и аналитики
import React, { useEffect } from 'react'
import { Container, Box, Heading, Text, VStack } from '@chakra-ui/react'
import MetricsDashboard from '../components/MetricsDashboard'
import { useAnalytics } from '../services/analytics'

const MetricsPage: React.FC = () => {
  const analytics = useAnalytics()

  useEffect(() => {
    // Трекинг посещения страницы
    analytics.page('Metrics Dashboard', {
      feature: 'analytics',
      section: 'metrics',
    })
  }, [analytics])

  return (
    <Container maxW="full" p={0}>
      <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
        <VStack spacing={0} align="stretch">
          {/* Заголовок страницы */}
          <Box bg="white" _dark={{ bg: 'gray.800', borderColor: 'gray.700' }} borderBottom="1px" borderColor="gray.200" py={6}>
            <Container maxW="1400px">
              <VStack spacing={2} align="start">
                <Heading size="lg" color="primary.600" _dark={{ color: 'primary.300' }}>
                  📊 Аналитика и метрики
                </Heading>
                <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                  Мониторинг производительности, безопасности и пользовательской активности
                </Text>
              </VStack>
            </Container>
          </Box>

          {/* Дашборд метрик */}
          <Box flex="1">
            <MetricsDashboard />
          </Box>
        </VStack>
      </Box>
    </Container>
  )
}

export default MetricsPage
