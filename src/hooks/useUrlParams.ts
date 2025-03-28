import { useSearchParams, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useRecommendationsStore } from '@/store/recommendationsStore'

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { 
    filters, 
    setFiltersFromUrl, 
    fetchRecommendations,
    fetchTypes,
    fetchPodcasts,
    fetchHosts
  } = useRecommendationsStore()
  const isInitialMount = useRef(true)
  const hasUrlParams = useRef(false)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('type', filters.type)
    if (filters.podcastShowType) params.set('podcastShowType', filters.podcastShowType)
    if (filters.podcastNumber) params.set('podcastNumber', filters.podcastNumber)
    if (filters.hosts.length > 0) params.set('hosts', filters.hosts.join(','))
    if (filters.page > 1) params.set('page', filters.page.toString())
    if (filters.dateRange?.from) params.set('dateFrom', filters.dateRange.from.toISOString())
    if (filters.dateRange?.to) params.set('dateTo', filters.dateRange.to.toISOString())

    // Only update URL if we're on the recommendations page
    if (location.pathname === '/recommendations') {
      setSearchParams(params)
    }
  }, [filters, setSearchParams, location.pathname])

  // Handle initial data fetching and URL parameters
  useEffect(() => {
    // Only process if we're on the recommendations page
    if (location.pathname !== '/recommendations') return

    // Only process on initial mount
    if (!isInitialMount.current) return

    // Fetch initial data
    fetchTypes()
    fetchPodcasts()
    fetchHosts()

    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const podcastShowType = searchParams.get('podcastShowType')
    const podcastNumber = searchParams.get('podcastNumber')
    const hosts = searchParams.get('hosts')
    const page = searchParams.get('page')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const hasParams = Boolean(search || type || podcastShowType || podcastNumber || hosts || page || dateFrom || dateTo)
    hasUrlParams.current = hasParams

    if (hasParams) {
      const newFilters: any = {}
      if (search) newFilters.search = search
      if (type) newFilters.type = type
      if (podcastShowType) newFilters.podcastShowType = podcastShowType
      if (podcastNumber) newFilters.podcastNumber = podcastNumber
      if (hosts) newFilters.hosts = hosts.split(',')
      if (page) newFilters.page = parseInt(page)
      if (dateFrom || dateTo) {
        newFilters.dateRange = {
          from: dateFrom ? new Date(dateFrom) : undefined,
          to: dateTo ? new Date(dateTo) : undefined
        }
      }

      setFiltersFromUrl(newFilters)
    } else {
      // If no URL parameters, just fetch with default filters
      fetchRecommendations()
    }

    isInitialMount.current = false
  }, [location.pathname, searchParams, setFiltersFromUrl, fetchRecommendations, fetchTypes, fetchPodcasts, fetchHosts])
} 