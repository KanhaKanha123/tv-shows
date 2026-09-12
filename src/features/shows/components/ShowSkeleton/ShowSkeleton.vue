<script setup lang="ts">
import { computed } from 'vue';
import type { ShowSkeletonProps } from '../../types';

const props = withDefaults(defineProps<ShowSkeletonProps>(), {
  count: 6,
  variant: 'card',
});

const skeletons = computed(() => Array.from({ length: props.count }, (_, index) => index));
</script>

<template>
  <div v-if="variant === 'card'" class="skeleton-grid" role="status" aria-label="Loading shows">
    <div v-for="index in skeletons" :key="index" class="skeleton-card" aria-hidden="true">
      <div class="skeleton-image" />

      <div class="skeleton-content">
        <div class="skeleton-title" />
        <div class="skeleton-text" />
      </div>
    </div>
  </div>

  <div v-else class="skeleton-list" role="status" aria-label="Loading content">
    <div v-for="index in skeletons" :key="index" class="skeleton-item" aria-hidden="true">
      <div class="skeleton-line skeleton-line-short" />
      <div class="skeleton-line" />
    </div>
  </div>
</template>

<style scoped src="./ShowSkeleton.css"></style>
