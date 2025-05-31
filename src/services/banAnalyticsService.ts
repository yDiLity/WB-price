/**
 * 🧠 Сервис аналитики банов - "мозг" системы
 * Анализирует причины банов и находит паттерны
 */

interface BanEvent {
  id: string;
  timestamp: Date;
  url: string;
  method: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  requestBody?: string;
  responseTime: number;
  region: string;
  proxyType: 'residential' | 'mobile' | 'datacenter';
  fingerprint: string;
  sessionId: string;
  requestCount: number; // Количество запросов в сессии
  timeOfDay: number; // Час дня (0-23)
  dayOfWeek: number; // День недели (0-6)
  banReason: 'ip' | 'rate_limit' | 'fingerprint' | 'behavioral' | 'unknown';
  confidence: number; // 0-100
}

interface BanPattern {
  id: string;
  pattern: string;
  description: string;
  frequency: number;
  lastSeen: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  recommendations: string[];
}

interface BanAnalytics {
  totalBans: number;
  bansToday: number;
  bansThisWeek: number;
  bansByHour: number[];
  bansByDay: number[];
  bansByRegion: Record<string, number>;
  bansByUserAgent: Record<string, number>;
  bansByProxyType: Record<string, number>;
  topBannedUrls: Array<{ url: string; count: number }>;
  averageResponseTime: number;
  successRate: number;
  patterns: BanPattern[];
}

class BanAnalyticsService {
  private banEvents: BanEvent[] = [];
  private patterns: BanPattern[] = [];
  private maxEvents = 10000; // Максимальное количество событий в памяти

  constructor() {
    this.loadFromStorage();
    this.initializePatterns();
  }

  /**
   * 📊 Записать событие бана
   */
  public recordBanEvent(event: Partial<BanEvent>): void {
    const banEvent: BanEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      url: event.url || '',
      method: event.method || 'GET',
      statusCode: event.statusCode || 403,
      ip: event.ip || 'unknown',
      userAgent: event.userAgent || '',
      headers: event.headers || {},
      queryParams: this.extractQueryParams(event.url || ''),
      requestBody: event.requestBody,
      responseTime: event.responseTime || 0,
      region: event.region || 'unknown',
      proxyType: event.proxyType || 'datacenter',
      fingerprint: event.fingerprint || '',
      sessionId: event.sessionId || this.generateSessionId(),
      requestCount: event.requestCount || 1,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      banReason: event.banReason || 'unknown',
      confidence: event.confidence || 50
    };

    this.banEvents.unshift(banEvent);

    // Ограничиваем размер массива
    if (this.banEvents.length > this.maxEvents) {
      this.banEvents = this.banEvents.slice(0, this.maxEvents);
    }

    // Анализируем паттерны
    this.analyzePatterns(banEvent);

    // Сохраняем в localStorage
    this.saveToStorage();

