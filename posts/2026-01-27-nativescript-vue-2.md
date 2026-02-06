---
date: 2026-01-27
title: 從 Web 到 NativeScript-Vue：開發經驗與踩坑紀錄 (2)
category: 技術
tags:
  - NativeScript
  - Vue
description: 從 Web 前端踏入 NativeScript-Vue 3 的實戰記錄，分享InAppBrowser、原生音效、觸覺回饋等插件優勢，以及 Android Context 時序、ActionItem 平台差異等真實踩坑。從長期維護角度評估 NativeScript 的優缺點，給想做跨平台 App 的 Web 工程師參考。
meta:
  - property: og:image
    content: /2026-01-22-nativescript-vue-1/cover.jpg
---

前情提要：

嘗試把自己熟悉的 Web 與 Vue 3 技能，直接搬進跨平台 App 開發，原本以為能一路順風，結果卻一路踩坑

[從 Web 到 NativeScript-Vue：開發經驗與踩坑紀錄 (1)](./2026-01-22-nativescript-vue-1.md)

<ModalImage
  src="/2026-01-22-nativescript-vue-1/cover.jpg"
/>

## 透過插件改善「Web 上做不到或體驗不好」的功能

那這一篇先來講些優點吧 😏

NativeScript 的一大優勢是能透過插件呼叫**原生平台 API**，實現 Web 無法做到或體驗不佳的功能

### 更好的網頁瀏覽體驗 (InAppBrowser)

我的使用條款，不想要做在App裡面，避免條款每次更新，App就要升版

於是我做了一個網頁，讓App直接去開

但 `@nativescript/core` 的 `Utils.openUrl()` 打開連結，會直接跳轉到系統瀏覽器（Safari/Chrome），導致使用者跳出 App

**解決方案**：
使用 `nativescript-inappbrowser`，它呼叫 iOS 的 `SFSafariViewController` 或 Android 的 `Chrome Custom Tabs`，讓使用者在 **App 內部** 瀏覽網頁，並共享系統瀏覽器的 Cookie Session（如登入狀態），體驗更流暢且保持 App 上下文

```typescript
import { InAppBrowser } from 'nativescript-inappbrowser'

if (await InAppBrowser.isAvailable()) {
  await InAppBrowser.open(url, {
    // iOS: 設定導航列顏色
    preferredBarTintColor: '#16a34a',
    // Android: 設定標題列顏色
    toolbarColor: '#16a34a',
  })
}
```

### 原生音效播放 (Audio)

`<audio>` 或 Web Audio API 在行動裝置上受限於自動播放政策，且無法在背景播放

**解決方案**：
使用 `@nativescript-community/audio`，直接呼叫原生音效 API，不受 Web 自動播放政策限制，行為更貼近原生 App 的音效播放體驗

```typescript
import { TNSPlayer } from '@nativescript-community/audio'

const player = new TNSPlayer()
await player.playFromFile({ audioFile: '~/assets/sound.mp3' })
```

### 觸覺回饋 (Haptics)

`navigator.vibrate()` 支援度差、iOS Safari 完全不支援，且只能做簡單震動

**解決方案**：
使用 `@nativescript/haptics`，封裝 iOS Taptic Engine 和 Android 震動 API，提供細膩的觸覺回饋類型。

```typescript
import { Haptics, HapticNotificationType } from '@nativescript/haptics'

// 成功震動（兩下短震，如中獎提示）
Haptics.notification(HapticNotificationType.SUCCESS)

// 警告震動
Haptics.notification(HapticNotificationType.WARNING)

// 輕觸回饋（如按鍵音效搭配）
Haptics.selection()
```

## Vue 整合

在 NativeScript 環境中，從 `nativescript-vue` 引入Vue API，能直接使用 `$navigateTo` 等特有功能

```typescript
import { ref, computed, $navigateTo } from 'nativescript-vue'
```

### 導航 Props 沒有響應性

使用 `$navigateTo` 導航時，傳遞的 `props` **是一次性的初始值**，不會建立響應式連結，這與 Web 的 Router-View 行為不同

```typescript
const count = ref(0)
$navigateTo(Detail, {
  props: { count: count.value }, // 傳過去的是純數值，父元件更新 count，子元件不會變
})
```

**解法**：不要依賴 Props 做跨頁面狀態同步。應使用 **Global State (如 Pinia 或全局 Composables)** 來讓不同頁面共享同一份響應式狀態

### 全域狀態管理策略

在 NativeScript-Vue 中，除了使用 Pinia ，也可選擇**模組層級的單例 Composables**。後者更輕量，適合中小型專案：

