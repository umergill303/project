<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import { UButton, UCheckbox } from '#components'
import { statusConfig } from '~~/config/orderStatus'
import { formatDate } from '#shared/utils/formatDate'
import { formatCurrency } from '~/utils/formatCurrency'
import { getCapitalize } from '#shared/utils/capitalize'
import { enumPayment } from '~~/shared/types/enums'
import type { Order, Product } from '~~/server/database/schema'

const { ui } = useAppConfig()
const selectedOrderId = ref()
const isOrderDetail = ref(false)
const isDeleteModal = ref(false)
const emit = defineEmits(['update-analytics'])
const selectedOrderIds = ref(new Set<string>())
const deleteMode = ref<'single' | 'multiple'>('single')

const props = defineProps({
  showNav: { type: Boolean, default: true },
  orderLimit: { type: Number, default: null },
  showPagination: { type: Boolean, default: true },
})

const page = ref(1)
const search = ref('')
const limit = ref(props.orderLimit ?? 9)

const { loading, orders, total, fetchOrders, deleteOrder, deleteMultipleOrders } = useOrders()

watch([page, search], async ([_newPage, newSearch], [_oldPage, oldSearch]) => {
  if (newSearch !== oldSearch) { page.value = 1 }
  await fetchOrders(page.value, limit.value, search.value)
}, { immediate: true })

// single Order and its Products
const order = ref<Order | null>(null)
const orderProducts = ref<(Product & { quantity: number })[]>([])
watch([selectedOrderId, isOrderDetail], async ([id, isOpen]) => {
  if (!id || !isOpen) return
  loading.value = true
  try {
    const res = await $fetch<{ order: Order, orderProducts: (Product & { quantity: number })[] }>(`/api/orders/${id}`)
    console.log('orderProducts', res.orderProducts)
    order.value = res.order
    orderProducts.value = res.orderProducts
  }
  catch { showToast('error') }
  finally { loading.value = false }
})

// pagination
const isPagination = computed(() => props.showPagination && total.value > limit.value)
const prevPage = async () => {
  if (orders.value.length === 0 && page.value > 1) { page.value-- }
  await fetchOrders(page.value, limit.value, search.value)
}
// Delete handler
const handleDelete = async () => {
  if (deleteMode.value === 'single' && selectedOrderId.value) {
    await deleteOrder(selectedOrderId.value)
    orders.value = orders.value.filter((p: Order) => p.id !== selectedOrderId.value)
  }
  else if (deleteMode.value === 'multiple' && selectedOrderIds.value.size > 0) {
    const idsToDelete = Array.from(selectedOrderIds.value)
    await deleteMultipleOrders(idsToDelete)
    orders.value = orders.value.filter((p: Order) => !selectedOrderIds.value.has(p.id!))
  }
  await prevPage()
  emit('update-analytics')
  selectedOrderIds.value.clear()
  isDeleteModal.value = false
}
// deleteBtn
function deleteBtn() {
  if (selectedOrderIds.value.size > 0) {
    deleteMode.value = 'multiple'
    isDeleteModal.value = true
  }
}

