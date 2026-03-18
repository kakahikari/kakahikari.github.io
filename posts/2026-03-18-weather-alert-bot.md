---
date: 2026-03-18
title: 每天晚上自動提醒！用 GitHub Actions 打造天氣警報 Bot
category: 智慧家庭
tags:
  - Node.js
  - Telegram
  - Github
description: 用 GitHub Actions 搭配中央氣象署 API 與 Telegram，打造一個每天晚上自動提醒的天氣警報 Bot。透過簡單規則判斷降雨與溫差，避免忘記帶傘或穿錯衣服，零成本且不需伺服器。
meta:
  - property: og:image
    content: /2026-03-18-weather-alert-bot/cover.jpg
---

快遲到啦！

早上匆匆忙忙的收拾書包出門，沒想到下午突然颳起了大風，天氣瞬間變冷

到了放學時間，小孩一臉傻眼：怎麼其他人都包緊緊羽絨外套，我還穿著短褲短袖？

沒錯，出門前、睡覺前最煩的事情之一，就是要看一眼天氣預報，判斷要不要帶雨傘、要不要多帶一件保暖外套

但常常在早上的一陣兵荒馬亂中，還是忘記帶

那乾脆寫一個 Bot 每天晚上主動告訴我明天的狀況吧

![Cover](/2026-03-18-weather-alert-bot/cover.jpg)

