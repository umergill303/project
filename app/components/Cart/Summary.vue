```vue
<script lang="ts" setup>
import { formatCurrency } from '~/utils/formatCurrency'
import type { Product } from '~~/server/database/schema'

const props = defineProps<{ products: Product[] }>()
const emit = defineEmits(['refresh'])

console.log('CartSummary props.products:', props.products)

const loading = ref(false)
const appConfig = useAppConfig()
const toast = useToast()

// Initialize price states
const totalSalePrice = ref('0.00')
const totalDiscountPrice = ref('0.00')
const totalDiscountedPrice = ref('0.00')
const totalShippingPrice = ref('0.00')
const TotalPrice = ref('0.00')

// Helper functions
const getProductStock = (product: Product): number => {
  return product.variant?.stock ?? product.stock ?? 0
}

const getProductSalePrice = (product: Product): number => {
  return product.variant?.salePrice ?? product.salePrice ?? 0
}

const getProductDiscount = (product: Product): number => {
  return product.variant?.discount ?? product.discount ?? 0
}

const getDiscountedPrice = (price: number, discount: number): number => {
  return price - (price * discount) / 100
}

const getShippingPrice = (product: Product): number => {
  return (product.shippingCost ?? 0) * (product.qty ?? 1)
}

// Calculate prices
const calculatePrices = (products: Product[]) => {
  let salePriceTotal = 0
  let discountTotal = 0
  let discountedPriceTotal = 0
  let shippingTotal = 0

  products.forEach(product => {
    if (getProductStock(product) <= 0) return // Skip out of stock items

    const salePrice = getProductSalePrice(product)
    const discount = getProductDiscount(product)
    const qty = product.qty ?? 1

    const discountedPrice = getDiscountedPrice(salePrice, discount)
    const shippingPrice = getShippingPrice(product)

    salePriceTotal += salePrice * qty
    discountTotal += (salePrice * discount / 100) * qty
    discountedPriceTotal += discountedPrice * qty
    shippingTotal += shippingPrice
  })

  const finalTotal = discountedPriceTotal + shippingTotal

  return {
    totalSalePrice: salePriceTotal.toFixed(2),
    totalDiscountPrice: discountTotal.toFixed(2),
    totalDiscountedPrice: discountedPriceTotal.toFixed(2),
    totalShippingPrice: shippingTotal.toFixed(2),
    TotalPrice: finalTotal.toFixed(2),
  }
}

// Update prices when products change
const updatePrices = () => {
  if (!props.products || props.products.length === 0) {
    totalSalePrice.value = '0.00'
    totalDiscountPrice.value = '0.00'
    totalDiscountedPrice.value = '0.00'
    totalShippingPrice.value = '0.00'
    TotalPrice.value = '0.00'
    console.log('CartSummary: No products, resetting prices to 0')
    return
  }

  const prices = calculatePrices(props.products)
  totalSalePrice.value = prices.totalSalePrice
  totalDiscountPrice.value = prices.totalDiscountPrice
  totalDiscountedPrice.value = prices.totalDiscountedPrice
  totalShippingPrice.value = prices.totalShippingPrice
  TotalPrice.value = prices.TotalPrice
  emit('refresh')
  console.log('CartSummary: Updated prices:', prices)
}

watch(
  () => props.products,
  () => {
    updatePrices()
  },
  { deep: true, immediate: true }
)

// Check for out of stock items
const outOfStockProducts = computed(() => {
  return props.products.filter(product => getProductStock(product) <= 0)
})

// Check for products with invalid quantities
const invalidQuantityProducts = computed(() => {
  return props.products.filter(product => {
    const stock = getProductStock(product)
    const qty = product.qty ?? 0
    const min = product.minShippingProducts ?? 1
    const max = Math.min(product.maxShippingProducts ?? Infinity, stock)

    return stock > 0 && (qty < min || qty > max)
  })
})

const processToCheckout = async () => {
  loading.value = true
  try {
    if (!props.products || props.products.length === 0) {
      toast.add({
        title: 'Empty Cart',
        icon: appConfig.ui.icons.error,
        description: 'Your cart is empty. Add products before proceeding.',
        color: 'error',
      })
      return
    }

    if (outOfStockProducts.value.length > 0) {
      toast.add({
        title: 'Out of Stock',
        icon: appConfig.ui.icons.error,
        description: `${outOfStockProducts.value.length} product(s) are out of stock. Please remove them to proceed.`,
        color: 'error',
      })
      return
    }

    if (invalidQuantityProducts.value.length > 0) {
      const productNames = invalidQuantityProducts.value
        .slice(0, 3)
        .map(p => p.name)
        .join(', ')

      const extra = invalidQuantityProducts.value.length > 3 ? ` and ${invalidQuantityProducts.value.length - 3} more` : ''

      toast.add({
        title: 'Invalid Quantities',
        icon: appConfig.ui.icons.error,
        description: `Adjust quantities for: ${productNames}${extra}`,
        color: 'error',
      })
      return
    }

    await navigateTo('/checkout')
    toast.add({
      title: 'Success',
      icon: 'i-lucide-circle-check',
      description: 'Now provide additional information to complete your order.',
      color: 'success',
    })
    emit('refresh')
  }
  catch (error) {
    console.error('Error processing checkout:', error)
    toast.add({
      title: 'Error',
      description: 'An error occurred while processing your checkout. Please try again.',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex px-5 pt-2 flex-col lg:col-span-3 h-fit overflow-hidden border border-muted rounded-md">
    <h4 class="font-medium py-2.5">
      Order Summary
    </h4>
    <div class="flex flex-col *:border-t *:border-muted">
      <div class="space-y-2 py-3 *:font-medium">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>{{ formatCurrency(totalSalePrice) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Shipping</span>
          <span v-if="Number(totalShippingPrice) > 0">{{ formatCurrency(totalShippingPrice) }}</span>
          <span v-else>{{ formatCurrency(0) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Discount</span>
          <span>{{ formatCurrency(totalDiscountPrice) }}</span>
        </div>
      </div>
      <div class="flex justify-between py-1 font-medium">
        <span>Total</span>
        <span>{{ formatCurrency(TotalPrice) }}</span>
      </div>
    </div>

    <!-- Validation messages -->
    <div v-if="outOfStockProducts.length > 0" class="bg-muted text-error text-sm p-3 rounded mt-2">
      <div class="flex items-start gap-2">
        <UIcon :name="appConfig.ui.icons.error" class="mt-0.5 flex-shrink-0" />
        <div>
          <p class="font-medium">
            Out of stock items
          </p>
          <p class="text-xs mt-1">
            Remove {{ outOfStockProducts.length }} out-of-stock product(s) to proceed
          </p>
        </div>
      </div>
    </div>

    <div v-if="invalidQuantityProducts.length > 0" class="bg-muted text-error text-sm p-3 rounded mt-2">
      <div class="flex items-start gap-2">
        <UIcon :name="appConfig.ui.icons.error" class="mt-0.5 flex-shrink-0" />
        <div>
          <p class="font-medium">
            Quantity issues
          </p>
          <p class="text-xs mt-1">
            Adjust quantities for {{ invalidQuantityProducts.length }} product(s)
          </p>
          <ul class="text-xs mt-1 list-disc list-inside">
            <li v-for="product in invalidQuantityProducts.slice(0, 3)" :key="product.productId">
              {{ product.name }} (Current: {{ product.qty }}, Min: {{ product.minShippingProducts ?? 1 }}, Max: {{
                Math.min(product.maxShippingProducts ?? Infinity, getProductStock(product))
              }})
            </li>
            <li v-if="invalidQuantityProducts.length > 3">
              ...and {{ invalidQuantityProducts.length - 3 }} more
            </li>
          </ul>
        </div>
      </div>
    </div>

    <ULink class="w-full pb-2 mt-2" to="/checkout">
      <UButton
        v-if="props.products && props.products.length > 0"
        class="cursor-pointer"
        block
        label="Proceed to Checkout"
        :loading="loading"
        :icon="appConfig.ui.icons.process"
        color="neutral"
        :disabled="outOfStockProducts.length > 0 || invalidQuantityProducts.length > 0"
        @click="processToCheckout" />
      <UButton
        v-else
        block
        color="neutral"
        label="Select Product First"
        :icon="appConfig.ui.icons.error"
        disabled />
    </ULink>
  </div>
</template>
