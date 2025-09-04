<template>
  <div v-for="(yearList, yearIndex) in data" :key="yearIndex" class="archives">
    <div class="year">
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
.archives {
  margin-bottom: 8px;
}
.year {
  padding: 14px 0;
  font-weight: 600;
  font-size: 1.25rem;
  font-family: var(--date-font-family);
}
</style>
