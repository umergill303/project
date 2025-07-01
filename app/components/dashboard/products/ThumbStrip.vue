<!-- <script lang="ts" setup>
const props = defineProps<{ productVideo?: string, productThumbnails: string[] }>()

const mediaItems = computed(() => {
  const items = [...props.productThumbnails]
  if (props.productVideo) {
    items.unshift(`/${props.productVideo}`)
  }
  return items
})

const defaultImg = ref(mediaItems.value[0] || '')
const changeImg = (img: string) => (defaultImg.value = img)
const thumbnails = computed(() => props.productThumbnails)
const showArrows = computed(() => thumbnails.value.length > 5)
</script> -->
// app/components/dashboard/products/ThumbStrip.vue
<script lang="ts" setup>
const props = defineProps<{
  productVideo?: string
  productThumbnails: string[]
  modelValue: string // v-model:selectedImage
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const mediaItems = computed(() => {
  const items = [...props.productThumbnails]
  if (props.productVideo) {
    items.unshift(`/${props.productVideo}`)
  }
  return items
})

const defaultImg = computed({
  get: () => props.modelValue || mediaItems.value[0] || '',
  set: (val: string) => emit('update:modelValue', val),
})

const changeImg = (img: string) => {
  defaultImg.value = img
}

const thumbnails = computed(() => props.productThumbnails)
const showArrows = computed(() => thumbnails.value.length > 5)
</script>

<template>
  <div class="space-y-3 w-72 md:w-90 lg:w-125 flex items-center flex-col">
    <div v-if="defaultImg.endsWith('.mp4')" class="w-full flex items-center justify-center aspect-square rounded shadow-sm overflow-hidden bg-black/75">
      <video controls class="aspect-14/9 object-contain bg-black/75" muted playsinline>
        <source :src="defaultImg" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
    <NuxtImg
      v-else
      :src="defaultImg || '/Noimage.jpg'"
      provider="cloudflare"
      class="object-cover object-center aspect-square w-full rounded shadow-sm bg-(--ui-border-accented)" />
    <UCarousel
      v-slot="{ item }"
      :arrows="showArrows"
      :items="mediaItems.length ? mediaItems : ['/Noimage.jpg']"
      :ui="{
        root: 'w-80 sm:w-90 md:w-90 lg:w-125 h-16 sm:h-18 md:h-20',
        container: mediaItems.length > 5 ? 'flex justify-start' : 'flex justify-center',
        item: 'basis-1/5 md:basis-1/4 lg:basis-1/6',
        prev: 'ml-0 md:ml-13',
        next: 'mr-0 md:mr-13',
        arrows: 'opacity-55',
      }">
      <div class="cursor-pointer aspect-square w-16 sm:w-18 md:w-20 rounded shadow-sm overflow-hidden" @mouseover="changeImg(item)">
        <video
          v-if="item.endsWith('.mp4')"
          class="w-full h-full object-cover"
          muted
          playsinline>
          <source :src="item" type="video/mp4">
        </video>
        <NuxtImg
          v-else
          :src="item || '/Noimage.jpg'"
          provider="cloudflare"
          class="w-full h-full object-cover bg-(--ui-border-accented)" />
      </div>
    </UCarousel>
  </div>
</template>
