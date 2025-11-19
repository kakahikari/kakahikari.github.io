---
date: 2025-11-19
title: macOS 系統資料異常變大？教你快速找出佔用空間的原因與解法
category: 除錯
tags:
  - macOS
description: 教你在 macOS 中分析「系統資料」異常變大的原因，透過 Finder 顯示所有資料夾大小，找出佔空間的來源。
meta:
  - property: og:image
    content: https://kakahikari.me/2025-11-19-macos-system-data-storage-too-large-fix/cover.jpg
---

## 問題敘述

發生環境: macOS 26.1

<ModalImage
  src="/2025-11-19-macos-system-data-storage-too-large-fix/img01.png"
  caption="系統資料太大"
/>

## 如何解決

### Step 1. 重新開機

首先，先嘗試重開電腦，讓系統自動釋放那些被放到快取的資料

重新開機後檢查「系統資料」所佔的區塊是否還是一樣

若是則繼續尋找原因

### Step 2. 依檔案大小找出可能的原因

開啟Finder，在頂部「前往」選單裡，按下鍵盤Option鍵，會出現隱藏的「資源庫」，打開他

開啟了資源庫的視窗後，在頂部「顯示方式」選單裡，點擊「打開顯示方式選項」（或按下鍵盤command + J）

<ModalImage
  src="/2025-11-19-macos-system-data-storage-too-large-fix/img02.png"
  caption="顯示方式選項彈窗"
/>

排序方式選擇「大小」，並勾選「計算所有大小」，資料夾也記得切成清單檢視

這時候系統會計算大小，應該會花上幾分鐘時間

<ModalImage
  src="/2025-11-19-macos-system-data-storage-too-large-fix/img03.png"
  caption="依大小排序後的資源庫"
/>

各資料夾列出了大小後，再對那些異常大的資料夾去檢查是否是正常的情況吧！**不要亂刪這邊的檔案，可能會導致系統異常唷！**

以我這台狀況：Containers資料夾過大，我就進去這資料夾內，再次用檔案大小排序，發現問題是docker、notion

### 清除docker暫存

執行了以下指令，清出了`30GB`

```
docker container prune
docker system prune
docker image prune
docker volume prune
```

### 清除Notion本地暫存

執行了以下動作

開啟Notion，在頂部「Help」選單裡選擇「Troubleshooting」，選擇「Clear Cache and Restart」

---

參考資料：

- [Why is system data taking up so much space and how can I clear it out? I don't have time machine backups](https://www.reddit.com/r/MacOS/comments/15p6fpc/why_is_system_data_taking_up_so_much_space_and/)
- [Docker takes up 1.1 TB of storage on Mac](https://www.reddit.com/r/docker/comments/1iotce4/docker_takes_up_11_tb_of_storage_on_mac/)
