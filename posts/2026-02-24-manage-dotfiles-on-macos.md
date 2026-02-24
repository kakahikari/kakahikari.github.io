---
date: 2026-02-24
title: 用 Git + GNU Stow 管理 dotfiles：快速重建開發環境
category: 技術
tags:
  - macOS
  - Git
description: 過去都靠 Migration Assistant 轉移 Mac 設定？是時候整理 dotfiles 了！本文教你用 Git 與 GNU Stow 管理 .zshrc、.config、.claude 等設定檔，透過 symlink 建立可版本控管、可跨裝置同步的開發環境，打造真正可重建的 Mac 開發配置。
meta:
  - property: og:image
    content: /2026-02-24-manage-dotfiles-on-macos/cover.jpg
---

![Cover](/2026-02-24-manage-dotfiles-on-macos/cover.jpg)

過去十年都用Macbook開發，中間換了幾台新機，只要插著USB用內建的系統移轉輔助程式(Migration Assistant)，就可以把所有設定方便的轉移到新機上

所以一直沒研究怎麼整理這些配置，是該好好整理下了🫠

並且也打算把claude的配置加入，可以跨裝置的共享設定

## dotfiles是什麼？為什麼要管理？

macOS上有許多開發工具和環境設定檔（例如 `.zshrc`、`.vscode`、`.claude` ...等）都散落在不同位置，且是`.`開頭的隱藏目錄或文件

把它們整理到一個統一的目錄並建立符號連結後，就可以：

- 在不同裝置上快速重建相同的環境
- 不用手動複製、貼上或記憶各個設定位置
- 可利用版本控制（Git）保存歷史並追蹤變更

## 管理 dotfiles 的核心方法

主要用到兩個:

### Git

把所有設定檔放在一個Git儲存庫裡（例如 `~/.dotfiles`），用版本控制保存變更和備份，並能夠同步到其他電腦

注意不要放一些私有密鑰，就算刪掉也還留在Git歷史裡

### GNU Stow

用來建立「符號連結（symlinks = softlinks）」

把 dotfiles 保存在 Git 管理的目錄裡，但在系統中真正使用的是指向它們的連結

這樣不用複製檔案就能讓系統把設定「當成在原位置」一樣使用

## 步驟

### 1. 建立 dotfiles 目錄

先建立資料夾

```bash
mkdir -p ~/.dotfiles
cd ~/.dotfiles
```

接著把設定檔移到這目錄，但要注意需根據原本在家目錄的結構，在`.dotfiles`內建立相同目錄結構，後續才能讓 stow 正確連結

例如

```bash
mv ~/.zshrc ~/.dotfiles/zsh/
mv ~/.config/nvim ~/.dotfiles/nvim/.config
mv ~/.gitconfig ~/.dotfiles/git/
```

當然用finder操作也是一樣的喔

### 2. 安裝 GNU Stow

```
brew install stow
```

### 3. 用 Stow 建立 symlinks

移動到`.dotfiles`目錄，對每個設定集執行`stow`

例如

```bash
stow zsh
stow nvim
stow git
```

就會在家目錄生成symlink指向`.dotfiles`內對應檔案，例如`~/.zshrc` → `~/.dotfiles/zsh/.zshrc`

若資料夾內有些不想同步的檔案，你可以在某些資料夾放入`.stow-local-ignore`，讓 stow 跳過它們

```
# macOS
\.DS_Store

# Git
\.git
\.gitignore
```

例如常常會加到macOS的`.DS_Store`，又無法刪除，就會出現像這樣的錯誤

```bash
WARNING! stowing claude would cause conflicts:
  * cannot stow .dotfiles/claude/.DS_Store over existing target .DS_Store since neither a link nor a directory and --adopt not specified
All operations aborted.
```

### 4. 同步與快速部署

接著在`.dotfiles`初始化Git，並推到遠端

到你要還原的機器從遠端Git上下載，重複步驟3.，就可以啦

---

參考資料：

- [Manage Your Dotfiles Like a Superhero](https://www.jakewiesler.com/blog/managing-dotfiles)
- [建立 .dotfiles 以便在任何 Macbook 上都可以擁有相同的開發環境](https://hackmd.io/@lunzaizai/SJXGJa_4s)
- [How to Manage Your Dotfiles Like a Pro with Git and Stow](https://dev.to/crafts69guy/how-to-manage-your-dotfiles-like-a-pro-with-git-and-stow-3pg1)
