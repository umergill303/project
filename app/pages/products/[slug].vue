<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const { features } = useRuntimeConfig().public.ecommerce

interface Option {
  id: number
  name: string
  hint: string
  color: string
  image: string
  order: number
  attribute: number
}

interface Attribute {
  id: number
  name: string
  order: number
  attributeType: string
  options: Option[]
}

interface Variant {
  id: number
  purchasePrice: number
  salePrice: number
  discount: number
  stock: number
  sku: string
  order: number
  active: boolean
  options: Option[]
}

interface Product {
  id: string
  name: string
  salePrice: number
  stock: number
  seoTitle?: string
  seoDescription?: string
  ogImg?: string
  video?: string
  freeShipping: boolean
  shippingCost?: number
  purchasePrice?: number
  discount?: number
  tags?: { id: number, name: string }[]
  seoTags?: { id: number, name: string }[]
  rating?: number
  sold?: number
  likes?: number
  view?: number
  shares?: number
  description?: string
  overview?: string
  season?: string
  specs?: string
  features?: string
  brandWarranty?: boolean
  brandWrtDuration?: string
  sellerWarranty?: boolean
  sellerWrtDuration?: string | null
  estimatedDelivery?: string
  sku?: string
  thumbnail?: string
  featured?: boolean
  highlights?: string
  published?: boolean
  minShippingProducts?: number
  maxShippingProducts?: number
  hVariants: boolean
  activeVariants: boolean

  category?: { id: number, name: string }
  brand?: { id: number, name: string, logo: string }
  attributes: Attribute[]
  variants: Variant[]
}

const route = useRoute()
const router = useRouter()

const productId = computed(() => {
  const { slug } = route.params as { slug: string }
  const parts = slug.split('-')
  return parts.slice(-5).join('-')
})

const { trackView, trackLike } = useProductTracking()
trackView(productId.value)

// Fetch product data
const { data: product, status, error, refresh } = await useFetch<Product>(`/api/products/${productId.value}`)

// Initialize selectedOptions from query parameters or cart
const selectedOptions = ref<Record<number, number>>({})
const initializeSelectedOptions = () => {
  const query = route.query
  const options: Record<number, number> = {}
  Object.keys(query).forEach(key => {
    if (key.startsWith('attr_')) {
      const attributeId = parseInt(key.replace('attr_', ''), 10)
      const optionId = parseInt(query[key] as string, 10)
      if (!isNaN(attributeId) && !isNaN(optionId)) {
        options[attributeId] = optionId
      }
    }
  })
  selectedOptions.value = options
}

// Call initialization on mount
onMounted(() => {
  initializeSelectedOptions()
})

// Watch for route query changes
watch(() => route.query, () => {
  initializeSelectedOptions()
})

const { loggedIn } = useUserSession()
const { refreshCart, refreshWish } = useCount()

// Media handling
const thumbnails = computed(() => {
  if (!product.value?.thumbnail) return []
  try {
    let images: string[] = []
    if (product.value.thumbnail.startsWith('[')) {
      images = JSON.parse(product.value.thumbnail)
    }
    else {
      images = [product.value.thumbnail]
    }
    return images.map(img => {
      if (img.startsWith('http')) return img
      if (img.startsWith('products-thumbnails/')) {
        return `/products-thumbnails/${img.split('products-thumbnails/')[1]}`
      }
      return img
    })
  }
  catch (error) {
    console.error('Error parsing thumbnails:', error)
    return []
  }
})

const videoUrl = computed(() => {
  if (!product.value?.video) return null
  if (product.value.video.startsWith('http')) {
    return product.value.video
  }
  if (product.value.video.startsWith('product-videos/')) {
    const videoName = product.value.video.split('product-videos/')[1]
    return `/product-videos/${encodeURIComponent(videoName)}`
  }
  return null
})

const activeMedia = ref<'image' | 'video'>(videoUrl.value ? 'video' : 'image')
const activeImageIndex = ref(0)
const defaultImg = ref(thumbnails.value[0] || '')
const minShippingProducts = ref(product.value?.minShippingProducts || 1)
const wishLoading = ref(false)
const cartLoading = ref(false)

