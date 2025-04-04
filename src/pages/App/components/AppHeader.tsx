import { Mic, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BackButton } from './BackButton'
import { Link } from 'react-router-dom'

interface AppHeaderProps {
  backPath?: string
}

export function AppHeader({ backPath }: AppHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {backPath && <BackButton to={backPath} />}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app/settings" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
} 