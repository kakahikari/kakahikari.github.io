---
date: 2025-09-08
title: 最簡單的智慧家電 - 把飛利浦WiZ智慧燈泡串進Home Assistant吧
category: 智慧家庭
tags:
  - Home Assistant
description: 智慧家庭不知道從哪裡開始？先試試智慧燈泡！安裝簡單、效果明顯，能馬上感受到智慧家電的便利，還能輕鬆擴充到 Home Assistant 與手機快捷控制。
meta:
  - property: og:image
    content: https://kakahikari.github.io/2025-09-08-wiz-smart-lights/cover.jpg
---

# 最簡單的智慧家電 - 把飛利浦WiZ智慧燈泡串進Home Assistant吧

看完了[Home Assistant 串起智慧家庭](./2025-08-06-home-assistant.md)的介紹，或許你已經對各種智慧家庭的場景有了概念。不過，真正要開始動手時，卻還是不知道該從哪裡著手。

別擔心，讓我們從最簡單、最直觀的智慧燈泡開始吧！

## 為什麼建議從智慧燈泡下手？

1. 低門檻、低成本：入門價格比智慧開關、掃地機器人低，甚至只要一顆燈泡就能體驗智慧家電的便利
2. 家裡一定能找到適合的燈泡場景：天花板、玄關、檯燈、小夜燈…
3. 不影響原有使用方式：家人還是可以照常用牆壁開關，智慧控制是額外加分，不會造成不便
4. 容易擴充：從一顆燈泡開始，之後可以慢慢增加，逐步建構出更大的智慧家電系統

## 為什麼選擇WiZ？

1. 不需要額外的網關：只要有Wi-Fi就可以連線
2. 相容性高：與Home Assistant高度整合
3. 價錢親民

## 目標

這篇文章的目標，是幫助你先讓燈泡連上WiZ App，用WiZ App 控制燈泡，再接入Home Assistant，最後搭配iOS的小工具，做到就算沒打開APP 也能用手機快速控制開關。

![Cover](/2025-09-08-wiz-smart-lights/cover.jpg)

# 開始

以官網上的`WiZ LED可調色溫嵌燈7W 9cm`為例

![WiZ LED可調色溫嵌燈7W 9cm](/2025-09-08-wiz-smart-lights/img01.jpg)

## 配對

避免搞不清楚哪個燈是哪個（像是我一次入手了很多燈泡），建議是先在方便插電的地方配對完成再安裝上去。

### Step 1. 下載WiZ App

燈泡的說明書上會有下載連結，或者在App store, Google play搜尋。

下載後照著App說明操作，通常會需要登入WiZ帳號（這能讓你透過WiZ網路，遠端遙控燈具）、設定房間與成員。由於我們未來要透過Home Assistant操作，所以這裡只需要先把房間分好即可。

### Step 2. 將智慧燈泡通電、配對

![WiZ App 出現找到設備](/2025-09-08-wiz-smart-lights/img02.jpg)
手機開著App，並且將智慧燈泡通電，這時App應該要自動出現「找到設備 點擊此處開始配對您的設備」的提示。

![WiZ App 選擇設備](/2025-09-08-wiz-smart-lights/img03.jpg)
點擊後會要你選擇要配對哪個設備，建議一個一個配對上，並且可以做編號在紙膠帶上，貼在燈泡上用來識別。

![WiZ App 選擇房間](/2025-09-08-wiz-smart-lights/img04.jpg)
接著選擇前面提到的房間，WiZ的App可以一次對整個房間的燈泡開關或調整亮度之類。

剛剛如果沒建立房間的話，也可以在這步驟建立。

![WiZ App 輸入WiFi名稱和密碼](/2025-09-08-wiz-smart-lights/img05.jpg)
接著App會將你手機連上的WiFi內容給自動帶入，他會將這資訊透過藍牙傳給智慧燈泡，這樣智慧燈泡就算是真正連網了。

但要注意如果你的WiFi有支援雙頻道（例如`2.4GHz`+`5GHz`），你要輸入的資訊是`2.4GHz`的名稱跟密碼，輸入到`5GHz`的是無法連上的。

按照官網說明，WiZ燈具的連線條件如下：

- 2.4GHz Wi-Fi，b/g
- WPA-2 個人防護
- Wi-Fi 網路必須設定密碼

