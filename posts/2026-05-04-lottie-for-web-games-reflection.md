---
date: 2026-05-04
title: Lottie 做網頁遊戲踩坑全紀錄：renderer、記憶體與 iOS 限制
category: 技術
tags:
  - Lottie
description: 使用 Lottie 製作網頁遊戲時，會遇到 renderer 差異、動畫重建、記憶體爆炸與 iOS 限制等問題。本文整理實戰踩坑與優化策略，包含 SVG vs Canvas 選擇、動畫管理與效能控制。
meta:
  - property: og:image
    content: /2026-05-04-lottie-for-web-games-reflection/cover.jpg
---

收到了一個做出網頁小遊戲的需求：

1. 多角色
2. 多狀態動畫
3. 障礙賽跑
4. 跨裝置、跨平台

過去用過 Lottie，覺得它輕量又好上手，直覺認為這種需求應該可以輕鬆解決

實際做下去才發現——事情完全不是這樣...

接下來整理這次實作中遇到的幾個關鍵坑

![Cover](/2026-05-04-lottie-for-web-games-reflection/cover.jpg)

## Lottie 能做什麼、優點在哪

為什麼要用Lottie？我會說他是：「設計師匯出、前端套上、就能播放的向量動畫」

### 1. 跨解析度的 UI 素材替代品

只要動畫內容是向量（AE 裡沒用到點陣素材），任何縮放都不會鋸齒。手機直式頁面和活動現場的大螢幕 kiosk 共用一份素材也清晰，這是 PNG/GIF/APNG 做不到的

### 2. 狀態可控的「會動的元件」

和GIF最大的差別：Lottie是**可程式控制**的。

lottie-web 提供：

- `play / pause / stop`
- `goToAndPlay / goToAndStop`
- `setSpeed / setDirection`
- `playSegments`
- `complete / DOMLoaded / data_ready` 事件

所以它可以當「按鈕的 idle / hover / click 三態」、「角色的 running / stop / impact 三層」、「抽獎轉盤停在特定 frame」。這類需求如果只有影片會難以對齊遊戲狀態，用Lottie簡單對接

### 3. 取代「多張 sprite sheet / 多段短影片」的方案

傳統做法是 sprite sheet 或多段影片

使用Lottie的優勢是：

- 一個動作一個 JSON，邏輯乾淨
- 不需要對齊 atlas 座標
- 設計師改版只丟新 JSON，不用 re-pack

### 4. 純文本 JSON，可程式化處理

這是中後期優化階段才會意識到的好處。Lottie JSON 裡的欄位是公開可讀的：

- `assets[]` 可以知道嵌了幾張圖、每張多大
- 可以偵測 `tt / tp`（track matte）、`hasMask`、`ef`（effects）
- 可以寫腳本批次「抽 base64 → 外部檔案」

也就是說，優化流程可以自動化，而不是靠人肉看 AE 檔

### 5. 組合性高

一個寫得好的 `useLottie` composable通常能覆蓋：按鈕、背景、角色、特效、轉場。不會每種用途都要寫一個新 player wrapper

## 難做的坑

Lottie 的官方定位是「動畫播放器」，但遊戲情境會把它推到播放器以外的邊界

以下是從文件上**看不到**、要靠實機開發才會發現的坑

### 坑 1：Canvas renderer 不支援 precomp 當 alpha matte 來源

Lottie 的 track matte（遮罩）分很多種，其中一種是「把 precomp 當成 alpha 遮罩來源」

這個組合：

- SVG renderer：正常
- Canvas renderer：直接渲染失敗（整塊黑、或整塊透明）

這是 lottie-web 已知限制（非 bug），且長期未完全解決

同一支 animation 在 Chrome 桌機完全正常，到 iPhone Safari 變空白。debug時不容易想到是 renderer 的已知限制

解法是對這類檔案**個別強制走 SVG renderer**，維護一份白名單，不要全局切。因為 SVG renderer 在手機上有別的問題（見坑 2、以及手機限制 3）

### 坑 2：不同 renderer 的特效支援度完全不一樣

AE 裡常見的 **track matte / mask / effects（模糊、發光、位移）**，到了三個 renderer：

