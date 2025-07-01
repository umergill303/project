<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const props = defineProps<{
  size: 'sm' | 'md'
  color: ButtonProps['color']
}>()

const spinnerSize = computed(() => {
  const sizes: Record<'sm' | 'md', string> = {
    sm: 'size-6',
    md: 'size-10',
  }
  return sizes[props.size] || sizes.md
})
</script>

<template>
  <div
    class="inline-flex items-center justify-center"
    :class="spinnerSize"
    role="status"
    aria-live="polite">
    <div
      class="animate-spin rounded-full border-4 border-t-transparent"
      :class="[spinnerSize, `border-${color}`]" />
  </div>
</template>
