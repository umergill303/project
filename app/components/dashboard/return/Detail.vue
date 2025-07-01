<script lang="ts" setup>
import { enumReturnOrder, type ReturnOrderStatusType, ReturnOrderStatus } from '#shared/types/enums'
import type { ReturnOrderProduct } from '#shared/types/ReturnOrderProduct'

const showMap = ref(false)
const { ui } = useAppConfig()
const emit = defineEmits(['update:isOpen', 'refresh'])

const props = defineProps<{
  isOpen: boolean
  order: ReturnOrder | null
  products: ReturnOrderProduct[]
}>()

console.log('return', props.products)

// Define the status workflow (for reference)
const statusWorkflow: ReturnOrderStatusType[] = [
  ReturnOrderStatus.Requested,
  ReturnOrderStatus.Approved,
  ReturnOrderStatus.Processing,
  ReturnOrderStatus.Shipped,
  ReturnOrderStatus.Received,
  ReturnOrderStatus.Refunded,
  ReturnOrderStatus.Rejected
]

// Get current status info
const status = computed(() => {
  if (!props.order?.status) return null
  return enumReturnOrder[props.order.status as ReturnOrderStatusType]
})

const selectedStatus = ref<ReturnOrderStatusType | undefined>(undefined)
watch(() => props.order, order => {
  if (order) {
    selectedStatus.value = order.status as ReturnOrderStatusType
  }
}, { immediate: true })

// Updated validation to allow reverting to previous statuses
// const isValidTransition = (current: string, next: string): boolean => {
//   // Rejected and Refunded are final states - cannot be changed once set
//   if (current === ReturnOrderStatus.Rejected || current === ReturnOrderStatus.Refunded) {
//     return false
//   }

//   // Allow any transition except to final states from non-final states
//   return next !== ReturnOrderStatus.Rejected && next !== ReturnOrderStatus.Refunded
// }

const updateStatus = async () => {
  if (!selectedStatus.value || !props.order) return

  try {
    const response = await $fetch('/api/orders/return/status', {
      method: 'PATCH',
      body: {
        id: props.order.id,
        status: selectedStatus.value
      }
    })

    if (response.success) {
      emit('refresh')
      showToast('Status updated successfully')
    }
    else {
      showToast(response.message || 'Update failed', { color: 'error' })
    }
  }
  catch (error) {
    console.error('Failed to update status:', error)
    showToast('Failed to update status', { color: 'error' })
  }
}

// Define valid transitions
const isValidTransition = (current: string, next: string): boolean => {
  if (current === ReturnOrderStatus.Rejected || current === ReturnOrderStatus.Refunded) {
    return false
  }

  const validTransitions = {
    [ReturnOrderStatus.Requested]: [ReturnOrderStatus.Approved, ReturnOrderStatus.Rejected],
    [ReturnOrderStatus.Approved]: [ReturnOrderStatus.Processing, ReturnOrderStatus.Rejected],
    [ReturnOrderStatus.Processing]: [ReturnOrderStatus.Shipped, ReturnOrderStatus.Rejected],
    [ReturnOrderStatus.Shipped]: [ReturnOrderStatus.Received, ReturnOrderStatus.Rejected],
    [ReturnOrderStatus.Received]: [ReturnOrderStatus.Refunded, ReturnOrderStatus.Rejected],
  }

  return validTransitions[current]?.includes(next as ReturnOrderStatusType) || false
}

// Updated dropdown items
const dropItems = computed(() => {
  return Object.values(enumReturnOrder).map(status => {
    const isDisabled = props.order?.status
      ? !isValidTransition(props.order.status, status.status)
      : false

    return {
      label: status.label,
      disabled: isDisabled,
      onSelect: () => {
        if (!isDisabled) {
          selectedStatus.value = status.status
          updateStatus()
        }
      },
      icon: ui.icons.circle,
      iconClass: `text-${status.color}-500 dark:text-${status.color}-400`
    }
  })
})

