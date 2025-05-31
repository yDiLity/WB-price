// 🧪 Система A/B тестирования и экспериментов
interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'

  // Конфигурация
  variants: ABVariant[]
  traffic: number // процент пользователей в тесте
  targeting: ABTargeting

  // Метрики
  primaryMetric: string
  secondaryMetrics: string[]

  // Временные рамки
  startDate: string
  endDate?: string
  duration?: number // дни

  // Результаты
  results?: ABTestResults
}

interface ABVariant {
  id: string
  name: string
  description: string
  traffic: number // процент трафика для этого варианта
  config: Record<string, any>
}

interface ABTargeting {
  userSegments?: string[]
  geoLocations?: string[]
  devices?: ('desktop' | 'mobile' | 'tablet')[]
  browsers?: string[]
  newUsers?: boolean
  returningUsers?: boolean
}

interface ABTestResults {
  totalUsers: number
  conversions: Record<string, number>
  conversionRates: Record<string, number>
  significance: number
  confidence: number
  winner?: string
  recommendation: 'deploy' | 'continue' | 'stop'
}

interface UserAssignment {
  userId: string
  testId: string
  variantId: string
  assignedAt: number
}

// 🎯 Активные тесты (в реальном приложении загружались бы с сервера)
const ACTIVE_TESTS: ABTest[] = [
  {
    id: 'pricing_page_redesign',
    name: 'Редизайн страницы тарифов',
    description: 'Тестирование нового дизайна страницы с тарифами',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Контрольная версия',
        description: 'Текущий дизайн',
        traffic: 50,
        config: { design: 'current' },
      },
      {
        id: 'new_design',
        name: 'Новый дизайн',
        description: 'Обновленный дизайн с улучшенным UX',
        traffic: 50,
        config: { design: 'new', features: ['testimonials', 'comparison'] },
      },
    ],
    traffic: 100,
    targeting: {
      devices: ['desktop', 'mobile'],
      newUsers: true,
    },
    primaryMetric: 'subscription_conversion',
    secondaryMetrics: ['page_engagement', 'time_on_page'],
    startDate: '2025-01-20',
    duration: 14,
  },
  {
    id: 'onboarding_flow',
    name: 'Оптимизация онбординга',
    description: 'Тестирование упрощенного процесса регистрации',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Стандартный онбординг',
        description: 'Текущий процесс в 5 шагов',
        traffic: 33,
        config: { steps: 5, tutorial: true },
      },
      {
        id: 'simplified',
        name: 'Упрощенный онбординг',
        description: 'Сокращенный процесс в 3 шага',
        traffic: 33,
        config: { steps: 3, tutorial: false },
      },
      {
        id: 'progressive',
        name: 'Прогрессивный онбординг',
        description: 'Постепенное знакомство с функциями',
        traffic: 34,
        config: { steps: 3, tutorial: 'progressive' },
      },
    ],
    traffic: 80,
    targeting: {
      newUsers: true,
    },
    primaryMetric: 'activation_rate',
    secondaryMetrics: ['completion_rate', 'time_to_activate'],
    startDate: '2025-01-15',
    duration: 21,
  },
]

// 🧪 Класс A/B Testing
class ABTesting {
  private assignments: Map<string, UserAssignment> = new Map()
  private tests: ABTest[] = ACTIVE_TESTS

  constructor() {
    this.loadAssignments()
  }

  // 🎯 Получение варианта для пользователя
  getVariant(testId: string, userId: string): string | null {
    const test = this.tests.find(t => t.id === testId)
    if (!test || test.status !== 'running') {
      return null
    }

    // Проверяем существующее назначение
    const existingAssignment = this.assignments.get(`${userId}_${testId}`)
    if (existingAssignment) {
      return existingAssignment.variantId
    }

    // Проверяем таргетинг
    if (!this.matchesTargeting(test.targeting, userId)) {
      return null
    }

    // Проверяем попадание в тест по трафику
    if (!this.isInTestTraffic(test.traffic, userId, testId)) {
      return null
    }

    // Назначаем вариант
    const variantId = this.assignVariant(test.variants, userId, testId)

    // Сохраняем назначение
    const assignment: UserAssignment = {
      userId,
      testId,
      variantId,
      assignedAt: Date.now(),
    }

    this.assignments.set(`${userId}_${testId}`, assignment)
    this.saveAssignments()

    // Логируем событие
    this.trackExperimentAssignment(testId, variantId, userId)

    return variantId
  }

