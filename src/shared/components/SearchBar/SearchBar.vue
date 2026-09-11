<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

import { debounce, validateSearchInput } from '../../../shared/utils'

const props = withDefaults(
  defineProps<{
    initialValue?: string
  }>(),
  {
    initialValue: '',
  },
)

const emit = defineEmits<{
  search: [query: string]
}>()

const searchInput = ref(props.initialValue)
const searchError = ref<string | null>(null)

watch(
  () => props.initialValue,
  (newValue) => {
    searchInput.value = newValue
  },
)

function emitSearch(query: string): void {
  const validation = validateSearchInput(query)

  if (!validation.isValid) {
    if (!query.trim()) {
      searchError.value = null
      emit('search', '')
      return
    }

    searchError.value = validation.error ?? 'Invalid search value'

    return
  }

  searchError.value = null

  emit('search', validation.sanitized)
}

const debouncedSearch = debounce(emitSearch, 300)

function handleInput(event: Event): void {
  const input = event.target as HTMLInputElement

  debouncedSearch(input.value)
}

function clearSearch(): void {
  debouncedSearch.cancel()

  searchInput.value = ''
  searchError.value = null

  emit('search', '')
}

onBeforeUnmount(() => {
  debouncedSearch.cancel()
})
</script>

<template>
  <div class="search-bar-container">
    <div
      class="search-bar"
      :class="{
        'search-bar-error': searchError !== null,
      }"
    >
      <label for="show-search" class="sr-only"> Search TV shows </label>

      <span class="search-bar-icon" aria-hidden="true"> ⌕ </span>

      <input
        id="show-search"
        v-model="searchInput"
        type="search"
        class="search-bar-input"
        placeholder="Search TV shows..."
        autocomplete="off"
        enterkeyhint="search"
        :aria-describedby="searchError ? 'search-error' : undefined"
        :aria-invalid="searchError !== null"
        @input="handleInput"
      />

      <button
        v-if="searchInput"
        type="button"
        class="search-clear-btn"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <span aria-hidden="true"> ✕ </span>
      </button>
    </div>

    <Transition name="error-fade">
      <div v-if="searchError" id="search-error" class="search-error-message" role="alert">
        <span class="error-icon" aria-hidden="true"> ⚠ </span>

        <span>
          {{ searchError }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped src="./SearchBar.css"></style>
