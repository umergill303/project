<script setup lang="ts">
const { features } = useRuntimeConfig().public.ecommerce

const { order } = defineProps<{
  order: {
    status: string
    pending?: string
    processing?: string
    shipped?: string
    delivered?: string
    canceled?: string
    return?: string
  }
}>()

const appConfig = useAppConfig()

const items = ref([
  {
    title: 'Pending',
    description: 'Order received',
    icon: 'i-lucide-alarm-clock',
    timestamp: order.pending,
  },
  {
    title: 'Processing',
    description: 'Preparing your order',
    icon: appConfig.ui.icons.process,
    timestamp: order.processing,
  },
  {
    title: 'Shipped',
    description: 'On the way',
    icon: 'i-lucide-truck',
    timestamp: order.shipped,
  },
  {
    title: 'Delivered',
    description: 'Order delivered',
    icon: 'i-lucide-square-check-big',
    timestamp: order.delivered,
  },
  ...(features.orderCancellation
    ? [{
        title: 'Canceled',
        description: 'Your order has been canceled',
        icon: 'i-lucide-circle-x',
        timestamp: order.canceled,
      }]
    : []),
  ...(features.orderReturn
    ? [{
        title: 'Return',
        description: 'Back to order',
        icon: appConfig.ui.icons.return,
        timestamp: order.return,
      }]
    : []),
  // {
  //   title: 'Canceled',
  //   description: 'Order canceled',
  //   icon: i-lucide-circle-x,
  //   timestamp: order.canceled,
  // },
  // {
  //   title: 'Returned',
  //   description: 'Order returned',
  //   icon: appConfig.ui.icons.return,
  //   timestamp: order.return,
  // },
])

const statusMap: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  Canceled: 4,
  returned: 5,
}

const activeStep = computed(() => {
  return statusMap[order.status] ?? 0
})

const statusColor = computed(() => {
  switch (order.status) {
    case 'shipped': return 'warning'
    case 'pending':
    case 'processing': return 'secondary'
    case 'delivered': return 'primary'
    case 'Canceled': return 'error'
    case 'Returned': return 'error'
    default: return 'primary'
  }
})
</script>

<template>
  <div class="w-full overflow-x-auto p-3">
    <UStepper
      v-model="activeStep"
      :disabled="true"
      :items="items"
      class="w-[700px] md:w-full"
      :color="statusColor" />

    <!-- <div v-if="items[activeStep]?.timestamp" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
      Status updated: {{ new Date(items[activeStep].timestamp).toLocaleString() }}
    </div> -->
  </div>
</template>
