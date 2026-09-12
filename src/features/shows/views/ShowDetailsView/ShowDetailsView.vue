<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

import { ErrorState, PageHeader } from '../../../../shared/components';
import { ShowInfo } from '../../components';
import { useShowsStore } from '../../stores';

const route = useRoute();
const router = useRouter();

const showsStore = useShowsStore();

const { selectedShow, isLoadingShowDetail, showDetailError } = storeToRefs(showsStore);

const { loadShowById } = showsStore;

const showId = computed(() => Number(route.params.id));

function loadCurrentShow(): void {
  if (!Number.isInteger(showId.value) || showId.value <= 0) {
    void router.replace({
      name: 'not-found',
    });

    return;
  }

  void loadShowById(showId.value);
}

function retry(): void {
  void loadShowById(showId.value);
}

watch(
  () => route.params.id,
  () => {
    loadCurrentShow();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <main id="main-content" class="show-detail-page" :aria-busy="isLoadingShowDetail">
    <div class="page-container">
      <PageHeader title="Show Details" description="Discover more about this TV show." show-back />

      <p v-if="isLoadingShowDetail" class="status-message" role="status" aria-live="polite">
        Loading show...
      </p>

      <ErrorState v-else-if="showDetailError" :message="showDetailError" @retry="retry" />

      <ShowInfo v-else-if="selectedShow" :show="selectedShow" />
    </div>
  </main>
</template>
<style scoped src="./ShowDetailsView.css"></style>
