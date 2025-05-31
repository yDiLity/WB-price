import { extendTheme } from '@chakra-ui/react';

// Голубые цвета для краев
const blueBorderColors = {
  light: '#3182CE', // blue.500
  dark: '#63B3ED',  // blue.300
};

// Расширенная тема с голубыми краями для всех элементов
const blueTheme = extendTheme({
  styles: {
    global: (props: any) => ({
      // Глобальные стили для всех элементов
      '*': {
        borderColor: props.colorMode === 'dark' ? blueBorderColors.dark : blueBorderColors.light,
      },
    }),
  },
  components: {
    // Карточки
    Card: {
      baseStyle: (props: any) => ({
        container: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'lg',
          transition: 'all 0.3s ease',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
            boxShadow: 'lg',
          },
        },
      }),
    },
    
    // Кнопки
    Button: {
      baseStyle: (props: any) => ({
        borderWidth: '2px',
        borderColor: 'transparent',
        borderRadius: 'lg',
        transition: 'all 0.3s ease',
      }),
      variants: {
        solid: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
          },
        }),
        outline: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
            bg: props.colorMode === 'dark' ? 'blue.900' : 'blue.50',
          },
        }),
        ghost: (props: any) => ({
          borderColor: 'transparent',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
            bg: props.colorMode === 'dark' ? 'blue.900' : 'blue.50',
          },
        }),
      },
    },
    
    // Поля ввода
    Input: {
      baseStyle: (props: any) => ({
        field: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'lg',
          _focus: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
            boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? blueBorderColors.dark : blueBorderColors.light}`,
          },
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
          },
        },
      }),
    },
    
    // Текстовые области
    Textarea: {
      baseStyle: (props: any) => ({
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'lg',
        _focus: {
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
          boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? blueBorderColors.dark : blueBorderColors.light}`,
        },
        _hover: {
          borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
        },
      }),
    },
    
    // Селекты
    Select: {
      baseStyle: (props: any) => ({
        field: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'lg',
          _focus: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
            boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? blueBorderColors.dark : blueBorderColors.light}`,
          },
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.200' : 'blue.600',
          },
        },
      }),
    },
    
    // Модальные окна
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'xl',
        },
      }),
    },
    
    // Алерты
    Alert: {
      baseStyle: (props: any) => ({
        container: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'lg',
        },
      }),
    },
    
    // Аккордеоны
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
    
    // Таблицы
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
    
    // Тосты
    Toast: {
      baseStyle: (props: any) => ({
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'lg',
      }),
    },
    
    // Меню
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
    
    // Поповеры
    Popover: {
      baseStyle: (props: any) => ({
        content: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'lg',
        },
      }),
    },
    
    // Тултипы
    Tooltip: {
      baseStyle: (props: any) => ({
        borderWidth: '2px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'lg',
      }),
    },
    
    // Драверы
    Drawer: {
      baseStyle: (props: any) => ({
        dialog: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        },
      }),
    },
    
    // Бейджи
    Badge: {
      baseStyle: (props: any) => ({
        borderWidth: '1px',
        borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        borderRadius: 'md',
      }),
    },
    
    // Теги
    Tag: {
      baseStyle: (props: any) => ({
        container: {
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'md',
        },
      }),
    },
    
    // Статистика
    Stat: {
      baseStyle: (props: any) => ({
        container: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'lg',
          p: 4,
        },
      }),
    },
    
    // Прогресс бары
    Progress: {
      baseStyle: (props: any) => ({
        track: {
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'full',
        },
      }),
    },
    
    // Слайдеры
    Slider: {
      baseStyle: (props: any) => ({
        track: {
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'full',
        },
        thumb: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        },
      }),
    },
    
    // Переключатели
    Switch: {
      baseStyle: (props: any) => ({
        track: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        },
      }),
    },
    
    // Чекбоксы
    Checkbox: {
      baseStyle: (props: any) => ({
        control: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
          borderRadius: 'md',
        },
      }),
    },
    
    // Радио кнопки
    Radio: {
      baseStyle: (props: any) => ({
        control: {
          borderWidth: '2px',
          borderColor: props.colorMode === 'dark' ? 'blue.300' : 'blue.500',
        },
      }),
    },
  },
});

export default blueTheme;
