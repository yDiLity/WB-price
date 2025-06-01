import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, hasRole, UserRole } from '../../types/auth';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: UserRole;
  fallback?: React.ReactNode;
  showError?: boolean;
}

/**
 * Компонент для проверки разрешений пользователя
 * Показывает контент только если у пользователя есть необходимые права
 */
export default function PermissionGuard({
  children,
  permission,
  role,
  fallback,
  showError = false
}: PermissionGuardProps) {
  const { user } = useAuth();

  // Проверяем разрешения
  const hasAccess = React.useMemo(() => {
    if (!user) return false;

    // Если указано разрешение, проверяем его
    if (permission && !hasPermission(user, permission)) {
      return false;
    }

    // Если указана роль, проверяем её
    if (role && !hasRole(user, role)) {
      return false;
    }

    return true;
  }, [user, permission, role]);

  // Если нет доступа
  if (!hasAccess) {
    // Показываем fallback если он есть
    if (fallback) {
      return <>{fallback}</>;
    }

    // Показываем ошибку если включено
    if (showError) {
      return (
        <Alert status="error" className="purple-alert-border">
          <AlertIcon />
          <AlertTitle>Доступ запрещён</AlertTitle>
          <AlertDescription>
            У вас нет прав для просмотра этого раздела.
            {permission && ` Требуется разрешение: ${permission}`}
            {role && ` Требуется роль: ${role}`}
          </AlertDescription>
        </Alert>
      );
    }

    // По умолчанию ничего не показываем
    return null;
  }

  // Показываем контент если есть доступ
  return <>{children}</>;
}

/**
 * Хук для проверки разрешений
 */
export function usePermissions() {
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
    canManage: (resource: string) => hasPermission(user, `${resource}.manage`) || hasPermission(user, `${resource}.*`)
  };
}
