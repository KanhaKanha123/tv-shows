<script setup lang="ts">
import type { Show } from '../../types';
import ShowCard from '../ShowCard/ShowCard.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    shows: Show[];
    showViewAll?: boolean;
  }>(),
  {
    showViewAll: true,
  },
);

const sectionTitleId = `genre-${props.title
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '')}`;
</script>

<template>
  <section class="show-carousel" :aria-labelledby="sectionTitleId">
    <div class="show-carousel-header">
      <div>
        <h2 :id="sectionTitleId">
          {{ title }}
        </h2>

        <p>Top rated {{ title.toLowerCase() }} shows</p>
      </div>

      <RouterLink
        v-if="showViewAll"
        :to="{
          name: 'genre',
          params: {
            genre: title.toLowerCase(),
          },
        }"
        class="show-carousel-action"
        :aria-label="`View all ${title} shows`"
      >
        View all
        <span aria-hidden="true">→</span>
      </RouterLink>
    </div>

    <div class="show-carousel-scroll" :aria-label="`${title} shows`">
      <div class="show-carousel-list">
        <ShowCard v-for="show in shows" :key="show.id" :show="show" />
      </div>
    </div>
  </section>
</template>

<style scoped src="./ShowCarousel.css"></style>
