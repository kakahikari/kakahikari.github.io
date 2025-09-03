---
date: 2025-09-03
title: 在VitePress的md格式文章內 插入Vue組件
category: 技術
description: 如何在 VitePress 的 Markdown 文章中插入 Vue 組件？以 YouTube 嵌入組件為實例，解決內容展示的限制問題。
tags:
  - Vue
  - VitePress
---

# 在VitePress的md格式文章內 插入Vue組件

## 問題敘述

使用VitePress一陣子了，想放的東西只靠官方提供的[Markdown Extensions](https://vitepress.dev/guide/markdown)難免遇到限制

例如我要嵌入一個YouTube區塊？那要怎麼做呢？

## 如何解決

最先想到的解法是插入html iframe內容，但這做法又需要維護一堆重複iframe語法，寫Vue專案遇到這狀況時，都會想到抽成組件的吧

查了下官方文件，確實有支援使用vue組件的

那就直接來寫一個[內嵌YouTube組件](https://github.com/kakahikari/kakahikari.github.io/blob/main/.vitepress/theme/components/YouTube.vue)

```vue
<template>
  <div v-if="url" class="video-responsive">
    <iframe
      :src="url"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  id: string
}>()

const url = computed(() => `https://www.youtube.com/embed/${props.id}`)
</script>

<style scoped>
.video-responsive {
  position: relative;
  height: 0;
  /* 16:9 */
  padding-bottom: 56.25%;
  overflow: hidden;
}

.video-responsive iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
```

寫完之後，照著官方文件註冊為全域組件 ([可看此commit](https://github.com/kakahikari/kakahikari.github.io/commit/b530797399ef5305d864852b29bf4300a86130af))，之後就可以在md裡面開心的用啦!

```markdown
<!-- YouTube 網址：https://www.youtube.com/watch?v=dQw4w9WgXcQ -->
<YouTube id="dQw4w9WgXcQ" />
```

<YouTube id="dQw4w9WgXcQ" />

---

參考資料：

- [Using Vue in Markdown](https://vitepress.dev/guide/using-vue#using-components)
