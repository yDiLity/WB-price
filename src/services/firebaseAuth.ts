// Firebase Authentication Service
// Сервис для работы с Firebase Authentication

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types/auth';

// Провайдеры для социальных сетей
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

export class FirebaseAuthService {
  // Вход с email и паролем
  async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Получаем дополнительные данные пользователя из Firestore
      const userData = await this.getUserData(firebaseUser.uid);
      
      return this.mapFirebaseUserToUser(firebaseUser, userData);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  }

  // Регистрация с email и паролем
  async signUpWithEmail(email: string, password: string, userData: Partial<User>): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Обновляем профиль Firebase
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`.trim()
      });

      // Создаем документ пользователя в Firestore
      const newUserData: Partial<User> = {
        ...userData,
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        role: UserRole.SELLER, // По умолчанию новые пользователи - продавцы
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);

      return this.mapFirebaseUserToUser(firebaseUser, newUserData);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  }

  // Вход через Google
  async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Проверяем, существует ли пользователь в Firestore
      let userData = await this.getUserData(firebaseUser.uid);
      
      if (!userData) {
        // Создаем нового пользователя
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          role: UserRole.SELLER,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }
      
      return this.mapFirebaseUserToUser(firebaseUser, userData);
    } catch (error) {
      console.error('Ошибка входа через Google:', error);
      throw error;
    }
  }

  // Выход
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    }
  }

  // Сброс пароля
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Ошибка сброса пароля:', error);
      throw error;
    }
  }

  // Обновление профиля пользователя
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      throw error;
    }
  }

  // Получение данных пользователя из Firestore
  private async getUserData(uid: string): Promise<Partial<User> | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as Partial<User> : null;
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      return null;
    }
  }

  // Преобразование Firebase User в наш тип User
  private mapFirebaseUserToUser(firebaseUser: FirebaseUser, userData?: Partial<User>): User {
    return {
      id: firebaseUser.uid,
      username: userData?.username || firebaseUser.email?.split('@')[0] || '',
      email: firebaseUser.email || '',
      firstName: userData?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
      lastName: userData?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      role: userData?.role || UserRole.SELLER,
      createdAt: userData?.createdAt || new Date(),
      updatedAt: userData?.updatedAt || new Date(),
      isActive: userData?.isActive ?? true,
      settings: userData?.settings || {
        theme: 'system',
        notifications: true,
        emailNotifications: true,
        language: 'ru',
        defaultPricingStrategy: 'aggressive'
      },
      ozonApiCredentials: userData?.ozonApiCredentials || {
        clientId: '',
        apiKey: '',
        isValid: false
      }
    };
  }

  // Слушатель изменений состояния аутентификации
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        const user = this.mapFirebaseUserToUser(firebaseUser, userData || undefined);
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

// Экспортируем единственный экземпляр сервиса
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
