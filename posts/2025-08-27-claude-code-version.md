---
date: 2025-08-27
title: 解決claude code版本卡在舊版
category: 除錯
description: 分享解決 Claude Code 版本更新問題，包括處理「Another instance is currently performing an update」錯誤，以及 pnpm 套件管理的注意事項。
tags:
  - claude code
---

# 解決claude code版本卡在舊版

## 問題敘述

原本claude code有設定statusline功能，一次重開之後，發現statusline不見了

使用指令 `claude --version` ，發現退回了一個很早期的版本

執行 `claude update` 則出現以下錯誤

```
Current version: 1.0.35
Checking for updates...
New version available: 1.0.93 (current: 1.0.35)
Installing update...
Using global installation update method...
Error: Another instance is currently performing an update
Please wait and try again later
```

## 如何解決

「Another instance is currently performing an update」這問題嘗試用 `ps aux | grep claude` 、 `killall claude` 嘗試找出背景是否有執行，都沒法解決，根本不知道實際原因為何

我是安裝在pnpm上，完整移除再重新安裝後，就解決了

安裝時發現npm上套件的路徑有變，推測pnpm沒辦法抓到套件的最新版本，而使用了本地的快取版本
