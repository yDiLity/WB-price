import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SecurityStatus from './security/SecurityStatus';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <Box position="relative" className="purple-header-border">
      <Flex
        bgGradient={useColorModeValue(
          'linear(135deg, white 0%, blue.50 50%, cyan.50 100%)',
          'linear(135deg, gray.800 0%, blue.900 50%, cyan.900 100%)'
        )}
        color={useColorModeValue('gray.600', 'white')}
        h={'40px'}
        py={{ base: 0 }}
        px={{ base: 2 }}
        borderBottom={2}
        borderStyle={'solid'}
        borderColor={useColorModeValue('blue.200', 'blue.600')}
        align={'center'}
        position="sticky"
        top={0}
        zIndex={10}
        boxShadow={useColorModeValue(
          '0 4px 20px rgba(49, 130, 206, 0.1)',
          '0 4px 20px rgba(99, 179, 237, 0.2)'
        )}
        className="purple-nav-border">
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
            className="purple-button-border"
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Flex
            as={RouterLink}
            to="/"
            align="center"
            mr={1}
          >
            <Box
              bgGradient="linear(135deg, blue.500 0%, cyan.400 50%, blue.600 100%)"
              color="white"
              borderRadius="md"
              p={1}
              mr={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 2px 8px rgba(49, 130, 206, 0.3)"
              transition="all 0.3s ease"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(49, 130, 206, 0.4)'
              }}
              className="purple-border"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Text
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              bgGradient={useColorModeValue(
                'linear(135deg, blue.600 0%, cyan.500 50%, blue.700 100%)',
                'linear(135deg, blue.300 0%, cyan.300 50%, blue.400 100%)'
              )}
              bgClip="text"
              fontWeight="bold"
              fontSize="xs"
              lineHeight="1"
              sx={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              OzonPriceOpt
            </Text>
          </Flex>

          <Flex display={{ base: 'none', md: 'flex' }} ml={2}>
            <DesktopNav isAuthenticated={isAuthenticated} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={2}
          position="relative"
          zIndex={1001}>

          {/* Статус безопасности - показываем только авторизованным */}
          {isAuthenticated && (
            <Box display={{ base: 'none', lg: 'block' }}>
              <SecurityStatus />
            </Box>
          )}
          {isAuthenticated ? (
            <>
              <Button
                as={RouterLink}
                fontSize={'xs'}
                fontWeight={400}
                variant={'link'}
                to="/profile"
                px={1}
                className="purple-button-border">
                Профиль
              </Button>
              <Button
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'xs'}
                fontWeight={600}
                color={'white'}
                bg={'red.400'}
                onClick={logout}
                size="xs"
                px={2}
                _hover={{
                  bg: 'red.300',
                }}
                className="purple-button-border">
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                fontSize={'xs'}
                fontWeight={600}
                variant={'solid'}
                colorScheme="blue"
                to="/login"
                size="xs"
                px={2}
                mr={1}
                className="purple-button-border">
                Войти
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'xs'}
                fontWeight={600}
                variant="outline"
                colorScheme="blue"
                to="/register"
                size="xs"
                px={2}
                _hover={{
                  bg: 'blue.50',
                }}
                className="purple-button-border">
                Регистрация
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav isAuthenticated={isAuthenticated} logout={logout} />
      </Collapse>
    </Box>
  );
}

const DesktopNav = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={2}>
      {NAV_ITEMS.filter(item => !item.requiresAuth || isAuthenticated).map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom'} strategy={'fixed'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={1}
                to={navItem.href ?? '#'}
                fontSize={'xs'}
                fontWeight={500}
                color={linkColor}
                className="purple-nav-border"
                borderRadius="md"
                px={2}
                py={1}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}>
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'md'}
                bg={popoverContentBgColor}
                p={2}
                rounded={'md'}
                minW={'xs'}
                zIndex={1000}
                className="purple-modal-border">
                <Stack spacing={0}>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={RouterLink}
      to={href ?? '#'}
      role={'group'}
      display={'block'}
      p={1}
      fontSize="xs"
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}>
      <Stack direction={'row'} align={'center'} spacing={1}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'blue.400' }}
            fontWeight={500}>
            {label}
          </Text>
          {subLabel && <Text fontSize={'xs'} color="gray.500">{subLabel}</Text>}
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-5px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'blue.400'} w={3} h={3} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ isAuthenticated, logout }: { isAuthenticated: boolean, logout: () => void }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}>
      {NAV_ITEMS.filter(item => !item.requiresAuth || isAuthenticated).map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      {isAuthenticated && (
        <Box py={2} onClick={logout}>
          <Text fontWeight={600} color={'red.400'}>
            Выйти
          </Text>
        </Box>
      )}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} as={RouterLink} to={child.href ?? '#'}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Главная',
    href: '/',
  },
  {
    label: 'Дашборд',
    href: '/dashboard',
    requiresAuth: true,
  },
  {
    label: 'Товары',
    href: '/wb-products',
    requiresAuth: true,
  },
  {
    label: 'Связанные товары',
    href: '/linked-products',
    requiresAuth: true,
  },
  {
    label: 'Изменение в цене',
    href: '/price-changes',
    requiresAuth: true,
  },
  {
    label: 'Мониторинг цен',
    href: '/price-monitoring',
    requiresAuth: true,
  },
  {
    label: 'Карточки WB',
    requiresAuth: true,
    children: [
      {
        label: 'Создать карточку',
        href: '/create-wb-card',
        subLabel: 'Создание новой карточки товара для Wildberries',
      },
    ],
  },
  {
    label: 'Управление',
    requiresAuth: true,
    children: [
      {
        label: 'Стратегии',
        href: '/strategies',
      },
      {
        label: 'Алерты',
        href: '/alerts',
      },
      {
        label: 'ИИ-анализ',
        href: '/ai-analysis',
      },
    ],
  },
  {
    label: 'Система',
    requiresAuth: true,
    children: [
      {
        label: 'Настройки',
        href: '/settings',
      },
      {
        label: 'Пользователи',
        href: '/users',
      },
      {
        label: 'Мониторинг',
        href: '/monitoring',
      },
      {
        label: 'Интеграция',
        href: '/integration-guide',
      },
    ],
  },
];
