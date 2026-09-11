import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ShowCarousel from './ShowCarousel.vue'
import type { Show } from '../../types'

const shows: Show[] = [
  {
    id: 1,
    url: 'https://www.tvmaze.com/shows/1/breaking-bad',
    name: 'Breaking Bad',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Crime'],
    status: 'Ended',
    runtime: 47,
    averageRuntime: 47,
    premiered: '2008-01-20',
    ended: '2013-09-29',
    officialSite: 'https://www.breakingbad.com',
    schedule: {
      time: '21:00',
      days: ['Sunday'],
    },
    rating: {
      average: 9.5,
    },
    weight: 100,
    network: {
      id: 20,
      name: 'AMC',
      country: {
        name: 'United States',
        code: 'US',
        timezone: 'America/New_York',
      },
      officialSite: 'https://www.amctv.com',
    },
    webChannel: null,
    dvdCountry: null,
    externals: {
      tvrage: 18164,
      thetvdb: 81189,
      imdb: 'tt0903747',
    },
    image: {
      medium: 'breaking-bad-medium.jpg',
      original: 'breaking-bad-original.jpg',
    },
    summary: 'A high school chemistry teacher turned meth cook.',
    updated: 1609459200,
    _links: {
      self: {
        href: 'https://api.tvmaze.com/shows/1',
      },
      previousepisode: {
        href: 'https://api.tvmaze.com/episodes/349232',
      },
    },
  },
  {
    id: 2,
    url: 'https://www.tvmaze.com/shows/2/the-wire',
    name: 'The Wire',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Crime'],
    status: 'Ended',
    runtime: 60,
    averageRuntime: 60,
    premiered: '2002-06-02',
    ended: '2008-03-09',
    officialSite: null,
    schedule: {
      time: '21:00',
      days: ['Sunday'],
    },
    rating: {
      average: 9.3,
    },
    weight: 100,
    network: {
      id: 4,
      name: 'HBO',
      country: {
        name: 'United States',
        code: 'US',
        timezone: 'America/New_York',
      },
      officialSite: 'https://www.hbo.com',
    },
    webChannel: null,
    dvdCountry: null,
    externals: {
      tvrage: 3572,
      thetvdb: 79126,
      imdb: 'tt0749414',
    },
    image: {
      medium: 'the-wire-medium.jpg',
      original: 'the-wire-original.jpg',
    },
    summary: 'Baltimore drug scene from various angles.',
    updated: 1609459200,
    _links: {
      self: {
        href: 'https://api.tvmaze.com/shows/2',
      },
    },
  },
]

function createWrapper(
  props: {
    title?: string
    showViewAll?: boolean
  } = {},
) {
  return mount(ShowCarousel, {
    props: {
      title: props.title ?? 'Drama',
      shows,
      showViewAll: props.showViewAll,
    },
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: `
            <a
              class="router-link-stub"
              :data-to="JSON.stringify(to)"
            >
              <slot />
            </a>
          `,
        },
        ShowCard: {
          props: ['show'],
          template: `
            <article
              class="show-card-stub"
              :data-show-id="show.id"
            >
              {{ show.name }}
            </article>
          `,
        },
      },
    },
  })
}

describe('ShowCarousel', () => {
  it('renders the section title', () => {
    const wrapper = createWrapper()

    expect(wrapper.get('h2').text()).toBe('Drama')
  })

  it('renders the subtitle using the lowercase title', () => {
    const wrapper = createWrapper({
      title: 'Science Fiction',
    })

    expect(wrapper.get('.show-carousel-header p').text()).toBe('Top rated science fiction shows')
  })

  it('renders one show card for every show', () => {
    const wrapper = createWrapper()

    const cards = wrapper.findAll('.show-card-stub')

    expect(cards).toHaveLength(2)

    expect(cards[0]?.text()).toContain('Breaking Bad')
    expect(cards[1]?.text()).toContain('The Wire')
  })

  it('renders the view all link by default', () => {
    const wrapper = createWrapper()

    const link = wrapper.get('.show-carousel-action')

    expect(link.text()).toContain('View all')
  })

  it('creates the correct genre route for view all', () => {
    const wrapper = createWrapper({
      title: 'Science Fiction',
    })

    const link = wrapper.get('.router-link-stub')

    expect(link.attributes('data-to')).toBe(
      JSON.stringify({
        name: 'genre',
        params: {
          genre: 'science fiction',
        },
      }),
    )
  })

  it('hides the view all link when showViewAll is false', () => {
    const wrapper = createWrapper({
      showViewAll: false,
    })

    expect(wrapper.find('.show-carousel-action').exists()).toBe(false)
  })

  it('sets the correct section aria-labelledby value', () => {
    const wrapper = createWrapper({
      title: 'Science Fiction',
    })

    const section = wrapper.get('section')
    const heading = wrapper.get('h2')

    expect(section.attributes('aria-labelledby')).toBe('genre-science-fiction')

    expect(heading.attributes('id')).toBe('genre-science-fiction')
  })

  it('sets an accessible label on the horizontal show list', () => {
    const wrapper = createWrapper({
      title: 'Drama',
    })

    expect(wrapper.get('.show-carousel-scroll').attributes('aria-label')).toBe('Drama shows')
  })

  it('renders no show cards when the show list is empty', () => {
    const wrapper = mount(ShowCarousel, {
      props: {
        title: 'Drama',
        shows: [],
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
          ShowCard: {
            template: '<article class="show-card-stub" />',
          },
        },
      },
    })

    expect(wrapper.findAll('.show-card-stub')).toHaveLength(0)
  })
})