// Wishlist and cart status
const { data: wishProducts } = await useFetch('/api/wish')
const isInWishlist = computed(() => {
  if (!wishProducts.value || !('wishProducts' in wishProducts.value)) return false
  return wishProducts.value.wishProducts.some(
    (item: any) => item.productId === productId.value
  )
})

const { data: cartProduct } = await useFetch('/api/cart/cartProduct')
const isInCart = computed(() => {
  if (!cartProduct.value || !('cartProducts' in cartProduct.value) || !cartProduct.value.cartProducts) return false
  return cartProduct.value.cartProducts.some((item: any) => {
    if (item.productId !== productId.value) return false
    if (!item.variantId) return true // No variant selected
    const cartVariant = product.value?.variants.find(v => v.id === item.variantId)
    if (!cartVariant) return false
    const selectedOptionIds = Object.values(selectedOptions.value)
    return cartVariant.options.every(opt => selectedOptionIds.includes(opt.id))
  })
})

const allVariantsSelected = computed(() => {
  if (!product.value) return true
  return product.value.attributes.every(attr => selectedOptions.value[attr.id] !== undefined)
})

const currentVariant = computed<Variant | null>(() => {
  if (!product.value || !product.value.variants || !allVariantsSelected.value) {
    return null
  }

  const selectedOptionIds = Object.values(selectedOptions.value)
  if (selectedOptionIds.length === 0) return null

  return product.value.variants.find(variant => {
    return variant.options.every(opt =>
      selectedOptionIds.includes(opt.id)
    )
  }) || null
})

const displayPrice = computed(() => {
  if (currentVariant.value) {
    return (currentVariant.value.salePrice * (1 - (currentVariant.value.discount || 0) / 100)).toFixed(2)
  }
  if (product.value?.discount) {
    return (product.value.salePrice * (1 - product.value.discount / 100)).toFixed(2)
  }
  return product.value?.salePrice?.toFixed(2) || '0.00'
})

const displayStock = computed(() => {
  if (currentVariant.value) {
    return currentVariant.value.stock
  }
  return product.value?.stock || 0
})

const selectOption = (attributeId: number, optionId: number) => {
  selectedOptions.value = {
    ...selectedOptions.value,
    [attributeId]: optionId,
  }
  const query = {
    ...route.query,
    [`attr_${attributeId}`]: optionId.toString(),
  }
  router.replace({ query })
}

const isOptionDisabled = (currentAttributeId: number, optionId: number): boolean => {
  if (!product.value || !product.value.variants) return false
  const tempSelectedOptions = { ...selectedOptions.value, [currentAttributeId]: optionId }
  const selectedAttributeIds = Object.keys(tempSelectedOptions).map(Number)
  return !product.value.variants.some(variant => {
    const variantAttributeIds = variant.options.map(opt => {
      const attr = product.value?.attributes.find(a => a.options.some(o => o.id === opt.id))
      return attr?.id
    }).filter(Boolean) as number[]
    if (!selectedAttributeIds.every(id => variantAttributeIds.includes(id))) return false
    return (
      Object.entries(tempSelectedOptions).every(([attrId, optId]) => {
        return variant.options.some(opt => opt.id === optId)
      }) && variant.stock > 0
    )
  })
}

const addToCart = async () => {
  if (!product.value) return
  const user = useCookie<string>('user_id')
  if (!user.value && !loggedIn.value) {
    user.value = crypto.randomUUID()
  }
  const payload = {
    productId: product.value.id,
    variantId: currentVariant.value?.id || null,
    count: minShippingProducts.value,
    guestId: user.value
  }
  try {
    cartLoading.value = true
    const response = await $fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    })
    if (response?.success) {
      // Set query parameters to persist variant selection
      const query = Object.fromEntries(
        Object.entries(selectedOptions.value).map(([attrId, optId]) => [`attr_${attrId}`, optId.toString()])
      )
      router.replace({ query })
      showToast('productAddedToCart')
      navigateTo('/cart')
      refreshCart()
    }
    else {
      showToast('cartUnknow', response?.message || 'Unknown error')
    }
  }
  catch (err) {
    console.error('Cart error:', err)
    showToast('cartError', err.message || 'Failed to add to cart')
  }
  finally {
    cartLoading.value = false
  }
}

