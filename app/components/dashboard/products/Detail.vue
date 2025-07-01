<script lang="ts" setup>
import { formatCurrency } from '~/utils/formatCurrency'
import type { Product as BaseProduct, Tag } from '~~/server/database/schema'

interface Product extends BaseProduct {
  brandLogo?: string | null
}

const props = defineProps<{
  product: Product & { specs?: Record<string, string> }
  tags: Tag[]
  seoTags: Tag[]
  productThumbnails: string[]
}>()

const selectedImage = ref(props.productThumbnails[0] || '')

console.log('variant', props.product)

function parseImage(image: string | string[] | null): string[] {
  if (!image) return []
  if (Array.isArray(image)) return image
  try {
    return JSON.parse(image) as string[]
  }
  catch {
    return [image]
  }
}

const attributeMatrix = computed(() => {
  return attributes.value.map(attr => ({
    id: attr.id,
    name: attr.name,
    attributeType: attr.attributeType, // include this
    options: attr.options.map(option => ({
      id: option.id,
      name: option.name,
      color: option.color,
      image: option.image
    }))
  }))
})

const parsedSpecs = computed(() => {
  try {
    return JSON.parse(props.product.specs)
  }
  catch {
    console.log('Invalid JSON in specs')
    return {}
  }
})

const parsedHighlights = computed(() => {
  try {
    return JSON.parse(props.product.highlights ?? '[]')
  }
  catch {
    console.log('Invalid JSON in highlights')
    return {}
  }
})

const estimatedDeliveryRange = computed(() => {
  const value = props.product.estimatedDelivery
  if (!value) return ''

  const [numStr, unit] = value.split(' ')
  const num = parseInt(numStr || '')
  if (isNaN(num)) return ''

  const now = new Date()
  const endDate = new Date(now)

  switch (unit?.toLowerCase()) {
    case 'day':
    case 'days':
      endDate.setDate(now.getDate() + num)
      break
    case 'month':
    case 'months':
      endDate.setMonth(now.getMonth() + num)
      break
    case 'year':
    case 'years':
      endDate.setFullYear(now.getFullYear() + num)
      break
    default:
      return ''
  }

  const format = (d: Date) =>
    d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

  return `${format(now)} to ${format(endDate)}`
})

// Get product data with variants from the main API endpoint
const { data: productData } = await useFetch(`/api/products/${props.product.id}`)

const attributes = computed(() => productData.value?.attributes || [])
const variants = computed(() => productData.value?.variants || [])

// State for selected options
const selectedOptions = ref<Record<number, number>>({}) // attributeId -> optionId

// Computed property to find the matching variant based on selected options
const selectedVariant = computed(() => {
  if (!variants.value.length || Object.keys(selectedOptions.value).length === 0) {
    return null
  }

  return variants.value.find(variant => {
    // Check if this variant's options match all selected options
    const variantOptionIds = variant.options.map(opt => opt.id)
    const selectedOptionIds = Object.values(selectedOptions.value)

    return selectedOptionIds.length === variantOptionIds.length
      && selectedOptionIds.every(optionId => variantOptionIds.includes(optionId))
  })
})

// Computed properties for display values
const displayPrice = computed(() => {
  return selectedVariant.value?.salePrice || props.product.salePrice || 0
})

const displayDiscount = computed(() => {
  return selectedVariant.value?.discount || props.product.discount || 0
})

const displayStock = computed(() => {
  return selectedVariant.value?.stock ?? props.product.stock ?? 0
})

// Function to handle option selection
const selectOption = (attributeId: number, optionId: number) => {
  selectedOptions.value[attributeId] = optionId
}

// Function to check if an option is selected
const isOptionSelected = (attributeId: number, optionId: number) => {
  return selectedOptions.value[attributeId] === optionId
}
</script>

