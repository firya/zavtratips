import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'

export function Settings() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSyncingYouTube, setIsSyncingYouTube] = useState(false)

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

  const handleSyncYouTube = async () => {
    if (isSyncingYouTube) return
    
    setIsSyncingYouTube(true)
    const toastId = toast.loading('Syncing YouTube playlist...')
    
    try {
      await api.post('/streams/sync-youtube')
      toast.success('YouTube sync completed', { id: toastId })
    } catch (error) {
      toast.error('Failed to sync YouTube playlist. Check console for details.', { id: toastId })
      console.error('YouTube sync error:', error)
    } finally {
      setIsSyncingYouTube(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? 'Syncing...' : 'Sync Database'}
        </Button>
        <Button 
          onClick={handleSyncYouTube} 
          disabled={isSyncingYouTube}
          className="w-full"
          variant="outline"
        >
          {isSyncingYouTube ? 'Syncing...' : 'Sync YouTube Playlist'}
        </Button>
      </div>
    </div>
  )
} 