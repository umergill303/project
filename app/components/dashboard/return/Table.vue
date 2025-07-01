<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import { UButton, UCheckbox } from '#components'
import { enumReturnOrder, type ReturnOrderStatusType, ReturnOrderStatus } from '#shared/types/enums'

const { ui } = useAppConfig()
const selectedOrderId = ref()
const isOrderDetail = ref(false)
const isDeleteModal = ref(false)
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

const {
  loading,
  orders: returnOrders,
  total,
  fetchOrders,
  deleteOrder,
  deleteMultipleOrders
} = useReturnOrders()

watch([page, search], async ([_newPage, newSearch], [_oldPage, oldSearch]) => {
  if (newSearch !== oldSearch) { page.value = 1 }
  await fetchOrders(page.value, limit.value, search.value)
}, { immediate: true })

// single Return Order details
const order = ref<ReturnOrder | null>(null)
const orderProducts = ref<ReturnOrderProduct[]>([])

watch([selectedOrderId, isOrderDetail], async ([id, isOpen]) => {
  if (!id || !isOpen) return
  loading.value = true
  try {
    const res = await $fetch<{
      returnOrderProducts: ReturnOrderProduct[]
      returnOrders: ReturnOrder
    }>(`/api/orders/return/${id}/dash`)

    order.value = res.returnOrders
    orderProducts.value = res.returnOrderProducts
  }
  catch (error) {
    console.error('Error fetching return order:', error)
    showToast('Failed to load order details', { color: 'error' })
  }
  finally { loading.value = false }
})

// pagination
const isPagination = computed(() => props.showPagination && total.value > limit.value)

const handleDelete = async () => {
  try {
    loading.value = true
    if (deleteMode.value === 'single' && selectedOrderId.value) {
      await deleteOrder(selectedOrderId.value)
      showToast('Return order deleted', { color: 'success' })
    }
    else if (deleteMode.value === 'multiple' && selectedOrderIds.value.size > 0) {
      const idsToDelete = Array.from(selectedOrderIds.value)
      await deleteMultipleOrders(idsToDelete)
      showToast(`${idsToDelete.length} orders deleted`, { color: 'success' })
    }

    await fetchOrders(page.value, limit.value, search.value)
    selectedOrderIds.value.clear()
    selectedOrderId.value = undefined
  }
  catch (error) {
    console.error('Delete failed:', error)
    showToast('Delete failed', { color: 'error' })
  }
  finally {
    loading.value = false
    isDeleteModal.value = false
  }
}

const deleteBtn = () => {
  if (selectedOrderIds.value.size > 0) {
    deleteMode.value = 'multiple'
    isDeleteModal.value = true
  }
  else {
    showToast('Please select at least one order to delete', { color: 'info' })
  }
}

const table = ref()
const orderRef = ref()
watchEffect(() => {
  if (orderRef.value) { table.value = orderRef.value.table }
})

type TableRow = { row: { original: ReturnOrder } }
const columns: TableColumn<ReturnOrder>[] = [
  {
    id: 'select',
    header: () =>
      h(UCheckbox, {
        modelValue: selectedOrderIds.value.size === returnOrders.value.length
          ? true
          : selectedOrderIds.value.size > 0 ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          selectedOrderIds.value = toggleAllSelection(value, returnOrders.value)
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
    accessorKey: 'createdAt',
    header: 'Return Date',
    cell: ({ row }: TableRow) => {
      return h(
        'p',
        new Date(String(row.original.createdAt) || '').toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    },
  },
  {
    accessorKey: 'order',
    header: 'Original Order',
    cell: ({ row }: TableRow) => {
      return h(
        'p',
        {
          class: 'cursor-pointer w-[90px] truncate',
          onClick: () => {
            selectedOrderId.value = row.original.id
            isOrderDetail.value = true
          },
        },
        `#${row.original.order}`
      )
    },
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }: TableRow) => h('p', row.original.method ? row.original.method.charAt(0).toUpperCase() + row.original.method.slice(1) : ''),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: TableRow) => {
      const statusInfo = enumReturnOrder[row.original.status as ReturnOrderStatusType]
      return h('div', { class: 'flex justify-center items-center' }, [
        h(UButton, {
          color: statusInfo?.color,
          size: 'xs',
          class: 'rounded',
          variant: 'subtle',
          icon: ui.icons.circle,
        }, () => statusInfo?.label || row.original.status)
      ])
    },
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }: TableRow) => h('p', row.original.reason ? row.original.reason.charAt(0).toUpperCase() + row.original.reason.slice(1) : ''),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }: TableRow) => {
      return h('div', { class: 'flex gap-1' }, [
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
            deleteMode.value = 'single'
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
      <DashboardPartialsInputSearch v-model:search="search" placeholder=" return orders" />
    </div>
    <DashboardPartialsTable
      ref="orderRef"
      :columns
      :loading
      title="Return Orders"
      :data="returnOrders"
      label="Add new return" />
    <DashboardPartialsPagination v-if="isPagination" v-model:page="page" :limit :total />
    <LazyDashboardReturnDetail
      v-model:is-open="isOrderDetail"
      :order="order"
      :products="orderProducts"
      @refresh="onOrderRefresh" />
    <DashboardPartialsDeleteModal
      v-model:is-open="isDeleteModal"
      :loading
      :title="deleteMode === 'single' ? 'return order' : `${selectedOrderIds.size} return orders`"
      @delete="handleDelete" />
  </div>
</template>
