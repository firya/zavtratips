import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Mic, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { 
    name: 'Create Podcast', 
    href: '/app/podcasts/create', 
    icon: Plus,
    type: 'podcast'
  },
  { 
    name: 'Edit Podcast', 
    href: '/app/podcasts/edit', 
    icon: Edit,
    type: 'podcast'
  },
  { 
    name: 'Create Recommendation', 
    href: '/app/recommendations/create', 
    icon: Plus,
    type: 'recommendation'
  },
  { 
    name: 'Edit Recommendation', 
    href: '/app/recommendations/edit', 
    icon: Edit,
    type: 'recommendation'
  },
]

export function AppPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-4">
          {navigation.map((item) => (
            <Link key={item.href} to={item.href} className="block">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full h-16 flex items-center justify-center gap-2 text-lg transition-colors",
                  item.type === 'podcast'
                    ? "border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-600"
                    : "border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-600"
                )}
              >
                <item.icon className="h-6 w-6" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 