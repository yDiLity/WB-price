// 📊 Система аналитики и метрик
interface AnalyticsEvent {
  name: string
  properties: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

interface UserMetrics {
  userId: string
  sessionDuration: number
  pageViews: number
  events: number
  lastActivity: number
  features: string[]
}

interface BusinessMetrics {
  revenue: {
    mrr: number
    arr: number
    growth: number
  }
  users: {
    total: number
    active: number
    new: number
    churned: number
  }
  features: {
    adoption: Record<string, number>
    usage: Record<string, number>
  }
  performance: {
    responseTime: number
    errorRate: number
    uptime: number
  }
}

// 🎯 Ключевые события для отслеживания
const TRACKED_EVENTS = {
  // Пользовательские действия
  USER: [
    'page_view',
    'button_click',
    'form_submit',
    'search',
    'filter_apply',
    'export_data',
    'import_data',
  ],

  // Бизнес события
  BUSINESS: [
    'slot_booking',
    'price_change',
    'product_add',
    'strategy_create',
    'competitor_link',
    'notification_send',
  ],

  // Конверсии
  CONVERSION: [
    'signup',
    'activation',
    'subscription',
    'upgrade',
    'renewal',
    'cancellation',
  ],

  // Ошибки
  ERROR: [
    'api_error',
    'validation_error',
    'network_error',
    'permission_error',
  ],
}

// 📈 Класс Analytics
class Analytics {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private userId?: string
  private sessionStart: number
  private flushInterval: NodeJS.Timeout

  constructor() {
    this.sessionId = this.generateSessionId()
    this.sessionStart = Date.now()

    // Периодическая отправка событий
    this.flushInterval = setInterval(() => {
      this.flushEvents()
    }, 30000) // каждые 30 секунд

    // Отслеживание закрытия страницы
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd()
      this.flushEvents()
    })

