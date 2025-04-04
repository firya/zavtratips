import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export function Settings() {
  const handleSync = async () => {
    try {
      await api.post('/sync')
      alert('Database sync completed successfully')
    } catch (error) {
      console.error('Failed to sync database:', error)
      alert('Failed to sync database. Check console for details.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Button onClick={handleSync}>Sync Database</Button>
    </div>
  )
} 