<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Brand, Category } from '~~/server/database/schema'

const { features } = useRuntimeConfig().public.ecommerce
const router = useRouter()
const route = useRoute()

const props = defineProps<{
  categories: Category[]
  brands: Brand[]
  products: Product[]
  refresh?: () => void // Add refresh prop
}>()

const isSlideoverOpen = ref(false)

const filters = reactive({
  selectedBrands: route.query.brand?.toString().split(',').filter(id => !isNaN(Number(id))) ?? [],
  selectedCategories: route.query.category?.toString().split(',').filter(id => !isNaN(Number(id))) ?? [],
  minPrice: route.query.min && !isNaN(Number(route.query.min)) ? Number(route.query.min) : null,
  maxPrice: route.query.max && !isNaN(Number(route.query.max)) ? Number(route.query.max) : null,
})

const maxPriceLimit = computed(() => {
  if (!props.products?.length) return 1000
  const maxPrice = Math.max(
    ...props.products.map(p =>
      p.salePrice !== undefined && p.salePrice !== null ? p.salePrice : p.price || 0
    )
  )
  return Math.ceil(maxPrice / 100) * 100
})

const sliderValue = ref<[number, number]>([
  filters.minPrice ?? 0,
  filters.maxPrice ?? maxPriceLimit.value,
])

watchEffect(() => {
  sliderValue.value = [filters.minPrice ?? 0, filters.maxPrice ?? maxPriceLimit.value]
})

const toggleSlideover = () => {
  isSlideoverOpen.value = !isSlideoverOpen.value
}

const closeSlideover = () => {
  isSlideoverOpen.value = false
}

const updateFilters = () => {
  const query: Record<string, string> = { page: '1' }
  if (filters.selectedBrands.length) query.brand = filters.selectedBrands.join(',')
  if (filters.selectedCategories.length) query.category = filters.selectedCategories.join(',')
  if (filters.minPrice != null) query.min = String(filters.minPrice)
  if (filters.maxPrice != null) query.max = String(filters.maxPrice)
  console.log('Sidebar Pushing Query:', query)
  router.push({ path: '/products', query })
}

const clearAllFilters = () => {
  filters.selectedBrands = []
  filters.selectedCategories = []
  filters.minPrice = null
  filters.maxPrice = null
  sliderValue.value = [0, maxPriceLimit.value]
  console.log('Filters Cleared')
  router.push({ path: '/products', query: { page: '1' } })
  // Trigger parent refresh
  if (props.refresh) {
    console.log('Triggering parent refresh')
    props.refresh()
  }
}

const toggleCategory = (id: string) => {
  filters.selectedCategories = filters.selectedCategories.includes(id)
    ? filters.selectedCategories.filter(c => c !== id)
    : [...filters.selectedCategories, id]
  updateFilters()
}

const toggleBrand = (id: string) => {
  filters.selectedBrands = filters.selectedBrands.includes(id)
    ? filters.selectedBrands.filter(b => b !== id)
    : [...filters.selectedBrands, id]
  updateFilters()
}

const applyPriceRange = () => {
  filters.minPrice = sliderValue.value[0] === 0 ? null : sliderValue.value[0]
  filters.maxPrice = sliderValue.value[1] === maxPriceLimit.value ? null : sliderValue.value[1]
  updateFilters()
}

const isPriceValid = computed(() => {
  return sliderValue.value[0] <= sliderValue.value[1]
})

watch(
  () => [route.query.category, route.query.brand, route.query.min, route.query.max, route.query.q],
  ([cat, br, mn, mx, q]) => {
    console.log('Sidebar Query Sync:', { cat, br, mn, mx, q })
    filters.selectedCategories = cat?.toString().split(',').filter(id => !isNaN(Number(id))) ?? []
    filters.selectedBrands = br?.toString().split(',').filter(id => !isNaN(Number(id))) ?? []
    filters.minPrice = mn && !isNaN(Number(mn)) ? Number(mn) : null
    filters.maxPrice = mx && !isNaN(Number(mx)) ? Number(mx) : null
  },
  { deep: true }
)

