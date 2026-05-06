---
date: 2026-05-06
title: 多 AI Agent 共存指南：AGENTS.md、CLAUDE.md 與 Skills 配置
category: 技術
tags:
  - AI
  - Claude Code
  - Codex
description: 在多 AI coding agent（Claude、Copilot、Codex、Gemini）並存的開發環境中，如何用 AGENTS.md 作為統一標準？本文整理 CLAUDE.md、skills 結構與 symlink 實務，提供一套可維護的多 Agent 工作流。
meta:
  - property: og:image
    content: /2026-05-06-multi-ai-agent-workflow-agents-md/cover.jpg
---

![Cover](/2026-05-06-multi-ai-agent-workflow-agents-md/cover.jpg)

## AGENTS.md是什麼

[AGENTS.md](https://agents.md/)用來作為統一的開源標準，可以將其理解為「專門寫給 AI Agent 看的 README」

這是[AAIF](https://aaif.io/)推動的標準，你不需要為每個AI工具寫一份規則，目標一個檔案通用所有Agent

截至 2026 年，AGENTS.md 是目前最接近「跨工具通用」的 AI coding agent 設定方式：Codex CLI、Copilot CLI、Gemini CLI、Visual Studio Code、Cursor都認得他(支援程度不一)

## CLAUDE.md是什麼

Claude Code專用，功能跟AGENTS.md大致相同

可參考[官方說明](https://code.claude.com/docs/zh-TW/memory)

## 多AGENT工作流(規範)

當你專案與其他人協作，不是每個人用的AGENT、IDE都是同一套配置。甚至你自己同時操作多個AGENT時，兩個不同的配置就變成問題

只維護通用性較高的`AGENTS.md`似乎比較有效率

有個通用的解法是：用`ln`指令產生符號連結(symlink)

```bash
ln -s AGENTS.md CLAUDE.md
```

但此做法會失去一些Claude的專用設定

目前我的解法是`CLAUDE.md`在git忽略，並在`CLAUDE.md`放以下內容作為開頭

```md
@AGENTS.md
@README.md

# Local Claude Overrides

- Add only personal, machine-specific, or temporary notes here.
- Keep team-shared rules in `AGENTS.md` and shared project context in `CLAUDE.md`.
```

由於在`CLAUDE.md`內可使用`@`去提及其他檔案，就提及`AGENTS.md`他自然就會讀到了

## SKILL

[SKILL.md](https://agentskills.io/)也是有通用的標準，並且也都已經定好目錄該是怎樣子的

## 多AGENT工作流(技能)

在skill也遇到類似的狀況：Claude似乎就愛與眾不同，他只會讀取到`.claude/skills/`內的skill

我的解法是統一放在`skills/`目錄

並寫一個prepare腳本：用`ln`指令產生符號連結(symlink)到`.claude/skills/`目錄下

```sh
#!/bin/bash
# for Claude Code
mkdir -p .claude/skills
for dir in skills/*/; do
  name=$(basename "$dir")
  mkdir -p ".claude/skills/$name"
  ln -sf "../../../skills/$name/SKILL.md" ".claude/skills/$name/SKILL.md"
done
 echo "✓ .claude/skills/ symlinks created"
```

## 總結

目前沒有真正「一次寫好、所有 Agent 完全共用」的標準

實務上較可行的策略：

1. 以 AGENTS.md 作為跨工具的核心規則
2. 各工具（如 Claude）用自己的設定檔補充差異
3. 透過 symlink 或 include 減少重複維護
