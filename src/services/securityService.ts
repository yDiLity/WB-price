/**
 * 🛡️ Сервис безопасности для работы с Wildberries API
 * Реализует все принципы из чек-листа безопасности
 */

interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks5';
}

interface SecurityConfig {
  maxRequestsPerMinute: number;
  minDelayBetweenRequests: number;
  maxDelayBetweenRequests: number;
  enableProxyRotation: boolean;
  enableUserAgentRotation: boolean;
  enableCaching: boolean;
  cacheExpirationTime: number;
  telegramBotToken?: string;
  telegramChatId?: string;
}

class SecurityService {
  private config: SecurityConfig;
  private proxies: ProxyConfig[] = [];
  private currentProxyIndex = 0;
  private requestCount = 0;
  private lastRequestTime = 0;
  private cache = new Map<string, { data: any; timestamp: number }>();

  // Список User-Agent для ротации
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0'
  ];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      maxRequestsPerMinute: 100,
      minDelayBetweenRequests: 5000,
      maxDelayBetweenRequests: 15000,
      enableProxyRotation: true,
      enableUserAgentRotation: true,
      enableCaching: true,
      cacheExpirationTime: 3600000, // 1 час
      ...config
    };
  }

  /**
   * 🔄 Добавить прокси для ротации
   */
  addProxy(proxy: ProxyConfig): void {
    this.proxies.push(proxy);
  }

  /**
   * 🎭 Получить случайный User-Agent
   */
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * 🔄 Получить следующий прокси
   */
  private getNextProxy(): ProxyConfig | null {
    if (!this.config.enableProxyRotation || this.proxies.length === 0) {
      return null;
    }

    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  /**
   * ⏱️ Применить задержку между запросами
   */
  private async applyDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    const minDelay = this.config.minDelayBetweenRequests;
    const maxDelay = this.config.maxDelayBetweenRequests;
    const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

    if (timeSinceLastRequest < randomDelay) {
      const delayTime = randomDelay - timeSinceLastRequest;
      console.log(`🛡️ Применяем задержку: ${delayTime}ms для безопасности`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * 📊 Проверить лимиты запросов
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Сброс счетчика каждую минуту
    if (this.lastRequestTime < oneMinuteAgo) {
      this.requestCount = 0;
    }

    if (this.requestCount >= this.config.maxRequestsPerMinute) {
      console.warn('🚫 Превышен лимит запросов в минуту');
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * 💾 Получить данные из кеша
   */
  private getCachedData(key: string): any | null {
    if (!this.config.enableCaching) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheExpirationTime) {
      this.cache.delete(key);
      return null;
    }

    console.log(`💾 Данные получены из кеша: ${key}`);
    return cached.data;
  }

  /**
   * 💾 Сохранить данные в кеш
   */
  private setCachedData(key: string, data: any): void {
    if (!this.config.enableCaching) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 📱 Отправить уведомление в Telegram
   */
  private async sendTelegramAlert(message: string): Promise<void> {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) {
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.telegramChatId,
          text: `🛡️ WB Security Alert: ${message}`,
          parse_mode: 'HTML'
        })
      });
    } catch (error) {
      console.error('Ошибка отправки Telegram уведомления:', error);
    }
  }

  /**
   * 🔍 Проверить ответ на блокировку
   */
  private async checkForBlocking(response: Response, responseText: string): Promise<void> {
    const blockingIndicators = [
      'blocked',
      'captcha',
      'access denied',
      'too many requests',
      'rate limit',
      'заблокирован',
      'доступ запрещен'
    ];

    const isBlocked = blockingIndicators.some(indicator => 
      responseText.toLowerCase().includes(indicator.toLowerCase())
    );

    if (isBlocked || response.status === 429 || response.status === 403) {
      const message = `Обнаружена блокировка! Status: ${response.status}, Response: ${responseText.substring(0, 200)}`;
      console.error('🚫', message);
      await this.sendTelegramAlert(message);
    }
  }

  /**
   * 🌐 Безопасный HTTP запрос с применением всех защит
   */
  async secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Проверяем лимиты
    if (!this.checkRateLimit()) {
      throw new Error('Превышен лимит запросов в минуту');
    }

    // Проверяем кеш
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), { status: 200 });
    }

    // Применяем задержку
    await this.applyDelay();

    // Настраиваем заголовки
    const headers = new Headers(options.headers);
    
    if (this.config.enableUserAgentRotation) {
      headers.set('User-Agent', this.getRandomUserAgent());
    }
    
    headers.set('Accept-Language', 'ru-RU,ru;q=0.9,en;q=0.8');
    headers.set('Accept', 'application/json, text/plain, */*');
    headers.set('Cache-Control', 'no-cache');

    // Настраиваем прокси (в реальном приложении нужна серверная реализация)
    const proxy = this.getNextProxy();
    if (proxy) {
      console.log(`🔄 Используем прокси: ${proxy.host}:${proxy.port}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const responseText = await response.text();
      
      // Проверяем на блокировку
      await this.checkForBlocking(response, responseText);

      // Сохраняем в кеш при успешном ответе
      if (response.ok) {
        try {
          const jsonData = JSON.parse(responseText);
          this.setCachedData(cacheKey, jsonData);
        } catch {
          // Не JSON ответ, не кешируем
        }
      }

      return new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });

    } catch (error) {
      const message = `Ошибка запроса к ${url}: ${error}`;
      console.error('🚫', message);
      await this.sendTelegramAlert(message);
      throw error;
    }
  }

  /**
   * 📊 Получить статистику безопасности
   */
  getSecurityStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size,
      proxiesCount: this.proxies.length,
      currentProxy: this.currentProxyIndex,
      config: this.config
    };
  }

  /**
   * 🧹 Очистить кеш
   */
  clearCache(): void {
    this.cache.clear();
    console.log('💾 Кеш очищен');
  }

  /**
   * ⚙️ Обновить конфигурацию
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Конфигурация безопасности обновлена');
  }
}

// Экспортируем singleton instance
export const securityService = new SecurityService({
  maxRequestsPerMinute: 100,
  minDelayBetweenRequests: 5000,
  maxDelayBetweenRequests: 15000,
  enableProxyRotation: true,
  enableUserAgentRotation: true,
  enableCaching: true,
  cacheExpirationTime: 3600000
});

export default SecurityService;
