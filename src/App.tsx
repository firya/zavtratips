import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from "react-router-dom"
import { Recommendations } from "@/pages/Recommendations"
import { Stats } from "@/pages/Stats"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Theme } from '@radix-ui/themes'
import { cn } from "@/lib/utils"
import AppLayout from "@/pages/App/layout"
import { CreatePodcast } from "@/pages/App/podcasts/CreatePodcast"
import { EditPodcast } from "@/pages/App/podcasts/EditPodcast"
import { CreateRecommendation } from "@/pages/App/recommendations/CreateRecommendation"
import { EditRecommendation } from "@/pages/App/recommendations/EditRecommendation"
import { AppPage } from '@/pages/App/AppPage'

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

function App() {
  return (
    <Router>
      <Theme>
        <Routes>
          {/* Public routes with navigation */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/recommendations" replace />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/stats" element={<Stats />} />
          </Route>
          
          {/* Admin routes without navigation */}
          <Route element={<AppLayout><Outlet /></AppLayout>}>
            <Route path="/app" element={<AppPage />} />
            <Route path="/app/podcasts/create" element={<CreatePodcast />} />
            <Route path="/app/podcasts/edit" element={<EditPodcast />} />
            <Route path="/app/recommendations/create" element={<CreateRecommendation />} />
            <Route path="/app/recommendations/edit" element={<EditRecommendation />} />
          </Route>
        </Routes>
      </Theme>
    </Router>
  )
}

export default App 