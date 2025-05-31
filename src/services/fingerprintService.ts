/**
 * 🎭 Продвинутый генератор fingerprint для маскировки
 * Эмулирует реальные браузеры и устройства
 */

interface DeviceProfile {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  webgl: {
    vendor: string;
    renderer: string;
  };
}

interface BrowserFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  accept: string;
  referer: string;
  origin?: string;
  dnt?: string;
  upgradeInsecureRequests?: string;
  secFetchSite?: string;
  secFetchMode?: string;
  secFetchDest?: string;
  secFetchUser?: string;
  secChUa?: string;
  secChUaMobile?: string;
  secChUaPlatform?: string;
  cacheControl?: string;
  pragma?: string;
  connection?: string;
  xRequestedWith?: string;
}

interface TLSFingerprint {
  ja3: string;
  cipherSuites: string[];
  extensions: string[];
  ellipticCurves: string[];
  pointFormats: string[];
}

interface BehavioralPattern {
  scrollSpeed: number; // пикселей в секунду
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  clickDelay: number; // мс между наведением и кликом
  typingSpeed: number; // символов в минуту
  pauseBetweenActions: number; // мс между действиями
  readingTime: number; // мс на чтение контента
}

class FingerprintService {
  private deviceProfiles: DeviceProfile[] = [];
  private currentProfile: DeviceProfile | null = null;
  private behavioralPattern: BehavioralPattern | null = null;

  constructor() {
    this.initializeDeviceProfiles();
    this.generateNewProfile();
  }

