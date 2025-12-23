<template>
  <div class="notfound">
    <div class="content">
      <h1 class="notfound-code">404</h1>
      <h1 class="notfound-title">PAGE NOT FOUND</h1>
      <div class="divider" />
      <div v-if="randomPosts.length > 0" class="random-posts">
        <h2 class="random-posts-title">更多文章</h2>
        <div
          v-for="(post, index) in randomPosts"
          :key="`notfound-${post.regularPath}-${index}`"
          class="post"
        >
          <PostCard :post="post" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

import type { Post } from '../types'

const { theme } = useData()

// 隨機抽取文章
const randomPosts = computed<Post[]>(() => {
  const posts = theme.value.posts || []
  if (posts.length === 0) return []

  // 使用 Fisher-Yates 洗牌算法隨機抽取
  const shuffled = [...posts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(3, posts.length))
})
</script>

<style scoped>
.notfound {
  padding: 64px 24px 96px;
  text-align: center;
}

.notfound-code {
  font-weight: 600;
  font-size: 64px;
  line-height: 64px;
  font-family: 'Cubic 11';
}

.notfound-title {
  padding-top: 12px;
  font-weight: 700;
  font-size: 20px;
  line-height: 20px;
  font-family: 'Cubic 11';
  letter-spacing: 2px;
}

.divider {
  width: 64px;
  height: 1px;
  margin: calc(var(--block-margin) * 2) auto;
  background-color: var(--vp-c-divider);
}

.random-posts {
  margin-top: calc(var(--block-margin) * 8);
  text-align: left;
}

.post {
  margin: calc(var(--block-margin) * 1.5) 0;
}

/* TODO: 媒體查詢無法使用變數的替代方案 */
@media screen and (max-width: 768px) {
  .post {
    margin: var(--block-margin) 0;
  }
}
</style>
