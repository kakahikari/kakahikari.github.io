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
  position: relative;
  align-items: center;
  margin: 0 !important;
  padding: var(--tag-padding-y) var(--tag-padding-x);
  padding-right: calc(var(--tag-padding-x) * 2);
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 12px;
  line-height: 1.25;
  text-decoration: none;
  clip-path: polygon(
    0 0,
    calc(100% - 10px) 0,
    100% 50%,
    calc(100% - 10px) 100%,
    0 100%
  );
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.post-category:hover {
  background-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
</style>