const formattedDate = computed(() => {
  if (!props.order?.createdAt) return ''
  const date = new Date(props.order.createdAt)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const closeSlideover = () => {
  emit('update:isOpen', false)
}

defineShortcuts({
  escape: closeSlideover
})
// Add new computed properties for calculations
const subtotal = computed(() => calculateSubtotal(props.products))
const discount = computed(() => calculateDiscount(props.products))
const shipping = computed(() => calculateShipping(props.products))
const total = computed(() => calculateTotal(props.products))
</script>

<template>
  <USlideover
    :open="isOpen"
    :overlay="false"
    :title="`Return #${String(order?.id).slice(0, 7)}`"
    description="Return order details"
    :ui="{
      content: 'm-0 sm:m-3 divide-y rounded-md',
      header: 'flex justify-between py-3',
      body: 'px-3 sm:px-5 sm:py-1 *:py-2 divide-y divide-(--ui-border)',
    }"
    @close="closeSlideover">
    <template #close>
      <UButton
        color="neutral"
        variant="soft"
        :icon="ui.icons.close"
        size="sm"
        @click="closeSlideover" />
    </template>

    <template #body>
      <!-- Order Summary -->
      <div class="font-medium *:text-sm flex items-center justify-between *:space-y-2 *:text-center">
        <div>
          <p class="text-start">
            Created at
          </p>
          <p>{{ formattedDate }}</p>
        </div>
        <div>
          <p>Status</p>
          <UButton
            :color="status?.color"
            variant="soft"
            :label="status?.label ?? ''"
            size="sm"
            class="px-4" />
        </div>
        <div>
          <p>Method</p>
          <p class="capitalize">
            {{ order?.method }}
          </p>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="font-medium grid text-sm space-y-2">
        <p class="text-xs text-muted">
          Customer
        </p>
        <UButton
          color="neutral"
          variant="link"
          :label="order?.name ?? ''"
          icon="i-lucide-user"
          class="p-0" />
        <UButton
          color="neutral"
          variant="link"
          :label="order?.phone ?? ''"
          icon="i-lucide-phone"
          class="p-0" />
        <UButton
          color="info"
          variant="link"
          :label="order?.email ?? ''"
          icon="i-lucide-mail"
          class="p-0" />
      </div>

      <!-- Address -->
      <div class="font-medium text-sm space-y-0.5">
        <p class="text-xs text-muted">
          Address
        </p>
        <p>{{ order?.country }}, {{ order?.city }}</p>
        <p>{{ order?.street }}</p>
        <p>Postal Code: {{ order?.postalCode }}</p>
        <UButton
          color="info"
          variant="link"
          label="Map"
          icon="i-lucide-map"
          class="p-0"
          @click="showMap = true" />
      </div>

      <!-- Return Reason -->
      <div>
        <p class="font-medium pb-2 text-xs text-muted">
          Reason
        </p>
        <p class="capitalize">
          {{ order?.reason }}
        </p>
      </div>

      <!-- Notes -->
      <div v-if="order?.notes">
        <p class="font-medium pb-2 text-xs text-muted">
          Notes
        </p>
        <p>{{ order?.notes }}</p>
      </div>

      <!-- Returned Products -->
      <div v-if="products.length > 0">
        <p class="text-muted text-xs">
          Returned Items
        </p>
        <div class="py-1 space-y-2">
          <div
            v-for="(product, index) in products"
            :key="index"
            class="grid grid-cols-[auto_1fr] gap-4 items-center">
            <!-- Thumbnail -->
            <div class="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              <NuxtImg
                :provider="getThumbnail(product.thumbnail)[0] ? 'cloudflare' : undefined"
                :src="getThumbnail(product.thumbnail)[0] || '/Noimage.jpg'"
                class="w-14 h-12 rounded shadow-sm"
                :alt="product.name" />
            </div>

            <!-- Product Info -->
            <div class="text-sm font-medium space-y-1">
              <div class="flex justify-between">
                <p class="text-neutral">
                  {{ product.name }}
                </p>

                <p class="text-right">
                  {{ formatCurrency((product.quantity * (product.salePrice))) }}
                </p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div v-if=" product.variantColor" class="flex items-center gap-1">
                  <span
                    class="w-4 h-4 rounded-full border border-neutral-200"
                    :style="{ backgroundColor: product.variantColor }" />
                  <span class="text-sm text-neutral-600 ">
                    <UButton
                      color="neutral"
                      variant="outline"
                      size="xs">
                      {{ product.variantName }}
                    </UButton>
                  </span>
                </div>
                <span v-else-if="product.variantName" class="text-sm text-neutral-600 dark:text-neutral-400">
                  <UButton
                    color="neutral"
                    variant="outline"
                    size="xs">
                    {{ product.variantName }}
                  </UButton>
                </span>
              </div>
              <div class="flex justify-between text-xs text-muted">
                <p>Qty: {{ product.quantity }}</p>
                <p>Unit: {{ formatCurrency(product.salePrice || 0) }}</p>
                <p>Discount: {{ product.discount }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Summary -->

        <!-- Updated Total Summary section using computed properties -->
        <div class="border-t border-muted pt-2 mt-2 space-y-1 text-sm font-medium">
          <div class="flex justify-between">
            <p>Subtotal</p>
            <p>{{ formatCurrency(subtotal.toFixed(2)) }}</p>
          </div>
          <div class="flex justify-between">
            <p>Discount</p>
            <p class="text-error">
              -{{ formatCurrency(discount.toFixed(2)) }}
            </p>
          </div>
          <div class="flex justify-between">
            <p>Shipping</p>
            <p class="text-neutral">
              {{ formatCurrency(shipping.toFixed(2)) }}
            </p>
          </div>
          <div class="flex justify-between font-semibold">
            <p>Total</p>
            <p class="text-primary">
              {{ formatCurrency(total.toFixed(2)) }}
            </p>
          </div>
        </div>

        <!-- Status Update Dropdown -->
        <UDropdownMenu :items="dropItems" :ui="{ content: 'w-96' }">
          <UButton
            class="w-full justify-center my-2 cursor-pointer"
            :label="selectedStatus ? `Update to ${enumReturnOrder[selectedStatus].label}` : 'Update Status'"
            :color="selectedStatus ? enumReturnOrder[selectedStatus].color : 'neutral'"
            :disabled="!selectedStatus" />
        </UDropdownMenu>

        <DashboardReturnMap v-model:is-open="showMap" :order />
      </div>
    </template>
  </USlideover>
</template>
