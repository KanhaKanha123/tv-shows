import type { GenreGroup, Show } from '../../types'
import { sortShowsByRating } from '../sortShowsByRating/sortShowsByRating'

export function groupShowsByGenre(shows: Show[]): GenreGroup[] {
  const groups = new Map<string, Show[]>()

  for (const show of shows) {
    for (const genre of show.genres) {
      const genreShows = groups.get(genre) ?? []

      genreShows.push(show)
      groups.set(genre, genreShows)
    }
  }

  return Array.from(groups, ([name, genreShows]) => ({
    name,
    shows: sortShowsByRating(genreShows),
  }))
}
