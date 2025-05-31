# 🔒 Архитектура безопасности

**Версия:** 1.0  
**Дата:** 27 января 2025  
**Проект:** Ozon Slot Finder & Price Optimizer Pro

---

## 🏗️ Общая архитектура безопасности

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web App] --> B[Mobile App]
        B --> C[Telegram Bot]
    end
    
    subgraph "Security Gateway"
        D[Cloudflare WAF] --> E[Rate Limiter]
        E --> F[DDoS Protection]
        F --> G[SSL/TLS Termination]
    end
    
    subgraph "Authentication Layer"
        H[JWT Service] --> I[MFA Service]
        I --> J[OAuth2 Provider]
        J --> K[RBAC Engine]
    end
    
    subgraph "Application Layer"
        L[API Gateway] --> M[Microservices]
        M --> N[Business Logic]
        N --> O[Data Validation]
    end
    
    subgraph "Data Layer"
        P[Encrypted Database] --> Q[Audit Logs]
        Q --> R[Backup Storage]
        R --> S[Key Management]
    end
    
    A --> D
    G --> H
    K --> L
    O --> P
```

---

## 🔐 Система аутентификации

### JWT Token Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as Auth Service
    participant R as Redis
    participant API as API Gateway
    
    U->>C: Login (email, password)
    C->>A: POST /auth/login
    A->>A: Validate credentials
    A->>A: Generate Access Token (15min)
    A->>A: Generate Refresh Token (7d)
    A->>R: Store refresh token
    A->>C: Return tokens
    C->>C: Store tokens securely
    
    Note over C: Access token expires
    
    C->>A: POST /auth/refresh
    A->>R: Validate refresh token
    A->>A: Generate new access token
    A->>R: Rotate refresh token
    A->>C: Return new tokens
    
    C->>API: API call with access token
    API->>API: Validate JWT signature
    API->>API: Check token expiry
    API->>API: Extract user claims
    API->>C: Return response
```

### Multi-Factor Authentication Flow
```mermaid
graph LR
    A[User Login] --> B{MFA Enabled?}
    B -->|No| C[Access Granted]
    B -->|Yes| D[Send TOTP Challenge]
    D --> E[User Enters Code]
    E --> F{Valid Code?}
    F -->|No| G[Access Denied]
    F -->|Yes| H[Generate Session]
    H --> C
    
    subgraph "Backup Methods"
        I[SMS Code]
        J[Email Code]
        K[Recovery Codes]
    end
    
    D --> I
    D --> J
    D --> K
```

---

## 🛡️ Rate Limiting Architecture

### Multi-Layer Rate Limiting
```mermaid
graph TD
    A[Incoming Request] --> B[Cloudflare Layer]
    B --> C{Global Rate Limit}
    C -->|Exceeded| D[Block Request]
    C -->|OK| E[Application Layer]
    
    E --> F{IP-based Limit}
    F -->|Exceeded| G[429 Response]
    F -->|OK| H{User-based Limit}
    
    H -->|Exceeded| I[User Rate Limited]
    H -->|OK| J{Endpoint Limit}
    
    J -->|Exceeded| K[Endpoint Limited]
    J -->|OK| L[Process Request]
    
    subgraph "Rate Limit Storage"
        M[Redis Cluster]
        N[Sliding Window]
        O[Token Bucket]
    end
    
    F --> M
    H --> N
    J --> O
```

### Rate Limiting Rules
```typescript
interface RateLimitRule {
  endpoint: string;
  method: string;
  limits: {
    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  scope: 'ip' | 'user' | 'api_key';
  action: 'block' | 'throttle' | 'captcha';
}

const rateLimitRules: RateLimitRule[] = [
  {
    endpoint: '/auth/login',
    method: 'POST',
    limits: { perSecond: 1, perMinute: 5, perHour: 20, perDay: 100 },
    scope: 'ip',
    action: 'block'
  },
  {
    endpoint: '/api/slots/book',
    method: 'POST',
    limits: { perSecond: 2, perMinute: 10, perHour: 50, perDay: 200 },
    scope: 'user',
    action: 'throttle'
  },
  {
    endpoint: '/api/prices/update',
    method: 'PUT',
    limits: { perSecond: 5, perMinute: 30, perHour: 100, perDay: 500 },
    scope: 'user',
    action: 'throttle'
  }
];
```

