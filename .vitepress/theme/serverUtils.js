import fs from 'fs-extra'
import { globby } from 'globby'
import matter from 'gray-matter'
import { resolve } from 'path'

// 解析文章 frontmatter，依日期新到舊排序（純函數，無副作用）
async function getPosts() {
  const paths = await globby(['posts/**.md'])
  const manifest = await _loadImageManifest()

  const posts = await Promise.all(
    paths.map(async item => {
      const content = await fs.readFile(item, 'utf-8')
      const { data } = matter(content)
      data.date = _convertDate(data.date)
      return {
        frontMatter: data,
        regularPath: `/${item.replace('.md', '.html')}`,
        cover: _resolveCover(data, manifest),
      }
    }),
  )
  posts.sort(_compareDate)
  return posts
}

// imageOptimizer 產出的尺寸表；不存在時回傳空表
async function _loadImageManifest() {
  try {
    return JSON.parse(
      await fs.readFile('.vitepress/cache/image-manifest.json', 'utf-8'),
    )
  } catch {
    return {}
  }
}

// 由 frontmatter 的 og:image 取出封面，附上 WebP 各尺寸供 srcset 使用
function _resolveCover(frontMatter, manifest) {
  const src = frontMatter.meta?.find(m => m.property === 'og:image')?.content
  if (!src) {
    return null
  }
  const entry = manifest[src]
  if (!entry) {
    return { src, width: null, height: null, variants: [] }
  }
  const largest = entry.variants[entry.variants.length - 1]
  return {
    src: largest?.url ?? src,
    width: entry.width,
    height: entry.height,
    variants: entry.variants.map(v => ({ width: v.width, url: v.url })),
  }
}

// 生成分頁頁面 markdown（有寫檔副作用，只在 config.js 呼叫一次）
async function generatePaginationPages(total, pageSize) {
  const pagesNum = Math.ceil(total / pageSize)
  const paths = resolve('./')
  if (total > 0) {
    for (let i = 1; i < pagesNum + 1; i++) {
      const page = `
---
page: true
aside: false
pageClass: index-pages
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { data as allPosts } from "./.vitepress/theme/posts.data";
const posts = allPosts.slice(${pageSize * (i - 1)},${pageSize * i})
</script>
<Page :posts="posts" :pageCurrent="${i}" :pagesNum="${pagesNum}" />
`.trim()
      const file = paths + `/page_${i}.md`
      await fs.writeFile(file, page)
    }
  }
  // rename page_1 to index for homepage
  await fs.move(paths + '/page_1.md', paths + '/index.md', { overwrite: true })
}

function _convertDate(date = new Date().toString()) {
  const json_date = new Date(date).toJSON()
  return json_date.split('T')[0]
}

function _compareDate(obj1, obj2) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
}

export { generatePaginationPages, getPosts }
