# kakahikari.github.io

只是一個紀錄用的blog

主題啟發自: [vitepress-blog-pure](https://github.com/airene/vitepress-blog-pure)

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
