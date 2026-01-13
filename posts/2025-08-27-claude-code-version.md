---
date: 2025-08-27
title: 解決claude code版本卡在舊版
category: 除錯
description: 分享解決 Claude Code 版本更新問題，包括處理「Another instance is currently performing an update」錯誤，以及使用 npm 或 pnpm 套件管理的移除指令。
tags:
  - Claude Code
  - AI
---

## 問題敘述

原本claude code有設定statusline功能，一次重開之後，發現statusline不見了

使用指令`claude --version`，發現退回了一個很早期的版本

執行`claude update`則出現以下錯誤

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

```
pnpm -g uninstall @anthropic-ai/claude-code
```

或者是安裝在全域的npm

```
npm -g uninstall @anthropic-ai/claude-code
```

不知道安裝在哪的話，執行以下指令來確認路徑

```
which claude
```

安裝時發現npm上套件的路徑有變，推測pnpm沒辦法抓到套件的最新版本，而使用了本地的快取版本

---

更新：後來的版本執行`claude update`指令已經會提示重複安裝的問題了，並且也會自動解決

```
Current version: 2.0.61
Checking for updates...

Warning: Multiple installations found
- npm-global at /Users/user_name/.nvm/versions/node/v18.20.4/bin/claude
- native at /Users/user_name/.local/bin/claude (currently running)

Warning: Leftover npm global installation at /Users/user_name/.nvm/versions/node/v18.20.4/bin/claude
Fix: Run: npm -g uninstall @anthropic-ai/claude-code
Successfully updated from 2.0.61 to version 2.0.65
```

若是執行`claude update`也遇到

```
Current version: 2.0.76
Checking for updates...
Another Claude process is currently running. Please try again in a moment.
```

因為系統檢查到有進程被中斷了，所以就嘗試移除了所有鎖住的文件`rm -rf ~/.local/state/claude/locks/`

再執行`claude update`就可以更新了
