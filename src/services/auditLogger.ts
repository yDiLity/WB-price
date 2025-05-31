// 📝 Система аудита и логирования критических событий
interface AuditEvent {
  id: string
  timestamp: string
  version: string
  
  // Событие
  eventType: 'AUTH' | 'BUSINESS' | 'ADMIN' | 'SECURITY' | 'SYSTEM'
  action: string
  result: 'SUCCESS' | 'FAILURE' | 'PARTIAL'
  
  // Пользователь
  actor: {
    userId?: string
    sessionId: string
    ipAddress: string
    userAgent: string
    location?: {
      country: string
      city: string
      coordinates?: [number, number]
    }
  }
  
  // Ресурс
  resource?: {
    type: string
    id: string
    name?: string
    attributes?: Record<string, any>
  }
  
  // Изменения
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
    fields: string[]
  }
  
  // Безопасность
  security: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    threats: string[]
    anomalies: string[]
  }
  
  // Метаданные
  metadata: {
    requestId: string
    correlationId: string
    source: string
    tags: string[]
  }
}

interface AuditConfig {
  enabled: boolean
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  storage: 'local' | 'server' | 'both'
  retention: number // дни
  encryption: boolean
}

// 🔧 Конфигурация аудита
const DEFAULT_CONFIG: AuditConfig = {
  enabled: true,
  logLevel: 'INFO',
  storage: 'both',
  retention: 90, // 3 месяца
  encryption: true,
}

// 📊 Критические события для логирования
const CRITICAL_EVENTS = {
  // Аутентификация
  AUTH: [
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'MFA_ENABLED',
    'MFA_DISABLED',
    'ACCOUNT_LOCKED',
    'SUSPICIOUS_LOGIN',
  ],
  
  // Бизнес операции
  BUSINESS: [
    'PRICE_CHANGE',
    'SLOT_BOOKING',
    'PRODUCT_CREATE',
    'PRODUCT_DELETE',
    'STRATEGY_CHANGE',
    'EXPORT_DATA',
    'IMPORT_DATA',
  ],
  
  // Административные действия
  ADMIN: [
    'USER_CREATE',
    'USER_DELETE',
    'ROLE_CHANGE',
    'PERMISSION_CHANGE',
    'SYSTEM_CONFIG_CHANGE',
    'BACKUP_CREATE',
    'BACKUP_RESTORE',
  ],
  
  // Безопасность
  SECURITY: [
    'RATE_LIMIT_EXCEEDED',
    'UNAUTHORIZED_ACCESS',
    'DATA_BREACH_ATTEMPT',
    'MALICIOUS_REQUEST',
    'SECURITY_SCAN_DETECTED',
    'ENCRYPTION_FAILURE',
  ],
  
  // Система
  SYSTEM: [
    'SERVICE_START',
    'SERVICE_STOP',
    'ERROR_CRITICAL',
    'PERFORMANCE_DEGRADATION',
    'DISK_SPACE_LOW',
    'MEMORY_USAGE_HIGH',
  ],
}

