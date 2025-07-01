<script setup lang="ts">
import type { NoNull } from '#shared/types'

const appConfig = useAppConfig()
const route = useRoute()
interface Props {
  title?: string
  categories: NoNull<Category>[]
}
const props = defineProps<Props>()
</script>

<template>
  <section>
    <div v-if="title" class="text-2xl font-bold mb-4 sm:mb-6 lg:mb-8">
      {{ title }}
    </div>
    <UCarousel
      v-slot="{ item }"
      loop
      arrows
      wheel-gestures
      :prev-icon="appConfig.ui.icons.arrowLeft"
      :next-icon="appConfig.ui.icons.arrowRight"
      :items="props.categories"
      :prev="{ color: 'neutral', variant: 'soft' }"
      :next="{ color: 'neutral', variant: 'soft' }"
      :ui="{
        item: 'basis-1/3 sm:basis-1/4 md:basis-1/6 ps-1 flex items-start',
        prev: 'h-20 start-0 sm:start-0',
        next: 'h-20 end-0 sm:end-0',
      }">
      <UPageCard
        variant="soft"
        :to="{ path: '/products', query: { ...route.query, category: item.id } }"
        class="relative w-full aspect-square overflow-hidden">
        <NuxtImg
          :src="item.logo || '/No-Image-Placeholder.svg'"
          :provider="item.logo ? 'cloudflare' : undefined"
          class="rounded w-full aspect-square object-cover"
          :alt="item.name" />
        <UBadge
          color="neutral"
          variant="subtle"
          size="xl"
          :label="item.name"
          class="absolute left-1/2 bottom-1 -translate-x-1/2" />
      </UPageCard>
    </UCarousel>
  </section>
</template>
