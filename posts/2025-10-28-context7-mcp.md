---
date: 2025-10-28
title: Claude Code 加入context7官方的MCP server
category: 技術
tags:
  - claude code
description: 使用AI助手時，如果沒特別指定版本，有時會遇到生成了錯誤或過時的語法、API。提供Claude Code加入context7官方的MCP server的方法。
---

## 問題敘述

使用AI助手時，如果沒特別指定版本，有時會遇到生成了錯誤或過時的語法、API

例如tailwind css 3.x跟4.x

這時我們可以讓AI直接去爬原始的文件

可是各個文件都要找到各自的官網，能不能再簡單一點呢？

Context7就是為了這種情境誕生的，支援的文件可以參照[context7官網](https://context7.com/)

## 如何解決

有些IDE可以直接安裝，這裡提供Claude Code加入context7官方的MCP server的方法，如此一來可以不需要在本地啟動MCP

在終端機執行以下指令(claude版本: `2.0.27`)

`claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp`

官方文件有提到需要帶`CONTEXT7_API_KEY`，目前使用是正常，但也許有一天會失效，到時需要去官網註冊&申請

這樣會以用戶級別加入，不需要每個專案都寫

接著在各個專案加入記憶: 執行任務前，用context7 MCP 去找`XX`文件的`YY`版本

之後就會自動先看過文件了

---

參考資料：

- [context7](https://context7.com/)
