<template>
  <div class="tags">
    <span @click="toggleTag(key)" v-for="(item, key) in data" class="tag">
      {{ key }} <strong>{{ data[key].length }}</strong>
    </span>
  </div>
  <div class="tag-header">{{ selectTag }}</div>
  <a
    :href="withBase(article.regularPath)"
    v-for="(article, index) in data[selectTag]"
    :key="index"
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
let url = location.href.split('?')[1]
let params = new URLSearchParams(url)
const { theme } = useData()
const data = computed(() => initTags(theme.value.posts))
let selectTag = ref(params.get('tag') ? params.get('tag') : '')
const toggleTag = (tag: string) => {
  selectTag.value = tag
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
