import { useState, useCallback, useEffect } from 'react';

/**
 * Хук для управления режимом API (моковые данные или реальный API)
 * @returns Объект с состоянием режима API и функцией для его переключения
 */
export const useApiMode = () => {
  // Получаем сохраненное значение из localStorage или используем моковый режим по умолчанию
  const [isApiMode, setIsApiMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('apiMode');
    return savedMode ? savedMode === 'true' : false;
  });
  
  // Функция для переключения режима API
  const toggleApiMode = useCallback(() => {
    setIsApiMode(prev => !prev);
  }, []);
  
  // Сохраняем значение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('apiMode', isApiMode.toString());
  }, [isApiMode]);
  
  return { isApiMode, toggleApiMode };
};
