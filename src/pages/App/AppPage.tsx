import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Mic, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { 
    name: 'Podcasts', 
    href: '/app/podcasts', 
    icon: Mic
  },
  { 
    name: 'Recommendations', 
    href: '/app/recommendations/edit', 
    icon: BookOpen
  },
]

export function AppPage() {
  return (
    <div className="mx-auto px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-4">
          {navigation.map((item) => (
            <Link key={item.href} to={item.href} className="block">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full h-16 flex items-center gap-4 text-lg transition-all duration-200",
                  "border-2 hover:scale-[1.02] active:scale-[0.98]",
                  "bg-card hover:bg-accent/50",
                  "border-accent hover:border-accent/80"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-semibold">{item.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 