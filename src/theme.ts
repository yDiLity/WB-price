import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Конфигурация темы
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Цвета
const colors = {
  primary: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80caff',
    300: '#4db3ff',
    400: '#1a9dff',
    500: '#0080ff', // Основной цвет
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e1f3fe',
    200: '#bae5fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
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
};

// Стили компонентов
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'primary.500' : 'primary.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'primary.600' : 'primary.600',
        },
      }),
      outline: (props: any) => ({
        borderColor: props.colorMode === 'dark' ? 'primary.500' : 'primary.500',
        color: props.colorMode === 'dark' ? 'primary.400' : 'primary.500',
      }),
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        borderRadius: 'lg',
        boxShadow: 'sm',
      },
    }),
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
    },
  },
};

// Стили для тёмного и светлого режимов
const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

// Создаем расширенную тему
const theme = extendTheme({
  config,
  colors,
  components,
  styles,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
});

export default theme;
