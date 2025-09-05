<template>
  <div
    v-for="(yearList, yearIndex) in data"
    :key="yearIndex"
    class="archives-group"
  >
    <div class="archives-title">
      {{ yearList[0].frontMatter.date.split('-')[0] }}
    </div>
    <a
      v-for="(post, index) in yearList"
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

import { useYearSort } from '../functions'
import type { Post } from '../types'

const { theme } = useData()
const data = computed<Post[][]>(() => useYearSort(theme.value.posts))
</script>

<style scoped>
.archives-group {
  margin-bottom: var(--block-margin);
}
.archives-title {
  margin: 1rem 0 0.5rem;
  font-weight: 800;
  font-size: 1.5rem;
  font-family: var(--date-font-family);
}
</style>
