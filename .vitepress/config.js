import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'

//每页的文章数量
const pageSize = 10

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
})