    console.log('🧠 Записано событие бана:', banEvent.id);
  }

  /**
   * 🔍 Анализ паттернов банов
   */
  private analyzePatterns(event: BanEvent): void {
    // Анализ по времени
    this.analyzeTimePatterns(event);

    // Анализ по URL
    this.analyzeUrlPatterns(event);

    // Анализ по User-Agent
    this.analyzeUserAgentPatterns(event);

    // Анализ по частоте запросов
    this.analyzeRatePatterns(event);

    // Анализ по региону
    this.analyzeRegionPatterns(event);

    // Анализ по fingerprint
    this.analyzeFingerprintPatterns(event);
  }

  /**
   * ⏰ Анализ временных паттернов
   */
  private analyzeTimePatterns(event: BanEvent): void {
    const recentEvents = this.getRecentEvents(60); // Последний час
    const bansInHour = recentEvents.filter(e => e.statusCode >= 400).length;

    if (bansInHour >= 5) {
      this.updatePattern('time_clustering', {
        pattern: 'Кластеризация банов по времени',
        description: `${bansInHour} банов за последний час`,
        severity: 'high',
        triggers: ['high_frequency', 'time_clustering'],
        recommendations: [
          'Увеличить интервалы между запросами',
          'Использовать случайные задержки',
          'Распределить запросы по времени'
        ]
      });
    }

    // Анализ по часам дня
    const hourlyBans = this.getBansByHour();
    const peakHour = hourlyBans.indexOf(Math.max(...hourlyBans));
    
    if (hourlyBans[event.timeOfDay] > hourlyBans[peakHour] * 0.8) {
      this.updatePattern('peak_hour_bans', {
        pattern: 'Баны в пиковые часы',
        description: `Высокая активность банов в ${event.timeOfDay}:00`,
        severity: 'medium',
        triggers: ['peak_hours'],
        recommendations: [
          'Избегать парсинг в пиковые часы',
          'Использовать ночное время для активности',
          'Распределить нагрузку равномерно'
        ]
      });
    }
  }

  /**
   * 🔗 Анализ URL паттернов
   */
  private analyzeUrlPatterns(event: BanEvent): void {
    const urlBans = this.banEvents.filter(e => 
      e.url.includes(event.url.split('?')[0]) && 
      e.statusCode >= 400
    ).length;

    if (urlBans >= 3) {
      this.updatePattern('url_specific_bans', {
        pattern: 'Специфичные URL под баном',
        description: `URL ${event.url} забанен ${urlBans} раз`,
        severity: 'high',
        triggers: ['url_specific', 'repeated_bans'],
        recommendations: [
          'Избегать данный URL',
          'Использовать альтернативные endpoints',
          'Изменить параметры запроса'
        ]
      });
    }

    // Анализ query параметров
    const suspiciousParams = ['limit', 'offset', 'page'];
    const hasSuspiciousParams = suspiciousParams.some(param => 
      event.queryParams[param]
    );

    if (hasSuspiciousParams && event.statusCode >= 400) {
      this.updatePattern('query_param_detection', {
        pattern: 'Обнаружение по query параметрам',
        description: 'Баны связаны с определенными параметрами',
        severity: 'medium',
        triggers: ['query_params', 'pagination'],
        recommendations: [
          'Использовать случайные значения параметров',
          'Избегать подозрительных параметров',
          'Маскировать пагинацию'
        ]
      });
    }
  }

  /**
   * 🤖 Анализ User-Agent паттернов
   */
  private analyzeUserAgentPatterns(event: BanEvent): void {
    const uaBans = this.banEvents.filter(e => 
      e.userAgent === event.userAgent && 
      e.statusCode >= 400
    ).length;

    if (uaBans >= 3) {
      this.updatePattern('user_agent_detection', {
        pattern: 'Обнаружение User-Agent',
        description: `User-Agent забанен ${uaBans} раз`,
        severity: 'high',
        triggers: ['user_agent', 'fingerprint_detection'],
        recommendations: [
          'Сменить User-Agent',
          'Использовать ротацию UA',
          'Применить более реалистичные UA'
        ]
      });
    }

    // Анализ на подозрительные UA
    const suspiciousKeywords = ['bot', 'crawler', 'spider', 'scraper'];
    const isSuspicious = suspiciousKeywords.some(keyword => 
      event.userAgent.toLowerCase().includes(keyword)
    );

    if (isSuspicious && event.statusCode >= 400) {
      this.updatePattern('suspicious_user_agent', {
        pattern: 'Подозрительный User-Agent',
        description: 'UA содержит подозрительные ключевые слова',
        severity: 'critical',
        triggers: ['bot_detection', 'keyword_filtering'],
        recommendations: [
          'Использовать только браузерные UA',
          'Избегать ключевых слов bot/crawler',
          'Применить мобильные UA'
        ]
      });
    }
  }

  /**
   * 📈 Анализ частоты запросов
   */
  private analyzeRatePatterns(event: BanEvent): void {
    const recentRequests = this.getRecentEvents(300); // 5 минут
    const requestsPerMinute = recentRequests.length / 5;

    if (requestsPerMinute > 20 && event.statusCode >= 400) {
      this.updatePattern('rate_limit_exceeded', {
        pattern: 'Превышение лимита запросов',
        description: `${requestsPerMinute.toFixed(1)} запросов/мин`,
        severity: 'high',
        triggers: ['rate_limiting', 'too_fast'],
        recommendations: [
          'Снизить частоту запросов',
          'Добавить случайные задержки',
          'Использовать больше IP адресов'
        ]
      });
    }

    // Анализ burst запросов
    const burstWindow = this.getRecentEvents(10); // 10 секунд
    if (burstWindow.length > 5 && event.statusCode >= 400) {
      this.updatePattern('burst_detection', {
        pattern: 'Обнаружение burst активности',
        description: `${burstWindow.length} запросов за 10 секунд`,
        severity: 'critical',
        triggers: ['burst_activity', 'unnatural_behavior'],
        recommendations: [
          'Избегать burst запросов',
          'Имитировать человеческое поведение',
          'Добавить паузы между запросами'
        ]
      });
    }
  }

  /**
   * 🌍 Анализ региональных паттернов
   */
  private analyzeRegionPatterns(event: BanEvent): void {
    const regionBans = this.banEvents.filter(e => 
      e.region === event.region && 
      e.statusCode >= 400
    ).length;

    if (regionBans >= 5) {
      this.updatePattern('regional_blocking', {
        pattern: 'Региональная блокировка',
        description: `Регион ${event.region} заблокирован`,
        severity: 'high',
        triggers: ['geo_blocking', 'regional_ban'],
        recommendations: [
          'Сменить регион прокси',
          'Использовать другие географические зоны',
          'Распределить нагрузку по регионам'
        ]
      });
    }
  }

  /**
   * 🎭 Анализ fingerprint паттернов
   */
  private analyzeFingerprintPatterns(event: BanEvent): void {
    const fingerprintBans = this.banEvents.filter(e => 
      e.fingerprint === event.fingerprint && 
      e.statusCode >= 400
    ).length;

    if (fingerprintBans >= 2) {
      this.updatePattern('fingerprint_detection', {
        pattern: 'Обнаружение fingerprint',
        description: `Fingerprint забанен ${fingerprintBans} раз`,
        severity: 'high',
        triggers: ['fingerprint_tracking', 'browser_detection'],
        recommendations: [
          'Сгенерировать новый fingerprint',
          'Изменить TLS/JA3 подпись',
          'Использовать разные браузерные движки'
        ]
      });
    }
  }

  /**
   * 🔄 Обновление паттерна
   */
  private updatePattern(id: string, patternData: Partial<BanPattern>): void {
    const existingIndex = this.patterns.findIndex(p => p.id === id);
    
    if (existingIndex >= 0) {
      this.patterns[existingIndex] = {
        ...this.patterns[existingIndex],
        ...patternData,
        frequency: this.patterns[existingIndex].frequency + 1,
        lastSeen: new Date()
      };
    } else {
      this.patterns.push({
        id,
        pattern: patternData.pattern || '',
        description: patternData.description || '',
        frequency: 1,
        lastSeen: new Date(),
        severity: patternData.severity || 'medium',
        triggers: patternData.triggers || [],
        recommendations: patternData.recommendations || []
      });
    }
  }

  /**
   * 📊 Получение аналитики
   */
  public getAnalytics(): BanAnalytics {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalBans = this.banEvents.filter(e => e.statusCode >= 400).length;
    const bansToday = this.banEvents.filter(e => 
      e.statusCode >= 400 && e.timestamp >= today
    ).length;
    const bansThisWeek = this.banEvents.filter(e => 
      e.statusCode >= 400 && e.timestamp >= weekAgo
    ).length;

    return {
      totalBans,
      bansToday,
      bansThisWeek,
      bansByHour: this.getBansByHour(),
      bansByDay: this.getBansByDay(),
      bansByRegion: this.getBansByRegion(),
      bansByUserAgent: this.getBansByUserAgent(),
      bansByProxyType: this.getBansByProxyType(),
      topBannedUrls: this.getTopBannedUrls(),
      averageResponseTime: this.getAverageResponseTime(),
      successRate: this.getSuccessRate(),
      patterns: this.patterns.slice(0, 10) // Топ 10 паттернов
    };
  }

  /**
   * 🔮 Предсказание вероятности бана
   */
  public predictBanProbability(request: {
    url: string;
    userAgent: string;
    ip: string;
    timeOfDay: number;
    requestCount: number;
  }): {
    probability: number;
    riskFactors: string[];
    recommendations: string[];
  } {
    let probability = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Анализ URL
    const urlBans = this.banEvents.filter(e => 
      e.url.includes(request.url) && e.statusCode >= 400
    ).length;
    if (urlBans > 0) {
      probability += urlBans * 10;
      riskFactors.push(`URL забанен ${urlBans} раз`);
      recommendations.push('Использовать альтернативный endpoint');
    }

    // Анализ User-Agent
    const uaBans = this.banEvents.filter(e => 
      e.userAgent === request.userAgent && e.statusCode >= 400
    ).length;
    if (uaBans > 0) {
      probability += uaBans * 15;
      riskFactors.push(`User-Agent забанен ${uaBans} раз`);
      recommendations.push('Сменить User-Agent');
    }

    // Анализ времени
    const hourlyBans = this.getBansByHour();
    if (hourlyBans[request.timeOfDay] > 5) {
      probability += 20;
      riskFactors.push('Пиковое время для банов');
      recommendations.push('Перенести активность на другое время');
    }

    // Анализ частоты
    if (request.requestCount > 50) {
      probability += 25;
      riskFactors.push('Высокая частота запросов');
      recommendations.push('Снизить частоту запросов');
    }

    return {
      probability: Math.min(probability, 100),
      riskFactors,
      recommendations
    };
  }

  // Вспомогательные методы
  private getBansByHour(): number[] {
    const hours = new Array(24).fill(0);
    this.banEvents.filter(e => e.statusCode >= 400).forEach(event => {
      hours[event.timeOfDay]++;
    });
    return hours;
  }

  private getBansByDay(): number[] {
    const days = new Array(7).fill(0);
    this.banEvents.filter(e => e.statusCode >= 400).forEach(event => {
      days[event.dayOfWeek]++;
    });
    return days;
  }

  private getBansByRegion(): Record<string, number> {
    const regions: Record<string, number> = {};
    this.banEvents.filter(e => e.statusCode >= 400).forEach(event => {
      regions[event.region] = (regions[event.region] || 0) + 1;
    });
    return regions;
  }

  private getBansByUserAgent(): Record<string, number> {
    const userAgents: Record<string, number> = {};
    this.banEvents.filter(e => e.statusCode >= 400).forEach(event => {
      const shortUA = event.userAgent.substring(0, 50) + '...';
      userAgents[shortUA] = (userAgents[shortUA] || 0) + 1;
    });
    return userAgents;
  }

  private getBansByProxyType(): Record<string, number> {
    const proxyTypes: Record<string, number> = {};
    this.banEvents.filter(e => e.statusCode >= 400).forEach(event => {
      proxyTypes[event.proxyType] = (proxyTypes[event.proxyType] || 0) + 1;
    });
    return proxyTypes;
  }

  private getTopBannedUrls(): Array<{ url: string; count: number }> {
    const urls: Record<string, number> = {};
    this.banEvents.filter(e => e.statusCode >= 400).forEach(event => {
      const shortUrl = event.url.split('?')[0];
      urls[shortUrl] = (urls[shortUrl] || 0) + 1;
    });

    return Object.entries(urls)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getAverageResponseTime(): number {
    const times = this.banEvents.map(e => e.responseTime);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  private getSuccessRate(): number {
    const total = this.banEvents.length;
    const successful = this.banEvents.filter(e => e.statusCode < 400).length;
    return total > 0 ? (successful / total) * 100 : 100;
  }

  private getRecentEvents(seconds: number): BanEvent[] {
    const cutoff = new Date(Date.now() - seconds * 1000);
    return this.banEvents.filter(e => e.timestamp >= cutoff);
  }

  private extractQueryParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch (error) {
      // Ignore invalid URLs
    }
    return params;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateSessionId(): string {
    return 'session_' + this.generateId();
  }

  private initializePatterns(): void {
    // Инициализируем базовые паттерны
    this.patterns = [];
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('wb-ban-events', JSON.stringify(this.banEvents.slice(0, 1000)));
      localStorage.setItem('wb-ban-patterns', JSON.stringify(this.patterns));
    } catch (error) {
      console.warn('Ошибка сохранения аналитики банов:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const events = localStorage.getItem('wb-ban-events');
      const patterns = localStorage.getItem('wb-ban-patterns');
      
      if (events) {
        this.banEvents = JSON.parse(events).map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
          lastSeen: new Date(e.lastSeen)
        }));
      }
      
      if (patterns) {
        this.patterns = JSON.parse(patterns).map((p: any) => ({
          ...p,
          lastSeen: new Date(p.lastSeen)
        }));
      }
    } catch (error) {
      console.warn('Ошибка загрузки аналитики банов:', error);
    }
  }

  /**
   * 🧹 Очистка старых данных
   */
  public cleanup(): void {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.banEvents = this.banEvents.filter(e => e.timestamp >= weekAgo);
    this.patterns = this.patterns.filter(p => p.lastSeen >= weekAgo);
    this.saveToStorage();
    console.log('🧹 Очистка старых данных аналитики завершена');
  }
}

// Экспортируем singleton
export const banAnalyticsService = new BanAnalyticsService();
export default BanAnalyticsService;
export type { BanEvent, BanPattern, BanAnalytics };
