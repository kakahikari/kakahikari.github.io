<template>
  <div class="tags">
    <PostTag
      v-for="(_item, key) in data"
      :key="key"
      :class="{ active: selectTag === key }"
      :on-click="() => toggleTag(key)"
    >
      {{ key }}<strong class="badge">{{ data[key].length }}</strong>
    </PostTag>
  </div>
  <template v-if="selectTag">
    <hr />
    <div class="tag-title">{{ selectTag }}</div>
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
  margin: var(--block-margin) 0;
  gap: var(--inline-gap);
}

.tags :deep(.post-tag .badge) {
  margin-left: calc(var(--inline-gap) / 2);
  padding: 0 4px;
  border-radius: 6px;
  background-color: var(--tag-badge-bg);
  color: var(--tag-text);
  font-weight: 600;
  font-size: 10px;
}

.tags :deep(.post-tag.active) {
  border-color: var(--vp-c-brand-1);
}

.tag-title {
  margin: 1rem 0 0.5rem;
  font-weight: 800;
  font-size: 1.5rem;
}

.date {
  white-space: nowrap;
}

/* TODO: 媒體查詢無法使用變數的替代方案 */
@media screen and (max-width: 768px) {
  .date {
    font-size: 0.75rem;
  }
}
</style>
