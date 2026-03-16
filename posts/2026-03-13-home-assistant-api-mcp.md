---
date: 2026-03-13
title: 讓 AI 控制智慧家電 - Home Assistant REST API 與 MCP Server
category: 智慧家庭
tags:
  - Home Assistant
  - AI
  - Claude Code
  - MCP
description: 不只用手機控制智慧家電，這篇帶你實際透過 Home Assistant 的 REST API 操作設備，並接入 MCP Server 讓 AI 直接控制家中的智慧裝置。從產生 Token、呼叫 API，到 Claude MCP 整合一次實作。
meta:
  - property: og:image
    content: /2026-03-13-home-assistant-api-mcp/cover.jpg
---

看完了[最簡單的智慧家電 - 把飛利浦WiZ智慧燈泡串進Home Assistant吧](./2025-09-08-wiz-smart-lights.md)，你是不是已經開始把幾樣智慧家電接進 Home Assistant 了呢？

除了用手機App按按鈕來控制智慧家電之外，接下來我們來試試看：透過網路指令控制智慧家電。

![Cover](/2026-03-13-home-assistant-api-mcp/cover.jpg)

## 什麼是API？怎麼使用？

Home Assistant提供了兩種API介面，可以透過網路呼叫的方式取得HA的資料，或是操作HA已經連線的設備：

- REST API
- WebSocket API

WebSocket會建立長連線，反應速度較即時。不過因為這篇是入門介紹，我們先從最容易理解的REST API開始。

### 產生TOKEN

為了避免隔壁鄰居、阿貓阿狗都能透過API控制你的家電，我們需要先產生一個存取權杖（Access Token）。

這個token代表你授權給任何持有它的人，可以透過API對Home Assistant發送指令。

打開HA介面，點擊自己的帳號，進入 安全性Security），找到「永久有效存取權杖」，然後新增一個。

<ModalImage
  src="/2026-03-13-home-assistant-api-mcp/img01.jpg"
  caption="新增權杖"
/>

命名只要自己方便辨識即可，例如用於API的就叫`API`。

新增成功後會出現一串非常長的密碼，請把它複製並保存到安全的地方。之後每次呼叫API都會需要使用這個token。

### 確認連線

接著可以用終端機執行以下指令確認 API 是否正常：

記得把`TOKEN`和`IP_ADDRESS`替換成你的設定。

```bash
curl \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  http://IP_ADDRESS:8123/api/config
```

如果成功取得一大串JSON資料，就代表API已經可以正常連線。

:::info
要注意你的`IP_ADDRESS`如果是內網`192.168.xx.xx`或者是`homeassistant.local`，會跟你的HA的Web介面一樣，外網是無法直接連線的

有機會之後再寫一篇如何用cloudflare tunnels從外網安全地連線到Home Assistant
:::

### 發送指令

接下來示範一個關燈的API指令：

```bash
  curl \
    -X POST \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"entity_id": "light.玄關燈"}' \
    http://IP_ADDRESS:8123/api/services/light/turn_off
```

執行後，就可以把指定的燈或燈組關掉。

要知道API可以做到哪些事情，可以參考[官方文檔](https://developers.home-assistant.io/docs/api/rest)

但在AI時代，其實只要把文件丟給AI告訴它你想做什麼，它通常就能幫你產生對應的API指令。

:::warning
不要讓AI知道`TOKEN`，否則可能造成資安風險
:::

## 接入MCP Server

既然都要讓AI幫忙寫API指令，那有沒有更方便的方式，讓AI直接控制Home Assistant呢？

如果你是開發者，應該已經聽過MCP（Model Context Protocol）。

我之前在這篇文章中也有簡單介紹：[網頁開發MCP工具 三件套： Context7、Chrome DevTools MCP、GitHub MCP](./2025-10-28-web-developer-most-recommended-mcp)

而Home Assistant官方其實已經提供了MCP Server整合，可以讓AI直接接入。

### 安裝整合

首先到[官方提供的整合](https://www.home-assistant.io/integrations/mcp_server/)安裝。

安裝成功後，在瀏覽器輸入: `https://IP_ADDRESS:8123/mcp_server/sse`

如果看到 401（Unauthorized），代表服務已經正常啟動。

如果是 404，可能是整合沒有安裝成功，或功能尚未啟用。

### 在claude接入MCP

按照[官方的文件](https://www.home-assistant.io/integrations/mcp_server/)，可以先用 CLI 建立 MCP:

```bash
claude mcp add-json "HA" '{
  "type": "http",
  "url": "https://<your_home_assistant_url>/api/mcp",
  "oauth": {
    "clientId": "http://localhost:12345",
    "callbackPort": 12345
  }
}' --client-secret
```

接者打開claude，輸入`/mcp`，選擇剛建立的`HA`，然後選擇`Authenticate`

claude會開啟瀏覽器讓你登入HA來授權。

不過我實際測試時遇到錯誤，導致OAuth三方授權沒有成功，就回去用帶token的做法。

在專案下建立`.mcp.json`，`${HA_URL}`、`${HA_TOKEN}`可以從環境變數讀取。

```json
{
  "mcpServers": {
    "home-assistant": {
      "type": "sse",
      "url": "${HA_URL}",
      "headers": {
        "Authorization": "Bearer ${HA_TOKEN}"
      }
    }
  }
}
```

之所以放在專案目錄下，是因為我不希望在其他專案開發時，不小心呼叫到Home Assistant的MCP 🤪

另外URL和Token也都放在環境變數中，避免直接寫在設定檔裡造成外洩。

完成設定後，只要MCP成功連線，AI就可以直接控制家裡的智慧設備。

而且AI也能讀取各種感測器資料，像是溫度、濕度、電力消耗等——那些平常人類懶得看的數據，就可以交給AI來分析。

<ModalImage
  src="/2026-03-13-home-assistant-api-mcp/img02.jpg"
  caption="成果"
/>

接著會繼續往用語音控制智慧家電設備的方向走，敬請期待。

---

參考資料：

- [Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/)
- [Home Assistant Model Context Protocol Server](https://www.home-assistant.io/integrations/mcp_server/)
