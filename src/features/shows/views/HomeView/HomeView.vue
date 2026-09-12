<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import { ErrorState, PageHeader } from '../../../../shared/components';
import { ShowCarousel, ShowSkeleton } from '../../components';
import { useShowsStore } from '../../stores';

const route = useRoute();
const showsStore = useShowsStore();

const { genreGroups, searchGenreGroups, isLoadingShows, isSearching, showsError, searchError } =
  storeToRefs(showsStore);

const { loadShows, search } = showsStore;

const searchQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''));

const isSearchMode = computed(() => searchQuery.value.length > 0);

const isLoading = computed(() => (isSearchMode.value ? isSearching.value : isLoadingShows.value));

const activeError = computed(() => (isSearchMode.value ? searchError.value : showsError.value));

async function loadShowsFromRoute(): Promise<void> {
  if (isSearchMode.value) {
    await search(searchQuery.value);
    return;
  }

  await loadShows();
}

watch(
  searchQuery,
  () => {
    void loadShowsFromRoute();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <main id="main-content" class="shows-page" :aria-busy="isLoading">
    <div class="page-container">
      <PageHeader
        title="Discover TV Shows"
        description="Browse top-rated shows across your favourite genres."
      />

      <div v-if="isLoading" class="loading-state">
        <p class="status-message" role="status" aria-live="polite">Loading shows...</p>

        <ShowSkeleton :count="6" variant="card" />
      </div>

      <ErrorState v-else-if="activeError" :message="activeError" @retry="loadShowsFromRoute" />

      <template v-else-if="isSearchMode">
        <template v-if="searchGenreGroups.length">
          <ShowCarousel
            v-for="genre in searchGenreGroups"
            :key="genre.name"
            :title="genre.name"
            :shows="genre.shows"
            :show-view-all="false"
          />
        </template>

        <p v-else class="status-message">No shows found for "{{ searchQuery }}".</p>
      </template>

      <template v-else>
        <ShowCarousel
          v-for="genre in genreGroups"
          :key="genre.name"
          :title="genre.name"
          :shows="genre.shows"
        />
      </template>
    </div>
  </main>
</template>

<style scoped src="./HomeView.css"></style>
