<template>
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
import type { Post } from '../types'

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

@media (--mobile) {
  .post {
    margin: var(--block-margin) 0;
  }
}
</style>
