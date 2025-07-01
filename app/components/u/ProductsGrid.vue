<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<template>
  <UCard variant="outline">
    <template v-if="title" #header>
      <div class="text-2xl font-bold">
        {{ title }}
      </div>
    </template>
    <div class="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-items-center gap-3">
      <slot />
    </div>
  </UCard>
</template>
