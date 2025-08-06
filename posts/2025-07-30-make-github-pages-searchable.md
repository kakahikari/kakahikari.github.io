---
date: 2025-07-30
title: 如何讓 GitHub Pages 被 Google 搜尋到
category: 技術
tags:
  - 網站架設
  - github
  - SEO
description: 教你如何讓 GitHub Pages 被 Google 搜尋到，從 sitemap、meta 標籤到 robots.txt 的設定，搭配 Google Search Console 提高網站能見度與 SEO 成效。
---

# 如何讓 GitHub Pages 被 Google 搜尋到

## 問題敘述

用 GitHub Pages架了網站，放了很久，他是不會主動加入 Google 的索引的，所以不會被搜尋到

為什麼 GitHub Pages 不容易被搜尋？

1. 預設無 sitemap

2. 沒有 meta 標籤

3. 可能 robots.txt 被限制

那麼要如何讓你的靜態網頁出現在搜尋結果呢？

## 如何解決

1. 建立 [sitemap](https://www.xml-sitemaps.com/)

2. 建立 meta 標籤

- 至少要有`description`
- `og:title`, `og:image`, `og:description` 等 OG:Tag
- 用 [META 分享偵錯工具](https://developers.facebook.com/tools/debug/) 確認分享的效果，若沒有更新可能是被快取住了，需要手動抓取最新

3. 建立 `robots.txt`

範例:

```txt
User-agent: *
Allow: /
Sitemap: https://yourdomain.github.io/sitemap.xml
```

以上都做完後，記得把你的網站登錄在 [Google Search Console](https://search.google.com/search-console/)

Google Search Console 會需要驗證網站的所有權，驗證完成後就可以輸入網站內的網址，檢查這些網址有沒有被索引囉
