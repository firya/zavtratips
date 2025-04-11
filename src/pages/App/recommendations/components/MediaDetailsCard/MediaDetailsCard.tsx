import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MediaDetailsCardProps {
  imageUrl?: string
  platforms?: string
  rate?: number
  genre?: string
  releaseDate?: string | Date
  length?: string
}

export function MediaDetailsCard({
  imageUrl,
  platforms,
  rate,
  genre,
  releaseDate,
  length
}: MediaDetailsCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!imageUrl && !platforms && !rate && !genre && !releaseDate && !length) {
    return null
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return undefined
    if (date instanceof Date) return date.toLocaleDateString()
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return date
    }
  }

  return (
    <Card>
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Media Details</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      {isOpen && (
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            {imageUrl && (
              <div className="col-span-2">
                <img
                  src={imageUrl}
                  alt="Media"
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
            {platforms && (
              <div>
                <p className="text-sm font-medium">Platforms</p>
                <p className="text-sm text-muted-foreground">{platforms}</p>
              </div>
            )}
            {rate !== undefined && (
              <div>
                <p className="text-sm font-medium">Rate</p>
                <p className="text-sm text-muted-foreground">{rate}/10</p>
              </div>
            )}
            {genre && (
              <div>
                <p className="text-sm font-medium">Genre</p>
                <p className="text-sm text-muted-foreground">{genre}</p>
              </div>
            )}
            {releaseDate && (
              <div>
                <p className="text-sm font-medium">Release Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(releaseDate)}
                </p>
              </div>
            )}
            {length && (
              <div>
                <p className="text-sm font-medium">Length</p>
                <p className="text-sm text-muted-foreground">{length}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
} 