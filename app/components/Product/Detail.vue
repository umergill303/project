<script lang="ts" setup>
import { formatCurrency } from '~/utils/formatCurrency'

const { features } = useRuntimeConfig().public.ecommerce
const props = defineProps<{
  product: ProductWithBrandLogo | null
  brandLogo?: string | null
  thumbnails?: string[]
}>()
const { refreshCart } = useCount()
const product = props.product
if (!product) throw new Error('Product is required')
console.log('Product Detail:', product)

const { loggedIn } = useUserSession()
const productId = product.id
const minShippingProducts = ref(product.minShippingProducts)

const wishLoading = ref(false)
const cartLoading = ref(false)

const { data: wishProducts } = await useFetch('/api/wish')
const isInWishlist = computed(() => {
  if (!wishProducts.value || !('wishProducts' in wishProducts.value)) return false
  return wishProducts.value.wishProducts.some(
    (item: any) => item.productId === productId
  )
})

const { data: cartProduct } = await useFetch('/api/cart/cartProduct')
console.log('Cart Product:', cartProduct)
const isInCart = computed(() => {
  if (!cartProduct.value || !('cartProducts' in cartProduct.value) || !cartProduct.value.cartProducts) return false

  return cartProduct.value.cartProducts.some((item: any) => {
    const sameProduct = item.productId === productId
    // const sameVariant = item.variant?.id === selectedCombination.value
      || (item.variant?.option?.name === selectedSize.value
        && item.variant?.option?.color === selectedColor.value)
    return sameProduct && (sameProduct || (!selectedCombination.value && !selectedSize.value && !selectedColor.value))
  })
})

const {
  fetchVariants,
  sizeOptions,
  colorOptions,
  combOptions
} = useVariants()
fetchVariants(props.product?.id ?? '')

const selectedSize = ref<string | null>(null)
const selectedColor = ref<string | null>(null)
const selectedCombination = ref<string | null>(null)
const variantError = ref(false)

const addToCart = async () => {
  variantError.value = false

  const hasVariants = combOptions.value.length > 0 || colorOptions.value.length > 0 || sizeOptions.value.length > 0

  if (hasVariants && !selectedCombination.value && !selectedSize.value && !selectedColor.value) {
    variantError.value = true
    return
  }

  cartLoading.value = true

  try {
    let variantType = null
    let variantId = null
    let variantData = null

    if (selectedCombination.value) {
      variantType = 'combination'
      variantId = selectedCombination.value
      variantData = combOptions.value.find(c => c.id === selectedCombination.value)
    }
    else if (selectedSize.value && selectedColor.value) {
      variantType = 'combination'
      const matchedVariant = combOptions.value.find(v =>
        v.size === selectedSize.value && v.color === selectedColor.value
      )
      if (matchedVariant) {
        variantId = matchedVariant.id
        variantData = matchedVariant
      }
      else {
        variantType = 'custom'
        variantData = {
          size: selectedSize.value,
          color: selectedColor.value,
          colorName: colorOptions.value.find(c => c.name === selectedColor.value)?.name || selectedColor.value
        }
      }
    }
    else if (selectedSize.value) {
      variantType = 'size'
      const sizeVariant = sizeOptions.value.find(s => s.name === selectedSize.value)
      if (sizeVariant) {
        variantId = sizeVariant.id
        variantData = {
          size: selectedSize.value,
          salePrice: sizeVariant.salePrice ?? product.salePrice,
          discount: sizeVariant.discount ?? product.discount,
          stock: sizeVariant.stock ?? product.stock
        }
      }
    }
    else if (selectedColor.value) {
      variantType = 'color'
      const colorVariant = colorOptions.value.find(c => c.name === selectedColor.value)
      if (colorVariant) {
        variantId = colorVariant.id
        variantData = {
          color: selectedColor.value,
          colorName: colorVariant.name,
          salePrice: colorVariant.salePrice ?? product.salePrice,
          discount: colorVariant.discount ?? product.discount,
          stock: colorVariant.stock ?? product.stock
        }
      }
    }

    const user = useCookie<string>('user_id')
    if (!user.value && !loggedIn.value) {
      user.value = crypto.randomUUID() // Generate guestId if none exists
    }

    const payload = {
      productId,
      count: minShippingProducts.value,
      variantId,
      variantType,
      variantData,
      guestId: user.value
    }

    const response = await $fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    })

    if (response?.success) {
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
  if (isInWishlist.value) return

  wishLoading.value = true
  try {
    const { data: response, error } = await useFetch('/api/wish/wishProduct', {
      method: 'POST',
      body: { productId },
    })

    if (error.value) {
      throw error.value
    }

    if (response.value?.success) {
      showToast('productAddedToWishlist')
      navigateTo('/wish')
    }
    else {
      throw new Error(response.value?.message || 'Unknown error')
    }
  }
  catch (err: any) {
    console.error('Wishlist error:', err)
    showToast('wishlistError', err.message)
  }
  finally {
    wishLoading.value = false
  }
}

