<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state" role="alert">
    <h2>Something went wrong</h2>

    <p>{{ message }}</p>

    <button type="button" class="retry-button" @click="emit('retry')">Try again</button>
  </div>
</template>

<style scoped src="./ErrorState.css"></style>
