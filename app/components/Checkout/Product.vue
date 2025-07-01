<script setup lang="ts">
import type { Product } from '~~/server/database/schema'
import { formatCurrency } from '~/utils/formatCurrency'

const { product } = defineProps<{ product: Product }>()
console.log('product', product)
const getDiscountedPrice = computed(() => {
  const salePrice = product.variant?.salePrice ?? product.salePrice ?? 0
  const discount = product.variant?.discount ?? product.discount ?? 0
  return salePrice - (salePrice * discount) / 100
})

const getTotalPrice = computed(() => {
  return (getDiscountedPrice.value * product.qty).toFixed(2)
})

// Helper function to check if string is a color code
const isColorCode = (str?: string): boolean => {
  return !!str && /^#([0-9A-F]{3}){1,2}$/i.test(str)
}

// Helper function to get display color
const getDisplayColor = (color?: string, name?: string): string | null => {
  if (color && isColorCode(color)) return color
  if (name && isColorCode(name)) return name
  return null
}

// Format variant options for display
const variantDisplay = computed(() => {
  if (!product.variant?.options?.length) return null

  // Group options by attribute
  const groupedOptions: Record<string, Array<{
    name: string
    color: string | null
    image?: string
  }>> = {}

  product.variant.options.forEach(option => {
    const attributeName = option.attribute?.name || 'Option'
    const displayColor = getDisplayColor(option.color, option.name)
    const displayName = isColorCode(option.name) ? option.name.replace(/^#/, '') : option.name

    if (!groupedOptions[attributeName]) {
      groupedOptions[attributeName] = []
    }

    groupedOptions[attributeName].push({
      name: displayName,
      color: displayColor,
      image: option.image
    })
  })

  return Object.entries(groupedOptions).map(([attribute, options]) => ({
    attribute,
    options
  }))
})
const getThumbnails = (thumbnail: string | string[] | undefined): string[] => {
  if (!thumbnail) return []
  if (Array.isArray(thumbnail)) return thumbnail
  try {
    // Handle both JSON strings and direct strings
    if (typeof thumbnail === 'string' && thumbnail.startsWith('[')) {
      return JSON.parse(thumbnail)
    }
    return [thumbnail]
  }
  catch {
    return []
  }
}
</script>

<template>
  <div class="flex justify-between items-center">
    <div class="flex gap-3 items-center p-3 w-full">
      <NuxtImg
        :provider="product.thumbnail ? 'cloudflare' : undefined"
        :src="product.thumbnail[0] || '/Noimage.jpg'"
        alt="Product Image"
        class="h-16 w-16 rounded object-cover shadow bg-(--ui-border-accented)" />
      <div class="space-y-1 w-full">
        <p class="font-medium text-neutral">
          {{ product.name }}
        </p>

        <!-- Variant Options Display -->
        <div v-if="variantDisplay?.length" class="flex flex-wrap gap-2 mt-1">
          <div
            v-for="(group, groupIndex) in variantDisplay"
            :key="groupIndex"
            class="flex items-center gap-1 text-sm">
            <span class="text-gray-500">{{ group.attribute }}:</span>

            <div class="flex items-center gap-1">
              <template v-for="(option, optionIndex) in group.options" :key="optionIndex">
                <!-- Color swatch -->
                <span
                  v-if="option.color"
                  class="inline-block size-3 rounded-full border border-gray-200 dark:border-gray-600"
                  :style="{ backgroundColor: option.color }"
                  :title="option.name" />

                <!-- Image thumbnail -->
                <template v-else-if="option.image">
                  <div class="flex items-center gap-1">
                    <template v-if="getThumbnails(option.image).length > 0">
                      <NuxtImg
                        :src="getThumbnails(option.image)[0]"
                        :alt="option.name"
                        class="novel-img w-6 h-6 rounded object-cover"
                        provider="cloudflare" />
                    </template>
                    <span v-if="option.name" class="text-xs">
                      <UButton color="neutral" variant="soft" size="xs" class="border border-gray-300">
                        {{ option.name }}
                      </UButton>
                    </span>
                  </div>
                </template>

                <!-- <span>{{ option.name }}</span> -->

                <!-- Add separator between options if not last -->
                <span v-if="optionIndex < group.options.length - 1" class="mx-1">•</span>
              </template>
            </div>
          </div>
        </div>

        <div class="flex justify-between gap-3 font-medium">
          <p>{{ formatCurrency(getDiscountedPrice || 0) }} × {{ product.qty || 0 }}</p>
          <p>{{ formatCurrency(getTotalPrice || 0) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
