<template>
  <a :href="href" class="post-tag" @click="handleClick">
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

const handleClick = (event: any) => {
  if (props.onClick) {
    event.preventDefault()
    props.onClick()
  }
}
</script>

<style scoped>
.post-tag {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  padding: 2px 8px;
  border: 1px solid var(--tag-border);
  border-radius: 9999px;
  background-color: var(--tag-bg);
  color: var(--tag-text);
  font-weight: 500;
  font-size: 12px;
  line-height: 1.25;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.post-tag:hover {
  background-color: var(--tag-bg-hover);
  box-shadow: var(--tag-shadow);
  color: var(--tag-text-hover);
}
</style>