| 特性                        | SVG        | Canvas     | HTML               |
| --------------------------- | ---------- | ---------- | ------------------ |
| Track matte（shape 來源）   | ✓          | ✓          | 部分               |
| Track matte（precomp 來源） | ✓          | ✗          | ✗                  |
| Mask                        | ✓          | 多數支援   | 差                 |
| Effects（blur、glow）       | 多數不支援 | 多數不支援 | ✗                  |
| 記憶體成本                  | 高         | 中         | 低（但幾乎不能用） |

實戰上的做法是匯出後跑一個靜態審計：

- 標出 JSON 裡的 `tt / tp / hasMask / ef` 數量
- 把檔案分成 `svg-candidate`（必走 SVG）/ `review`（要實機看）/ `canvas-default`（安全）
- 再對 `review` 級的逐個跑裝置

**不要「整個專案統一用 svg」或「整個專案統一用 canvas」**，這兩個極端都會出事

### 坑 3：切換 `path` / `animationData` 會整個重建實例

在 React/Vue 這種 reactive 框架，很直覺會寫：

```
<Lottie :path="heroState === 'impact' ? impactPath : runningPath" />
```

watch 這個 path 變動就 `destroy() + loadAnimation()` 重建，結果：

- 視覺上角色閃一下（DOM 被拔掉重建）
- 重建瞬間記憶體尖峰
- 舊實例的 onComplete callback 可能還在 pending

對多狀態角色，正確做法是**分層常駐 + preload cache**：

- `running` 層永遠掛著，用 CSS 控 `v-show` / `display`
- `stop` / `impact` 層預先 fetch 好 `animationData` 放進 Map
- 狀態切換時：切換哪一層 visible，不切 path

這條是 Lottie 遊戲和「Lottie 當 loading 動畫」最大的工法差異

### 坑 4：「重播同一支動畫」沒有內建 API

「障礙物每圈重新播一次」「每次碰撞觸發一次 impact」是遊戲裡最常見的需求。Lottie 沒有直接的「重播」signal。常見錯誤解法：

- ❌ 用 React `key` 強制 remount → 回到坑 3
- ❌ `path` 設一樣值期望重新觸發 → watcher 不會跑
- ✓ 自己做一個 `playToken`：外部變這個值，內部呼 `goToAndPlay(0, true)`

但 `playToken` 要處理一個邊界：實例還沒載完（尚未收到 `DOMLoaded`）就收到 token。這時要 queue 起來，`DOMLoaded` 後補播

### 坑 5：JSON 大小 ≠ 記憶體成本

這是最大的心智陷阱。新手會以為「壓 JSON、壓 PNG、TinyPNG 一輪就安全」。但真正的記憶體成本來自：

- **PNG 解碼後的 bitmap**：`寬 × 高 × 4 bytes`（RGBA），無論 TinyPNG 壓到多小，解碼後一樣大
- **Canvas framebuffer**：`寬 × dpr × 高 × dpr × 4`
- **同時活著的實例數**：直接線性相加

記憶體瓶頸幾乎都發生在「解碼後」與「renderer buffer」，不是檔案大小

所以壓檔案大小只會讓下載快一點點，不會救手機記憶體。要省記憶體，得從「降低素材像素尺寸」和「減少同時活著的實例」下手

### 坑 6：容器沒有尺寸時 Lottie 會扁掉 / 不顯示

Lottie 是依附在 DOM 容器上渲染的。如果容器用 `display: flex` + `flex-grow`，或父層尚未 layout 完成，Lottie 可能：

- 量到 0×0 尺寸，渲染成看不見
- 量到暫時尺寸，渲染後容器長大時不會自己 resize

解法：

- 用 `aspectRatio` 讓容器自撐（可以從 `animationData.w / h` 或 SVG viewBox 推出）
- 在 `DOMLoaded` 後必要時手動 `animation.resize()`
- 用 `flush: 'post'` 的 effect 確保 DOM 掛完才 load

### 坑 7：lottie-web 的 `loaded` 狀態有多個事件，順序有雷

- `config_ready`：config 解析完
- `data_ready`：JSON 載完、layers 建好
- `DOMLoaded`：DOM 節點塞進容器（對 SVG/Canvas 都適用）
- `complete`：非 loop 動畫播完一次

做「載完前先 stub、載完切正式畫面」這類邏輯要用 `DOMLoaded`，不是 `data_ready`，否則容器裡還沒 DOM 就被當成 ready。