const rawMin = ref(sliderValue.value[0])
const rawMax = ref(sliderValue.value[1])

const formattedMin = computed({
  get: () => formatCurrency(rawMin.value),
  set: val => {
    rawMin.value = parseCurrency(val) || 0
  },
})

const formattedMax = computed({
  get: () => formatCurrency(rawMax.value),
  set: val => {
    rawMax.value = parseCurrency(val) || 0
  },
})

watch([rawMin, rawMax], ([newMin, newMax]) => {
  sliderValue.value = [newMin, newMax]
})

watch(sliderValue, ([newMin, newMax]) => {
  rawMin.value = newMin
  rawMax.value = newMax
})

const handleMinInputFocus = () => {
  formattedMin.value = rawMin.value.toString()
}

const handleMaxInputFocus = () => {
  formattedMax.value = rawMax.value.toString()
}

const handleMinInputBlur = () => {
  formattedMin.value = formatCurrency(rawMin.value)
  validateInputs()
}

const handleMaxInputBlur = () => {
  formattedMax.value = formatCurrency(rawMax.value)
  validateInputs()
}

const validateInputs = () => {
  if (rawMin.value > rawMax.value) rawMin.value = rawMax.value
  if (rawMax.value < rawMin.value) rawMax.value = rawMin.value
  rawMin.value = Math.max(0, rawMin.value)
  rawMax.value = Math.min(maxPriceLimit.value, rawMax.value)
}
</script>