const addToWish = async () => {
  if (!product.value || isInWishlist.value) return
  wishLoading.value = true
  const payload = { productId: product.value.id }
  try {
    await $fetch('/api/wish/wishProduct', { method: 'POST', body: payload })
    showToast('productAddedToWishlist')
    navigateTo('/wish')
    refreshWish()
    trackLike(product.value.id, true)
  }
  catch (err) {
    console.error('Wishlist error:', err)
    showToast('wishlistError', err.message)
  }
  finally { wishLoading.value = false }
}

const parseJsonField = (jsonString: string | null | undefined): Record<string, string> | string[] => {
  try {
    if (!jsonString) return {}
    return JSON.parse(jsonString)
  }
  catch (e) {
    console.warn('Error parsing JSON field:', e)
    return jsonString && jsonString.includes('[') && jsonString.includes(']') ? [] : {}
  }
}

const parsedSpecs = computed(() => parseJsonField(product.value?.specs) as Record<string, string>)
// const parsedHighlights = computed(() => parseJsonField(product.value?.highlights) as string[])

const featuresList = computed(() => {
  const raw = product.value?.highlights
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      if (raw.startsWith('[') && raw.endsWith(']')) return JSON.parse(raw)
      return raw.replace(/[\[\]"]/g, '').split(',').map(f => f.trim()).filter(f => f.length > 0)
    }
    catch (e) {
      console.error('Error parsing highlights:', e)
      return []
    }
  }
  return []
})

const hasVariants = computed(() => product.value?.variants && product.value.variants.length > 0)
const partialSelection = computed(() => {
  if (!product.value || !product.value.attributes) return false
  const selectedCount = Object.keys(selectedOptions.value).length
  return selectedCount > 0 && selectedCount < product.value.attributes.length
})

const clearSelection = () => {
  selectedOptions.value = {}
  router.replace({ query: {} })
}

const changeImg = (img: string) => {
  defaultImg.value = img
  activeMedia.value = img === videoUrl.value ? 'video' : 'image'
  if (activeMedia.value === 'image') activeImageIndex.value = thumbnails.value.indexOf(img)
}

const mediaItems = computed(() => {
  const items = [...thumbnails.value]
  if (videoUrl.value) items.unshift(videoUrl.value)
  return items
})

const showArrows = computed(() => mediaItems.value.length > 5)

const { data: relatedProducts, status: relatedStatus } = await useFetch(
  `/api/products/${productId.value}/related`,
  { lazy: true, server: false }
)

const getVariantImage = (imageString: string) => {
  try {
    if (!imageString) return 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=Img'
    if (imageString.startsWith('[')) {
      const images = JSON.parse(imageString)
      if (images.length > 0) {
        const img = images[0]
        if (img.startsWith('http')) return img
        if (img.startsWith('product-variant-thumbnails/')) {
          return `/product-variant-thumbnails/${img.split('product-variant-thumbnails/')[1]}`
        }
        return img
      }
    }
    if (imageString.startsWith('http')) return imageString
    if (imageString.startsWith('product-variant-thumbnails/')) {
      return `/product-variant-thumbnails/${imageString.split('product-variant-thumbnails/')[1]}`
    }
    return imageString
  }
  catch (e) {
    console.error('Error parsing variant image:', e)
    return 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=Img'
  }
}

const currentVariantImage = computed(() => {
  if (!currentVariant.value) return null
  const imageOption = currentVariant.value.options.find(opt => {
    const attribute = product.value?.attributes.find(attr => attr.id === opt.attribute)
    return attribute?.attributeType === 'Image'
  })
  return imageOption?.image ? getVariantImage(imageOption.image) : null
})

