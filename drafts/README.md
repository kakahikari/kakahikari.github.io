# 本機文章草稿

這個目錄是尚未發布文章的本機工作區，不參與 VitePress 建置

建立草稿：

1. 複製 `_template.md` 為 `<working-slug>.md`
2. 有圖片時建立同名目錄 `<working-slug>/`
3. 撰寫與審閱使用 `blog-editor`，正式發布使用 `blog-publisher`

`drafts/*` 受 gitignore 規則排除，因此一般的 `git status` 和 `rg --files drafts` 可能不會列出草稿。盤點草稿時使用 `find drafts -maxdepth 2 -type f` 或 `rg --files --hidden --no-ignore drafts`

發布時再將定稿 Markdown 與已採用的圖片移到 `posts/`，並加入日期和正式檔名
