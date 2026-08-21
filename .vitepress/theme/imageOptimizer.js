import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

import sharp from 'sharp'

const PUBLIC_DIR = 'public'
const CACHE_DIR = '.vitepress/cache'
// 衍生檔與原圖同目錄：Vite 會驗證 public 路徑的資產實際存在，實體位置必須
// 與線上路徑一致。實際寬度不固定（原圖較窄時不放大），因此用統一後綴標記，
// gitignore 一條 public/**/*.opt.webp 即可完整涵蓋
const SUFFIX = '.opt.webp'
const MANIFEST_PATH = join(CACHE_DIR, 'image-manifest.json')

// 封面圖用於 PostCard 縮圖（桌機 240x160、手機滿版高 150），三檔涵蓋 1x~3x
const COVER_WIDTHS = [480, 720, 1080]
// 內文圖顯示寬度上限為 688px 的內容欄，2x 即足夠
const CONTENT_WIDTHS = [1376]
// 固定顯示尺寸的 UI 資產，依實際 CSS 尺寸取 3x
const FIXED_WIDTHS = { '/logo.png': [72] }

const WEBP_QUALITY = 78

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full, out)
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

// 從文章 frontmatter 的 og:image 找出哪些圖是封面（需要多尺寸 srcset）
async function collectCoverPaths() {
  const covers = new Set()
  for (const file of await readdir('posts')) {
    if (!file.endsWith('.md')) {
      continue
    }
    const content = await readFile(join('posts', file), 'utf-8')
    const match = content.match(/content:\s*(\/\S+\.(?:jpe?g|png))/i)
    if (match) {
      covers.add(join(PUBLIC_DIR, match[1]))
    }
  }
  return covers
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

// 以檔案內容 hash 判斷是否需要重新轉換
async function fileHash(path) {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex')
    .slice(0, 16)
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function buildVariants(src, targetWidths, originalWidth, originalSize) {
  const variants = []
  const done = new Set()

  for (const target of targetWidths) {
    // 原圖較窄時不放大，實際寬度即原圖寬度；避免產生重複尺寸
    const actual = Math.min(target, originalWidth)
    if (done.has(actual)) {
      continue
    }
    done.add(actual)

    const out = src.replace(/\.(jpe?g|png)$/i, `-${actual}${SUFFIX}`)
    const buffer = await sharp(src)
      .resize({ width: actual, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    // 壓不贏原圖就不用（常見於直向照片的最大尺寸檔）
    if (buffer.length >= originalSize) {
      continue
    }

    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, buffer)
    variants.push({
      width: actual,
      url: '/' + relative(PUBLIC_DIR, out).split('\\').join('/'),
      size: buffer.length,
    })
  }
  return variants
}

/**
 * 掃描 public 下的圖片，產生 WebP 衍生檔並回傳 manifest。
 * manifest 供 markdown-it 的 image rule 與 posts.data 查詢尺寸與 srcset。
 */
export async function optimizeImages() {
  const [files, covers, cache] = await Promise.all([
    walk(PUBLIC_DIR),
    collectCoverPaths(),
    loadCache(),
  ])

  const manifest = {}
  let converted = 0
  let reused = 0

  for (const src of files) {
    const key = '/' + relative(PUBLIC_DIR, src).split('\\').join('/')
    const hash = await fileHash(src)
    const cached = cache[key]

    // hash 未變且衍生檔都還在，直接沿用
    if (cached?.hash === hash) {
      const allPresent = await Promise.all(
        cached.variants.map(v => exists(join(PUBLIC_DIR, v.url))),
      )
      if (allPresent.every(Boolean)) {
        manifest[key] = cached
        reused++
        continue
      }
    }

    const { width, height } = await sharp(src).metadata()
    const { size } = await stat(src)
    const widths =
      FIXED_WIDTHS[key] ?? (covers.has(src) ? COVER_WIDTHS : CONTENT_WIDTHS)
    const variants = await buildVariants(src, widths, width, size)

    manifest[key] = { hash, width, height, variants }
    converted++
  }

  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log(
    `[images] ${files.length} 張圖（轉換 ${converted} / 沿用快取 ${reused}）`,
  )
  return manifest
}
