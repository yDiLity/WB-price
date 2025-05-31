import { useState, useEffect } from 'react';
import ThemeToggleButton from './common/ThemeToggleButton';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'switch' | 'full';
  isCompact?: boolean;
  showLabel?: boolean;
}

export default function ThemeToggle({
  size = 'md',
  variant = 'icon',
  isCompact = false,
  showLabel = false
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  // Эффект для предотвращения гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Если компонент не смонтирован, возвращаем пустой div для предотвращения ошибок гидратации
  if (!mounted) return <div style={{ width: isCompact ? '32px' : '40px', height: isCompact ? '32px' : '40px' }} />;

  // Используем новый компонент ThemeToggleButton
  return (
    <ThemeToggleButton
      variant={isCompact ? 'icon' : variant}
      size={size}
      showLabel={showLabel}
    />
  );
}
