<template>
    <div class="site-footer">
        MIT Licensed | Copyright © {{ currentYear }} <a class="vitepress" :href="website">{{ webTitle }}</a><br />
        Powered by <a class="vitepress" target="_blank" href="//vitepress.vuejs.org/">VitePress - {{ vitepressVersion }}</a>
        Theme by <a class="vitepress" target="_blank" href="//github.com/airene/vitepress-blog-pure">Vitepress-blog</a>
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

<style>
.site-footer {
    color: #888;
    text-align: center;
    font-size: 0.75rem;
    width: 100%;
    padding: 15px 0;
    overflow: auto;
}
.vitepress {
    color: var(--vp-c-text-1);
    font-weight: 700;
}
</style>