---

## 📊 Audit Logging System

### Audit Event Flow
```mermaid
graph LR
    A[User Action] --> B[Event Interceptor]
    B --> C[Event Enrichment]
    C --> D[Risk Assessment]
    D --> E[Log Formatting]
    E --> F[Async Queue]
    F --> G[Log Storage]
    
    subgraph "Event Enrichment"
        H[User Context]
        I[Session Info]
        J[IP Geolocation]
        K[Device Fingerprint]
    end
    
    subgraph "Risk Assessment"
        L[Anomaly Detection]
        M[Threat Intelligence]
        N[Behavioral Analysis]
    end
    
    subgraph "Storage"
        O[Elasticsearch]
        P[S3 Archive]
        Q[SIEM Integration]
    end
    
    C --> H
    D --> L
    G --> O
```

### Audit Event Schema
```typescript
interface AuditEvent {
  // Базовая информация
  id: string;
  timestamp: string;
  version: string;
  
  // Событие
  eventType: 'AUTH' | 'BUSINESS' | 'ADMIN' | 'SECURITY';
  action: string;
  result: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  
  // Пользователь
  actor: {
    userId?: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    location?: {
      country: string;
      city: string;
      coordinates?: [number, number];
    };
  };
  
  // Ресурс
  resource?: {
    type: string;
    id: string;
    name?: string;
    attributes?: Record<string, any>;
  };
  
  // Изменения
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields: string[];
  };
  
  // Безопасность
  security: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    threats: string[];
    anomalies: string[];
  };
  
  // Метаданные
  metadata: {
    requestId: string;
    correlationId: string;
    source: string;
    tags: string[];
  };
}
```

---

## 🔄 Backup & Recovery Architecture

### Backup Strategy
```mermaid
graph TB
    subgraph "Production Environment"
        A[Primary Database] --> B[Read Replicas]
        C[Application Servers] --> D[File Storage]
        E[Configuration] --> F[Secrets]
    end
    
    subgraph "Backup Types"
        G[Full Backup] --> H[Incremental]
        H --> I[Transaction Log]
        I --> J[Configuration Snapshot]
    end
    
    subgraph "Storage Tiers"
        K[Hot Storage - S3] --> L[Warm Storage - IA]
        L --> M[Cold Storage - Glacier]
        M --> N[Archive - Deep Archive]
    end
    
    subgraph "Recovery Scenarios"
        O[Point-in-Time Recovery] --> P[Cross-Region Recovery]
        P --> Q[Disaster Recovery]
        Q --> R[Data Center Failover]
    end
    
    A --> G
    G --> K
    K --> O
```

### Recovery Time Objectives (RTO/RPO)
```mermaid
graph LR
    subgraph "Service Tiers"
        A[Tier 1 - Critical<br/>RTO: 1h, RPO: 15min]
        B[Tier 2 - Important<br/>RTO: 4h, RPO: 1h]
        C[Tier 3 - Standard<br/>RTO: 24h, RPO: 4h]
    end
    
    subgraph "Critical Services"
        D[Authentication]
        E[Slot Booking]
        F[Price Updates]
        G[Payment Processing]
    end
    
    subgraph "Important Services"
        H[Analytics]
        I[Notifications]
        J[Reporting]
        K[User Management]
    end
    
    subgraph "Standard Services"
        L[Logs]
        M[Archives]
        N[Documentation]
        O[Development Tools]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    
    B --> H
    B --> I
    B --> J
    B --> K
    
    C --> L
    C --> M
    C --> N
    C --> O
```

---

## 🔍 Security Monitoring

### SIEM Integration
```mermaid
graph TB
    subgraph "Data Sources"
        A[Application Logs] --> B[System Logs]
        B --> C[Network Logs]
        C --> D[Security Events]
        D --> E[User Activities]
    end
    
    subgraph "Collection Layer"
        F[Log Agents] --> G[API Collectors]
        G --> H[Network Probes]
        H --> I[File Watchers]
    end
    
    subgraph "Processing Layer"
        J[Normalization] --> K[Enrichment]
        K --> L[Correlation]
        L --> M[Analysis]
    end
    
    subgraph "Detection Engine"
        N[Rule-based Detection] --> O[ML Anomaly Detection]
        O --> P[Behavioral Analysis]
        P --> Q[Threat Intelligence]
    end
    
    subgraph "Response Layer"
        R[Automated Response] --> S[Alert Generation]
        S --> T[Incident Creation]
        T --> U[Notification]
    end
    
    A --> F
    F --> J
    J --> N
    N --> R
```

