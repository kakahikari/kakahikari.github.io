import './theme-overrides.css'

import DefaultTheme from 'vitepress/theme'

import Archives from './components/Archives.vue'
import Category from './components/Category.vue'
import Comment from './components/Comment.vue'
import Page from './components/Page.vue'
import PostTag from './components/PostTag.vue'
import Tags from './components/Tags.vue'
import ThemeLayout from './components/ThemeLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: ThemeLayout,
  enhanceApp({ app }) {
    // register global component
    app.component('Tags', Tags)
    app.component('Category', Category)
    app.component('Archives', Archives)
    app.component('Page', Page)
    app.component('PostTag', PostTag)
    app.component('Comment', Comment)
  },
}
