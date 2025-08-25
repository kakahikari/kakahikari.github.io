<template>
  <div v-if="url" class="video-responsive">
    <iframe
      width="100%"
      height="400"
      :src="url"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  id: string
}>()

const url = computed(() => `https://www.youtube.com/embed/${props.id}`)
</script>

<style>
/* TODO: 播放器RWD */
</style>
