---
title: 讓 AI 不只會寫：替部落格加入 AI 編輯與發布檢視流程
date: 2026-08-29
category: 技術
tags: [AI, Codex, 工作流]
description: 從一份 AGENTS.md 開始，把部落格文章拆成草稿、AI 編輯審查、作者確認與正式發布，並記錄第一次實際跑完整套流程後補上的規則。
meta:
  - property: og:image
    content: /2026-08-29-ai-blog-editor-review-workflow/cover.jpg
---

以前使用 AI 協助部落格寫作，流程很直覺：把草稿交給它，請它改順一點、補資料、找錯字，覺得差不多就發布

但當 AI 繼續演進，開始同時碰文章內容、圖片、檔案搬移與建置驗證，問題就不只是「文章寫得好不好」，而是它到底正在扮演編輯、助理，還是純粹的發布工具

如果沒有明確邊界，AI 很容易在幾個角色之間直接跳躍。審稿時順手改掉作者觀點、看到內容完整就自行移入 `posts/`、封面還沒確認就覆蓋 `cover.jpg`，或把 build 成功當成已經取得 commit、push 甚至部署的授權。每一件事單獨看都像是在幫忙，合在一起卻會讓文章工作流失去控制

因此這個部落格在 commit [`870be5f8`](https://github.com/kakahikari/kakahikari.github.io/commit/870be5f830cbb7c585b7db635b02880191bc953a) 中，我先替專案加入一套最小可用的 AI 編輯與發布流程。這不是一次就完成的規格，而是第一版骨架：先把角色分開，再透過真正發布一篇文章找出缺口

## 先用 AGENTS.md 定義共同邊界

最上層的 [`AGENTS.md`](https://github.com/kakahikari/kakahikari.github.io/blob/main/AGENTS.md) 不負責描述每個編輯步驟，而是保存所有代理都必須遵守的專案規則

其中最重要的是授權邊界：沒有明確要求發布時，AI 只能在 `drafts/` 工作；把文章移入 `posts/`、加入正式發布日期或替換已採用的封面，都算發布變更。建置產物也不能直接編輯或提交

這一層同時保存網站本身不能被文章工作流破壞的不變條件，例如文章資料的載入方式、分頁生成方式、全站斷點位置與不同修改範圍需要執行的驗證。也就是說，AI 可以是數位編輯，也可以是技術協作者，但不能因為正在處理文章就忽略網站架構

## 把「編輯」與「發布」拆成兩個 skill

第一版流程建立了兩個專案 skill：[`blog-editor`](https://github.com/kakahikari/kakahikari.github.io/blob/main/.agents/skills/blog-editor/SKILL.md) 與 [`blog-publisher`](https://github.com/kakahikari/kakahikari.github.io/blob/main/.agents/skills/blog-publisher/SKILL.md)。

`blog-editor` 只處理草稿的建立、修改與審查。它可以改善文章結構、可讀性、用詞一致性與段落銜接，但不能擅自改變作者結論。可客觀驗證的內容要找第一手來源，個人經驗與實測結果則交回作者確認，不由 AI 補造細節

`blog-publisher` 只在文章已定稿，而且作者明確要求發布後才啟動。它處理正式日期與 slug、移動文章及素材、採用 OG image、執行 build，以及檢查建置後的輸出

拆成兩個 skill 的關鍵，不只是讓提示詞變短，而是讓「內容完成」和「允許發布」成為兩件不同的事。AI 可以把文章整理得非常完整，但只要作者還沒說要發布，它就不能越過 `drafts/` 這條線

## AI 編輯不只校稿，還要提出審查結果

為了讓審稿不只是泛泛地說「文章很順」，`blog-editor` 另外有一份 [`editorial-checklist.md`](https://github.com/kakahikari/kakahikari.github.io/blob/main/.agents/skills/blog-editor/references/editorial-checklist.md)。審查內容分成事實查核、校稿與結構、來源補強，以及定稿門檻

交付結果則固定分成三類：

1. **事實錯誤／發布阻擋**：沒有解決前不應發布
2. **建議修改**：可以改善結構、清楚度或完整性，但不一定阻擋發布
3. **待作者確認**：AI 無法代替作者回答的個人經驗、觀點、測試結果或缺少原始證據的內容

這個分類讓作者不用重新猜測每一條意見的重要程度，也避免 AI 把個人寫作偏好包裝成必須修正的錯誤

來源處理也在第一次實戰後變得更明確。正文中的連結要保留在它實際支持的敘述旁，文章最後再彙整一份「參考資料」。文末清單是方便讀者查找，不是拿來取代正文連結。這個格式直接放進 [`drafts/_template.md`](https://github.com/kakahikari/kakahikari.github.io/blob/main/drafts/_template.md)，skill 只需要提醒遵守，不必重複放一大段範例

## 草稿是一個不參與建置的工作區

加入 `drafts/`、草稿模板與使用說明。草稿沒有正式發布日期，也不會被 VitePress 當成文章載入；需要圖片時，可以先建立同名素材目錄

這個目錄受 gitignore 規則排除，實際使用後才發現一個容易踩到的問題：只看 `git status` 或一般的 `rg --files`，可能會以為草稿不存在。因此現在的規則會明確使用 `find drafts -maxdepth 2 -type f` 或 `rg --files --hidden --no-ignore drafts` 盤點草稿

人知道草稿放在哪裡，但代理通常從版本控制狀態開始找檔案。若文件沒有說明 gitignore 的影響，下一次執行時仍可能重複踩坑

## OG image 放到定稿之後

第一版已經把 OG image 納入發布 skill，並建立全站的視覺規範。不過真正跑過一次後，順序變得更嚴格：編輯階段只記錄封面的主題、必要元素與限制，不直接生圖；文章定稿後才切換到 `blog-publisher`，先讀取 [`og-image-style.md`](https://github.com/kakahikari/kakahikari.github.io/blob/main/.agents/skills/blog-publisher/references/og-image-style.md)，再用 image generation 製作候選圖

候選圖不等於正式封面。作者確認後，選定版本才會成為文章資產目錄中的 `cover.jpg`，其餘沒用到的候選圖與生成參考素材直接刪除，不保留備份。第一張實際確認的 Hermes Agent 封面也成為風格參考，但只記錄 soft-3D、圓潤霧面造型、乾淨深色背景與縮圖層級等可跨文章重用的特徵

## 發布前先確認，移動後還要檢查輸出

原本的發布流程已經有 `pnpm build`，但「有跑 build」仍然太模糊。現在發布前會先整理一份摘要，一次確認 title、日期、slug、category、tags、description 與 OG 候選圖；接著檢查工作區狀態、目的路徑是否衝突、專案指定的 pnpm 版本，以及相依套件是否已能建置

這個順序很重要。如果工具鏈還沒準備好，應該在移動草稿之前發現，而不是把文章搬到 `posts/` 之後才知道無法驗證

build 之後也不只看 exit code，而是逐項確認正式文章 HTML、彙整頁、分類頁與標籤頁，確認 RSS、sitemap、image manifest，以及 HTML 裡的 `og:image` 和 `twitter:image` 都指向預期輸出。最後再用 `git status` 確認建置產物沒有混進準備提交的變更

至於 commit、push 與部署，現在明確視為三個額外動作。發布完成只代表正式文章與素材已移入 `posts/` 並通過驗證，不代表 AI 可以自動操作版本控制或遠端環境

## 現在的完整流程

經過第一版與一次實際發布後，目前的順序可以整理成：

1. 從模板建立沒有日期的本機草稿
2. 使用 `blog-editor` 修改內容與執行編輯審查
3. 將結果分成發布阻擋、建議修改與待作者確認
4. 保留正文來源連結，並在文末彙整參考資料
5. 作者確認內容、個人經驗與 metadata
6. 文章定稿後才製作並確認 OG image，直接刪除未採用圖片
7. 使用 `blog-publisher` 預檢環境與正式路徑，再移動文章和素材
8. 執行 build，檢查文章頁、彙整頁、RSS、sitemap、圖片管線與社群 metadata
9. 只有在作者另外要求時，才依序執行 commit、push 或部署

這套流程的目的不是讓 AI 多走幾個形式上的步驟，而是把每個需要判斷與授權的節點留下來。AI 可以承擔大量整理、查核與驗證工作，作者仍然保留個人經驗、文章立場、視覺選擇與正式發布的決定權

更重要的是，這套規則不是寫完就固定不動。`870be5f8` 建立第一版，第一次實際發布則暴露出草稿探索、參考資料格式、OG 圖採用、建置預檢、輸出驗證與格式控制等問題。把這些問題回寫進 skill 與專案記憶後，下一次代理不需要重新從對話歷史猜測流程，這才是這份 AI 編輯工作流真正開始產生價值的地方

參考資料：

- [chore: AGENTS.md（commit 870be5f8）](https://github.com/kakahikari/kakahikari.github.io/commit/870be5f830cbb7c585b7db635b02880191bc953a)
