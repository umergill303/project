<script setup lang="ts">
interface Props { slides: Slider[] }

const props = defineProps<Props>()
console.log('Slider component loaded with slides:', props.slides)

const route = useRoute()
const getContentAlignment = (layout: string): string => {
  const alignments: Record<string, string> = {
    left: 'items-center justify-start',
    right: 'items-center justify-end',
    bottom: 'items-end justify-end',
    default: 'items-end',
  }
  return alignments[layout] ?? alignments.default
}

const getProductSlug = (product: Slider.product) => {
  // Safely handle cases where name might be undefined
  const name = product.name ? product.name.toLowerCase().replace(/\s+/g, '') : 'product'
  return `/products/${name}-${product.product}`
}
</script>

<template>
  <ClientOnly>
    <UCarousel
      v-slot="{ item }"
      :items="slides"
      :autoplay="{ delay: 3000 }"
      loop
      class="w-full h-64 sm:h-96 md:h-120">
      <NuxtLink
        v-if="item.product"

        class="relative w-full h-64 sm:h-96 md:h-120 overflow-hidden block">
        <NuxtImg
          v-if="item.image"
          :src="item.image"
          :provider="(item.image)?.startsWith('http') ? undefined : 'cloudflare'"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          :class="{
            'object-left': item.layout === 'left',
            'object-right': item.layout === 'right',
            'object-center': item.layout === 'default' || item.layout === 'bottom',
          }" />

        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

        <div v-if="item.label || item.description || item.buttonText" class="absolute inset-0 flex px-4 py-3 sm:py-5 sm:px-7 z-20" :class="getContentAlignment(item.layout ?? '')">
          <div class="w-1/2 md:w-1/3 space-y-1 sm:space-y-2 text-white bg-black/40 backdrop-blur-md px-4 py-3 rounded-md animate-fade-in-up">
            <p class="text-sm sm:text-2xl font-bold font-['Lato']">
              {{ item.label }}
            </p>
            <p class="text-sm sm:text-lg font-['Lato', sans-serif] text-white/80">
              {{ item.description }}
            </p>
            <UButton
              v-if="item.buttonText"
              :label="item.buttonText"
              :color="item.buttonColor"
              :to="getProductSlug(item)"
              class="px-4"
              @click.stop />
          </div>
        </div>
      </NuxtLink>

      <div
        v-else
        class="relative w-full h-64 sm:h-96 md:h-120 overflow-hidden">
        <NuxtImg
          v-if="item.image"
          :src="item.image"
          provider="cloudflare"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          :class="{
            'object-left': item.layout === 'left',
            'object-right': item.layout === 'right',
            'object-center': item.layout === 'default' || item.layout === 'bottom',
          }" />

        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

        <div v-if="item.label || item.description || item.buttonText" class="absolute inset-0 flex px-4 py-3 sm:py-5 sm:px-7 z-20" :class="getContentAlignment(item.layout ?? '')">
          <div class="w-1/2 md:w-1/3 space-y-1 sm:space-y-2 text-white bg-black/40 backdrop-blur-md px-4 py-3 rounded-md animate-fade-in-up">
            <p class="text-sm sm:text-2xl font-bold font-['Lato']">
              {{ item.label }}
            </p>
            <p class="text-sm sm:text-lg font-['Lato', sans-serif] text-white/80">
              {{ item.description }}
            </p>
            <UButton
              v-if="item.buttonText"
              :label="item.buttonText"
              :color="item.buttonColor"
              :to="{
                path: 'products',
                query: {
                  ...route.query,
                  category: item.category,
                },
              }"
              class="px-4" />
          </div>
        </div>
      </div>
    </UCarousel>
  </ClientOnly>
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
