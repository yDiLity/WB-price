// 🎨 Дизайн-система Ozon Slot Finder Pro
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// 🌈 Цветовая палитра
const colors = {
  // Primary - Синий
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary - Бирюзовый
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Accent - Фиолетовый
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Success - Зеленый
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning - Оранжевый
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Error - Красный
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral - Серый
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
}

// 📝 Типографика
const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
}

const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
}

// 📏 Отступы и размеры
const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
}

// 🎭 Темы (светлая/темная)
const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

// 🎨 Стили компонентов
const components = {
  // Кнопки с голубыми краями
  Button: {
    baseStyle: (props: any) => ({
      fontWeight: 'semibold',
      borderRadius: 'lg',
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      transition: 'all 0.2s',
      _focus: {
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        borderColor: `${props.colorMode === 'dark' ? '#90CDF4' : '#2C5282'} !important`,
      },
      _hover: {
        borderColor: `${props.colorMode === 'dark' ? '#90CDF4' : '#2C5282'} !important`,
        transform: 'translateY(-1px)',
      },
    }),
    variants: {
      solid: (props: any) => ({
        background: props.colorMode === 'dark'
          ? 'linear-gradient(135deg, #ff0080 0%, #00ffff 25%, #ff8000 50%, #8000ff 75%, #ff0080 100%)'
          : 'linear-gradient(135deg, #ff6600 0%, #0099ff 25%, #ff0066 50%, #00ff99 75%, #ff6600 100%)',
        color: 'white',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderImage: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ffff00, #ff00ff, #00ffff, #ff8000) 1'
          : 'linear-gradient(45deg, #ff3300, #0066ff, #ff0099, #00ff66) 1',
        boxShadow: props.colorMode === 'dark'
          ? '0 8px 25px rgba(255, 0, 128, 0.4), 0 4px 15px rgba(0, 255, 255, 0.3)'
          : '0 8px 25px rgba(255, 102, 0, 0.4), 0 4px 15px rgba(0, 153, 255, 0.3)',
        _hover: {
          background: props.colorMode === 'dark'
            ? 'linear-gradient(135deg, #ff00ff 0%, #00ffff 25%, #ffff00 50%, #ff0080 75%, #ff00ff 100%)'
            : 'linear-gradient(135deg, #ff3300 0%, #0066ff 25%, #ff0099 50%, #00ff66 75%, #ff3300 100%)',
          transform: 'translateY(-4px) scale(1.05)',
          boxShadow: props.colorMode === 'dark'
            ? '0 15px 40px rgba(255, 0, 255, 0.5), 0 8px 25px rgba(0, 255, 255, 0.4)'
            : '0 15px 40px rgba(255, 51, 0, 0.5), 0 8px 25px rgba(0, 102, 255, 0.4)',
          borderImage: props.colorMode === 'dark'
            ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff) 1'
            : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99) 1',
        },
        _active: {
          transform: 'translateY(-2px) scale(1.02)',
        },
      }),
      outline: (props: any) => ({
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        color: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        background: 'transparent',
        _hover: {
          background: props.colorMode === 'dark'
            ? 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(49, 130, 206, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(66, 153, 225, 0.1) 100%)',
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
          transform: 'translateY(-1px)',
        },
      }),
      ghost: (props: any) => ({
        color: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        _hover: {
          background: props.colorMode === 'dark'
            ? 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(49, 130, 206, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(66, 153, 225, 0.1) 100%)',
        },
      }),
    },
    sizes: {
      sm: {
        h: '32px',
        minW: '32px',
        fontSize: 'sm',
        px: 3,
      },
      md: {
        h: '40px',
        minW: '40px',
        fontSize: 'md',
        px: 4,
      },
      lg: {
        h: '48px',
        minW: '48px',
        fontSize: 'lg',
        px: 6,
      },
    },
  },

  // 🌈 ЯРКИЕ КРАСОЧНЫЕ КАРТОЧКИ С ТОЛСТЫМИ КРАЯМИ
  Card: {
    baseStyle: (props: any) => ({
      container: {
        borderRadius: '2xl',
        boxShadow: props.colorMode === 'dark'
          ? '0 20px 60px rgba(255, 0, 150, 0.3), 0 8px 32px rgba(0, 255, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
          : '0 20px 60px rgba(255, 100, 0, 0.3), 0 8px 32px rgba(0, 150, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.9)',
        borderWidth: '4px',
        borderStyle: 'solid',
        borderImage: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff) 1'
          : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99) 1',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(145deg, #1a202c 0%, #2d3748 25%, #4a5568 50%, #2d3748 75%, #1a202c 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 25%, #e6f3ff 50%, #f0f8ff 75%, #ffffff 100%)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        _hover: {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: props.colorMode === 'dark'
            ? '0 30px 80px rgba(255, 0, 150, 0.4), 0 15px 50px rgba(0, 255, 255, 0.3)'
            : '0 30px 80px rgba(255, 100, 0, 0.4), 0 15px 50px rgba(0, 150, 255, 0.3)',
          borderImage: props.colorMode === 'dark'
            ? 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff0080) 1'
            : 'linear-gradient(45deg, #ff3300, #0066ff, #ff0099, #00ff66) 1',
        },
      },
    }),
  },

  // 🌈 ЯРКИЕ ПОЛЯ ВВОДА С РАДУЖНЫМИ КРАЯМИ
  Input: {
    baseStyle: (props: any) => ({
      field: {
        borderRadius: 'xl',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderImage: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff) 1'
          : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99) 1',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(145deg, #2d3748 0%, #4a5568 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%)',
        boxShadow: props.colorMode === 'dark'
          ? '0 4px 15px rgba(255, 0, 128, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.3)'
          : '0 4px 15px rgba(255, 102, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        _focus: {
          borderImage: props.colorMode === 'dark'
            ? 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff0080) 1'
            : 'linear-gradient(45deg, #ff3300, #0066ff, #ff0099, #00ff66) 1',
          boxShadow: props.colorMode === 'dark'
            ? '0 0 0 4px rgba(255, 0, 255, 0.3), 0 8px 25px rgba(0, 255, 255, 0.3)'
            : '0 0 0 4px rgba(255, 51, 0, 0.3), 0 8px 25px rgba(0, 102, 255, 0.3)',
          transform: 'scale(1.02)',
        },
        _hover: {
          borderImage: props.colorMode === 'dark'
            ? 'linear-gradient(45deg, #ffff00, #ff00ff, #00ffff, #ff8000) 1'
            : 'linear-gradient(45deg, #ff9900, #0066ff, #ff0099, #00ff66) 1',
          transform: 'translateY(-1px)',
        },
      },
    }),
  },

  // Алерты с голубыми краями
  Alert: {
    baseStyle: (props: any) => ({
      container: {
        borderRadius: 'lg',
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      },
    }),
    variants: {
      subtle: (props: any) => ({
        container: {
          bg: 'primary.50',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          _dark: {
            bg: 'primary.900',
          },
        },
        icon: {
          color: 'primary.500',
        },
      }),
    },
  },

  // Текстовые области с голубыми краями
  Textarea: {
    baseStyle: (props: any) => ({
      borderRadius: 'lg',
      borderWidth: '2px',
      borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      _focus: {
        borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
        boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'var(--chakra-colors-blue-200)' : 'var(--chakra-colors-blue-600)'}`,
      },
      _hover: {
        borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
      },
    }),
  },

  // Селекты с голубыми краями
  Select: {
    baseStyle: (props: any) => ({
      field: {
        borderRadius: 'lg',
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        _focus: {
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
          boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'var(--chakra-colors-blue-200)' : 'var(--chakra-colors-blue-600)'}`,
        },
        _hover: {
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
        },
      },
    }),
  },

  // Модальные окна с голубыми краями
  Modal: {
    baseStyle: (props: any) => ({
      dialog: {
        borderRadius: 'xl',
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      },
    }),
  },

  // Таблицы с голубыми краями
  Table: {
    baseStyle: (props: any) => ({
      table: {
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'lg',
      },
      th: {
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      },
      td: {
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      },
    }),
  },

  // Аккордеоны с голубыми краями
  Accordion: {
    baseStyle: (props: any) => ({
      container: {
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'lg',
      },
      button: {
        borderRadius: 'lg',
        _hover: {
          bg: props.colorMode === 'dark' ? 'blue.900' : 'blue.50',
        },
      },
    }),
  },

  // Меню с голубыми краями
  Menu: {
    baseStyle: (props: any) => ({
      list: {
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'lg',
      },
      item: {
        _hover: {
          bg: props.colorMode === 'dark' ? 'blue.900' : 'blue.50',
        },
      },
    }),
  },

  // Тултипы с голубыми краями
  Tooltip: {
    baseStyle: (props: any) => ({
      borderWidth: '1px',
      borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      borderRadius: 'lg',
    }),
  },

  // Бейджи с голубыми краями
  Badge: {
    baseStyle: (props: any) => ({
      borderWidth: '1px',
      borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
      borderRadius: 'md',
    }),
  },

  // Чекбоксы с голубыми краями
  Checkbox: {
    baseStyle: (props: any) => ({
      control: {
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'md',
        _checked: {
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
        },
      },
    }),
  },

  // Радио кнопки с голубыми краями
  Radio: {
    baseStyle: (props: any) => ({
      control: {
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        _checked: {
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
        },
      },
    }),
  },
}

