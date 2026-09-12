<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ErrorState } from '../../../../shared/components'
import { ShowCard } from '../../components'
import { useGenreShows } from '../../composables'

const route = useRoute()
const router = useRouter()

const genre = computed(() => String(route.params.genre ?? ''))

const { shows, genreName, isLoading, isLoadingMore, hasMoreShows, error, loadMoreShows, reload } =
  useGenreShows(genre)

function goBack(): void {
  router.back()
}
</script>

<template>
  <main id="main-content" class="genre-page" :aria-busy="isLoading || isLoadingMore">
    <div class="page-container">
      <header class="genre-page-header">
        <div class="genre-page-heading">
          <h1>{{ genreName }} Shows</h1>

          <p>Browse {{ genreName.toLowerCase() }} shows.</p>
        </div>

        <button
          type="button"
          class="back-button"
          aria-label="Go back to previous page"
          @click="goBack"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </header>

      <p v-if="isLoading" class="status-message" role="status" aria-live="polite">
        Loading shows...
      </p>

      <ErrorState v-else-if="error && !shows.length" :message="error" @retry="reload" />

      <template v-else-if="shows.length">
        <div class="shows-grid">
          <ShowCard v-for="show in shows" :key="show.id" :show="show" />
        </div>

        <div class="load-more-section">
          <button
            v-if="hasMoreShows"
            type="button"
            class="load-more-button"
            :disabled="isLoadingMore"
            @click="loadMoreShows"
          >
            {{ isLoadingMore ? 'Loading more...' : 'Load more' }}
          </button>

          <p v-if="error" class="load-more-error" role="alert">
            {{ error }}
          </p>

          <p class="loaded-shows-count" aria-live="polite">
            {{ shows.length }} {{ genreName }} shows loaded
          </p>
        </div>
      </template>

      <p v-else class="status-message">No shows found for this genre.</p>
    </div>
  </main>
</template>

<style scoped src="./GenreView.css"></style>
