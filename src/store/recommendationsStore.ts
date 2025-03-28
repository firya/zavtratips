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

interface Recommendation {
  id: string
  name: string
  link: string
  image?: string
  platforms?: string
  rate?: number
  length?: string
  type?: Type
  podcast?: Podcast
  dima?: boolean
  timur?: boolean
  maksim?: boolean
  guest?: string
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
  isLoading: boolean
  error: string | null
  filters: Filters
  localFilters: Filters
  totalCount: number
  availableTypes: Type[]
  availablePodcasts: Podcast[]
  availableHosts: string[]
  isPodcastSearchLoading: boolean
  podcastSearch: string
  setPodcastSearch: (search: string) => void
  setFilter: (key: keyof Filters, value: any) => void
  setLocalFilter: (key: keyof Filters, value: any) => void
  resetFilters: () => void
  applyFilters: () => Promise<void>
  fetchTypes: () => Promise<void>
  fetchPodcasts: (search?: string) => Promise<void>
  fetchHosts: () => Promise<void>
  fetchRecommendations: () => Promise<void>
  setFiltersFromUrl: (filters: Partial<Filters>) => Promise<void>
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
  isLoading: false,
  error: null,
  filters: defaultFilters,
  localFilters: defaultFilters,
  totalCount: 0,
  availableTypes: [],
  availablePodcasts: [],
  availableHosts: [],
  isPodcastSearchLoading: false,
  podcastSearch: '',

  setPodcastSearch: (search: string) => {
    set({ podcastSearch: search })
    if (search.trim()) {
      get().fetchPodcasts(search.trim())
    } else {
      set({ availablePodcasts: [] })
    }
  },

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
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
      localFilters: {
        ...state.localFilters,
        ...newFilters,
      },
    }))
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
        ...(filters.dateRange?.from && { dateFrom: filters.dateRange.from.toISOString() }),
        ...(filters.dateRange?.to && { dateTo: filters.dateRange.to.toISOString() }),
      })

      const response = await api.get(`/api/recommendations?${params}`)
      set({
        recommendations: response.data.recommendations,
        totalCount: response.data.total,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        isLoading: false,
      })
    }
  },

  fetchTypes: async () => {
    try {
      const response = await api.get('/api/recommendations/types')
      set({ availableTypes: response.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch types',
      })
    }
  },

  fetchPodcasts: async (search?: string) => {
    if (!search?.trim()) {
      set({ availablePodcasts: [] })
      return
    }

    if (get().isPodcastSearchLoading) {
      return
    }

    set({ isPodcastSearchLoading: true })
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append('search', search)
      }
      const response = await api.get(`/api/recommendations/podcasts?${params}`)
      set({ availablePodcasts: response.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch podcasts',
        availablePodcasts: []
      })
    } finally {
      set({ isPodcastSearchLoading: false })
    }
  },

  fetchHosts: async () => {
    try {
      const response = await api.get('/api/recommendations/hosts')
      set({ availableHosts: response.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch hosts',
      })
    }
  },
})) 