import { create } from 'zustand'
import { api } from '@/lib/api'

interface ConfigItem {
  id: number
  value: string
}

interface ConfigState {
  showTypes: ConfigItem[]
  types: ConfigItem[]
  hosts: string[]
  reactions: string[]
  isLoading: boolean
  error: string | null
  isLoaded: boolean
  fetchConfigs: () => Promise<void>
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  showTypes: [],
  types: [],
  hosts: [],
  reactions: [],
  isLoading: false,
  error: null,
  isLoaded: false,
  fetchConfigs: async () => {
    // If data is already loaded, don't fetch again
    if (get().isLoaded) {
      return
    }

    // If already loading, don't start another request
    if (get().isLoading) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/api/config')
      
      set({ 
        showTypes: response.data.showTypes || [],
        types: response.data.types || [],
        hosts: response.data.hosts || [],
        reactions: response.data.reactions || [],
        isLoading: false,
        isLoaded: true
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch configs',
        isLoading: false 
      })
    }
  }
})) 