---
date: 2026-08-04
title: Claude Code + Codex Plugin：分攤用量、雙模型 Review
category: 技術
tags:
  - Claude Code
  - Codex
  - AI
  - 工作流
description: 介紹如何在 Claude Code 安裝 OpenAI 官方 Codex Plugin，包含使用者層級安裝、環境檢查、模型設定、Review 指令與使用情境，並分享利用 Claude 與 Codex 雙模型協作進行程式碼審查的實際做法。
meta:
  - property: og:image
    content: /2026-08-04-codex-plugin-for-claude-code/cover.jpg
---

![Cover](/2026-08-04-codex-plugin-for-claude-code/cover.jpg)

## 緣由

如果你平常使用 Claude Code，又希望把部分工作交給 Codex 執行，OpenAI 官方推出的 openai/codex-plugin-cc 可以直接把 Codex 整合進 Claude Code

這篇會介紹安裝方式、環境確認、模型設定，以及實際有哪些指令可以使用

我一直是 Claude Code 的重度使用者，但工作愈丟愈多之後，用量也跟著往上衝

公司有提供Copilot訂閱，原本主力用它來做code review，但7月價錢大調整後，已經不是首選，只好考慮來多訂個Codex

OpenAI 官方推出的 `openai/codex-plugin-cc`，讓 Claude Code 可以直接呼叫 Codex，把一部分實作工作丟給 Codex 處理，分攤原本全部壓在 Claude 身上的用量

多訂一份的另一個好處，是讓 Claude 呼叫 Codex 來做 review，等於是兩個不同家的模型互相檢查彼此的實作與盲點，比單一模型自己審查自己寫的程式碼要可靠一些

## 直接交給 AI 安裝

如果你已經在使用 Claude Code，其實不用自己手動輸入安裝指令，直接請 Claude 幫你安裝即可

例如可以這樣下：

```
請幫我安裝 OpenAI 官方的 Codex Plugin 到 Claude Code

需求：

- 安裝 openai/codex-plugin-cc
- 安裝到 user scope，不是 project scope
- 安裝完成後確認 plugin 已啟用
- 如果缺少 Codex CLI 或尚未登入，請引導我完成安裝與登入
- 最後執行 setup，確認環境可以正常使用

```

如果已經知道想安裝到所有專案，也可以更簡短：

幫我把 OpenAI Codex Plugin 安裝到 Claude Code，使用 user scope，安裝完成後確認可以使用

Claude 通常會自動執行對應的 claude plugin 指令，若需要登入 Codex 或安裝額外套件，也會一步步提示你完成

我自己現在幾乎都不會特地去背這些 CLI 指令，需要安裝或更新 plugin 時，直接請 Claude Code 幫我完成即可。只有想了解底層做了哪些事，或需要寫成文件分享時，才會去查實際執行的指令

## 用 CLI 安裝到使用者層級

需求：

- ChatGPT 訂閱（含免費版）或 OpenAI API key，用量算在 Codex 額度裡
- Node.js ≥ 18.18
- 本機要裝好並登入 Codex CLI（`npm install -g @openai/codex`）

官方文件示範的是互動式指令：

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
```

不過 `claude` CLI 本身就有 `plugin` 子指令，可以用非互動的方式裝，而且預設 scope 就是 `user`：

```bash
# --scope user 代表套用到所有專案，不用每個 repo 各裝一次
claude plugin marketplace add openai/codex-plugin-cc --scope user
claude plugin install codex@openai-codex --scope user
```

裝完用 `claude plugin list` 確認：

```
❯ codex@openai-codex
  Version: 1.0.6
  Scope: user
  Status: ✔ enabled
```

裝好之後會多出這些指令：

| 指令                        | 用途                          |
| --------------------------- | ----------------------------- |
| `/codex:review`             | 一般 Code Review              |
| `/codex:adversarial-review` | 挑戰式 Review，質疑設計與實作 |
| `/codex:rescue`             | 委派修 Bug                    |
| `/codex:transfer`           | Session 轉移                  |
| `/codex:status`             | 查看背景任務                  |
| `/codex:result`             | 查看完成結果                  |
| `/codex:cancel`             | 取消背景任務                  |

## 用 /codex:setup 檢查環境

Plugin 提供 /codex:setup，會檢查：

- Node.js
- npm
- Codex CLI
- 登入狀態

如果缺少任何元件，也會提示如何安裝

我本機因為之前就裝過 Codex CLI 並登入過 ChatGPT 帳號，回傳直接是 `"ready": true`，不用再跑 `npm install -g @openai/codex` 或 `codex login`

如果你是第一次裝，`/codex:setup` 會自動偵測缺什麼，並在 npm 可用時主動問你要不要幫你裝

## 怎麼選 Codex 模型

裝好開始用之後，接著想知道：這個 plugin 底層呼叫的 Codex，可以指定用哪個模型嗎？

大部分情況下，只需要修改 ~/.codex/config.toml 即可；只有偶爾想換模型時，再用 `--model` 覆寫

### 全域預設

`~/.codex/config.toml` 裡的 `model` 欄位，會套用到所有透過 Codex CLI 執行的動作，包括這個 plugin：

```toml
model = "gpt-5.6-luna"
model_reasoning_effort = "max"
```

要改的話直接編輯這個檔案，或者：

```bash
codex -c model="你要的模型 id"
```

### 單次覆寫

`/codex:review`、`/codex:adversarial-review` 底層其實都吃 `--model` / `-m`，只是官方的 argument-hint 沒特別列出來：

```
/codex:review --model 你要的模型 id
```

`/codex:rescue` 這類委派任務的指令，則多支援一個 `--effort`：

```
/codex:rescue --model 你要的模型 id --effort high 修這個 bug
```

至於目前有哪些模型可選，直接跑 `codex --help` 或看 Codex 官方文件最準，模型迭代很快，寫死在這篇裡很快就過時了

---

參考資料：

- [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)
