import { computed, ref, watch, type Ref } from 'vue';

import { getShows, ApiError } from '../../api';
import type { Show } from '../../types';

export function useGenreShows(genre: Ref<string>) {
  const shows = ref<Show[]>([]);

  const currentApiPage = ref(-1);

  const isLoading = ref(false);
  const isLoadingMore = ref(false);

  const hasMoreShows = ref(true);

  const error = ref<string | null>(null);

  const genreName = computed(() => {
    const value = genre.value.trim();

    if (!value) {
      return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  const normalizedGenre = computed(() => genre.value.trim().toLowerCase());

  function matchesGenre(show: Show): boolean {
    return show.genres.some((item) => item.toLowerCase() === normalizedGenre.value);
  }

  function appendUniqueShows(newShows: Show[]): void {
    const existingIds = new Set(shows.value.map((show) => show.id));

    const uniqueShows = newShows.filter((show) => !existingIds.has(show.id));

    shows.value.push(...uniqueShows);
  }

  function getErrorMessage(caughtError: unknown): string {
    return caughtError instanceof Error ? caughtError.message : 'Failed to load shows';
  }

  function isEndOfCatalogue(caughtError: unknown): boolean {
    return caughtError instanceof ApiError && caughtError.status === 404;
  }

  async function loadPage(page: number): Promise<Show[]> {
    const pageShows = await getShows(page);

    return pageShows.filter(matchesGenre);
  }

  async function loadNextAvailableShows(): Promise<void> {
    if (isLoadingMore.value || !hasMoreShows.value) {
      return;
    }

    isLoadingMore.value = true;
    error.value = null;

    try {
      let foundShows = false;

      while (!foundShows && hasMoreShows.value) {
        const nextPage = currentApiPage.value + 1;

        try {
          const matchingShows = await loadPage(nextPage);

          currentApiPage.value = nextPage;

          if (matchingShows.length > 0) {
            appendUniqueShows(matchingShows);

            foundShows = true;
          }
        } catch (caughtError) {
          if (isEndOfCatalogue(caughtError)) {
            hasMoreShows.value = false;

            break;
          }

          throw caughtError;
        }
      }
    } catch (caughtError) {
      error.value = getErrorMessage(caughtError);
    } finally {
      isLoadingMore.value = false;
    }
  }

  async function loadInitialShows(): Promise<void> {
    isLoading.value = true;

    try {
      await loadNextAvailableShows();
    } finally {
      isLoading.value = false;
    }
  }

  function reset(): void {
    shows.value = [];

    currentApiPage.value = -1;

    hasMoreShows.value = true;

    error.value = null;
  }

  async function reload(): Promise<void> {
    reset();

    await loadInitialShows();
  }

  watch(
    genre,
    () => {
      void reload();
    },
    {
      immediate: true,
    },
  );

  return {
    shows,
    genreName,
    isLoading,
    isLoadingMore,
    hasMoreShows,
    error,
    loadMoreShows: loadNextAvailableShows,
    reload,
  };
}
