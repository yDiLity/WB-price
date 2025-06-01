import { UserRole } from '../types/auth';

export interface MenuItem {
  label: string;
  to: string;
  icon?: string;
  permission?: string;
  roles?: UserRole[];
  children?: MenuItem[];
  badge?: string;
  isNew?: boolean;
}

/**
 * Конфигурация навигационного меню с разрешениями
 */
export const NAVIGATION_MENU: MenuItem[] = [
  // Основные разделы для всех пользователей
  {
    label: '🏠 Главная',
    to: '/',
    permission: 'system.view'
  },
  {
    label: '👤 Профиль',
    to: '/profile',
    permission: 'profile.view'
  },

  // Разделы для продавцов и выше
  {
    label: '📦 Мои товары',
    to: '/wb-products',
    permission: 'products.view'
  },
  {
    label: '🎯 Стратегии',
    to: '/strategies',
    permission: 'strategies.view',
    roles: [UserRole.SELLER, UserRole.MANAGER, UserRole.ADMIN]
  },
  {
    label: '🔍 Поиск конкурентов',
    to: '/competitors',
    permission: 'competitors.view'
  },
  {
    label: '💰 Управление ценами',
    to: '/pricing',
    permission: 'prices.view'
  },
  {
    label: '📊 Отчеты',
    to: '/reports',
    permission: 'reports.view'
  },

  // Разделы для менеджеров и выше
  {
    label: '🕷️ Парсинг WB',
    to: '/wb-parsing',
    permission: 'system.parsing',
    roles: [UserRole.MANAGER, UserRole.ADMIN]
  },
  {
    label: '🔍 Декодер артикулов',
    to: '/code-decoder',
    permission: 'system.decoder',
    roles: [UserRole.MANAGER, UserRole.ADMIN]
  },

  // Административные разделы (только для админов)
  {
    label: '👥 Пользователи',
    to: '/users',
    permission: 'users.view',
    roles: [UserRole.ADMIN]
  },
  {
    label: '📊 Мониторинг',
    to: '/monitoring',
    permission: 'monitoring.view',
    roles: [UserRole.ADMIN]
  },
  {
    label: '🛡️ Защита WB',
    to: '/wb-protection',
    permission: 'security.view',
    roles: [UserRole.ADMIN]
  },
  {
    label: '🧪 Тест WB API',
    to: '/wb-api-test',
    permission: 'system.api',
    roles: [UserRole.SELLER, UserRole.MANAGER, UserRole.ADMIN],
    isNew: true
  },
  {
    label: '🧠 Аналитика банов',
    to: '/ban-analytics',
    permission: 'analytics.view',
    roles: [UserRole.ADMIN],
    isNew: true
  },
  {
    label: '🤖 ML-Аналитика',
    to: '/ml-analytics',
    permission: 'analytics.ml',
    roles: [UserRole.ADMIN]
  },
  {
    label: '🧠 Логический оптимизатор',
    to: '/optimizer',
    permission: 'system.optimizer',
    roles: [UserRole.ADMIN]
  },
  {
    label: '🔌 API WB',
    to: '/api-settings',
    permission: 'system.api',
    roles: [UserRole.ADMIN]
  },
  {
    label: '🔗 Интеграция',
    to: '/integration',
    permission: 'integration.view',
    roles: [UserRole.ADMIN]
  },
  {
    label: '🔒 Настройки безопасности',
    to: '/security-settings',
    permission: 'security.manage',
    roles: [UserRole.ADMIN]
  },

  // Общие настройки
  {
    label: '⚙️ Настройки',
    to: '/settings',
    permission: 'profile.edit'
  }
];

/**
 * Фильтрация меню по разрешениям пользователя
 */
export const filterMenuByPermissions = (
  menu: MenuItem[],
  userRole: UserRole | null,
  hasPermissionFn: (permission: string) => boolean
): MenuItem[] => {
  if (!userRole) return [];

  return menu.filter(item => {
    // Проверяем роли если они указаны
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }

    // Проверяем разрешения если они указаны
    if (item.permission && !hasPermissionFn(item.permission)) {
      return false;
    }

    return true;
  });
};

/**
 * Группировка меню по категориям
 */
export const getMenuGroups = (filteredMenu: MenuItem[]) => {
  return {
    main: filteredMenu.filter(item =>
      ['🏠 Главная', '👤 Профиль', '📦 Мои товары', '🎯 Стратегии', '🔍 Поиск конкурентов', '💰 Управление ценами', '📊 Отчеты'].includes(item.label)
    ),
    tools: filteredMenu.filter(item =>
      ['🕷️ Парсинг WB', '🔍 Декодер артикулов'].includes(item.label)
    ),
    admin: filteredMenu.filter(item =>
      ['👥 Пользователи', '📊 Мониторинг', '🛡️ Защита WB', '🧪 Тест WB API', '🧠 Аналитика банов', '🤖 ML-Аналитика', '🧠 Логический оптимизатор', '🔌 API WB', '🔗 Интеграция', '🔒 Настройки безопасности'].includes(item.label)
    ),
    settings: filteredMenu.filter(item =>
      ['⚙️ Настройки'].includes(item.label)
    )
  };
};

/**
 * Роли и их описания для UI
 */
export const ROLE_DESCRIPTIONS = {
  [UserRole.VIEWER]: {
    name: 'Наблюдатель',
    description: 'Только просмотр данных',
    color: 'gray'
  },
  [UserRole.SELLER]: {
    name: 'Продавец',
    description: 'Управление товарами и ценами',
    color: 'blue'
  },
  [UserRole.MANAGER]: {
    name: 'Менеджер',
    description: 'Расширенные функции и инструменты',
    color: 'green'
  },
  [UserRole.ADMIN]: {
    name: 'Администратор',
    description: 'Полный доступ ко всем функциям',
    color: 'purple'
  }
};
