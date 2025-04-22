import { Theme } from '@radix-ui/themes'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { CustomToaster } from './components/CustomToaster'
import { useEffect } from 'react'
import setupTelegramAuth from './api/telegramAuth'

export function App() {
  // Initialize Telegram authentication
  useEffect(() => {
    setupTelegramAuth();
  }, []);

  return (
    <Theme>
      <RouterProvider router={router} />
      <CustomToaster 
        richColors
        closeButton
      />
    </Theme>
  )
}

export default App 