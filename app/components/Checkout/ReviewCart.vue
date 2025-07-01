<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'
import { formatCurrency } from '~/utils/formatCurrency'

const props = defineProps<{ products: Product[] }>()
const appConfig = useAppConfig()
const { data } = await useFetch('/api/about')

// Initialize price states
const totalSalePrice = ref(0)
const totalDiscountPrice = ref(0)
const totalDiscountedPrice = ref(0)
const totalShippingPrice = ref(0)
const TotalPrice = ref(0)

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
  return product.shippingCost ?? 0
}

// Calculate prices when products change
const calculatePrices = (products: Product[]) => {
  let salePriceTotal = 0
  let discountTotal = 0
  let discountedPriceTotal = 0
  let shippingTotal = 0
  let finalTotal = 0

  products.forEach(product => {
    if (getProductStock(product) <= 0) return // Skip out of stock items

    const salePrice = getProductSalePrice(product)
    const discount = getProductDiscount(product)
    const qty = product.qty ?? 1
    const shippingPrice = getShippingPrice(product)

    const discountedPrice = getDiscountedPrice(salePrice, discount)

    salePriceTotal += salePrice * qty
    discountTotal += (salePrice * discount / 100) * qty
    discountedPriceTotal += discountedPrice * qty
    shippingTotal += shippingPrice * qty
  })

  // Calculate shipping (customize based on your logic)
  // shippingTotal = calculateShipping(discountedPriceTotal)

  finalTotal = discountedPriceTotal + shippingTotal

  return {
    totalSalePrice: salePriceTotal.toFixed(2),
    totalDiscountPrice: discountTotal.toFixed(2),
    totalDiscountedPrice: discountedPriceTotal.toFixed(2),
    totalShippingPrice: shippingTotal.toFixed(2),
    TotalPrice: finalTotal.toFixed(2)
  }
}

// Example shipping calculation
// const calculateShipping = (subtotal: number) => {
//   // Free shipping for orders over $50
//   if (subtotal > 50) return 0
//   return 5.99 // Flat rate shipping
// }

const paymentMethods = ref<RadioGroupItem[]>([
  {
    label: 'Cash on Delivery',
    value: 'cash-on-delivery',
    description: 'Pay with cash when your order is delivered to your doorstep.'
  },
])

// Update prices when products change
watch(
  () => props.products,
  newProducts => {
    if (Array.isArray(newProducts) && newProducts.length > 0) {
      const prices = calculatePrices(newProducts)
      totalSalePrice.value = prices.totalSalePrice
      totalDiscountPrice.value = prices.totalDiscountPrice
      totalDiscountedPrice.value = prices.totalDiscountedPrice
      totalShippingPrice.value = prices.totalShippingPrice
      TotalPrice.value = prices.TotalPrice
    }
    else {
      totalSalePrice.value = 0
      totalDiscountPrice.value = 0
      totalDiscountedPrice.value = 0
      totalShippingPrice.value = 0
      TotalPrice.value = 0
    }
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <UPageCard
      title="Order Summary"
      description="Review your items and confirm your purchase">
      <div class="space-y-2 font-medium">
        <div class="flex justify-between">
          <p>Subtotal:</p>
          <p class="">
            {{ formatCurrency(totalSalePrice) }}
          </p>
        </div>
        <div class="flex justify-between">
          <p>Shipping:</p>
          <p class="">
            {{ formatCurrency(totalShippingPrice) }}
          </p>
        </div>
        <div class="flex justify-between">
          <p>Discount:</p>
          <p class="">
            {{ formatCurrency(totalDiscountPrice) }}
          </p>
        </div>
        <USeparator type="dashed" class="my-2" />
        <div class="font-medium flex justify-between">
          <p>Total:</p>
          <p>{{ formatCurrency(TotalPrice) }}</p>
        </div>
      </div>
      <UAlert color="warning" variant="subtle" icon="i-lucide-triangle-alert" title="Check the details before placing your order." />

      <div>
        <span class="font-bold text-lg">Cart ({{ products.length }} items)</span>
        <template
          v-for="(product, idx) in products"
          :key="product.productId">
          <CheckoutProduct :product />
          <USeparator v-if="idx < products.length-1" type="dashed" />
        </template>
      </div>

      <!-- Payment Methods Section -->
      <URadioGroup variant="table" default-value="cash-on-delivery" :items="paymentMethods" />
    </UPageCard>
  </div>
</template>
