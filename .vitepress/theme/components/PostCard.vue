<template>
  <div class="post-content">
    <div class="post-text">
      <div class="post-header">
        <h2 class="post-title">
          <a :href="withBase(post.regularPath)">
            {{ post.frontMatter.title }}
          </a>
        </h2>
      </div>
      <div v-if="cover" class="post-cover-mobile">
        <a :href="withBase(post.regularPath)">
          <img
            :src="cover.src"
            :srcset="srcset"
            :sizes="SIZES"
            :alt="post.frontMatter.title"
            :width="cover.width ?? undefined"
            :height="cover.height ?? undefined"
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
    <div v-if="cover" class="post-cover-desktop">
      <a :href="withBase(post.regularPath)">
        <img
          :src="cover.src"
          :srcset="srcset"
          :sizes="SIZES"
          :alt="post.frontMatter.title"
          :width="cover.width ?? undefined"
          :height="cover.height ?? undefined"
          loading="lazy"
        />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { withBase } from 'vitepress'
import { computed } from 'vue'

import type { Post } from '../types'

const props = defineProps<{
  post: Post
}>()

// 手機為滿版扣掉內容左右 padding，桌機固定 240px
const SIZES = '(max-width: 768px) calc(100vw - 48px), 240px'

const cover = computed(() => props.post.cover)

// 沒有 WebP 衍生檔時留空，瀏覽器直接用 src 的原圖
const srcset = computed(() => {
  const variants = cover.value?.variants ?? []
  if (!variants.length) {
    return undefined
  }
  return variants.map(v => `${withBase(v.url)} ${v.width}w`).join(', ')
})
</script>

<style scoped>
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

/* 重置 heading 樣式，維持原本 div 的外觀（theme-overrides 的 .VPDoc h2 帶 !important，需同等權重覆寫） */
.post-title {
  width: 100%;
  margin: 0 !important;
  padding-top: 0;
  border-top: none;
  font-weight: 500;
  font-size: 1.125rem !important;
  line-height: inherit;
  letter-spacing: normal;
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

@media (--mobile) {
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
