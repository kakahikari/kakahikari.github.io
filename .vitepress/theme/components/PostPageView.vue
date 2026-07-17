<template>
  <PostMetaItem v-if="count !== null" class="post-pv">
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fill-rule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clip-rule="evenodd"
      />
    </svg>
    {{ count }}
  </PostMetaItem>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'

import PostMetaItem from './PostMetaItem.vue'

const count = ref<number | null>(null)

const emit = defineEmits<{
  ready: []
}>()

const { theme } = useData()

onMounted(async () => {
  const apiUrl = theme.value.pvApiUrl
  if (!apiUrl) {
    emit('ready')
    return
  }

  // 正規化路徑作為計數 key
  const path = location.pathname
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '')

  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(`${apiUrl}?path=${encodeURIComponent(path)}`)

    if (response.ok) {
      const data = await response.json()
      count.value = data.count
    } else {
      count.value = 0
    }
  } catch {
    count.value = 0
  }

  emit('ready')
})
</script>