watch(currentVariantImage, newImage => {
  if (newImage) {
    defaultImg.value = newImage
    activeMedia.value = 'image'
  }
})
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.productPageTitle || productPage.title, // Fallback title
  description: pageSeoData.value.productPageDescription || productPage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer class="py-4 md:py-8">
      <div v-if="status === 'pending'" class="text-center py-12">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div class="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg" />
            <div class="space-y-4">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="status === 'error'" class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto" />
        <h2 class="text-xl font-bold mt-4 text-gray-900 dark:text-white">
          Error Loading Product
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mt-2 mb-4">
          {{ error?.message || 'An unknown error occurred while loading the product.' }}
        </p>
        <UButton color="primary" icon="i-heroicons-arrow-path" @click="refresh()">
          Try Again
        </UButton>
      </div>

      <div v-else-if="product" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
        <div class="px-6 pt-6 pb-2">
          <AppBreadcrumbs class="mb-4" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div class="flex flex-col md:flex-row gap-4 w-full">
            <div class="hidden md:flex flex-col items-center gap-2 w-24 flex-shrink-0">
              <UCarousel
                v-slot="{ item }"
                orientation="vertical"
                :items="mediaItems"
                :ui="{ root: 'w-full h-20', container: mediaItems.length > 5 ? 'flex justify-start' : 'flex justify-center', item: 'basis-1/5' }"
                class="h-[500px] overflow-y-auto py2">
                <div
                  class="cursor-pointer aspect-square w-full rounded shadow-sm overflow-hidden border-2"
                  :class="{ 'border-primary-500': defaultImg === item, 'border-transparent': defaultImg !== item }"
                  @click="changeImg(item)">
                  <video v-if="item.endsWith('.mp4')" class="w-full h-full object-cover" muted playsinline>
                    <source :src="item" type="video/mp4">
                  </video>
                  <img v-else :src="item || 'https://placehold.co/600x600/CCCCCC/FFFFFF?text=No+Image'" class="w-full h-full object-cover" @error="handleImageError">
                </div>
              </UCarousel>
            </div>

            <div class="flex-1 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center max-h-[640px]">
              <div v-if="videoUrl && defaultImg === videoUrl" class="w-full h-full">
                <video controls class="w-full h-full object-contain" type="video/mp4">
                  <source :src="videoUrl" type="video/mp4">
                  Your browser does not support videos
                </video>
              </div>
              <img v-else :src="currentVariantImage || defaultImg || 'https://placehold.co/600x600/CCCCCC/FFFFFF?text=No+Image'" :alt="product.name" class="w-full h-auto max-h-[500px] object-contain" @error="handleImageError">
            </div>

            <div class="md:hidden w-full">
              <UCarousel
                v-slot="{ item }"
                :arrows="showArrows"
                :items="mediaItems"
                :ui="{ root: 'w-full h-20', container: mediaItems.length > 5 ? 'flex justify-start' : 'flex justify-center', item: 'basis-1/5', prev: 'ml-0', next: 'mr-0', arrows: 'opacity-55' }">
                <div
                  class="cursor-pointer aspect-square w-full rounded shadow-sm overflow-hidden border-2"
                  :class="{ 'border-primary-500': defaultImg === item, 'border-transparent': defaultImg !== item }"
                  @click="changeImg(item)">
                  <video v-if="item.endsWith('.mp4')" class="w-full h-full object-cover" muted playsinline>
                    <source :src="item" type="video/mp4">
                  </video>
                  <img v-else :src="item || 'https://placehold.co/600x600/CCCCCC/FFFFFF?text=No+Image'" class="w-full h-full object-cover" @error="handleImageError">
                </div>
              </UCarousel>
            </div>
          </div>

          <div>
            <div class="mb-6 space-y-3">
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {{ product.name }}
              </h1>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div v-if="product.brand" class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 mr-1.5">Brand:</span>
                  <span class="font-medium text-gray-700 dark:text-gray-200">{{ product.brand.name }}</span>
                </div>
                <div v-if="product.season && product.season !== 'All Season'" class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 mr-1.5">Season:</span>
                  <span class="font-medium text-gray-700 dark:text-gray-200">{{ product.season }}</span>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <div class="flex items-center flex-wrap gap-3">
                <span class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(displayPrice) }}</span>
                <template v-if="currentVariant?.discount || product.discount">
                  <span class="text-lg line-through text-gray-500 dark:text-gray-400">{{ formatCurrency((currentVariant ? currentVariant.salePrice : product.salePrice)?.toFixed(2)) }}</span>
                  <span class="bg-red-100 text-red-800 text-sm font-semibold px-2.5 py-0.5 rounded-full dark:bg-red-200 dark:text-red-900">{{ (currentVariant?.discount || product.discount) }}% OFF</span>
                </template>
                <UChip v-if="displayStock <= 10 && displayStock > 0" size="md" color="warning" class="ml-2">
                  <span class="inline-flex items-center text-sm text-neutral-100 bg-warning-600 px-3 py-1 rounded-full">Low Stock ({{ displayStock }})</span>
                </UChip>
                <UChip v-else-if="displayStock === 0" size="md" color="error" class="ml-2">
                  <span class="inline-flex items-center text-sm text-error-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">Out of Stock</span>
                </UChip>
                <UChip v-else size="md" color="primary" class="ml-2">
                  <span class="inline-flex items-center text-sm text-neutral-100 bg-primary-800 px-3 py-1 rounded-full">In Stock</span>
                </UChip>
              </div>
              <div v-if="currentVariant?.discount || product.discount" class="mt-2 flex items-center">
                <UIcon name="i-heroicons-arrow-trending-down" class="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                <span class="text-sm text-green-600 dark:text-green-400">You save ${{ ((currentVariant ? currentVariant.salePrice : product.salePrice) - parseFloat(displayPrice)).toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="product.hVariants && product.activeVariants && product.attributes && product.attributes.length > 0" class="space-y-6 mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">
                  Available Variants
                </h2>
                <UButton
                  v-if="Object.keys(selectedOptions).length > 0"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  label="Clear Selection"
                  @click="clearSelection" />
              </div>
              <div v-for="attribute in product.attributes" :key="attribute.id" class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ attribute.name }}:
                  <span class="text-primary-600 dark:text-primary-400 ml-1">
                    {{ selectedOptions[attribute.id] ? attribute.options.find(opt => opt.id === selectedOptions[attribute.id])?.name : 'Please select' }}
                  </span>
                </h3>
                <div v-if="attribute.attributeType === 'Color'" class="flex flex-wrap gap-2">
                  <button
                    v-for="option in attribute.options"
                    :key="option.id"
                    :disabled="isOptionDisabled(attribute.id, option.id)"
                    class="p-1.5 rounded-full transition-all border-2 relative"
                    :class="{ 'border-primary-600': selectedOptions[attribute.id] === option.id, 'border-transparent': selectedOptions[attribute.id] !== option.id, 'opacity-50 cursor-not-allowed': isOptionDisabled(attribute.id, option.id) }"
                    :title="isOptionDisabled(attribute.id, option.id) ? 'Not Available' : option.name"
                    @click="selectOption(attribute.id, option.id)">
                    <span class="block w-8 h-8 rounded-full" :style="{ backgroundColor: option.color || option.name.startsWith('#') ? option.name : '#CCCCCC', border: '1px solid #e5e7eb' }" />
                    <span v-if="isOptionDisabled(attribute.id, option.id)" class="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-600">X</span>
                  </button>
                </div>
                <div v-else-if="attribute.attributeType === 'Image'" class="flex flex-wrap gap-2">
                  <button
                    v-for="option in attribute.options"
                    :key="option.id"
                    :disabled="isOptionDisabled(attribute.id, option.id)"
                    class="p-0.5 rounded-md transition-all border-2 relative"
                    :class="{ 'border-primary-600': selectedOptions[attribute.id] === option.id, 'border-transparent': selectedOptions[attribute.id] !== option.id, 'opacity-50 cursor-not-allowed': isOptionDisabled(attribute.id, option.id) }"
                    :title="isOptionDisabled(attribute.id, option.id) ? 'Not Available' : option.name"
                    @click="selectOption(attribute.id, option.id)">
                    <img :src="getVariantImage(option.image)" class="w-10 h-10 object-cover rounded" @error="handleImageError">
                    <span v-if="isOptionDisabled(attribute.id, option.id)" class="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-600 bg-black bg-opacity-30 rounded">X</span>
                  </button>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <button
                    v-for="option in attribute.options"
                    :key="option.id"
                    :disabled="isOptionDisabled(attribute.id, option.id)"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all border relative"
                    :class="{ 'bg-primary-600 text-white border-primary-600': selectedOptions[attribute.id] === option.id, 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700': selectedOptions[attribute.id] !== option.id, 'opacity-50 cursor-not-allowed': isOptionDisabled(attribute.id, option.id) }"
                    :title="isOptionDisabled(attribute.id, option.id) ? 'Not Available' : option.name"
                    @click="selectOption(attribute.id, option.id)">
                    {{ option.name }}
                    <span v-if="isOptionDisabled(attribute.id, option.id)" class="absolute -top-1 -right-1 text-xs text-red-500 bg-white dark:bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center">X</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="featuresList.length">
              <h3 class="text-base mt-2 md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <span>Highlights</span>
              </h3>
              <div>
                <ul class="md:flex gap-2 flex-wrap">
                  <li v-for="(feature, index) in featuresList" :key="index" class="flex items-start gap-1 rounded-md transition-colors">
                    <UIcon name="i-heroicons-check-circle" class="flex-shrink-0 mt-0.5 text-green-500 dark:text-green-400 size-3 md:size-4" />
                    <span class="text-xs md:text-sm gap-2 text-gray-700 dark:text-gray-300 leading-snug">{{ feature }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="mb-6 mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <div class="flex items-center">
                <UInputNumber
                  v-model="minShippingProducts"
                  :min="product.minShippingProducts || 1"
                  :max="Math.min(displayStock, product?.maxShippingProducts || Infinity)"
                  variant="outline"
                  size="md"
                  class="w-48" />
              </div>
            </div>

            <div class="flex w-65 gap-3 mb-8">
              <UButton
                v-if="(loggedIn || features.guestCheckout) && features.cart"
                :loading="cartLoading"
                size="md"
                class="flex-1 justify-center cursor-pointer"
                icon="i-lucide-shopping-cart"
                :disabled="isInCart || displayStock === 0 || (product.hVariants && product.activeVariants && !currentVariant) || partialSelection"
                :color="displayStock === 0 ? 'error' : isInCart ? 'warning' : 'primary'"
                :label="partialSelection ? 'Select All Options' : displayStock === 0 ? 'Out of Stock' : isInCart ? 'Already in Cart' : (product.hVariants &&product.activeVariants && !currentVariant) ? 'Select Options' : 'Add to Cart'"
                @click="addToCart" />
              <UButton
                v-if="!loggedIn && !features.guestCheckout"
                to="/login"
                size="md"
                color="primary"
                class="flex-1 py-3 cursor-pointer"
                icon="i-heroicons-lock-closed">
                Login to Purchase
              </UButton>
              <UButton
                v-if="(loggedIn || features.guestCheckout) && features.wishlist"
                :loading="wishLoading"
                size="lg"
                :color="isInWishlist ? 'error' : 'neutral'"
                variant="subtle"
                class="mx-2 cursor-pointer"
                :disabled="isInWishlist || wishLoading"
                :title="isInWishlist ? 'Already in wishlist' : 'Add to wishlist'"
                :icon="isInWishlist ? 'i-heroicons-heart' : 'i-heroicons-heart'"
                @click="addToWish" />
            </div>

            <div class="space-y-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div class="flex items-center gap-4">
                <div class="px-2.5 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-full">
                  <UIcon name="i-heroicons-truck" class="w-5 h-5 mt-1 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ product.freeShipping ? 'Free Shipping' : `Shipping: $${product.shippingCost?.toFixed(2) || 'Calculated at checkout'}` }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Estimated delivery: {{ product.estimatedDelivery || '3-5 business days' }}
                  </p>
                </div>
              </div>
              <div v-if="product.brandWarranty || product.sellerWarranty" class="flex items-start gap-4">
                <div class="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  <UIcon name="i-heroicons-shield-check" class="w-5 h-5 mt-1 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p v-if="product.brandWarranty" class="text-sm font-medium text-gray-900 dark:text-white">
                    Brand Warranty: {{ product.brandWrtDuration || '1 year' }}
                  </p>
                  <p v-if="product.sellerWarranty" class="text-sm text-gray-900 dark:text-white mt-1">
                    Seller Warranty: {{ product.sellerWrtDuration || '6 months' }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="px-2.5 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-full">
                  <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mt-1 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Free returns within 30 days
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Read our return policy for details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UCard variant="undefine" class="mt-4 bg-neutral">
          <UTabs
            :items="[{ label: 'Description', description: product.description, slot: 'description' }, { label: 'Specifications', description: 'Product Specifications', slot: 'specifications' }]"
            variant="link"
            class="gap-4 w-full">
            <template #description>
              <div class="p-6 prose dark:prose-invert max-w-none">
                <h3 class="text-xl font-bold mb-4">
                  Product Description
                </h3>
                <div class="prose prose-sm max-w-none" v-html="product.description" />
                <div v-if="product.overview" class="mt-6">
                  <h3 class="text-xl font-bold mb-4">
                    Overview
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ product.overview }}
                  </p>
                </div>
              </div>
            </template>
            <template #specifications>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-4">
                  Specifications
                </h3>
                <div v-if="parsedSpecs && Object.keys(parsedSpecs).length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(value, key) in parsedSpecs" :key="key" class="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {{ key }}
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                      {{ value || 'N/A' }}
                    </dd>
                  </div>
                </div>
                <p v-else class="text-gray-500 dark:text-gray-400">
                  No specifications available for this product.
                </p>
              </div>
            </template>
          </UTabs>
        </UCard>
      </div>

      <div v-if="features.recommendations" class="mt-6">
        <div v-if="relatedStatus === 'pending'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <USkeleton v-for="n in 5" :key="n" class="h-60 w-full rounded-lg" />
        </div>
        <UProductsGrid v-else-if="relatedStatus === 'success' && relatedProducts && relatedProducts.length > 0" title="You may also like">
          <UProductCard
            v-for="SProduct in relatedProducts"
            :id="SProduct.id"
            :key="SProduct.id"
            :provider="SProduct.thumbnail ? 'cloudflare' : undefined"
            :to="`/products/${SProduct.name?.toLowerCase().replace(/\s+/g, '')}-${SProduct.id}`"
            :thumbnail="SProduct.thumbnail && SProduct.thumbnail.length > 0 ? SProduct.thumbnail! : '/Noimage.jpg'"
            :name="SProduct.name!"
            :price="formatCurrency(SProduct.salePrice!)"
            :discount-percentage="SProduct.discount!"
            :sale-price="formatCurrency(getDiscountedU(SProduct.salePrice, SProduct.discount))" />
        </UProductsGrid>
      </div>
      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-gray-400 mx-auto" />
        <h2 class="text-xl font-bold mt-4 text-gray-900 dark:text-white">
          Product Not Found
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <UButton to="/" color="primary" class="mt-6" icon="i-heroicons-arrow-left">
          Continue Shopping
        </UButton>
      </div>
    </UContainer>
  </UMain>
</template>

<style scoped>
.prose { line-height: 1.6; }
.prose p { margin-bottom: 1rem; }
button:disabled { position: relative; overflow: hidden; }
button:disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 2px, rgba(255, 0, 0, 0.1) 2px, rgba(255, 0, 0, 0.1) 4px);
  pointer-events: none;
}
.dark button:disabled::after {
  background: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 2px, rgba(255, 0, 0, 0.2) 2px, rgba(255, 0, 0, 0.2) 4px);
}
</style>
