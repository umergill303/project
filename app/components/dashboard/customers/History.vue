<script lang="ts" setup>
import { format } from 'date-fns'
import { formatCurrency } from '~/utils/formatCurrency'

type Product = {
  id?: string
  name?: string
  salePrice?: number
  quantity?: number
  thumbnail?: string
}

type Order = {
  id?: string | null
  date?: string | null
  salePrice?: number | null
  discount?: number | null
  shippingCost?: number | null
  totalPrice?: number | null
  products?: Product[]
}

const props = defineProps<{ orders: Order[] }>()

const formatDate = (date: string | Date) => {
  return date ? format(new Date(date), 'PPP') : 'Invalid Date'
}
const groupedOrders = computed(() => {
  const groups: Record<string, Order[]> = {}
  for (const order of props.orders) {
    const formattedDate = formatDate(order.date ?? '')
    if (!groups[formattedDate]) {
      groups[formattedDate] = []
    }
    groups[formattedDate].push(order)
  }
  return groups
})
</script>

<template>
  <div class="py-5">
    <div class="space-y-6">
      <div v-for="(orderItems, date) in groupedOrders" :key="date" class="space-y-3 border-l border-default ml-3 pl-10 relative">
        <UIcon name="i-lucide-locate-fixed" class="size-7 absolute -left-3.5" />
        <p class="font-medium">
          {{ date }}
        </p>

        <div v-for="order in orderItems" :key="order.id?? ''" class="flex flex-wrap gap-3">
          <UPageCard v-for="product in order.products" :key="product.id" variant="soft" :ui="{ root: 'font-medium shadow-sm w-full md:w-auto flex-auto md:max-w-80 items-center', container: 'p-3 sm:p-3', body: 'flex item-center gap-3' }">
            <template #body>
              <NuxtImg :src="product.thumbnail || '/noimage1.jpg'" provider="cloudflare" loading="lazy" class="size-24 rounded-md shadow object-cover bg-(--ui-border-accented)" />
              <div class="flex flex-col justify-center space-y-1">
                <p class="max-w-33 truncate">
                  {{ product.name || 'No Product' }}
                </p>
                <p>{{ `Qty(${product.quantity || '0'} pcs)` }}</p>
                <p>{{ `Price: ${formatCurrency(product.salePrice || 0)}` }}</p>
              </div>
            </template>
          </UPageCard>

          <UPageCard variant="soft" :ui="{ root: 'w-full md:w-auto flex-auto md:max-w-80 font-medium  shadow-sm', container: 'p-3 sm:p-3', body: 'w-full' }">
            <template #body>
              <div class="*:flex *:items-center *:justify-between space-y-0.5">
                <section>
                  <p>Subtotal</p>
                  <p> {{ formatCurrency(order.salePrice|| 0) }}</p>
                </section>
                <section>
                  <p>Discount</p>
                  <p> {{ formatCurrency(order.discount || 0) }}</p>
                </section>
                <section>
                  <p>Shipping</p>
                  <p v-if="order.shippingCost === 0">
                    Free
                  </p>
                  <p v-else>
                    {{ formatCurrency(order.shippingCost || 0) }}
                  </p>
                </section>
                <section>
                  <p>Paid by Customer</p>
                  <p> {{ formatCurrency(order.totalPrice || 0) }}</p>
                </section>
              </div>
            </template>
          </UPageCard>
        </div>
      </div>
    </div>
  </div>
</template>
