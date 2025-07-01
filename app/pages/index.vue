<script setup lang="ts">
// import { uuidv4 } from 'uuid'
import { v4 as uuidv4 } from 'uuid'
import type { Product } from '~~/server/database/schema'

const { loggedIn, user: userR } = useUserSession()
const { features } = useRuntimeConfig().public.ecommerce
const limit = ref(12)
const loading = ref(false)
const currentPage = ref(1)
const hasMoreProducts = ref(true)
const products = ref<Product[]>([])
const totalProducts = ref(0)
const user = useCookie<string>('user_id')
if (!loggedIn.value && !user.value) {
  const userId = useCookie<string>('user_id', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  if (!loggedIn.value && !userId.value) {
    userId.value = uuidv4()
  }
}
const appConfig = useAppConfig()

// Fetch Products
// Fetch Products
const { data: fetchProducts } = await useFetch('/api/products', {
  params: { limit: limit.value, published: true },
})

if (fetchProducts.value) {
  products.value = fetchProducts.value.data ?? []
  totalProducts.value = fetchProducts.value.total ?? 0
  currentPage.value++
  hasMoreProducts.value = products.value.length < totalProducts.value
}
// products.value = fetchProducts.value ?? []
// currentPage.value++

const loadMore = async () => {
  if (!hasMoreProducts.value || loading.value) return

  loading.value = true

  const newProducts = await $fetch('/api/products', {
    params: {
      page: currentPage.value,
      limit: limit.value,
      published: true
    }
  })

  console.log(newProducts)

  if (newProducts?.data?.length > 0) {
    products.value.push(...newProducts.data)
    currentPage.value++
    hasMoreProducts.value = products.value.length < newProducts.total
  }
  else {
    hasMoreProducts.value = false
  }

  loading.value = false
}

const { data: slides } = await useFetch('/api/slider')
// Fetch Categories and Featured Products
const { data: featuredCategories } = useFetch('/api/categories')
const { data: featuredProducts } = await useFetch('/api/products/feature')

console.log('featuredProducts', featuredProducts.value)

// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.indexPageTitle || homePage.title, // Fallback title
  description: pageSeoData.value.indexPageDescription || homePage.description, // Fallback description
  // You can add other SEO meta tags here as needed
})
console.log(pageSeoData)
</script>

<template>
  <UMain>
    <AppSlider v-if="slides?.length" :slides />
    <UContainer class="space-y-4 py-4 sm:py-6 lg:py-8">
      <!-- <AppCategories v-if="featuredCategories?.length" title="Categories" :categories="featuredCategories" /> -->

      <UPageGrid v-if="featuredCategories" class="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-0">
        <UPageCard
          v-for="cat in featuredCategories"
          :key="cat.id"
          :to="{ path: '/products', query: { ...$route.query, category: cat.id } }"
          :ui="{ root: 'rounded-none' }"
          variant="subtle"
          class="relative w-full aspect-square overflow-hidden">
          <NuxtImg
            :src="cat.logo || '/No-Image-Placeholder.svg'"
            :alt="cat.name!"
            :provider="cat.logo ? 'cloudflare' : undefined"
            class="rounded w-full aspect-square object-cover" />
          <UBadge
            color="neutral"
            variant="solid"
            size="xl"
            :label="cat.name!"
            class="absolute left-1/2 bottom-1 -translate-x-1/2" />
        </UPageCard>
      </UPageGrid>

      <UProductsGrid v-if="features.featured && featuredProducts?.length" title="Featured Products">
        <UProductCard
          v-for="product in featuredProducts"
          :id="product.id"
          :key="product.id"
          :provider="product.thumbnail ? 'cloudflare' : undefined"
          :to="`/products/${product?.name?.toLowerCase().replace(/\s+/g, '')}-${product.id}`"
          :thumbnail="product.thumbnail && product.thumbnail.length > 0 ? product.thumbnail[0] : '/Noimage.jpg'"
          :name="product.name"
          :price="formatCurrency(product.discount && product.salePrice)"
          :sale-price="formatCurrency(getDiscountedU(product.salePrice, product.discount))"
          :discount-percentage="product.discount!" />
      </UProductsGrid>

      <UProductsGrid v-if="products.length" title="Shop the Collection">
        <UProductCard
          v-for="product in products"
          :id="product.id"
          :key="product.id"
          :provider="product.thumbnail? 'cloudflare' : undefined"
          :to="`/products/${product?.name?.toLowerCase().replace(/\s+/g, '')}-${product.id}`"
          :thumbnail="product.thumbnail && product.thumbnail.length > 0 ? product.thumbnail : '/Noimage.jpg'"
          :name="product.name!"
          :price="formatCurrency(product.discount! && product.salePrice!)"
          :discount-percentage="product.discount!"
          :sale-price="formatCurrency(getDiscountedU(product.salePrice, product.discount))" />
      </UProductsGrid>

      <!-- Load More Button -->
      <div class="flex justify-center mt-6">
        <UButton
          v-if="hasMoreProducts && products.length > 0"
          :loading
          color="neutral"
          variant="solid"
          :icon="appConfig.ui.icons.arrowDown"
          block
          class="max-w-48 cursor-pointer"
          :label="loading ? 'Loading...' : 'Load More'"
          :disabled="loading"
          @click="loadMore" />
      </div>
    </UContainer>
  </UMain>
</template>
