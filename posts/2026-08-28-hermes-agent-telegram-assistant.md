---
date: 2026-08-28
title: 用 Hermes Agent 打造 Telegram 個人助理：從本地 Qwen 遷移到 Codex
category: 技術
tags:
  - AI
  - Telegram
  - LLM
  - Hermes Agent
description: 記錄我在 Mac 上用 Hermes Agent 串接 Telegram、Google Workspace 與 Notion，並因本地 Qwen3.5-9B Q4 量化版不穩定而改用 Codex 的實作與踩坑。
meta:
  - property: og:image
    content: /2026-08-28-hermes-agent-telegram-assistant/cover.jpg
---

![Cover](/2026-08-28-hermes-agent-telegram-assistant/cover.jpg)

繳費期限過了才發現帳單埋在信箱深處、行程忘了看行事曆、筆記記在 Notion 卻懶得翻。這些事各自都有 App 能解決，但我想要的是一個入口：在手機上打開 Telegram，問一句「我明天有什麼行程」「還有哪些帳單沒繳」，就有答案

於是花了一個晚上，在家裡的 Mac 上用 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 架了一個 24 小時待命的個人助理。最初使用 LM Studio 的 Qwen3.5-9B Q4 量化版，希望兼顧隱私與零 API 成本；實際運行兩週後，卻發現它不只無法穩定選對技能，連工具失敗後的修正、停止與最終交付也不可靠。後續改用 `gpt-5.6-luna` 作為主模型

這篇不是一份照著做就能完整複製的安裝教學，而是系統從本地模型遷移到 Codex 的演進紀錄

## 架構總覽

系統入口、gateway、工具與狀態都在一台 Mac 上，模型推理目前使用 OpenAI Codex：

- **Hermes Agent gateway**：常駐服務，負責接 Telegram 訊息、跑 agent 迴圈
- **OpenAI Codex**：透過 Hermes Agent 管理的 OAuth 使用 ChatGPT Plus 訂閱，主模型為 `gpt-5.6-luna`
- **Telegram Bot**：手機端的唯一入口，設定白名單只有自己能對話
- **Google Workspace 與 Notion**：提供行事曆、信件、聯絡人與筆記資料

最初選本地模型有兩個理由：這個助理會經手行事曆、信件、筆記等私人資料，希望推理留在本機；而且常駐服務 24 小時待命，擔心 API 計費。但最後的實測結論是：**在這套硬體、量化版本與任務組合下，Qwen3.5-9B Q4 無法穩定完成任務分派與工具型工作。** 技能寫得再明確，仍只能降低失敗率，無法讓它成為我願意信任的常駐助理

目前配置如下：

```yaml
model:
  provider: openai-codex
  default: gpt-5.6-luna
  context_length: 64000
```

登入使用 `hermes auth add openai-codex`，走 ChatGPT Plus 的 Codex 額度，不使用 OpenAI API key。Hermes Agent 仍在本機執行 gateway、工具與技能腳本，但模型推理會送到 OpenAI；因此不再宣稱「資料不出門」

## 安裝與 Telegram 設定

Hermes Agent 的安裝很直接，跑官方 setup 腳本後，用 BotFather 建一個 Telegram Bot，把 token 和自己的 user ID 填進 `~/.hermes/.env`：

```bash
TELEGRAM_BOT_TOKEN=你的token
TELEGRAM_ALLOWED_USERS=你的user_id   # 白名單，沒列的人一律不理
```

長期常駐交給 launchd：

```bash
hermes gateway install   # 註冊 launchd 服務，開機自啟、崩潰自動重啟
```

最初使用本地模型時有一個容易忽略的細節：gateway 會自己活過來，但 LM Studio 不會。重開機後 gateway 起來了、模型伺服器卻不在，Bot 就變成沒有腦的殭屍。當時的解法是再寫一個 LaunchAgent 跑 `lms server start`，並確認 LM Studio 的 JIT model loading 有開

改用 `openai-codex` 後已不需要啟動 LM Studio，gateway 只需能連上 OpenAI 即可

## 接入 Google 行事曆與 Gmail

Hermes Agent 內建 `google-workspace` skill，走的是自己的 GCP OAuth client：到 Google Cloud Console 建一個專案，依需求啟用 Gmail、Calendar、Drive、Sheets、Docs 和 People API，建立 Desktop 類型的 OAuth 憑證，把自己加進測試使用者，然後跑 skill 附的 setup 腳本完成授權。token 會存在本地並自動續期，之後 agent 就能用附帶的 `google_api.py` 查行事曆、搜信、寄信