function getDiscounted(price: number, discount: number) {
  return price - Math.floor(price * discount / 100)
}

const currentPriceInfo = computed(() => {
  if (selectedCombination.value) {
    const matchedComb = combOptions.value.find(c => c.id === selectedCombination.value)
    if (matchedComb) {
      return {
        price: matchedComb.salePrice,
        discount: matchedComb.discount || 0,
        stock: currentVariantStock.value
      }
    }
  }

  let price = props.product.salePrice
  let discount = props.product.discount || 0

  if (selectedSize.value && selectedColor.value) {
    const matchedVariant = combOptions.value.find(v =>
      v.size === selectedSize.value && v.color === selectedColor.value
    )
    if (matchedVariant) {
      return {
        price: matchedVariant.salePrice,
        discount: matchedVariant.discount || 0,
        stock: currentVariantStock.value
      }
    }
  }

  if (selectedSize.value) {
    const sizeVariant = sizeOptions.value.find(s => s.name === selectedSize.value)
    if (sizeVariant) {
      price = sizeVariant.salePrice ?? price
      discount = sizeVariant.discount ?? discount
    }
  }

  if (selectedColor.value) {
    const colorVariant = colorOptions.value.find(c => c.name === selectedColor.value)
    if (colorVariant) {
      price = colorVariant.salePrice ?? price
      discount = colorVariant.discount ?? discount
    }
  }

  return { price, discount, stock: currentVariantStock.value }
})

const getSelectedVariantName = computed(() => {
  if (selectedCombination.value) {
    const comb = combOptions.value.find(c => c.id === selectedCombination.value)
    return comb ? `${comb.size} ${comb.colorName || ''}` : ''
  }

  let name = ''
  if (selectedColor.value) {
    const color = colorOptions.value.find(c => c.name === selectedColor.value)
    name += color?.name || ''
  }
  if (selectedSize.value) {
    if (name) name += ' / '
    name += selectedSize.value
  }
  return name
})

const currentVariantStock = computed(() => {
  if (selectedCombination.value) {
    const matchedComb = combOptions.value.find(c => c.id === selectedCombination.value)
    return matchedComb?.stock || 0
  }

  if (selectedSize.value && selectedColor.value) {
    const matchedVariant = combOptions.value.find(v =>
      v.size === selectedSize.value && v.color === selectedColor.value
    )
    if (matchedVariant) {
      return matchedVariant.stock || 0
    }
  }

  if (selectedSize.value) {
    const sizeVariant = sizeOptions.value.find(s => s.name === selectedSize.value)
    if (sizeVariant) {
      return sizeVariant.stock || 0
    }
  }

  if (selectedColor.value) {
    const colorVariant = colorOptions.value.find(c => c.name === selectedColor.value)
    if (colorVariant) {
      return colorVariant.stock || 0
    }
  }

  return props.product?.stock || 0
})

const featuresList = computed(() => {
  const raw = props.product?.highlights

  if (Array.isArray(raw)) return raw

  if (typeof raw === 'string') {
    try {
      if (raw.startsWith('[') && raw.endsWith(']')) {
        return JSON.parse(raw)
      }
      return raw
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0)
    }
    catch (e) {
      console.error('Error parsing highlights:', e)
      return []
    }
  }

  return []
})
</script>

