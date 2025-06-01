import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../auth/PermissionGuard';
import { NAVIGATION_MENU, filterMenuByPermissions, getMenuGroups } from '../../config/navigation';
import { UserRole } from '../../types/auth';
import ThemeToggle from '../ThemeToggle';

/**
 * Навигационная панель с поддержкой ролей
 */
export default function RoleBasedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();

  // Отладка роли пользователя
  console.log('🔐 Navbar: текущий пользователь:', user?.role, user?.username);

  // ПРИНУДИТЕЛЬНАЯ ПРОВЕРКА РОЛИ
  if (user && user.username === 'demo' && user.role !== 'seller') {
    console.log('🔧 ИСПРАВЛЯЕМ роль demo пользователя с', user.role, 'на seller');
    // Обновляем пользователя в localStorage
    const updatedUser = { ...user, role: 'seller' };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.location.reload();
  }

  // Цвета для темной/светлой темы
  const navBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const hoverTextColor = useColorModeValue('blue.600', 'white');
  const logoColor = useColorModeValue('blue.600', 'white');
  const hoverBg = useColorModeValue('rgba(0, 128, 255, 0.05)', 'rgba(0, 128, 255, 0.2)');

  // Фильтруем меню по разрешениям пользователя
  // Если пользователь не авторизован - показываем только базовые разделы
  const filteredMenu = user ? filterMenuByPermissions(
    NAVIGATION_MENU,
    user.role,
    hasPermission
  ) : [
    // Меню для неавторизованных пользователей (гостей)
    { label: 'Главная', to: '/', permission: 'public', category: 'main' },
    { label: 'О системе', to: '/about', permission: 'public', category: 'main' }
  ];

  // Группируем меню
  const menuGroups = getMenuGroups(filteredMenu);

  // Получаем роль пользователя для отображения
  const getRoleDisplay = (role: UserRole) => {
    console.log('🔐 getRoleDisplay вызван с ролью:', role);
    switch (role) {
      case UserRole.ADMIN: return { name: 'Админ', color: '#9333ea' };
      case UserRole.MANAGER: return { name: 'Менеджер', color: '#059669' };
      case UserRole.SELLER: return { name: 'Продавец', color: '#2563eb' };
      case UserRole.VIEWER: return { name: 'Наблюдатель', color: '#6b7280' };
      default: return { name: 'Гость', color: '#6b7280' };
    }
  };

  const roleDisplay = user ? getRoleDisplay(user.role) : { name: 'Гость', color: '#6b7280' };

  return (
    <nav
      className="shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: navBg, borderBottom: `1px solid ${borderColor}` }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: logoColor }}
              >
                <path
                  d="M12 4L4 8L12 12L20 8L12 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 12L12 16L20 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col">
                <span className="font-bold text-lg" style={{ color: textColor }}>
                  WB Finder
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: roleDisplay.color }}
                >
                  {roleDisplay.name}
                </span>
              </div>
            </Link>
          </div>

          {/* Основное меню (десктоп) */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {/* Основные разделы */}
            {menuGroups.main.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: textColor }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = hoverTextColor;
                  e.currentTarget.style.backgroundColor = hoverBg;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = textColor;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
                {item.isNew && (
                  <span className="ml-1 px-1 py-0.5 text-xs bg-green-500 text-white rounded">
                    NEW
                  </span>
                )}
              </Link>
            ))}

            {/* Инструменты (для менеджеров и выше) */}
            {menuGroups.tools.length > 0 && (
              <div className="relative group">
                <button
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  style={{ color: textColor }}
                >
                  🛠️ Инструменты
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                     style={{ backgroundColor: navBg, border: `1px solid ${borderColor}` }}>
                  <div className="py-1">
                    {menuGroups.tools.map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: textColor }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = hoverTextColor;
                          e.currentTarget.style.backgroundColor = hoverBg;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = textColor;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Админские разделы (только для админов) */}
            {menuGroups.admin.length > 0 && (
              <div className="relative group">
                <button
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  style={{ color: textColor }}
                >
                  ⚙️ Администрирование
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                     style={{ backgroundColor: navBg, border: `1px solid ${borderColor}` }}>
                  <div className="py-1">
                    {menuGroups.admin.map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: textColor }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = hoverTextColor;
                          e.currentTarget.style.backgroundColor = hoverBg;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = textColor;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {item.label}
                        {item.isNew && (
                          <span className="ml-1 px-1 py-0.5 text-xs bg-purple-500 text-white rounded">
                            NEW
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Правая часть */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = hoverTextColor;
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = textColor;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.username || user.email}
                </Link>
                <ThemeToggle size="sm" />
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors border"
                  style={{
                    borderColor: hoverTextColor,
                    color: hoverTextColor
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <ThemeToggle size="sm" />
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: '#3182CE',
                    color: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2C5282';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3182CE';
                  }}
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md border text-sm font-medium transition-colors"
                  style={{
                    borderColor: hoverTextColor,
                    color: hoverTextColor
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Мобильное меню */}
          <div className="flex items-center md:hidden">
            <ThemeToggle size="sm" isCompact={true} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = hoverTextColor;
                e.currentTarget.style.backgroundColor = hoverBg;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = textColor;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="sr-only">Открыть меню</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      {isMenuOpen && (
        <div
          className="md:hidden shadow-lg"
          style={{ backgroundColor: navBg, borderTop: `1px solid ${borderColor}` }}
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {filteredMenu.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{ color: textColor }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = hoverTextColor;
                  e.currentTarget.style.backgroundColor = hoverBg;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = textColor;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                {item.isNew && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Мобильные кнопки входа/выхода */}
          <div
            className="pt-4 pb-3 border-t"
            style={{ borderColor: borderColor }}
          >
            <div className="px-4 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: textColor }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium" style={{ color: textColor }}>
                        {user.username || user.email}
                      </div>
                      <div className="text-sm" style={{ color: roleDisplay?.color }}>
                        {roleDisplay?.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors border"
                    style={{
                      borderColor: hoverTextColor,
                      color: hoverTextColor
                    }}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 rounded-md text-base font-medium transition-colors"
                    style={{
                      backgroundColor: '#3182CE',
                      color: 'white'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-4 py-2 rounded-md border text-base font-medium transition-colors"
                    style={{
                      borderColor: hoverTextColor,
                      color: hoverTextColor
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
