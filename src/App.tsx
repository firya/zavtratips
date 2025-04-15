import { Theme } from '@radix-ui/themes'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from 'sonner'

export function App() {
  return (
    <Theme>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </Theme>
  )
}

export default App 