  // 🎲 Проверка активности теста
  isTestActive(testId: string): boolean {
    const test = this.tests.find(t => t.id === testId)
    return test?.status === 'running'
  }

  // 📊 Получение конфигурации варианта
  getVariantConfig(testId: string, variantId: string): Record<string, any> | null {
    const test = this.tests.find(t => t.id === testId)
    const variant = test?.variants.find(v => v.id === variantId)
    return variant?.config || null
  }

  // 🎯 Проверка принадлежности к варианту
  isInVariant(testId: string, variantId: string, userId: string): boolean {
    const userVariant = this.getVariant(testId, userId)
    return userVariant === variantId
  }

  // 📈 Трекинг конверсии
  trackConversion(testId: string, metric: string, userId: string, value?: number): void {
    const assignment = this.assignments.get(`${userId}_${testId}`)
    if (!assignment) return

    // Отправляем событие конверсии
    this.sendConversionEvent({
      testId,
      variantId: assignment.variantId,
      metric,
      userId,
      value,
      timestamp: Date.now(),
    })
  }

  // 📊 Получение результатов теста
  getTestResults(testId: string): ABTestResults | null {
    const test = this.tests.find(t => t.id === testId)
    return test?.results || null
  }

  // 🎮 Получение всех активных тестов
  getActiveTests(): ABTest[] {
    return this.tests.filter(t => t.status === 'running')
  }

  // 👤 Получение назначений пользователя
  getUserAssignments(userId: string): UserAssignment[] {
    return Array.from(this.assignments.values())
      .filter(a => a.userId === userId)
  }

  // 🔄 Принудительное назначение варианта (для тестирования)
  forceVariant(testId: string, variantId: string, userId: string): void {
    const test = this.tests.find(t => t.id === testId)
    const variant = test?.variants.find(v => v.id === variantId)

    if (!test || !variant) {
      throw new Error(`Test ${testId} or variant ${variantId} not found`)
    }

    const assignment: UserAssignment = {
      userId,
      testId,
      variantId,
      assignedAt: Date.now(),
    }

    this.assignments.set(`${userId}_${testId}`, assignment)
    this.saveAssignments()
  }

  // 🎯 Проверка таргетинга
  private matchesTargeting(targeting: ABTargeting, userId: string): boolean {
    // Проверка устройства
    if (targeting.devices) {
      const device = this.getDeviceType()
      if (!targeting.devices.includes(device)) {
        return false
      }
    }

    // Проверка типа пользователя
    const isNewUser = this.isNewUser(userId)
    if (targeting.newUsers === true && !isNewUser) {
      return false
    }
    if (targeting.returningUsers === true && isNewUser) {
      return false
    }

    // Проверка браузера
    if (targeting.browsers) {
      const browser = this.getBrowser()
      if (!targeting.browsers.includes(browser)) {
        return false
      }
    }

    return true
  }

  // 🎲 Проверка попадания в трафик теста
  private isInTestTraffic(traffic: number, userId: string, testId: string): boolean {
    const hash = this.hashString(`${userId}_${testId}`)
    const bucket = hash % 100
    return bucket < traffic
  }

  // 🎯 Назначение варианта
  private assignVariant(variants: ABVariant[], userId: string, testId: string): string {
    const hash = this.hashString(`${userId}_${testId}_variant`)
    const bucket = hash % 100

    let cumulativeTraffic = 0
    for (const variant of variants) {
      cumulativeTraffic += variant.traffic
      if (bucket < cumulativeTraffic) {
        return variant.id
      }
    }

    // Fallback на первый вариант
    return variants[0].id
  }