整個設定可以由 agent 逐步引導，但授權本身仍要打開瀏覽器核准，再把 redirect URL 貼回去。實際要啟用哪些 API 與 scope，可以對照 [Hermes Agent 的 Google Workspace 文件](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/skills/google-workspace.md)

## 踩坑一：agent 的 terminal 環境沒有 python

授權完成後在 Telegram 問「我明天有什麼行程」，agent 卻一直失敗。翻日誌發現：

```
/bin/bash: line 2: python: command not found
```

agent 執行 skill 腳本時，terminal 環境裡解析不到 `python`，於是模型退而求其次，改用這台機器在 PATH 上解析到的 `python3`，版本是 3.9
但 skill 腳本用了 `str | None` 這種 3.10+ 語法，直接炸掉。更慘的是小模型還會嘗試 pip install 自救，把套件裝進錯誤的 Python，越陷越深

解法簡單粗暴：把 SKILL.md 裡所有指令範本改成 venv 的絕對路徑，並加一條硬性規則

```md
0. **一律使用 `~/.hermes/hermes-agent/venv/bin/python` 執行腳本**，
   不可用裸 `python`/`python3`，不可自行 pip install。
```

**寫給小模型看的 SKILL.md，路徑和參數都要寫死，不要留任何「它應該猜得到」的空間。**

SKILL.md 裡的範例參數也要跟腳本實際版本對齊。我遇過文件寫了 `--format json`，但腳本根本沒有這個 flag，模型照抄後只會得到錯誤

## 踩坑二：模型明明支援 256K，Hermes Agent 卻說 context 只有 8K

把 Hermes Agent 的 provider 指到 LM Studio 後，第一次呼叫就被拒絕：

```
Model qwen3.5-9b-mlx has a context window of 8,192 tokens,
which is below the minimum 64,000 required by Hermes Agent.
```

