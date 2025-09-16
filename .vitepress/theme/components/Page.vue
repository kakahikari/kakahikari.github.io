<template>
  <template v-for="(post, index) in posts" :key="index">
    <div class="post">
      <div class="post-content">
        <div class="post-text">
          <div class="post-header">
            <div class="post-title">
              <a :href="withBase(post.regularPath)">
                {{ post.frontMatter.title }}
              </a>
            </div>
          </div>
          <div v-if="getOgImage(post)" class="post-cover-mobile">
            <a :href="withBase(post.regularPath)">
              <img
                :src="getOgImage(post)"
                :alt="post.frontMatter.title"
                loading="lazy"
              />
            </a>
          </div>
          <div class="post-info">
            <PostDate :date="post.frontMatter.date" />
            <PostCategory
              v-if="post.frontMatter.category"
              :href="
                withBase(
                  `/pages/category.html?category=${post.frontMatter.category}`,
                )
              "
            >
              {{ post.frontMatter.category }}
            </PostCategory>
            <PostTag
              v-for="item in post.frontMatter.tags"
              :key="item"
              :href="withBase(`/pages/tags.html?tag=${item}`)"
            >
              {{ item }}
            </PostTag>
          </div>
          <p class="post-describe">{{ post.frontMatter.description }}</p>
        </div>
        <div v-if="getOgImage(post)" class="post-cover-desktop">
          <a :href="withBase(post.regularPath)">
            <img
              :src="getOgImage(post)"
              :alt="post.frontMatter.title"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </div>
    <hr v-if="index !== posts.length - 1" />
  </template>
  <Pagination
    v-if="pagesNum > 1"
    :page-current="pageCurrent"
    :pages-num="pagesNum"
    :get-page-url="getPageUrl"
  />
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress'

import type { Post } from '../types'

defineProps<{
  posts: Post[]
  pageCurrent: number
  pagesNum: number
}>()

const getPageUrl = (pageNum: number): string => {
  return pageNum === 1 ? '/index.html' : `/page_${pageNum}.html`
}

const getOgImage = (post: Post): string | undefined => {
  if (!post.frontMatter.meta) return undefined

  const ogImageMeta = post.frontMatter.meta.find(
    meta => meta.property === 'og:image',
  )

  return ogImageMeta?.content || undefined
}
</script>

<style scoped>
.post {
  margin: calc(var(--block-margin) * 1.5) 0;
}

.post-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.post-text {
  flex: 1;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-title {
  width: 100%;
  font-weight: 500;
  font-size: 1.125rem;
}

.post-title a {
  margin: 0;
  color: var(--post-title-color);
  text-decoration: none;
}

.post-title a:hover {
  color: color-mix(in srgb, var(--post-title-color), var(--vp-c-brand-1));
}

.post-cover-desktop {
  flex-shrink: 0;
  width: 240px;
  overflow: hidden;
  border-radius: 8px;
}

.post-cover-desktop img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.post-cover-mobile {
  display: none;
  margin: 10px 0;
  overflow: hidden;
  border-radius: 8px;
}

.post-cover-mobile img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-describe {
  display: -webkit-box;
  font-size: 0.9375rem;
  box-orient: vertical;
  line-clamp: 3;
  margin: calc(var(--block-margin) / 2) 0 !important;
  overflow: hidden;
  color: var(--vp-c-text-2);
  line-height: 1.5rem;
}

/* TODO: 媒體查詢無法使用變數的替代方案 */
@media screen and (max-width: 768px) {
  .post {
    margin: calc(var(--block-margin)) 0;
  }

  .post-content {
    flex-direction: column;
    gap: 0;
  }

  .post-cover-desktop {
    display: none;
  }

  .post-cover-mobile {
    display: block;
  }

  .post-cover-mobile img {
    height: 150px;
  }

  .post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .post-title {
    display: -webkit-box;
    font-weight: 400;
    box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .post-describe {
    display: -webkit-box;
    box-orient: vertical;
    line-clamp: 3;
    overflow: hidden;
  }
}
</style>
