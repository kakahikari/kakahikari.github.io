---
name: blog-publisher
description: 將已定稿的本專案部落格草稿正式發布；適用於確認發布資料、生成與採用 OG image、移入 posts、更新 frontmatter 及執行發布前驗證
---

# Blog publisher

處理已定稿文章從草稿到正式文章的發布工作。文章看起來完整不代表已取得發布授權；只有使用者明確要求發布時，才能進行發布變更

## 發布前置條件

- 確認 `blog-editor` 的編輯審查已完成，事實錯誤與發布阻擋已解決
- 若仍有待作者確認的個人經驗、實測結果、來源或結論，先回報並停止發布變更
- 將正式 title、發布日期、slug、category、tags、description 與選定的 OG 候選圖整理成一份發布摘要，向作者一次確認；沒有 OG image 時註明不採用
- 在移動或改寫檔案前，檢查工作區狀態、正式文章與資產目的路徑是否衝突、 `package.json#packageManager`，以及相依套件是否已可供建置。若需安裝，依 lockfile 使用專案指定的 pnpm；無法備妥時先回報，不開始發布變更

## OG image

只在文章定稿後製作。生成或修改圖片時：

1. 讀取 [references/og-image-style.md](references/og-image-style.md)
2. 依視覺規範先從文章主題辨識必要與禁止的 Logo、品牌名稱或指令名稱，再提煉核心物件、情緒與 prompt
3. 使用 `imagegen` skill 生成圖片
4. 依視覺規範驗收必要識別是否存在、正確且在縮圖中清楚；不符合的輸出不是候選圖，直接刪除並針對問題重做
5. 通過驗收的輸出才視為候選圖；未經作者確認，不覆蓋已採用的 `cover.jpg`
6. 作者確認後才複製為文章資產目錄中的 `cover.jpg`，並設定 `og:image`；選定封面後直接刪除未採用的候選圖與只供生成參考的素材，不保留備份

若文章已有核准且符合規格的封面，不必重新生成

## 發布操作

取得明確發布要求並完成前置條件後：

1. 加入正式的 `date: YYYY-MM-DD`，確定正式 slug
2. 將 Markdown 移至 `posts/<YYYY-MM-DD-slug>.md`，文章圖片移至同名目錄
3. 更新內文與 OG 圖的根路徑，移除 TODO、佔位內容、模板註解與空的「參考資料」區塊；保留正文連結與文末實際引用的來源
4. 依 `README.md` 核對 frontmatter、圖片來源與建置後的圖片處理方式
5. 執行 `pnpm build`，並逐項確認：
   - 正式文章 HTML、彙整頁、分類頁與標籤頁存在
   - RSS／`feed.xml` 與 sitemap 包含新文章
   - image manifest 記錄正確的來源尺寸與預期 WebP 衍生檔
   - 文章 HTML 的 `og:image` 與 `twitter:image` 指向建置後的正式圖片 URL
   - `git status` 沒有把建置產物列入待提交變更

不要直接編輯或提交建置產物。若建置失敗或輸出不符預期，回報原因，不把未驗證的文章視為已完成發布

## 完成條件

- 發布日期、檔名、frontmatter、來源、連結與圖片路徑正確
- OG image 已獲作者確認並符合全站視覺規範
- `pnpm build` 通過，相關頁面與 metadata 輸出正確
- 沒有未解決的發布阻擋，也沒有把建置產物加入變更

## 版本控制與部署

發布完成代表正式文章與素材已放入 `posts/` 並通過驗證。commit、push 與部署是分開的外部動作，各自都需要使用者明確要求，不從「發布」自動推定授權
