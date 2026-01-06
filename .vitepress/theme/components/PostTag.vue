<template>
  <a :href="href" class="post-tag" @click="handleClick">
    <span class="tag-hash">#</span>
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
.post-tag {
  display: inline-flex;
  position: relative;
  align-items: center;
  margin: 0 !important;
  padding: var(--tag-padding-y) var(--tag-padding-x);
  padding-right: calc(var(--tag-padding-x) * 1.5);
  background-color: var(--tag-bg);
  color: var(--tag-text);
  font-weight: 500;
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

.post-tag:hover {
  background-color: var(--tag-bg-hover);
  box-shadow: var(--tag-shadow);
  color: var(--tag-text-hover);
}

.tag-hash {
  margin-right: 2px;
  opacity: 0.6;
}
</style>
