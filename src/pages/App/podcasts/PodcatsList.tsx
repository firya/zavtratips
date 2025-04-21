import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'

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

export function PodcastList() {
  const navigate = useNavigate()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [showTypeFilter, setShowTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const fetchPodcasts = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }
      
      if (showTypeFilter) {
        params.append('showType', showTypeFilter)
      }
      
      if (dateFilter) {
        params.append('date', dateFilter)
      }

      const controller = new AbortController()
      const signal = controller.signal
      
      const response = await api.get(`/podcasts?${params}`, { signal })
      setPodcasts(response.data.podcasts)
      setTotalItems(response.data.total)
      setIsLoading(false)
      
      return () => controller.abort()
    } catch (error) {
      console.error('Error fetching podcasts:', error)
      setErrorMessage('Failed to fetch podcasts')
      setIsLoading(false)
    }
  }, [page, limit, debouncedSearch, showTypeFilter, dateFilter])

  useEffect(() => {
    fetchPodcasts()
  }, [fetchPodcasts])

  const handleDeleteClick = (id: number) => {
    setDeleteDialogId(id);
  }

  const handleDelete = async () => {
    if (!deleteDialogId) return
    
    const toastId = toast.loading('Deleting podcast...');
    
    try {
      setIsDeleting(deleteDialogId)
      await api.delete(`/podcasts/${deleteDialogId}`)
      toast.success('Podcast deleted successfully', { id: toastId })
      fetchPodcasts()
    } catch (error) {
      console.error('Error deleting podcast:', error)
      toast.error('Failed to delete podcast', { id: toastId })
    } finally {
      setIsDeleting(null)
      setDeleteDialogId(null)
    }
  }

  const handleRowClick = (id: number) => {
    navigate(`/app/podcasts/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Podcasts</h1>
        <Button onClick={() => navigate('/app/podcasts/create')}>
          Create Podcast
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search podcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Podcast</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {podcasts.map((podcast) => (
                <TableRow 
                  key={podcast.id} 
                  onClick={() => handleRowClick(podcast.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="font-medium">
                      {podcast.showType} #{podcast.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(podcast.date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/podcasts/${podcast.id}`);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(podcast.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog 
        open={deleteDialogId !== null} 
        onOpenChange={(open: boolean) => !open && setDeleteDialogId(null)}
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
              onClick={() => setDeleteDialogId(null)}
              disabled={isDeleting !== null}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting !== null}
            >
              {isDeleting !== null ? (
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