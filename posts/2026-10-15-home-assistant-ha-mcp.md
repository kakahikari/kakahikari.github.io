---
date: 2026-10-15
title: 讓 AI 幫忙管理智慧家庭 - 用 ha-mcp 連接 Home Assistant
category: 智慧家庭
tags:
  - Home Assistant
  - AI
  - MCP
description: 從讓 AI 開關家電，進一步到搜尋設備、整理儀表板與協助自動化除錯。這篇介紹 ha-mcp 的用途、與 REST API 及內建 MCP Server 的差異，並透過 HACS 安裝、測試連線。
meta:
  - property: og:image
    content: /2026-10-15-home-assistant-ha-mcp/cover.jpg
---

上一篇[讓 AI 控制智慧家電 - Home Assistant REST API 與 MCP Server](./2026-03-13-home-assistant-api-mcp.md)，我們試過用 REST API 控制家電，也接上了 Home Assistant 官方的 MCP Server。

如果只是跟 AI 說「幫我關掉客廳燈」，這樣其實已經很夠用了。

但設備越接越多，想做的事情就不只是開關燈了：家裡到底有哪些感測器？哪些設備又離線了？能不能把每個房間的溫濕度整理在同一個畫面？

這次來試試看 [ha-mcp](https://github.com/homeassistant-ai/ha-mcp)，幫 AI 多準備一些能直接管理 Home Assistant 的工具。

![Cover](/2026-10-15-home-assistant-ha-mcp/cover.jpg)

## ha-mcp 是什麼？為什麼需要它？

先講清楚，ha-mcp 是社群開發的 MCP Server，**跟上一篇用的 HA 內建 MCP Server 是兩個不同的東西**。

它把常見的 HA 操作包裝成 AI 可以直接使用的工具，例如搜尋實體、查狀態、呼叫服務、編輯儀表板和管理自動化。完整功能可以看[專案工具清單](https://homeassistant-ai.github.io/ha-mcp/tools/)。

這裡的「實體」（entity）就是 HA 裡的每一顆燈、每一個感測器；「呼叫服務」則是叫它們做事，例如開燈、調溫度。

你可能會想：這些事情不是本來就能用 API 做嗎？

沒錯，很多都可以。之前只要拿到 Token，AI 就能幫忙寫 REST API 或 WebSocket 程式，讀取資料、修改設定。

差別在於，以前像是每次都請 AI 現場做一支遙控器：處理驗證、組合請求，再從一大串回傳資料裡找答案。ha-mcp 則是直接給它一盒做好的遙控器，AI 挑適合的那支按下去就好。

![MCP 用戶端接入後的架構示意：AI 用戶端（以 Codex 為例）透過 ha-mcp 與 Home Assistant 連接智慧家電](/2026-10-15-home-assistant-ha-mcp/connection-flow.png)

不過要注意，ha-mcp 只是讓 AI 更好操作 HA。HA 本來控制不了的家電，裝了它也一樣控制不了；裝置還是要先接進 HA，感測數據也要有對應的整合提供。

### 跟原本的方式差在哪？

| 方式                    | 怎麼用                                                                    | 適合什麼情況                           |
| ----------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| REST API／WebSocket API | 自己寫程式呼叫 HA，處理驗證與回傳資料                                     | 固定腳本、客製流程，或只需要少數功能   |
| HA 內建 MCP Server      | 在 HA 裡開啟後，AI 能用你選的 LLM API 工具，通常是 Assist（語音助理）那套 | 日常開關家電、查詢狀態                 |
| ha-mcp                  | 一整套偏向建置、管理與除錯的現成工具                                      | 常請 AI 整理設備、改儀表板、維護自動化 |

我選 ha-mcp 的理由很單純：它已經整理好一套管理 HA 的工具，不用一直自己寫串接程式。如果你只需要幾個固定指令，原本的 API 或內建 MCP 可能就夠用了。

## 安裝 ha-mcp

ha-mcp 有好幾種部署方式，這次我在自己的 Home Assistant 專案中，選的是 **用 HACS 安裝自訂整合，讓伺服器直接跑在 HA 裡面**。

當時的安裝紀錄：

- Home Assistant：`2026.10.0`
- HA-MCP Custom Component：`2.2.2`
- ha-mcp Server：`8.7.0`
- MCP 連線成功，可列出 77 個工具

版本和工具數量會隨更新變動，看到不一樣是正常的；元件和伺服器也各有自己的版本號，不用以為裝錯了。

依[專案安裝文件](https://github.com/homeassistant-ai/ha-mcp/blob/master/docs/in-process-server.md)，這種 HACS 安裝方式需要 HA `2026.8.0` 以上。動手前先確認版本，順便備份一下現有設定。

### 透過 HACS 安裝元件

打開 HACS，搜尋 **HA-MCP Custom Component**。

找不到的話，可以在 HACS 的自訂儲存庫加入下面這個網址，類別選 Integration：

```text
https://github.com/homeassistant-ai/ha-mcp-integration
```

下載完成後，重新啟動 Home Assistant 讓自訂整合載入。重啟時 HA 介面和自動化會短暫停一下，記得挑個家人沒在用的時間。

### 新增 HA-MCP Server

接著到「設定 → 裝置與服務 → 新增整合」，搜尋 **HA-MCP Custom Component**，選擇 **HA-MCP Server**，再按提交。

第一次啟動要下載伺服器套件，可能會比想像中久一點。可以從通知和系統日誌看進度，先不要急著一直重複新增。

選單裡可能還會看到 **HA-MCP File & YAML Tools**，那是額外的檔案與 YAML 編輯服務。一般連線先選 Server 就好，需要進階工具時再依文件啟用。

:::info
這種安裝方式本身就是完整的 ha-mcp 伺服器，不用再另外跑 Docker、App／Add-on 或 `uvx` 版本。

選一種部署方式就好，免得同一個 AI 用戶端連到好幾份 ha-mcp。
:::

### 取得連線網址

啟動成功後，到「設定 → 裝置與服務 → HA-MCP Custom Component → HA-MCP Server → 設定」，複製畫面上的連線網址。

依部署與設定不同，可能是經過 HA 的 webhook：

```text
http://homeassistant.local:8123/api/webhook/<你的 webhook 識別碼>
```

或是在區域網路裡直接連到伺服器：

```text
http://<HA 的 IP>:9584/private_<隨機字串>
```

**直接複製設定頁的完整網址，不要自己猜路徑**

:::warning
預設情況下，這個網址就等於密碼，拿到網址的人就能管理你的 HA。

所以不要把完整網址放進文章、截圖、Git 儲存庫或聊天內容。萬一外洩了，可以在設定裡重新產生連線秘密，再更新用戶端設定。
:::

這種方式不用自己把 HA 的長期 Token 填給 ha-mcp，不過整合會在背後自動建一組管理員權限的 Token 給伺服器使用，權限其實一樣很大。

## 我這次怎麼用 Codex 連線

這次我是直接在 Codex 的 Home Assistant 專案裡操作，從取得 HA 授權、安裝 ha-mcp 到測試連線，都在同一段對話裡完成。

先說明這次做到哪裡：我確認了 ha-mcp 能正常連線，但還沒把它正式加進 Codex 的 MCP 設定；後面盤點設備和整理儀表板時，有一部分是讓 Codex 直接呼叫 HA 的 API 完成的。

### 先讓 Codex 能存取 HA

一開始還沒裝 ha-mcp，我先建立 HA 的長期存取權杖，存在專案的 `.secrets/home-assistant-token`，再請 Codex 從檔案讀取，測試 REST API 能不能用。

結果 `GET /api/` 回傳 `200` 和 `API running.`，授權和網路都沒問題，這才接著安裝 ha-mcp。

### 安裝後，請 Codex 測試 MCP

HA-MCP Server 啟動後，我把完整連線網址存到同一個專案的 `.secrets/ha-mcp-url`，沒有直接貼在對話裡。

接著讓 Codex 跑一支本機的小程式：讀取網址、連上 ha-mcp，再請它列出所有工具（也就是 MCP 的 `initialize` 與 `tools/list`）。結果回傳 77 個工具，代表 HA 這端的伺服器已經能正常回應了。

因為 Codex 本來就能在專案裡跑程式、讀檔案，所以我先用這種方式測試，還沒讓 ha-mcp 的工具直接出現在每次對話裡。

`.secrets/` 記得加進 `.gitignore`，並限制檔案權限。不過這只能防止不小心推上 Git 或被其他帳號看到；Codex 是用你的帳號在執行，它還是讀得到。

### 想讓工具直接出現在 Codex 裡呢？

如果之後想讓 Codex 直接使用 ha-mcp 的工具，可以依 [OpenAI 官方 MCP 文件](https://learn.chatgpt.com/docs/extend/mcp)，把伺服器加進 Codex 的 MCP 設定。官方支援 Streamable HTTP，可以從設定介面或 `config.toml` 加入。這一步這次還沒做。

Claude 的概念也差不多：先讓用戶端連上 ha-mcp，再由 AI 呼叫工具，只是設定格式和驗證方式各家不同。ha-mcp 的[官方設定精靈](https://homeassistant-ai.github.io/ha-mcp/setup/)整理了各用戶端的建議做法，Claude Code 也有自己的 [MCP 文件](https://code.claude.com/docs/en/mcp)，這裡就不另外展開。

不管用哪個用戶端，都建議先從唯讀查詢開始，確認 AI 真的拿到 HA 的即時資料，再讓它修改設定或操作設備。

`homeassistant.local` 和內網 IP 只有在家裡的網路才連得到。如果改由雲端服務連 ha-mcp，發出連線的是雲端主機，就算你自己的瀏覽器打得開 HA 也沒用；這時需要另外準備遠端連線方式（例如 Nabu Casa），並依文件設定 HTTPS 與驗證。

## ha-mcp 的優點：讓 AI 更容易接手整理工作

### 不用先記住每個實體 ID

HA 裡的實體 ID 越來越多，要自己記住哪個感測器在哪個房間，真的有點累。

ha-mcp 有搜尋和概覽工具，AI 可以先找出對應的實體、讀取狀態，再接著處理。比起把整份設備清單貼進聊天室，AI 只要查它需要的部分就好。

不過前提還是資料本身要整理好。這次盤點就發現了同名和離線的燈具紀錄，手機定位也有對不起來的狀況。AI 看到手機都不在家，不代表就能直接下結論說「家裡沒人」。

### 以修改儀表板為例：接好 ha-mcp 之後會怎麼做

光說「AI 可以修改儀表板」有點抽象，就拿家裡的溫濕度畫面來說吧。

原本總覽上已經有工作區、小孩臥室的溫濕度監控。客廳清淨機接進來之後，又多了溫度、濕度和 PM2.5。但我不想只是一直往下塞卡片，感測器越來越多，最好能一眼看出哪個房間比較熱、比較濕。

#### 1. 先說想改善什麼

我一開始只說「總覽目前有工作區、小孩臥室的溫濕度監控，增加客廳」，後來才問有沒有更清楚的分組方式。

重點不是換一張漂亮的卡片，而是同時解決兩件事：看每個房間現在的狀況，還有比較不同房間的變化。

#### 2. 用平常說話的方式描述排版

把那幾輪對話整理一下，可以像這樣跟 AI 說：

> 幫我整理總覽的室內環境區塊。工作區、小孩臥室、客廳各自分組，每個房間的溫度、濕度並排，客廳再放 PM2.5。下面放近 24 小時的跨房間溫度、濕度比較圖，三個房間各用固定顏色。保留原本的天氣和家電控制，先讀現有設定，確認要改哪些地方再調整。

第一版做完，還可以繼續補充：

> 溫度用橘色、濕度用藍色，卡片維持兩列高度。每張卡片的小折線圖放在底部，上面保留標題與數字，不要撞到下方的 PM2.5。

你不用知道卡片的 YAML 怎麼寫，但要把「哪些保留、哪些新增、怎麼分組」講清楚。AI 也不一定一次就排得合你的意，做完還是要看一下畫面再微調。

#### 3. AI 透過 ha-mcp 讀取、修改，再確認結果

流程其實跟自己動手差不多：先看現況、再修改、最後回頭確認，只是這些步驟換成 AI 呼叫 ha-mcp 的工具來做。

依 [ha-mcp 儀表板編輯指南](https://github.com/homeassistant-ai/ha-mcp/blob/master/docs/dashboard-edits.md)，AI 會先用 `ha_config_get_dashboard` 讀取目前的儀表板，找出對應的感測器和要修改的區塊。

確認實體都對上之後，再用 `ha_config_set_dashboard` 修改設定，例如加入客廳的感測卡、重新分組、調整卡片高度和圖表位置。工具支援局部修改，不用為了加幾張卡片就把整個總覽重做一次。

讀取時，工具會一併取得一組 `config_hash`，可以用來檢查設定在這段期間有沒有被別人改過。如果家人剛好也動了儀表板，就先重新讀取再處理，免得把對方的修改蓋掉。

存好之後，還要讀回設定確認，最後打開 HA 看實際畫面。API 回報成功，不代表卡片沒有擠在一起；我這次就來回調整過高度和折線圖的位置。

#### 4. 最後改了哪些地方？

![儀表板排版前後示意：從散放的感測卡，改成房間分組、客廳 PM2.5 與下方跨房間趨勢比較](/2026-10-15-home-assistant-ha-mcp/dashboard-before-after.png)

_上圖是排版示意，不是 HA 實際截圖，折線也不是真實的感測資料。左邊是整理前的問題，右邊是想達到的配置。_

### 如果全部自己手動改呢？

當然也做得到，只是一句「幫我排清楚一點」，背後其實藏了不少細節。

先要找到每個房間對應的感測器，確認名稱相近的實體沒選錯；再進儀表板編輯，新增客廳的卡片，把六張溫濕度卡片的名稱、顏色和尺寸一張張設好，最後整理房間區塊和順序。

比較圖也要分別加入三個房間的實體、設定顯示期間與標籤。如果還想像這次一樣用自訂卡片，把小折線塞進卡片底部，就得另外處理卡片設定、格子高度和顯示樣式。基本排版可以照 [HA 區塊與卡片編輯文件](https://www.home-assistant.io/dashboards/sections/)用視覺化編輯器完成，但更細的樣式調整，可能還是得翻文件、改 YAML。

| 工作         | 自己手動處理                           | 交給接好 ha-mcp 的 AI 協助               |
| ------------ | -------------------------------------- | ---------------------------------------- |
| 找感測器     | 逐一確認實體與所屬房間                 | AI 查詢實體，整理對應後供你確認          |
| 改排版       | 新增、移動卡片，反覆調整區塊與尺寸     | 說明分組、位置與保留範圍，由 AI 修改配置 |
| 統一樣式     | 重複修改多張卡片的名稱、顏色與圖表設定 | 一次描述共同規則，再檢查套用結果         |
| 看結果再微調 | 回到編輯器，找到對應卡片繼續改         | 指出哪裡太高、擋住數字，讓 AI 接著調整   |

交給 AI 之後，我可以把心力放在「這樣看起來清不清楚」，找實體、改設定這些瑣事就交給工具。不過最後檢查還是省不掉：確認原本的設定還在、沒改到其他區塊，再看看電腦和手機上的畫面，才算真的完成。

### 除錯時更容易把資料串起來

自動化沒有照預期執行時，只知道燈現在是關的，通常不夠。

還得看觸發條件、執行追蹤、歷史狀態和日誌。ha-mcp 有這些查詢工具，AI 可以根據資料幫忙找原因，你就不用在好幾個畫面之間一直複製貼上。

但沒收集到的資料，它也變不出來。如果清淨機的整合沒有回報 PM2.5，裝了 ha-mcp，AI 也一樣不會知道。

## 功能更多，也要想清楚讓它做什麼

ha-mcp 讓很多管理工作變方便了，但也等於把修改設定的權限交給了 AI。

建議先從唯讀查詢開始，確認裝置都對應正確；要改儀表板或自動化時，先保留原設定，改完再讀回確認。真的需要限制，就依[伺服器文件](https://github.com/homeassistant-ai/ha-mcp)開啟唯讀模式或停用個別工具，不要只靠一句「請不要亂改」。

另外，ha-mcp 跑在家裡，不代表整段 AI 對話都留在本機。如果你用的是雲端模型，工具回傳的設備名稱、狀態和歷史資料，還是可能會送到模型服務那邊處理。

至於每天固定要做的事，比較適合請 AI 幫忙寫成 HA 自動化，交給 HA 準時執行，比每次都靠 AI 臨場判斷穩定得多。

## ha-mcp 和 API，可以搭配著用

回到上一篇的 API 做法，裝了 ha-mcp 之後，還需要它嗎？

**不用每次都手寫 API，但遇到特殊需求時，它還是很好用。**

ha-mcp 的很多工具，本來就是把 HA 的 API 包裝起來。例如呼叫服務時，底層還是透過 REST API 發送請求，可以從[專案的 REST 用戶端實作](https://github.com/homeassistant-ai/ha-mcp/blob/master/src/ha_mcp/client/rest_client.py)看到這層關係。

所以兩者可以看情況搭配，不用把原本的 API 腳本全部換掉：

| 遇到的事情                               | 可以先用什麼               | 原因                                               |
| ---------------------------------------- | -------------------------- | -------------------------------------------------- |
| 想請 AI 搜尋設備、查狀態、整理儀表板     | ha-mcp                     | 已有現成工具，省去重寫串接程式的工作               |
| 要把固定查詢接進自己的程式或其他系統     | REST API                   | 呼叫與資料處理可以明確寫進程式，不必經過 AI 對話   |
| 程式需要持續接收狀態變更事件             | WebSocket API              | 可以建立連線並訂閱事件                             |
| 工具沒提供需要的參數，或遇到版本相容問題 | 查文件，再評估直接呼叫 API | 能檢查較底層的請求與回應，但需要自己處理驗證和錯誤 |

REST 與 WebSocket 能做什麼，可以分別參考 [REST API 文件](https://developers.home-assistant.io/docs/api/rest/)和 [WebSocket API 文件](https://developers.home-assistant.io/docs/api/websocket/)。直接呼叫也不是萬能，還是要看 HA 版本、可用端點和帳號權限。

不過有一條界線要守住：**如果 ha-mcp 因為唯讀模式或工具權限拒絕修改，就不該改走 API 繞過去**。API 是用來補 ha-mcp 還沒有的功能，不是用來繞過你自己設的限制。

對我來說，常見操作先交給 ha-mcp，需要更細的控制或查問題時再回到 API；已經穩定在跑的腳本和 HA 自動化，就繼續留著。如果你只是偶爾關個燈，原本的做法就夠了；但如果你也開始想讓 AI 幫忙盤點設備、整理畫面、維護自動化，ha-mcp 很值得試試看。

畢竟設備接進來只是開始，後面還有一堆設定等著整理啊。

---

參考資料：

- [ha-mcp 原始專案與工具說明](https://github.com/homeassistant-ai/ha-mcp)
- [在 Home Assistant 內執行 ha-mcp：安裝、需求與連線安全](https://github.com/homeassistant-ai/ha-mcp/blob/master/docs/in-process-server.md)
- [ha-mcp 工具清單](https://homeassistant-ai.github.io/ha-mcp/tools/)
- [ha-mcp 用戶端設定精靈](https://homeassistant-ai.github.io/ha-mcp/setup/)
- [ha-mcp 儀表板編輯指南](https://github.com/homeassistant-ai/ha-mcp/blob/master/docs/dashboard-edits.md)
- [Home Assistant Model Context Protocol Server](https://www.home-assistant.io/integrations/mcp_server/)
- [OpenAI 官方 Codex MCP 文件](https://learn.chatgpt.com/docs/extend/mcp)
- [Claude Code MCP 設定文件](https://code.claude.com/docs/en/mcp)
- [ha-mcp REST 用戶端實作](https://github.com/homeassistant-ai/ha-mcp/blob/master/src/ha_mcp/client/rest_client.py)
- [Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/)
- [Home Assistant WebSocket API](https://developers.home-assistant.io/docs/api/websocket/)
- [Home Assistant 區塊與卡片編輯文件](https://www.home-assistant.io/dashboards/sections/)
