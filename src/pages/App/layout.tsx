import { ReactNode, useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const isMainDashboard = location.pathname === '/app'
  const [isMobile, setIsMobile] = useState(false)

  // Check if running on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    
    // Also add window resize listener to detect orientation changes
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <main 
        className="mx-auto px-4 py-6"
        style={isMobile ? {
          paddingBottom: '350px' // Extra padding for all mobile devices
        } : {}}
      >
        {children}
      </main>
    </div>
  )
}