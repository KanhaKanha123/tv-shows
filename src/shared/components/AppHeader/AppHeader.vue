<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import SearchBar from '../SearchBar/SearchBar.vue'
import { debounce } from '../../utils'

withDefaults(
  defineProps<{
    showSearch?: boolean
  }>(),
  {
    showSearch: true,
  },
)

const route = useRoute()
const router = useRouter()

const handleSearch = debounce((query: string) => {
  const normalizedQuery = query.trim()

  void router.replace({
    name: 'home',
    query: normalizedQuery ? { q: normalizedQuery } : {},
  })
}, 300)

onBeforeUnmount(() => {
  handleSearch.cancel()
})
</script>

<template>
  <header class="app-header">
    <a href="#main-content" class="skip-link"> Skip to main content </a>

    <div class="app-header-content">
      <RouterLink to="/" class="brand" aria-label="TV Shows home">
        TV<span>SHOWS</span>
      </RouterLink>

      <SearchBar
        v-if="showSearch"
        :initial-value="String(route.query.q ?? '')"
        @search="handleSearch"
      />
    </div>
  </header>
</template>

<style scoped src="./AppHeader.css"></style>
