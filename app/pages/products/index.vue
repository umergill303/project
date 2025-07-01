<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const appConfig = useAppConfig()
const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const itemsPerPage = 12

// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.productsPageTitle || productsPage.title, // Fallback title
  description: pageSeoData.value.productsPageDescription || productsPage.description, // Fallback description
})

const searchQ = ref(route.query.q?.toString() || '')
const selectedCategories = ref(
  route.query.category ? route.query.category.toString().split(',').filter(id => !isNaN(Number(id))) : []
)
const selectedBrands = ref(
  route.query.brand ? route.query.brand.toString().split(',').filter(id => !isNaN(Number(id))) : []
)
const minPrice = ref(route.query.min != null && !isNaN(Number(route.query.min)) ? Number(route.query.min) : null)
const maxPrice = ref(route.query.max != null && !isNaN(Number(route.query.max)) ? Number(route.query.max) : null)

// Compute a unique key for useFetch to force re-fetch
const fetchKey = computed(() =>
  `${searchQ.value}-${selectedCategories.value.join(',')}-${selectedBrands.value.join(',')}-${minPrice.value}-${maxPrice.value}-${page.value}`
)

const { data: searchResults, status, refresh } = useFetch('/api/products/search', {
  key: fetchKey.value,
  query: {
    q: searchQ,
    category: computed(() => selectedCategories.value.join(',') || undefined),
    brand: computed(() => selectedBrands.value.join(',') || undefined),
    min: computed(() => (minPrice.value != null ? minPrice.value : undefined)),
    max: computed(() => (maxPrice.value != null ? maxPrice.value : undefined)),
    page,
    limit: itemsPerPage,
  },
  watch: [page, searchQ, selectedCategories, selectedBrands, minPrice, maxPrice],
  immediate: true,
  onRequest({ options }) {
    console.log('useFetch Query:', options.query)
  },
  onResponse({ response }) {
    console.log('API Response:', response._data)
  },
})

/* ---------- Computed wrappers ---------- */
const products = computed(() => {
  const result = searchResults.value?.products || []
  console.log('Products Computed:', result.length, result)
  return result
})
const brands = computed(() => searchResults.value?.brands || [])
const categories = computed(() => searchResults.value?.categories || [])
const pagination = computed(() =>
  searchResults.value?.pagination ?? {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  }
)

/* ---------- Sync URL → refs ---------- */
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    console.log('URL Query Updated:', { newQuery, oldQuery })
    searchQ.value = newQuery.q?.toString() || ''
    selectedCategories.value = newQuery.category
      ? newQuery.category.toString().split(',').filter(id => !isNaN(Number(id)))
      : []
    selectedBrands.value = newQuery.brand
      ? newQuery.brand.toString().split(',').filter(id => !isNaN(Number(id)))
      : []
    minPrice.value = newQuery.min != null && !isNaN(Number(newQuery.min)) ? Number(newQuery.min) : null
    maxPrice.value = newQuery.max != null && !isNaN(Number(newQuery.max)) ? Number(newQuery.max) : null
    page.value = Number(newQuery.page) || 1
    if (Object.keys(newQuery).length < Object.keys(oldQuery || {}).length) {
      console.log('Filters cleared, refreshing fetch')
      refresh()
    }
  },
  { immediate: true, deep: true }
)

/* ---------- Sync refs → URL ---------- */
watch(
  [searchQ, selectedCategories, selectedBrands, minPrice, maxPrice, page],
  () => {
    // Only update if on /products route
    if (route.path !== '/products') {
      console.log('Skipping URL update: Not on /products')
      return
    }
    const query: Record<string, string | undefined> = { page: String(page.value) }
    if (searchQ.value) query.q = searchQ.value
    if (selectedCategories.value.length) query.category = selectedCategories.value.join(',')
    if (selectedBrands.value.length) query.brand = selectedBrands.value.join(',')
    if (minPrice.value != null) query.min = String(minPrice.value)
    if (maxPrice.value != null) query.max = String(maxPrice.value)
    Object.keys(query).forEach(key => query[key] === undefined && delete query[key])
    console.log('Pushing Query:', query)
    router.push({ path: '/products', query })
  },
  { deep: false } // No need for deep watch
)
</script>

<template>
  <UMain>
    <UContainer class="py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs class="mb-4" />

      <div class="flex flex-col gap-4 md:flex-row md:items-start">
        <!-- Sidebar -->
        <ProductSidebar
          :categories="categories"
          :brands="brands"
          :products="products"
          :refresh="refresh" />

        <!-- Main Content -->
        <section class="flex-1">
          <!-- Loading state -->
          <div v-if="status === 'pending'" class="flex justify-center items-center h-64">
            <AppSpinner size="lg" color="primary" />
          </div>

          <!-- No results found -->
          <UAlert
            v-else-if="status === 'success' && !products.length"
            class="my-6"
            title="No Results Found"
            description="No matching products found. Try different keywords or filters."
            color="error"
            variant="subtle"
            :icon="appConfig.ui.icons.error" />

          <!-- Product Grid Header -->
          <div
            v-else
            class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {{ searchQ ? `Search Results for "${searchQ}"` : 'All Products' }}
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({{ pagination.total }} items)
              </span>
            </h2>
          </div>

          <!-- Product Grid -->
          <UPageGrid
            v-if="products.length"
            class="w-full px-4 sm:px-4 gap-4 sm:gap-4 justify-items-center grid-cols-2 sm:grid-cols-3">
            <UProductCard
              v-for="product in products"
              :id="product.id"
              :key="product.id"
              :provider="product.thumbnail[0] ? 'cloudflare' : undefined"
              :to="`/products/${product.name.toLowerCase().replace(/\s+/g, '')}-${product.id}`"
              :thumbnail="
                product.thumbnail && product.thumbnail.length > 0
                  ? product.thumbnail[0]
                  : '/No-Image-Placeholder.svg'
              "
              :name="product.name"
              :price="formatCurrency(product.discount && product.salePrice)"
              :sale-price="formatCurrency(getDiscountedU(product.salePrice, product.discount))"
              :discount-percentage="product.discount!"
              class="w-full max-w-[200px] sm:max-w-none" />
          </UPageGrid>

          <!-- Pagination -->
          <div class="mt-8 flex justify-center">
            <UPagination
              v-if="pagination.total > itemsPerPage"
              v-model:page="page"
              :total="pagination.total"
              :items-per-page="itemsPerPage"
              :sibling-count="1"
              show-edges
              active-color="secondary"
              color="secondary"
              variant="outline"
              @update:page="newPage => console.log('Pagination Updated:', newPage)" />
          </div>
        </section>
      </div>
    </UContainer>
  </UMain>
</template>