const table = ref()
const orderRef = ref()
watchEffect(() => {
  if (orderRef.value) { table.value = orderRef.value.table }
})
type TableRow = { row: { original: Order } }
const columns: TableColumn<Order>[] = [
  {
    id: 'select',
    header: () =>
      h(UCheckbox, {
        modelValue: selectedOrderIds.value.size === orders.value.length
          ? true
          : selectedOrderIds.value.size > 0 ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          selectedOrderIds.value = toggleAllSelection(value, orders.value)
        },
        ariaLabel: 'Select all',
      }),
    cell: ({ row }: TableRow) =>
      h(UCheckbox, {
        icon: 'i-lucide-check',
        modelValue: selectedOrderIds.value.has(row.original.id || ''),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          if (typeof value === 'boolean') { toggleSelection(row.original.id || '', value, selectedOrderIds.value) }
        },
        ariaLabel: 'Select row',
      }),
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }: TableRow) => {
      return h(
        'p',
        {
          class: 'cursor-pointer',
          onClick: () => {
            selectedOrderId.value = row.original.id
            isOrderDetail.value = true
          },
        },
        `#${String(row.original.id).slice(0, 7)}`
      )
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }: TableRow) => {
      return h('p', formatDate(row.original.date ?? ''))
    },
  },
  {
    accessorKey: 'line',
    header: 'Line',
    cell: ({ row }: TableRow) => h('p', row.original.lines ?? ''),
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
    cell: ({ row }: TableRow) => h('p', formatCurrency(row.original.discount || 0)),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }: TableRow) => h('p', formatCurrency(row.original.totalPrice || 0)),
  },
  {
    accessorKey: 'payment',
    header: () => h('div', { class: 'flex justify-center' }, 'Payment'),
    cell: ({ row }: TableRow) => {
      const paymentKey = row.original.payment as keyof typeof enumPayment
      const payment = enumPayment[paymentKey]
      return h('div', { class: 'flex justify-center items-center' }, [
        h(UButton, {
          color: payment?.color,
          size: 'xs',
          class: 'rounded',
          variant: 'subtle',
          icon: ui.icons.circle,
        }, () => row.original.payment)
      ])
    },
  },
  {
    accessorKey: 'status',
    header: () => h('div', { class: 'flex justify-center' }, 'Status'),
    cell: ({ row }: TableRow) => {
      const status = row.original.status
      return h('div', { class: 'flex justify-center items-center' }, [
        h(UButton, {
          color: (statusConfig[status as keyof typeof statusConfig]?.color as 'error' | 'info' | 'success' | 'warning' | 'primary' | 'secondary' | 'neutral' | undefined) ?? 'neutral',
          size: 'xs',
          class: 'rounded',
          variant: 'subtle',
          icon: ui.icons.circle,
        }, () => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase())
      ])
    },
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }: TableRow) => {
      return h('div', [
        h(UButton, {
          color: 'info',
          variant: 'link',
          class: 'cursor-pointer',
          icon: 'i-lucide-square-pen',
          onClick: () => {
            selectedOrderId.value = row.original.id
            isOrderDetail.value = true
          },
        }),
        h(UButton, {
          color: 'error',
          variant: 'link',
          class: 'cursor-pointer',
          icon: 'i-lucide-trash-2',
          onClick: () => {
            selectedOrderId.value = row.original.id
            isDeleteModal.value = true
          },
        }),
      ])
    },
  },
]
const onOrderRefresh = async () => {
  await fetchOrders(page.value, limit.value, search.value)
  isOrderDetail.value = false
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="showNav === true" class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-1 *:shadow-sm">
        <UButton
          v-if="selectedOrderIds.size > 0"
          color="error"
          variant="soft"
          label="Remove"
          icon="i-lucide-trash-2"
          @click="deleteBtn">
          <template #trailing>
            <UKbd>{{ selectedOrderIds.size }}</UKbd>
          </template>
        </UButton>
        <UDropdownMenu
          v-if="selectedOrderIds.size === 0"
          variant="soft"
          :content="{ align: 'end' }"
          :items=" table?.tableApi ?.getAllColumns() .filter((column: any) => column.getCanHide())
            .map((column: any) => ({
              label: getCapitalize(column.id),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
              },
              onSelect(e?: Event) { e?.preventDefault() },
            }))">
          <UButton
            label="Display"
            color="neutral"
            variant="soft"
            class="shadow-sm"
            trailing-icon="i-lucide-sliders-horizontal"
            :ui="{ trailingIcon: 'size-4 ml-1' }" />
        </UDropdownMenu>
      </div>
      <DashboardPartialsInputSearch v-model:search="search" placeholder="order" />
    </div>
    <DashboardPartialsTable
      ref="orderRef"
      :columns
      :loading
      title="orders"
      :data="orders"
      label="Add new product" />
    <DashboardPartialsPagination v-if="isPagination" v-model:page="page" :limit :total />
    <LazyDashboardOrdersDetail
      v-model:is-open="isOrderDetail"
      :order="order"
      :orders="orderProducts"
      :products="orderProducts"
      @refresh="onOrderRefresh"
      @update-analytics="$emit('update-analytics')" />
    <DashboardPartialsDeleteModal
      v-model:is-open="isDeleteModal"
      :loading
      :title="deleteMode === 'single' ? 'order' : 'orders'"
      @delete="handleDelete" />
  </div>
</template>
