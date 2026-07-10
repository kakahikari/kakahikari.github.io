import { Feed } from 'feed'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vitepress'

import { getPosts } from './theme/serverUtils'

const HOSTNAME = 'https://kakahikari.me'

// 全站預設作者
const AUTHOR = 'kakahikari'

// 每頁的文章數量
const PAGE_SIZE = 10

// PV API URL
const PV_API_URL = 'https://api.logicat.tw/pv/track'

// Google Analytics ID from environment variable
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID || ''

export default defineConfig({
  lang: 'zh-Hant',
  title: '光Lab.',
  base: '/',
  outDir: 'dist',
  cacheDir: './node_modules/vitepress_cache',
  description:
    '我是kakahikari，一名前端工程師，專注 Web 與 App 的實戰開發與跨平台應用。 光Lab. 用來紀錄工作上的筆記、開發筆記、踩過的坑與生活上的點滴分享。',
  // https://vitepress.dev/zh/reference/default-theme-config#lastupdated
  lastUpdated: true,
  ignoreDeadLinks: true,
  srcExclude: ['README.md'],
  vite: {
    server: { port: 5000 },
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
  sitemap: {
    hostname: HOSTNAME,
  },

  head: [
    // RSS 自動探索
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: '光Lab.',
        href: `${HOSTNAME}/feed.xml`,
      },
    ],
    [
      'script',
      {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
      },
    ],
    [
      'script',
      {},
      `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}');
      `,
    ],
  ],

  transformPageData(pageData, { siteConfig }) {
    const head = []
    const defaultOGImage = `${HOSTNAME}/${siteConfig.site.themeConfig.defaultOGImage}`

    const pageUrl = `${HOSTNAME}/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    const siteTitle = siteConfig.site.title
    const rawTitle = pageData.frontmatter.title || pageData.title
    const pageTitle = rawTitle ? `${rawTitle} | ${siteTitle}` : siteTitle

    const pageDescription =
      pageData.frontmatter.description || siteConfig.site.description

    const isPost = pageData.relativePath.startsWith('posts/')

    head.push(['link', { rel: 'canonical', href: pageUrl }])

    const userDefinedProperties = new Set()

    // 頁面實際使用的 og 圖片（文章自訂優先，否則用預設圖）
    let ogImage = defaultOGImage

    if (pageData.frontmatter.meta) {
      pageData.frontmatter.meta.forEach(item => {
        if (item.property && item.content) {
          userDefinedProperties.add(item.property)
          let content = item.content
          // Add hostname to og:image if it's a relative path
          if (item.property === 'og:image') {
            if (content.startsWith('/')) {
              content = `${HOSTNAME}${content}`
            }
            ogImage = content
          }
          head.push(['meta', { property: item.property, content }])
        } else if (item.name && item.content) {
          head.push(['meta', { name: item.name, content: item.content }])
        }
      })
    }

    if (!userDefinedProperties.has('og:title')) {
      head.push(['meta', { property: 'og:title', content: pageTitle }])
    }
    if (!userDefinedProperties.has('og:description')) {
      head.push([
        'meta',
        { property: 'og:description', content: pageDescription },
      ])
    }
    if (!userDefinedProperties.has('og:type')) {
      head.push([
        'meta',
        { property: 'og:type', content: isPost ? 'article' : 'website' },
      ])
    }
    if (!userDefinedProperties.has('og:url')) {
      head.push(['meta', { property: 'og:url', content: pageUrl }])
    }
    if (!userDefinedProperties.has('og:image')) {
      head.push(['meta', { property: 'og:image', content: defaultOGImage }])
    }

    // Twitter Card（X、Discord、Telegram 等平台的分享預覽）
    head.push([
      'meta',
      { name: 'twitter:card', content: 'summary_large_image' },
    ])
    head.push(['meta', { name: 'twitter:title', content: pageTitle }])
    head.push([
      'meta',
      { name: 'twitter:description', content: pageDescription },
    ])
    head.push(['meta', { name: 'twitter:image', content: ogImage }])

    // 文章頁注入作者 meta 與 JSON-LD 結構化資料（SEO 作者訊號）
    if (isPost) {
      const author = pageData.frontmatter.author || AUTHOR
      head.push(['meta', { name: 'author', content: author }])
      head.push(['meta', { property: 'article:author', content: author }])
      if (pageData.frontmatter.date) {
        head.push([
          'meta',
          {
            property: 'article:published_time',
            content: new Date(pageData.frontmatter.date).toISOString(),
          },
        ])
      }

      head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: rawTitle,
          description: pageDescription,
          datePublished: pageData.frontmatter.date,
          // git 最後提交時間（與 sitemap lastmod 同源），無提交紀錄時省略
          dateModified: pageData.lastUpdated
            ? new Date(pageData.lastUpdated).toISOString()
            : undefined,
          url: pageUrl,
          image: ogImage,
          author: {
            '@type': 'Person',
            name: author,
            url: `${HOSTNAME}/pages/about.html`,
          },
        }),
      ])
    }

    if (head.length > 0) {
      pageData.frontmatter.head = (pageData.frontmatter.head || []).concat(head)
    }
  },

  // 產生 RSS feed（feed.xml）
  buildEnd(siteConfig) {
    const { title, description, themeConfig } = siteConfig.site
    const feed = new Feed({
      title,
      description,
      id: `${HOSTNAME}/`,
      link: `${HOSTNAME}/`,
      language: 'zh-Hant',
      image: `${HOSTNAME}/${themeConfig.defaultOGImage}`,
      favicon: `${HOSTNAME}/favicon.ico`,
      copyright: `Copyright © ${new Date().getFullYear()} ${AUTHOR}`,
    })

    themeConfig.posts.forEach(post => {
      const url = `${HOSTNAME}${post.regularPath}`
      feed.addItem({
        title: post.frontMatter.title,
        id: url,
        link: url,
        description: post.frontMatter.description,
        date: new Date(post.frontMatter.date),
        author: [{ name: post.frontMatter.author || AUTHOR }],
      })
    })

    writeFileSync(resolve(siteConfig.outDir, 'feed.xml'), feed.rss2())
  },

  themeConfig: {
    posts: await getPosts(PAGE_SIZE),
    // 全站預設作者
    author: AUTHOR,
    // copyright url
    siteUrl: HOSTNAME,
    // PV API URL
    pvApiUrl: PV_API_URL,
    // footer logo
    footerLogo: 'logo.png',
    // default og image
    defaultOGImage: 'og.jpg',
    // https://vitepress.dev/zh/reference/default-theme-nav
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Category', link: '/pages/category' },
      { text: 'Tags', link: '/pages/tags' },
      { text: 'Archives', link: '/pages/archives' },
      { text: 'About', link: '/pages/about' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kakahikari' },
      { icon: 'threads', link: 'https://www.threads.com/@kakahikari_tw' },
      { icon: 'buymeacoffee', link: 'https://buymeacoffee.com/kakahikari' },
    ],
    search: {
      provider: 'local',
    },
    // https://vitepress.dev/zh/reference/default-theme-config#outline
    outline: [1, 3],
    lastUpdated: {
      formatOptions: {
        dateStyle: 'short',
      },
    },
  },
})
