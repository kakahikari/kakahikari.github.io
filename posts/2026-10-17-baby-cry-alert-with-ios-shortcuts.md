---
date: 2026-10-17
title: 用閒置的 iOS 設備 設置寶寶哭哭警報器
category: 智慧家庭
tags:
  - iOS
  - Telegram
description: 把閒置的 iPhone 或 iPad 放在嬰兒房，用 iOS「聲音辨識」偵測嬰兒哭聲，再透過捷徑自動化直接呼叫 Telegram Bot，把通知傳到家人群組。
meta:
  - property: og:image
    content: /2026-10-17-baby-cry-alert-with-ios-shortcuts/cover.jpg
---

家裡是否有嫩嬰，必須要 24h 在他旁邊，只因為擔心他哭哭？

只要家裡有閒置的 iOS 設備，搭配「捷徑」的自動化，偵測到嬰兒哭聲就可以發送訊息到 Telegram 的特定群組裡！

這套流程是讓照顧者在別的房間時用的，總會有需要暫時離開的時候，例如在廚房煮飯、上個廁所輕鬆一下，隔了一點距離就聽不到小孩在哭

但又也不想一直盯著監視器畫面，如果靠手機通知，比較能即時發現寶寶哭了！

![寶寶哭哭警報器的運作流程示意：iPad 聲音辨識到嬰兒哭聲，觸發捷徑自動化取得 URL 內容，由 Telegram Bot 發送群組通知](/2026-10-17-baby-cry-alert-with-ios-shortcuts/alert-flow.png)

整個流程分成三段：

1. iOS 的「聲音辨識」聽到嬰兒哭聲
2. 「捷徑」的自動化被觸發，用「取得 URL 內容」呼叫 Telegram Bot API
3. Telegram Bot 把訊息傳到家人群組

## 事前準備

- 一台閒置的 iPhone 或 iPad，放在嬰兒房並接上電源
- Telegram 帳號，以及一個要接收通知的群組

## 建立 Telegram Bot 與群組

通知是由 Telegram Bot 發出的，所以要先準備一隻 Bot，並把它加進家人群組，再取得兩個值：

- **Token**：Bot 的金鑰，向 @BotFather 申請 Bot 時取得
- **Chat ID**：群組的識別碼，透過 `getUpdates` 查詢

申請 Bot 與查詢 Chat ID 的步驟，可以參考之前的文章〈[把 GitHub Actions 的部署結果丟進 Telegram 集中接收](./2026-01-30-telegram-message-notify.md#申請telegram-bot)〉。

Token 等於這隻 Bot 的密碼，拿到的人就能用它發訊息，記得妥善保存，不要貼到公開的地方。

## 手機、平板設置

### 聲音辨識是什麼？

iOS 的「聲音辨識」可以持續聆聽周遭的特定聲音，例如門鈴、警笛聲或嬰兒哭聲，辨識到時發出通知。

設定路徑在 **設定 > 輔助使用 > 聲音與姓名辨識 > 聲音辨識**：

1. 開啟「聲音辨識」，第一次開啟時可能要等設備下載聲音模型

   ![聲音辨識設定頁，已開啟聲音辨識，下方「聲音」可選擇要辨識的聲音](/2026-10-17-baby-cry-alert-with-ios-shortcuts/settings-sound-recognition.png)

2. 點「聲音」，在「人物」分類開啟「嬰兒哭聲」

   ![聲音清單的人物分類，嬰兒哭聲為開啟，咳嗽與大喊聲為關閉](/2026-10-17-baby-cry-alert-with-ios-shortcuts/settings-sounds-baby-crying.png)

### 捷徑 -> 自動化

不過我們這裡是要用「捷徑」中的「自動化」功能，目標是聲音辨識的條件發生時，透過「自動化」呼叫 Telegram Bot API，由 Bot 發出通知。

1. 打開「捷徑」App，切到「自動化」，新增自動化操作
2. 觸發條件往下找到「聲音辨識」

   ![捷徑新增自動化的觸發條件清單，最下方有「聲音辨識」](/2026-10-17-baby-cry-alert-with-ios-shortcuts/shortcuts-trigger-sound-recognition.png)

3. 「聲音」選擇「嬰兒哭聲」，並選「立即執行」，按「下一步」

   如果還沒在「設定」開啟聲音辨識，這裡會像下圖一樣無法選擇聲音，要先回到上一段完成設定。

   ![尚未啟用聲音辨識時，捷徑的聲音辨識觸發條件提示要先到「設定」App 啟用](/2026-10-17-baby-cry-alert-with-ios-shortcuts/shortcuts-sound-recognition-disabled.png)

4. 動作選擇「取得 URL 內容」，依下面設定：
   - 網址：`https://api.telegram.org/bot<TOKEN>/sendMessage`，`<TOKEN>` 換成 BotFather 給的 Token
   - 方式：`POST`
   - 要求內文：`JSON`，用「加入新欄位」新增兩個「文字」欄位
     - `chat_id`：群組的 Chat ID
     - `text`：要發送的訊息，例如「👶 寶寶哭哭警報」

   ![捷徑的「取得 URL 內容」動作，網址為 Telegram Bot API 的 sendMessage，方式 POST，JSON 內文有 chat_id 與 text 兩個欄位](/2026-10-17-baby-cry-alert-with-ios-shortcuts/shortcuts-get-contents-of-url.png)

[Telegram Bot API](https://core.telegram.org/bots/api#making-requests) 也接受 GET 和網址參數，不過訊息有中文和表情符號，用 JSON 內文就不用處理網址編碼，設定起來比較直覺。

## 測試

在捷徑編輯畫面按右下角的播放鍵，可以先手動執行一次，確認 Telegram 群組有收到訊息，代表 Token 和 Chat ID 都設定正確。

接著在設備旁播放一段嬰兒哭聲的影片或音檔，確認自動化有被觸發，群組收到「寶寶哭哭警報」。

### 實際使用心得

- 從寶寶哭到群組收到通知，大概只延遲幾秒鐘
- 設備在鎖定畫面時也能正常觸發，不用一直開著螢幕
- 有時候太過敏感，小孩只是在鬧脾氣也會被判斷成哭聲，通知偶爾會比預期多一點

## 注意事項

- Apple 官方提醒：在可能受傷、高風險或緊急的情況下，[不要依賴 iPhone 來辨識聲音](https://support.apple.com/zh-tw/guide/iphone/iphf2dc33312/ios)。這套警報器適合當作輔助，不能取代大人照顧或專用的嬰兒監視器
- 聲音辨識需要持續聆聽，設備請保持接電，放在聽得到寶寶但不會被碰到的位置
- 通知要經過網路才會送達，Wi-Fi 斷線或 Telegram 服務異常時就收不到
- Bot Token 直接存在捷徑裡，分享這個捷徑給別人前要先刪掉 Token；萬一外流，到 BotFather 重新產生一組

---

參考資料：

- [使用 iPhone 來辨識聲音 - Apple 支援](https://support.apple.com/zh-tw/guide/iphone/iphf2dc33312/ios)
- [iPhone 或 iPad 上「捷徑」中的事件觸發器 - Apple 支援](https://support.apple.com/zh-tw/guide/shortcuts/apd932ff833f/ios)
- [Telegram Bot API - Making requests](https://core.telegram.org/bots/api#making-requests)
- [Telegram Bot API - sendMessage](https://core.telegram.org/bots/api#sendmessage)
