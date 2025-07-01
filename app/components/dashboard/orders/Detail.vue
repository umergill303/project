<script lang="ts" setup>
import { formatDate } from '#shared/utils/formatDate'
import { formatCurrency } from '~/utils/formatCurrency'
import type { Order, Product } from '~~/server/database/schema'
import { statusConfig } from '~~/config/orderStatus'
import { enumPayment, type PaymentStatus, type OrderStatus } from '#shared/types/enums'

const showMap = ref(false)
const loading = ref(false)
const emit = defineEmits(['update:isOpen', 'refresh', 'update-analytics'])
const props = defineProps<{ isOpen: boolean, order: Order | null, products: (Product & { quantity: number })[] }>()
console.log('order', props.order)

const payment = computed(() => {
  const key = props.order?.payment as PaymentStatus
  return enumPayment[key]
})

const selectedStatus = ref<OrderStatus | undefined>(undefined)
watch(() => props.order, order => {
  if (order) { selectedStatus.value = order.status as OrderStatus }
}, { immediate: true })

const currentStatus = computed(() => props.order?.status?.toLowerCase() as keyof typeof statusConfig || 'pending')

const availableStatuses = computed(() => {
  const current = currentStatus.value
  const config = statusConfig[current]

  return Object.entries(statusConfig).map(([key, value]) => ({
    status: key as OrderStatus,
    label: value.label,
    color: value.color,
    disabled: !config.allowedNext.includes(key) && key !== current,
    isCurrent: key === current
  }))
})

const updateStatus = async () => {
  if (!selectedStatus.value || !props.order) return

  loading.value = true
  try {
    await $fetch('/api/orders/status', { method: 'PATCH',
      body: { id: props.order.id, status: selectedStatus.value } })

    emit('refresh')
    emit('update-analytics')
    showToast('orderUpdated')
  }
  catch { showToast('error') }
  finally { loading.value = false }
}

const dropItems = computed(() =>
  availableStatuses.value
    .filter(item => !item.disabled && !item.isCurrent)
    .map(item => ({
      label: `Update to ${item.label}`,
      color: item.color,
      disabled: item.disabled,
      onSelect: () => {
        selectedStatus.value = item.status
        updateStatus()
      }
    }))
)

const closeSlideover = () => {
  emit('update:isOpen', false)
}

console.log('variantAttributes', props.products)
defineShortcuts({ escape: () => closeSlideover() })

const getVariant = (attrs: any[] = []) => {
  if (!Array.isArray(attrs)) return null

  const mainAttr = attrs.find(attr => attr.attributeName !== 'Color') || {}
  const colorAttr = attrs.find(attr => attr.attributeName === 'Color') || {}

  return {
    attributeName: mainAttr.attributeName || '',
    optionName: mainAttr.optionName || '',
    image: mainAttr.image || '',
    color: colorAttr.color || '',
    colorOptionName: colorAttr.optionName || '',
  }
}
</script>

<template>
  <USlideover
    :open="isOpen"
    :overlay="false"
    description="Order detail"
    :title="`#${String(order?.id).slice(0, 7)}`"
    :close="{ color: 'neutral', variant: 'soft', onClick: () => closeSlideover() }"
    :ui="{ content: 'm-0 sm:m-3 divide-y rounded-md ', header: 'flex justify-between py-3', body: 'px-3 sm:px-5 sm:py-1 *:py-2 divide-y divide-(--ui-border)' }">
    <template #body>
      <div class="font-medium *:text-sm flex items-center justify-between *:space-y-2 *:text-center">
        <div>
          <p class="text-start">
            Created at
          </p>
          <p>{{ formatDate(order?.date ?? '') }}</p>
        </div>
        <div>
          <p>Payment</p>
          <UButton :color="payment?.color" variant="soft" :label="order?.payment ?? ''" size="sm" class="px-4" />
        </div>
        <div>
          <p>Status</p>
          <UButton
            :color="statusConfig[currentStatus]?.color || 'neutral'"
            variant="soft"
            :label="statusConfig[currentStatus]?.label || order?.status || ''"
            size="sm"
            class="px-4" />
        </div>
      </div>

      <div class="font-medium grid text-sm space-y-2">
        <p class="text-xs text-muted">
          Customer
        </p>
        <UButton color="neutral" variant="link" :label="order?.name ?? ''" icon="i-lucide-user" class="p-0" />
        <UButton color="neutral" variant="link" :label="order?.phone ?? ''" icon="i-lucide-phone" class="p-0" />
        <UButton color="info" variant="link" :label="order?.email ?? ''" icon="i-lucide-mail" class="p-0" />
      </div>

      <div class="font-medium text-sm space-y-0.5">
        <p class="text-xs text-muted">
          Address
        </p>
        <p>{{ order?.country }}, {{ order?.province }}, {{ order?.city }}</p>
        <p>{{ order?.address }}</p>
        <UButton
          color="info"
          variant="link"
          label="Map"
          icon="i-lucide-map"
          class="p-0 cursor-pointer"
          @click="showMap = true" />
      </div>

      <div>
        <p class="font-medium pb-2 text-xs text-muted">
          Items
        </p>
        <DashboardOrdersProducts
          v-for="product in products"
          :key="product.id"
          :name="product.name ?? ''"
          :sale-price="product.salePrice || 0"
          :quantity="String(product.quantity || '')"
          :thumbnail="product.thumbnail || ''"
          :variant="product.variantAttributes ? getVariant(product.variantAttributes) : null" />
      </div>

      <div>
        <p class="text-muted text-xs">
          Payment
        </p>
        <div class="*:text-sm *:flex *:justify-between *:items-center *:font-medium py-1 space-y-0.5">
          <div>
            <p>Subtotal</p>
            <p>{{ formatCurrency(order?.salePrice || 0) }}</p>
          </div>
          <div>
            <p>Discount</p>
            <p>{{ formatCurrency(order?.discount || 0) }}</p>
          </div>
          <div>
            <p>Shipping Cost</p>
            <p>{{ formatCurrency(order?.shippingCost || 0) }}</p>
          </div>
          <div>
            <p>Total</p>
            <p>{{ formatCurrency(order?.totalPrice || 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Status Update Dropdown -->
      <div v-if="dropItems.length > 0">
        <UDropdownMenu :items="dropItems" :ui="{ content: 'w-96' }">
          <UButton
            :loading="loading"
            :disabled="loading"
            color="primary"
            label="Update Status"
            icon="i-fluent-status-12-regular"
            class="w-full justify-center my-2 cursor-pointer" />
        </UDropdownMenu>
      </div>

      <!-- Show current status info if no updates available -->
      <div v-else class="text-center py-4">
        <p class="text-sm text-muted">
          Order status: <span class="font-medium" :class="`text-${statusConfig[currentStatus]?.color}-500`">
            {{ statusConfig[currentStatus]?.label }}
          </span>
        </p>
        <p class="text-xs text-muted mt-1">
          No further status updates available
        </p>
      </div>
    </template>
  </USlideover>
  <DashboardOrdersMap v-model:is-open="showMap" :order />
</template>
