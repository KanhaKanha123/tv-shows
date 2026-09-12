import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ShowInfo from './ShowInfo.vue';
import type { Show } from '../../types';

const createShow = (overrides: Partial<Show> = {}): Show =>
  ({
    id: 1,
    name: 'Breaking Bad',
    status: 'Ended',
    language: 'English',
    runtime: 60,
    genres: ['Drama', 'Crime', 'Thriller'],
    rating: {
      average: 9.5,
    },
    image: {
      medium: 'breaking-bad-medium.jpg',
      original: 'breaking-bad-original.jpg',
    },
    summary: '<p>A chemistry teacher turns to manufacturing drugs.</p>',
    ...overrides,
  }) as Show;

describe('ShowInfo', () => {
  it('renders the show name', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow(),
      },
    });

    expect(wrapper.get('h1').text()).toBe('Breaking Bad');
  });

  it('renders show metadata', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow(),
      },
    });

    const meta = wrapper.get('.show-meta');

    expect(meta.text()).toContain('Ended');
    expect(meta.text()).toContain('English');
    expect(meta.text()).toContain('60 min');
  });

  it('renders all genres', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow(),
      },
    });

    const genreChips = wrapper.findAll('.genre-chip');

    expect(genreChips).toHaveLength(3);
    expect(genreChips[0]?.text()).toBe('Drama');
    expect(genreChips[1]?.text()).toBe('Crime');
    expect(genreChips[2]?.text()).toBe('Thriller');
  });

  it('renders the average rating', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow(),
      },
    });

    expect(wrapper.get('.rating-box').text()).toContain('9.5');
  });

  it('renders N/A when rating is unavailable', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow({
          rating: {
            average: null,
          },
        }),
      },
    });

    expect(wrapper.get('.rating-box').text()).toContain('N/A');
  });

  it('renders the original poster image when available', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow(),
      },
    });

    const image = wrapper.get('.show-poster');

    expect(image.attributes('src')).toBe('breaking-bad-original.jpg');

    expect(image.attributes('alt')).toBe('Breaking Bad poster');
  });

  it('falls back to the medium poster when original is unavailable', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow({
          image: {
            medium: 'breaking-bad-medium.jpg',
            original: '',
          },
        }),
      },
    });

    expect(wrapper.get('.show-poster').attributes('src')).toBe('breaking-bad-medium.jpg');
  });

  it('renders the show summary as HTML', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow({
          summary: '<p>A <strong>chemistry teacher</strong> changes his life.</p>',
        }),
      },
    });

    const summary = wrapper.get('.summary');

    expect(summary.find('strong').exists()).toBe(true);

    expect(summary.find('strong').text()).toBe('chemistry teacher');
  });

  it('associates the summary section with its heading', () => {
    const wrapper = mount(ShowInfo, {
      props: {
        show: createShow(),
      },
    });

    const section = wrapper.get('.summary');
    const heading = wrapper.get('#summary-title');

    expect(section.attributes('aria-labelledby')).toBe('summary-title');

    expect(heading.text()).toBe('Summary');
  });
});
