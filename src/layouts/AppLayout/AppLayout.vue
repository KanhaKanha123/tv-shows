<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { AppHeader } from '../../shared/components';

const route = useRoute();

const showSearch = computed(() => route.name === 'home');
</script>

<template>
  <div class="app-shell">
    <div class="app-layout">
      <AppHeader :show-search="showSearch" />

      <RouterView />
    </div>
  </div>
</template>

<style scoped src="./AppLayout.css"></style>
