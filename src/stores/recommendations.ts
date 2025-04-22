import { create } from 'zustand'
import { api } from '@/lib/api'
import { DateRange } from '@/components/ui/calendar'

interface Type {
  id: number
  value: string
}

interface Podcast {
  showType: string
  number: string
  date: string
}

export interface MediaItem {
  name: string
  link: string
  image: string
  platforms: string
  rate: number
  genre: string
  releaseDate: string
  length: string | { gameplayMain: number; gameplayMainExtra: number; gameplayCompletionist: number }
}

interface Recommendation {
  id: number
  podcastId: number
  typeId: number
  name: string
  link: string
  image?: string
  platforms?: string
  rate?: number
  genre?: string
  releaseDate?: Date
  length?: string
  dima: boolean | null
  timur: boolean | null
  maksim: boolean | null
  guest?: string
  type?: Type
  podcast?: Podcast
  rowNumber?: number
  showType?: string
  number?: string
}

interface Filters {
  search: string
  type: string
  podcastShowType: string
  podcastNumber: string
  hosts: string[]
  page: number
  limit: number
  dateRange?: DateRange
}

interface RecommendationsStore {
  recommendations: Recommendation[]
  mediaItems: MediaItem[]
  isLoading: boolean
  isMediaSearchLoading: boolean
  error: string | null
  filters: Filters
  localFilters: Filters
  totalCount: number
  currentRecommendation: Recommendation | null
  setFilter: (key: keyof Filters, value: any) => void
  setLocalFilter: (key: keyof Filters, value: any) => void
  resetFilters: () => void
  applyFilters: () => Promise<void>
  fetchRecommendations: () => Promise<void>
  setFiltersFromUrl: (filters: Partial<Filters>) => Promise<void>
  deleteRecommendation: (id: string) => Promise<void>
  fetchRecommendation: (id: string) => Promise<void>
  clearCurrentRecommendation: () => void
  searchMedia: (search: string, typeId: string) => Promise<void>
  createRecommendation: (data: Partial<Recommendation>) => Promise<void>
  updateRecommendation: (id: number, data: Partial<Recommendation>) => Promise<void>
}

const defaultFilters: Filters = {
  search: '',
  type: '',
  podcastShowType: '',
  podcastNumber: '',
  hosts: [],
  page: 1,
  limit: 24,
}

export const useRecommendationsStore = create<RecommendationsStore>((set, get) => ({
  recommendations: [],
  mediaItems: [],
  isLoading: false,
  isMediaSearchLoading: false,
  error: null,
  filters: defaultFilters,
  localFilters: defaultFilters,
  totalCount: 0,
  currentRecommendation: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }))
  },

  setLocalFilter: (key, value) => {
    set((state) => ({
      localFilters: {
        ...state.localFilters,
        [key]: value,
      },
    }))
  },

  resetFilters: () => {
    set({
      localFilters: defaultFilters,
      filters: defaultFilters,
    })
  },

  applyFilters: async () => {
    const { localFilters } = get()
    set({ filters: localFilters })
    await get().fetchRecommendations()
  },

  setFiltersFromUrl: async (newFilters) => {
    // Create a new filters object with default values for any fields not in newFilters
    const updatedFilters = {
      ...defaultFilters,
      ...newFilters,
    }

    set({
      filters: updatedFilters,
      localFilters: updatedFilters,
    })
    await get().fetchRecommendations()
  },

  fetchRecommendations: async () => {
    const { filters } = get()
    set({ isLoading: true, error: null })

    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.podcastShowType && { podcastShowType: filters.podcastShowType }),
        ...(filters.podcastNumber && { podcastNumber: filters.podcastNumber }),
        ...(filters.hosts.length > 0 && { hosts: filters.hosts.join(',') }),
        ...(filters.dateRange?.from && {
          dateFrom: new Date(filters.dateRange.from.setHours(0, 0, 0, 0)).toISOString()
        }),
        ...(filters.dateRange?.to && {
          dateTo: new Date(filters.dateRange.to.setHours(23, 59, 59, 999)).toISOString()
        }),
      })

      const response = await api.get(`/recommendations?${params}`)
      set({
        recommendations: response.data.recommendations,
        totalCount: response.data.total,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      })
    }
  },

  deleteRecommendation: async (id: string) => {
    try {
      await api.delete(`/recommendations/${id}`)
      await get().fetchRecommendations()
    } catch (error) {
      console.error('Error deleting recommendation:', error)
      throw error
    }
  },

  fetchRecommendation: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/recommendations/${id}`)
      set({
        currentRecommendation: response.data,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch recommendation',
        isLoading: false,
        currentRecommendation: null,
      })
      throw error
    }
  },

  clearCurrentRecommendation: () => {
    set({ currentRecommendation: null })
  },

  searchMedia: async (search: string, typeId: string) => {
    if (!search || !typeId) {
      set({ mediaItems: [] })
      return
    }

    set({ isMediaSearchLoading: true })
    try {
      const response = await api.get(`/recommendations/search-media?search=${search}&typeId=${typeId}`)
      set({
        mediaItems: response.data,
        isMediaSearchLoading: false
      })
    } catch (error) {
      console.error('Error fetching media:', error)
      set({
        mediaItems: [],
        isMediaSearchLoading: false
      })
    }
  },

  createRecommendation: async (data: Partial<Recommendation>) => {
    set({ isLoading: true, error: null })
    try {
      await api.post('/recommendations', data)
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create recommendation',
        isLoading: false
      })
      throw error
    }
  },

  updateRecommendation: async (id: number, data: Partial<Recommendation>) => {
    set({ isLoading: true, error: null })
    try {
      await api.put(`/recommendations/${id}`, data)
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update recommendation',
        isLoading: false
      })
      throw error
    }
  },
}))