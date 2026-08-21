import { defineLoader } from 'vitepress'

import { getPosts } from './serverUtils'
import type { Post } from './types'

// data 由 VitePress 於建置期注入，此處僅宣告型別
declare const data: Post[]
export { data }

export default defineLoader({
  // glob 相對於本檔目錄
  watch: ['../../posts/*.md'],
  async load(): Promise<Post[]> {
    return await getPosts()
  },
})
