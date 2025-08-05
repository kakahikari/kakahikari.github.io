<template>
  <span class="post-date">
    <svg class="calendar-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clip-rule="evenodd"
      />
    </svg>
    {{ formatDate }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  date: string
}>()

const formatDate = computed(() => {
  return props.date?.substring(0, 10)
})
</script>

<style scoped>
.post-date {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--inline-gap) / 2);
  border-radius: 4px;
  background-color: var(--post-date-bg);
  color: var(--post-date-color);
  font-weight: 500;
  font-size: 0.75rem;
}

.calendar-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

:root {
  --post-date-bg: #f1f5f9;
  --post-date-color: #475569;
}

.dark {
  --post-date-bg: #334155;
  --post-date-color: #cbd5e1;
}
</style>
