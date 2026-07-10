<template>
  <div v-for="(posts, key) in data" :key="key" class="category-group">
    <h2 :id="String(key)" class="category-title">
      {{ key }}
    </h2>
    <PostList :posts="posts" />
  </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed, nextTick, onMounted, ref } from 'vue'

import { getUrlParam, initCategory, useDynamicTitle } from '../functions'
import type { Post } from '../types'

const { theme, site } = useData()
const data = computed<Record<string, Post[]>>(() =>
  initCategory(theme.value.posts),
)
const selectedCategory = ref('')

useDynamicTitle(() =>
  selectedCategory.value
    ? `${selectedCategory.value} | ${site.value.title}`
    : `Category | ${site.value.title}`,
)

// 滾動到指定分類段落 等待 DOM 渲染完成
onMounted(async () => {
  selectedCategory.value = getUrlParam('category')
  if (selectedCategory.value) {
    await nextTick()
    const el = document.getElementById(selectedCategory.value)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
</script>

<style scoped>
.category-group {
  margin-bottom: var(--block-margin);
}
.category-title {
  margin: 1rem 0 0.5rem !important;
  font-weight: 800 !important;
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}
</style>
