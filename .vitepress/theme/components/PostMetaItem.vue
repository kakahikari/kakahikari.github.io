<template>
  <span class="post-meta-item">
    <slot />
  </span>
</template>

<style scoped>
.post-meta-item {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--inline-gap) / 2);
  font-weight: 500;
  font-size: 0.75rem;
}

.post-meta-item :deep(svg) {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}
</style>
