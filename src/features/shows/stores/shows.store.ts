import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Show } from '../types'
import { getShowById, getShows, searchShows } from '../api'
import { groupShowsByGenre } from '../utils'

export const useShowsStore = defineStore('shows', () => {
  const allShows = ref<Show[]>([])
  const searchResults = ref<Show[]>([])
  const selectedShow = ref<Show | null>(null)

  const isLoadingShows = ref(false)
  const isSearching = ref(false)
  const isLoadingShowDetail = ref(false)

  const showsError = ref<string | null>(null)
  const searchError = ref<string | null>(null)
  const showDetailError = ref<string | null>(null)

  const genreGroups = computed(() => groupShowsByGenre(allShows.value))

  const searchGenreGroups = computed(() => groupShowsByGenre(searchResults.value))

  let hasLoadedShows = false
  let loadShowsPromise: Promise<void> | null = null

  let searchRequestToken = 0
  let detailRequestToken = 0

  const searchCache = new Map<string, Show[]>()
  const showDetailsCache = new Map<number, Show>()

  function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback
  }

  async function loadShows(): Promise<void> {
    if (hasLoadedShows) {
      return
    }

    if (loadShowsPromise) {
      return loadShowsPromise
    }

    loadShowsPromise = (async () => {
      isLoadingShows.value = true
      showsError.value = null

      try {
        const shows = await getShows(0)

        allShows.value = shows
        hasLoadedShows = true
      } catch (error) {
        showsError.value = getErrorMessage(error, 'Failed to load shows')
      } finally {
        isLoadingShows.value = false
        loadShowsPromise = null
      }
    })()

    return loadShowsPromise
  }

  async function search(query: string): Promise<void> {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      searchResults.value = []
      searchError.value = null
      return
    }

    const cacheKey = normalizedQuery.toLowerCase()

    const cachedResults = searchCache.get(cacheKey)

    if (cachedResults) {
      searchResults.value = cachedResults
      searchError.value = null
      return
    }

    const requestToken = ++searchRequestToken

    isSearching.value = true
    searchError.value = null

    try {
      const results = await searchShows(normalizedQuery)

      if (requestToken !== searchRequestToken) {
        return
      }

      const normalizedSearch = normalizedQuery.toLowerCase()

      const shows = results
        .map(({ show }) => show)
        .filter((show) => show.name.toLowerCase().includes(normalizedSearch))

      searchCache.set(cacheKey, shows)

      searchResults.value = shows
    } catch (error) {
      if (requestToken !== searchRequestToken) {
        return
      }

      searchError.value = getErrorMessage(error, 'Failed to search shows')
    } finally {
      if (requestToken === searchRequestToken) {
        isSearching.value = false
      }
    }
  }

  async function loadShowById(id: number): Promise<void> {
    const cachedShow = showDetailsCache.get(id)

    if (cachedShow) {
      selectedShow.value = cachedShow

      showDetailError.value = null
      return
    }

    const requestToken = ++detailRequestToken

    isLoadingShowDetail.value = true
    showDetailError.value = null
    selectedShow.value = null

    try {
      const show = await getShowById(id)

      if (requestToken !== detailRequestToken) {
        return
      }

      showDetailsCache.set(id, show)

      selectedShow.value = show
    } catch (error) {
      if (requestToken !== detailRequestToken) {
        return
      }

      selectedShow.value = null

      showDetailError.value = getErrorMessage(error, 'Failed to load show')
    } finally {
      if (requestToken === detailRequestToken) {
        isLoadingShowDetail.value = false
      }
    }
  }

  return {
    allShows,
    searchResults,
    selectedShow,

    genreGroups,
    searchGenreGroups,

    isLoadingShows,
    isSearching,
    isLoadingShowDetail,

    showsError,
    searchError,
    showDetailError,

    loadShows,
    search,
    loadShowById,
  }
})