[Qwen3.5-9B 官方模型卡](https://huggingface.co/Qwen/Qwen3.5-9B)標示原生 context length 為 262,144 tokens。問題出在 LM Studio 的 context length 是載入模型時的參數；我當時載入的 instance 只開了 8,192，API 回報的也是這個載入值

在我當時的 LM Studio 設定下，用不同參數再請求一次並不會調整原有 instance，而是又載入一份。`lms ps` 一看，同一個模型躺著兩個 instance，context 一個 8192、一個 64000，將近 6GB 的模型在 RAM 裡放了兩份。LM Studio 現在有 JIT Auto-Evict 設定，開啟時會在載入新的 JIT instance 前卸載舊的；若遇到相同狀況，可以先確認 Developer 頁籤裡的設定，詳細行為以 [LM Studio 官方文件](https://lmstudio.ai/docs/developer/core/ttl-and-auto-evict)為準

解法兩步：

1. 在 LM Studio 的 My Models 裡把該模型的預設 context length 改成 64000 以上。這樣不管手動載入還是 JIT 自動載入都用同一組參數，不會再生出分身
2. 在 `~/.hermes/config.yaml` 明確寫死 context length，因為 Hermes Agent 對本地伺服器的自動偵測不一定準：

```yaml
model:
  provider: lmstudio
  default: qwen3.5-9b-mlx
  base_url: http://127.0.0.1:1234/v1
  context_length: 64000
```

清掉多餘實例可以用 `lms unload --all` 再重新載入一份正確參數的，或直接在 Developer 頁籤逐一卸載

## 晨間簡報：Hermes Agent 的 cron 系統

Hermes Agent 內建 cron，可以排程執行任務並把結果推到 Telegram。改用 Codex、但尚未撤掉帳單追蹤時，我使用的排程類似這樣：

```bash
hermes cron create "0 8 * * *" "產生今日晨間簡報..." \
  --name morning-briefing --deliver telegram \
  --skill google-workspace --skill bill-reminder \
  --provider openai-codex --model gpt-5.6-luna
```

`--deliver telegram` 會投遞到 `TELEGRAM_HOME_CHANNEL`；如果沒有設定 home channel，也可以寫成 `telegram:<chat_id>`。每天早上八點，手機會收到今日行程加上待繳帳單清單。prompt 裡明確寫上「這是排程任務，不需要向使用者確認，直接產出簡報」，不然 agent 有時會卡在「請問您需要我列出行程嗎」這種自我懷疑

後來帳單追蹤撤掉，排程也移除了 `bill-reminder`。Hermes Agent 的 cron 行為和參數持續在調整，實際設定可再對照 [官方 cron 文件](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/cron.md)

## 帳單追蹤技能：會記得你繳了沒

單純「每天掃描帳單信然後列出來」是不夠的，它不知道你繳了沒，繳過的每天照樣吵。所以做成有狀態的待辦清單：

- 每張帳單用「寄件人網域＋帳期」算出穩定 ID，`scan` 偵測到沒見過的 ID 才入列
- 在 Telegram 回「繳了 貸款」就勾銷；關鍵字模糊時會列出候選讓你選，降低誤判
- 沒勾銷的一直留在清單上，過期標紅持續提醒；下個月的新帳單是新帳期、新 ID，自然重新入列
- 每次勾銷自動在 Google Sheets 寫一列（日期、帳單、金額、來源）當永久帳本，本地狀態檔只保留 60 天

想知道這個月繳了多少，問一句就好，它會讀試算表加總

::: info 確定性腳本仍然必要，但救不了模型路由
帳單技能採用「確定性腳本 + 薄薄一層 LLM」：掃描、日期解析（民國年還要 +1911）、去重、狀態管理全部在 Python 腳本裡完成，模型只負責跑指令和把 JSON 排版成人話。這確實降低單一步驟的錯誤，但前提是模型先選對技能、傳對參數，而且失敗後知道何時停止。Qwen3.5-9B 在這些代理層工作上仍會反覆失手，因此腳本設計不能被當成本地模型「已經夠用」的證明
:::

還有一個台灣特色的坑：我收到的銀行「對帳單」多半不是待繳帳單。存款對帳單、綜合對帳單都只是月結通知，真正要繳的是信用卡帳單、水電費那些。過濾規則寫成「含『對帳單』但不含『信用卡』就排除」，再把繳費成功通知、分期促銷這類雜訊踢掉，清單才乾淨

## Notion 知識庫

把 Notion 接進來當知識來源。到 [Notion Integrations](https://www.notion.so/my-integrations) 建一個 internal integration 拿到 token，然後授權它存取需要的頁面。可以從 Developer portal 的 Content access 管理，也可以在頁面右上 `⋯` → Connections 加入；沒授權的頁面 API 查不到，連錯 integration 也一樣。我自己就在「按了但沒生效」上耗了一輪，建議用電腦版操作，連完再確認 integration 名稱與可存取頁面

這三個指令不是 Hermes Agent 或 Notion 原生提供的功能，而是我另外包的唯讀腳本：`list`（總覽）、`search 關鍵字`、`read 頁面 ID`（整頁轉純文字，遇到資料庫自動改列出所有筆記）。現在在 Telegram 問「我 Notion 裡有記過租屋的注意事項嗎」，它會搜尋、讀取、然後回答

Notion integration 的 token 只放在本機環境變數，不寫進腳本或版本控制；頁面權限則只開給助理確實需要讀取的範圍。官方目前的權限設定方式可以參考 [Notion internal connections 文件](https://developers.notion.com/guides/get-started/internal-connections)

## 踩坑三：技能明明在，模型就是不用

一切都接好之後，實戰還是翻車。翻出幾段 Telegram 對話記錄，同一類問題反覆出現：

- 問「我明天有什麼行程」，agent 跑去搜本地的 `.ics`/`.txt`/`.md` 檔案和 cron 設定，完全沒想到用 google-workspace 技能
- 問「聯絡人 A 的電話」，它先開瀏覽器要登入 Google、再向我要帳號密碼，繞了一大圈才發現 token 早就設定好了。找到入口後又卡一次：`contacts list` 不支援搜尋，它只好 dump 全部聯絡人再用 Python 過濾，「聯絡人 A」對不上聯絡人裡的「聯絡人 A（完整名稱）」又多耗幾輪
- 更糟的是記憶殘留：memories 裡留了一條「聯絡人 A - 電話號碼待查詢」，之後每次查詢都被這條過期資訊誤導

最初判斷根本原因只是路由資訊不足：從這次測試看，Qwen3.5-9B 決定用不用技能時高度依賴 description 裡的關鍵字，而原本的描述只寫了 "Gmail, Calendar, Drive, Docs, Sheets"，連 Contacts 都沒提，也沒有中文觸發詞。補齊後確實有改善，但後續對話證明這不是完整答案：即使路由已寫進 description、SKILL.md、SOUL.md 和 memory，本地模型仍會忽略技能、使用不存在的 action、傳錯路徑、重複同一失敗，甚至在工具回合耗盡後沒有最終回答

修法從三個層面下手：

1. **補齊路由表面**：description 加上 Contacts 和中文觸發詞（行事曆/行程/信件/聯絡人/電話）。至少在這次測試裡，使用者用什麼語言問，描述裡出現對應語言的關鍵字會比較容易選對技能
2. **把繞路的操作做成一條命令**：`google_api.py` 新增 `contacts search` 子命令，名字、email、電話都能部分比對——搜「聯絡人 A」直接命中「聯絡人 A（完整名稱）」，電話號碼會先正規化再比對。與其期待模型自己組「dump 全部再過濾」的管線，不如給它一條直達的命令
3. **在 SOUL.md 寫死路由規則**：明確告訴模型「Google OAuth 已設定完成，不要開瀏覽器登入、不要要帳密」「行程→`calendar list`、信件→`gmail search`、聯絡人→`contacts search`，這類問題不要搜本地檔案」。另加一條記憶衛生規則：聯絡人資料不寫入記憶，需要時即時查詢——順手清掉了那條過期的「待查詢」

改完後，「明天有什麼行程」曾經能一步到位查到行事曆，但跨 session、Telegram gateway 與不同任務測試後，結果無法穩定重現。這一坑最後的教訓是：SKILL.md、description 和 SOUL.md 都只是提示，不是執行保證；如果模型本身缺乏可靠的工具選擇、參數遵循與錯誤恢復能力，再完整的路由規則也會被忽略

## 模型策略調整：Codex 為主，不再讓本地模型負責分派

原先規劃是由 Qwen3.5-9B Q4 量化版處理日常查詢，遇到困難任務才升級雲端模型。這個策略的問題是「判斷任務是否困難、選擇正確技能、決定何時升級」本身就是代理任務，而本地模型恰好不擅長這一層。它常在應該直接呼叫技能時繞路，也可能在連續失敗後繼續消耗工具回合

因此直接把 `openai-codex / gpt-5.6-luna` 設為 Hermes Agent 預設模型，所有工具路由也由 Codex 負責

Codex 負責主要的 agent 迴圈，並呼叫 Hermes Agent 已啟用的 web、browser、terminal、google-workspace 等工具與技能。部分 vision、web summarization 等輔助任務仍可能依 `auxiliary` 設定交給另一個模型，不能把每一次模型呼叫都視為由 Codex 執行

另外啟用 `tool_loop_guardrails.hard_stop_enabled`，相同方法連續失敗時停止重試，避免工具迴圈持續消耗 Plus 額度。晨間簡報也明確固定為 `openai-codex / gpt-5.6-luna`，避免 provider 切換後因配置漂移而拒絕執行

## 成果

現在 gateway、排程、工具腳本與狀態仍跑在家裡的 Mac 上，Telegram 是操作入口；模型改由 ChatGPT Plus 的 Codex 提供

這個架構不再是「資料不離家、電費以外零成本」，而是用 ChatGPT Plus 額度換取在我的使用情境下可靠得多的技能分派、工具參數理解、錯誤恢復與最終回答。剩餘風險主要在 Hermes Agent 的 session 持久化、Telegram 網路與外部服務授權，不是換模型就能全部解決

## 隱私與安全邊界

Telegram 白名單只能限制誰可以直接對 Bot 發話，不能解決所有風險。這個助理會讀取信件、行事曆與 Notion 內容，外部資料本身可能帶有誤導 agent 的文字；只要 terminal、寄信或寫入工具仍然開著，就要把 prompt injection 和誤操作一起納入考量

我的原則是只開需要的 OAuth scope、Notion 頁面與 Hermes Agent toolset，token 不寫進程式碼或版本控制，能唯讀就不開寫入。模型改用 Codex 後，傳給模型的內容也會離開本機；白名單和本機 gateway 不代表資料只留在家裡

## 後續

後來我把帳單追蹤技能撤掉了。繳費通知回歸行事曆管理，比起維護一套從信箱擷取、去重、勾銷到記帳的流程，更符合我現在的使用習慣

這個 Telegram 個人助理後續還在調整，現在正在做的方向會另外寫一篇文章記錄

---

參考資料：

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent：Google Workspace Skill](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/skills/google-workspace.md)
- [Qwen3.5-9B 官方模型卡](https://huggingface.co/Qwen/Qwen3.5-9B)
- [LM Studio：Idle TTL and Auto-Evict](https://lmstudio.ai/docs/developer/core/ttl-and-auto-evict)
- [Hermes Agent：Cron](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/cron.md)
- [Notion Integrations](https://www.notion.so/my-integrations)
- [Notion Developers：Internal connections](https://developers.notion.com/guides/get-started/internal-connections)
