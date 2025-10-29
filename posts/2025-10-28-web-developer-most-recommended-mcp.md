---
date: 2025-10-28
title: 網頁開發MCP工具 三件套： Context7、Chrome DevTools MCP、GitHub MCP
category: 技術
tags:
  - MCP
  - Claude Code
description: MCP 是統一 AI 助理與外部工具的新協議。本文介紹三款網頁開發者必裝的 MCP server：Context7、Chrome DevTools MCP、GitHub MCP，讓你的 AI 助理能查文件、除錯、看 Git 差異，全方位升級開發體驗。
---

## 什麼是MCP

原本AI只能透過使用者給資料、網路爬取之類方法，來拿到真實且即時的資料

Model Context Protocol，是Anthropic推出的協議，目的是為了統一AI助理與其他工具的接口，它是為了讓模型安全、結構化地取得外部上下文／工具能力的通用協議

從這個協議出現以後，各家工具、服務便開始打造以MCP為接口的server，讓你的AI助理能即時使用這些服務

本文列出我認為網頁開發必備的MCP server三件套

## context7

使用AI助手時，如果沒特別指定版本，有時會遇到生成了錯誤或過時的語法、API

例如tailwind css 3.x跟4.x，看起來寫法差不多，但還是存在相當多不相容的語法

遇到這類問題，我們可以通常會讓AI直接去爬原始的網頁文件，可是各個文件都要找到各自的官網，能不能再簡單一點呢？

Context7 主要解決版本文件查詢與快速對照問題，能讓助理在產生程式碼前先參考指定版本的官方文件。支援的文件列表可以參照[context7官網](https://context7.com/)，甚至還有排名可以看

<ModalImage
  src="/2025-10-28-web-developer-most-recommended-mcp/img01.png"
  caption="context7官網"
/>

有些IDE可以直接安裝，這裡提供Claude Code加入context7官方的MCP server的方法，如此一來可以不需要在本地啟動MCP

### 安裝

在終端機執行以下指令(claude版本: `2.0.27`)

```bash
# --scope user這樣會以用戶級別加入 就不需要每個專案都寫
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
```

官方文件有提到需要帶`CONTEXT7_API_KEY`，目前使用是正常，但也許有一天會失效，到時需要去官網註冊&申請

接著在各個專案加入記憶: 執行任務前，用context7 MCP 去找`XX`文件的`YY`版本

之後就會自動先看過文件了

## chrome-devtools-mcp

如果我們在架設網站時，要觀察修改後的變更，可以在在本地啟動dev server，如果你的開發工具支援hot reload，即時的變更還能直接反應出來

那AI要怎麼知道程式跑起來是怎樣呢？

Chrome DevTools MCP 直接與 Chrome DevTools Protocol 結合，能讓助理取得更細緻的瀏覽器資料（網路請求、Performance profiler、Coverage 等），非常適合做效能追蹤或複雜 UI 偵錯

過去有兩個方法:

1. [browsermcp](https://docs.browsermcp.io/):

透過安插在瀏覽器的套件，AI助理可以操作網頁、截圖等，來確認網頁的變化

我自己用過一陣子，有些差異似乎是沒辦法確認到的，例如過渡、動畫、元素的詳細屬性等等

2. [PlayWright](https://github.com/microsoft/playwright-mcp):

能以程式化方式操作瀏覽器並回傳結構化結果

很棒，功能完整，但比起chrome-devtools-mcp，少了性能分析功能

### 安裝

在終端機執行以下指令(claude版本: `2.0.27`)

```bash
# --scope user這樣會以用戶級別加入 就不需要每個專案都寫
claude mcp add --scope user chrome-devtools npx chrome-devtools-mcp@latest
```

注意，要在Node.js v20.19或更高版本才可以啟動

這樣AI助理就獲得了操作chrome的能力了，給他的要求會另開一個無痕的chrome去執行

除了除錯以外，也可以叫他測試流程等等的是否正常，遇到帳號密碼可以給AI代理帳密(提醒: 永遠不要給正式環境的資料)，他也可以做到自動登入等等的動作

但若是recaptcha這種阻擋機器人的就無法了

## github-mcp-server / GitKraken MCP

過去做code review時，你可能讓AI代理用git指令去爬commit，diff之類的操作

現在你可以透過GitHub MCP/GitKraken MCP讓他更強大(讓自己更懶): 原本你可能要用指令整理多個commit的內容，現在直接叫他爬兩個分支的差即可

透過這些MCP，助理可以查 commit、分支 diff、PR 資訊，省去手動整理多個 commit 的麻煩

在處理一些跨專案的問題，也可爬取其他專案的內容

### 安裝

在終端機執行以下指令(claude版本: `2.0.27`)

```bash
# --scope user這樣會以用戶級別加入 就不需要每個專案都寫
# $YOUR_GITHUB_TOKEN 要到github後台去生成
claude mcp add --scope user --transport http github -s user https://api.githubcopilot.com/mcp -H "Authorization: Bearer YOUR_GITHUB_TOKEN"
```

若你是用VS code + copilot的話，安裝GitLens插件他會帶有一個GitKraken MCP，也是一個簡單的方案

<ModalImage
  src="/2025-10-28-web-developer-most-recommended-mcp/img02.png"
  caption="GitKraken MCP"
/>

---

參考資料：

- [context7](https://context7.com/)
- [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [AI 代理程式適用的 Chrome 開發人員工具 (MCP)](https://developer.chrome.com/blog/chrome-devtools-mcp?hl=zh-tw)
- [github-mcp-server](https://github.com/github/github-mcp-server)
