export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  ozonApiCredentials?: OzonApiCredentials;
  settings?: UserSettings;
  notificationPreferences?: NotificationPreferences;
}

export interface OzonApiCredentials {
  clientId: string;
  apiKey: string;
  isValid: boolean;
  lastValidated?: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
  language: 'ru' | 'en';
  defaultPricingStrategy?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  telegram: boolean;
  telegramChatId: string;
  priorityWarehouses: string[];
  priorityTimeSlots: string[];
}

export enum UserRole {
  ADMIN = 'admin',      // Администратор - полный доступ
  SELLER = 'seller',    // Продавец - основные функции
  MANAGER = 'manager',  // Менеджер - расширенные функции
  VIEWER = 'viewer'     // Наблюдатель - только просмотр
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  updateOzonApiCredentials: (credentials: OzonApiCredentials) => Promise<boolean>;
  validateOzonApiCredentials: (credentials: OzonApiCredentials) => Promise<boolean>;
  clearError: () => void;
}

// Разрешения для разных ролей
export const ROLE_PERMISSIONS = {
  [UserRole.VIEWER]: [
    'products.view',
    'competitors.view',
    'prices.view',
    'reports.view'
  ],
  [UserRole.SELLER]: [
    'products.view',
    'products.create',
    'products.edit',
    'strategies.view',
    'strategies.create',
    'strategies.edit',
    'strategies.apply',
    'competitors.view',
    'prices.view',
    'prices.edit',
    'reports.view',
    'profile.edit'
  ],
  [UserRole.MANAGER]: [
    'products.view',
    'products.create',
    'products.edit',
    'products.moderate',
    'strategies.view',
    'strategies.create',
    'strategies.edit',
    'strategies.apply',
    'strategies.manage',
    'competitors.view',
    'competitors.manage',
    'prices.view',
    'prices.edit',
    'prices.manage',
    'reports.view',
    'reports.create',
    'users.view',
    'profile.edit'
  ],
  [UserRole.ADMIN]: [
    'products.*',
    'strategies.*',
    'competitors.*',
    'prices.*',
    'reports.*',
    'users.*',
    'system.*',
    'monitoring.*',
    'security.*',
    'integration.*',
    'analytics.*',
    'profile.*'
  ]
};

// Проверка разрешений
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];

  // Проверяем точное совпадение
  if (userPermissions.includes(permission)) return true;

  // Проверяем wildcard разрешения (например, products.*)
  const wildcardPermissions = userPermissions.filter(p => p.endsWith('.*'));
  for (const wildcardPerm of wildcardPermissions) {
    const prefix = wildcardPerm.replace('.*', '');
    if (permission.startsWith(prefix)) return true;
  }

  return false;
};

// Проверка роли
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

// Проверка на админа
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, UserRole.ADMIN);
};

// Проверка на менеджера или выше
export const isManager = (user: User | null): boolean => {
  return hasRole(user, UserRole.MANAGER) || isAdmin(user);
};

// Проверка на продавца или выше
export const isSeller = (user: User | null): boolean => {
  return hasRole(user, UserRole.SELLER) || isManager(user);
};
