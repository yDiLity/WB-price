import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initContentProtection, allowTextSelection, allowCopy } from '../../utils/contentProtection';

interface ContentProtectionProps {
  // Настройки защиты контента
  options?: {
    preventSelection?: boolean;
    preventCopying?: boolean;
    addWatermarks?: boolean;
    detectScrapers?: boolean;
    // Если true, защита не будет применяться для авторизованных пользователей
    disableForAuth?: boolean;
  };
}

/**
 * Компонент для защиты контента от копирования и скрапинга
 */
const ContentProtection: React.FC<ContentProtectionProps> = ({ 
  options = {
    preventSelection: true,
    preventCopying: true,
    addWatermarks: true,
    detectScrapers: true,
    disableForAuth: true
  } 
}) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  useEffect(() => {
    // Если пользователь авторизован и установлен флаг disableForAuth,
    // не применяем защиту
    if (isAuthenticated && options.disableForAuth) {
      // Убираем защиту, если она была применена ранее
      allowTextSelection();
      allowCopy();
      return;
    }
    
    // Инициализируем защиту контента
    initContentProtection({
      preventSelection: options.preventSelection,
      preventCopying: options.preventCopying,
      addWatermarks: options.addWatermarks,
      detectScrapers: options.detectScrapers
    });
    
    // Очистка при размонтировании компонента
    return () => {
      allowTextSelection();
      allowCopy();
    };
  }, [isAuthenticated, options]);
  
  // Компонент не рендерит никакой UI
  return null;
};

export default ContentProtection;