    // Отслеживание видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden')
      } else {
        this.track('page_visible')
      }
    })
  }

  // 📝 Отслеживание события
  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    this.events.push(event)

    // Сохраняем в localStorage
    this.saveToLocalStorage(event)

    // Отправляем критические события немедленно
    if (this.isCriticalEvent(eventName)) {
      this.sendToServer([event])
    }
  }

  // 👤 Идентификация пользователя
  identify(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId

    this.track('user_identified', {
      userId,
      traits,
    })
  }

  // 📄 Отслеживание просмотра страницы
  page(pageName: string, properties: Record<string, any> = {}): void {
    this.track('page_view', {
      page: pageName,
      title: document.title,
      ...properties,
    })
  }

  // 🎯 Отслеживание конверсии
  conversion(eventName: string, value?: number, currency = 'RUB'): void {
    this.track(eventName, {
      category: 'conversion',
      value,
      currency,
    })
  }

  // 🚨 Отслеживание ошибки
  error(errorName: string, error: Error, context: Record<string, any> = {}): void {
    this.track('error', {
      errorName,
      message: error.message,
      stack: error.stack,
      context,
    })
  }

  // ⏱️ Отслеживание времени
  time(eventName: string): () => void {
    const startTime = Date.now()

    return () => {
      const duration = Date.now() - startTime
      this.track(eventName, {
        duration,
        category: 'timing',
      })
    }
  }

  // 🎮 Отслеживание взаимодействий
  interaction(element: string, action: string, properties: Record<string, any> = {}): void {
    this.track('interaction', {
      element,
      action,
      ...properties,
    })
  }

  // 🔍 Отслеживание поиска
  search(query: string, results: number, filters: Record<string, any> = {}): void {
    this.track('search', {
      query,
      results,
      filters,
    })
  }

  // 📊 Получение метрик пользователя
  getUserMetrics(): UserMetrics {
    const userEvents = this.events.filter(e => e.userId === this.userId)
    const sessionDuration = Date.now() - this.sessionStart

    const features = new Set<string>()
    userEvents.forEach(event => {
      if (event.properties.feature) {
        features.add(event.properties.feature)
      }
    })

    return {
      userId: this.userId || 'anonymous',
      sessionDuration,
      pageViews: userEvents.filter(e => e.name === 'page_view').length,
      events: userEvents.length,
      lastActivity: Math.max(...userEvents.map(e => e.timestamp)),
      features: Array.from(features),
    }
  }

  // 📈 Получение бизнес-метрик
  getBusinessMetrics(): Partial<BusinessMetrics> {
    const events = this.getLocalEvents()

    // Анализ использования функций
    const featureUsage: Record<string, number> = {}
    const featureAdoption: Record<string, number> = {}

    events.forEach(event => {
      if (event.properties.feature) {
        featureUsage[event.properties.feature] =
          (featureUsage[event.properties.feature] || 0) + 1
      }
    })

    // Уникальные пользователи по функциям
    const usersByFeature: Record<string, Set<string>> = {}
    events.forEach(event => {
      if (event.properties.feature && event.userId) {
        if (!usersByFeature[event.properties.feature]) {
          usersByFeature[event.properties.feature] = new Set()
        }
        usersByFeature[event.properties.feature].add(event.userId)
      }
    })

    Object.keys(usersByFeature).forEach(feature => {
      featureAdoption[feature] = usersByFeature[feature].size
    })

    return {
      features: {
        adoption: featureAdoption,
        usage: featureUsage,
      },
    }
  }

  // 🔍 Анализ воронки конверсии
  getFunnelAnalysis(steps: string[]): {
    step: string
    users: number
    conversionRate: number
  }[] {
    const events = this.getLocalEvents()
    const usersByStep: Record<string, Set<string>> = {}

    // Собираем пользователей по шагам
    steps.forEach(step => {
      usersByStep[step] = new Set()
    })

    events.forEach(event => {
      if (steps.includes(event.name) && event.userId) {
        usersByStep[event.name].add(event.userId)
      }
    })

    // Рассчитываем конверсию
    const totalUsers = usersByStep[steps[0]]?.size || 0

    return steps.map((step, index) => {
      const users = usersByStep[step]?.size || 0
      const conversionRate = totalUsers > 0 ? (users / totalUsers) * 100 : 0

      return {
        step,
        users,
        conversionRate,
      }
    })
  }

  // 📊 Когортный анализ
  getCohortAnalysis(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): any[] {
    const events = this.getLocalEvents()
    const cohorts: Record<string, any> = {}

    // Группируем пользователей по когортам
    events.forEach(event => {
      if (event.name === 'user_identified' && event.userId) {
        const cohortKey = this.getCohortKey(event.timestamp, period)

        if (!cohorts[cohortKey]) {
          cohorts[cohortKey] = {
            period: cohortKey,
            users: new Set(),
            retention: {},
          }
        }

        cohorts[cohortKey].users.add(event.userId)
      }
    })

    return Object.values(cohorts)
  }

  // 🎯 A/B тест трекинг
  trackExperiment(experimentName: string, variant: string, properties: Record<string, any> = {}): void {
    this.track('experiment_view', {
      experiment: experimentName,
      variant,
      ...properties,
    })
  }

  // 🏆 Трекинг достижений
  trackAchievement(achievement: string, properties: Record<string, any> = {}): void {
    this.track('achievement', {
      achievement,
      ...properties,
    })
  }

  // 💰 Трекинг выручки
  trackRevenue(amount: number, currency = 'RUB', properties: Record<string, any> = {}): void {
    this.track('revenue', {
      amount,
      currency,
      ...properties,
    })
  }

  // 📱 Отслеживание производительности
  trackPerformance(metric: string, value: number, unit = 'ms'): void {
    this.track('performance', {
      metric,
      value,
      unit,
    })
  }

  // 🔄 Отслеживание окончания сессии
  private trackSessionEnd(): void {
    const sessionDuration = Date.now() - this.sessionStart

    this.track('session_end', {
      duration: sessionDuration,
      events: this.events.length,
    })
  }

  // 🚨 Проверка критических событий
  private isCriticalEvent(eventName: string): boolean {
    return TRACKED_EVENTS.CONVERSION.includes(eventName) ||
           TRACKED_EVENTS.ERROR.includes(eventName) ||
           eventName === 'user_identified'
  }

  // 💾 Сохранение в localStorage
  private saveToLocalStorage(event: AnalyticsEvent): void {
    try {
      const key = `analytics_${new Date().toISOString().split('T')[0]}`
      const existingEvents = JSON.parse(localStorage.getItem(key) || '[]')
      existingEvents.push(event)

      // Ограничиваем количество событий
      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000)
      }

      localStorage.setItem(key, JSON.stringify(existingEvents))
    } catch (error) {
      console.error('Ошибка сохранения analytics события:', error)
    }
  }

  // 📥 Получение событий из localStorage
  private getLocalEvents(): AnalyticsEvent[] {
    const events: AnalyticsEvent[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('analytics_')) {
        try {
          const dayEvents = JSON.parse(localStorage.getItem(key) || '[]')
          events.push(...dayEvents)
        } catch (error) {
          console.error('Ошибка чтения analytics событий:', error)
        }
      }
    }

    return events.sort((a, b) => b.timestamp - a.timestamp)
  }

  // 📤 Отправка событий на сервер (отключено для демо)
  private async sendToServer(events: AnalyticsEvent[]): Promise<void> {
    if (events.length === 0) return

    // Отключаем отправку на сервер для демо-версии
    // В продакшене здесь будет реальная отправка на аналитический сервер
    console.log('📊 Analytics events (demo mode):', events.length, 'events')

    // try {
    //   await fetch('/api/analytics/events', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ events }),
    //   })
    // } catch (error) {
    //   console.error('Ошибка отправки analytics событий:', error)
    // }
  }

  // 🔄 Периодическая отправка событий
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    await this.sendToServer(eventsToSend)
  }

  // 📅 Получение ключа когорты
  private getCohortKey(timestamp: number, period: 'daily' | 'weekly' | 'monthly'): string {
    const date = new Date(timestamp)

    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0]
      case 'weekly':
        const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
        return `week-${week}`
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      default:
        return date.toISOString().split('T')[0]
    }
  }

  // 🆔 Генерация ID сессии
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 🧹 Очистка при уничтожении
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.trackSessionEnd()
    this.flushEvents()
  }
}

// 🌟 Singleton instance
export const analytics = new Analytics()

// 🎯 Хук для React компонентов
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics),
    conversion: analytics.conversion.bind(analytics),
    error: analytics.error.bind(analytics),
    time: analytics.time.bind(analytics),
    interaction: analytics.interaction.bind(analytics),
    search: analytics.search.bind(analytics),
    trackExperiment: analytics.trackExperiment.bind(analytics),
    trackAchievement: analytics.trackAchievement.bind(analytics),
    trackRevenue: analytics.trackRevenue.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    getUserMetrics: analytics.getUserMetrics.bind(analytics),
    getBusinessMetrics: analytics.getBusinessMetrics.bind(analytics),
    getFunnelAnalysis: analytics.getFunnelAnalysis.bind(analytics),
    getCohortAnalysis: analytics.getCohortAnalysis.bind(analytics),
  }
}

export default analytics
