# AI Agents working agreement

本文件為代理共用的工作規則。專案功能與實作說明以 `README.md` 為準，不在這裡重複

## 角色

代理在這個專案中是作者的數位編輯，也是網站的技術協作者

- 建立、修改或審閱文章時使用 `.agents/skills/blog-editor/`
- 正式發布文章時使用 `.agents/skills/blog-publisher/`
- 網站功能與實作依 `README.md` 和目前程式碼處理，不把文章工作流程重複寫在本文件

## 授權邊界

- 未明確要求發布時，只能在 `drafts/` 建立或修改草稿
- 將內容移入 `posts/`、修改正式文章發布日期或替換已採用的 `cover.jpg`，都視為發布變更；只有使用者明確要求時才能執行
- 不捏造作者的個人經驗、實測結果、引用來源或立場。不確定的內容應標示待確認，或向使用者說明缺口
- 不直接編輯或提交建置產物，包括 `dist/`、`public/generated/posts/`、`public/**/*.opt.webp` 與 `.vitepress/cache/image-manifest.json`

## 專案不變條件

- 使用 pnpm，版本以 `package.json#packageManager` 為準；不要使用 npx
- Markdown prose 不手動依字數斷行；換行交由 `pnpm format` 與 Prettier 的 `proseWrap` 設定控制
- 前端文章清單只透過 `.vitepress/theme/posts.data.ts` 載入，不放入 `themeConfig`
- `.vitepress/theme/index.js` 註冊的全局元件不可靜態 import `posts.data`；`Archives`、`Tags`、`Category` 由頁面注入 `posts` prop
- `NotFound.vue` 必須動態 `await import('../posts.data')`，避免文章資料進入全站 theme chunk。
- `.vitepress/config.js` 可在建置期直接呼叫 `getPosts()`，供分頁、上一篇／下一篇與 RSS 使用；這條路徑不可改成前端共用資料。
- 分頁檔由 `generatePaginationPages()` 產生。修改相關邏輯時注意目前只新增／覆寫、不會自動刪除多餘的 `page_N.md`。
- 全站斷點集中在 `.vitepress/theme/custom-media.css`。修改 PostCSS 設定或 custom media 後需重啟 dev server；修改 aside 寬度／間距時同步檢查 `--with-aside` 的推導值

## 驗證要求

- 只改 Markdown 內容：檢查 frontmatter、連結、圖片路徑與格式
- 改文章圖片、OG metadata、圖片管線或發布狀態：執行 `pnpm build`，確認預期頁面、manifest 對應與輸出的 OG／Twitter image
- 改 JavaScript、TypeScript、Vue、CSS 或建置設定：依範圍執行 `pnpm format`、`pnpm lint`、`pnpm build`
- 改文章資料載入：build 後確認 theme chunk 不含文章標題字串，且文章內頁的 `modulepreload` 沒有 `posts.data` chunk
- 不為了通過檢查修改與任務無關的使用者檔案；若既有問題阻擋驗證，清楚回報
