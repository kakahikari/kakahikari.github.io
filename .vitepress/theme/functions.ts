import { inBrowser } from 'vitepress'
import { watchEffect } from 'vue'

import type { Post } from './types'

function groupBy(
  posts: Post[],
  getKeys: (post: Post) => string[],
): Record<string, Post[]> {
  const data: Record<string, Post[]> = {}
  posts.forEach(post => {
    getKeys(post).forEach(key => {
      ;(data[key] ??= []).push(post)
    })
  })
  return data
}

export function initTags(posts: Post[]) {
  return groupBy(posts, post => post.frontMatter.tags || [])
}

export function initCategory(posts: Post[]) {
  return groupBy(posts, post =>
    post.frontMatter.category ? [post.frontMatter.category] : [],
  )
}

// posts 已依日期新到舊排序，依年份切段（保持排序）
export function groupPostsByYear(posts: Post[]): Post[][] {
  const groups: Post[][] = []
  let currentYear = ''
  posts.forEach(post => {
    if (!post.frontMatter.date) return
    const year = post.frontMatter.date.split('-')[0]
    if (year !== currentYear) {
      groups.push([])
      currentYear = year
    }
    groups[groups.length - 1].push(post)
  })
  return groups
}

// 動態更新頁面 title 與 og:title（僅瀏覽器端生效，避免 SSR 錯誤）
export function useDynamicTitle(getTitle: () => string) {
  if (!inBrowser) return
  watchEffect(() => {
    const title = getTitle()
    document.title = title
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title)
  })
}

// 讀取網址 query 參數（僅可在瀏覽器端呼叫，如 onMounted 內）
export function getUrlParam(key: string): string {
  return new URLSearchParams(location.search).get(key) || ''
}
