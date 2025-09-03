<template>
  <div v-if="url" class="video-responsive">
    <iframe
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

<style scoped>
.video-responsive {
  position: relative;
  height: 0;
  /* 16:9 */
  padding-bottom: 56.25%;
  overflow: hidden;
}

.video-responsive iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
