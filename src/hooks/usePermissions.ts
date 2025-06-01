import { useAuth } from '../context/AuthContext';
import { hasPermission, hasRole, UserRole } from '../types/auth';

/**
 * Хук для проверки разрешений пользователя
 */
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasRole: (role: UserRole) => hasRole(user, role),
    isAdmin: () => hasRole(user, UserRole.ADMIN),
    isManager: () => hasRole(user, UserRole.MANAGER) || hasRole(user, UserRole.ADMIN),
    isSeller: () => hasRole(user, UserRole.SELLER) || hasRole(user, UserRole.MANAGER) || hasRole(user, UserRole.ADMIN),
    canView: (resource: string) => hasPermission(user, `${resource}.view`),
    canEdit: (resource: string) => hasPermission(user, `${resource}.edit`),
    canCreate: (resource: string) => hasPermission(user, `${resource}.create`),
    canDelete: (resource: string) => hasPermission(user, `${resource}.delete`),
    canManage: (resource: string) => hasPermission(user, `${resource}.manage`),
    canApply: (resource: string) => hasPermission(user, `${resource}.apply`),
    
    // Специфичные проверки для основных ресурсов
    canViewProducts: () => hasPermission(user, 'products.view'),
    canCreateProducts: () => hasPermission(user, 'products.create'),
    canEditProducts: () => hasPermission(user, 'products.edit'),
    canDeleteProducts: () => hasPermission(user, 'products.delete'),
    
    canViewStrategies: () => hasPermission(user, 'strategies.view'),
    canCreateStrategies: () => hasPermission(user, 'strategies.create'),
    canEditStrategies: () => hasPermission(user, 'strategies.edit'),
    canApplyStrategies: () => hasPermission(user, 'strategies.apply'),
    
    canViewCompetitors: () => hasPermission(user, 'competitors.view'),
    canManageCompetitors: () => hasPermission(user, 'competitors.manage'),
    
    canViewPrices: () => hasPermission(user, 'prices.view'),
    canEditPrices: () => hasPermission(user, 'prices.edit'),
    canManagePrices: () => hasPermission(user, 'prices.manage'),
    
    canViewReports: () => hasPermission(user, 'reports.view'),
    canCreateReports: () => hasPermission(user, 'reports.create'),
    
    canViewUsers: () => hasPermission(user, 'users.view'),
    canManageUsers: () => hasPermission(user, 'users.manage'),
    
    canViewSystem: () => hasPermission(user, 'system.view'),
    canManageSystem: () => hasPermission(user, 'system.manage'),
    
    canViewSecurity: () => hasPermission(user, 'security.view'),
    canManageSecurity: () => hasPermission(user, 'security.manage'),
    
    canViewAnalytics: () => hasPermission(user, 'analytics.view'),
    canManageAnalytics: () => hasPermission(user, 'analytics.manage'),
    
    // Получение текущего пользователя и его роли
    getCurrentUser: () => user,
    getCurrentRole: () => user?.role || null,
    isAuthenticated: () => !!user,
  };
};
