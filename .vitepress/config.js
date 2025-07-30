import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'

// 每頁的文章數量
const pageSize = 10

// Google Analytics ID from environment variable
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID || ''

export default defineConfig({
  title: "kakahikari's blog",
  base: '/',
  outDir: 'dist',
  cacheDir: './node_modules/vitepress_cache',
  description: "kakahikari's blog",
  ignoreDeadLinks: true,
  themeConfig: {
    posts: await getPosts(pageSize),
    //copyright link
    website: 'https://kakahikari.github.io',
    comment: {
      repo: 'kakahikari/kakahikari.github.io',
      themes: 'github-light',
      issueTerm: 'pathname',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Category', link: '/pages/category' },
      { text: 'Archives', link: '/pages/archives' },
      { text: 'Tags', link: '/pages/tags' },
      { text: 'About', link: '/pages/about' },
      // { text: 'Airene', link: 'http://airene.net' }  -- External link test
    ],
    search: {
      provider: 'local',
    },
    //outline:[2,3],
    outlineTitle: '文章摘要',
    socialLinks: [{ icon: 'github', link: 'https://github.com/kakahikari' }],
  },
  srcExclude: ['README.md'], // exclude the README.md , needn't to compiler

  vite: {
    //build: { minify: false }
    server: { port: 5000 },
  },
  /*
      optimizeDeps: {
          keepNames: true
      }
      */

  sitemap: {
    hostname: 'https://kakahikari.github.io/',
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
})
