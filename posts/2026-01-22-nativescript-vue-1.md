---
date: 2026-01-22
title: 從 Web 到 NativeScript-Vue：開發經驗與踩坑紀錄 (1)
category: 技術
tags:
  - NativeScript
  - Vue
description: 從 Web 前端踏入 NativeScript-Vue 3 的實戰記錄，分享為何「Web 轉 App」沒有想像中簡單，以及在真機測試、除錯體驗、無 DOM 環境與 Tailwind CSS 限制下所遇到的實際問題與心得整理。
meta:
  - property: og:image
    content: /2026-01-22-nativescript-vue-1/cover.jpg
---

## 原由

雖然是前端工程師，一直都懷抱一個寫App的夢，要是可以把Web應用簡單變成APP就好了！還要跨平台

很久以前用[PhoneGap(Cordova)](https://zh.wikipedia.org/zh-tw/Apache_Cordova)寫過，原理是把瀏覽器跟Web包進App裡，但當時存在有些原生功能不能用、滑動的明顯延遲等缺點

有天看到掘金上熱門文章：[字节出手！「Vue Native」真的要来了！](https://juejin.cn/post/7566088386521546794)

又產生了一次幻想：要是Vue也有像是React Native一樣轉原生的，會不會就簡單了很多呢？

但後來查證這篇文章的內容，除了有錯誤以外，還有許多誇飾的內容，很有可能是AI內容農場產出

找到文章中提到Lynx vue的原型repo [lynx-vue-implementation](https://github.com/rahul-vashishtha/lynx-stack/tree/lynx-vue-implementation)

離真正可用，似乎還有不短的距離

文章內還有提到`NativeScript-Vue`，爬了下資料，又看到[弃用 uni-app！Vue3 的原生 App 开发框架来了！](https://juejin.cn/post/7560510073950011435)

裡面有個回覆蠻有趣的

> 尤雨溪：“怎么我现在点赞一个项目就叫点名了是把”

總之要選一個玩的話，不然來試試看NativeScript-Vue 3吧，NativeScript這麼久了應該夠成熟吧？

我參考了[這個官方範例](https://github.com/NativeScript/ns-vue-vite-demo)來開始動手

<ModalImage
  src="/2026-01-22-nativescript-vue-1/cover.jpg"
/>

## 先說結論

> 還是需要有App開發知識，android、iOS都要

這部分算是折騰我最久的，在模擬器上一切都好，並且功能都寫完了。移到實機測試時就是有問題

要開始追查時，就得打開Xcode、Android studio了，畢竟NativeScript提供的console必須等到App初始化完成，開始渲染畫面，才可以看到log

並且兩個平台還是有許多的配置，這些不能透過NativeScript產生共用的，只得直接去編輯，如

- App_Resources/iOS/Info.plist
- App_Resources/Android/src/main/res/values/strings.xml

不足的部分藉由AI的幫忙，花點時間還是可以解決的

> 除錯體驗的落差

- **沒有 DOM Inspector**：無法像 Chrome DevTools 那樣直觀地「選取元素看樣式」或調整 CSS
- **Tailwind CSS在HMR沒有動態產生樣式**：在HMR下，更新class雖然會動態加上，但如果是專案沒有用過的樣式，一定要在重啟dev server之後才會產生

## 沒有 DOM 的世界

### HTML 標籤不存在

NativeScript不是WebView，Web開發者習慣的 HTML標籤完全不存在。容器與元件必須使用 NativeScript 提供的 UI 元件：

- ❌ `div`, `span`, `p`, `img`, `input`
- ✅ `StackLayout`, `GridLayout`, `Label`, `Image`, `TextField`

### 文字節點限制

在 Web 中，文字可以直接放在 `div` 裡。在 NativeScript 中，**文字必須包在 `Label` 或 `Button` 等元件中**，不能直接放在容器元件內。

```vue
<!-- ❌ 錯誤：文字直接放在容器內 -->
<StackLayout>
  Hello World
  <span>Subtitle</span>
</StackLayout>

<!-- ✅ 正確：使用 Label 包裹文字 -->
<StackLayout>
  <Label text="Hello World" />
  <Label text="Subtitle" class="subtitle" />
</StackLayout>
```

## 樣式系統：Tailwind CSS 的限制

我也天真的認為既然有Tailwind CSS可以用，那應該可以加速樣式開發速度吧？但...

### 背景色與透明度變數 (Background Opacity)

這是一個常見的坑。NativeScript 支援 CSS 背景色，但**不支援 Tailwind v3+ 預設使用的 CSS 變數語法** (例如 `rgb(var(--tw-bg-opacity))`)

這導致直接使用 `bg-slate-900` 這類 class 在 Layout 元件上會失效，因為 NativeScript 的 CSS 解析器看不懂這種語法

**解決方案：**

1. **文字顏色通常正常**：`text-*` 通常能用，因為 Tailwind 對文字顏色的處理方式在某些配置下較簡單，或 NativeScript 對其容錯較高
2. **背景色使用屬性綁定**：直接透過 `:backgroundColor` 屬性綁定 Hex 色碼
3. **混合策略**：用 Tailwind 處理 layout/spacing (margin, padding)，用 `:backgroundColor` 處理背景

```vue
<!-- ❌ 背景色無效 (CSS 變數語法不支援) -->
<GridLayout class="bg-slate-900" />

<!-- ✅ 有效 (直接綁定屬性) -->
<GridLayout backgroundColor="#0f172a" />
```

## 本次小結

雖然build出的App速度飛快

一大堆跟Web不一樣的東西要記，那我怎不直接學Flutter呢 😎

並且Vue相關的知識只能用在樣式裡面，待我下回繼續分享

---

參考資料：

- [字节出手！「Vue Native」真的要来了！](https://juejin.cn/post/7566088386521546794)
- [弃用 uni-app！Vue3 的原生 App 开发框架来了！](https://juejin.cn/post/7560510073950011435)
- [NativeScript文件](https://docs.nativescript.org/)
- [NativeScript-Vue](https://nativescript-vue.org/)
