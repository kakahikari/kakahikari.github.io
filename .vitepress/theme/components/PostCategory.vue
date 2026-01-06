<template>
  <a :href="href" class="post-category" @click="handleClick">
    <slot />
  </a>
</template>

<script setup lang="ts">
interface Props {
  href?: string
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  href: '#',
  onClick: undefined,
})

const handleClick = (event: Event) => {
  if (props.onClick) {
    event.preventDefault()
    props.onClick()
  }
}
</script>

<style scoped>
.post-category {
  display: inline-flex;
  align-items: center;
  margin: 0 !important;
  padding: var(--tag-padding-y) var(--tag-padding-x);
  border: 1px solid var(--category-border);
  border-radius: 9999px;
  background-color: var(--category-bg);
  color: var(--category-text);
  font-weight: 600;
  font-size: 12px;
  line-height: 1.25;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.post-category:hover {
  background-color: var(--category-bg-hover);
  color: var(--category-text-hover);
}
</style>
