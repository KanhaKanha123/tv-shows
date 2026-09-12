import { nextTick, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, getShows } from '../../api';
import type { Show } from '../../types';
import { useGenreShows } from './useGenreShows';

vi.mock('../../api', () => ({
  getShows: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public readonly status: number,
    ) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

function createShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    url: 'https://example.com/show/1',
    name: 'The Wire',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
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
    network: null,
    webChannel: null,
    dvdCountry: null,
    externals: {
      tvrage: null,
      thetvdb: null,
      imdb: null,
    },
    image: null,
    summary: 'A crime drama.',
    updated: 1,
    _links: {
      self: {
        href: 'https://example.com/show/1',
      },
    },
    ...overrides,
  };
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
}

describe('useGenreShows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes genre names and loads only matching shows while deduplicating results', async () => {
    const genre = ref(' drama ');
    const firstShow = createShow({ id: 1, name: 'The Wire', genres: ['Drama'] });
    const duplicateShow = createShow({ id: 1, name: 'The Wire Duplicate', genres: ['Drama'] });
    const secondShow = createShow({ id: 2, name: 'Better Call Saul', genres: ['Drama'] });

    vi.mocked(getShows)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([firstShow, duplicateShow])
      .mockResolvedValueOnce([secondShow]);

    const composable = useGenreShows(genre);

    await flushMicrotasks();

    expect(composable.genreName.value).toBe('Drama');
    expect(composable.shows.value).toEqual([firstShow]);
    expect(getShows).toHaveBeenNthCalledWith(1, 0);
    expect(getShows).toHaveBeenNthCalledWith(2, 1);
    expect(composable.isLoading.value).toBe(false);
  });

  it('stops pagination when the API returns a 404 and keeps the error empty', async () => {
    const genre = ref('drama');

    vi.mocked(getShows).mockRejectedValueOnce(new ApiError('No more shows', 404));

    const composable = useGenreShows(genre);

    await flushMicrotasks();

    expect(composable.hasMoreShows.value).toBe(false);
    expect(composable.error.value).toBeNull();
    expect(composable.isLoadingMore.value).toBe(false);
  });

  it('captures non-404 errors thrown while loading more shows', async () => {
    const genre = ref('drama');

    vi.mocked(getShows).mockRejectedValueOnce(new Error('network issue'));

    const composable = useGenreShows(genre);

    await flushMicrotasks();

    expect(composable.error.value).toBe('network issue');
    expect(composable.isLoadingMore.value).toBe(false);
  });

  it('resets and reloads when the genre changes', async () => {
    const genre = ref('drama');
    const dramaShow = createShow({ id: 1, name: 'Drama Show', genres: ['Drama'] });
    const comedyShow = createShow({ id: 2, name: 'Comedy Show', genres: ['Comedy'] });

    vi.mocked(getShows).mockResolvedValueOnce([dramaShow]).mockResolvedValueOnce([comedyShow]);

    const composable = useGenreShows(genre);

    await flushMicrotasks();
    expect(composable.shows.value).toEqual([dramaShow]);

    genre.value = 'comedy';
    await flushMicrotasks();

    expect(composable.shows.value).toEqual([comedyShow]);
    expect(composable.genreName.value).toBe('Comedy');
  });
});
