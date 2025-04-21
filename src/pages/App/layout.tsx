import { ReactNode } from 'react'
import { AppHeader } from './components/AppHeader'
import { useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const isMainDashboard = location.pathname === '/app'

  // Determine if we should show back button and where it should navigate to
  const showBackButton = !isMainDashboard
  const getBackPath = () => {
    if (location.pathname.startsWith('/app/podcasts/create')) {
      return '/app/podcasts'
    }
    if (location.pathname.startsWith('/app/podcasts/')) {
      return '/app/podcasts'
    }
    if (location.pathname.startsWith('/app/recommendations/create')) {
      return '/app/recommendations'
    }
    if (location.pathname.startsWith('/app/recommendations/')) {
      return '/app/recommendations'
    }
    return '/app'
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader backPath={showBackButton ? getBackPath() : undefined} />
      <main className="mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
} 