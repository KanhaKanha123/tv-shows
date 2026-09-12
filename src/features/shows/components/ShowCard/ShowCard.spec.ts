import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ShowCard from './ShowCard.vue';
import type { Show } from '../../types';

const createShow = (overrides: Partial<Show> = {}): Show =>
  ({
    id: 1,
    name: 'Breaking Bad',
    genres: ['Drama', 'Crime'],
    rating: {
      average: 9.5,
    },
    image: {
      medium: 'breaking-bad-medium.jpg',
      original: 'breaking-bad-original.jpg',
    },
    ...overrides,
  }) as Show;

function createWrapper(show: Show = createShow()) {
  return mount(ShowCard, {
    props: {
      show,
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
      },
    },
  });
}

describe('ShowCard', () => {
  it('renders the show name', () => {
    const wrapper = createWrapper();

    expect(wrapper.get('h3').text()).toBe('Breaking Bad');
  });

  it('renders the show genres', () => {
    const wrapper = createWrapper();

    expect(wrapper.get('.show-card-content p').text()).toBe('Drama · Crime');
  });

  it('renders a fallback when genres are unavailable', () => {
    const wrapper = createWrapper(
      createShow({
        genres: [],
      }),
    );

    expect(wrapper.get('.show-card-content p').text()).toBe('Genre unavailable');
  });

  it('renders the poster image', () => {
    const wrapper = createWrapper();

    const image = wrapper.get('.show-card-image');

    expect(image.attributes('src')).toBe('breaking-bad-medium.jpg');

    expect(image.attributes('alt')).toBe('Breaking Bad poster');
  });

  it('uses lazy loading for the poster', () => {
    const wrapper = createWrapper();

    const image = wrapper.get('.show-card-image');

    expect(image.attributes('loading')).toBe('lazy');

    expect(image.attributes('decoding')).toBe('async');
  });

  it('renders the image fallback when no image is available', () => {
    const wrapper = createWrapper(
      createShow({
        image: null,
      }),
    );

    expect(wrapper.find('.show-card-image').exists()).toBe(false);

    expect(wrapper.get('.show-card-image-fallback').text()).toBe('No image');
  });

  it('renders the average rating', () => {
    const wrapper = createWrapper();

    expect(wrapper.get('.show-card-rating').text()).toContain('9.5');
  });

  it('adds an accessible label to the rating', () => {
    const wrapper = createWrapper();

    expect(wrapper.get('.show-card-rating').attributes('aria-label')).toBe('Rating 9.5 out of 10');
  });

  it('does not render the rating when rating is unavailable', () => {
    const wrapper = createWrapper(
      createShow({
        rating: {
          average: null,
        },
      }),
    );

    expect(wrapper.find('.show-card-rating').exists()).toBe(false);
  });

  it('creates the correct show detail route', () => {
    const wrapper = createWrapper(
      createShow({
        id: 42,
      }),
    );

    const link = wrapper.get('.router-link-stub');

    expect(link.attributes('data-to')).toBe(
      JSON.stringify({
        name: 'show-detail',
        params: {
          id: 42,
        },
      }),
    );
  });

  it('adds an accessible label to the show link', () => {
    const wrapper = createWrapper();

    const link = wrapper.get('.show-card-link');

    expect(link.attributes('aria-label')).toBe('View details for Breaking Bad');
  });
});
