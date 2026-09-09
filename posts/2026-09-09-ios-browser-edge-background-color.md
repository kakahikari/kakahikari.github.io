---
title: 解決 iOS 瀏覽器上下延伸不同顏色
date: 2026-09-09
category: 除錯
tags:
  - iOS
  - Browser
description: 說明 iOS 瀏覽器如何決定畫面上下的延伸色，以及如何利用根元素背景與貼齊 viewport 的固定純色元素，讓上下使用不同顏色。
meta:
  - property: og:image
    content: /2026-09-09-ios-browser-edge-background-color/cover.jpg
---

![Cover](/2026-09-09-ios-browser-edge-background-color/cover.jpg)

當手機版網頁的上半部與下半部使用不同底色時，iOS 瀏覽器可能會把同一個顏色延伸到畫面上下。網頁內容本身看起來沒有問題，網址列周圍卻和貼近它的頁面底色不同，中間因此出現一道很明顯的分界

一開始以為是 safe area 沒處理好，後來才發現真正的問題不是內容有沒有避開瀏海或 Home Indicator，而是瀏覽器如何決定上下介面周圍要延伸什麼顏色

這篇記錄幾個試過但沒有解決的方向，以及如何讓 iOS 瀏覽器在畫面上方與下方延伸不同顏色

## Safe area 和瀏覽器取色是兩件事

`viewport-fit=cover` 和 `env(safe-area-inset-*)` 解決的是版面能否延伸至整個螢幕，以及重要內容是否會被圓角、感測器區域或 Home Indicator 擋住

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

```css
.page {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

[WebKit 對 iPhone X 網頁設計的說明](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)也提到，safe area 以外的 inset 區域會使用 `html` 或 `body` 的 `background-color` 填滿。但 `safe-area-inset-top` 和 `safe-area-inset-bottom` 只提供安全距離，不會告訴網頁網址列目前在上方還是下方，也不能指定瀏覽器上、下各自使用哪個顏色

所以即使頁面已經使用 `100dvh`，也完整加上 safe area padding，仍可能看到瀏覽器介面和主視覺之間的色差

## 為什麼 theme-color 解不了上下不同色

最直覺的作法是設定：

```html
<meta name="theme-color" content="#000000" />
```

`theme-color` 是建議瀏覽器用來呈現頁面周圍介面的主題色，但它只有一個顏色，而且[瀏覽器支援並不一致](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color/)

如果整頁只需要一種延伸色，這可能已經足夠；但上下需要不同顏色時，指定其中一個顏色只會讓另一端出現接縫。把它改成另一個顏色，也只是把問題從下方移到上方

因此這個案例最後沒有設定 `theme-color`，讓頁面邊緣的實際結構負責提供顏色

## 漸層背景也不一定有用

另一個腦洞大開的想法是替 `html` 設定從上方色過渡到下方色的漸層：

```css
html {
  background-color: var(--bottom-color);
  background-image: linear-gradient(
    var(--top-color) 0 50%,
    var(--bottom-color) 50% 100%
  );
}
```

這能畫出網頁內的漸層，卻不能保證瀏覽器介面也照著漸層的上下位置取色。WebKit 描述的是純色背景的延伸行為，而瀏覽器介面如何取色仍是實作細節

實際測試時，頁面內雖然有漸層，工具列周圍仍可能延伸成單一顏色。因此不能只看桌面版 DevTools 的畫面，必須回到 iPhone 實機確認

## 關鍵是貼齊邊緣的固定純色元素

[WebKit 工程師在 Bug 301756 的說明](https://bugs.webkit.org/show_bug.cgi?id=301756#c2)提到：當 `fixed` 或 `sticky` 元素貼近 viewport 邊緣時，Safari 會在被瀏覽器介面遮住的相鄰區域延伸純色，避免捲動時在元素旁留下突兀空隙

因此最後採用的結構是：

- `html`、`body` 使用頁面下方要延伸的顏色
- 頂部放一個貼齊 viewport、具有實際高度的 fixed 純色元素
- 不設定 `theme-color`
- 主內容避開這個頂部元素的高度

HTML 可以簡化成：

```html
<body>
  <div class="browser-edge-top" aria-hidden="true"></div>
  <main class="app-main">
    <section class="page">
      <!-- 頁面內容 -->
    </section>
  </main>
