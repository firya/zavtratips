import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RecommendationForm } from './components/RecommendationForm'
import { useRecommendationsStore } from '@/stores/recommendations'
import { X } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function EditRecommendationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { 
    currentRecommendation, 
    isLoading, 
    error,
    fetchRecommendation,
    deleteRecommendation,
    clearCurrentRecommendation
  } = useRecommendationsStore()

  useEffect(() => {
    if (id) {
      fetchRecommendation(id).catch(() => {
        toast.error('Failed to load recommendation')
      })
    }
    
    // Clear current recommendation when unmounting
    return () => {
      clearCurrentRecommendation()
    }
  }, [id, fetchRecommendation, clearCurrentRecommendation])

  const handleDelete = async () => {
    if (!id) return

    try {
      await deleteRecommendation(id)
      toast.success('Recommendation deleted successfully')
      navigate('/app/recommendations')
    } catch (error) {
      toast.error('Failed to delete recommendation')
      console.error('Error deleting recommendation:', error)
    }
  }

  if (error && !currentRecommendation) {
    return <div>Recommendation not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Recommendation</h1>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading recommendation data...</span>
          </div>
        )}
      </div>
      <div className="space-y-6">
        <RecommendationForm
          initialData={currentRecommendation || undefined}
          onSuccess={() => navigate('/app/recommendations')}
          onCancel={() => navigate('/app/recommendations')}
          isLoading={isLoading}
        />
        {currentRecommendation && (
          <>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              Delete Recommendation
            </Button>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Recommendation</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this recommendation? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
} 