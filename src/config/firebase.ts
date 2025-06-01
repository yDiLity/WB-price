// Firebase Configuration
// Конфигурация Firebase для WB Price Optimizer Pro

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase конфигурация (замените на ваши данные)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wb-price-optimizer.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wb-price-optimizer",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wb-price-optimizer.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Аналитика (только в продакшене)
export const analytics = typeof window !== 'undefined' && import.meta.env.PROD 
  ? getAnalytics(app) 
  : null;

// Подключение к эмуляторам в режиме разработки
if (import.meta.env.DEV) {
  // Auth эмулятор
  if (!auth.config.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  
  // Firestore эмулятор
  if (!db._delegate._databaseId.projectId.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  // Storage эмулятор
  if (!storage._location.bucket.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}

export default app;
