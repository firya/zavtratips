import { Theme } from '@radix-ui/themes'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { CustomToaster } from './components/CustomToaster'

export function App() {
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