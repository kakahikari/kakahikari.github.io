<template>
  <div v-for="(posts, key) in data" :key="key" class="category-group">
    <div class="category-title">
      {{ key }}
    </div>
    <a
      v-for="(post, index) in posts"
      :key="index"
      :href="withBase(post.regularPath)"
      class="posts"
    >
      <div class="post-container">
        <div class="post-dot"></div>
        {{ post.frontMatter.title }}
      </div>
      <div class="date">{{ post.frontMatter.date.slice(5) }}</div>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { useData, withBase } from 'vitepress'
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
