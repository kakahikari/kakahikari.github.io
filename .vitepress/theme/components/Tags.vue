<template>
  <div class="tags">
    <PostTag
      v-for="(_item, key) in data"
      :key="key"
      :class="{ active: selectTag === key }"
      :on-click="() => toggleTag(key)"
    >
      {{ key }}<strong>{{ data[key].length }}</strong>
    </PostTag>
  </div>
  <div class="tag-header">{{ selectTag }}</div>
  <a
    v-for="(post, index) in (selectTag && data[selectTag]) || []"
    :key="index"
    :href="withBase(post.regularPath)"
    class="posts"
  >
    <div class="post-container">
      <div class="post-dot"></div>
      {{ post.frontMatter.title }}
    </div>
    <div class="date">{{ post.frontMatter.date }}</div>
  </a>
</template>

<script lang="ts" setup>
import { useData, withBase } from 'vitepress'
import { computed, ref } from 'vue'

import { initTags } from '../functions'
import type { Post } from '../types'

const url = location.href.split('?')[1]
const params = new URLSearchParams(url)
const { theme } = useData()
const data = computed<Record<string, Post[]>>(() => initTags(theme.value.posts))
const selectTag = ref(params.get('tag') || '')
const toggleTag = (tag: string | number) => {
  selectTag.value = String(tag)
}
</script>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 14px;
  gap: var(--inline-gap);
}

.tags :deep(.post-tag strong) {
  margin-left: 4px;
  padding: 1px 4px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  font-weight: 600;
  font-size: 10px;
  line-height: 1;
}

.tags :deep(.post-tag.active) {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-1);
  color: white;
}

.tags :deep(.post-tag.active strong) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.tags :deep(.post-tag.active:hover) {
  background-color: var(--vp-c-brand-1);
  color: white;
  filter: brightness(1.1);
}

.tag-header {
  margin: 1rem 0;
  font-weight: 500;
  font-size: 1.5rem;
  text-align: left;
}

@media screen and (max-width: 768px) {
  .tag-header {
    font-size: 1.5rem;
  }
  .date {
    font-size: 0.75rem;
  }
}
</style>
