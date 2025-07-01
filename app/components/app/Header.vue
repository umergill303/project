<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
// import { useCount } from '~/composables/useCount'

const { cartCount, wishCount, refreshCart, refreshWish } = useCount()

const { features } = useRuntimeConfig().public.ecommerce
const route = useRoute()
const router = useRouter()
const { aboutData, fetchAbout } = useAbout()
await fetchAbout()
console.log('aboutData', aboutData.value);

const { loggedIn, user, clear } = useUserSession()
const { ui } = useAppConfig()

interface MenuItem {
  label: string
  to?: string
  icon?: string
  badge?: string | number
  defaultExpanded?: boolean
  children?: MenuItem[]
  slot?: string
  disabled?: boolean
  onSelect?: () => void
}

const searchQ = ref('')
const showSuggestions = ref(false)
const suggestions = ref<any[]>([])
const isLoadingSuggestions = ref(false)

// Debounced search for suggestions
const searchSuggestions = useDebounceFn(async (query: string) => {
  if (!query.trim()) {
    suggestions.value = []
    return
  }

  isLoadingSuggestions.value = true
  try {
    const { data } = await $fetch('/api/products', {
      query: {
        q: query,
        limit: 20,
        category: selectedCategory.value === 'all' ? undefined : selectedCategory.value
      }
    })

    // Filter exact and partial matches same as before
    const exactMatches = data.filter((product: any) =>
      product.name.toLowerCase().startsWith(query.toLowerCase())
    )

    suggestions.value = exactMatches.length > 0
      ? exactMatches
      : data.filter((product: any) =>
          product.name.toLowerCase().includes(query.toLowerCase())
        )
  }
  catch (error) {
    console.error('Error fetching suggestions:', error)
    suggestions.value = []
  }
  finally {
    isLoadingSuggestions.value = false
  }
}, 300)

watch(searchQ, newVal => {
  if (newVal) {
    showSuggestions.value = true
    searchSuggestions(newVal)
  }
  else {
    showSuggestions.value = false
    suggestions.value = []
  }
})

const searchProducts = async () => {
  showSuggestions.value = false
  const query = searchQ.value.trim()

  if (!query) {
    return
  }

  const queryParams: Record<string, string> = { q: query }
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    queryParams.category = selectedCategory.value
  }

  if (router.currentRoute.value.path === '/products') {
    router.replace({ query: queryParams })
  }
  else {
    router.push({ path: '/products', query: queryParams })
  }

  searchQ.value = ''
}

const selectSuggestion = (productName: string) => {
  searchQ.value = productName
  showSuggestions.value = false
  searchProducts()
}

const items = ref<MenuItem[]>([])
// const cartCount = useState('cartCount')
// const wishCount = useState('wishCount')
// Watch loggedIn and update the items dynamically
watch(
  loggedIn,
  newValue => {
    const allItems: MenuItem[] = []

    // Wishlist and Cart as top-level menu items
    if (features.wishlist) {
      allItems.push({
        label: 'Wishlist',
        to: '/wish',
        icon: 'i-lucide-heart',
        badge: wishCount.value as string | number,
      })
    }

    if (features.cart) {
      allItems.push({
        label: 'Cart',
        to: '/cart',
        icon: 'i-lucide-shopping-cart',
        badge: cartCount.value as string | number,
      })
    }

    if (newValue) {
      const accountChildren: MenuItem[] = [
        {
          label: user.value?.email || user.value?.username || '',
          slot: 'account',
          disabled: true,
        },
        {
          label: 'Profile',
          icon: 'i-lucide-user-round',
          to: '/profile',
        },
        {
          label: 'Orders',
          icon: 'i-lucide-shopping-bag',
          to: '/orders',
        },
        {
          label: 'Change Password',
          icon: ui.icons.password,
          to: '/change-password',
        },
        {
          label: 'Sign out',
          icon: ui.icons.logout,
          async onSelect() {
            await clear() // 1. Clear user session
            navigateTo('/', { replace: true }) // 5. Redirect
          },
        }

      ]

      allItems.push({
        label: 'Account',
        defaultExpanded: true,
        children: accountChildren,
      })
    }
    else {
      allItems.push({
        label: 'Login',
        to: '/login',
        icon: 'i-lucide-log-in',
      })
    }

    items.value = allItems
  },
  { immediate: true }
)
const selectedCategory = ref<string>('all') // the v‑model value

