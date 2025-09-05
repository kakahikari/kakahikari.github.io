<template>
  <div
    v-for="(yearList, yearIndex) in data"
    :key="yearIndex"
    class="archives-group"
  >
    <div class="archives-title">
      {{ yearList[0].frontMatter.date.split('-')[0] }}
    </div>
    <PostList :posts="yearList" date-format="short" />
  </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
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
