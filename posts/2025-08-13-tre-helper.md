---
date: 2025-08-13
title: 2025 TRE 攤位搜尋小工具
category: 技術
tags:
  - Vibe Coding
  - Github
  - SEO
description: 使用 Claude Code 開發的 2025 TRE
  攤位搜尋工具，支援攤位快速查詢和舞台時刻表功能。透過 Vibe Coding 開發模式，展示 AI
  輔助程式設計的實際應用。
meta:
  - property: og:image
    content: https://kakahikari.github.io/2025-08-13-tre-helper/cover.jpg
---

# 2025 TRE 攤位搜尋小工具

因為工作的關係，有接觸到TRE現場狀況，目前活動官方網站 [JKFace](https://jkface.net/) 只有提供部分攤位資訊，並沒有個攤位總覽圖。

想起以前在FF擺攤的時候，要找特定攤位還必須要翻場刊，要是有個搜尋工具就好了！

於是就做了這個出來 [2025 TRE 攤位搜尋](https://kakahikari.github.io/2025-tre-helper/) ([Github Repo](https://github.com/kakahikari/2025-tre-helper))

做的時候也想了一下，要是我是入場的觀眾，我還需要什麼呢？想到可以加入舞台時刻表，就簡單地把它放進去。

![Cover](/2025-08-13-tre-helper/cover.jpg)

## 資料來源

來自於 [活動官方網站](https://jkface.net/events/179#information) 活動詳細內的平面圖，原本有嘗試將整張高解析圖丟進GPT擷取成資料直接用，但辨識的結果非常糟糕，錯字連篇。原本字體是常見的無襯線字，並沒有什麼花俏的樣式，讓我有點意外，只好手打資料輸入 😨

## Vibe Coding

一開始用`create vue@latest`建立專案，手動安裝成習慣的開發環境後，其餘主要功能都用vibe coding去完成。

這次使用的是claude code，看看下班後 _用嘴砲_ 可以寫多少東西

但每個功能完成前，還是有做code review，以及安排重構

另外這次沒用Browser MCP去檢查樣式，所以最後RWD的部分還是人工去調教的

完成後架設在github pages上，用最小成本的方式架站

![Cover](/2025-08-13-tre-helper/ai-image.jpg)

## 社群推廣成果

在line的一個TRE社群以及 [ptt/japanavgirls版](https://www.ptt.cc/bbs/japanavgirls/M.1753864070.A.C34.html) 做了宣傳

![GA](/2025-08-13-tre-helper/ga.jpg)

從GA數據來看：推廣那幾天即高峰😅，活動三天也有差不多的用戶數使用，表示並沒有透過使用者內傳開

想到會場的擁擠程度，也許大多使用者認為隨意逛逛即可，並沒有要找到特定的單位；或他們直接詢問了工作人員

![Search Console](/2025-08-13-tre-helper/search-console.jpg)

從Search Console數據來看：~~媽媽我不乾淨了~~，女優名稱搜尋到蠻合理的，但我的部落格居然被攤位名稱污染了🤪

因為sitemap尚未被google建立，所以都是用手動提交網址去登錄，現在還蠻快的
