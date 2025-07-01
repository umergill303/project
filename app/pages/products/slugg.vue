<script setup lang="ts">
const { features } = useRuntimeConfig().public.ecommerce
const route = useRoute()
const productId = computed(() => {
  const { slug } = route.params as { slug: string }

  // Split the slug into parts
  const parts = slug.split('-')

  // Get the UUID (last part)
  const uuid = parts.slice(-5).join('-') // Assuming UUID is always 5 parts

  return uuid
})

// Use your composable instead of useFetch
const { brandLogo, thumbnails } = await useProduct(productId.value)

// console.log('product', product.seoDescription)
const { data: product } = await useFetch(`/api/products/${productId.value}`)

console.log('productt', product)
useSeoMeta({
  title: product?.seoTitle,
  description: product?.seoDescription,
  ogImage: product?.ogImg || thumbnails[0] || '/Noimage.jpg',
  twitterCard: 'summary_large_image',
})

const { data: relatedProducts, status: relatedStatus } = await useFetch(
  `/api/products/${productId.value}/related`,
  { lazy: true, server: false }
)

console.log('relatedProducts', relatedProducts)
// console.log('relatedProducts', productss)
</script>

<template>
  <UMain>
    <UContainer class="py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs class="mb-4" />
      <div class="space-y-8 ">
        <!-- Loading State -->
        <div
          v-if="relatedStatus === 'pending'"
          class="flex items-center justify-center py-20 bg-white  rounded-xl ">
          <AppSpinner size="md" color="[var(--ui-color-secondary-500)]" />
        </div>

        <template v-else>
          <!-- Product Detail Section -->
          <ProductDetail
            v-if="product"
            :product
            :brand-logo
            :thumbnails />

          <ProductInfo :product />
        </template>

        <!-- Related Products Section -->
        <div v-if="features.recommendations">
          <!-- Related Products Loading State -->
          <div
            v-if="relatedStatus === 'pending'"
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <USkeleton v-for="n in 5" :key="n" class="h-60 w-full rounded-lg" />
          </div>

          <!-- Related Products Success State -->
          <UProductsGrid
            v-else-if="relatedStatus === 'success' && relatedProducts && relatedProducts.length > 0"
            title="You may also like">
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

          <!-- Related Products Empty State -->
          <UAlert
            v-else-if="relatedStatus === 'success' && (!relatedProducts || relatedProducts.length === 0)"
            class="my-6"
            title="Products Not Found"
            description="Related Products are not available at the moment. Please check back later."
            color="error"
            variant="subtle"
            icon="i-lucide-shield-alert" />

          <!-- Related Products Error State -->
          <UAlert
            v-else-if="relatedStatus === 'error'"
            class="my-6"
            title="Error Fetching Related Products"
            description="Failed to fetch related products. Please try again later."
            color="error"
            variant="subtle"
            icon="i-lucide-shield-alert" />
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
