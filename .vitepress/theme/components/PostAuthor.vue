<template>
  <span class="post-author">
    <svg class="author-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
      />
    </svg>
    {{ name }}
  </span>
</template>

<script lang="ts" setup>
defineProps<{
  name: string
}>()
</script>

<style scoped>
.post-author {
  display: inline-flex;
  align-items: center;
  padding: 0;
  gap: calc(var(--inline-gap) / 2);
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.75rem;
}

.author-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}
</style>
