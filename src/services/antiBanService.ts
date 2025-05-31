/**
 * 🛡️ Система автоматического восстановления после бана (AntiBan Failsafe System)
 * 7-уровневая защита с автоматическим восстановлением
 */

import { notificationService, BanAlert } from './notificationService';

interface ProxyInfo {
  ip: string;
  port: number;
  type: 'residential' | 'mobile' | 'datacenter';
  username?: string;
  password?: string;
  reputation: number; // 0-100
  bannedUntil?: Date;
  banCount: number;
  lastUsed: Date;
  responseTime: number;
  successRate: number;
}

interface Fingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  referer: string;
  xRequestedWith?: string;
  dnt?: string;
  upgradeInsecureRequests?: string;
  secFetchSite?: string;
  secFetchMode?: string;
  secFetchDest?: string;
}

interface BanDetectionResult {
  isBanned: boolean;
  banType: 'ip' | 'fingerprint' | 'rate_limit' | 'unknown';
  confidence: number; // 0-100
  statusCode: number;
  responseTime: number;
  headers: Record<string, string>;
}

interface RecoveryStrategy {
  changeProxy: boolean;
  changeFingerprint: boolean;
  clearCookies: boolean;
  waitTime: number; // секунды
  retryCount: number;
  escalate: boolean;
}

class AntiBanService {
  private proxyPool: ProxyInfo[] = [];
  private currentProxy: ProxyInfo | null = null;
  private currentFingerprint: Fingerprint | null = null;
  private banHistory: Map<string, Date> = new Map();
  private requestCount: number = 0;
  private lastRequestTime: Date = new Date();
  private isRecovering: boolean = false;

  // Конфигурация
  private config = {
    maxRequestsPerMinute: 60,
    minDelayBetweenRequests: 5000, // 5 секунд
    maxRetryAttempts: 3,
    banCooldownMinutes: 30,
    proxyRotationThreshold: 100, // запросов
    fingerprintRotationThreshold: 50,
    emergencyBackoffMinutes: 60
  };

  constructor() {
    this.initializeProxyPool();
    this.generateFingerprint();
  }

  /**
   * 🌐 Инициализация пула прокси
   */
  private initializeProxyPool(): void {
    // Загружаем прокси из конфигурации или используем моковые
    const savedProxies = localStorage.getItem('wb-proxy-pool');
    
    if (savedProxies) {
      try {
        this.proxyPool = JSON.parse(savedProxies);
      } catch (error) {
        console.warn('Ошибка загрузки прокси:', error);
      }
    }

    // Если пул пустой, добавляем тестовые прокси
    if (this.proxyPool.length === 0) {
      this.proxyPool = this.generateMockProxies();
    }

    // Выбираем лучший прокси
    this.selectBestProxy();
  }

  /**
   * 🎭 Генерация нового fingerprint
   */
  private generateFingerprint(): void {
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
    ];

    const referers = [
      'https://www.google.com/',
      'https://yandex.ru/',
      'https://wildberries.ru/',
      'https://m.wildberries.ru/',
      ''
    ];

    this.currentFingerprint = {
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      acceptLanguage: 'ru-RU,ru;q=0.9,en;q=0.8',
      acceptEncoding: 'gzip, deflate, br',
      referer: referers[Math.floor(Math.random() * referers.length)],
      xRequestedWith: Math.random() > 0.5 ? 'XMLHttpRequest' : undefined,
      dnt: Math.random() > 0.7 ? '1' : undefined,
      upgradeInsecureRequests: '1',
      secFetchSite: 'same-origin',
      secFetchMode: 'cors',
      secFetchDest: 'empty'
    };

