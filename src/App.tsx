import { Theme } from '@radix-ui/themes'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export function App() {
  return (
    <Theme>
      <RouterProvider router={router} />
    </Theme>
  )
}

export default App 