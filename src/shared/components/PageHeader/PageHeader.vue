<script setup lang="ts">
import { useRouter } from 'vue-router';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    showBack?: boolean;
  }>(),
  {
    description: '',
    showBack: false,
  },
);

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<template>
  <header class="page-header">
    <div class="page-header-content">
      <h1>{{ title }}</h1>

      <p v-if="description">
        {{ description }}
      </p>
    </div>

    <button
      v-if="showBack"
      type="button"
      class="back-button"
      aria-label="Go back to previous page"
      @click="goBack"
    >
      <span aria-hidden="true">←</span>
      Back
    </button>
  </header>
</template>

<style scoped src="./PageHeader.css"></style>
