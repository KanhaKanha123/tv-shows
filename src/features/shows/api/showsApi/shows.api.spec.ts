import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiGet } from '../apiClient/api-client'
import { getShowById, getShows, searchShows } from './shows.api'

vi.mock('../apiClient/api-client', () => ({
  apiGet: vi.fn(),
}))

describe('shows-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets shows', async () => {
    vi.mocked(apiGet).mockResolvedValue([])

    await getShows()

    expect(apiGet).toHaveBeenCalledWith('/shows?page=0')
  })

  it('gets a show by id', async () => {
    vi.mocked(apiGet).mockResolvedValue(undefined)

    await getShowById(123)

    expect(apiGet).toHaveBeenCalledWith('/shows/123')
  })

  it('searches shows using the provided query', async () => {
    vi.mocked(apiGet).mockResolvedValue([])

    await searchShows('batman')

    expect(apiGet).toHaveBeenCalledWith('/search/shows?q=batman')
  })

  it('encodes special characters in the search query', async () => {
    vi.mocked(apiGet).mockResolvedValue([])

    await searchShows('game of thrones')

    expect(apiGet).toHaveBeenCalledWith('/search/shows?q=game%20of%20thrones')
  })
})
