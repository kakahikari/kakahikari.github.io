<template>
  <span v-if="count !== null" class="post-pv">
    <svg class="pv-icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fill-rule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clip-rule="evenodd"
      />
    </svg>
    {{ count }}
  </span>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'

const count = ref<number | null>(null)

const emit = defineEmits<{
  ready: []
}>()

const { theme } = useData()

onMounted(async () => {
  const apiUrl = theme.value.pvApiUrl
  if (!apiUrl) {
    emit('ready')
    return
  }

  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(apiUrl, {
      method: 'GET',
      referrerPolicy: 'unsafe-url',
    })

    if (response.ok) {
      const data = await response.json()
      count.value = data.count
    } else {
      count.value = 0
    }
  } catch {
    count.value = 0
  }

  emit('ready')
})
</script>

<style scoped>
.post-pv {
  display: inline-flex;
  align-items: center;
  padding: 0;
  gap: calc(var(--inline-gap) / 2);
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.75rem;
}

.pv-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}
</style>
