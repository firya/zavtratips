import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'

export function Settings() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    const toastId = toast.loading('Syncing...')
    
    try {
      await api.post('/sync')
      toast.success('Sync completed', { id: toastId })
    } catch (error) {
      toast.error('Failed to sync database. Check console for details.', { id: toastId })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Button 
        onClick={handleSync} 
        disabled={isSyncing}
      >
        {isSyncing ? 'Syncing...' : 'Sync Database'}
      </Button>
    </div>
  )
} 