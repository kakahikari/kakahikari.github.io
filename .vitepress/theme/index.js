import './theme-overrides.css'

import DefaultTheme from 'vitepress/theme'

import Archives from './components/Archives.vue'
import Category from './components/Category.vue'
import Comment from './components/Comment.vue'
import ModalImage from './components/ModalImage.vue'
import Page from './components/Page.vue'
import Pagination from './components/Pagination.vue'
import PostCategory from './components/PostCategory.vue'
import PostDate from './components/PostDate.vue'
import PostList from './components/PostList.vue'
import PostTag from './components/PostTag.vue'
import Tags from './components/Tags.vue'
import ThemeLayout from './components/ThemeLayout.vue'
import YouTube from './components/YouTube.vue'

export default {
  extends: DefaultTheme,
  Layout: ThemeLayout,
  enhanceApp({ app }) {
    // register global component
    app.component('Tags', Tags)
    app.component('Category', Category)
    app.component('Archives', Archives)
    app.component('Page', Page)
    app.component('Pagination', Pagination)
    app.component('PostDate', PostDate)
    app.component('PostList', PostList)
    app.component('PostCategory', PostCategory)
    app.component('PostTag', PostTag)
    app.component('Comment', Comment)
    app.component('YouTube', YouTube)
    app.component('ModalImage', ModalImage)
  },
}
