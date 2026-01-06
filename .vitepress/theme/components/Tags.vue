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
    <PostList :posts="(selectTag && data[selectTag]) || []" />
  </template>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed, ref } from 'vue'

import { initTags } from '../functions'
import type { Post } from '../types'

const url = location.href.split('?')[1]
const params = new URLSearchParams(url)
const { theme } = useData()
const data = computed<Record<string, Post[]>>(() => initTags(theme.value.posts))
const selectTag = ref(params.get('tag') || '')
const toggleTag = (tag: string | number) => {
  const tagStr = String(tag)
  const newTag = selectTag.value === tagStr ? '' : tagStr
  selectTag.value = newTag

  const currentUrl = new URLSearchParams(location.search)
  if (newTag) {
    currentUrl.set('tag', newTag)
  } else {
    currentUrl.delete('tag')
  }
  const newUrl =
    location.pathname +
    (currentUrl.toString() ? '?' + currentUrl.toString() : '')
  window.history.pushState({}, '', newUrl)
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
  background-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.tag-title {
  margin: 1rem 0 0.5rem;
  font-weight: 800;
  font-size: 1.5rem;
}
</style>
