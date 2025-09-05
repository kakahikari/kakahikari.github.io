<template>
  <ul class="post-list">
    <li v-for="(post, index) in posts" :key="index" class="post-item">
      <a class="post-title" :href="withBase(post.regularPath)">
        {{ post.frontMatter.title }}
      </a>
      <div class="post-date">
        {{ formatDate(post.frontMatter.date) }}
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress'

import type { Post } from '../types'

interface Props {
  posts: Post[]
  dateFormat?: 'full' | 'short'
}

const props = withDefaults(defineProps<Props>(), {
  dateFormat: 'full',
})

const formatDate = (date: string): string => {
  return props.dateFormat === 'full' ? date : date.slice(5)
}
</script>

<style scoped>
.post-list {
  margin: 0 0 0 var(--inline-gap);
  padding: 0;
  list-style: none;
}
.post-item {
  display: flex;
  position: relative;
  align-items: center;
  align-items: flex-start;
  justify-content: space-between;
  padding: calc(var(--inline-gap) / 2) 0 calc(var(--inline-gap) / 2)
    calc(var(--inline-gap) * 3);
}
.post-item + .post-item {
  margin-top: 0;
}
.post-item::before {
  position: absolute;
  top: 1rem;
  left: calc(var(--inline-gap) * 1.5);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--dot-color);
  content: '';
}
.post-title {
  color: var(--post-title-color);
  font-weight: 400;
  font-size: 0.9375rem;
  text-decoration: none !important;
}
.post-title:hover {
  color: var(--vp-c-brand-1);
}
.post-date {
  color: var(--date-color);
  font-family: var(--date-font-family);
  white-space: nowrap;
}

/* TODO: 媒體查詢無法使用變數的替代方案 */
@media screen and (max-width: 768px) {
  .post-list {
    margin-left: calc(var(--inline-gap) / 2);
  }
  .post-item {
    padding-left: var(--inline-gap) !important;
  }
  .post-item::before {
    left: calc(var(--inline-gap) / 4);
  }
  .post-date {
    font-size: 0.75rem;
  }
}
</style>