### Security Metrics Dashboard
```typescript
interface SecurityMetrics {
  // Аутентификация
  authentication: {
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    suspiciousLogins: number;
  };
  
  // API Security
  apiSecurity: {
    totalRequests: number;
    blockedRequests: number;
    rateLimitedRequests: number;
    maliciousRequests: number;
  };
  
  // Угрозы
  threats: {
    detectedThreats: number;
    blockedAttacks: number;
    falsePositives: number;
    criticalAlerts: number;
  };
  
  // Соответствие требованиям
  compliance: {
    gdprRequests: number;
    dataRetentionViolations: number;
    accessReviews: number;
    policyViolations: number;
  };
  
  // Производительность безопасности
  performance: {
    authenticationLatency: number;
    encryptionOverhead: number;
    scanningTime: number;
    responseTime: number;
  };
}
```

---

## 🔐 Encryption Standards

### Data Encryption Matrix
| Data Type | At Rest | In Transit | In Use |
|-----------|---------|------------|--------|
| **User Credentials** | AES-256-GCM | TLS 1.3 | Hashed (bcrypt) |
| **Personal Data** | AES-256-GCM | TLS 1.3 | Field-level encryption |
| **Financial Data** | AES-256-GCM | TLS 1.3 | Tokenization |
| **API Keys** | AES-256-GCM | TLS 1.3 | Vault storage |
| **Session Data** | AES-256-GCM | TLS 1.3 | JWT encryption |
| **Logs** | AES-256-GCM | TLS 1.3 | Selective encryption |
| **Backups** | AES-256-GCM | TLS 1.3 | Full encryption |
| **Configuration** | AES-256-GCM | TLS 1.3 | Secret management |

### Key Management
```mermaid
graph TB
    subgraph "Key Hierarchy"
        A[Master Key] --> B[Data Encryption Keys]
        B --> C[Field Encryption Keys]
        C --> D[Session Keys]
    end
    
    subgraph "Key Storage"
        E[Hardware Security Module] --> F[AWS KMS]
        F --> G[HashiCorp Vault]
        G --> H[Local Key Store]
    end
    
    subgraph "Key Lifecycle"
        I[Generation] --> J[Distribution]
        J --> K[Usage]
        K --> L[Rotation]
        L --> M[Revocation]
        M --> N[Destruction]
    end
    
    subgraph "Access Control"
        O[Role-based Access] --> P[Multi-person Control]
        P --> Q[Audit Trail]
        Q --> R[Emergency Access]
    end
    
    A --> E
    E --> I
    I --> O
```

---

## 🚨 Incident Response Plan

### Incident Classification
```mermaid
graph LR
    A[Security Event] --> B{Severity Assessment}
    
    B --> C[Low - P4<br/>Response: 24h<br/>Examples: Failed login attempts]
    B --> D[Medium - P3<br/>Response: 4h<br/>Examples: Suspicious activity]
    B --> E[High - P2<br/>Response: 1h<br/>Examples: Data breach attempt]
    B --> F[Critical - P1<br/>Response: 15min<br/>Examples: Active attack]
    
    subgraph "Response Actions"
        G[Monitor] --> H[Investigate]
        H --> I[Contain]
        I --> J[Eradicate]
        J --> K[Recover]
        K --> L[Lessons Learned]
    end
    
    C --> G
    D --> H
    E --> I
    F --> I
```

### Automated Response Playbooks
```typescript
interface SecurityPlaybook {
  id: string;
  name: string;
  triggers: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  actions: {
    immediate: Action[];
    investigation: Action[];
    containment: Action[];
    recovery: Action[];
  };
  
  notifications: {
    teams: string[];
    escalation: EscalationRule[];
    external: ExternalNotification[];
  };
  
  sla: {
    responseTime: number;
    resolutionTime: number;
    updateFrequency: number;
  };
}

interface Action {
  type: 'BLOCK_IP' | 'DISABLE_USER' | 'ISOLATE_SYSTEM' | 'COLLECT_EVIDENCE';
  parameters: Record<string, any>;
  timeout: number;
  rollback?: Action;
}
```