<template>
  <div v-if="features.productFiltering" class="relative">
    <!-- Mobile Filter Button -->
    <div class="md:hidden mb-4">
      <UButton
        icon="i-uiw-filter"
        label="Filters"
        size="sm"
        color="primary"
        variant="subtle"
        @click="toggleSlideover" />
    </div>

    <!-- Slideover for Mobile -->
    <USlideover
      side="left"
      :open="isSlideoverOpen"
      title="Filter Products"
      description="Refine your product search by category, brand, or price range."
      class="md:hidden"
      @update:open="isSlideoverOpen = $event">
      <template #body>
        <div class="max-h-[calc(100vh-130px)] pr-2 space-y-6 product-filter-scroll">
          <!-- Category Filter -->
          <div v-if="props.categories?.length" class="space-y-3">
            <h3
              class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <UIcon name="i-lucide-tag" class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              Categories
            </h3>
            <div class="space-y-2">
              <UCheckbox
                v-for="category in props.categories"
                :key="category.id"
                :label="category?.name ?? ''"
                :model-value="filters.selectedCategories.includes(String(category?.id))"
                color="primary"
                :ui="{
                  label: 'text-gray-700 dark:text-gray-300',
                  container: 'hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors',
                }"
                @update:model-value="toggleCategory(String(category.id))" />
            </div>
          </div>

          <!-- Brand Filter -->
          <div v-if="props.brands?.length" class="space-y-3">
            <h3
              class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <UIcon
                name="i-heroicons-building-storefront"
                class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              Brands
            </h3>
            <div class="space-y-2">
              <UCheckbox
                v-for="brand in props.brands"
                :key="brand.id"
                :label="brand.name ?? ''"
                :model-value="filters.selectedBrands.includes(String(brand.id))"
                color="primary"
                :ui="{
                  label: 'text-gray-700 dark:text-gray-300',
                  container: 'hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-md transition-colors',
                }"
                @update:model-value="toggleBrand(String(brand.id))" />
            </div>
          </div>

          <!-- Price Filter -->
          <div class="space-y-4">
            <h3
              class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <UIcon
                name="i-lucide-circle-dollar-sign"
                class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              Price Range
            </h3>
            <div class="px-2">
              <USlider
                v-model="sliderValue"
                :min="0"
                :max="maxPriceLimit"
                :step="10"
                class="w-full" />
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1">
                <UInput
                  v-model="formattedMin"
                  placeholder="Min Price"
                  type="text"
                  class="w-full"
                  @blur="handleMinInputBlur"
                  @focus="handleMinInputFocus" />
              </div>
              <span class="text-gray-500 dark:text-gray-400">to</span>
              <div class="flex-1">
                <UInput
                  v-model="formattedMax"
                  placeholder="Max Price"
                  type="text"
                  class="w-full"
                  @blur="handleMaxInputBlur"
                  @focus="handleMaxInputFocus" />
              </div>
            </div>
            <UButton
              label="Apply Price Range"
              size="xs"
              color="primary"
              block
              :disabled="!isPriceValid"
              @click="applyPriceRange" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            label="Clear All"
            color="neutral"
            block
            variant="outline"
            @click="clearAllFilters" />
        </div>
      </template>
    </USlideover>

    <!-- Filter Sidebar -->
    <UCard as="aside" class="hidden md:block w-60 lg:w-72">
      <template #header>
        <div class="flex items-center rounded-t-md justify-between">
          <h2 class="text-lg font-bold">
            Filter Products
          </h2>
        </div>
      </template>
      <div class="overflow-y-auto max-h-[calc(100vh-130px)] pr-2 space-y-6 scrollbar-thin scrollbar-thumb-rounded">
        <!-- Category Filter -->
        <div v-if="props.categories?.length > 0" class="space-y-3">
          <h3
            class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            <UIcon name="i-lucide-tag" class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            Categories
          </h3>
          <div class="space-y-2">
            <UCheckbox
              v-for="category in props.categories"
              :key="category.id"
              :label="category?.name ?? ''"
              :model-value="filters.selectedCategories.includes(category?.id.toString())"
              color="primary"
              :ui="{
                label: 'text-gray-700 dark:text-gray-300',
                container: 'hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors',
              }"
              @update:model-value="() => toggleCategory(category.id.toString())" />
          </div>
        </div>

        <!-- Brand Filter -->
        <div v-if="props.brands?.length > 0" class="space-y-3">
          <h3
            class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            <UIcon
              name="i-heroicons-building-storefront"
              class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            Brands
          </h3>
          <div class="space-y-2">
            <UCheckbox
              v-for="brand in props.brands"
              :key="brand.id"
              :label="brand.name || ''"
              :model-value="filters.selectedBrands.includes(brand.id.toString())"
              color="primary"
              :ui="{
                label: 'text-gray-700 dark:text-gray-300',
                container: 'hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-md transition-colors',
              }"
              @update:model-value="() => toggleBrand(brand.id.toString())" />
          </div>
        </div>

        <!-- Price Filter -->
        <div class="space-y-4">
          <h3
            class="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            <UIcon
              name="i-lucide-circle-dollar-sign"
              class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            Price Range
          </h3>
          <div class="px-2">
            <USlider
              v-model="sliderValue"
              :min="0"
              :max="maxPriceLimit"
              :step="10"
              class="w-full" />
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1">
              <UInput
                v-model="formattedMin"
                placeholder="Min Price"
                type="text"
                class="w-full"
                @blur="handleMinInputBlur"
                @focus="handleMinInputFocus" />
            </div>
            <span class="text-gray-500 dark:text-gray-400">to</span>
            <div class="flex-1">
              <UInput
                v-model="formattedMax"
                placeholder="Max Price"
                type="text"
                class="w-full"
                @blur="handleMaxInputBlur"
                @focus="handleMaxInputFocus" />
            </div>
          </div>
          <UButton
            label="Apply Price Range"
            size="xs"
            color="primary"
            block
            :disabled="!isPriceValid"
            @click="applyPriceRange" />
        </div>

        <div class="grid mb-2 grid-cols-1 gap-3">
          <UButton
            label="Clear All Filters"
            color="neutral"
            block
            variant="outline"
            @click="clearAllFilters" />
        </div>
      </div>
    </UCard>
  </div>
</template>
