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
│       ├── theme-overrides.css            # 主題樣式覆寫
│       ├── serverUtils.js                 # 服務端工具（文章解析、分頁生成）
│       └── components/                    # 各種組件
│           └── ThemeLayout.vue            # 主題佈局組件
├── posts/                                 # 文章目錄
├── pages/                                 # 其他頁面
├── public/                                # 靜態資源
└── package.json                           # 項目依賴配置
```

## themeConfig 主題配置

在 `.vitepress/config.js` 中設定自訂主題參數：

```javascript
// 每頁的文章數量
const PAGE_SIZE = 10

export default defineConfig({
  themeConfig: {
    posts: await getPosts(PAGE_SIZE),
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
| `posts` | `Post[]` | 是 | 文章列表，由 `getPosts(PAGE_SIZE)` 自動生成，供標籤、歸檔、分類、分頁等組件使用 |
| `siteUrl` | `string` | 是 | 網站完整 URL，用於 Footer 版權連結 |
| `pvApiUrl` | `string` | 否 | PV 統計 API 地址，未設定則不啟用（詳見 [PostPageView 文章瀏覽數](#postpageview-文章瀏覽數)） |
| `footerLogo` | `string` | 否 | Footer Logo 檔名（放置於 `public/`），未設定則使用預設 Logo |
| `defaultOGImage` | `string` | 是 | 預設 Open Graph 圖片檔名（放置於 `public/`），用於社交分享預覽 |

### 建構常數

| 常數 | 預設值 | 說明 |
|------|--------|------|
| `PAGE_SIZE` | `10` | 每頁顯示的文章數量，傳入 `getPosts()` 以自動生成分頁檔案 |

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
