import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ClearableSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  onClear?: () => void
  children: ReactNode
  className?: string
  name?: string
  required?: boolean
}

export function ClearableSelect({
  value,
  onValueChange,
  placeholder = 'Select option',
  disabled = false,
  clearable = false,
  onClear,
  children,
  className,
  name,
  required
}: ClearableSelectProps) {
  return (
    <div className="relative">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      
      {clearable && value && onClear && (
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClear()
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label="Clear selection"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
} 