<template>
  <div class="flex flex-wrap gap-7">
    <!-- Thumbnail -->
    <DashboardProductsThumbStrip
      v-model="selectedImage"
      :product-video="product.video?? ''"
      :product-thumbnails="productThumbnails"
      class="w-full md:w-90" />

    <div class="font-medium space-y-2">
      <div v-if="product.freeShipping" class="text-sm text-success">
        Free shipping
      </div>
      <div class="flex items-center justify-between">
        <div v-if="product.brand" class="flex items-center gap-1">
          <NuxtImg v-if="product.brandLogo" :src="product.brandLogo" provider="cloudflare" class="size-6 rounded-full" />
          <p>{{ product.brand.name }}</p>
        </div>
      </div>
      <p class="text-xl text-wrap">
        {{ product.name }}
      </p>
      <p v-if="product.category">
        {{ product.category.name }}
      </p>
      <div v-if="product.season && product.season !== 'All Season'" class="flex gap-2">
        <p class="text-primary">
          Season:
        </p>
        <p> {{ product.season }} </p>
      </div>

      <!-- Updated Price Display with Variant Support -->
      <div class="flex items-center gap-3">
        <p v-if="displayDiscount > 0" class="text-xl">
          {{ formatCurrency(displayPrice - (displayPrice * displayDiscount / 100)) }}
        </p>
        <p :class="['mt-1', displayDiscount > 0 ? 'text-sm line-through text-muted' : 'text-xl']">
          {{ formatCurrency(displayPrice) }}
        </p>
        <span v-if="displayDiscount > 0" class="text-error">
          {{ displayDiscount }}% OFF
        </span>
      </div>

      <!-- shipping -->
      <div v-if="product.shippingCost" class="text-sm flex gap-3">
        <p class="text-primary">
          Shipping cost:
        </p> {{ formatCurrency(product.shippingCost) }}
      </div>

      <!-- Highlights -->
      <div v-if="Object.keys(parsedHighlights).length > 0">
        <p class="font-medium">
          Highlights
        </p>
        <ul class="list-disc pl-5 py-2 grid grid-cols-2 gap-3">
          <li v-for="(hl, idx) in parsedHighlights" :key="idx" class="text-sm text-muted marker:text-primary">
            {{ hl }}
          </li>
        </ul>
      </div>

      <!-- Specs -->
      <div v-if="Object.keys(parsedSpecs).length > 0">
        <div v-for="(value, key) in parsedSpecs" :key="key" class="grid grid-cols-2 gap-3 *:text-wrap *:max-w-60 *:w-full">
          <p class="text-sm font-medium capitalize">
            {{ key }}
          </p>
          <p class="text-sm text-muted">
            {{ value }}
          </p>
        </div>
      </div>

      <!-- Variant Selection -->
      <div v-if="product.hVariants && productData && attributeMatrix.length > 0" class="space-y-4">
        <div v-for="attribute in attributeMatrix" :key="attribute.id" class="space-y-1.5">
          <p class="font-medium text-muted text-sm flex items-center gap-1">
            {{ attribute.name }}
            <UIcon name="i-ix-question" />
          </p>
          <div class="flex gap-2 flex-wrap">
            <!-- Image type attributes -->
            <template v-if="attribute.attributeType === 'Image'">
              <div
                v-for="option in attribute.options"
                :key="option.id"
                class="cursor-pointer rounded flex items-center flex-wrap gap-2"
                :class="{ 'ring-2 ring-primary': isOptionSelected(attribute.id, option.id) }"
                @click="selectOption(attribute.id, option.id)">
                <NuxtImg
                  v-for="(img, idx) in parseImage(option.image)"
                  :key="idx"
                  :src="img"
                  provider="cloudflare"
                  class="size-10 object-cover rounded bg-elevated"
                  @click="() => {
                    selectOption(attribute.id, option.id)
                    const imgs = parseImage(option.image)
                    if (imgs.length) selectedImage = imgs[0]
                  }" />
              </div>
            </template>

            <!-- Color type attributes -->
            <template v-else-if="attribute.attributeType === 'Color'">
              <div
                v-for="option in attribute.options"
                :key="option.id"
                class="size-12 rounded cursor-pointer border-2"
                :class="{ 'border-primary': isOptionSelected(attribute.id, option.id), 'border-transparent': !isOptionSelected(attribute.id, option.id) }"
                :style="{ backgroundColor: option.color }"
                @click="selectOption(attribute.id, option.id)" />
            </template>

            <!-- Text/other type attributes -->
            <template v-else>
              <UButton
                v-for="option in attribute.options"
                :key="option.id"
                :color="isOptionSelected(attribute.id, option.id) ? 'primary' : 'neutral'"
                :variant="isOptionSelected(attribute.id, option.id) ? 'solid' : 'soft'"
                :label="option.name"
                @click="selectOption(attribute.id, option.id)" />
            </template>
          </div>
        </div>
      </div>

      <!-- Updated Stock Display with Variant Support -->
      <div class="flex items-center gap-5">
        <p class="text-sm" :class="displayStock > 0 ? 'text-success' : 'text-error'">
          {{ displayStock > 0 ? `${displayStock} in stock` : 'Out of stock' }}
        </p>
        <span class="text-muted text-xs">|</span>
        <p class="text-sm text-muted">
          {{ product.sold || 0 }}+ sold
        </p>
        <!-- <span class="text-muted text-xs">|</span> -->
        <!-- <div class="flex items-center">
          <UIcon name="i-noto-star" class="size-3" />
          <p class="font-semibold text-sm text-muted">
            {{ `(${(product.rating?? 0).toFixed(1)})` }}
          </p>
        </div> -->
      </div>

      <div class="flex text-sm text-muted">
        <p>{{ `${product.likes || 0}+ likes &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; ${product.view || 0}+ views ` }}</p>
        <!-- &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ${product.shares || 0}+ shares -->
      </div>

      <div class="mt-3 border-t border-default py-2">
        <div v-if="product.estimatedDelivery" class=" flex items-center gap-1">
          <UIcon name="i-hugeicons-truck-delivery" class="size-5 text-primary" />
          <p>Estimate Delivery: {{ estimatedDeliveryRange }}</p>
        </div>
        <div v-if="product.brandWrtDuration" class=" flex items-center gap-1">
          <UIcon name="i-mingcute-time-line" class="size-5 text-primary" />
          <p>Brand Warranty: {{ product.brandWrtDuration }}</p>
        </div>
        <div v-if="product.sellerWrtDuration" class=" flex items-center gap-1">
          <UIcon name="i-mingcute-time-line" class="size-5 text-primary" />
          <p>Return within {{ product.sellerWrtDuration }} of purchase.</p>
        </div>
      </div>
    </div>
  </div>
  <div v-if="product.description" class="">
    <p class="font-medium">
      Description
    </p>
    <div class="prose prose-sm max-w-none" v-html="product.description" />
  </div>
</template>
