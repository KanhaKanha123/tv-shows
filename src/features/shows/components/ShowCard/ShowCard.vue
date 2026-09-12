<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { Show } from '../../types';

withDefaults(
  defineProps<{
    show: Show;
    isPriority?: boolean;
  }>(),
  {
    isPriority: false,
  },
);
</script>

<template>
  <article class="show-card">
    <RouterLink
      :to="{
        name: 'show-detail',
        params: {
          id: show.id,
        },
      }"
      class="show-card-link"
      :aria-label="`View details for ${show.name}`"
    >
      <div class="show-card-poster">
        <img
          v-if="show.image"
          :src="show.image.medium"
          :alt="`${show.name} poster`"
          class="show-card-image"
          :loading="isPriority ? 'eager' : 'lazy'"
          :fetchpriority="isPriority ? 'high' : 'auto'"
          decoding="async"
        />

        <div v-else class="show-card-image-fallback" aria-hidden="true">No image</div>

        <div
          v-if="show.rating.average !== null"
          class="show-card-rating"
          :aria-label="`Rating ${show.rating.average} out of 10`"
        >
          <span aria-hidden="true">★</span>

          {{ show.rating.average }}
        </div>
      </div>

      <div class="show-card-content">
        <h3>
          {{ show.name }}
        </h3>

        <p>
          {{ show.genres.length ? show.genres.join(' · ') : 'Genre unavailable' }}
        </p>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped src="./ShowCard.css"></style>
