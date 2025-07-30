<template>
  <div class="tags">
    <span v-for="(item, key) in data" :key="key" class="tag" @click="toggleTag(key)">
      {{ key }} <strong>{{ data[key].length }}</strong>
    </span>
  </div>
  <div class="tag-header">{{ selectTag }}</div>
  <a
    v-for="(article, index) in data[selectTag]"
    :key="index"
    :href="withBase(article.regularPath)"
    class="posts"
  >
    <div class="post-container">
      <div class="post-dot"></div>
      {{ article.frontMatter.title }}
    </div>
    <div class="date">{{ article.frontMatter.date }}</div>
  </a>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { initTags } from '../functions'
const url = location.href.split('?')[1]
const params = new URLSearchParams(url)
const { theme } = useData()
const data = computed(() => initTags(theme.value.posts))
const selectTag = ref(params.get('tag') ? params.get('tag') : '')
const toggleTag = (tag: string | number) => {
  selectTag.value = String(tag)
}
</script>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 14px;
}
.tag {
  display: inline-block;
  margin: 6px 8px;
  padding: 4px 16px;
  border-radius: 2px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  line-height: 25px;
  cursor: pointer;
  transition: 0.4s;
}
.tag strong {
  color: var(--vp-c-brand);
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
