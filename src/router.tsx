import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import AppLayout from '@/pages/App/layout'
import { EditPodcast } from '@/pages/App/podcasts/EditPodcast'
import { CreatePodcast } from '@/pages/App/podcasts/CreatePodcast'
import { EditPodcastPage } from '@/pages/App/podcasts/EditPodcastPage'
import { Recommendations } from '@/pages/Recommendations'
import { Stats } from '@/pages/Stats'
import { AppPage } from '@/pages/App/AppPage'
import { Settings } from '@/pages/App/Settings/Settings'
import { CreateRecommendation } from '@/pages/App/recommendations/CreateRecommendation'
import { EditRecommendation } from '@/pages/App/recommendations/EditRecommendation'
import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  return (
    <header className="border-b">
      <div className="w-full max-w-7xl mx-auto px-1 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">ZavtraTips</span>
            <nav className="flex gap-2">
              <Link
                to="/recommendations"
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/recommendations"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                Recommendations
              </Link>
              <Link
                to="/stats"
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/stats"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                Stats
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full max-w-7xl mx-auto px-1 sm:px-4 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  )
}

function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-4">We're sorry, but something went wrong. Please try again later.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Home
        </button>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Home
        </button>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Navigate to="/recommendations" replace />,
      },
      {
        path: '/recommendations',
        element: <Recommendations />,
      },
      {
        path: '/stats',
        element: <Stats />,
      },
    ],
  },
  {
    path: '/app',
    element: <AppLayout><Outlet /></AppLayout>,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: <AppPage />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'podcasts',
        children: [
          {
            path: '',
            element: <EditPodcast />,
          },
          {
            path: 'create',
            element: <CreatePodcast />,
          },
          {
            path: ':id',
            element: <EditPodcastPage />,
          },
        ],
      },
      {
        path: 'recommendations',
        children: [
          {
            path: 'create',
            element: <CreateRecommendation />,
          },
          {
            path: 'edit',
            element: <EditRecommendation />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]) 