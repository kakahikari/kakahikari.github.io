<template>
  <div id="giscus-container"></div>
</template>
<script setup>
import { useData, useRoute } from 'vitepress'
import giscusTalk from 'vitepress-plugin-comment-with-giscus'
import { computed, watch } from 'vue'

const { frontmatter, isDark } = useData()
const route = useRoute()

const giscusTheme = computed(() => {
  return isDark.value ? 'dark' : 'light'
})

// TODO: repo等資訊 應該要由config傳入
const giscusConfig = {
  repo: 'kakahikari/kakahikari.github.io',
  repoId: 'R_kgDOIfJpug',
  category: 'Announcements',
  categoryId: 'DIC_kwDOIfJpus4Ctk3i',
  mapping: 'pathname',
  lang: 'en',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '1',
  theme: giscusTheme.value,
  loading: 'lazy',
  crossorigin: 'anonymous',
  async: true,
}

giscusTalk(
  giscusConfig,
  {
    frontmatter,
    route,
  },
  true,
)

watch(giscusTheme, newTheme => {
  const iframe = document.querySelector('#giscus-container iframe')
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: newTheme,
          },
        },
      },
      'https://giscus.app',
    )
  }
})
</script>
