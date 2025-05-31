import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useColorModeValue, Box } from '@chakra-ui/react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ThemeToggle from './components/ThemeToggle'
import ContentProtection from './components/common/ContentProtection'
import RoleBasedNavbar from './components/navigation/RoleBasedNavbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { usePermissions } from './components/auth/PermissionGuard'
import { NAVIGATION_MENU, filterMenuByPermissions, getMenuGroups } from './config/navigation'
import { ProductProviderNew } from './context/ProductContextNew'
import { OzonProductProvider } from './context/OzonProductContext'
import { SimpleProductProvider } from './context/SimpleProductContext'
import { SlotProvider } from './context/SlotContext'
import OzonProductsPage from './pages/OzonProductsPage'
import OzonCardPage from './pages/OzonCardPage'
import CreateOzonCardPage from './pages/CreateOzonCardPage'
import OzonApiSettingsPage from './pages/OzonApiSettingsPage'
import StrategiesPage from './pages/StrategiesPage'
import AlertsPage from './pages/AlertsPage'
import SettingsPage from './pages/SettingsPage'
import IntegrationGuidePage from './pages/IntegrationGuidePage'
import SecurityGuidePage from './pages/SecurityGuidePage'
import SecuritySettingsPage from './pages/SecuritySettingsPage'
import SecurityNotification from './components/security/SecurityNotification'
import MLAnalyticsPage from './pages/MLAnalyticsPage'
import WBProtectionPage from './pages/WBProtectionPage'
import WBParsingPage from './pages/WBParsingPage'
import BanAnalyticsPage from './pages/BanAnalyticsPage'
import ConnectedUsersPage from './pages/ConnectedUsersPage'
import MonitoringPage from './pages/MonitoringPage'
import AIAnalysisPage from './pages/AIAnalysisPage'
import AnalysisHistoryPage from './pages/AnalysisHistoryPage'
import CategoryInsightsPage from './pages/CategoryInsightsPage'
import LinkedProductsPage from './pages/LinkedProductsPage'
import PriceChangesPage from './pages/PriceChangesPage'
import LogisticsOptimizerPage from './pages/LogisticsOptimizerPage'
import DashboardPage from './pages/DashboardPage'
import PriceMonitoringPage from './pages/PriceMonitoringPage'
import SlotFinderPage from './pages/SlotFinderPage'
import TrackedProductsPage from './pages/TrackedProductsPage'
import AutomationTestPage from './pages/AutomationTestPage'
import MetricsPage from './pages/MetricsPage'
import LogicalOptimizerPage from './pages/LogicalOptimizerPage'
import AutoPriceRegulationPage from './pages/AutoPriceRegulationPage'
import CompetitorSearchPage from './pages/CompetitorSearchPage'
import ProfilePage from './pages/ProfilePage'
import ExtendedDataPage from './pages/ExtendedDataPage'
import DevToolsNotification from './components/DevToolsNotification'
import BordersDemo from './components/demo/BordersDemo'

import HelpSystem from './components/help/HelpSystem'
import PerformanceMonitor from './components/PerformanceMonitor'

// Компоненты страниц
import HomePage from './pages/HomePage'

const Home = () => <HomePage />

const About = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">О сервисе WB Price Optimizer Pro</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-primary-600">Проблема</h2>
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          Продавцы на Wildberries теряют до 40% потенциальной прибыли из-за неоптимального ценообразования и недобросовестной конкуренции.
          Ручная корректировка цен занимает много времени и не позволяет оперативно реагировать на изменения рынка.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-primary-600">Решение</h2>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">ИИ-аналитика для прогнозирования оптимальных цен на основе данных о конкурентах и спросе</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Автоматическое обнаружение недобросовестной конкуренции и защита от демпинга</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Гибкие стратегии ценообразования с учетом сезонности, маржинальности и конкуренции</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Интеграция с API Ozon для автоматического применения оптимальных цен</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-primary-600">Преимущества</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="text-primary-500 text-xl font-semibold mb-2">Увеличение прибыли</div>
            <p className="text-gray-600">В среднем на 30% за счет оптимизации цен и защиты от недобросовестной конкуренции</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="text-primary-500 text-xl font-semibold mb-2">Экономия времени</div>
            <p className="text-gray-600">До 20 часов в неделю на ручной корректировке цен и мониторинге конкурентов</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="text-primary-500 text-xl font-semibold mb-2">Защита бизнеса</div>
            <p className="text-gray-600">Автоматическое обнаружение и реагирование на недобросовестную конкуренцию</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="text-primary-500 text-xl font-semibold mb-2">Аналитика</div>
            <p className="text-gray-600">Подробные отчеты о динамике цен, конкурентах и эффективности стратегий</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link to="/" className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-md">
          Вернуться на главную
        </Link>
      </div>
    </div>
  </div>
)