### Step 3. 接入Home Assistant

::: info
到這步以後，我先預設你已經在家裡安裝了Home Assistant，但在我的教學裡還沒有寫到如何部署Home Assistant，敬請期待！

先做好前面的步驟，後續再接入也是可以的。
:::

這時打開你的Home Assistant，他應該會自動找到WiZ智慧燈泡，並跳出是否要加入設備的提示，依照提示依序將他們加入就行了，*強烈建議*名稱設定的跟WiZ內的一樣，否則容易搞混。

## 安裝

### Step 4. 將智慧燈泡安裝到燈座上

終於把WiZ App、Home Assistant都設定完了，這時候再一次把設備插入燈座，你就不用上上下下爬來爬去。

![WiZ App 操作智慧燈泡](/2025-09-08-wiz-smart-lights/img06.jpg)
將每個燈配對完成後，先嘗試用WiZ App去操作開關、亮度吧。

因為前面的步驟有設定了房間，也可以點擊房間來一次操作整個房間的燈。

## 加入iOS小工具

### Step 5. 在Home Assistant群組化

雖然在WiZ App裡面已經可以依照房間去開關燈，那在Home Assistant要怎麼做呢？

Home Assistant也是有房間的，但我先介紹比較容易懂的群組化：

![HA設定選單](/2025-09-08-wiz-smart-lights/img07.jpg)
進入Home Assistant，到設定裡找到`裝置與服務`。

![HA新增輔助工具](/2025-09-08-wiz-smart-lights/img08.jpg)
找到`新增輔助工具`。

![HA群組](/2025-09-08-wiz-smart-lights/img09.png)
會跳出彈窗，選項實在太多了，搜尋`群組`。

![HA燈光群組](/2025-09-08-wiz-smart-lights/img10.png)
新增群組中，找到`燈光群組`。

![HA群組設定1](/2025-09-08-wiz-smart-lights/img11.png)
群組會詢問要加入哪些實體，我這個例子是在`客廳燈`群組，加了兩個智慧燈泡：`客廳燈1`、`客廳燈2`。

![HA群組設定2](/2025-09-08-wiz-smart-lights/img12.png)
新增群組可以額外設定標籤、前面提到的房間等等，若不熟悉可以先跳過。

![HA群組設定3](/2025-09-08-wiz-smart-lights/img13.png)
最後確認沒問題，就設定完成了。

做到這邊已經可以透過群組，在Home Assistant內一次調整群組開關、亮度等等，達到跟WiZ App差不多的功能。

那為什麼要大費周章在HA達到跟原本App差不多的功能呢？當你有多套智慧燈泡時，就能直接在 HA 裡一次群組操作，而不需要逐一打開App操作。

當你接入越多系統、裝置時，HA的價值才會發揮得越多唷！

### Step 6. 在iOS Home Assistant設定小工具

![HA設定選單2](/2025-09-08-wiz-smart-lights/img14.jpg)
打開iOS HA的App，到設定裡找到`小工具`。

![HA新增小工具](/2025-09-08-wiz-smart-lights/img15.jpg)
選擇`新增小工具`。

![HA新增小工具2](/2025-09-08-wiz-smart-lights/img16.jpg)
接著會跳出選擇實體，這時候選擇前面建立的`群組`，其他設定可先不動。

![HA新增小工具3](/2025-09-08-wiz-smart-lights/img17.jpg)
因為我創了多個群組，一個小工具內也可以放多個群組，上面就是小工具的預覽畫面了，可以拖拉項目去自動排版。

### Step 7. 在iOS新增小工具

![iOS新增小工具](/2025-09-08-wiz-smart-lights/img18.jpg)
小工具建立成功後，在桌面新增小工具，選擇Home Assistant，就會出現`自訂小工具`的選項了，這樣就可以不進入App直接開關燈了！

同樣邏輯，iOS控制中心的按鈕、apple watch、car play也可以設定開關唷。

---

參考資料：

- [居家 | 適用於日常生活的智慧型照明 | WiZ TW](https://www.wizconnected.com/zh-tw)

- [WiZ 智慧照明全系列 飛利浦照明品牌官方網站](https://www.philips-lighting.com.tw/collections/philips-smart-led)
