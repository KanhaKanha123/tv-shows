import { apiGet } from '../apiClient/api-client'
import type { Show, ShowSearchResult } from '../../types'

export const getShows = (page = 0): Promise<Show[]> => apiGet<Show[]>(`/shows?page=${page}`)

export const getShowById = (id: number): Promise<Show> => apiGet<Show>(`/shows/${id}`)

export const searchShows = (query: string): Promise<ShowSearchResult[]> =>
  apiGet<ShowSearchResult[]>(`/search/shows?q=${encodeURIComponent(query)}`)
