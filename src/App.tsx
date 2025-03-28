import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { Recommendations } from "@/pages/Recommendations"
import { Stats } from "@/pages/Stats"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Theme } from '@radix-ui/themes'
import { cn } from "@/lib/utils"

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

function App() {
  return (
    <Router>
      <Theme>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="w-full max-w-7xl mx-auto px-1 sm:px-4 py-4 sm:py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/recommendations" replace />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </main>
        </div>
      </Theme>
    </Router>
  )
}

export default App 