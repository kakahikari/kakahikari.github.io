<template>
  <Layout>
    <template #doc-before>
      <h1 :class="{ 'post-title': !frontmatter.page }">
        {{ frontmatter.title }}
      </h1>
      <div
        v-if="!frontmatter.page"
        class="post-info"
        :class="{ 'post-info-hidden': !postInfoReady }"
      >
        <PostDate :date="frontmatter.date" />
        <PostPageView @ready="postInfoReady = true" />
        <PostCategory
          v-if="frontmatter.category"
          :href="
            withBase(`/pages/category.html?category=${frontmatter.category}`)
          "
        >
          {{ frontmatter.category }}
        </PostCategory>
        <PostTag
          v-for="item in frontmatter.tags"
          :key="item"
          :href="withBase(`/pages/tags.html?tag=${item}`)"
        >
          {{ item }}
        </PostTag>
      </div>
    </template>
    <template #doc-bottom>
      <Comment v-if="shouldShowComment" />
    </template>
    <template #not-found>
      <NotFound />
    </template>
  </Layout>
  <Copyright />
</template>

<script lang="ts" setup>
import { useData, useRoute, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed, ref, watch } from 'vue'

import Copyright from './Copyright.vue'
import NotFound from './NotFound.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const postInfoReady = ref(false)
const route = useRoute()

// 路由切換時重置 避免顯示舊的 PV 數字
watch(
  () => route.path,
  () => {
    postInfoReady.value = false
  },
)

const shouldShowComment = computed(() => {
  const isPaginationPage =
    route.path === '/' ||
    route.path === '/index.html' ||
    route.path.includes('/page_')

  return !isPaginationPage
})
</script>

<style scoped>
.post-title {
  margin-bottom: 0 !important;
}
.post-info {
  margin-bottom: calc(var(--block-margin) * 2) !important;
  transition: opacity 0.3s ease-out;
}
.post-info-hidden {
  opacity: 0;
}
</style>
