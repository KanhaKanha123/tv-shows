import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppHeader from './AppHeader.vue'

const replaceMock = vi.fn()
const cancelMock = vi.fn()

let routeQuery: Record<string, unknown> = {}

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: routeQuery,
  }),

  useRouter: () => ({
    replace: replaceMock,
  }),

  RouterLink: {
    props: ['to'],
    inheritAttrs: false,
    template: `
      <a
        class="router-link-stub"
        :data-to="JSON.stringify(to)"
        v-bind="$attrs"
      >
        <slot />
      </a>
    `,
  },
}))

vi.mock('../../utils', () => ({
  debounce: (callback: (query: string) => void) => {
    const debounced = (query: string) => {
      callback(query)
    }

    debounced.cancel = cancelMock

    return debounced
  },
}))

function createWrapper(
  props: {
    showSearch?: boolean
  } = {},
) {
  return mount(AppHeader, {
    props,
    global: {
      stubs: {
        SearchBar: {
          props: ['initialValue'],
          emits: ['search'],
          template: `
            <div
              class="search-bar-stub"
              :data-initial-value="initialValue"
            >
              <button
                class="emit-search"
                @click="$emit('search', '  The Wire  ')"
              >
                Search
              </button>

              <button
                class="emit-empty-search"
                @click="$emit('search', '   ')"
              >
                Clear
              </button>
            </div>
          `,
        },
      },
    },
  })
}

describe('AppHeader', () => {
  beforeEach(() => {
    routeQuery = {}
    replaceMock.mockClear()
    cancelMock.mockClear()
  })

  it('renders the brand link', () => {
    const wrapper = createWrapper()

    const brand = wrapper.get('.brand')

    expect(brand.text()).toBe('TVSHOWS')

    expect(brand.attributes('aria-label')).toBe('TV Shows home')
  })

  it('links the brand to the home page', () => {
    const wrapper = createWrapper()

    expect(wrapper.get('.router-link-stub').attributes('data-to')).toBe(JSON.stringify('/'))
  })

  it('renders the skip link', () => {
    const wrapper = createWrapper()

    const skipLink = wrapper.get('.skip-link')

    expect(skipLink.text()).toBe('Skip to main content')

    expect(skipLink.attributes('href')).toBe('#main-content')
  })

  it('shows the search bar by default', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.search-bar-stub').exists()).toBe(true)
  })

  it('hides the search bar when showSearch is false', () => {
    const wrapper = createWrapper({
      showSearch: false,
    })

    expect(wrapper.find('.search-bar-stub').exists()).toBe(false)
  })

  it('passes the route query to the search bar', () => {
    routeQuery = {
      q: 'Breaking Bad',
    }

    const wrapper = createWrapper()

    expect(wrapper.get('.search-bar-stub').attributes('data-initial-value')).toBe('Breaking Bad')
  })

  it('passes an empty string when the route has no search query', () => {
    const wrapper = createWrapper()

    expect(wrapper.get('.search-bar-stub').attributes('data-initial-value')).toBe('')
  })

  it('trims the search query before updating the route', async () => {
    const wrapper = createWrapper()

    await wrapper.get('.emit-search').trigger('click')

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'home',
      query: {
        q: 'The Wire',
      },
    })
  })

  it('clears the query when the search value is empty', async () => {
    const wrapper = createWrapper()

    await wrapper.get('.emit-empty-search').trigger('click')

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'home',
      query: {},
    })
  })

  it('cancels the debounced search when unmounted', () => {
    const wrapper = createWrapper()

    wrapper.unmount()

    expect(cancelMock).toHaveBeenCalledOnce()
  })
})
