---
date: 2026-02-02
title: 在 VitePress 加入瀏覽數統計：用 Cloudflare Workers KV 實作輕量 PV 組件
category: 技術
tags:
  - VitePress
  - Vue
  - Cloudflare
description: 實作一個顯示於文章資訊列的瀏覽數（PV）組件，透過 Cloudflare Workers KV 儲存資料，搭配 VitePress Vue 組件與簡單 API 設計，解決儲存、載入體驗與 layout shift 問題，打造輕量又可控的前台瀏覽數統計方案。
meta:
  - property: og:image
    content: /2026-02-02-vitepress-page-view-component/cover.jpg
---

![Cover](/2026-02-02-vitepress-page-view-component/cover.jpg)

最近想在部落格的文章頁面加上瀏覽數統計，雖然已經有用Google Analytics，但想讓前台使用者也可以看到數字，就決定自己寫一個輕量的 PV 組件

唯一難處只有資料該怎麼儲存呢？剛好最近在看Cloudflare Worker KV

## 為什麼選 Cloudflare Workers KV？

Cloudflare Workers KV 是 Cloudflare 提供的全球分散式 Key-Value 儲存服務，專門為 Workers 設計，適合用在：

- 計數器（PV / UV / like）
- 設定值、feature flag
- 快取型資料（讀多寫少）

它的特點是：

- 無需自行架設資料庫
- 讀取速度快，延遲低
- 與 Worker 原生整合
- 低用量免費！

在這次 PV 統計的場景中，每個「文章 URL」就是一個 key，瀏覽數就是對應的 value，非常符合 KV 的使用模型

需要注意的是，KV 屬於最終一致性（eventual consistency），不適合高精度即時統計，但對部落格 PV 這種「大概準就好」的用途來說，效能與成本的平衡非常理想

## 需求整理

需求很簡單：

1. 在文章的 post-info 區塊（日期、分類、標籤那一排）加上「眼睛 icon + 數字」
2. 打 API 取得當前頁面的瀏覽數，API 會自動 +1

## 做成組件還是插件？

在 VitePress 架構下，這種小功能做成 **Vue 組件** 比較合適，原因：

- 現有的 `PostDate`、`PostCategory`、`PostTag` 都是小型SFC(Single File Components)
- 只需要在文章頁顯示，不用跨多個地方共用
- 不需要插件的生命週期控制

決定就做成與現有組件風格一致的 `PostPageView.vue`

## API 規格

自架的 PV API 規格很簡單：

```
GET /pv
功能：取得當前頁面的瀏覽數並自動 +1

請求：
- Method: GET
- Headers:
  - Referer: 必填，完整 URL（含 domain + path）
  - Origin: 選填，用於 CORS 驗證

回應格式：
{
  "count": 42
}
```

API 透過 `Referer` header 識別不同頁面，每次 GET 都會自動計數 +1

## 實作步驟

### 1. 在 config.js 加入 API URL 設定

在 `.vitepress/config.js` 頂部新增常數：

```javascript
const PV_API_URL = 'https://api.logicat.tw/pv/'
```

並加進 `themeConfig`：

```javascript
themeConfig: {
  pvApiUrl: PV_API_URL,
  // ...其他設定
}
```

這樣在 Vue 組件中就能透過 `useData()` 取得 `theme.value.pvApiUrl`

### 2. 建立 PostPageView.vue 組件

參考 `PostDate.vue` 的結構，做一個類似的組件：

```vue
<template>
  <span v-if="count !== null" class="post-pv">
    <svg class="pv-icon" viewBox="0 0 20 20" fill="currentColor">
      <!-- 眼睛 icon 的 SVG path -->
    </svg>
    {{ count }}
  </span>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'

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

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      referrerPolicy: 'unsafe-url',
    })

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

<style scoped>
.post-pv {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--inline-gap) / 2);
  font-weight: 500;
  font-size: 0.75rem;
}

.pv-icon {
  width: 14px;
  height: 14px;
}
</style>
```

重點設計：

- **count 初始為 `null`**：用來區分「未啟用」與「已啟用但載入中」
- **未設定 API URL 時**：直接 emit `ready` 並 return，不發請求
- **API 失敗時顯示 0**：本地開發時 API 可能驗證來源失敗，顯示 0 比隱藏更清楚
- **`referrerPolicy: 'unsafe-url'`**：讓瀏覽器帶完整 URL 作為 Referer header

### 3. 註冊組件

在 `.vitepress/theme/index.js` 中 import 並註冊：

```javascript
import PostPageView from './components/PostPageView.vue'

export default {
  // ...
  enhanceApp({ app }) {
    app.component('PostPageView', PostPageView)
    // ...
  },
}
```

### 4. 插入到 ThemeLayout.vue

在 `post-info` 區塊加入 `PostPageView`：

```vue
<div
  v-if="!frontmatter.page"
  class="post-info"
  :class="{ 'post-info-hidden': !postInfoReady }"
>
  <PostDate :date="frontmatter.date" />
  <PostPageView @ready="postInfoReady = true" />
  <PostCategory v-if="frontmatter.category" ... />
  <PostTag v-for="item in frontmatter.tags" ... />
</div>
```

在 script 部分加上狀態管理：

```javascript
const postInfoReady = ref(false)

// 路由切換時重置，避免顯示舊的 PV 數字
watch(
  () => route.path,
  () => {
    postInfoReady.value = false
  },
)
```

## 處理載入體驗

一開始遇到的問題：PV組件載入完成後才出現，會造成post-info區塊的高度跳動（layout shift）。

解決方式：

1. **預留高度**：用 `opacity: 0` 取代 `v-show`，讓 post-info 一開始就佔據空間但不可見
2. **淡入動畫**：加上 `transition: opacity 0.3s ease-out`，讓出現更平滑

CSS 調整：

```css
.post-info {
  transition: opacity 0.3s ease-out;
}
.post-info-hidden {
  opacity: 0;
}
```

這樣 post-info 區塊會：

- 一開始就存在並佔據空間（`opacity: 0`）
- API 完成後移除 `.post-info-hidden` class
- 透明度從 0 漸變到 1，呈現平滑淡入效果
- 完全沒有 layout shift

## 心得

這次實作很順利，VitePress的組件架構很清楚，只要：

1. 參考現有組件的結構
2. 在 `themeConfig` 加設定
3. 用 `useData()` 取得設定值
4. 處理好載入狀態就完成了

如果你也想在VitePress加入自訂功能，這套模式可以直接套用：

- 小型展示功能 → Vue 組件
- 設定值放 `themeConfig`
- 載入體驗用 `opacity` + `transition` 處理

完整內容可以看[部落格的commit](https://github.com/kakahikari/kakahikari.github.io/commit/02026546276221533ca08823cd035d1c13b83066)

---

參考資料：

- [VitePress 文件](https://vitepress.dev/)
