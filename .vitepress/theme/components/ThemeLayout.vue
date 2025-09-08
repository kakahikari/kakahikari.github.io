<template>
  <Layout>
    <template #doc-before>
      <div v-if="!frontmatter.page" class="post-info">
        <PostDate :date="frontmatter.date" />
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
  </Layout>
  <Copyright />
</template>

<script lang="ts" setup>
import { useData, useRoute, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'

import Copyright from './Copyright.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()

const shouldShowComment = computed(() => {
  const isPaginationPage =
    route.path === '/' ||
    route.path === '/index.html' ||
    route.path.includes('/page_')

  return !isPaginationPage
})
</script>
