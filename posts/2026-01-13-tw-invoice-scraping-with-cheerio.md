---
date: 2026-01-13
title: 如何抓取統一發票中獎號碼並且自動更新到Github專案？用cheerio試試
category: 技術
tags:
  - cheerio
  - node.js
  - Github
description: 介紹如何在不申請財政部 API Key 的情況下，使用 Cheerio.js 抓取統一發票中獎號碼，解析靜態 HTML 頁面並輸出成 JSON，再透過 GitHub Actions 排程自動更新專案資料，打造輕量且可維護的中獎號碼同步流程。
---

## 問題敘述

財政部[財政部電子發票整合服務平台](https://www.einvoice.nat.gov.tw/portal/ods/ODS318E) 提供的 開放資料 API 和 營業人應用 API，可讓開發者能整合發票中獎查詢、載具歸戶、開立發票等功能

我的需求其實很單純：定期取得最新的統一發票中獎號碼，並自動更新到 GitHub 專案中

但前提是要先用營業人身份，才可以申請APIKey，我沒有要這麼多功能，只是要單純的拿到中獎號碼而已，直覺想到說可以寫一隻爬蟲，定期去抓資料，再把資料寫成自己要的格式就好

## 如何解決

爬了一下爬蟲或類似的做法，找到一個Cheerio.js的方案：

Cheerio.js 是一個在 `Node.js` 環境中解析與操作`HTML`的工具，你可以把它想成「沒有瀏覽器的 jQuery」

簡單來說，如果你的需求是：

- 不需要執行 JavaScript
- 只是解析固定結構的 HTML
- 想確認「頁面內容是否有變化」

那 Cheerio 會比 Puppeteer / Playwright 輕量很多，也更適合放在 CI 或 GitHub Actions 中執行

⚠️ _但它不能完全取代所有爬蟲情境，尤其是「需要執行 JavaScript 的頁面」_ ⚠️

剛好政府機關為了符合各種無障礙規範，[各期統一發票中獎號碼、中獎清冊列表](https://www.etax.nat.gov.tw/etwmain/etw183w)只是簡單的靜態頁面

只需要簡單的HTML解析，就可以達到我的目標！

### 撈出列表頁所有的對獎連結

```js
const html = await fetchWithRetry(LIST_URL)
const $ = cheerio.load(html)

// 尋找所有符合 "XX年 XX ~ XX 月" 格式的連結
const periodLinks = []
$('a').each((_, el) => {
  const text = $(el).text().trim()
  const href = $(el).attr('href')

  // 匹配格式: "114年 09 ~ 10 月" 或 "114年 9 ~ 10 月"
  const match = text.match(/^(\d{3})年\s+(\d{1,2})\s+~\s+(\d{1,2})\s*月$/)
  if (match && href) {
    // 從 URL 提取期別: /etw-main/ETW183W2_11409/ -> 11409
    const periodMatch = href.match(/ETW183W2_(\d{5})/)
    if (periodMatch) {
      periodLinks.push({
        period: periodMatch[1],
        year: match[1],
        startMonth: match[2],
        endMonth: match[3],
        url: href,
      })
    }
  }
})
```

找到兌獎連結後，再到該月份的兌獎頁面解析出需要的資料即可，可以參考[我的專案實作](https://github.com/kakahikari/tw-invoice-checker-web/blob/main/scripts/update-winning-numbers.js)

依照類似的方法寫出一個腳本，並且可以輸出一個json檔當作最後的產出

### 自動更新

```yaml
name: Update Winning Numbers

on:
  schedule:
    # 奇數月 25 日 14:00 UTC+8 = 06:00 UTC
    - cron: '0 6 25 1,3,5,7,9,11 *'
    # 奇數月 25 日 17:00 UTC+8 = 09:00 UTC
    - cron: '0 9 25 1,3,5,7,9,11 *'
  # 允許手動觸發
  workflow_dispatch:

jobs:
  update:
    # 中間略過
    - name: Run winning numbers crawler
      run: node scripts/update-winning-numbers.js

    - name: Commit and push if changed
      run: |
        git config user.name "github-actions[bot]"
        git config user.email "github-actions[bot]@users.noreply.github.com"
        git diff --quiet && git diff --staged --quiet || git push
```

我用的方案是`github action`，schedule cron的功能安排在奇數月(開獎月份)去觸發這個腳本，並且自動git commit來讓專案的資料更新，這樣我的專案就有一個自動更新的統一發票對獎號碼啦，可以參考[我的專案實作](https://github.com/kakahikari/tw-invoice-checker-web/blob/main/.github/workflows/update-winning-numbers.yaml)

對於只需要「讀取資料」的情境來說，這是一個成本低、維護簡單、也相對穩定的做法

---

參考資料：

- [cheerio](https://cheerio.js.org/)
