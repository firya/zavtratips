import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PodcastForm } from './components/PodcastForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

interface Podcast {
  id: number
  date: string
  showType: string
  number: string
  name: string
  length: number
}

function millisecondsToHHMMSS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function EditPodcastPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchPodcast = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        const response = await api.get(`/podcasts/${id}`)
        setPodcast(response.data)
      } catch (error) {
        console.error('Error fetching podcast:', error)
        toast.error('Failed to fetch podcast')
        navigate('/app/podcasts')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPodcast()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!id) return
    
    const toastId = toast.loading('Deleting podcast...')
    
    try {
      setIsDeleting(true)
      await api.delete(`/podcasts/${id}`)
      toast.success('Podcast deleted successfully', { id: toastId })
      navigate('/app/podcasts')
    } catch (error) {
      console.error('Error deleting podcast:', error)
      toast.error('Failed to delete podcast', { id: toastId })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Podcast</h1>
        {podcast && (
          <h2 className="text-xl font-semibold">
            {podcast.showType} #{podcast.number}
          </h2>
        )}
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading podcast data...</span>
          </div>
        )}
      </div>

      <PodcastForm
        initialData={podcast ? {
          id: podcast.id,
          date: new Date(podcast.date),
          showType: podcast.showType,
          number: podcast.number,
          name: podcast.name,
          length: millisecondsToHHMMSS(podcast.length)
        } : undefined}
        onSuccess={() => navigate('/app/podcasts')}
        onCancel={() => navigate('/app/podcasts')}
        isLoading={isLoading}
        mode="edit"
      />

      {podcast && (
        <div className="mt-8">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isLoading}
          >
            Delete Podcast
          </Button>
        </div>
      )}

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open: boolean) => !open && setIsDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Podcast</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this podcast? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Deleting...
                </>
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 