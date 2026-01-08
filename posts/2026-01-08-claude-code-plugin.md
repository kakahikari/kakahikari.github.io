---
date: 2026-01-08
title: Claude Code Plugins 是什麼？用插件化方式統一 AI 開發流程與團隊協作
category: 技術
tags:
  - Claude Code
description: Claude Code Plugins 是一套可擴充的插件系統，能將 Slash Commands、子代理、MCP Servers、Hooks 等配置打包成插件，支援官方與自訂市集，讓個人與團隊用不到 10 秒複製完整工作流程，解決配置分散與協作標準化的痛點。
---

## 什麼是Claude Code Plugins

Claude Code Plugins 是 Claude Code 的擴充功能系統，讓你能為 Claude Code 增加額外的工具和能力

允許加入marketplace，他可以在一個自訂的git repo，也就是對外可以公開，對內可以為團隊創建一個共用的市集

Claude Code Plugins 主要解決這些問題:

1. 配置分散管理的痛點
   Plugins 把平時散落在各處的個性化配置、腳本、自動化流程、子代理等全部統一封裝，一次性打包共享
   - Slash Commands
   - Sub Agents
   - MCP Servers
   - Hooks
   - Skills

2. 團隊協作的標準化難題
   過去每個開發者需要自己配置各種工具、命令、腳本、MCP 服務,團隊成員之間很難共享和統一這些配置。Plugins 讓你可以把這些流程與工具打包成一個插件，團隊成員「一鍵安裝」，不到 10 秒就能複製整個工作流程

## 怎麼用

打開你的Claude Code，輸入`/plugins`，預設會載入官方的市集，再依需求加入自訂的市集即可

## 哪些人用

### 適合

1. 有固定開發流程的個人開發者

   Plugins 很適合把這些一次封裝起來，換機器、重裝環境時不用重新設定

2. 有 AI 輔助開發需求的團隊

   對於團隊來說，Plugins 的價值會更明顯：

   新成員可以快速對齊既有開發流程、不用每個人各自調教 Claude、可以把「怎麼用 AI 工作」變成團隊共識，而不是口頭教學

   特別適合有 Code Review、DevOps、自動化流程 的團隊

3. 想把 AI 使用方式產品化、流程化的人

   如果你已經不只是「聊天寫程式」，而是：

   把 Claude 當成工具鏈的一環、希望 AI 能在特定時機自動做特定事情

   那 Plugins 會是很自然的一步

### 不適合

1. 偶爾才用 Claude Code 的使用者、不需要共享或標準化流程的情境

2. 還在探索「怎麼用 AI 寫程式」的新手

## 總結

目前還在試用中，未來會再更新上心得

---

參考資料：

- [Claude Code Docs](https://code.claude.com/docs/zh-TW/plugins)
