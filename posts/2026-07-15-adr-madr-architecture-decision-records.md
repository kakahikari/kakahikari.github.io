---
date: 2026-07-15
title: 用 MADR 記錄架構決策：半年後還記得當初為什麼這樣選
category: 技術
tags:
  - 開發流程
  - AI
  - 文件
description: 介紹 ADR（Architecture Decision Record）與 MADR 的用途，並整合 AGENTS.md 與 AI Coding Agent，讓團隊與未來的自己都能理解當初為什麼這樣設計。
meta:
  - property: og:image
    content: /2026-07-15-adr-madr-architecture-decision-records/cover.jpg
---

![Cover](/2026-07-15-adr-madr-architecture-decision-records/cover.jpg)

最近在整理專案時發現一個老問題：半年前選了 Firestore 當資料庫，當初一定權衡過利弊，但現在只剩下架構本身，理由什麼的早就忘光光啦！

等到報表功能需要複雜查詢、Firestore 做起來綁手綁腳時，新成員（或未來的自己）第一反應通常是「當初怎麼會選這個？搬去 PostgreSQL 吧」，然後把當初評估過才排除的方案又重走一遍

這正是 ADR 要解決的問題

## ADR 是什麼

ADR（Architecture Decision Record，架構決策紀錄）是一種輕量文件格式，用來記錄專案中**重大且不易回頭**的技術決策

概念最早由 Michael Nygard 在 2011 年提出，核心想法很簡單：每做一個重要決策，就留下一份短短的紀錄，說明

- 當時面對什麼問題
- 考慮過哪些選項
- 最後選了哪個、為什麼
- 這個選擇的代價是什麼

重點是記錄「為什麼」而不是「是什麼」。程式碼本身就能告訴你現在的架構長怎樣，但只有 ADR 能告訴你當初為什麼這樣選

## MADR 是什麼

