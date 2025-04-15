import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { RecommendationForm } from './components/RecommendationForm'
import { useRecommendationsStore } from '@/stores/recommendations'
import { X } from 'lucide-react'
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
    deleteRecommendation
  } = useRecommendationsStore()

  useEffect(() => {
    if (id) {
      fetchRecommendation(id).catch(() => {
        toast.error('Failed to load recommendation')
      })
    }
  }, [id, fetchRecommendation])

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

            <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className={cn(
                  "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                )} />
                <Dialog.Content className={cn(
                  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full"
                )}>
                  <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                      Delete Recommendation
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      Are you sure you want to delete this recommendation? This action cannot be undone.
                    </Dialog.Description>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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
                  </div>

                  <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        )}
      </div>
    </div>
  )
} 