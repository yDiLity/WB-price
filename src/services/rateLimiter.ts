// 🛡️ Система Rate Limiting для защиты API
interface RateLimitRule {
  endpoint: string
  method: string
  maxRequests: number
  windowMs: number
  scope: 'ip' | 'user' | 'global'
  action: 'block' | 'throttle' | 'captcha'
}

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

// 📊 Правила Rate Limiting
const RATE_LIMIT_RULES: RateLimitRule[] = [
  // Аутентификация
  {
    endpoint: '/api/auth/login',
    method: 'POST',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 минут
    scope: 'ip',
    action: 'block',
  },
  {
    endpoint: '/api/auth/register',
    method: 'POST',
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'ip',
    action: 'block',
  },
  {
    endpoint: '/api/auth/forgot-password',
    method: 'POST',
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'ip',
    action: 'block',
  },

  // Бизнес операции
  {
    endpoint: '/api/slots/book',
    method: 'POST',
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 минута
    scope: 'user',
    action: 'throttle',
  },
  {
    endpoint: '/api/prices/update',
    method: 'PUT',
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'user',
    action: 'throttle',
  },
  {
    endpoint: '/api/products',
    method: 'GET',
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'user',
    action: 'throttle',
  },

  // Файлы и экспорт
  {
    endpoint: '/api/export',
    method: 'POST',
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'user',
    action: 'block',
  },
  {
    endpoint: '/api/upload',
    method: 'POST',
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'user',
    action: 'throttle',
  },

  // Глобальные лимиты
  {
    endpoint: '/api/*',
    method: '*',
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000, // 1 час
    scope: 'ip',
    action: 'throttle',
  },
]