  /**
   * 📱 Инициализация профилей устройств
   */
  private initializeDeviceProfiles(): void {
    this.deviceProfiles = [
      // iPhone профили
      {
        type: 'mobile',
        os: 'iOS',
        browser: 'Safari',
        version: '17.0',
        screen: { width: 390, height: 844, pixelRatio: 3 },
        viewport: { width: 390, height: 664 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        language: 'ru-RU',
        timezone: 'Europe/Moscow',
        webgl: { vendor: 'Apple Inc.', renderer: 'Apple GPU' }
      },
      {
        type: 'mobile',
        os: 'iOS',
        browser: 'Safari',
        version: '16.6',
        screen: { width: 414, height: 896, pixelRatio: 2 },
        viewport: { width: 414, height: 719 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        language: 'ru-RU',
        timezone: 'Europe/Moscow',
        webgl: { vendor: 'Apple Inc.', renderer: 'Apple A15 GPU' }
      },
      // Android профили
      {
        type: 'mobile',
        os: 'Android',
        browser: 'Chrome',
        version: '119.0',
        screen: { width: 412, height: 915, pixelRatio: 2.625 },
        viewport: { width: 412, height: 781 },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        language: 'ru-RU',
        timezone: 'Europe/Moscow',
        webgl: { vendor: 'Qualcomm', renderer: 'Adreno (TM) 660' }
      },
      {
        type: 'mobile',
        os: 'Android',
        browser: 'Chrome',
        version: '118.0',
        screen: { width: 393, height: 851, pixelRatio: 2.75 },
        viewport: { width: 393, height: 727 },
        userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        language: 'ru-RU',
        timezone: 'Europe/Moscow',
        webgl: { vendor: 'ARM', renderer: 'Mali-G78 MP20' }
      },
      // Desktop профили
      {
        type: 'desktop',
        os: 'Windows',
        browser: 'Chrome',
        version: '119.0',
        screen: { width: 1920, height: 1080, pixelRatio: 1 },
        viewport: { width: 1920, height: 937 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        platform: 'Win32',
        language: 'ru-RU',
        timezone: 'Europe/Moscow',
        webgl: { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)' }
      },
      {
        type: 'desktop',
        os: 'macOS',
        browser: 'Safari',
        version: '17.0',
        screen: { width: 2560, height: 1440, pixelRatio: 2 },
        viewport: { width: 2560, height: 1297 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        platform: 'MacIntel',
        language: 'ru-RU',
        timezone: 'Europe/Moscow',
        webgl: { vendor: 'Apple Inc.', renderer: 'Apple M1 Pro' }
      }
    ];
  }

  /**
   * 🎲 Генерация нового профиля
   */
  public generateNewProfile(): DeviceProfile {
    // Выбираем случайный профиль с весами (мобильные устройства чаще)
    const weights = this.deviceProfiles.map(profile => 
      profile.type === 'mobile' ? 0.7 : 0.3
    );
    
    const randomIndex = this.weightedRandom(weights);
    this.currentProfile = { ...this.deviceProfiles[randomIndex] };

    // Добавляем небольшие вариации
    this.addProfileVariations();

    // Генерируем поведенческий паттерн
    this.generateBehavioralPattern();

    console.log('🎭 Сгенерирован новый fingerprint:', this.currentProfile.type, this.currentProfile.browser);
    return this.currentProfile;
  }

  /**
   * 🔀 Добавление вариаций в профиль
   */
  private addProfileVariations(): void {
    if (!this.currentProfile) return;

    // Небольшие вариации в размерах экрана
    const screenVariation = Math.floor(Math.random() * 20) - 10;
    this.currentProfile.screen.width += screenVariation;
    this.currentProfile.viewport.width += screenVariation;

    // Вариации в версии браузера
    if (this.currentProfile.browser === 'Chrome') {
      const minorVersion = Math.floor(Math.random() * 10);
      this.currentProfile.version = this.currentProfile.version.split('.')[0] + `.0.${minorVersion}`;
      this.currentProfile.userAgent = this.currentProfile.userAgent.replace(
        /Chrome\/[\d.]+/,
        `Chrome/${this.currentProfile.version}.0`
      );
    }

    // Случайные языки (с приоритетом русского)
    const languages = ['ru-RU', 'ru-RU,ru;q=0.9', 'ru-RU,ru;q=0.9,en;q=0.8'];
    this.currentProfile.language = languages[Math.floor(Math.random() * languages.length)];

    // Случайные таймзоны России
    const timezones = ['Europe/Moscow', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Novosibirsk'];
    this.currentProfile.timezone = timezones[Math.floor(Math.random() * timezones.length)];
  }

  /**
   * 🧠 Генерация поведенческого паттерна
   */
  private generateBehavioralPattern(): void {
    this.behavioralPattern = {
      scrollSpeed: 200 + Math.random() * 300, // 200-500 пикселей/сек
      mouseMovements: this.generateMouseMovements(),
      clickDelay: 100 + Math.random() * 400, // 100-500 мс
      typingSpeed: 180 + Math.random() * 120, // 180-300 символов/мин
      pauseBetweenActions: 500 + Math.random() * 2000, // 0.5-2.5 сек
      readingTime: 1000 + Math.random() * 3000 // 1-4 сек на чтение
    };
  }

  /**
   * 🖱️ Генерация движений мыши
   */
  private generateMouseMovements(): Array<{ x: number; y: number; timestamp: number }> {
    const movements = [];
    const startTime = Date.now();
    let currentX = Math.random() * 800;
    let currentY = Math.random() * 600;

    for (let i = 0; i < 10; i++) {
      currentX += (Math.random() - 0.5) * 100;
      currentY += (Math.random() - 0.5) * 100;
      
      movements.push({
        x: Math.max(0, Math.min(800, currentX)),
        y: Math.max(0, Math.min(600, currentY)),
        timestamp: startTime + i * (100 + Math.random() * 200)
      });
    }

    return movements;
  }

  /**
   * 🌐 Генерация HTTP заголовков
   */
  public generateBrowserHeaders(url?: string): BrowserFingerprint {
    if (!this.currentProfile) {
      this.generateNewProfile();
    }

    const profile = this.currentProfile!;
    const headers: BrowserFingerprint = {
      userAgent: profile.userAgent,
      acceptLanguage: profile.language,
      acceptEncoding: 'gzip, deflate, br',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      referer: this.generateReferer(url)
    };

    // Добавляем специфичные для браузера заголовки
    if (profile.browser === 'Chrome') {
      headers.secChUa = `"Chromium";v="${profile.version.split('.')[0]}", "Not A(Brand";v="99"`;
      headers.secChUaMobile = profile.type === 'mobile' ? '?1' : '?0';
      headers.secChUaPlatform = `"${profile.os}"`;
      headers.secFetchSite = 'same-origin';
      headers.secFetchMode = 'navigate';
      headers.secFetchDest = 'document';
      headers.secFetchUser = '?1';
      headers.upgradeInsecureRequests = '1';
    }

    // Случайные дополнительные заголовки
    if (Math.random() > 0.5) {
      headers.dnt = '1';
    }

    if (Math.random() > 0.3) {
      headers.cacheControl = 'max-age=0';
      headers.pragma = 'no-cache';
    }

    if (profile.type === 'mobile' && Math.random() > 0.4) {
      headers.xRequestedWith = 'XMLHttpRequest';
    }

    return headers;
  }

  /**
   * 🔗 Генерация реалистичного referer
   */
  private generateReferer(currentUrl?: string): string {
    const referers = [
      'https://www.google.com/',
      'https://yandex.ru/',
      'https://wildberries.ru/',
      'https://m.wildberries.ru/',
      'https://www.wildberries.ru/catalog',
      ''
    ];

    // Если это не первый запрос, используем WB как referer
    if (currentUrl && currentUrl.includes('wildberries')) {
      return Math.random() > 0.3 ? 'https://www.wildberries.ru/' : '';
    }

    return referers[Math.floor(Math.random() * referers.length)];
  }

  /**
   * 🔐 Генерация TLS fingerprint
   */
  public generateTLSFingerprint(): TLSFingerprint {
    const profile = this.currentProfile!;
    
    // Различные TLS конфигурации для разных браузеров
    if (profile.browser === 'Chrome') {
      return {
        ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
        cipherSuites: ['TLS_AES_128_GCM_SHA256', 'TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
        extensions: ['server_name', 'extended_master_secret', 'renegotiation_info'],
        ellipticCurves: ['X25519', 'P-256', 'P-384'],
        pointFormats: ['uncompressed']
      };
    } else if (profile.browser === 'Safari') {
      return {
        ja3: '771,4865-4866-4867-49196-49195-52393-49200-49199-52392-49162-49161-49172-49171-157-156-53-47,65281-0-23-35-13-5-18-16-30032-10-12-27-17513,29-23-30-25-24,0-1-2',
        cipherSuites: ['TLS_AES_128_GCM_SHA256', 'TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
        extensions: ['server_name', 'status_request', 'supported_groups'],
        ellipticCurves: ['X25519', 'P-256', 'P-384', 'P-521'],
        pointFormats: ['uncompressed', 'ansiX962_compressed_prime', 'ansiX962_compressed_char2']
      };
    }

    // Fallback для других браузеров
    return {
      ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392,0-23-65281-10-11-35-16-5-13,29-23-24,0',
      cipherSuites: ['TLS_AES_128_GCM_SHA256', 'TLS_AES_256_GCM_SHA384'],
      extensions: ['server_name', 'extended_master_secret'],
      ellipticCurves: ['X25519', 'P-256'],
      pointFormats: ['uncompressed']
    };
  }

  /**
   * 🎯 Получение текущего профиля
   */
  public getCurrentProfile(): DeviceProfile | null {
    return this.currentProfile;
  }

  /**
   * 🎭 Получение поведенческого паттерна
   */
  public getBehavioralPattern(): BehavioralPattern | null {
    return this.behavioralPattern;
  }

  /**
   * 🔄 Ротация профиля
   */
  public rotateProfile(): DeviceProfile {
    return this.generateNewProfile();
  }

  /**
   * 📊 Статистика использования профилей
   */
  public getProfileStats(): {
    currentProfile: DeviceProfile | null;
    totalProfiles: number;
    profileTypes: Record<string, number>;
  } {
    const profileTypes: Record<string, number> = {};
    this.deviceProfiles.forEach(profile => {
      const key = `${profile.type}-${profile.browser}`;
      profileTypes[key] = (profileTypes[key] || 0) + 1;
    });

    return {
      currentProfile: this.currentProfile,
      totalProfiles: this.deviceProfiles.length,
      profileTypes
    };
  }

  /**
   * 🎲 Взвешенный случайный выбор
   */
  private weightedRandom(weights: number[]): number {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i;
      }
    }
    
    return weights.length - 1;
  }

  /**
   * 🧪 Тестирование fingerprint
   */
  public testFingerprint(): {
    uniqueness: number;
    realism: number;
    recommendations: string[];
  } {
    const profile = this.currentProfile;
    if (!profile) {
      return {
        uniqueness: 0,
        realism: 0,
        recommendations: ['Сгенерируйте профиль']
      };
    }

    let uniqueness = 50;
    let realism = 50;
    const recommendations: string[] = [];

    // Проверка уникальности
    if (profile.type === 'mobile') uniqueness += 20;
    if (profile.browser === 'Safari' && profile.os === 'iOS') uniqueness += 15;
    if (profile.language.includes('ru')) uniqueness += 10;

    // Проверка реалистичности
    if (profile.screen.width > 0 && profile.screen.height > 0) realism += 20;
    if (profile.userAgent.includes(profile.browser)) realism += 15;
    if (profile.timezone.includes('Europe') || profile.timezone.includes('Asia')) realism += 15;

    // Рекомендации
    if (uniqueness < 70) {
      recommendations.push('Добавить больше вариаций в профиль');
    }
    if (realism < 70) {
      recommendations.push('Улучшить соответствие компонентов профиля');
    }

    return {
      uniqueness: Math.min(uniqueness, 100),
      realism: Math.min(realism, 100),
      recommendations
    };
  }
}

// Экспортируем singleton
export const fingerprintService = new FingerprintService();
export default FingerprintService;
export type { DeviceProfile, BrowserFingerprint, TLSFingerprint, BehavioralPattern };