// Компонент навигации
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const [isSystemOpen, setIsSystemOpen] = useState(false)

  // Цвета для темной/светлой темы - ПРИНУДИТЕЛЬНО БЕЛЫЙ В ТЕМНОЙ ТЕМЕ
  const navBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'white')  // БЕЛЫЙ в темной теме
  const hoverTextColor = useColorModeValue('blue.600', 'white')  // БЕЛЫЙ в темной теме
  const logoColor = useColorModeValue('blue.600', 'white')  // БЕЛЫЙ в темной теме

  // Цвета для hover-эффектов
  const hoverBgLight = 'rgba(0, 128, 255, 0.05)'
  const hoverBgDark = 'rgba(0, 128, 255, 0.2)'
  const hoverBg = useColorModeValue(hoverBgLight, hoverBgDark)

  // Цвета для заголовков в мобильном меню
  const mobileHeaderColor = useColorModeValue('gray.500', 'gray.400')

  // Цвета для кнопки меню
  const menuButtonHoverBgLight = 'rgba(0, 0, 0, 0.05)'
  const menuButtonHoverBgDark = 'rgba(255, 255, 255, 0.05)'
  const menuButtonHoverBg = useColorModeValue(menuButtonHoverBgLight, menuButtonHoverBgDark)

  // 🌈 ЯРКИЕ ЦВЕТА ДЛЯ HOVER ЭФФЕКТОВ
  const brightHoverBgLight = 'rgba(255, 102, 0, 0.1)'
  const brightHoverBgDark = 'rgba(255, 0, 128, 0.2)'
  const brightHoverBg = useColorModeValue(brightHoverBgLight, brightHoverBgDark)

  // Функция для создания выпадающего меню
  const DropdownMenu = ({
    title,
    isOpen,
    setIsOpen,
    items
  }: {
    title: string,
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    items: { label: string, to: string }[]
  }) => {
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors"
          style={{
            color: textColor,
            borderBottomColor: 'transparent'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = hoverTextColor;
            e.currentTarget.style.borderBottomColor = hoverTextColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = textColor;
            e.currentTarget.style.borderBottomColor = 'transparent';
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {title}
          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute left-0 mt-2 w-48 rounded-md shadow-lg z-50"
            style={{ backgroundColor: navBg, border: `1px solid ${borderColor}` }}
          >
            <div className="py-1">
              {items.map((item, index) => (
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
        )}
      </div>
    )
  }

  return (
    <nav className={`shadow-lg sticky top-0 z-50`} style={{ backgroundColor: navBg, borderBottom: `1px solid ${borderColor}` }}>
      <div className="container mx-auto px-2">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="h-6 w-6 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: logoColor }}>
                  <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-bold text-sm" style={{ color: textColor }}>WB PriceOpt Pro</span>
              </Link>
            </div>
            <div className="hidden md:ml-4 md:flex md:space-x-2">
              <Link to="/wb-products" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors text-sm"
                style={{ color: textColor, borderBottomColor: 'transparent' }}
                onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.borderBottomColor = hoverTextColor; }}
                onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                Мои товары
              </Link>
              <Link to="/linked-products" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors text-sm"
                style={{ color: textColor, borderBottomColor: 'transparent' }}
                onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.borderBottomColor = hoverTextColor; }}
                onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                Связанные товары
              </Link>
              <Link to="/tracked-products" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors text-sm"
                style={{ color: textColor, borderBottomColor: 'transparent' }}
                onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.borderBottomColor = hoverTextColor; }}
                onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                📊 Таблица отслеживания
              </Link>
              <Link to="/extended-data" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors text-sm"
                style={{ color: textColor, borderBottomColor: 'transparent' }}
                onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.borderBottomColor = hoverTextColor; }}
                onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                📈 Расширенная таблица
              </Link>
              <Link to="/price-changes" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors text-sm"
                style={{ color: textColor, borderBottomColor: 'transparent' }}
                onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.borderBottomColor = hoverTextColor; }}
                onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                Изменение в цене
              </Link>
              <Link to="/create-ozon-card" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent font-medium transition-colors text-sm"
                style={{ color: textColor, borderBottomColor: 'transparent', position: 'relative' }}
                onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.borderBottomColor = hoverTextColor; }}
                onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                Создать карточку Ozon
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-20px',
                  backgroundColor: '#3182CE',
                  color: 'white',
                  fontSize: '0.6rem',
                  padding: '1px 4px',
                  borderRadius: '4px'
                }}>
                  BETA
                </span>
              </Link>

              <DropdownMenu
                title="Управление"
                isOpen={isManagementOpen}
                setIsOpen={setIsManagementOpen}
                items={[
                  { label: 'Стратегии', to: '/strategies' },
                  { label: '🔍 Поиск конкурентов', to: '/competitor-search' },
                  { label: '🎯 Автоматическое регулирование', to: '/auto-price-regulation' },
                  { label: 'Логистика', to: '/logistics' },
                  { label: 'Slot Finder', to: '/slot-finder' },
                  { label: 'Алерты', to: '/alerts' },
                  { label: 'ИИ-анализ', to: '/ai-analysis' },
                  { label: 'История анализа', to: '/analysis-history' },
                  { label: 'Аналитика категорий', to: '/category-insights' }
                ]}
              />



              <DropdownMenu
                title="Система"
                isOpen={isSystemOpen}
                setIsOpen={setIsSystemOpen}
                items={[
                  { label: 'Настройки', to: '/settings' },
                  { label: 'API WB', to: '/wb-api-settings' },
                  { label: 'Пользователи', to: '/users' },
                  { label: 'Мониторинг', to: '/monitoring' },
                  { label: '📊 Метрики', to: '/metrics' },
                  { label: '🧠 Логический оптимизатор', to: '/logical-optimizer' },
                  { label: '🤖 ML-Аналитика', to: '/ml-analytics' },
                  { label: '🛡️ Защита WB', to: '/wb-protection' },
                  { label: '🕷️ Парсинг WB', to: '/wb-parsing' },
                  { label: '🧠 Аналитика банов', to: '/ban-analytics' },
                  { label: '🔍 Декодер артикулов', to: '/code-decoder' },
                  { label: 'Интеграция', to: '/integration-guide' },
                  { label: '⚙️ Настройки безопасности', to: '/security-settings' }
                ]}
              />
            </div>
          </div>
          <div className="hidden md:flex md:items-center space-x-3">
            <Link
              to="/profile"
              className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Профиль пользователя"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Профиль
            </Link>
            <ThemeToggle size="sm" />
            <Link
              to="/login"
              className="px-3 py-1 rounded-md text-sm font-medium transition-colors shadow-sm"
              style={{
                backgroundColor: '#3182CE',
                color: 'white'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2C5282'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3182CE'; }}
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 rounded-md border text-sm font-medium transition-colors"
              style={{
                borderColor: hoverTextColor,
                color: hoverTextColor
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = brightHoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Регистрация
            </Link>
          </div>
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle size="sm" isCompact={true} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = menuButtonHoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="sr-only">Открыть меню</span>
              {isMenuOpen ? (
                <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden shadow-lg" style={{ backgroundColor: navBg, borderTop: `1px solid ${borderColor}` }}>
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link to="/wb-products" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Мои товары
            </Link>
            <Link to="/linked-products" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Связанные товары
            </Link>
            <Link to="/tracked-products" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              📊 Таблица отслеживания
            </Link>
            <Link to="/extended-data" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              📈 Расширенная таблица
            </Link>
            <Link to="/price-changes" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Изменение в цене
            </Link>
            <Link to="/create-ozon-card" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor, position: 'relative' }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Создать карточку Ozon
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '10px',
                backgroundColor: '#3182CE',
                color: 'white',
                fontSize: '0.6rem',
                padding: '1px 4px',
                borderRadius: '4px'
              }}>
                BETA
              </span>
            </Link>
            <Link to="/profile" className="block py-2 px-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <svg className="inline h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Профиль
            </Link>
            <div className="py-1 px-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: mobileHeaderColor }}>Управление</div>
              <div className="ml-2 mt-1 space-y-1">
                <Link to="/strategies" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Стратегии
                </Link>
                <Link to="/competitor-search" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  🔍 Поиск конкурентов
                </Link>
                <Link to="/auto-price-regulation" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  🎯 Автоматическое регулирование
                </Link>
                <Link to="/logistics" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Логистика
                </Link>
                <Link to="/slot-finder" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Slot Finder
                </Link>
                <Link to="/alerts" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Алерты
                </Link>
                <Link to="/ai-analysis" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  ИИ-анализ
                </Link>
                <Link to="/analysis-history" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  История анализа
                </Link>
                <Link to="/category-insights" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Аналитика категорий
                </Link>
              </div>
            </div>
            <div className="py-1 px-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: mobileHeaderColor }}>Система</div>
              <div className="ml-2 mt-1 space-y-1">
                <Link to="/settings" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Настройки
                </Link>
                <Link to="/wb-api-settings" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  API WB
                </Link>
                <Link to="/users" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Пользователи
                </Link>
                <Link to="/monitoring" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Мониторинг
                </Link>
                <Link to="/metrics" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  📊 Метрики
                </Link>
                <Link to="/logical-optimizer" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  🧠 Логический оптимизатор
                </Link>
                <Link to="/integration-guide" className="block py-1 px-3 rounded-md text-sm font-medium transition-colors"
                  style={{ color: textColor }}
                  onMouseOver={(e) => { e.currentTarget.style.color = hoverTextColor; e.currentTarget.style.backgroundColor = brightHoverBg; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Интеграция
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-4 pb-5" style={{ borderTop: `1px solid ${borderColor}` }}>
            <div className="flex flex-col space-y-3 px-4">
              <Link
                to="/login"
                className="w-full py-2 px-4 rounded-md text-center font-medium transition-colors shadow-sm"
                style={{
                  backgroundColor: '#3182CE',
                  color: 'white'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2C5282'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3182CE'; }}
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="w-full py-2 px-4 rounded-md border text-center font-medium transition-colors"
                style={{
                  borderColor: hoverTextColor,
                  color: hoverTextColor
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = brightHoverBg; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// Компонент подвала
const Footer = () => (
  <footer className="bg-gray-900 text-white">
    <div className="container mx-auto px-6 pt-12 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center mb-4">
            <svg className="h-8 w-8 text-primary-400 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold">WB Price Optimizer Pro</span>
          </div>
          <p className="text-gray-400 mb-6">
            Автоматизированная система ИИ-ценообразования для продавцов Wildberries
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Навигация</h3>
          <ul className="space-y-3">
            <li><Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors">Главная</Link></li>
            <li><Link to="/products" className="text-gray-400 hover:text-primary-400 transition-colors">Товары</Link></li>
            <li><Link to="/strategies" className="text-gray-400 hover:text-primary-400 transition-colors">Стратегии</Link></li>
            <li><Link to="/alerts" className="text-gray-400 hover:text-primary-400 transition-colors">Алерты</Link></li>
            <li><Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">О сервисе</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Возможности</h3>
          <ul className="space-y-3">
            <li className="text-gray-400">ИИ-аналитика</li>
            <li className="text-gray-400">Динамическое ценообразование</li>
            <li className="text-gray-400">Защита от недобросовестной конкуренции</li>
            <li className="text-gray-400">Гибкие стратегии</li>
            <li className="text-gray-400">Интеграция с API Ozon</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Контакты</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-gray-400">
              <svg className="h-5 w-5 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@ozonpriceoptimizer.ru
            </li>
            <li className="flex items-center text-gray-400">
              <svg className="h-5 w-5 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +7 (800) 555-35-35
            </li>
            <li className="flex items-center text-gray-400">
              <svg className="h-5 w-5 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              @ozonpriceoptimizer
            </li>
          </ul>
          <div className="mt-6">
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
              Связаться с нами
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Ozon Price Optimizer Pro. Все права защищены.
        </p>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Политика конфиденциальности</a>
          <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Условия использования</a>
          <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Правовая информация</a>
        </div>
      </div>
    </div>
  </footer>
)

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <ProductProviderNew>
          <OzonProductProvider>
            <SimpleProductProvider>
              <SlotProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Box
                  minH="100vh"
                  display="flex"
                  flexDirection="column"
                  bg={useColorModeValue('white', 'gray.900')}
                  color={useColorModeValue('gray.800', 'white')}
                >
                  {/* Компонент защиты контента */}
                  <ContentProtection
                    options={{
                      preventSelection: true,
                      preventCopying: true,
                      addWatermarks: true,
                      detectScrapers: true,
                      disableForAuth: true
                    }}
                  />
                  <RoleBasedNavbar />
                  <Box as="main" flex="1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/wb-products" element={<OzonProductsPage />} />
                      <Route path="/wb-api-settings" element={<OzonApiSettingsPage />} />
                      <Route path="/strategies" element={<StrategiesPage />} />
                      <Route path="/alerts" element={<AlertsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/integration-guide" element={<IntegrationGuidePage />} />
                      <Route path="/security-guide" element={<SecurityGuidePage />} />
                      <Route path="/security-settings" element={<SecuritySettingsPage />} />
                      <Route path="/ml-analytics" element={<MLAnalyticsPage />} />
                      <Route path="/wb-protection" element={<WBProtectionPage />} />
                      <Route path="/wb-parsing" element={<WBParsingPage />} />
                      <Route path="/ban-analytics" element={<BanAnalyticsPage />} />
                      <Route path="/users" element={<ConnectedUsersPage />} />
                      <Route path="/monitoring" element={<MonitoringPage />} />
                      <Route path="/metrics" element={<MetricsPage />} />
                      <Route path="/ai-analysis" element={<AIAnalysisPage />} />
                      <Route path="/analysis-history" element={<AnalysisHistoryPage />} />
                      <Route path="/category-insights" element={<CategoryInsightsPage />} />
                      <Route path="/linked-products" element={<LinkedProductsPage />} />
                      <Route path="/tracked-products" element={<TrackedProductsPage />} />
                      <Route path="/extended-data" element={<ExtendedDataPage />} />
                      <Route path="/price-changes" element={<PriceChangesPage />} />
                      <Route path="/price-monitoring" element={<PriceMonitoringPage />} />
                      <Route path="/auto-price-regulation" element={<AutoPriceRegulationPage />} />
                      <Route path="/logistics" element={<LogisticsOptimizerPage />} />
                      <Route path="/slot-finder" element={<SlotFinderPage />} />
                      <Route path="/automation-test" element={<AutomationTestPage />} />
                      <Route path="/metrics" element={<MetricsPage />} />
                      <Route path="/logical-optimizer" element={<LogicalOptimizerPage />} />
                      <Route path="/wb-card/:productId" element={<OzonCardPage />} />
                      <Route path="/create-wb-card" element={<CreateOzonCardPage />} />
                      <Route path="/competitor-search" element={<CompetitorSearchPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/borders-demo" element={<BordersDemo />} />
                      <Route path="/login" element={<LoginForm />} />
                      <Route path="/register" element={<RegisterForm />} />
                    </Routes>
                  </Box>
                  <Footer />

                  {/* Уведомление о React DevTools для разработчиков */}
                  <DevToolsNotification />

                  {/* Уведомление о безопасности */}
                  <SecurityNotification />

                  {/* Монитор производительности */}
                  <PerformanceMonitor />

                  {/* Система помощи и обучения */}
                  <HelpSystem />
                </Box>
              </Router>
              </SlotProvider>
            </SimpleProductProvider>
          </OzonProductProvider>
        </ProductProviderNew>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