[我已經在用的範例專案](https://github.com/kakahikari/weather-alert-bot)

## 這個 Bot 做了什麼？

簡單來說，它每天晚上 20:15 會自動執行，從中央氣象署抓取明日天氣預報，判斷三個條件：

- 🌧️ **降雨機率 > 60%** → 記得帶雨傘
- 🧥 **跟昨天溫差 ≥ 5°C** → 注意穿搭（升溫或降溫）
- 🌡️ **日夜溫差 ≥ 7°C** → 帶件外套備用

只要任一條件成立，就會發送一則 Telegram 通知；如果天氣跟今天差不多，就不吵你

## 架構設計

整個專案跑在 GitHub Actions 上，零成本、也不需要自己維護伺服器：

```
GitHub Actions
  ├─ 1. 呼叫 CWA API → 取得明日天氣預報
  ├─ 2. 讀取 GitHub Gist → 拿到昨日溫度資料
  ├─ 3. 比對條件 → 判斷是否觸發警報
  ├─ 4. 寫回 Gist → 儲存今日資料供明天比較
  └─ 5. 發送 Telegram → 若有警報就推送通知
```

這裡的關鍵設計是：用 **GitHub Gist 當作跨日記憶體**

每次執行完，把今天的溫度寫進Gist，下次執行時讀出來當作「昨日資料」，就能計算溫差，完全不需要資料庫

## 實作步驟

### 1. 申請中央氣象署 API

到[CWA 開放資料平台](https://opendata.cwa.gov.tw/)註冊帳號，取得 API 授權碼

接著找到你需要的資料集，例如台北市的鄉鎮天氣預報資料集 ID 是 `F-D0047-061`

:::info
各縣市的資料集 ID 不同，可以在 CWA 的 [API 文件](https://opendata.cwa.gov.tw/dist/opendata-swagger.html) 中查詢
:::

### 2. 建立 Telegram Bot

如果你還沒有 Telegram Bot，可以參考[這篇文章的申請步驟](./2026-01-30-telegram-message-notify.md#申請telegram-bot)，拿到 `BOT_TOKEN` 和 `CHAT_ID`。

### 3. 建立 GitHub Gist

到 [gist.github.com](https://gist.github.com/) 建立一個新的 Gist，新增一個JSON檔（例如這專案用的是 `weather-data.json`），內容先放`{}`

建立完成後，從網址取得`Gist ID`（網址最後一段）

另外還需要一個有 `gist` 權限的 的 GitHub Personal Access Token（PAT），用來讀寫這個 Gist

### 4. 設定 GitHub Secrets

在專案的 Settings → Secrets and variables → Actions 中，設定以下 secrets：

| Secret               | 說明                          |
| -------------------- | ----------------------------- |
| `CWA_API_TOKEN`      | CWA 開放資料平台授權碼        |
| `CWA_DATASET_ID`     | 資料集 ID（如 `F-D0047-061`） |
| `CWA_LOCATION`       | 鄉鎮區名稱（如 `中正區`）     |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token            |
| `TELEGRAM_CHAT_ID`   | 接收通知的 Chat ID            |
| `GIST_ID`            | 用於儲存歷史資料的 Gist ID    |
| `GH_TOKEN`           | 有 `gist` scope 的 GitHub PAT |

### 5. GitHub Actions 排程

我的排程設定如下:

```yml
on:
  schedule:
    - cron: '15 12 * * *'
  workflow_dispatch:
```

UTC 12:15 對應台灣時間 20:15，剛好是幫小孩洗澡、準備隔天衣服的時間

另外加上`workflow_dispatch`，可以讓你在GitHub上手動觸發，測試、除錯時很方便

## 核心邏輯

### 天氣資料解析

CWA 的 3 天預報 API 中：

- 溫度是逐時資料（DataTime）
- 降雨機率與天氣現象是區間資料（StartTime / EndTime）

因此需要自行整理：

- 從逐時溫度推算 minT / maxT / avgT
- 從降雨機率取最大值
- 從天氣現象取得描述

```js
export function parseTomorrowWeather(data, tomorrowStr, locationName) {
  // 整理溫度、降雨機率、天氣描述
}
```

### 警報判斷

三個條件各自獨立判斷，觸發就加入警報訊息陣列：

```js
export function checkAlerts(tomorrow, yesterday) {
  const alerts = []

  // 降雨機率 > 60%
  if (tomorrow.maxRainProb > 60) {
    alerts.push(`⚠️ 明日有雨: 降雨機率 ${tomorrow.maxRainProb}%`)
  }

  // 跟昨天溫差 >= 5°C（昨日資料可能不存在）
  if (yesterday) {
    const diff = Math.abs(tomorrow.avgT - yesterday.avgT)
    if (diff >= 5) {
      const direction = tomorrow.avgT < yesterday.avgT ? '降溫' : '升溫'
      alerts.push(`⚠️ ${direction}注意: 與昨日差 ${diff.toFixed(1)}°C`)
    }
  }

  // 日夜溫差 >= 7°C
  const dayNightDiff = tomorrow.maxT - tomorrow.minT
  if (dayNightDiff >= 7) {
    alerts.push(`⚠️ 日夜溫差大: 差 ${dayNightDiff.toFixed(1)}°C`)
  }

  return alerts
}
```

### 天氣 Emoji

可以根據天氣描述，自動配上對應的 Emoji。

先參考[CWA Opendata 文件](https://opendata.cwa.gov.tw/dist/opendata-swagger.html)中所有可能的天氣描述，再建立對應表

## 本地開發

專案使用 Node.js 20 的 `--env-file` 功能載入環境變數：

```bash
# 複製範例環境變數
cp .env.example .env
# 填入你的 API keys

# 執行
npm run dev
```

零依賴的好處是: clone下來直接就能跑，不需要 `npm install`

## 成果

設定完成後，如果明天天氣需要注意，Telegram 就會收到像這樣的通知:

```
中正區明日天氣 (03/18)

⛅ 天氣預報: 多雲時晴 14~22°C
⚠️ 日夜溫差大: 差 8.0°C
```

沒有警報的日子就安安靜靜，不會被打擾😎

一開始在發想這個題目時，還以為需要用到AI做分析，甚至要蒐集更多資料才能判斷；但實作過程中，反而是不斷把事情簡化，最後用很單純的規則就解決了問題

其實回頭看，生活中有不少小事都可以被這樣自動化處理，不一定要複雜的技術，重點是先動手做出第一個能用的版本

當你開始做了第一個 Bot，接下來很自然就會想到：哪裡是不是還可以再做，讓日常再輕鬆一點

---

參考資料：

- [CWA 開放資料平台](https://opendata.cwa.gov.tw/)
