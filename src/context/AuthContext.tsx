import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/auth';
import { OzonApiCredentials, LoginCredentials, RegisterData } from '../types/auth';
import { OzonApiServiceFactory } from '../services/ozonApiServiceFactory';
import { useToast } from '@chakra-ui/react';
import { aiService } from '../services/aiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updateOzonApiCredentials: (credentials: OzonApiCredentials) => Promise<boolean>;
  validateOzonApiCredentials: (credentials: OzonApiCredentials) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Система автоматического определения ролей пользователей

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const apiServiceFactory = OzonApiServiceFactory.getInstance();

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь в localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔐 Загружаем пользователя из localStorage:', parsedUser.role, parsedUser.username);
        setUser(parsedUser);
      } catch (error) {
        console.error('Ошибка парсинга пользователя из localStorage:', error);
        localStorage.removeItem('user');
      }
    } else {
      // Если пользователь не авторизован - устанавливаем роль VIEWER (гость)
      console.log('🔐 Пользователь не авторизован - роль VIEWER');
      setUser(null);
    }
    setIsLoading(false);

    // Инициализируем ИИ-сервис с API ключом OpenAI
    try {
      aiService.initialize('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');
      console.log('AI Service initialized automatically on app start with OpenAI API key');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Определяем роль на основе логина/email
      let userRole = UserRole.SELLER; // По умолчанию

      // Админские логины
      const adminLogins = ['admin', 'root', 'administrator', 'admin@wbfinder.com'];
      if (adminLogins.includes(credentials.username.toLowerCase())) {
        userRole = UserRole.ADMIN;
      }

      // Менеджерские логины
      const managerLogins = ['manager', 'supervisor', 'lead'];
      if (managerLogins.some(login => credentials.username.toLowerCase().includes(login))) {
        userRole = UserRole.MANAGER;
      }

      // Viewer логины (демо аккаунты) - но demo должен быть SELLER
      const viewerLogins = ['guest', 'viewer', 'test'];
      if (viewerLogins.some(login => credentials.username.toLowerCase().includes(login))) {
        userRole = UserRole.VIEWER;
      }

      // Demo пользователи должны быть SELLER (ПРИНУДИТЕЛЬНО)
      if (credentials.username.toLowerCase().includes('demo') || credentials.username.toLowerCase() === 'demo') {
        userRole = UserRole.SELLER;
        console.log('🔧 ПРИНУДИТЕЛЬНО устанавливаем роль SELLER для demo пользователя');
      }

      // Создаем пользователя для входа
      const loggedInUser: User = {
        id: Date.now().toString(),
        username: credentials.username,
        email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@wbfinder.com`,
        role: userRole,
        firstName: userRole === UserRole.ADMIN ? 'Админ' :
                  userRole === UserRole.MANAGER ? 'Менеджер' :
                  userRole === UserRole.VIEWER ? 'Гость' : 'Продавец',
        lastName: 'WB Finder',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          theme: 'system',
          notifications: true,
          emailNotifications: true,
          language: 'ru',
          defaultPricingStrategy: 'aggressive'
        },
        ozonApiCredentials: {
          clientId: '',
          apiKey: '',
          isValid: false
        }
      };

      console.log('🔐 Вход пользователя с ролью:', userRole, credentials.username);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      toast({
        title: 'Успешный вход',
        description: `Добро пожаловать, ${credentials.username}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при входе';
      setError(errorMessage);

      toast({
        title: 'Ошибка входа',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Определяем роль на основе email или других критериев
      let userRole = UserRole.SELLER; // По умолчанию новые пользователи - продавцы

      // Админские email'ы
      const adminEmails = ['admin@wbfinder.com', 'admin@example.com', 'root@wbfinder.com'];
      if (adminEmails.includes(data.email.toLowerCase())) {
        userRole = UserRole.ADMIN;
      }

      // Менеджерские email'ы (например, корпоративные домены)
      if (data.email.toLowerCase().includes('@manager.') || data.email.toLowerCase().includes('@corp.')) {
        userRole = UserRole.MANAGER;
      }

      // Создаем нового пользователя
      const newUser: User = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        role: userRole,
        firstName: data.firstName || 'Пользователь',
        lastName: data.lastName || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          theme: 'system',
          notifications: true,
          emailNotifications: true,
          language: 'ru',
          defaultPricingStrategy: 'aggressive'
        },
        ozonApiCredentials: {
          clientId: '',
          apiKey: '',
          isValid: false
        }
      };

      console.log('🔐 Регистрация пользователя с ролью:', userRole, data.username);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));

      toast({
        title: 'Регистрация успешна',
        description: 'Ваш аккаунт успешно создан',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при регистрации';
      setError(errorMessage);

      toast({
        title: 'Ошибка регистрации',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Если у пользователя были учетные данные API, удаляем соответствующий сервис
    if (user && user.id) {
      apiServiceFactory.removeServiceForUser(user.id);
    }

    setUser(null);
    localStorage.removeItem('user');

    toast({
      title: 'Выход из системы',
      description: 'Вы успешно вышли из системы',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const updateUser = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        // В реальном приложении здесь будет запрос к API
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast({
          title: 'Профиль обновлен',
          description: 'Ваш профиль успешно обновлен',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обновлении профиля';
      setError(errorMessage);

      toast({
        title: 'Ошибка обновления',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOzonApiCredentials = async (credentials: OzonApiCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // Проверяем валидность учетных данных
      const isValid = await validateOzonApiCredentials(credentials);

      if (!isValid) {
        setError('Недействительные учетные данные API Ozon');
        toast({
          title: 'Ошибка проверки API',
          description: 'Недействительные учетные данные API Ozon',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return false;
      }

      if (user) {
        // Обновляем учетные данные пользователя
        const updatedCredentials = { ...credentials, isValid, lastValidated: new Date() };
        const updatedUser = {
          ...user,
          ozonApiCredentials: updatedCredentials
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast({
          title: 'API подключен',
          description: 'Учетные данные API Ozon успешно обновлены',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обновлении учетных данных API';
      setError(errorMessage);

      toast({
        title: 'Ошибка обновления API',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validateOzonApiCredentials = async (credentials: OzonApiCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // Проверяем валидность учетных данных через фабрику сервисов
      const isValid = await apiServiceFactory.validateCredentials(credentials);
      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при проверке учетных данных API';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        updateOzonApiCredentials,
        validateOzonApiCredentials,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
