<template>
  <div v-for="(article, index) in posts" :key="index" class="post-list">
    <div class="post-header">
      <div class="post-title">
        <a :href="withBase(article.regularPath)">
          {{ article.frontMatter.title }}
        </a>
      </div>
    </div>
    <p class="describe">{{ article.frontMatter.description }}</p>
    <div class="post-info">
      {{ article.frontMatter.date }}
      <span v-for="item in article.frontMatter.tags" :key="item">
        <a :href="withBase(`/pages/tags.html?tag=${item}`)">
          {{ item }}
        </a>
      </span>
    </div>
  </div>

  <div class="pagination">
    <a
      v-for="i in pagesNum"
      :key="i"
      class="link"
      :class="{ active: pageCurrent === i }"
      :href="withBase(i === 1 ? '/index.html' : `/page_${i}.html`)"
      >{{ i }}
    </a>
  </div>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress'
defineProps({
  posts: Array,
  pageCurrent: Number,
  pagesNum: Number,
})
</script>

<style scoped>
.post-list {
  padding: 14px 0 14px 0;
  border-bottom: 1px dashed var(--vp-c-divider-light);
}
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.post-title {
  margin: 0.1rem 0;
  font-weight: 500;
  font-size: 1.125rem;
}

.describe {
  display: -webkit-box;
  font-size: 0.9375rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  margin: 10px 0;
  overflow: hidden;
  color: var(--vp-c-text-2);
  line-height: 1.5rem;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.link {
  display: inline-block;
  width: 24px;
  border: 1px var(--vp-c-divider-light) solid;
  border-right: none;
  font-weight: 400;
  text-align: center;
}
.link.active {
  border: 1px solid var(--vp-c-text-1) !important;
  background: var(--vp-c-text-1);
  color: var(--vp-c-neutral-inverse);
}
.link:first-child {
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.link:last-child {
  border-right: 1px var(--vp-c-divider-light) solid;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

@media screen and (max-width: 768px) {
  .post-list {
    padding: 14px 0 14px 0;
  }
  .post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .post-title {
    display: -webkit-box;
    font-weight: 400;
    font-size: 1.0625rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    width: 17rem;
    overflow: hidden;
  }
  .describe {
    display: -webkit-box;
    font-size: 0.9375rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    margin: 0.5rem 0 1rem;
    overflow: hidden;
  }
}
</style>
