---
date: 2026-08-07
title: 使用 claude -p 在 Codex 呼叫 Claude Code
category: 技術
tags:
  - Claude Code
  - Codex
  - AI
  - 工作流
description: 介紹 Claude Code 的 claude -p 非互動模式，如何讓 Codex、Git Hook、GitHub Actions 與各種 Script 直接呼叫 Claude，打造 AI Agent 自動化工作流程。
meta:
  - property: og:image
    content: /2026-08-07-codex-call-claude-code-with-claude-p/cover.jpg
---

![Cover](/2026-08-07-codex-call-claude-code-with-claude-p/cover.jpg)

## 緣由

前一篇網誌[Claude Code + Codex Plugin：分攤用量、雙模型 Review](./2026-08-04-codex-plugin-for-claude-code.md)提到 OpenAI 推出了官方的 Codex Plugin，可以讓 Claude Code 呼叫 Codex，把部分工作委派出去

但反過來呢？

Codex 能不能呼叫 Claude Code？

答案是目前沒有官方支援

雖然目前沒有官方提供「Codex 呼叫 Claude Code」的整合，但其實只要使用`claude -p`，任何能執行 Shell Command 的工具，都可以把 Claude 當成一個可呼叫的能力。

## claude -p 是什麼？

平常使用 Claude Code，大多是進入互動介面後開始聊天、修改程式

而 -p（Prompt）則是一次性的非互動模式：

```shell
claude -p "請解釋這段程式碼"
```

[完整參數看文件](https://code.claude.com/docs/en/cli-usage)

執行完成後就會直接輸出結果，非常適合在這些場景：

- Script
- CI/CD
- Git Hook
- Shell Pipeline
- Agent Workflow

不用開啟互動介面，也不用人工操作

## claude -p 曾引發付費模式爭議

claude -p 原本就是 Claude Code CLI 提供的非互動模式，並直接使用 Claude Pro、Max 等訂閱方案的使用額度

今年 Anthropic 曾宣布，未來將把 claude -p、Agent SDK 與 GitHub Actions 等程式化使用方式，改為獨立的 Agent SDK Credit 計費，不再消耗訂閱額度。這項變更公布後，引起不少開發者反彈，因為許多人已經將 claude -p 整合進 CI/CD、Agent Workflow 與各種自動化流程

最終在正式實施前，Anthropic 宣布暫停這項變更。截至目前為止，claude -p 仍與過去相同，直接使用 Claude 訂閱方案的使用額度，官方表示會重新規劃方案，若未來有調整會提前公告

## 讓 Codex 呼叫 Claude

Codex CLI 可以執行 Shell Command，因此可以直接用類似這樣的提示詞：

```
完成功能後，請執行claude -p
查看目前 repository 的 git diff針對這次修改做Code Review

不要修改程式，只列出真正值得修正的問題

閱讀 Claude 的回覆後，再決定哪些地方需要修改
```

等於讓兩個不同模型互相檢查彼此的成果

## 做成 Codex Skill

如果不想每次都重新輸入一大段 Prompt，可以把這套流程做成 Codex Skill，之後只要叫 Codex 使用這個 Skill 即可

```md
# Claude Review

當需要第二模型檢查目前修改時：

1. 先確認目前 repository 有尚未提交的變更。
2. 執行：

git diff \
| claude -p \
 --model sonnet \
 --output-format text \
 --append-system-prompt "
You are a senior code reviewer.
Only report actionable issues.
Ignore formatting and style suggestions.
Do not modify the code.
" \
 "Review this git diff."

3. 閱讀 Claude 的回覆。
4. 自行判斷哪些建議合理，不要直接照單全收。
5. 若確實需要修改，再進行修正。
6. 修正後可再次執行 Claude Review 確認問題是否排除。
```

這份Review原則沒有寫得很清楚，需要加上你團隊的規則再做調整，否則也只會拿到較低品質的建議

## 不只在 Codex

claude -p 並不是 Codex 專屬

只要能執行 Shell Command，都可以呼叫 Claude

### Git Hook

Commit 前自動 Review：

`git diff --cached | claude -p "Review staged changes."`

### Shell Script

每天固定分析 Log：

`cat error.log | claude -p "找出今天最重要的問題"`

## 小結

claude -p最大的價值，不是在終端機少打一個指令，而是讓 Claude 從互動式聊天工具，變成可以嵌入任何 Workflow 的能力

無論是 Git Hook、CI/CD、Shell Script，甚至其他 AI Agent，都能把 Claude 視為一個可組合的元件，加入既有的自動化流程

---

參考資料：

- [Claude Code Docs: CLI reference](https://code.claude.com/docs/en/cli-usage)
- [Claude Code Docs: Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
