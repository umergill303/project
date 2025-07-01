<script setup lang="ts">
import type { Slider } from '~~/server/database/schema'

defineEmits(['delete', 'modal'])
defineProps<{ sliders: Slider[], loading: boolean }>()

const getContentAlignment = (layout: string): string => {
  const alignments: Record<string, string> = {
    default: 'items-end',
    bottom: 'items-end justify-end',
    right: 'items-center justify-end',
    left: 'items-center justify-start',
  }

  return alignments[layout] ?? (alignments.default as string)
}
</script>

<template>
  <template v-if="loading">
    <USkeleton />
  </template>
  <template v-else-if="sliders.length === 0 && !loading">
    <DashboardPartialsEmptyCard title="Slider" label="Add Classification" has-click @click="$emit('modal')" />
  </template>
  <template v-else>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div v-for="slider in sliders" :key="slider.id" class="relative w-full h-60 sm:h-70 md:h-80 lg:h-80 overflow-hidden rounded shadow-xl">
        <div class="flex items-center absolute top-4 right-4 z-50 gap-1 *:cursor-pointer">
          <UButton color="info" variant="soft" size="sm" icon="i-lucide-square-pen" @click="$emit('modal', slider)" />
          <UButton color="error" variant="soft" size="sm" icon="i-lucide-trash-2" @click="$emit('delete', slider.id)" />
        </div>
        <NuxtImg
          v-if="slider.image"
          :src="slider.image"
          :provider="slider.image.startsWith('http') ? undefined: 'cloudflare'"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          :class="{
            'object-left': slider.layout === 'left',
            'object-right': slider.layout === 'right',
            'object-center': slider.layout === 'default' || slider.layout === 'bottom',
          }" />

        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

        <div
          v-if="slider.label || slider.description || slider.buttonText"
          class="absolute inset-0 flex px-4 py-3 sm:py-5 sm:px-7 z-20"
          :class="getContentAlignment(slider.layout?? '')">
          <div
            class="w-2/3 sm:w-1/2 space-y-1.5 text-white bg-black/40 backdrop-blur-md px-4 py-3 rounded-md animate-fade-in-up">
            <p class="font-bold text-sm sm:text-md font-['Lato']">
              {{ slider.label }}
            </p>
            <p class="text-xs sm:text-sm text-white/80 font-['Lato', sans-serif]">
              {{ slider.description }}
            </p>
            <UButton v-if="slider.buttonText" :label="slider.buttonText" :color="slider.buttonColor" size="sm" class="px-4" />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}
</style>
