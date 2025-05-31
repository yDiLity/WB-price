export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  ozonApiCredentials?: OzonApiCredentials;
  settings?: UserSettings;
}

export interface OzonApiCredentials {
  clientId: string;
  apiKey: string;
  isValid: boolean;
  lastValidated?: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
  language: 'ru' | 'en';
  defaultPricingStrategy?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  updateOzonApiCredentials: (credentials: OzonApiCredentials) => Promise<boolean>;
  validateOzonApiCredentials: (credentials: OzonApiCredentials) => Promise<boolean>;
  clearError: () => void;
}