const initFromQuery = (route.query?.category ?? 'all').toString()

selectedCategory.value = initFromQuery

const { cateData, fetchCategories } = useClassification()
await fetchCategories()

const cateOptions = computed(() => [
  { value: 'all', label: 'All' },
  ...(cateData.value ?? [])
    .filter(c => c.id != null && c.name != null)
    .map(c => ({ value: String(c.id), label: c.name })),
])

watch(
  () => route.query.category,
  cat => {
    const v = cat ? String(cat) : 'all'
    if (v !== selectedCategory.value) selectedCategory.value = v
  }
)
const isSlideoverOpen = ref(false)
const toggleSlideover = () => { isSlideoverOpen.value = !isSlideoverOpen.value }
const closeSlideover = () => { isSlideoverOpen.value = false }
</script>

<template>
  <div class="sticky top-0 z-50 w-full">
    <!-- Main Header -->
    <UHeader class="">
      <template #title>
        <HeaderLogo :store-name="aboutData?.storeName|| ''" :store-logo="aboutData?.storeLogo || ''" class="max-w-40" />
      </template>

      <!-- Center Section - Desktop Search Bar & Categories -->
      <div class="hidden lg:flex items-center gap-2 w-full max-w-2xl mx-auto">
        <USelect
          v-model="selectedCategory"
          :items="cateOptions"
          color="primary"
          variant="none"
          size="md"
          class="w-35 rounded-full ring ring-muted" />

        <!-- Search Bar for Desktop -->
        <div v-if="features.search" ref="searchContainer" class="relative flex-1">
          <UForm class="w-full" @submit="searchProducts">
            <UInput
              v-model="searchQ"
              icon="i-lucide-search"
              size="md"
              class="w-full md:w-60 rounded-full ring ring-muted"
              color="primary"
              variant="none"
              :placeholder="`Search ${aboutData?.storeName || 'products'}`"
              @focus="searchQ && (showSuggestions = true)" />
          </UForm>

          <!-- Suggestions Dropdown -->
          <div
            v-if="showSuggestions && searchQ"
            class="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md max-h-96 overflow-y-auto shadow-lg">
            <div v-if="isLoadingSuggestions" class="p-4 flex justify-center">
              <AppSpinner size="sm" color="neutral" />
            </div>
            <div v-else-if="suggestions.length" class="py-3">
              <div
                v-for="product in suggestions"
                :key="product.id"
                class="px-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                @mousedown="selectSuggestion(product.name)">
                <div class="flex-1 overflow-hidden py-1">
                  <div class="flex items-center text-muted gap-3">
                    <UIcon name="i-pajamas-search-sm" />
                    <span class="block truncate font-medium">{{ product.name }}</span>
                  </div>
                  <!-- <span v-if="product.price" class="text-sm text-gray-600 dark:text-gray-400">
                    {{ product.price }} {{ product.currency || '$' }}
                  </span> -->
                </div>
              </div>
            </div>
            <div v-else class="p-3 text-gray-500 dark:text-gray-400">
              No results found for "{{ searchQ }}"
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side Navigation -->
      <template #right>
        <div class="flex items-center gap-2">
          <!-- Theme Toggle Button (All Screens) -->
          <!-- Mobile Filter Button (visible on sm and below) -->
          <div class="lg:hidden  ">
            <UButton
              icon="i-lucide-search"
              size="sm"
              color="neutral"
              variant="subtle"
              @click="toggleSlideover" />
          </div>

          <UColorModeButton />

          <!-- Desktop Wishlist & Cart -->
          <div class="hidden lg:flex items-center">
            <template v-if="features.wishlist">
              <UButton
                to="/wish"
                color="neutral"
                variant="link"
                class="relative px-2">
                <template #leading>
                  <UChip v-if="Number(wishCount) > 0" color="neutral" :text="Number(wishCount)" size="3xl">
                    <UIcon name="i-lucide-heart" class="size-5" />
                  </UChip>
                  <UIcon v-else name="i-lucide-heart" class="size-5" />
                  <!-- <UIcon name="i-lucide-heart" class="size-5" /> -->
                </template>
                <span class="ml-1">Wish</span>
              </UButton>
            </template>

            <template v-if="features.cart">
              <UButton
                to="/cart"
                color="neutral"
                variant="link"
                class="relative px-2">
                <!-- {{ cartCount }} -->
                <template #leading>
                  <UChip v-if="Number(cartCount) > 0" color="neutral" :text="Number(cartCount)" size="3xl">
                    <UIcon name="i-lucide-shopping-cart" class="size-5" />
                  </UChip>
                  <UIcon v-else name="i-lucide-shopping-cart" class="size-5" />
                </template>
                <span class="ml-1">Cart</span>
              </UButton>
            </template>
          </div>

          <!-- Desktop User Menu -->
          <div class="hidden lg:flex items-center gap-3">
            <!-- Admin Dashboard Button -->
            <UButton
              v-if="user?.roles?.includes('admin')"
              to="/dashboard"
              icon="i-lucide-layout-dashboard"
              variant="link"
              label="Dashboard"
              color="neutral" />

            <HeaderHelp :number="aboutData?.contactPhone" />
            <!-- <HeaderLocation /> -->
            <Account v-if="loggedIn" />

            <!-- Login Button -->
            <UButton
              v-else-if="features.auth"
              to="/login"
              icon="i-lucide-log-in"
              label="Login"
              variant="link"
              color="neutral" />

            <!-- Hidden Login (Auth Disabled) -->
            <UButton
              v-else
              icon="i-lucide-log-in"
              label="Login"
              to="/login"
              variant="link"
              color="neutral"
              hidden
              :title="'Authentication is disabled'" />
          </div>
        </div>
      </template>
      <template #body>
        <UNavigationMenu :items orientation="vertical" class="-mx-2.5">
          <UTree v-if="loggedIn" :items />
        </UNavigationMenu>
      </template>
    </UHeader>
    <!-- Mobile Search Modal -->
    <USlideover
      side="top"
      :open="isSlideoverOpen"
      :overlay="false"
      title="Search Products"
      :transition="true"
      class="lg:hidden top-16 max-h-[calc(100vh-4rem)] "
      @update:open="isSlideoverOpen = $event">
      <template #right>
        <div>
          <UButton
            icon="i-lucide-x"
            size="sm"
            color="error"
            block
            variant="soft"
            @click="closeSlideover" />
        </div>
      </template>
      <template #body>
        <div class="p-4 space-y-4">
          <!-- Category Selector and Search Input -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <USelect
              v-model="selectedCategory"
              :items="cateOptions"
              color="primary"
              variant="outline"
              size="md"
              class="w-full sm:w-36 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              aria-label="Select product category" />
            <div
              v-if="features.search"
              ref="searchContainer"
              class="relative flex-1">
              <UForm class="w-full" @submit="searchProducts">
                <UInput
                  v-model="searchQ"
                  icon="i-lucide-search"
                  size="md"
                  class="w-full rounded-lg  dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                  color="neutral"
                  variant="outline"
                  placeholder="Search products"
                  autocomplete="off"
                  @focus="searchQ && (showSuggestions = true)"
                  @input="showSuggestions = !!searchQ" />
              </UForm>
            </div>

            <div
              v-if="showSuggestions && searchQ"
              class="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
              <div v-if="isLoadingSuggestions" class="p-4 flex justify-center">
                <AppSpinner size="sm" color="neutral" />
              </div>
              <div v-else-if="suggestions.length" class="py-3">
                <div
                  v-for="product in suggestions"
                  :key="product.id"
                  class="px-3 hover:bg-gray-100 z-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                  role="option"
                  tabindex="0"
                  @mousedown="selectSuggestion(product.name)"
                  @keydown.enter="selectSuggestion(product.name)">
                  <!-- <NuxtImg
                    v-if="product.thumbnail?.[0]"
                    :src="product.thumbnail[0]"
                    class="w-10 h-10 object-cover rounded-md"
                    :alt="product.name"
                    loading="lazy" /> -->
                  <div class="flex-1 overflow-hidden py-1">
                    <div class="flex items-center text-muted gap-3">
                      <UIcon name="i-pajamas-search-sm" />
                      <span class="block truncate font-medium">{{ product.name }}</span>
                    </div>

                    <span v-if="product.price" class="text-sm text-muted">
                      {{ product.price }} {{ product.currency || '$' }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="p-4 text-sm text-gray-500 dark:text-gray-400">
                No results found for "{{ searchQ }}"
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