## 手機上的限制（真正的主戰場）

桌機開發時什麼都順，一到手機就爆炸，是 Lottie 遊戲最常見的劇本。核心原因是 iOS 的記憶體管控比桌機嚴格得多

### 限制 1：iOS WebContent Process 預算只有約 300–400 MB

超過這個上限，iOS 會直接用 **Jetsam 機制殺掉整個 tab**。使用者看到的症狀是：

- 頁面自動 reload
- reload 幾次後 Safari 顯示「無法開啟這個網頁」
- console 來不及噴錯就被殺

這個數字會依 iPhone 型號、可用記憶體浮動，但**沒有任何警告機制**，只能事前量測

### 限制 2：Canvas renderer 預設 dpr 會在 iPhone 上爆掉

lottie-web 的 canvas renderer 若**不傳** `rendererSettings.dpr`，會用某個內部預設（可能是 `devicePixelRatio` 甚至更大），結合 animationData 原始寬 `w`，導致 canvas 內部 framebuffer 尺寸完全脫離實際顯示尺寸。

實測案例：一個 CSS 顯示 253×253、animation 原始 700×700 的角色動畫，渲染後 canvas 內部居然是 **4200×4200**，單一 framebuffer **67 MB**。頁面上 5 個這種 canvas 加起來 **281 MB**，iPhone 必爆

### 限制 3：SVG renderer 會被 WebKit 額外光柵化

SVG renderer 相容性最好，但 SVG 裡的 `<image>` 節點（Lottie 放 PNG asset 的地方），WebKit 會將 `<image>`光柵化進 compositing layer（額外 rasterization），導致記憶體近似翻倍，等於一張 PNG 記憶體佔用翻倍

所以「能走 canvas 就走 canvas」在手機上是記憶體優先原則，只有坑 1、坑 2 裡必須走 SVG 的檔案才走 SVG

### 限制 4：大多iPhone DPR = 3，但高 DPR 會讓記憶體成本平方成長

iPhone 14 的 DPR 是 3。一個 CSS 253×253 的元素，物理像素是 758×758。如果不控 canvas dpr 或點陣素材尺寸，記憶體是桌機的 9 倍。

這也是為什麼「用設計稿的 2160×3840 物理解析度排版」是錯誤的思路：

- iPhone CSS viewport 通常就 390×844，超過沒意義
- Canvas 如果按 2160×3840 × dpr 3 去畫，等於 6480×11520 的 framebuffer，單一動畫就 300 MB

### 限制 5：同時活著的實例數是線性成本

如果遊戲同時有 4 個英雄 × 6 種障礙 × 2 種結果 = 48 種 impact 動畫全預載 canvas 實例，每個 ~2 MB backing store → **96 MB peak**，直接吃掉 iOS 1/3 預算。再加上其他 Lottie（跑動、背景、按鈕、結算），會很快爆掉

配方：

- 常駐層：只留必要的（例如 4 個角色的 running）
- 可選層：`v-if` 控制 mount，搭配 preload 好的 `animationData` cache（JSON 文本放在記憶體，只有在真的要演時才 loadAnimation）
- 一次性層（impact、結算特效）：**mount-on-demand，播完卸載**

JSON 本身放在記憶體的成本遠低於 Lottie instance 的成本，所以「preload JSON、lazy instance」是通用配方

### 限制 6：記憶體觀測必須靠實機，桌機看不到

Chrome DevTools Memory 面板在桌機永遠顯示健康，因為桌機根本不在乎 300 MB。正確做法：

- 把 iPhone 用線接上 Mac
- 打開 Safari → 偏好設定 → 進階 → 勾「在選單列中顯示開發選單」
- Develop → [iPhone 名稱] → [頁面] → 開 Web Inspector
- 看 Timelines → Memory graph，抓 Jetsam 前的尖峰

這步省不掉。只看桌機就上線 = 裝作沒問題而已

## 結論

Lottie 適合：

- UI 動畫
- 按鈕 / 狀態動畫
- 輕量互動

Lottie 不適合：

- 高頻率遊戲 loop
- 大量 instance 同時存在
- 重特效 / 粒子系統

下次遇到做遊戲的需求還是直接拿遊戲引擎吧 🤪