// 🌟 Глобальные стили с красивыми цветами и градиентами
const styles = {
  global: (props: any) => ({
    body: {
      // 🌈 ЯРКИЙ РАДУЖНЫЙ ГРАДИЕНТНЫЙ ФОН
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #1a202c 0%, #2d1b69 15%, #1a202c 30%, #4a1a4a 45%, #1a202c 60%, #1a4a4a 75%, #1a202c 90%, #2d1b69 100%)'
        : 'linear-gradient(135deg, #f7fafc 0%, #fff0f5 15%, #f0f8ff 30%, #f5fffa 45%, #fff8dc 60%, #f0f8ff 75%, #fff0f5 90%, #f7fafc 100%)',
      color: props.colorMode === 'dark' ? 'neutral.100' : 'neutral.900',
      minHeight: '100vh',
      backgroundAttachment: 'fixed',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'neutral.400' : 'neutral.500',
    },
    // 🔵 ГОЛУБЫЕ КРАЯ ДЛЯ ВСЕХ ПРЯМОУГОЛЬНЫХ ЭЛЕМЕНТОВ НА САЙТЕ

    // 🌈 ВСЕ КАРТОЧКИ С ЯРКИМИ РАДУЖНЫМИ КРАЯМИ (ПРАВИЛЬНЫЙ МЕТОД)
    '.chakra-card, .chakra-card__body, .chakra-card__header, .chakra-card__footer': {
      position: 'relative !important',
      borderRadius: '2xl !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(145deg, #1a202c 0%, #2d3748 25%, #4a5568 50%, #2d3748 75%, #1a202c 100%) !important'
        : 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 25%, #e6f3ff 50%, #f0f8ff 75%, #ffffff 100%) !important',
      boxShadow: props.colorMode === 'dark'
        ? '0 20px 60px rgba(255, 0, 150, 0.3), 0 8px 32px rgba(0, 255, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.2) !important'
        : '0 20px 60px rgba(255, 100, 0, 0.3), 0 8px 32px rgba(0, 150, 255, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.9) !important',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-4px',
        left: '-4px',
        right: '-4px',
        bottom: '-4px',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff, #ff0080)'
          : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99, #ff6600)',
        borderRadius: '2xl',
        zIndex: '-1',
      },
    },

    // 🌈 ВСЕ BOX ЭЛЕМЕНТЫ С ЯРКИМИ КРАЯМИ
    '.chakra-box': {
      borderWidth: '3px !important',
      borderStyle: 'solid !important',
      borderImage: props.colorMode === 'dark'
        ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff) 1 !important'
        : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99) 1 !important',
      borderRadius: 'lg !important',
    },

    // 🌈 ВСЕ КНОПКИ С ЯРКИМИ РАДУЖНЫМИ ГРАДИЕНТАМИ (ПРАВИЛЬНЫЙ МЕТОД)
    '.chakra-button': {
      position: 'relative !important',
      borderRadius: 'xl !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #ff0080 0%, #00ffff 25%, #ff8000 50%, #8000ff 75%, #ff0080 100%) !important'
        : 'linear-gradient(135deg, #ff6600 0%, #0099ff 25%, #ff0066 50%, #00ff99 75%, #ff6600 100%) !important',
      color: 'white !important',
      fontWeight: 'bold !important',
      textShadow: '0 2px 4px rgba(0,0,0,0.5) !important',
      boxShadow: props.colorMode === 'dark'
        ? '0 8px 25px rgba(255, 0, 128, 0.4), 0 4px 15px rgba(0, 255, 255, 0.3) !important'
        : '0 8px 25px rgba(255, 102, 0, 0.4), 0 4px 15px rgba(0, 153, 255, 0.3) !important',
      transition: 'all 0.3s ease !important',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-3px',
        left: '-3px',
        right: '-3px',
        bottom: '-3px',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ffff00, #ff00ff, #00ffff, #ff8000)'
          : 'linear-gradient(45deg, #ff3300, #0066ff, #ff0099, #00ff66)',
        borderRadius: 'xl',
        zIndex: '-1',
      },
      _hover: {
        transform: 'translateY(-4px) scale(1.05) !important',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(135deg, #ff00ff 0%, #00ffff 25%, #ffff00 50%, #ff0080 75%, #ff00ff 100%) !important'
          : 'linear-gradient(135deg, #ff3300 0%, #0066ff 25%, #ff0099 50%, #00ff66 75%, #ff3300 100%) !important',
        boxShadow: props.colorMode === 'dark'
          ? '0 15px 40px rgba(255, 0, 255, 0.5), 0 8px 25px rgba(0, 255, 255, 0.4) !important'
          : '0 15px 40px rgba(255, 51, 0, 0.5), 0 8px 25px rgba(0, 102, 255, 0.4) !important',
      },
    },

    // 🌈 ВСЕ ПОЛЯ ВВОДА С ЯРКИМИ РАДУЖНЫМИ КРАЯМИ (ПРАВИЛЬНЫЙ МЕТОД)
    '.chakra-input__field, .chakra-textarea, .chakra-select__field': {
      position: 'relative !important',
      borderRadius: 'xl !important',
      border: 'none !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(145deg, #2d3748 0%, #4a5568 100%) !important'
        : 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%) !important',
      boxShadow: props.colorMode === 'dark'
        ? '0 4px 15px rgba(255, 0, 128, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.3) !important'
        : '0 4px 15px rgba(255, 102, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1) !important',
      transition: 'all 0.3s ease !important',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-3px',
        left: '-3px',
        right: '-3px',
        bottom: '-3px',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff)'
          : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99)',
        borderRadius: 'xl',
        zIndex: '-1',
      },
      _focus: {
        boxShadow: props.colorMode === 'dark'
          ? '0 0 0 4px rgba(255, 0, 255, 0.3), 0 8px 25px rgba(0, 255, 255, 0.3) !important'
          : '0 0 0 4px rgba(255, 51, 0, 0.3), 0 8px 25px rgba(0, 102, 255, 0.3) !important',
        transform: 'scale(1.02) !important',
      },
    },

    // Модальные окна
    '.chakra-modal__content, .chakra-modal__header, .chakra-modal__body, .chakra-modal__footer': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
    },

    // Табы
    '.chakra-tabs__tab': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
    },

    // Алерты с красивыми цветами
    '.chakra-alert': {
      borderWidth: '2px !important',
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1) !important',
      transition: 'all 0.3s ease !important',
    },

    // Цветные алерты по типам
    '.chakra-alert[data-status="success"]': {
      borderColor: '#22c55e !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #14532d 0%, #166534 100%) !important'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important',
    },

    '.chakra-alert[data-status="error"]': {
      borderColor: '#ef4444 !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%) !important'
        : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important',
    },

    '.chakra-alert[data-status="warning"]': {
      borderColor: '#f97316 !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%) !important'
        : 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%) !important',
    },

    '.chakra-alert[data-status="info"]': {
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%) !important'
        : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important',
    },

    // Статистика с красивыми градиентами и цветами
    '.chakra-stat': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
      padding: '1.5rem !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%) !important'
        : 'linear-gradient(135deg, #ffffff 0%, #f7fafc 50%, #edf2f7 100%) !important',
      boxShadow: props.colorMode === 'dark'
        ? '0 8px 32px rgba(99, 179, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important'
        : '0 8px 32px rgba(49, 130, 206, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important',
      transition: 'all 0.3s ease !important',
      _hover: {
        transform: 'translateY(-4px) !important',
        boxShadow: props.colorMode === 'dark'
          ? '0 12px 40px rgba(99, 179, 237, 0.2) !important'
          : '0 12px 40px rgba(49, 130, 206, 0.2) !important',
      },
    },

    // Цветные числа в статистике
    '.chakra-stat__number': {
      background: props.colorMode === 'dark'
        ? 'linear-gradient(135deg, #63b3ed 0%, #4299e1 100%) !important'
        : 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%) !important',
      backgroundClip: 'text !important',
      WebkitBackgroundClip: 'text !important',
      WebkitTextFillColor: 'transparent !important',
      fontWeight: 'bold !important',
    },

    // 🌈 ВСЕ ЭЛЕМЕНТЫ С КЛАССАМИ КАРТОЧЕК - ЯРКИЕ И АНИМИРОВАННЫЕ (ПРАВИЛЬНЫЙ МЕТОД)
    '.product-card, .feature-card, .home-card, .benefit-card, .profile-card, .dashboard-card, .settings-card': {
      position: 'relative !important',
      borderRadius: '2xl !important',
      background: props.colorMode === 'dark'
        ? 'linear-gradient(145deg, #1a202c 0%, #2d3748 25%, #4a5568 50%, #2d3748 75%, #1a202c 100%) !important'
        : 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 25%, #e6f3ff 50%, #f0f8ff 75%, #ffffff 100%) !important',
      boxShadow: props.colorMode === 'dark'
        ? '0 20px 60px rgba(255, 0, 150, 0.3), 0 8px 32px rgba(0, 255, 255, 0.2) !important'
        : '0 20px 60px rgba(255, 100, 0, 0.3), 0 8px 32px rgba(0, 150, 255, 0.2) !important',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-4px',
        left: '-4px',
        right: '-4px',
        bottom: '-4px',
        background: props.colorMode === 'dark'
          ? 'linear-gradient(45deg, #ff0080, #00ffff, #ff8000, #8000ff, #ff0080)'
          : 'linear-gradient(45deg, #ff6600, #0099ff, #ff0066, #00ff99, #ff6600)',
        borderRadius: '2xl',
        zIndex: '-1',
      },
      _hover: {
        transform: 'translateY(-8px) scale(1.02) !important',
        boxShadow: props.colorMode === 'dark'
          ? '0 30px 80px rgba(255, 0, 150, 0.4), 0 15px 50px rgba(0, 255, 255, 0.3) !important'
          : '0 30px 80px rgba(255, 100, 0, 0.4), 0 15px 50px rgba(0, 150, 255, 0.3) !important',
      },
    },

    // Дополнительные элементы с голубыми краями
    '.chakra-accordion__item': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
      marginBottom: '8px !important',
    },
    '.chakra-table, .chakra-table__container': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
    },
    '.chakra-menu__list': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
    },
    '.chakra-tooltip': {
      borderWidth: '1px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
      borderRadius: 'lg !important',
    },
    '.chakra-badge': {
      borderWidth: '1px !important',
      borderStyle: 'solid !important',
      borderRadius: 'md !important',
      fontWeight: 'semibold !important',
      textTransform: 'uppercase !important',
      letterSpacing: '0.05em !important',
      transition: 'all 0.2s ease !important',
    },

    // Цветные бейджи
    '.chakra-badge[data-colorscheme="green"]': {
      borderColor: '#22c55e !important',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important',
      color: 'white !important',
      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3) !important',
    },

    '.chakra-badge[data-colorscheme="red"]': {
      borderColor: '#ef4444 !important',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important',
      color: 'white !important',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3) !important',
    },

    '.chakra-badge[data-colorscheme="blue"]': {
      borderColor: '#3182ce !important',
      background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%) !important',
      color: 'white !important',
      boxShadow: '0 2px 8px rgba(49, 130, 206, 0.3) !important',
    },

    '.chakra-badge[data-colorscheme="orange"]': {
      borderColor: '#f97316 !important',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important',
      color: 'white !important',
      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3) !important',
    },

    '.chakra-badge[data-colorscheme="purple"]': {
      borderColor: '#8b5cf6 !important',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important',
      color: 'white !important',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3) !important',
    },
    '.chakra-checkbox__control, .chakra-radio__control': {
      borderWidth: '2px !important',
      borderColor: `${props.colorMode === 'dark' ? '#63B3ED' : '#3182CE'} !important`,
      borderStyle: 'solid !important',
    },
  }),
}

// 📱 Breakpoints для responsive дизайна
const breakpoints = {
  base: '0px',
  sm: '320px',
  md: '768px',
  lg: '1024px',
  xl: '1440px',
  '2xl': '1920px',
}

// 🎯 Экспорт темы
export const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  space,
  components,
  styles,
  breakpoints,
})

// 🎨 Утилиты для цветов
export const getColorValue = (color: string, shade: number = 500) => {
  return `${color}.${shade}`
}

// 📐 Утилиты для responsive дизайна
export const responsive = {
  mobile: { base: true, md: false },
  tablet: { base: false, md: true, lg: false },
  desktop: { base: false, lg: true },
}

// ✨ Анимации
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
}

export default theme
