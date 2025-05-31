// 🔐 Система аутентификации и безопасности
import { jwtDecode } from 'jwt-decode'

// 🎯 Типы для аутентификации
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user' | 'viewer'
  permissions: string[]
  mfaEnabled: boolean
  lastLogin: string
  avatar?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  mfaCode?: string
  rememberMe?: boolean
}

export interface JWTPayload {
  sub: string
  email: string
  role: string
  permissions: string[]
  iat: number
  exp: number
  jti: string
}

// 🔒 Класс для управления аутентификацией
class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'ozon_access_token'
  private readonly REFRESH_TOKEN_KEY = 'ozon_refresh_token'
  private readonly USER_KEY = 'ozon_user'
  
  // 🚀 Вход в систему
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка входа в систему')
      }

      const data = await response.json()
      
      // Сохраняем токены
      this.setTokens(data.tokens)
      this.setUser(data.user)
      
      // Логируем успешный вход
      this.logSecurityEvent('LOGIN_SUCCESS', {
        userId: data.user.id,
        email: data.user.email,
        mfaUsed: !!credentials.mfaCode,
      })

      return data
    } catch (error) {
      // Логируем неудачную попытку входа
      this.logSecurityEvent('LOGIN_FAILED', {
        email: credentials.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // 🔄 Обновление токена
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('Refresh token не найден')
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      })

      if (!response.ok) {
        // Если refresh token недействителен, выходим
        this.logout()
        throw new Error('Сессия истекла')
      }

      const tokens = await response.json()
      this.setTokens(tokens)
      
      return tokens
    } catch (error) {
      this.logout()
      throw error
    }
  }

  // 🚪 Выход из системы
  async logout(): Promise<void> {
    const user = this.getUser()
    
    try {
      // Уведомляем сервер о выходе
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
      })
    } catch (error) {
      console.warn('Ошибка при выходе:', error)
    }

    // Очищаем локальные данные
    this.clearTokens()
    this.clearUser()
    
    // Логируем выход
    if (user) {
      this.logSecurityEvent('LOGOUT', {
        userId: user.id,
        email: user.email,
      })
    }
  }

  // 🔐 MFA - генерация QR кода
  async generateMFASecret(): Promise<{ secret: string; qrCode: string }> {
    const response = await fetch('/api/auth/mfa/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    })

    if (!response.ok) {
      throw new Error('Ошибка генерации MFA секрета')
    }

    return response.json()
  }

  // ✅ MFA - подтверждение настройки
  async enableMFA(code: string): Promise<{ backupCodes: string[] }> {
    const response = await fetch('/api/auth/mfa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      throw new Error('Неверный код MFA')
    }

    const result = await response.json()
    
    // Обновляем пользователя
    const user = this.getUser()
    if (user) {
      user.mfaEnabled = true
      this.setUser(user)
    }

    this.logSecurityEvent('MFA_ENABLED', {
      userId: user?.id,
    })

    return result
  }

  // ❌ MFA - отключение
  async disableMFA(password: string): Promise<void> {
    const response = await fetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      throw new Error('Ошибка отключения MFA')
    }

    // Обновляем пользователя
    const user = this.getUser()
    if (user) {
      user.mfaEnabled = false
      this.setUser(user)
    }

    this.logSecurityEvent('MFA_DISABLED', {
      userId: user?.id,
    })
  }

  // 🔍 Проверка валидности токена
  isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const now = Date.now() / 1000
      return decoded.exp > now
    } catch {
      return false
    }
  }

  // 👤 Получение текущего пользователя
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  // 🎫 Получение access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  // 🔄 Получение refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // ✅ Проверка аутентификации
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token ? this.isTokenValid(token) : false
  }

  // 🛡️ Проверка разрешений
  hasPermission(permission: string): boolean {
    const user = this.getUser()
    return user?.permissions.includes(permission) || false
  }

  // 👑 Проверка роли
  hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.role === role
  }

  // 💾 Сохранение токенов
  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  // 💾 Сохранение пользователя
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  // 🗑️ Очистка токенов
  private clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // 🗑️ Очистка пользователя
  private clearUser(): void {
    localStorage.removeItem(this.USER_KEY)
  }

  // 📝 Логирование событий безопасности
  private logSecurityEvent(event: string, data: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      ip: 'client-side', // На сервере будет реальный IP
    }

    // Отправляем на сервер для аудита
    fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    }).catch(console.error)
  }
}

// 🌟 Экспорт singleton instance
export const authService = new AuthService()

// 🔐 Хук для React компонентов
export const useAuth = () => {
  const user = authService.getUser()
  const isAuthenticated = authService.isAuthenticated()

  return {
    user,
    isAuthenticated,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    refreshToken: authService.refreshToken.bind(authService),
    hasPermission: authService.hasPermission.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    generateMFASecret: authService.generateMFASecret.bind(authService),
    enableMFA: authService.enableMFA.bind(authService),
    disableMFA: authService.disableMFA.bind(authService),
  }
}

export default authService
