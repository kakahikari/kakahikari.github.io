# kakahikari.github.io

只是一個紀錄用的blog

主題啟發自: [vitepress-blog-pure](https://github.com/airene/vitepress-blog-pure)

## Category 文章分類

文章使用以下分類：

- **技術** - 程式開發、軟體工具、技術筆記等相關文章
- **智慧家庭** - Home Assistant、智慧裝置整合等相關文章
- **除錯** - 問題排查、錯誤修復等技術除錯文章
- **生活** - 日常生活、心得分享等文章

## 專案結構

```
├── .vitepress/
│   ├── config.js                          # VitePress 主配置文件
│   └── theme/
│       ├── index.js                       # 自定義主題入口
│       ├── imageOptimizer.js              # 圖片轉檔、快取與 manifest
│       ├── theme-overrides.css            # 主題樣式覆寫
│       ├── serverUtils.js                 # 服務端工具（文章解析、分頁生成）
│       └── components/                    # 各種組件
│           └── ThemeLayout.vue            # 主題佈局組件
├── posts/                                 # 文章與文章圖片來源
│   ├── <slug>.md                          # 文章
│   └── <slug>/                            # 對應文章的 JPG/PNG 原圖
├── pages/                                 # 其他頁面
├── public/                                # 全站靜態資源與圖片建置產物
│   └── generated/posts/                   # 文章 WebP（建置期產生，不進版控）
└── package.json                           # 項目依賴配置
```

## 圖片處理

### 文章圖片的放置與引用

文章的 JPG/PNG 原圖放在與 Markdown 同名的目錄，讓文章與資產容易一起管理：

```text
posts/
├── 2026-08-21-example.md
└── 2026-08-21-example/
    ├── cover.jpg
    └── img01.png
```

Markdown 和 frontmatter 使用網站根目錄起算的邏輯路徑，不需要填入 `generated`：

```markdown
---
meta:
  - property: og:image
    content: /2026-08-21-example/cover.jpg
---

![圖片說明](/2026-08-21-example/img01.png)

<ModalImage
  src="/2026-08-21-example/img01.png"
  caption="圖片說明"
/>
```

目前文章來源圖片只處理 `.jpg`、`.jpeg` 與 `.png`。其他不需轉檔的靜態資源應放在 `public/`，並直接使用公開路徑引用

### 建置流程

`.vitepress/theme/imageOptimizer.js` 會在 VitePress 載入設定時執行：

1. 掃描 `posts/<slug>/` 的文章原圖；`public/` 不經過圖片轉換
2. 從文章 frontmatter 的 `og:image` 判斷封面圖
3. 使用 Sharp 以品質 78 產生 WebP；圖片不會放大：
   - 封面圖：最大寬度 480、720、1080px
   - 內文圖：最大寬度 1376px
4. 文章圖片輸出至 `public/generated/posts/<slug>/`，檔名包含實際寬度與內容 hash，例如：

   ```text
   cover-1080-faae662e30d0f007.opt.webp
   ```

5. 產生 `.vitepress/cache/image-manifest.json`，供 Markdown 圖片、`ModalImage`、`PostCard`、Open Graph 與 Twitter Card 改寫成實際 WebP URL

文章原始 JPG/PNG 不會複製到 `public/`，因此也不會進入 `dist/` 或部署內容。每張文章圖片都會產生至少一個 WebP 版本，不比較轉檔前後的檔案大小

`public/` 視為已準備好部署的最終靜態資產，例如 `logo.png`、`og.jpg`，建置時會直接複製，不產生 WebP 或 fallback

### 快取與清理

- 圖片內容、品質或目標尺寸沒有改變，且衍生檔仍存在時，後續建置會沿用 manifest 快取
- hash 檔名可避免圖片更新後仍命中瀏覽器舊快取
- 每次建置會刪除 manifest 不再引用的文章衍生檔
- 建置也會清除舊流程曾留在 `public/` 的文章原圖目錄與全站圖片衍生檔
- `public/generated/posts/`、`public/**/*.opt.webp` 與 manifest 均已加入 `.gitignore`，不應手動加入版控

## themeConfig 主題配置

在 `.vitepress/config.js` 中設定自訂主題參數：

```javascript
export default defineConfig({
  themeConfig: {
    siteUrl: 'https://your-domain.com',
    pvApiUrl: 'https://your-api-domain.com/pv/track',
    footerLogo: 'logo.png',
    defaultOGImage: 'og.jpg',
    // ...其他 VitePress 預設主題配置（nav, socialLinks, search 等）
  },
})
```

### 自訂參數

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `siteUrl` | `string` | 是 | 網站完整 URL，用於 Footer 版權連結 |
| `pvApiUrl` | `string` | 否 | PV 統計 API 地址，未設定則不啟用（詳見 [PostPageView 文章瀏覽數](#postpageview-文章瀏覽數)） |
| `footerLogo` | `string` | 否 | Footer Logo 檔名（放置於 `public/`），未設定則使用預設 Logo |
| `defaultOGImage` | `string` | 是 | 預設 Open Graph 圖片檔名（放置於 `public/`），用於社交分享預覽 |

### 建構常數

| 常數 | 預設值 | 說明 |
|------|--------|------|
| `PAGE_SIZE` | `10` | 每頁顯示的文章數量，供建置期分頁生成使用 |

## 組件說明

### YouTube 影片嵌入

在 Markdown 文章中嵌入 YouTube 影片：

```markdown
<YouTube id="VIDEO_ID" />
```

**參數：**
- `id`：YouTube 影片 ID（從 YouTube 網址中取得）

**範例：**
```markdown
<!-- YouTube 網址：https://www.youtube.com/watch?v=dQw4w9WgXcQ -->
<YouTube id="dQw4w9WgXcQ" />
```

### ModalImage 燈箱圖片

在 Markdown 文章中插入可點擊放大檢視的圖片：

```markdown
<ModalImage
  src="/path/to/image.jpg"
  caption="圖片說明"
/>
```

**參數：**
- `src` (必填)：圖片路徑
- `caption`：圖片說明文字（同時用作 alt 屬性）
- `width`：行內圖寬度（px）
- `height`：行內圖高度（px）
- `align`：對齊方式（`left` | `center` | `right`），預設 `center`

**範例：**
```markdown
<!-- 基本使用 -->
<ModalImage
  src="/images/example.jpg"
  caption="範例圖片"
/>

<!-- 完整參數 -->
<ModalImage
  src="/images/example.jpg"
  :width="400"
  :height="300"
  caption="自訂尺寸的圖片"
  align="left"
/>
```

### PostPageView 文章瀏覽數

在文章詳情頁自動顯示瀏覽數（Page View）統計

**啟用方式：**

1. 在 `themeConfig` 中設定 `pvApiUrl`（參見 [themeConfig 主題配置](#themeconfig-主題配置)）
2. 若未設定 `pvApiUrl`，此功能不會啟用，組件不會顯示也不會發送請求

**重要說明：**
- PV API 需要**自行架設**，本專案不提供 API 服務
- 本地開發時，若 API 驗證來源失敗會顯示 `0` 而非隱藏組件

**API 規格：**

端點：GET /pv
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

**API 實作注意事項：**
- 使用 `Referer` header 中的完整 URL 作為頁面識別
- 每次 GET 請求應將該頁面的計數 +1
- 回應需包含 CORS headers 以允許跨域請求
