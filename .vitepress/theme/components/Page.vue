<template>
  <div v-if="pageCurrent === 1" class="visually-hidden">
    <h1>{{ site.title }}</h1>
    <p>{{ site.description }}</p>
  </div>
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
.post {
  margin: calc(var(--block-margin) * 1.5) 0;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  white-space: nowrap;
}

/* TODO: 媒體查詢無法使用變數的替代方案 */
@media screen and (max-width: 768px) {
  .post {
    margin: var(--block-margin) 0;
  }
}
</style>
