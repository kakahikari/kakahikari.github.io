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
│       └── components/                    # 各種元件
│           └── ThemeLayout.vue            # 主題佈局元件
├── posts/                                 # 文章目錄
├── pages/                                 # 其他頁面
├── public/                                # 靜態資源
└── package.json                           # 項目依賴配置
```

## 元件說明

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

1. 在 `.vitepress/config.js` 的 `themeConfig` 中設定 `pvApiUrl`：

```javascript
themeConfig: {
  pvApiUrl: 'https://your-api-domain.com/pv/track',
  // ...其他設定
}
```

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