  // 🔢 Хеширование строки
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // 📱 Определение типа устройства
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }

    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }

    return 'desktop'
  }

  // 🌐 Определение браузера
  private getBrowser(): string {
    const userAgent = navigator.userAgent

    if (userAgent.includes('Chrome')) return 'chrome'
    if (userAgent.includes('Firefox')) return 'firefox'
    if (userAgent.includes('Safari')) return 'safari'
    if (userAgent.includes('Edge')) return 'edge'

    return 'other'
  }

  // 👤 Проверка нового пользователя
  private isNewUser(userId: string): boolean {
    // В реальном приложении это проверялось бы через API
    const registrationDate = localStorage.getItem(`user_${userId}_registration`)
    if (!registrationDate) return true

    const daysSinceRegistration = (Date.now() - parseInt(registrationDate)) / (1000 * 60 * 60 * 24)
    return daysSinceRegistration <= 7 // новый пользователь = зарегистрирован менее 7 дней назад
  }

  // 📝 Трекинг назначения эксперимента
  private trackExperimentAssignment(testId: string, variantId: string, userId: string): void {
    // Интеграция с системой аналитики
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('experiment_assignment', {
        testId,
        variantId,
        userId,
      })
    }
  }

  // 📊 Отправка события конверсии (отключено для демо)
  private sendConversionEvent(event: {
    testId: string
    variantId: string
    metric: string
    userId: string
    value?: number
    timestamp: number
  }): void {
    // Отключаем отправку на сервер для демо-версии
    console.log('🧪 A/B Test conversion (demo mode):', event)

    // Отправляем на сервер
    // fetch('/api/ab-testing/conversion', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(event),
    // }).catch(console.error)
  }

  // 💾 Сохранение назначений
  private saveAssignments(): void {
    try {
      const assignmentsArray = Array.from(this.assignments.entries())
      localStorage.setItem('ab_assignments', JSON.stringify(assignmentsArray))
    } catch (error) {
      console.error('Ошибка сохранения A/B назначений:', error)
    }
  }

  // 📥 Загрузка назначений
  private loadAssignments(): void {
    try {
      const saved = localStorage.getItem('ab_assignments')
      if (saved) {
        const assignmentsArray = JSON.parse(saved)
        this.assignments = new Map(assignmentsArray)
      }
    } catch (error) {
      console.error('Ошибка загрузки A/B назначений:', error)
    }
  }
}

// 🌟 Singleton instance
export const abTesting = new ABTesting()

// 🎯 Хук для React компонентов
export const useABTest = (testId: string, userId?: string) => {
  const currentUserId = userId || 'anonymous'
  const variant = abTesting.getVariant(testId, currentUserId)
  const config = variant ? abTesting.getVariantConfig(testId, variant) : null

  return {
    variant,
    config,
    isActive: abTesting.isTestActive(testId),
    isInVariant: (variantId: string) => abTesting.isInVariant(testId, variantId, currentUserId),
    trackConversion: (metric: string, value?: number) =>
      abTesting.trackConversion(testId, metric, currentUserId, value),
  }
}

// 🎮 Хук для получения всех тестов
export const useABTesting = () => {
  return {
    getVariant: abTesting.getVariant.bind(abTesting),
    isTestActive: abTesting.isTestActive.bind(abTesting),
    getVariantConfig: abTesting.getVariantConfig.bind(abTesting),
    isInVariant: abTesting.isInVariant.bind(abTesting),
    trackConversion: abTesting.trackConversion.bind(abTesting),
    getTestResults: abTesting.getTestResults.bind(abTesting),
    getActiveTests: abTesting.getActiveTests.bind(abTesting),
    getUserAssignments: abTesting.getUserAssignments.bind(abTesting),
    forceVariant: abTesting.forceVariant.bind(abTesting),
  }
}

export default abTesting