</body>
```

對應 CSS：

```css
:root {
  --browser-edge-top: var(--page-top-color);
  --browser-edge-bottom: var(--page-bottom-color);
  --edge-header-height: 0.75rem;
}

html,
body {
  margin: 0;
  background-color: var(--browser-edge-bottom);
}

.browser-edge-top {
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  height: var(--edge-header-height);
  background-color: var(--browser-edge-top);
}

.app-main {
  padding-top: var(--edge-header-height);
}
```

範例中的 `--page-top-color` 與 `--page-bottom-color` 應替換成專案原有的設計色彩變數

這裡有幾個細節不能省略：頂部元素要貼齊 viewport、保持可見，並使用實際的純色背景。先前把背景放在負 `z-index`、被其他內容蓋住的固定圖層，實機上沒有得到相同效果

改成這個結構後，iOS Safari 與 Chrome 的實機取色都能跟隨頁面上下各自的底色

## 多出一小段捲動怎麼處理

取色正確後又遇到另一個問題：頁面原本已有 `min-height: 100dvh`，現在 `main` 再加上 `0.75rem` 的頂部 padding，總高度就會超過 viewport，導致原本不該捲動的畫面多出一小段捲動距離

```text
100dvh + 0.75rem = 超出 viewport
```

解法不是直接設定 `overflow: hidden`。這樣可能讓長內容、表單或鍵盤彈出時無法正常捲動。比較安全的作法是從頁面的最小高度扣掉 header 高度：

```css
.page {
  min-height: calc(100dvh - var(--edge-header-height));
}
```

`main` 的 padding 和 `.page` 的最小高度使用同一個 CSS 變數，之後調整 header 高度也不會再次算錯。內容比畫面長時，`min-height` 仍允許頁面自然撐開

## 這不是通用的瀏覽器介面控制 API

這個方法的本質不是直接控制 Safari 或 Chrome 的網址列，而是提供瀏覽器可以延伸的頁面邊緣顏色。因此還是有幾個限制：

- 網頁沒有標準 API 可以可靠判斷網址列目前在上方或下方
- 瀏覽器介面的取色與透明、模糊效果可能隨 iOS 版本改變
- `theme-color`、safe area、根元素背景和貼邊元素處理的是不同問題，不能互相替代
- 模擬器或桌面響應式模式不等於實機結果，至少要測 Safari 和實際會使用的其他 iOS 瀏覽器

如果頁面只需要單一延伸色，先設定一致的 `html`、`body` 背景通常比較簡單。如果上下需要不同顏色，再考慮使用「下方根背景＋頂部固定純色元素」的結構

## 最後整理

這次真正有效的不是偵測網址列位置，也不是用 JavaScript 偷捲動 1px，而是讓頁面的 DOM 結構清楚表達上下邊緣的顏色：

1. 移除會強制整體單一顏色的 `theme-color`
2. 讓 `html`、`body` 使用下方應延伸的顏色
3. 用貼齊頂端的 fixed 純色元素提供上方應延伸的顏色
4. 主內容加上相同高度的 padding
5. 從 `100dvh` 扣掉這段高度，避免產生額外捲動
6. 回到 iPhone 實機測試展開與縮小網址列後的效果

safe area 仍然重要，但它負責的是內容安全，不是瀏覽器工具列取色。把這兩件事拆開處理後，上下不同色的頁面就比較容易找到問題真正出在哪裡

---

參考資料：

- [Designing Websites for iPhone X（WebKit）](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Bug 301756：Safari 頂部工具列延伸色說明（WebKit Bugzilla）](https://bugs.webkit.org/show_bug.cgi?id=301756#c2)
- [`theme-color` meta element（MDN）](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color/)
