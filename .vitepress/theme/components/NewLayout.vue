<template>
  <Layout>
    <template #doc-before>
      <div v-if="!$frontmatter.page" class="post-info">
        {{ $frontmatter.date?.substring(0, 10) }} &nbsp;&nbsp;
        <span v-for="item in $frontmatter.tags" :key="item">
          <a :href="withBase(`/pages/tags.html?tag=${item}`)">
            {{ item }}
          </a>
        </span>
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
