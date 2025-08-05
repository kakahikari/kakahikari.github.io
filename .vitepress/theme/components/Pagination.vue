<template>
  <div class="pagination">
    <a
      v-for="i in pagesNum"
      :key="i"
      class="link"
      :class="{ active: pageCurrent === i }"
      :href="withBase(props.getPageUrl(i))"
    >
      {{ i }}
    </a>
  </div>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress'

const props = defineProps<{
  pageCurrent: number
  pagesNum: number
  getPageUrl: (pageNum: number) => string
}>()
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: var(--inline-gap);
}

.link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--pagination-border);
  border-radius: 50%;
  background: var(--pagination-bg);
  color: var(--pagination-text);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link:hover {
  border-color: var(--pagination-hover-bg);
  background: var(--pagination-hover-bg);
  color: var(--pagination-hover-text);
}

.link.active {
  border-color: var(--pagination-active-bg);
  background: var(--pagination-active-bg);
  color: var(--pagination-active-text);
}
</style>
