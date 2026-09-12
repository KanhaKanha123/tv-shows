import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getShowById, getShows, searchShows } from '../api';
import type { Show, ShowSearchResult } from '../types';
import { useShowsStore } from './shows.store';

vi.mock('../api', () => ({
  getShows: vi.fn(),
  searchShows: vi.fn(),
  getShowById: vi.fn(),
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

describe('useShowsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads shows once and groups them by genre', async () => {
    const show = createShow({ id: 1, name: 'The Wire', genres: ['Drama'] });
    vi.mocked(getShows).mockResolvedValue([show]);

    const store = useShowsStore();

    await store.loadShows();

    expect(getShows).toHaveBeenCalledTimes(1);
    expect(getShows).toHaveBeenCalledWith(0);
    expect(store.allShows).toEqual([show]);
    expect(store.genreGroups).toEqual([{ name: 'Drama', shows: [show] }]);
    expect(store.isLoadingShows).toBe(false);
    expect(store.showsError).toBeNull();
  });

  it('does not reload shows when they were already loaded', async () => {
    const show = createShow({ id: 1, name: 'The Wire', genres: ['Drama'] });
    vi.mocked(getShows).mockResolvedValue([show]);

    const store = useShowsStore();

    await store.loadShows();
    await store.loadShows();

    expect(getShows).toHaveBeenCalledTimes(1);
  });

  it('does not request the same list twice while the initial load is in flight', async () => {
    const show = createShow({ id: 1, name: 'The Wire', genres: ['Drama'] });
    vi.mocked(getShows).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([show]), 10);
        }),
    );

    const store = useShowsStore();

    await Promise.all([store.loadShows(), store.loadShows()]);

    expect(getShows).toHaveBeenCalledTimes(1);
  });

  it('sets an error message when loading the initial shows fails', async () => {
    vi.mocked(getShows).mockRejectedValue(new Error('Failed to load shows'));

    const store = useShowsStore();

    await store.loadShows();

    expect(store.showsError).toBe('Failed to load shows');
  });

  it('clears search results when the query is blank', async () => {
    const store = useShowsStore();
    store.searchResults = [createShow({ id: 10 })];
    store.searchError = 'Previous error';

    await store.search('   ');

    expect(store.searchResults).toEqual([]);
    expect(store.searchError).toBeNull();
    expect(searchShows).not.toHaveBeenCalled();
  });

  it('searches for a query and caches the result for repeated lookups', async () => {
    const show = createShow({ id: 2, name: 'Better Call Saul', genres: ['Crime', 'Drama'] });
    const result: ShowSearchResult[] = [{ score: 1, show }];

    vi.mocked(searchShows).mockResolvedValue(result);

    const store = useShowsStore();

    await store.search('better call saul');
    await store.search('  BETTER CALL SAUL  ');

    expect(searchShows).toHaveBeenCalledTimes(1);
    expect(store.searchResults).toEqual([show]);
    expect(store.searchGenreGroups).toEqual([
      { name: 'Crime', shows: [show] },
      { name: 'Drama', shows: [show] },
    ]);
  });

  it('loads a show by id and reuses the cached detail result', async () => {
    const show = createShow({ id: 42, name: 'Breaking Bad', genres: ['Drama'] });
    vi.mocked(getShowById).mockResolvedValue(show);

    const store = useShowsStore();

    await store.loadShowById(42);
    await store.loadShowById(42);

    expect(getShowById).toHaveBeenCalledTimes(1);
    expect(store.selectedShow).toEqual(show);
    expect(store.showDetailError).toBeNull();
  });

  it('ignores stale search responses and stale search errors', async () => {
    const firstShow = createShow({ id: 1, name: 'Old Search', genres: ['Drama'] });
    const secondShow = createShow({ id: 2, name: 'Newest Search', genres: ['Comedy'] });

    vi.mocked(searchShows)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([{ score: 1, show: firstShow }]), 20);
          }),
      )
      .mockImplementationOnce(() => Promise.resolve([{ score: 1, show: secondShow }]))
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('stale search failure')), 20);
          }),
      )
      .mockImplementationOnce(() => Promise.resolve([{ score: 1, show: secondShow }]));

    const store = useShowsStore();

    const firstSearch = store.search('old search');
    const secondSearch = store.search('newest search');
    await secondSearch;
    await firstSearch;

    expect(store.searchResults).toEqual([secondShow]);
    expect(store.searchError).toBeNull();

    const staleErrorSearch = store.search('stale failure');
    const freshSearch = store.search('fresh success');

    await freshSearch;
    await staleErrorSearch;

    expect(store.searchError).toBeNull();
  });

  it('ignores stale show detail responses and stale detail errors', async () => {
    const firstShow = createShow({ id: 10, name: 'Old Detail', genres: ['Drama'] });
    const secondShow = createShow({ id: 20, name: 'Newest Detail', genres: ['Comedy'] });

    vi.mocked(getShowById)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(firstShow), 20);
          }),
      )
      .mockImplementationOnce(() => Promise.resolve(secondShow))
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('stale detail failure')), 20);
          }),
      )
      .mockImplementationOnce(() => Promise.resolve(secondShow));

    const store = useShowsStore();

    const firstDetail = store.loadShowById(10);
    const secondDetail = store.loadShowById(20);
    await secondDetail;
    await firstDetail;

    expect(store.selectedShow).toEqual(secondShow);
    expect(store.showDetailError).toBeNull();

    const staleErrorDetail = store.loadShowById(30);
    const freshDetail = store.loadShowById(40);

    await freshDetail;
    await staleErrorDetail;

    expect(store.selectedShow).toEqual(secondShow);
    expect(store.showDetailError).toBeNull();
  });

  it('sets a detail error when the show detail request fails', async () => {
    vi.mocked(getShowById).mockRejectedValue(new Error('No show found'));

    const store = useShowsStore();

    await store.loadShowById(999);

    expect(store.selectedShow).toBeNull();
    expect(store.showDetailError).toBe('No show found');
  });
});
