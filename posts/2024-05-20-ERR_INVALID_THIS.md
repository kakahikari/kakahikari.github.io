---
date: 2024-05-02
title: 解決pnpm error ERR_INVALID_THIS
category: 除錯
tags:
  - pnpm
  - node.js
description: 將 Node.js 版本從 18 升級到 20 後，嘗試使用 pnpm 安裝套件時遇到 "ERR_INVALID_THIS" 錯誤。暫時回退到 Node 18 可正常安裝。這個問題可能與 pnpm 版本有關，升級到 v8.3.1 或更新版本可能有機會解決。文中提供了錯誤訊息的程式碼示例以及目前的因應措施。
---

# 解決pnpm error ERR_INVALID_THIS

## 問題敘述

將專案的node版本從`18`升到`20`之後，要安裝新的套件卻出現了錯誤訊息

```bash
pnpm i eslint @eslint/js -D
 WARN  GET https://registry.npmjs.org/eslint error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.
 WARN  GET https://registry.npmjs.org/@eslint%2Fjs error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.
 WARN  GET https://registry.npmjs.org/eslint error (ERR_INVALID_THIS). Will retry in 1 minute. 1 retries left.
 WARN  GET https://registry.npmjs.org/@eslint%2Fjs error (ERR_INVALID_THIS). Will retry in 1 minute. 1 retries left.
Progress: resolved 4, reused 4, downloaded 0, added 0
```

原本以為是npm掛掉了，但是到 https://status.npmjs.org/ 去查詢一切正常

## 如何解決

1. 專案切換回node`18`，就正常

```bash
pnpm i eslint @eslint/js -D
Packages: +79
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

devDependencies:
+ @eslint/js 9.1.1
+ eslint 9.1.1

 WARN  Issues with peer dependencies found
.
└─┬ vitepress 1.1.4
  └─┬ @docsearch/js 3.6.0
    └─┬ @docsearch/react 3.6.0
      ├── ✕ missing peer search-insights@">= 1 < 3"
      ├─┬ @algolia/autocomplete-core 1.9.3
      │ └─┬ @algolia/autocomplete-plugin-algolia-insights 1.9.3
      │   ├── ✕ missing peer search-insights@">= 1 < 3"
      │   └─┬ @algolia/autocomplete-shared 1.9.3
      │     └── ✕ missing peer @algolia/client-search@">= 4.9.1 < 6"
      └─┬ @algolia/autocomplete-preset-algolia 1.9.3
        └── ✕ missing peer @algolia/client-search@">= 4.9.1 < 6"
Peer dependencies that should be installed:
  @algolia/client-search@">=4.9.1 <6.0.0"  search-insights@">=1.0.0 <3.0.0"

Progress: resolved 235, reused 198, downloaded 0, added 0, done
Done in 3.9s
```

2. [在這看到一樣的問題](https://www.wyr.me/post/746)，方法是升級pnpm版本到`v8.3.1+`。但因為工作上pnpm團隊有使用指定版本，之後升級了會再回來檢查有沒有解決這則問題
