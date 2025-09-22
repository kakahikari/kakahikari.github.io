<template>
  <div :class="`modal-image-container align-${align}`">
    <img
      :src="src"
      :alt="alt"
      :style="inlineStyle"
      class="modal-image-inline"
      @click="openModal"
    />
    <div v-if="caption" class="modal-image-caption">
      {{ caption }}
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="modal-image-overlay" @click="closeModal">
        <div class="modal-image-content" @click.stop>
          <button
            class="modal-image-close"
            aria-label="關閉圖片檢視"
            @click="closeModal"
          >
            ×
          </button>
          <img :src="src" :alt="caption" class="modal-image-full" />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },
  caption: {
    type: String,
    default: '',
  },
  align: {
    type: String,
    default: 'center',
    validator: value => ['left', 'center', 'right'].includes(value),
  },
})

const isModalOpen = ref(false)

const inlineStyle = computed(() => {
  const style = {}
  if (props.width) style.width = `${props.width}px`
  if (props.height) style.height = `${props.height}px`
  return style
})

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

const handleEscapeKey = event => {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  if (isModalOpen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-image-container {
  display: block;
  width: fit-content;
  margin: var(--block-margin) 0;
  text-align: -webkit-center;
}

.modal-image-container.align-left {
  margin-right: auto;
  margin-left: 0;
}

.modal-image-container.align-center {
  margin-right: auto;
  margin-left: auto;
}

.modal-image-container.align-right {
  margin-right: 0;
  margin-left: auto;
}

.modal-image-inline {
  max-width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-image-inline:hover {
  border-color: var(--vp-c-brand-1);
}

.modal-image-overlay {
  box-sizing: border-box;
  display: flex;
  z-index: 1000;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--vp-backdrop-bg-color);
  opacity: 1;
  transition: opacity 0.3s;
}

.modal-image-content {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
}

.modal-image-close {
  display: flex;
  z-index: 1001;
  position: fixed;
  top: 20px;
  right: 20px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--modal-image-button-bg);
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-image-close:hover {
  background: var(--modal-image-button-bg-hover);
}

.modal-image-full {
  max-width: 100%;
  max-height: calc(100vh - 40px);
  object-fit: contain;
  border-radius: 4px;
}

.modal-image-caption {
  max-width: 100%;
  padding: var(--inline-gap) 0;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 768px) {
  .modal-image-overlay {
    padding: 4px;
  }

  .modal-image-caption {
    font-size: 0.75rem;
  }

  .modal-image-close {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  .modal-image-full {
    max-height: calc(100vh - 8px);
  }
}
</style>
