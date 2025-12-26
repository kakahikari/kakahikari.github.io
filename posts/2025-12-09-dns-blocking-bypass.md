---
date: 2025-12-09
title: iOS如何解除DNS屏蔽 小紅書網頁版
category: 技術
tags:
  - iOS
description: 台灣近年利用 DNS 封鎖打擊詐騙網站，但也多次發生誤鎖事件，凸顯 DNS RPZ 的侷限性。由於 DNS 封鎖可輕易繞過，文中整理四種常用方式：更換 DNS、啟用 iCloud+ 私密傳送、使用 Cloudflare WARP、或透過可信賴的 VPN。讀者可依自身需求選擇更安全、隱私的上網方式。
meta:
  - property: og:image
    content: /2025-12-09-dns-blocking-bypass/cover.jpg
---

## 問題敘述

近年來，詐騙網站盛行，警政署有個做法就是將詐騙網站的網域直接封鎖。原理只是透過DNS頻蔽([DNS RPZ](https://rpz.twnic.tw/))，如此一來，會被詐騙的對象便不容易直接進入目標網站而受害

但這些年來，這作法還是存在過瑕疵跟爭議，例如誤鎖:

- [刑事局封鎖涉毒網址轉檔作業出包，Azurewebsites.net根網域遭屏蔽近2小時，連TWNIC公文系統都被封](https://www.ithome.com.tw/news/170025)
- [wordpress 在台灣變詐騙網站了？](https://kheresy.wordpress.com/2024/04/11/wordpress-block-by-npa/)

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/cover.jpg"
  caption="此網域已被屏蔽"
/>

DNS屏蔽的做法，不是什麼難以破解的技術，簡單地透過修改DNS設定，就可以*否定*政府的封鎖，當然所有後果得自行承擔囉。

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/img01.jpg"
  caption="被封鎖的小紅書"
/>

### 小紅書為何被禁？

經國家安全局的資安審查，發現小紅書存在以下問題

- 蒐集位置、通訊錄、剪貼簿、截圖
- 讀取裝置上儲存空間
- 過度填寫個資
- 過度要求權限
- 強迫同意不合理隱私條款
- 未充分保障個資權利
- 未啟動時上傳非必要個資
- 逕向第三方軟體開發套件SDK共享個資
- 封包有無導向中國境內位置
- 蒐集程式清單
- 蒐集設備參數
- 蒐集臉部資訊

行政院已透過海基會發函小紅書母公司中國行吟信息科技有限公司，提出具體改善作為、限期20天內回覆，但迄今仍無收到任何回應，即起根據《詐欺犯罪危害防制條例》，發布網路停止解析及限制接取的命令，暫定1年。

## 如何解決

### 方法 1. 修改DNS伺服器

環境: iOS 26.1

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/img02.jpg"
  caption="打開設定，選擇Wi-Fi"
/>

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/img03.jpg"
  caption="在你連線的Wi-Fi裡，選擇i圖案來修改設定"
/>

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/img04.jpg"
  caption="DNS，點選設定DNS"
/>

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/img05.jpg"
  caption="改為手動，並加入伺服器"
/>

伺服器可以選擇以下國際伺服器

- Google Public DNS: 8.8.8.8
- Cloudflare: 1.1.1.1

### 方法 2. iCloud+ 私密傳送

若你的帳號有訂閱iCloud+，可使用私密傳送功能

> 「私密轉送」也會加密從裝置傳出的未加密流量以及對「網域名稱伺服器」（DNS，將網站名稱轉換成網際網路通訊協定 [IP] 位址的系統）的查詢，進一步保護你的隱私權。

打開設定 > iCloud > 私密傳送

把開關打開就可以啦

### 方法 3. Cloudflare WARP

Cloudflare WARP 的核心目的，就是讓你的上網連線更安全、不被中間人窺探，它不是傳統 VPN，不會幫你跨區、換 IP，而是透過 Cloudflare 的網路幫你加密與優化流量

到 App Store 搜尋：1.1.1.1: Faster & Safer Internet

<ModalImage
  src="/2025-12-09-dns-blocking-bypass/img06.jpg"
  caption="下載後，開啟App，打開就可以啦"
/>

### 方法 4. VPN

透過VPN，你可以連線至其他國家的節點當作跳板，自然就不會受到政府的限制囉

但要注意：作為跳板可是可以得到你的全部傳送資料唷，甚至可能出售你的數據作為收入來源

建議挑選一個值得信賴的付費VPN
