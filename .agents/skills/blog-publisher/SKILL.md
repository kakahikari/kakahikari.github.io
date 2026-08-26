---
name: blog-publisher
description: 將已定稿的本專案部落格草稿正式發布；適用於確認發布資料、生成與採用 OG image、移入 posts、更新 frontmatter 及執行發布前驗證
---

# Blog publisher

處理已定稿文章從草稿到正式文章的發布工作。文章看起來完整不代表已取得發布授權；只有使用者明確要求發布時，才能進行發布變更

## 發布前置條件

- 確認 `blog-editor` 的編輯審查已完成，事實錯誤與發布阻擋已解決
- 若仍有待作者確認的個人經驗、實測結果、來源或結論，先回報並停止發布變更
- 向作者確認正式 title、發布日期、slug、category、tags 與 description

## OG image

只在文章定稿後製作。生成或修改圖片時：

1. 讀取 [references/og-image-style.md](references/og-image-style.md)
2. 使用 `imagegen` skill，從文章主旨、核心物件與情緒提煉 prompt
3. 先將輸出視為候選圖；未經作者確認，不覆蓋已採用的 `cover.jpg`
4. 作者確認後才整理為文章資產目錄中的 `cover.jpg`，並設定 `og:image`

若文章已有核准且符合規格的封面，不必重新生成

## 發布操作

取得明確發布要求並完成前置條件後：

1. 加入正式的 `date: YYYY-MM-DD`，確定正式 slug
2. 將 Markdown 移至 `posts/<YYYY-MM-DD-slug>.md`，文章圖片移至同名目錄
3. 更新內文與 OG 圖的根路徑，移除 TODO、佔位內容和未採用的候選項目
4. 依 `README.md` 核對 frontmatter、圖片來源與建置後的圖片處理方式
5. 執行 `pnpm build`，確認文章、分類、標籤、RSS、OG 與 Twitter image 的輸出符合預期

不要直接編輯或提交建置產物。若建置失敗或輸出不符預期，回報原因，不把未驗證的文章視為已完成發布

## 完成條件

- 發布日期、檔名、frontmatter、來源、連結與圖片路徑正確
- OG image 已獲作者確認並符合全站視覺規範
- `pnpm build` 通過，相關頁面與 metadata 輸出正確
- 沒有未解決的發布阻擋，也沒有把建置產物加入變更
