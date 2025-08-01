<template>
  <div class="site-footer">
    <div>
      Copyright © {{ currentYear }}&nbsp;
      <img src="../assets/logo.webp" alt="logo" class="logo" />
      <a class="link" :href="website">{{ webTitle }}</a>
    </div>
    <div>
      Powered by&nbsp;
      <a class="link" target="_blank" href="//vitepress.vuejs.org/">
        VitePress - {{ vitepressVersion }}
      </a>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useData } from 'vitepress'

import packageJson from '../../../package.json'

const { site, theme } = useData()
const website = theme.value.website
const webTitle = site.value.title
const vitepressVersion = packageJson.devDependencies.vitepress.replace('^', '')
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 15px 0;
  overflow: auto;
  color: #888;
  font-size: 0.75rem;
  text-align: center;
}
.site-footer div {
  display: flex;
  flex-direction: row;
}
.link {
  color: var(--vp-c-text-1);
  font-weight: 700;
}
.logo {
  width: 24px;
  height: 24px;
  margin-right: 4px;
}
</style>
