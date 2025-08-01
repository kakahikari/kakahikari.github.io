import { execSync } from 'child_process'
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
    transformItems: items => {
      return items.map(item => {
        // 從 URL 中提取相對路徑
        const path = item.url.replace('https://kakahikari.github.io/', '')

        let lastmod

        // posts 文章使用 git 提交時間
        if (path.startsWith('posts/')) {
          const filePath = path.replace('.html', '.md')
          try {
            const timestamp = execSync(
              `git log -1 --format=%ct -- "${filePath}"`,
              {
                encoding: 'utf8',
                cwd: process.cwd(),
              },
            ).trim()
            if (timestamp) {
              lastmod = new Date(parseInt(timestamp) * 1000)
                .toISOString()
                .split('T')[0]
            } else {
              // 如果沒有 git 歷史，使用當前時間
              lastmod = new Date().toISOString().split('T')[0]
            }
          } catch {
            lastmod = new Date().toISOString().split('T')[0]
          }
        } else {
          // 其他頁面都使用建置時的當前時間
          lastmod = new Date().toISOString().split('T')[0]
        }

        return {
          ...item,
          lastmod,
        }
      })
    },
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