<template>
  <div class="space-y-6">
    <!-- Main Product Card -->
    <UCard variant="soft" :ui="{ body: 'grid grid-cols-1 md:grid-cols-2 gap-9' }">
      <!-- Thumbnail Gallery (Left Side) -->
      <div class="flex justify-center">
        <DashboardProductsThumbStrip
          :product-video="product.video ?? ''"
          :product-thumbnails="thumbnails!" />
      </div>

      <!-- Product Details (Right Side) -->
      <div class="space-y-4 md:space-y-6">
        <!-- Product Basic Info -->
        <div class="space-y-3 md:space-y-4">
          <h1 class="text-xl sm:text-2xl font-bold leading-snug">
            {{ product.name }}
          </h1>

          <!-- Brand -->
          <div class="flex items-center gap-2 text-lg font-medium">
            <span>Brand: </span>
            <UButton variant="soft" size="sm" :label="product.brand?.name || 'no brand'" />
          </div>
          <!-- Category -->
          <div class="flex items-center gap-1 text-lg font-medium">
            <span>Category: </span>
            <UButton variant="soft" size="sm" :label="product.category.name || 'no category'" />
          </div>

          <!-- Price Section -->
          <div class="flex items-center gap-3 mt-2">
            <template v-if="currentPriceInfo.discount > 0">
              <span class="text-xl md:text-2xl font-bold text-success">
                {{ formatCurrency(getDiscounted(currentPriceInfo.price, currentPriceInfo.discount)) }}
              </span>
              <span class="text-base md:text-lg text-muted line-through">
                {{ formatCurrency(currentPriceInfo.price) }}
              </span>
              <UBadge color="error" variant="outline" size="sm" :label="`${currentPriceInfo.discount}% OFF`" />
            </template>
            <template v-else>
              <span class="text-xl md:text-2xl font-bold text-primary">
                {{ formatCurrency(currentPriceInfo.price) }}
              </span>
            </template>
          </div>
        </div>

        <!-- Delivery Info -->
        <div class="w-full space-y-1">
          <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            Delivery & Details
          </h3>

          <div class="space-y-1 flex flex-wrap gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 p-1 md:p-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-truck" class="text-primary size-5 flex-shrink-0" />
              <div>
                <span class="text-gray-500">Shipping: </span>
                <span v-if="product.shippingCost === 0" class="text-primary font-medium">Free Shipping</span>
                <span v-else class="text-primary font-medium">{{ formatCurrency(product.shippingCost) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 mb-1.5">
              <UIcon name="i-heroicons-clock" class="text-primary size-5 flex-shrink-0" />
              <div>
                <span class="text-gray-500">Delivered In: </span>
                <span class="text-primary font-medium">{{ product.estimatedDelivery }}</span>
              </div>
            </div>
          </div>
          <!-- Season Info -->
          <div v-if="product.season && product.season !== 'All Season'" class="flex items-center gap-2 text-xs md:text-sm p-1 md:p-2">
            <UIcon name="i-heroicons-sun" class="text-primary size-4 md:size-5" />
            <span>Season:</span>
            <span class="text-primary font-medium">{{ product.season }}</span>
          </div>
        </div>

        <!-- Warranty Information -->
        <div v-if="product.brandWarranty || product.sellerWarranty" class="space-y-1">
          <h3 class="text-lg font-semibold">
            Warranty
          </h3>
          <div class="flex flex-wrap gap-3 text-sm text-muted p-1 md:p-2">
            <!-- Brand Warranty -->
            <div v-if="product.brandWarranty" class="flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="text-info size-5" />
              <span>Brand Warranty:</span>
              <span v-if="product.brandWrtDuration" class="font-medium text-primary">
                {{ product.brandWrtDuration }}
              </span>
              <span v-else class="font-medium">Available</span>
            </div>
            <!-- Seller Warranty -->
            <div v-if="product.sellerWarranty" class="flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="text-info size-5" />
              <span>Seller Warranty:</span>
              <span v-if="product.sellerWrtDuration" class="font-medium text-primary">
                {{ product.sellerWrtDuration }}
              </span>
              <span v-else class="font-medium">Available</span>
            </div>
          </div>
        </div>

        <!-- Product Highlights Section -->
        <div v-if="featuresList.length">
          <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <span>Highlights</span>
          </h3>

          <div>
            <ul class=" md:flex flex-wrap">
              <li
                v-for="(feature, index) in featuresList"
                :key="index"
                class="flex items-start gap-1 p-1 md:p-2 rounded-md transition-colors">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="flex-shrink-0 mt-0.5 text-green-500 dark:text-green-400 size-3 md:size-4" />
                <span class="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-snug">
                  {{ feature }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Variants Selection -->
        <ProductVariants
          v-model:selected-size="selectedSize"
          v-model:selected-color="selectedColor"
          v-model:selected-combination="selectedCombination"
          v-model:variant-error="variantError"
          :product-id="productId"
          :features="features"
          :color-options="colorOptions"
          :size-options="sizeOptions"
          :comb-options="combOptions"
          :initial-selected-size="selectedSize"
          :initial-selected-color="selectedColor"
          :initial-selected-combination="selectedCombination" />

        <!-- Quantity Selector -->
        <div v-if="(features.cart || features.wishlist)" class="mt-2">
          <UFormField label="Quantity" required>
            <UInputNumber
              v-model="minShippingProducts"
              :min="product.minShippingProducts"
              :max="Math.min(product.maxShippingProducts, currentVariantStock)"
              :increment="{
                color: 'neutral',
                variant: 'solid',
                size: 'xs',
              }"
              :decrement="{
                color: 'neutral',
                variant: 'solid',
                size: 'xs',
              }"
              :step="1"
              variant="subtle"
              color="primary"
              :label="currentVariantStock === 0 ? 'Out of Stock' : undefined"
              size="md"
              class="w-49 mt-1"
              :disabled="currentVariantStock === 0" />
          </UFormField>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center mt-2 w-62">
          <template v-if="loggedIn">
            <UButton
              v-if="features.cart"
              :loading="cartLoading"
              size="md"
              class="flex-1 justify-center cursor-pointer"
              icon="i-lucide-shopping-cart"
              :disabled="isInCart || currentVariantStock === 0"
              :color="currentVariantStock === 0 ? 'error' : isInCart ? 'warning' : 'neutral'"
              :label="currentVariantStock === 0 ? 'Out of Stock' : isInCart ? 'Already IN CART' : 'ADD TO CART'"
              @click="addToCart" />
            <UButton
              v-if="features.wishlist"
              :loading="wishLoading"
              size="lg"
              :color="isInWishlist ? 'error' : 'neutral'"
              variant="subtle"
              class="mx-2 cursor-pointer"
              :disabled="isInWishlist || wishLoading"
              :title="isInWishlist ? 'Already in wishlist' : 'Add to wishlist'"
              :icon="isInWishlist ? 'i-heroicons-heart' : 'i-heroicons-heart'"
              @click="addToWish" />
          </template>
          <template v-else-if="features.guestCheckout">
            <UButton
              v-if="features.cart"
              :loading="cartLoading"
              size="md"
              class="flex-1 justify-center cursor-pointer"
              icon="i-lucide-shopping-cart"
              :disabled="isInCart || currentVariantStock === 0"
              :color="currentVariantStock === 0 ? 'error' : isInCart ? 'warning' : 'neutral'"
              :label="currentVariantStock === 0 ? 'Out of Stock' : isInCart ? 'Already IN CART' : 'ADD TO CART'"
              @click="addToCart" />
            <UButton
              v-if="features.wishlist"
              :loading="wishLoading"
              size="lg"
              :color="isInWishlist ? 'error' : 'neutral'"
              variant="subtle"
              class="mx-2 cursor-pointer"
              :disabled="isInWishlist || wishLoading"
              :title="isInWishlist ? 'Already in wishlist' : 'Add to wishlist'"
              :icon="isInWishlist ? 'i-heroicons-heart' : 'i-heroicons-heart'"
              @click="addToWish" />
          </template>
          <template v-else>
            <UButton
              to="/login"
              size="lg"
              class="flex-1"
              color="primary"
              label="Login to Purchase" />
          </template>
        </div>
      </div>
    </UCard>
  </div>
</template>
