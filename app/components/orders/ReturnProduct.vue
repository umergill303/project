<script setup lang="ts">
import type { NoNull } from '#shared/types'

const { features } = useRuntimeConfig().public.ecommerce

const { product } = defineProps<{
  product: NoNull<Product> & {
    variantOptions?: string
    variantName?: string
    variantColor?: string
    variantImage?: string
    variantAttributes?: Array<{
      optionId: string
      optionName: string
      color?: string
      image?: string
      attributeName: string
      attributeType: string
    }>
  }
}>()

const getDiscounted = computed(() => getDiscountedU(Number(product.salePrice) || 0, Number(product.discount) || 0))

// Improved variant options parser
const variantOptions = computed(() => {
  try {
    if (!product.variantOptions) return []
    const parsed = JSON.parse(product.variantOptions)
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
})

// Improved variant image parser
const variantImages = computed(() => {
  try {
    if (!product.variantImage) return []
    // Handle both stringified array and direct string cases
    const parsed = JSON.parse(product.variantImage)
    if (Array.isArray(parsed)) return parsed
    if (typeof parsed === 'string') return [parsed]
    return []
  }
  catch {
    // If parsing fails, try to treat it as a direct string
    if (typeof product.variantImage === 'string') {
      return [product.variantImage]
    }
    return []
  }
})

// Enhanced variant processing with better image handling
const variants = computed(() => {
  // If we have structured variantAttributes, use those
  if (product.variantAttributes?.length) {
    return product.variantAttributes.map(attr => {
      let image = null
      try {
        if (attr.image) {
          const parsed = JSON.parse(attr.image)
          image = Array.isArray(parsed) ? parsed[0] : parsed
        }
      }
      catch {
        image = attr.image
      }

      return {
        name: attr.optionName,
        color: attr.color || (isColorCode(attr.optionName)) ? attr.optionName : '',
        image: image,
        attributeName: attr.attributeName,
        type: attr.attributeType.toLowerCase()
      }
    })
  }

  // Fallback to variantOptions
  if (variantOptions.value.length) {
    return variantOptions.value.map((option: any) => {
      let image = null
      try {
        if (option.image) {
          const parsed = JSON.parse(option.image)
          image = Array.isArray(parsed) ? parsed[0] : parsed
        }
      }
      catch {
        image = option.image
      }

      return {
        ...option,
        color: option.color || (isColorCode(option.name)) ? option.name : '',
        image: image
      }
    })
  }

  // Final fallback to direct properties
  return [{
    name: product.variantName || '',
    color: product.variantColor || (isColorCode(product.variantName)) ? product.variantName : '',
    image: variantImages.value[0] || null,
    attributeName: 'Variant'
  }]
})

// Check if string is a color code
const isColorCode = (str: string | undefined): boolean => {
  return !!str && /^#([0-9A-F]{3}){1,2}$/i.test(str)
}

// Check if we have any variant data to show
const hasVariants = computed(() => {
  return variants.value.some(v => v.name || v.color || v.image) && features.productVariants
})
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtImg
      :provider="getThumbnail(product.thumbnail)[0] ? 'cloudflare' : undefined"
      :src="getThumbnail(product.thumbnail)[0] || '/Noimage.jpg'"
      class="size-20 rounded object-cover border border-neutral-200 dark:border-neutral-700"
      :alt="product.name" />
    <div>
      <p class="font-semibold text-neutral-800 dark:text-neutral-100">
        {{ product.name }}
      </p>

      <div class="flex gap-2">
        <p class="text-md font-bold text-[var(--ui-color-primary-500)]">
          ${{ getDiscounted }}
        </p>
        <s v-if="product.discount && product.discount > 0" class="text-sm text-[var(--ui-color-error-500)] mt-0.5">
          ${{ product.salePrice }}
        </s>
      </div>

      <!-- Variant Information -->
      <div v-if="hasVariants" class="flex flex-wrap items-center gap-2 mt-1">
        <div v-for="(variant, index) in variants" :key="index" class="flex items-center gap-1">
          <!-- Image variant -->
          <template v-if="variant.image">
            <NuxtImg
              :src="variant.image"
              class="w-6 h-6 rounded object-cover border border-neutral-200"
              :alt="variant.name || 'Variant image'"
              provider="cloudflare" />
          </template>

          <!-- Color variant (show swatch if we have color code) -->
          <template v-else-if="variant.color || isColorCode(variant.name)">
            <span
              class="w-4 h-4 rounded-full border border-neutral-200 flex-shrink-0"
              :style="{ backgroundColor: variant.color || variant.name }"
              :title="variant.name" />
            <span v-if="variant.name" class="text-xs text-neutral-600 dark:text-neutral-400">
              <UButton
                color="neutral"
                variant="outline"
                size="xs">
                {{ variant.name }}
              </UButton>
            </span>
          </template>

          <!-- Text-only variant -->
          <template v-else-if="variant.name">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">
              <UButton
                color="neutral"
                variant="outline"
                size="xs">
                {{ variant.attributeName }}: {{ variant.name }}
              </UButton>
            </span>
          </template>
        </div>
      </div>

      <p class="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
        {{ product?.quantity }}x
      </p>
    </div>
  </div>
</template>