// 🔒 Класс Rate Limiter
class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Очистка устаревших записей каждые 5 минут
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  // 🔍 Проверка лимита
  checkLimit(
    endpoint: string,
    method: string,
    identifier: string,
    scope: 'ip' | 'user' | 'global'
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
    action?: string
  } {
    const rule = this.findRule(endpoint, method, scope)
    
    if (!rule) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: 0,
      }
    }

    const key = this.generateKey(rule, identifier)
    const now = Date.now()
    const entry = this.storage.get(key)

    // Если записи нет или окно сброшено
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + rule.windowMs,
        blocked: false,
      }
      this.storage.set(key, newEntry)

      return {
        allowed: true,
        remaining: rule.maxRequests - 1,
        resetTime: newEntry.resetTime,
      }
    }

    // Увеличиваем счетчик
    entry.count++

    // Проверяем превышение лимита
    if (entry.count > rule.maxRequests) {
      entry.blocked = true
      
      // Логируем превышение лимита
      this.logRateLimitViolation(rule, identifier, entry.count)

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        action: rule.action,
      }
    }

    return {
      allowed: true,
      remaining: rule.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  // 🎯 Поиск подходящего правила
  private findRule(
    endpoint: string,
    method: string,
    scope: 'ip' | 'user' | 'global'
  ): RateLimitRule | null {
    // Ищем точное совпадение
    let rule = RATE_LIMIT_RULES.find(
      r => r.endpoint === endpoint && 
           (r.method === method || r.method === '*') && 
           r.scope === scope
    )

    // Если не найдено, ищем wildcard правила
    if (!rule) {
      rule = RATE_LIMIT_RULES.find(
        r => this.matchWildcard(r.endpoint, endpoint) && 
             (r.method === method || r.method === '*') && 
             r.scope === scope
      )
    }

    return rule || null
  }

  // 🔑 Генерация ключа для хранения
  private generateKey(rule: RateLimitRule, identifier: string): string {
    return `${rule.scope}:${identifier}:${rule.endpoint}:${rule.method}`
  }

  // 🎭 Проверка wildcard паттернов
  private matchWildcard(pattern: string, str: string): boolean {
    const regex = new RegExp(
      pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
    )
    return regex.test(str)
  }

  // 🧹 Очистка устаревших записей
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.storage.delete(key))
    
    console.log(`Rate limiter: очищено ${keysToDelete.length} устаревших записей`)
  }

  // 📝 Логирование нарушений
  private logRateLimitViolation(
    rule: RateLimitRule,
    identifier: string,
    attempts: number
  ): void {
    const violation = {
      timestamp: new Date().toISOString(),
      event: 'RATE_LIMIT_EXCEEDED',
      rule: {
        endpoint: rule.endpoint,
        method: rule.method,
        maxRequests: rule.maxRequests,
        windowMs: rule.windowMs,
        scope: rule.scope,
        action: rule.action,
      },
      identifier,
      attempts,
      severity: attempts > rule.maxRequests * 2 ? 'HIGH' : 'MEDIUM',
    }

    // Отправляем на сервер для аудита
    fetch('/api/audit/rate-limit-violation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(violation),
    }).catch(console.error)

    console.warn('Rate limit exceeded:', violation)
  }

  // 📊 Получение статистики
  getStats(): {
    totalEntries: number
    blockedEntries: number
    topViolators: Array<{ key: string; count: number }>
  } {
    const entries = Array.from(this.storage.entries())
    const blockedEntries = entries.filter(([, entry]) => entry.blocked)
    
    const topViolators = entries
      .map(([key, entry]) => ({ key, count: entry.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalEntries: entries.length,
      blockedEntries: blockedEntries.length,
      topViolators,
    }
  }

  // 🔄 Сброс лимитов для пользователя
  resetLimits(identifier: string, scope: 'ip' | 'user' | 'global'): void {
    const keysToDelete: string[] = []

    for (const key of this.storage.keys()) {
      if (key.startsWith(`${scope}:${identifier}:`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.storage.delete(key))
    
    console.log(`Rate limiter: сброшены лимиты для ${scope}:${identifier}`)
  }

  // 🛑 Блокировка пользователя
  blockUser(identifier: string, durationMs: number): void {
    const blockKey = `block:${identifier}`
    const blockEntry: RateLimitEntry = {
      count: Infinity,
      resetTime: Date.now() + durationMs,
      blocked: true,
    }

    this.storage.set(blockKey, blockEntry)
    
    console.log(`Rate limiter: заблокирован ${identifier} на ${durationMs}ms`)
  }

  // ✅ Проверка блокировки
  isBlocked(identifier: string): boolean {
    const blockKey = `block:${identifier}`
    const entry = this.storage.get(blockKey)
    
    if (!entry) return false
    
    if (Date.now() >= entry.resetTime) {
      this.storage.delete(blockKey)
      return false
    }
    
    return entry.blocked
  }

  // 🧹 Очистка при уничтожении
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.storage.clear()
  }
}

// 🌟 Singleton instance
export const rateLimiter = new RateLimiter()

// 🎯 Middleware для API запросов
export const rateLimitMiddleware = (
  endpoint: string,
  method: string,
  getUserId: () => string | null,
  getClientIP: () => string
) => {
  return (req: any, res: any, next: any) => {
    const userId = getUserId()
    const clientIP = getClientIP()

    // Проверяем блокировку
    if (rateLimiter.isBlocked(clientIP) || (userId && rateLimiter.isBlocked(userId))) {
      return res.status(429).json({
        error: 'IP или пользователь заблокирован',
        code: 'BLOCKED',
      })
    }

    // Проверяем лимиты по IP
    const ipCheck = rateLimiter.checkLimit(endpoint, method, clientIP, 'ip')
    
    // Проверяем лимиты по пользователю (если авторизован)
    let userCheck = { allowed: true, remaining: Infinity, resetTime: 0 }
    if (userId) {
      userCheck = rateLimiter.checkLimit(endpoint, method, userId, 'user')
    }

    // Если любой из лимитов превышен
    if (!ipCheck.allowed || !userCheck.allowed) {
      const failedCheck = !ipCheck.allowed ? ipCheck : userCheck
      
      return res.status(429).json({
        error: 'Превышен лимит запросов',
        code: 'RATE_LIMIT_EXCEEDED',
        remaining: failedCheck.remaining,
        resetTime: failedCheck.resetTime,
        action: failedCheck.action,
      })
    }

    // Добавляем заголовки с информацией о лимитах
    res.set({
      'X-RateLimit-Limit': Math.min(ipCheck.remaining, userCheck.remaining),
      'X-RateLimit-Remaining': Math.min(ipCheck.remaining, userCheck.remaining),
      'X-RateLimit-Reset': Math.max(ipCheck.resetTime, userCheck.resetTime),
    })

    next()
  }
}

export default rateLimiter
