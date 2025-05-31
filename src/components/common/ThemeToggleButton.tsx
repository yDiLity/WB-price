import React from 'react';
import {
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Flex,
  Text,
  Switch,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useSmartTheme } from '../../hooks/useSmartTheme';

interface ThemeToggleButtonProps {
  variant?: 'icon' | 'switch' | 'full';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Компонент для переключения между светлой и темной темой
 */
const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  variant = 'icon',
  size = 'md',
  showLabel = false
}) => {
  const { colorMode, setColorMode, isSmartMode, enableSmartMode, disableSmartMode } = useSmartTheme();
  const isDark = colorMode === 'dark';

  // Цвета для светлой/темной темы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const iconColor = useColorModeValue('yellow.500', 'blue.300');

  // Функция для получения иконки темы
  const getThemeIcon = () => {
    if (isSmartMode) return <Text>🤖</Text>;
    return isDark ? <MoonIcon /> : <SunIcon />;
  };

  // Функция для получения названия темы
  const getThemeName = () => {
    if (isSmartMode) return 'Автоматическая';
    return isDark ? 'Темная' : 'Светлая';
  };

  // Вариант с иконкой
  if (variant === 'icon') {
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Выбрать тему"
          icon={getThemeIcon()}
          size={size}
          variant="ghost"
          color={iconColor}
        />
        <MenuList>
          <MenuItem
            icon={<SunIcon />}
            onClick={() => {
              disableSmartMode();
              setColorMode('light');
            }}
          >
            Светлая
          </MenuItem>
          <MenuItem
            icon={<MoonIcon />}
            onClick={() => {
              disableSmartMode();
              setColorMode('dark');
            }}
          >
            Темная
          </MenuItem>
          <MenuItem
            icon={<Text>🤖</Text>}
            onClick={enableSmartMode}
          >
            Автоматическая
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  // Вариант с переключателем
  if (variant === 'switch') {
    return (
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size={size} variant="ghost">
          {showLabel && (
            <Text fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}>
              {getThemeName()}
            </Text>
          )}
          {!showLabel && getThemeIcon()}
        </MenuButton>
        <MenuList>
          <MenuItem
            icon={<SunIcon />}
            onClick={() => {
              disableSmartMode();
              setColorMode('light');
            }}
          >
            Светлая
          </MenuItem>
          <MenuItem
            icon={<MoonIcon />}
            onClick={() => {
              disableSmartMode();
              setColorMode('dark');
            }}
          >
            Темная
          </MenuItem>
          <MenuItem
            icon={<Text>🤖</Text>}
            onClick={enableSmartMode}
          >
            Автоматическая
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  // Полный вариант с иконками и текстом
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        size={size}
        variant="outline"
        bg={bgColor}
        borderColor={borderColor}
      >
        <Flex align="center">
          {getThemeIcon()}
          {showLabel && (
            <Text ml={2} fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}>
              {getThemeName()}
            </Text>
          )}
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem
          icon={<SunIcon />}
          onClick={() => {
            disableSmartMode();
            setColorMode('light');
          }}
        >
          Светлая
        </MenuItem>
        <MenuItem
          icon={<MoonIcon />}
          onClick={() => {
            disableSmartMode();
            setColorMode('dark');
          }}
        >
          Темная
        </MenuItem>
        <MenuItem
          icon={<Text>🤖</Text>}
          onClick={enableSmartMode}
        >
          Автоматическая
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ThemeToggleButton;
