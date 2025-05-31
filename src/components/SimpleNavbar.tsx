import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink = ({ to, children }: NavLinkProps) => (
  <RouterLink to={to}>
    <Box
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: 'blue.50',
      }}
      fontSize="sm"
      fontWeight="medium"
    >
      {children}
    </Box>
  </RouterLink>
);

interface SimpleNavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function SimpleNavbar({ isAuthenticated = false, onLogout }: SimpleNavbarProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  return (
    <Box bg="white" px={4} boxShadow="sm" position="relative">
      <Flex h={14} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'sm'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={4} alignItems={'center'}>
          <Box fontWeight="bold" fontSize="sm" color="blue.600">
            <RouterLink to="/">WB Price Optimizer Pro</RouterLink>
          </Box>
          <HStack as={'nav'} spacing={2} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/">Главная</NavLink>
            {isAuthenticated && <NavLink to="/products">Товары</NavLink>}

            {isAuthenticated && (
              <Menu isOpen={isManagementOpen} onClose={() => setIsManagementOpen(false)}>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="ghost"
                  rightIcon={<ChevronDownIcon />}
                  onMouseEnter={() => setIsManagementOpen(true)}
                  onClick={() => setIsManagementOpen(!isManagementOpen)}
                  fontSize="sm"
                  fontWeight="medium"
                  h="auto"
                  py={1}
                >
                  Управление
                </MenuButton>
                <MenuList zIndex={100} onMouseLeave={() => setIsManagementOpen(false)}>
                  <MenuItem as={RouterLink} to="/strategies" fontSize="sm">Стратегии</MenuItem>
                  <MenuItem as={RouterLink} to="/alerts" fontSize="sm">Алерты</MenuItem>
                  <MenuItem as={RouterLink} to="/ai-analysis" fontSize="sm">ИИ-анализ</MenuItem>
                </MenuList>
              </Menu>
            )}

            {isAuthenticated && (
              <Menu isOpen={isSystemOpen} onClose={() => setIsSystemOpen(false)}>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="ghost"
                  rightIcon={<ChevronDownIcon />}
                  onMouseEnter={() => setIsSystemOpen(true)}
                  onClick={() => setIsSystemOpen(!isSystemOpen)}
                  fontSize="sm"
                  fontWeight="medium"
                  h="auto"
                  py={1}
                >
                  Система
                </MenuButton>
                <MenuList zIndex={100} onMouseLeave={() => setIsSystemOpen(false)}>
                  <MenuItem as={RouterLink} to="/settings" fontSize="sm">Настройки</MenuItem>
                  <MenuItem as={RouterLink} to="/users" fontSize="sm">Пользователи</MenuItem>
                  <MenuItem as={RouterLink} to="/monitoring" fontSize="sm">Мониторинг</MenuItem>
                  <MenuItem as={RouterLink} to="/integration-guide" fontSize="sm">Интеграция</MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </HStack>

        <HStack spacing={2}>
          {isAuthenticated ? (
            <>
              <Button
                as={RouterLink}
                to="/profile"
                size="sm"
                variant="ghost"
                colorScheme="blue"
              >
                Профиль
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={onLogout}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                size="sm"
                colorScheme="blue"
              >
                Войти
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                size="sm"
                variant="outline"
                colorScheme="blue"
              >
                Регистрация
              </Button>
            </>
          )}
        </HStack>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            <NavLink to="/">Главная</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/products">Товары</NavLink>
                <NavLink to="/strategies">Стратегии</NavLink>
                <NavLink to="/alerts">Алерты</NavLink>
                <NavLink to="/ai-analysis">ИИ-анализ</NavLink>
                <NavLink to="/settings">Настройки</NavLink>
                <NavLink to="/users">Пользователи</NavLink>
                <NavLink to="/monitoring">Мониторинг</NavLink>
                <NavLink to="/integration-guide">Интеграция</NavLink>
              </>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
