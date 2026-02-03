import { defineConfig } from 'vitepress'

import { getPosts } from './theme/serverUtils'

const HOSTNAME = 'https://kakahikari.me'

// 每頁的文章數量
const PAGE_SIZE = 10

// PV API URL
const PV_API_URL = 'https://api.logicat.tw/pv/track'

// Google Analytics ID from environment variable
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID || ''

export default defineConfig({
  title: '光Lab.',
  base: '/',
  outDir: 'dist',
  cacheDir: './node_modules/vitepress_cache',
  description:
    '我是 kakahikari，一名前端工程師，專注 Web 與 App 的實戰開發與跨平台應用。光Lab. 紀錄工作上的筆記、開發筆記、踩過的坑與生活上的點滴分享。',
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

    const userDefinedProperties = new Set()

    if (pageData.frontmatter.meta) {
      pageData.frontmatter.meta.forEach(item => {
        if (item.property && item.content) {
          userDefinedProperties.add(item.property)
          let content = item.content
          // Add hostname to og:image if it's a relative path
          if (item.property === 'og:image' && content.startsWith('/')) {
            content = `${HOSTNAME}${content}`
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
      head.push(['meta', { property: 'og:type', content: 'website' }])
    }
    if (!userDefinedProperties.has('og:url')) {
      head.push(['meta', { property: 'og:url', content: pageUrl }])
    }
    if (!userDefinedProperties.has('og:image')) {
      head.push(['meta', { property: 'og:image', content: defaultOGImage }])
    }

    if (head.length > 0) {
      pageData.frontmatter.head = (pageData.frontmatter.head || []).concat(head)
    }
  },

  themeConfig: {
    posts: await getPosts(PAGE_SIZE),
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
