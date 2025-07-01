<script setup lang="ts">
import type { NoNull } from '#shared/types'

const props = defineProps<{
  order: NoNull<Order>
  orderproduct: any[] | undefined
}>()

console.log('order>>>>>>>>>>>>>>>', props.order)
console.log('orderProducts>>>>>>>>>>>>>>>', props.orderproduct)

// Debug delivery values
if (props.orderproduct?.length) {
  console.log('Delivery values:', props.orderproduct.map(product => ({
    id: product.id,
    name: product.name,
    delivery: product.delivery,
    isValidNumber: product.delivery ? !isNaN(parseInt(product.delivery)) : false
  })))
}

// Compute the highest estimated delivery days
const highestEstimatedDelivery = computed(() => {
  if (!props.orderproduct?.length) {
    console.log('No order products available')
    return null
  }

  const validDeliveries = props.orderproduct
    .map(product => product.delivery) // Use capital 'D' to match query
    .filter(delivery => delivery != null) // Remove null/undefined
    .map(delivery => parseInt(delivery)) // Parse number from string (e.g., "3 days" -> 3)
    .filter(days => !isNaN(days)) // Ensure valid numbers

  if (!validDeliveries.length) {
    console.log('No valid delivery days found')
    return null
  }

  const maxDays = Math.max(...validDeliveries)
  console.log('Highest Estimated Delivery:', `${maxDays} day${maxDays !== 1 ? 's' : ''}`)
  return `${maxDays} day${maxDays !== 1 ? 's' : ''}`
})
</script>

<template>
  <div class="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Address
      </p>
      <p class="text-sm font-semibold whitespace-wrap overflow-x-auto text-neutral-800 dark:text-neutral-100">
        {{ order.address }}
      </p>
    </div>
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Total Price
      </p>
      <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        ${{ calculateTotalPrice(order).toFixed(2) }}
      </p>
    </div>
    <div v-if="highestEstimatedDelivery">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Estimated Delivery
      </p>
      <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        {{ highestEstimatedDelivery }}
      </p>
    </div>
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Status
      </p>
      <UBadge
        color="neutral"
        variant="subtle"
        :label="order.status" />
    </div>
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Tracking
      </p>
      <UBadge
        color="primary"
        variant="subtle"
        :label="`#${order.id?.split('-')[0]}`" />
    </div>
  </div>
</template>
