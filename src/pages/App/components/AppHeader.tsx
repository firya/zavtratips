import { Mic } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 