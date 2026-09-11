<script setup lang="ts">
import type { Show } from '../../types/show-type'

defineProps<{
  show: Show
}>()
</script>

<template>
  <article class="show-info">
    <img
      :src="show.image?.original || show.image?.medium"
      :alt="`${show.name} poster`"
      class="show-poster"
    />

    <div class="show-content">
      <div class="show-meta">
        <span>{{ show.status }}</span>
        <span>•</span>
        <span>{{ show.language }}</span>
        <span>•</span>
        <span>{{ show.runtime }} min</span>
      </div>

      <h1>{{ show.name }}</h1>

      <div class="genres">
        <span v-for="genre in show.genres" :key="genre" class="genre-chip">
          {{ genre }}
        </span>
      </div>

      <div class="rating-box">⭐ {{ show.rating.average ?? 'N/A' }}</div>

      <section class="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Summary</h2>

        <div v-html="show.summary" />
      </section>
    </div>
  </article>
</template>

<style scoped src="./ShowInfo.css"></style>
