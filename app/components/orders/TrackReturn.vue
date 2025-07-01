<script setup lang="ts">
const { returnOrder: returnOrderProp } = defineProps<{
  returnOrder?: Array<{
    status: 'requested' | 'approved' | 'processing' | 'shipped' | 'received' | 'refunded' | 'rejected'
    createdAt: string
    reason: string
    method: string
    trackingNumber?: string
    carrier?: string
    name?: string
    email?: string
    phone?: string
    city?: string
    country?: string
    street?: string
    postalCode?: string
    notes?: string
    order?: string
  }> | {
    status: 'requested' | 'approved' | 'processing' | 'shipped' | 'received' | 'refunded' | 'rejected'
    createdAt: string
    reason: string
    method: string
    trackingNumber?: string
    carrier?: string
  }
}>()

// Handle both array and object cases with null check
const returnOrder = computed(() => {
  if (!returnOrderProp) return null
  return Array.isArray(returnOrderProp) ? returnOrderProp[0] : returnOrderProp
})

console.log('Processed Return Order:', returnOrder.value)

const appConfig = useAppConfig()

const items = ref([
  {
    title: 'Requested',
    description: 'Return request submitted',
    icon: appConfig.ui.icons.product,
  },
  {
    title: 'Approved',
    description: 'Return approved',
    icon: 'i-lucide-check',
  },
  {
    title: 'Processing',
    description: 'Preparing return',
    icon: appConfig.ui.icons.process,
  },
  {
    title: 'Shipped',
    description: 'Return in transit',
    icon: 'i-lucide-truck',
  },
  {
    title: 'Received',
    description: 'Item received',
    icon: 'i-lucide-package',
  },
  {
    title: 'Refunded',
    description: 'Refund processed',
    icon: appConfig.ui.icons.refunded,
  },
  {
    title: 'Rejected',
    description: 'Return rejected',
    icon: 'i-lucide-circle-x',
  },
])

const statusMap: Record<string, number> = {
  requested: 0,
  approved: 1,
  processing: 2,
  shipped: 3,
  received: 4,
  refunded: 5,
  rejected: 6,
}

const activeStep = computed(() => {
  return returnOrder.value ? statusMap[returnOrder.value.status] ?? 0 : 0
})

const statusColor = computed(() => {
  if (!returnOrder.value) return 'neutral'
  switch (returnOrder.value.status) {
    case 'rejected': return 'error'
    case 'refunded': return 'primary'
    case 'shipped': return 'warning'
    case 'requested':
    case 'processing': return 'secondary'
    default: return 'info'
  }
})
</script>

<template>
  <div v-if="returnOrder" class="space-y-4">
    <div class="w-full overflow-x-auto p-3">
      <UStepper
        v-model="activeStep"
        :disabled="true"
        :items="items"
        class="w-[700px] md:w-full"
        :color="statusColor" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-1 gap-4 ">
      <UCard>
        <template #header>
          <h3 class="font-medium">
            Return Details
          </h3>
        </template>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Reason</span>
            <span>{{ returnOrder.reason || 'Not specified' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Method</span>
            <span>{{ returnOrder.method || 'Not specified' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Request Date</span>
            <span>{{ returnOrder.createdAt ? new Date(returnOrder.createdAt).toLocaleDateString() : 'Not available' }}</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