[MADR](https://adr.github.io/madr/)（Markdown Architectural Decision Records）是 ADR 的一種具體格式，用純 Markdown 撰寫，目前最新版本是 4.0

比起 Nygard 原始格式，MADR 多了「考慮的選項」與各選項優缺點的欄位，更適合記錄技術選型類的決策

官方提供[完整模板](https://github.com/adr/madr/blob/develop/template/adr-template.md)與[最小模板](https://github.com/adr/madr/blob/develop/template/adr-template-minimal.md)，日常使用最小模板就很夠了，別被完整版的欄位數量嚇到

## 為什麼要用

### 決策脈絡可以回溯

最直接的好處。「當初為什麼明知 Firestore 不能做複雜查詢還選它」這種問題，翻一下 `docs/decisions/` 就有答案

### 避免重複討論

被否決過的方案也可以記下來（status 標 `rejected`），下次有人再提一樣的想法，直接引用該筆 ADR，不用重新辯論一輪

### 新成員 onboarding

比起讀完整份程式碼猜設計意圖，讀十筆 ADR 能更快理解專案的技術脈絡

### AI coding agent 的 context

這是 2026 年的新理由，可能也是最實際的理由：Claude Code、Codex 這些 agent 在動手改架構前，如果能讀到「當初為什麼這樣設計」，就不會好心地把你刻意的取捨當成技術債「修掉」

ADR 是純 Markdown、跟程式碼放同一個 repo，天生就是 AI 友善的格式

## 怎麼加入專案

### 1. 建立目錄

MADR 官方慣例是放在 `docs/decisions/`

```bash
mkdir -p docs/decisions
```

### 2. 放一份模板

我用的是簡化版，欄位比官方最小模板再白話一點

```markdown
---
# 官方模板: https://github.com/adr/madr/blob/develop/template/adr-template.md
status: [狀態]
date: [YYYY-MM-DD]
decision-makers: [who]
---

# [主題：一句話說出做了什麼決策]

## 為什麼

[說明背景與問題]

## 選項

1. [選項 A]
2. [選項 B]

## 結果

- 選擇: [哪個選項]
- 理由: [說明]

### 後果

- 正面: [說明]
- 負面: [說明]
```

實際填起來長這樣，以「選 Firestore 作為資料庫」為例：

```markdown
---
status: accepted
date: 2026-01-10
decision-makers: kakahikari
---

# 使用 Firestore 作為資料庫

## 為什麼

活動系統需要儲存票券、抽獎紀錄與評分資料，
流量集中在活動期間、平常近乎零。該選哪種資料庫？

## 選項

1. Firestore
2. Cloud SQL (PostgreSQL)

## 結果

- 選擇: Firestore
- 理由: 與 Cloud Functions 同生態、按用量計費符合活動型流量、不需管理連線池

### 後果

- 正面: 零維運，免費額度足以覆蓋專案規模
- 負面: 無法做複雜關聯查詢，報表匯出需在程式端聚合；交易與計數器有寫入頻率限制
```

幾個寫作要點：

- 「為什麼」段落用問句收尾（「該選哪種資料庫？」），逼自己聚焦在問題而非替答案背書
- 選項至少列兩個**真實考慮過**的，不要為了湊數編稻草人
- 「負面後果」要誠實寫，這是整份 ADR 最有價值的部分——只寫好處的 ADR 沒有價值。半年後回頭看「當初明知報表難做還選 Firestore，因為活動型流量的成本考量更重要」，這句話就值回票價

### 3. 第一筆 ADR：決定使用 ADR

社群慣例是第 0 筆就記錄「我們決定用 MADR 記錄決策」這件事本身，順便當範例

檔名格式：`NNNN-小寫連字號標題.md`，四位數流水號

```
docs/decisions/
├── adr-template.md
├── 0000-use-madr-for-decision-records.md
└── 0001-use-firestore-as-database.md
```

流水號**永不重用**，就算某筆被推翻也一樣，取現有最大值 +1

### 4. 回填既有決策

翻一下專案裡那些「有規範但沒說為什麼」的東西，最值得回填。以我的某個專案為例：

- 為什麼用 pnpm monorepo + 共用型別 package
- 為什麼後端維持 JavaScript + JSDoc 而不是 TypeScript
- 為什麼 API 部署在 Cloud Functions、前端部署在 Cloudflare Pages

### 5. status 的生命週期

| status                   | 意義                       |
| ------------------------ | -------------------------- |
| `proposed`               | 提案中，尚未拍板           |
| `accepted`               | 已拍板生效                 |
| `rejected`               | 討論後被否決               |
| `deprecated`             | 不再適用，但沒有新決策取代 |
| `superseded by ADR-XXXX` | 被新決策取代               |

決策被推翻時**不刪舊檔**：新增一筆新 ADR，然後把舊檔的 status 改成 `superseded by ADR-XXXX` 指向新編號。歷史脈絡就是 ADR 的價值，刪掉就白記了

## 讓 AI Agent 也遵守

規範寫了沒人遵守就是廢文，AI agent 也一樣。延續[之前那篇 AGENTS.md 的做法](./2026-05-06-multi-ai-agent-workflow-agents-md.md)，我把 ADR 流程接進 agent 工作流，並且把「觸發規則」跟「執行細節」拆開放：

**AGENTS.md 只放觸發規則**（每個 session 都會載入，Codex 等其他工具也讀得到）

```markdown
## 架構決策紀錄（ADR）

- 重大架構或技術選型決策，須在 `docs/decisions/` 以 MADR 格式記錄
- 命名、流水號、superseded 等執行細節見 `skills/new-adr/SKILL.md`，不在此重複
```

**skill 放執行細節**（觸發時才載入）：流水號怎麼取、檔名格式、superseded 流程、常見遺漏檢查清單。skill 的 description 還可以寫成主動觸發——當對話中出現重大技術選型時，就算我沒說「ADR」，agent 也會建議記一筆

這樣拆的理由是避免同一份規則寫兩處，日後改流程時漏改其中一邊

:::info
細節只寫一份是通則：AGENTS.md 負責「何時做」，skill 負責「怎麼做」
:::

## 總結

- ADR 記錄的是決策的「為什麼」，程式碼只能告訴你「是什麼」
- MADR 是純 Markdown 的 ADR 格式，用最小模板起步就好，一筆十分鐘內寫完
- 流水號不重用、推翻不刪檔改 status，歷史脈絡才是價值所在
- AI agent 時代 ADR 額外重要：它是 agent 理解「刻意的取捨」與「技術債」差異的依據
- 搭配 AGENTS.md（觸發規則）+ skill（執行細節），讓 agent 自動遵守流程

---

參考資料：

- [MADR 官方網站](https://adr.github.io/madr/)
- [ADR 概念總覽（adr.github.io）](https://adr.github.io/)
- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
