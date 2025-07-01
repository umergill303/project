<script setup lang="ts">
defineProps<{
  preview?: boolean
}>()
</script>

<template>
  <div class=" relative overflow-hidden">
    <div class="absolute bg-(--ui-active) py-2 w-full text-center font-medium z-20">
      Left Layout
    </div>
    <div :class="['relative h-full w-full', preview ? 'h-40' : 'h-full']">
      <div class="absolute inset-0 bg-(--ui-bg-accented)" />
      <div class="absolute flex flex-col justify-center gap-1 left-3 top-11 bottom-0 w-1/2 backdrop-blur-sm">
        <div class="h-3 w-3/4 bg-(--ui-text-dimmed) rounded" />
        <div class="h-6 w-full bg-(--ui-text-dimmed) rounded" />
        <div class="h-3 w-2/3 bg-(--ui-text-dimmed) rounded" />
      </div>
    </div>
  </div>
</template>