```typescript
// theme.ts - 模組層級單例模式
const isDarkMode = ref(false)
let isInitialized = false

export function useTheme() {
  onMounted(() => {
    if (!isInitialized) {
      isInitialized = true
      isDarkMode.value = ApplicationSettings.getBoolean('DARK_MODE')
    }
  })

  return { isDarkMode, toggleTheme }
}
```

**優點**：

- 不需要額外安裝 Pinia
- 狀態在所有元件間自動共享（因為是同一個模組實例）
- 更容易搭配 `ApplicationSettings` 做持久化

## 原生開發：平台差異與資源管理

### Android Context 初始化時序問題

這是一個**非常隱蔽的坑**。在 Android 上，不能在模組載入時（module scope）呼叫需要 Android Context 的原生 API，否則會導致 App 崩潰

**受影響的 API**：

- `ApplicationSettings.getString()` / `getBoolean()`
- `Application.systemAppearance()`
- 任何需要 Context 的原生 API

**錯誤範例**：

```typescript
// ❌ 危險：模組載入時就讀取設定
const isDarkMode = ref(ApplicationSettings.getBoolean('DARK_MODE'))

export function useTheme() {
  return { isDarkMode }
}
```

**正確做法**：

```typescript
// ✅ 安全：延遲到 onMounted 才初始化
const isDarkMode = ref(false)
let isInitialized = false

export function useTheme() {
  onMounted(() => {
    if (!isInitialized) {
      isInitialized = true
      isDarkMode.value = ApplicationSettings.getBoolean('DARK_MODE')
    }
  })
  return { isDarkMode }
}
```

只有被根組件（`Home.vue`）或 `app.ts` 直接 import 的模組會受影響。子組件間接載入的模組因時序較晚，Context 已就緒所以不會崩潰——但這只是巧合，不是真正安全的做法

### ActionItem 平台屬性 Bug

在同一個 `ActionItem` 元件同時設定 `ios.position` 和 `android.position`，會導致另一平台崩潰

因NativeScript 會在編譯階段仍解析另一平台屬性，導致 runtime crash

**解法**：使用 `v-if` / `v-else` 搭配 `isAndroid` 判斷，將兩個平台的 ActionItem 分開寫

```vue
<ActionItem v-if="isAndroid" android.position="actionBar" />
<ActionItem v-else ios.position="right" />
```

## 總結

經過這次的經驗，在極短的時間內就可以做出可上架的雙平台APP。但實際上，大量時間都花在 build 到實機後的閃退與平台差異除錯上

而且還有些錯誤得是特定平台才會發生，準備兩個平台的測試機並且交叉測試也是挺麻煩的

以下整理成實際開發後的優缺點對照，偏向「長期維護角度」而非 Hello World 體驗

### ✅ 優點

| 名稱         | 敘述                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| **效能**     | 真正的原生 UI，非 WebView，滾動、動畫流暢度媲美原生開發，但若只是小型應用其實也感覺不出來 |
| **跨平台**   | 一套 TypeScript/Vue 程式碼同時產出 iOS 和 Android App                                     |
| **原生能力** | 可直接呼叫 iOS/Android 原生 API（UIKit、Android SDK）                                     |
| **生態系**   | 豐富的插件生態（Haptics、Audio、InAppBrowser 等）                                         |
| **熟悉度**   | Web 開發者熟悉的 Vue 3 + TypeScript + Tailwind 技術棧                                     |
| **開發體驗** | Vite HMR 支援，修改元件即時更新，不需重建 App                                             |
| **測試**     | 業務邏輯可用 Vitest 在 Node.js 環境測試                                                   |

### ❌ 缺點

| 名稱         | 敘述                                                          |
| ------------ | ------------------------------------------------------------- |
| **學習曲線** | 必須學習 NativeScript UI 元件，HTML 知識無法直接轉移          |
| **除錯困難** | 沒有 DOM Inspector，無法像 Chrome DevTools 即時調整樣式       |
| **CSS 限制** | 不支援所有 CSS 屬性，Tailwind 部分功能無法使用（如 CSS 變數） |
| **平台差異** | iOS/Android 行為差異需要分別處理（ActionItem、動畫等）        |
| **原生知識** | 進階功能需要了解 iOS/Android 原生開發概念                     |
| **社群規模** | 相較 React Native/Flutter，社群和資源較少                     |
| **測試限制** | 依賴原生 API 的程式碼無法在 Node.js 環境測試，需要 mock       |

我要做一個長期維護的APP，應該不會優先考慮NativeScript

下一個side project，應該會想試試Tauri 2.0

如果你想快速體驗NativeScript-Vue + vite開發，可以直接參考或者fork我改官方的demo [kakahikari/ns-vue-vite-demo](https://github.com/kakahikari/ns-vue-vite-demo)

---

參考資料：

- [NativeScript文件](https://docs.nativescript.org/)
- [NativeScript-Vue](https://nativescript-vue.org/)
