import { useEffect, useState } from 'react'
import { useColorMode } from '@chakra-ui/react'

export const useSmartTheme = () => {
  const { colorMode, setColorMode } = useColorMode()
  const [isSmartMode, setIsSmartMode] = useState(false)

  useEffect(() => {
    // Проверяем, включен ли умный режим
    const smartModeEnabled = localStorage.getItem('smartThemeEnabled') === 'true'
    setIsSmartMode(smartModeEnabled)

    if (!smartModeEnabled) return

    const checkTime = () => {
      // Получаем текущее время в Москве
      const now = new Date()
      const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}))
      const hour = moscowTime.getHours()

      // Темная тема с 22:00 до 07:00
      const shouldBeDark = hour >= 22 || hour < 7

      // Проверяем, нужно ли переключить тему
      if (shouldBeDark && colorMode === 'light') {
        setColorMode('dark')
        console.log('🌙 Переключено на темную тему (время:', hour + ':00)')
      } else if (!shouldBeDark && colorMode === 'dark') {
        setColorMode('light')
        console.log('☀️ Переключено на светлую тему (время:', hour + ':00)')
      }
    }

    // Проверяем сразу при загрузке
    checkTime()

    // Проверяем каждую минуту
    const interval = setInterval(checkTime, 60000)

    return () => clearInterval(interval)
  }, [colorMode, setColorMode, isSmartMode])

  const enableSmartMode = () => {
    localStorage.setItem('smartThemeEnabled', 'true')
    setIsSmartMode(true)
  }

  const disableSmartMode = () => {
    localStorage.setItem('smartThemeEnabled', 'false')
    setIsSmartMode(false)
  }

  return {
    colorMode,
    setColorMode,
    isSmartMode,
    enableSmartMode,
    disableSmartMode
  }
}
