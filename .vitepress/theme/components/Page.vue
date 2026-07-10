<template>
  <!-- 列表頁沒有可見標題，提供隱藏的 h1 給搜尋引擎與螢幕閱讀器 -->
  <h1 class="visually-hidden">
    {{ pageCurrent > 1 ? `${site.title} - 第 ${pageCurrent} 頁` : site.title }}
  </h1>
  <template v-for="(post, index) in posts" :key="index">
    <div class="post">
      <PostCard :post="post" />
    </div>
    <hr v-if="index !== posts.length - 1" />
  </template>
  <Pagination
    v-if="pagesNum > 1"
    :page-current="pageCurrent"
    :pages-num="pagesNum"
    :get-page-url="getPageUrl"
  />
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'

import type { Post } from '../types'

const { site } = useData()

defineProps<{
  posts: Post[]
  pageCurrent: number
  pagesNum: number
}>()

const getPageUrl = (pageNum: number): string => {
  return pageNum === 1 ? '/index.html' : `/page_${pageNum}.html`
}
</script>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  border: 0;
  white-space: nowrap;
}

.post {
  margin: calc(var(--block-margin) * 1.5) 0;
}

@media (--mobile) {
  .post {
    margin: var(--block-margin) 0;
  }
}
</style>
