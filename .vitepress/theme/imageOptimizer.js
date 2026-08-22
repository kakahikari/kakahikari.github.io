import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'

import sharp from 'sharp'

const POSTS_DIR = 'posts'
const PUBLIC_DIR = 'public'
const GENERATED_POSTS_DIR = join(PUBLIC_DIR, 'generated', 'posts')
const GENERATED_POSTS_URL = '/generated/posts/'
const CACHE_DIR = '.vitepress/cache'
// 作業系統產生的雜物，不應轉換或部署上線
const JUNK_FILES = new Set(['.DS_Store', 'Thumbs.db'])
// 文章圖片只輸出到 generated/posts，不把 posts/<slug>/ 的原始 JPG/PNG 部署上線。
const SUFFIX = '.opt.webp'
const MANIFEST_PATH = join(CACHE_DIR, 'image-manifest.json')
// 轉檔邏輯或 manifest 結構改變且未反映在 signature 時遞增 以淘汰舊快取
const CACHE_VERSION = 1

// 封面圖用於 PostCard 縮圖（桌機 240x160、手機滿版高 150），三檔涵蓋 1x~3x
const COVER_WIDTHS = [480, 720, 1080]
// 內文圖顯示寬度上限為 688px 的內容欄，2x 即足夠
const CONTENT_WIDTHS = [1376]
const WEBP_QUALITY = 78

async function walk(dir, out = [], filter = /\.(jpe?g|png)$/i) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    // 只擋系統雜物
    if (JUNK_FILES.has(entry.name)) {
      continue
    }
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full, out, filter)
    } else if (filter.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

// 移除舊流程留在 public 的文章副本與全站圖片衍生檔。
async function removeLegacyPublicAssets() {
  const publicEntries = await readdir(PUBLIC_DIR, { withFileTypes: true })
  const publicDirectories = new Set(
    publicEntries.filter(entry => entry.isDirectory()).map(entry => entry.name),
  )
  let removed = 0

  for (const entry of await readdir(POSTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && publicDirectories.has(entry.name)) {
      await rm(join(PUBLIC_DIR, entry.name), { recursive: true, force: true })
      removed++
    }
  }

  for (const entry of publicEntries) {
    if (entry.isFile() && entry.name.endsWith(SUFFIX)) {
      await rm(join(PUBLIC_DIR, entry.name), { force: true })
      removed++
    }
  }

  return removed
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
      covers.add(match[1])
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
async function fileHash(path, signature) {
  return createHash('sha256')
    .update(await readFile(path))
    .update(signature)
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

async function buildVariants(src, targetWidths, originalWidth, outputPath) {
  const variants = []
  const done = new Set()

  for (const target of targetWidths) {
    // 原圖較窄時不放大，實際寬度即原圖寬度；避免產生重複尺寸
    const actual = Math.min(target, originalWidth)
    if (done.has(actual)) {
      continue
    }
    done.add(actual)

    const out = outputPath(actual)
    const buffer = await sharp(src)
      .resize({ width: actual, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

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

async function optimizeFile(src, targetWidths, cached) {
  const signature = [CACHE_VERSION, WEBP_QUALITY, ...targetWidths].join(':')
  const hash = await fileHash(src, signature)

  if (cached?.hash === hash) {
    const allPresent = await Promise.all(
      cached.variants.map(variant =>
        exists(join(PUBLIC_DIR, variant.url.replace(/^\/+/, ''))),
      ),
    )
    if (allPresent.every(Boolean)) {
      return { entry: cached, reused: true }
    }
  }

  const { width, height } = await sharp(src).metadata()
  const sourcePath = relative(POSTS_DIR, src)
  const extension = extname(sourcePath)
  const stem = sourcePath.slice(0, -extension.length)
  const outputPath = actual =>
    join(GENERATED_POSTS_DIR, `${stem}-${actual}-${hash}${SUFFIX}`)
  const variants = await buildVariants(src, targetWidths, width, outputPath)

  return { entry: { hash, width, height, variants }, reused: false }
}

async function pruneGeneratedPostAssets(manifest) {
  await mkdir(GENERATED_POSTS_DIR, { recursive: true })
  const keep = new Set()

  for (const entry of Object.values(manifest)) {
    for (const variant of entry.variants) {
      if (variant.url.startsWith(GENERATED_POSTS_URL)) {
        keep.add(join(PUBLIC_DIR, variant.url.replace(/^\/+/, '')))
      }
    }
  }

  let removed = 0
  for (const file of await walk(GENERATED_POSTS_DIR, [], /./)) {
    if (!keep.has(file)) {
      await rm(file, { force: true })
      removed++
    }
  }
  return removed
}

/**
 * 掃描 posts/<slug>/ 的圖片，產生 WebP 衍生檔並回傳 manifest。
 * manifest 供 markdown-it 的 image rule 與 posts.data 查詢尺寸與 srcset。
 */
export async function optimizeImages() {
  const legacyRemoved = await removeLegacyPublicAssets()
  const [postFiles, covers, cache] = await Promise.all([
    walk(POSTS_DIR),
    collectCoverPaths(),
    loadCache(),
  ])

  const manifest = {}
  let converted = 0
  let reused = 0

  for (const src of postFiles) {
    const key = '/' + relative(POSTS_DIR, src).split('\\').join('/')
    const widths = covers.has(key) ? COVER_WIDTHS : CONTENT_WIDTHS
    const result = await optimizeFile(src, widths, cache[key])
    manifest[key] = result.entry
    if (result.reused) {
      reused++
    } else {
      converted++
    }
  }

  const generatedRemoved = await pruneGeneratedPostAssets(manifest)
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log(
    `[images] ${postFiles.length} 張圖（轉換 ${converted} / 沿用快取 ${reused} / 清理 ${legacyRemoved + generatedRemoved}）`,
  )
  return manifest
}