// 🔒 Класс Audit Logger
class AuditLogger {
  private config: AuditConfig
  private eventQueue: AuditEvent[] = []
  private flushInterval: NodeJS.Timeout
  private sessionId: string

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    
    // Периодическая отправка событий на сервер
    this.flushInterval = setInterval(() => {
      this.flushEvents()
    }, 30000) // каждые 30 секунд
  }

  // 📝 Логирование события
  async logEvent(
    eventType: AuditEvent['eventType'],
    action: string,
    data: Partial<AuditEvent> = {}
  ): Promise<void> {
    if (!this.config.enabled) return

    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      version: '1.0',
      
      eventType,
      action,
      result: data.result || 'SUCCESS',
      
      actor: {
        sessionId: this.sessionId,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        ...data.actor,
      },
      
      resource: data.resource,
      changes: data.changes,
      
      security: {
        riskLevel: this.calculateRiskLevel(eventType, action, data),
        threats: this.detectThreats(eventType, action, data),
        anomalies: this.detectAnomalies(eventType, action, data),
        ...data.security,
      },
      
      metadata: {
        requestId: this.generateRequestId(),
        correlationId: data.metadata?.correlationId || this.generateCorrelationId(),
        source: 'web-client',
        tags: data.metadata?.tags || [],
        ...data.metadata,
      },
    }

    // Добавляем в очередь
    this.eventQueue.push(event)

    // Сохраняем локально (если настроено)
    if (this.config.storage === 'local' || this.config.storage === 'both') {
      this.saveToLocalStorage(event)
    }

    // Отправляем критические события немедленно
    if (event.security.riskLevel === 'CRITICAL' || event.security.riskLevel === 'HIGH') {
      await this.sendToServer([event])
    }
  }

  // 🚨 Логирование события аутентификации
  async logAuthEvent(
    action: string,
    result: 'SUCCESS' | 'FAILURE',
    userId?: string,
    additionalData?: any
  ): Promise<void> {
    await this.logEvent('AUTH', action, {
      result,
      actor: { userId },
      metadata: {
        tags: ['authentication'],
        ...additionalData,
      },
    })
  }

  // 💰 Логирование бизнес события
  async logBusinessEvent(
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: any,
    userId?: string
  ): Promise<void> {
    await this.logEvent('BUSINESS', action, {
      actor: { userId },
      resource: {
        type: resourceType,
        id: resourceId,
      },
      changes,
      metadata: {
        tags: ['business-operation'],
      },
    })
  }

  // 🛡️ Логирование события безопасности
  async logSecurityEvent(
    action: string,
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details: any
  ): Promise<void> {
    await this.logEvent('SECURITY', action, {
      result: 'FAILURE',
      security: {
        riskLevel: threatLevel,
        threats: [action],
        anomalies: [],
      },
      metadata: {
        tags: ['security-incident'],
        ...details,
      },
    })
  }

  // 📊 Получение статистики аудита
  getAuditStats(): {
    totalEvents: number
    eventsByType: Record<string, number>
    riskDistribution: Record<string, number>
    recentEvents: AuditEvent[]
  } {
    const events = this.getLocalEvents()
    
    const eventsByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const riskDistribution = events.reduce((acc, event) => {
      acc[event.security.riskLevel] = (acc[event.security.riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const recentEvents = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return {
      totalEvents: events.length,
      eventsByType,
      riskDistribution,
      recentEvents,
    }
  }

  // 🔍 Поиск событий
  searchEvents(filters: {
    eventType?: string
    action?: string
    userId?: string
    riskLevel?: string
    dateFrom?: string
    dateTo?: string
  }): AuditEvent[] {
    const events = this.getLocalEvents()
    
    return events.filter(event => {
      if (filters.eventType && event.eventType !== filters.eventType) return false
      if (filters.action && !event.action.includes(filters.action)) return false
      if (filters.userId && event.actor.userId !== filters.userId) return false
      if (filters.riskLevel && event.security.riskLevel !== filters.riskLevel) return false
      
      if (filters.dateFrom) {
        const eventDate = new Date(event.timestamp)
        const fromDate = new Date(filters.dateFrom)
        if (eventDate < fromDate) return false
      }
      
      if (filters.dateTo) {
        const eventDate = new Date(event.timestamp)
        const toDate = new Date(filters.dateTo)
        if (eventDate > toDate) return false
      }
      
      return true
    })
  }

  // 📤 Экспорт событий
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    const events = this.getLocalEvents()
    
    if (format === 'csv') {
      const headers = [
        'timestamp', 'eventType', 'action', 'result', 'userId', 
        'riskLevel', 'resourceType', 'resourceId'
      ]
      
      const rows = events.map(event => [
        event.timestamp,
        event.eventType,
        event.action,
        event.result,
        event.actor.userId || '',
        event.security.riskLevel,
        event.resource?.type || '',
        event.resource?.id || '',
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(events, null, 2)
  }

  // 🔄 Расчет уровня риска
  private calculateRiskLevel(
    eventType: AuditEvent['eventType'],
    action: string,
    data: Partial<AuditEvent>
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Критические события
    if (eventType === 'SECURITY' || action.includes('DELETE') || action.includes('BREACH')) {
      return 'CRITICAL'
    }
    
    // Высокий риск
    if (eventType === 'ADMIN' || action.includes('CHANGE') || data.result === 'FAILURE') {
      return 'HIGH'
    }
    
    // Средний риск
    if (eventType === 'BUSINESS' || eventType === 'AUTH') {
      return 'MEDIUM'
    }
    
    return 'LOW'
  }

  // 🚨 Обнаружение угроз
  private detectThreats(
    eventType: AuditEvent['eventType'],
    action: string,
    data: Partial<AuditEvent>
  ): string[] {
    const threats: string[] = []
    
    // Множественные неудачные попытки входа
    if (action === 'LOGIN_FAILED') {
      threats.push('BRUTE_FORCE_ATTEMPT')
    }
    
    // Подозрительная активность
    if (action.includes('UNAUTHORIZED')) {
      threats.push('UNAUTHORIZED_ACCESS')
    }
    
    // Массовые операции
    if (action.includes('BULK') || action.includes('MASS')) {
      threats.push('BULK_OPERATION')
    }
    
    return threats
  }

  // 🔍 Обнаружение аномалий
  private detectAnomalies(
    eventType: AuditEvent['eventType'],
    action: string,
    data: Partial<AuditEvent>
  ): string[] {
    const anomalies: string[] = []
    
    // Необычное время активности
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) {
      anomalies.push('UNUSUAL_TIME')
    }
    
    // Подозрительный User Agent
    const userAgent = navigator.userAgent
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
      anomalies.push('SUSPICIOUS_USER_AGENT')
    }
    
    return anomalies
  }

  // 💾 Сохранение в localStorage
  private saveToLocalStorage(event: AuditEvent): void {
    try {
      const key = `audit_${event.timestamp.split('T')[0]}` // группируем по дням
      const existingEvents = JSON.parse(localStorage.getItem(key) || '[]')
      existingEvents.push(event)
      
      // Ограничиваем количество событий в день
      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000)
      }
      
      localStorage.setItem(key, JSON.stringify(existingEvents))
    } catch (error) {
      console.error('Ошибка сохранения audit события:', error)
    }
  }

  // 📥 Получение событий из localStorage
  private getLocalEvents(): AuditEvent[] {
    const events: AuditEvent[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('audit_')) {
        try {
          const dayEvents = JSON.parse(localStorage.getItem(key) || '[]')
          events.push(...dayEvents)
        } catch (error) {
          console.error('Ошибка чтения audit событий:', error)
        }
      }
    }
    
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  // 📤 Отправка событий на сервер
  private async sendToServer(events: AuditEvent[]): Promise<void> {
    if (events.length === 0) return
    
    try {
      await fetch('/api/audit/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      console.error('Ошибка отправки audit событий:', error)
    }
  }

  // 🔄 Периодическая отправка событий
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return
    
    const eventsToSend = [...this.eventQueue]
    this.eventQueue = []
    
    if (this.config.storage === 'server' || this.config.storage === 'both') {
      await this.sendToServer(eventsToSend)
    }
  }

  // 🆔 Генерация уникальных ID
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 🌐 Получение IP адреса клиента
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  // 🧹 Очистка при уничтожении
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flushEvents()
  }
}

// 🌟 Singleton instance
export const auditLogger = new AuditLogger()

// 🎯 Хук для React компонентов
export const useAuditLogger = () => {
  return {
    logEvent: auditLogger.logEvent.bind(auditLogger),
    logAuthEvent: auditLogger.logAuthEvent.bind(auditLogger),
    logBusinessEvent: auditLogger.logBusinessEvent.bind(auditLogger),
    logSecurityEvent: auditLogger.logSecurityEvent.bind(auditLogger),
    getAuditStats: auditLogger.getAuditStats.bind(auditLogger),
    searchEvents: auditLogger.searchEvents.bind(auditLogger),
    exportEvents: auditLogger.exportEvents.bind(auditLogger),
  }
}

export default auditLogger
