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

Claude Code專用，目前Claude Code預設讀取`CLAUDE.md`，功能跟AGENTS.md大致相同

可參考[官方說明](https://code.claude.com/docs/zh-TW/memory)

## 多AGENT工作流

當你專案與其他人協作，不是每個人用的AGENT、IDE都是同一套配置。甚至你自己同時操作多個AGENT時，兩個不同的配置就變成問題

只維護通用性較高的`AGENTS.md`似乎比較有效率

有個通用的解法是：用`ln`指令產生符號連結(symlink)，產生`CLAUDE.md`

```bash
ln -s AGENTS.md CLAUDE.md
```

但此做法會失去一些Claude的專用設定

目前我的解法是`CLAUDE.md`在git忽略，並在`CLAUDE.md`放以下內容作為開頭，後面再放只給Claude看的東西

```md
@AGENTS.md

# Local Claude Overrides

- Add only personal, machine-specific, or temporary notes here.
- Keep team-shared rules in `AGENTS.md` and shared project context in `CLAUDE.md`.
```

由於在`CLAUDE.md`內可使用`@`去提及其他檔案，就提及`AGENTS.md`他自然就會讀到了

## 組員客製化的AGENTS.md

即使大家已經共同維護一套`AGENTS.md`的，還是有因為個人使用的skill或plugin，需要再個別調整`AGENTS.md`的需求

目前我們的解法是git上只紀錄`AGENTS.default.md`，自行複製成`AGENTS.md`並且不進git，保留組員客製化的彈性

## SKILL

[SKILL.md](https://agentskills.io/)也是有通用的標準，並且也都已經定好目錄該是怎樣子的

## 多AGENT工作流的SKILL

在skill也遇到類似的狀況：Claude似乎就愛與眾不同，他只會讀取到`.claude/skills/`內的skill

我的解法是統一放在`skills/`目錄

並寫一個prepare腳本：用`ln`指令產生符號連結(symlink)到`.claude/skills/`目錄下

```sh
#!/bin/bash

# Claude Code
mkdir -p ".claude/$SKILLS_DIR"
for skill_dir in "$SKILLS_DIR"/*/; do
  name=$(basename "$skill_dir")

  while IFS= read -r file; do
    # rel_path: relative to the skill root (e.g. "SKILL.md" or "steps/step-1.md")
    rel_path="${file#$SKILLS_DIR/$name/}"

    # Create parent directory for the symlink
    target_dir=".claude/$SKILLS_DIR/$name/$(dirname "$rel_path")"
    mkdir -p "$target_dir"

    # Depth = .claude(1) + skills(2) + name(3) + sub-directories
    subdir_depth=$(echo "$rel_path" | tr -cd '/' | wc -c | tr -d ' ')
    total_depth=$((3 + subdir_depth))

    prefix=""
    for ((i = 0; i < total_depth; i++)); do
      prefix="../$prefix"
    done

    ln -sf "${prefix}${file}" ".claude/$SKILLS_DIR/$name/$rel_path"
  done < <(find "$SKILLS_DIR/$name" -type f ! -name '.DS_Store' | sort)
done
echo "✓ .claude/$SKILLS_DIR/ symlinks created"
```

目前使用下來，其他AGENT也都能吃到`.claude/skills`所以還沒什麼問題

## 總結

目前沒有真正「一次寫好、所有 Agent 完全共用」的標準

實務上較可行的策略：

1. 以AGENTS.md作為跨工具的核心規則
2. 各工具用自己的設定檔（如Claude用CLAUDE.md）補充差異
3. 透過 symlink 或 include 減少重複維護
