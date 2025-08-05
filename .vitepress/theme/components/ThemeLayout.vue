<template>
  <Layout>
    <template #doc-before>
      <div v-if="!$frontmatter.page" class="post-info">
        <PostDate :date="$frontmatter.date" />
        <PostTag
          v-for="item in $frontmatter.tags"
          :key="item"
          :href="withBase(`/pages/tags.html?tag=${item}`)"
        >
          {{ item }}
        </PostTag>
      </div>
    </template>
    <template #doc-bottom>
      <Comment />
    </template>
  </Layout>
  <Copyright />
</template>
<script setup>
import { withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Copyright from './Copyright.vue'

const { Layout } = DefaultTheme
</script>
