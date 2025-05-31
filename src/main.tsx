import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import theme from './theme'
import './index.css'

// 🛡️ Автоматическая инициализация системы безопасности
import './services/autoSecuritySetup'

// 🚀 Ozon Price Optimizer Pro - Исправлено!
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
