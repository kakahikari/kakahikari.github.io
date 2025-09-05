<template>
  <div v-for="(posts, key) in data" :key="key" class="category-group">
    <div class="category-title">
      {{ key }}
    </div>
    <PostList :posts="posts" />
  </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

import { initCategory } from '../functions'
import type { Post } from '../types'

const { theme } = useData()
const data = computed<Record<string, Post[]>>(() =>
  initCategory(theme.value.posts),
)
</script>

<style scoped>
.category-group {
  margin-bottom: var(--block-margin);
}
.category-title {
  margin: 1rem 0 0.5rem;
  font-weight: 800;
  font-size: 1.5rem;
}
</style>
