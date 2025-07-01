<script setup lang="ts">
import type { NoNull } from '#shared/types'

const { features } = useRuntimeConfig().public.ecommerce

const { product } = defineProps<{
  product: NoNull<Product> & {
    variantId?: string
    variantAttributes?: Array<{
      optionId: string
      optionName: string
      hint?: string
      color?: string
      image?: string
      attributeName: string
      attributeType: string
    }>
  }
}>()

// Utility function to check if a string is a valid hex color
const isHexColor = (color: string) => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color)
}

const getDiscounted = computed(() => {
  const price = Number(product.salePrice) || 0
  const discount = Number(product.discount) || 0
  return (price - (price * discount / 100)).toFixed(2)
})

const getOriginalPrice = computed(() => {
  return (Number(product.salePrice) || 0).toFixed(2)
})

// Format image URL from potentially JSON-stringified path
const formatImageUrl = (imgPath: string) => {
  if (!imgPath) return '/Noimage.jpg'

  try {
    // Handle cases where the path might be JSON stringified
    if (imgPath.trim().startsWith('[')) {
      const parsed = JSON.parse(imgPath)
      if (Array.isArray(parsed)) {
        imgPath = parsed[0] || ''
      }
    }
  }
  catch (e) {
    console.error('Error parsing image path:', e)
  }

  // Clean up the path
  imgPath = imgPath.replace(/^\[|\]|"|\\/g, '')

  // Handle different path formats
  if (imgPath.startsWith('http') || imgPath.startsWith('/')) {
    return imgPath
  }

  // Default case - prepend slash
  return `/${imgPath}`
}

// Enhanced variant information display
const variantDisplay = computed(() => {
  if (!product.variantAttributes?.length) return null

  return product.variantAttributes.map(attr => {
    if (attr.attributeType.toUpperCase() === 'COLOR') {
      return {
        type: 'color',
        label: attr.attributeName,
        value: attr.optionName,
        color: attr.color || (isHexColor(attr.optionName) ? attr.optionName : '')
      }
    }

    if (attr.attributeType.toUpperCase() === 'IMAGE' && attr.image) {
      return {
        type: 'image',
        label: attr.attributeName,
        value: attr.optionName,
        image: formatImageUrl(attr.image)
      }
    }

    return {
      type: 'text',
      label: attr.attributeName,
      value: attr.optionName
    }
  })
})

const thumbnailUrl = computed(() => {
  if (!product?.thumbnail) return '/Noimage.jpg'

  // Handle cases where thumbnail might be string or array
  const thumb = Array.isArray(product.thumbnail)
    ? product.thumbnail[0]
    : product.thumbnail

  // Check if already full URL or absolute path
  if (thumb.startsWith('http') || thumb.startsWith('/')) {
    return thumb
  }

  return `/${thumb}`
})

const imageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/Noimage.jpg'
  img.onerror = null // Prevent infinite loop
}

const handleVariantImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Failed to load variant image:', img.src)
  img.src = '/Noimage.jpg'
  img.onerror = null
}

// Debug mounted hook
onMounted(() => {
  console.log('Product data:', product)
  if (product.variantAttributes) {
    console.log('Variant attributes:', product.variantAttributes)
    product.variantAttributes.forEach((attr, index) => {
      if (attr.image) {
        console.log(`Variant ${index} image:`, {
          raw: attr.image,
          formatted: formatImageUrl(attr.image)
        })
      }
    })
  }
})
</script>

<template>
  <div class="flex items-center gap-4">
    <img
      :src="thumbnailUrl"
      class="size-20 rounded object-cover border border-neutral-200 dark:border-neutral-700"
      :alt="product.name"
      @error="imageError">

    <div class="flex-1">
      <p class="font-semibold text-neutral-800 dark:text-neutral-100">
        {{ product.name }}
      </p>

      <!-- Variant attributes display -->
      <div v-if="variantDisplay" class="flex flex-wrap gap-2 mt-1">
        <div v-for="(attr, index) in variantDisplay" :key="index" class="flex items-center gap-1">
          <!-- Color variant -->
          <template v-if="attr.type === 'color' && attr.color">
            <div
              class="w-4 h-4 rounded-full border border-gray-200"
              :style="{ backgroundColor: attr.color || attr.value }"
              :title="attr.value" />
          </template>

          <!-- Image variant -->
          <template v-else-if="attr.type === 'image' && attr.image">
            <div class="flex items-center gap-1">
              <img
                :src="attr.image"
                class="w-8 h-8 rounded object-cover border"
                :alt="attr.value"
                @error="handleVariantImageError">
              <span v-if="attr.value " class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ attr.label }}: {{ attr.value }}
              </span>
            </div>
          </template>

          <!-- Text variant -->
          <template v-else>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ attr.label }}: {{ attr.value }}
            </span>
          </template>
        </div>
      </div>

      <!-- Price display -->
      <div class="flex items-center gap-3 mt-1">
        <p class="text-md font-bold text-[var(--ui-color-primary-500)]">
          {{ formatCurrency(getDiscounted) }}
        </p>
        <s
          v-if="product.discount > 0"
          class="text-sm text-[var(--ui-color-error-500)]">
          {{ formatCurrency(getOriginalPrice) }}
        </s>
      </div>

      <!-- Quantity -->
      <p class="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
        Quantity: {{ product.quantity }}
      </p>
    </div>
  </div>
</template>