    console.log('🎭 Новый fingerprint сгенерирован');
  }

  /**
   * 🔍 Обнаружение бана
   */
  public detectBan(response: Response, responseTime: number): BanDetectionResult {
    const result: BanDetectionResult = {
      isBanned: false,
      banType: 'unknown',
      confidence: 0,
      statusCode: response.status,
      responseTime,
      headers: {}
    };

    // Извлекаем заголовки
    response.headers.forEach((value, key) => {
      result.headers[key] = value;
    });

    // Анализ статус кодов
    if (response.status === 403) {
      result.isBanned = true;
      result.banType = 'ip';
      result.confidence = 95;
    } else if (response.status === 429) {
      result.isBanned = true;
      result.banType = 'rate_limit';
      result.confidence = 90;
    } else if (response.status === 503 || response.status === 502) {
      result.isBanned = true;
      result.banType = 'unknown';
      result.confidence = 70;
    }

    // Анализ времени ответа (подозрительно быстрые ответы)
    if (responseTime < 100 && response.status !== 200) {
      result.confidence += 20;
    }

    // Анализ заголовков
    const suspiciousHeaders = ['cf-ray', 'x-blocked', 'x-rate-limit'];
    for (const header of suspiciousHeaders) {
      if (result.headers[header]) {
        result.confidence += 15;
      }
    }

    // Анализ размера ответа
    const contentLength = result.headers['content-length'];
    if (contentLength && parseInt(contentLength) < 1000 && response.status !== 200) {
      result.confidence += 10;
    }

    return result;
  }

  /**
   * 🔄 Автоматическое восстановление после бана
   */
  public async autoRecover(banDetection: BanDetectionResult, url: string): Promise<boolean> {
    if (this.isRecovering) {
      console.log('⏳ Восстановление уже в процессе...');
      return false;
    }

    this.isRecovering = true;

    try {
      console.log(`🚨 Обнаружен бан: ${banDetection.banType} (${banDetection.confidence}%)`);

      // Отправляем уведомление
      await this.sendBanNotification(banDetection, url);

      // Определяем стратегию восстановления
      const strategy = this.getRecoveryStrategy(banDetection);

      // Выполняем восстановление
      await this.executeRecoveryStrategy(strategy);

      console.log('✅ Автоматическое восстановление завершено');
      return true;

    } catch (error) {
      console.error('❌ Ошибка автоматического восстановления:', error);
      return false;
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * 📋 Определение стратегии восстановления
   */
  private getRecoveryStrategy(banDetection: BanDetectionResult): RecoveryStrategy {
    const strategy: RecoveryStrategy = {
      changeProxy: false,
      changeFingerprint: false,
      clearCookies: false,
      waitTime: 30,
      retryCount: 1,
      escalate: false
    };

    switch (banDetection.banType) {
      case 'ip':
        strategy.changeProxy = true;
        strategy.changeFingerprint = true;
        strategy.clearCookies = true;
        strategy.waitTime = 60;
        break;

      case 'rate_limit':
        strategy.waitTime = 120;
        strategy.changeFingerprint = true;
        break;

      case 'fingerprint':
        strategy.changeFingerprint = true;
        strategy.clearCookies = true;
        strategy.waitTime = 30;
        break;

      default:
        strategy.changeProxy = true;
        strategy.changeFingerprint = true;
        strategy.clearCookies = true;
        strategy.waitTime = 90;
        strategy.escalate = true;
    }

    // Увеличиваем время ожидания при высокой уверенности в бане
    if (banDetection.confidence > 90) {
      strategy.waitTime *= 2;
    }

    return strategy;
  }

  /**
   * ⚡ Выполнение стратегии восстановления
   */
  private async executeRecoveryStrategy(strategy: RecoveryStrategy): Promise<void> {
    console.log('🔄 Выполнение стратегии восстановления...');

    // 1. Смена прокси
    if (strategy.changeProxy) {
      this.banCurrentProxy();
      this.selectBestProxy();
      console.log('🌐 Прокси изменен');
    }

    // 2. Смена fingerprint
    if (strategy.changeFingerprint) {
      this.generateFingerprint();
      console.log('🎭 Fingerprint изменен');
    }

    // 3. Очистка cookies
    if (strategy.clearCookies) {
      this.clearCookies();
      console.log('🍪 Cookies очищены');
    }

    // 4. Ожидание
    if (strategy.waitTime > 0) {
      console.log(`⏳ Ожидание ${strategy.waitTime} секунд...`);
      await this.sleep(strategy.waitTime * 1000);
    }

    // 5. Эскалация (если нужно)
    if (strategy.escalate) {
      await this.escalateRecovery();
    }
  }

  /**
   * 🚨 Отправка уведомления о бане
   */
  private async sendBanNotification(banDetection: BanDetectionResult, url: string): Promise<void> {
    const alert: BanAlert = {
      type: 'ban',
      ip: this.currentProxy?.ip || 'unknown',
      proxy: this.currentProxy ? `${this.currentProxy.ip}:${this.currentProxy.port}` : undefined,
      userAgent: this.currentFingerprint?.userAgent,
      statusCode: banDetection.statusCode,
      url: url,
      timestamp: new Date(),
      retryCount: 0,
      fingerprint: JSON.stringify(this.currentFingerprint),
      reason: `${banDetection.banType} ban detected (${banDetection.confidence}% confidence)`
    };

    await notificationService.sendBanAlert(alert);
  }

  /**
   * 🔥 Эскалация восстановления
   */
  private async escalateRecovery(): Promise<void> {
    console.log('🔥 Эскалация восстановления...');

    // Переходим в экстренный режим
    this.config.minDelayBetweenRequests *= 2;
    this.config.maxRequestsPerMinute = Math.floor(this.config.maxRequestsPerMinute / 2);

    // Отправляем критическое уведомление
    const criticalAlert: BanAlert = {
      type: 'critical',
      ip: this.currentProxy?.ip || 'unknown',
      statusCode: 0,
      url: 'system',
      timestamp: new Date(),
      retryCount: 0,
      reason: 'Escalated recovery mode activated'
    };

    await notificationService.sendBanAlert(criticalAlert);

    // Ждем дольше
    await this.sleep(this.config.emergencyBackoffMinutes * 60 * 1000);
  }

  /**
   * 🌐 Выбор лучшего прокси
   */
  private selectBestProxy(): void {
    const availableProxies = this.proxyPool.filter(proxy => {
      return !proxy.bannedUntil || proxy.bannedUntil < new Date();
    });

    if (availableProxies.length === 0) {
      console.warn('⚠️ Нет доступных прокси!');
      return;
    }

    // Сортируем по репутации и времени ответа
    availableProxies.sort((a, b) => {
      const scoreA = a.reputation * 0.7 + (1000 - a.responseTime) * 0.3;
      const scoreB = b.reputation * 0.7 + (1000 - b.responseTime) * 0.3;
      return scoreB - scoreA;
    });

    this.currentProxy = availableProxies[0];
    this.currentProxy.lastUsed = new Date();

    console.log(`🌐 Выбран прокси: ${this.currentProxy.ip}:${this.currentProxy.port} (репутация: ${this.currentProxy.reputation})`);
  }

  /**
   * 🚫 Бан текущего прокси
   */
  private banCurrentProxy(): void {
    if (!this.currentProxy) return;

    this.currentProxy.banCount++;
    this.currentProxy.reputation = Math.max(0, this.currentProxy.reputation - 20);
    this.currentProxy.bannedUntil = new Date(Date.now() + this.config.banCooldownMinutes * 60 * 1000);

    console.log(`🚫 Прокси забанен: ${this.currentProxy.ip} (до ${this.currentProxy.bannedUntil.toLocaleTimeString()})`);
  }

  /**
   * 🍪 Очистка cookies
   */
  private clearCookies(): void {
    // В браузере очищаем localStorage и sessionStorage
    try {
      localStorage.removeItem('wb-session');
      sessionStorage.clear();
    } catch (error) {
      console.warn('Ошибка очистки cookies:', error);
    }
  }

  /**
   * 😴 Задержка
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🎲 Генерация тестовых прокси
   */
  private generateMockProxies(): ProxyInfo[] {
    const mockProxies: ProxyInfo[] = [];
    
    for (let i = 0; i < 10; i++) {
      mockProxies.push({
        ip: `192.168.1.${100 + i}`,
        port: 8080 + i,
        type: ['residential', 'mobile', 'datacenter'][i % 3] as any,
        reputation: 70 + Math.random() * 30,
        banCount: 0,
        lastUsed: new Date(Date.now() - Math.random() * 86400000),
        responseTime: 100 + Math.random() * 500,
        successRate: 85 + Math.random() * 15
      });
    }

    return mockProxies;
  }

  /**
   * 📊 Получение статистики
   */
  public getStats(): {
    currentProxy: ProxyInfo | null;
    proxyPoolSize: number;
    bannedProxies: number;
    requestCount: number;
    isRecovering: boolean;
    config: typeof this.config;
  } {
    const bannedProxies = this.proxyPool.filter(p => 
      p.bannedUntil && p.bannedUntil > new Date()
    ).length;

    return {
      currentProxy: this.currentProxy,
      proxyPoolSize: this.proxyPool.length,
      bannedProxies,
      requestCount: this.requestCount,
      isRecovering: this.isRecovering,
      config: { ...this.config }
    };
  }

  /**
   * ⚙️ Обновление конфигурации
   */
  public updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Конфигурация AntiBan обновлена');
  }

  /**
   * 🔄 Принудительная ротация
   */
  public forceRotation(): void {
    this.generateFingerprint();
    this.selectBestProxy();
    this.clearCookies();
    console.log('🔄 Принудительная ротация выполнена');
  }
}

// Экспортируем singleton
export const antiBanService = new AntiBanService();
export default AntiBanService;
export type { ProxyInfo, Fingerprint, BanDetectionResult, RecoveryStrategy };
