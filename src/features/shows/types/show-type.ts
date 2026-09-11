export interface Show {
  id: number
  url: string
  name: string
  type: string
  language: string | null
  genres: string[]
  status: string
  runtime: number | null
  averageRuntime: number | null
  premiered: string | null
  ended: string | null
  officialSite: string | null
  schedule: Schedule
  rating: Rating
  weight: number
  network: Network | null
  webChannel: WebChannel | null
  dvdCountry: Country | null
  externals: Externals
  image: Image | null
  summary: string | null
  updated: number
  _links: ShowLinks
}

export interface Schedule {
  time: string
  days: string[]
}

export interface Rating {
  average: number | null
}

export interface Country {
  name: string
  code: string
  timezone: string
}

export interface Network {
  id: number
  name: string
  country: Country | null
  officialSite: string | null
}

export interface WebChannel {
  id: number
  name: string
  country: Country | null
  officialSite: string | null
}

export interface Externals {
  tvrage: number | null
  thetvdb: number | null
  imdb: string | null
}

export interface Image {
  medium: string
  original: string
}

export interface Link {
  href: string
  name?: string
}

export interface ShowLinks {
  self: Link
  previousepisode?: Link
  nextepisode?: Link
}

export interface ShowSearchResult {
  score: number
  show: Show
}

export interface GenreGroup {
  name: string
  shows: Show[]
}

export interface AsyncState {
  isLoading: boolean
  error: string | null
}
