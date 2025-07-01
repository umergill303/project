<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~~/server/database/schema'
import { getCapitalize } from '~~/shared/utils/capitalize'
import { NuxtImg, UButton, UTooltip, UCheckbox } from '#components'
import { toggleSelection, toggleAllSelection } from '~~/shared/utils/toggleSelection'

const selectedCustomerId = ref()
const isDeleteModal = ref(false)
const selectedCustomerIds = ref(new Set<string>())
const deleteMode = ref<'single' | 'multiple'>('single')

type CustomerWithStats = User & {
  ordersCount?: number
  totalPurchase?: number
}

const page = ref(1)
const limit = ref(9)
const search = ref('')

const { loading, customers, total, fetchCustomers, deleteCustomer, deleteMultipleCustomers } = useCustomers()

watch([page, search], async ([_newPage, newSearch], [_oldPage, oldSearch]) => {
  if (newSearch !== oldSearch) { page.value = 1 }
  await fetchCustomers(page.value, limit.value, search.value)
}, { immediate: true })

// pagination
const isPagination = computed(() => total.value > limit.value)
const prevPage = async () => {
  if (customers.value.length === 0 && page.value > 1) { page.value-- }
  await fetchCustomers(page.value, limit.value, search.value)
}

// Delete handler
const handleDelete = async () => {
  if (deleteMode.value === 'single' && selectedCustomerId.value) {
    await deleteCustomer(selectedCustomerId.value)
    customers.value = customers.value.filter((p: User) => p.id !== selectedCustomerId.value)
  }
  else if (deleteMode.value === 'multiple' && selectedCustomerIds.value.size > 0) {
    const idsToDelete = Array.from(selectedCustomerIds.value)
    await deleteMultipleCustomers(idsToDelete)
    customers.value = customers.value.filter((p: User) => !selectedCustomerIds.value.has(p.id!))
  }
  await prevPage()
  selectedCustomerIds.value.clear()
  isDeleteModal.value = false
}
const deleteBtn = () => {
  if (selectedCustomerIds.value.size > 0) {
    deleteMode.value = 'multiple'
    isDeleteModal.value = true
  }
}

// Columns
const table = ref()
const customerRef = ref()
watchEffect(() => {
  if (customerRef.value) { table.value = customerRef.value.table }
})
type TableRow = { row: { original: CustomerWithStats } }
const columns: TableColumn<CustomerWithStats>[] = [
  {
    id: 'select',
    header: () =>
      h(UCheckbox, {
        modelValue: selectedCustomerIds.value.size === customers.value.length
          ? true
          : selectedCustomerIds.value.size > 0 ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          selectedCustomerIds.value = toggleAllSelection(value, customers.value)
        },
        ariaLabel: 'Select all',
      }),
    cell: ({ row }: TableRow) =>
      h(UCheckbox, {
        icon: 'i-lucide-check',
        modelValue: selectedCustomerIds.value.has(row.original.id || ''),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          if (typeof value === 'boolean') { toggleSelection(row.original.id || '', value, selectedCustomerIds.value) }
        },
        ariaLabel: 'Select row',
      }),
  },
  {
    accessorKey: 'profile',
    header: 'Profile',
    cell: ({ row }: TableRow) => {
      return h('div', { class: 'flex items-center gap-2 cursor-pointer', onClick: () => navigateTo(`/dashboard/customers/${row.original.id}`) },
        [
          h(NuxtImg, {
            src: row.original.avatar || '/profile/blank.jpeg',
            provider: row.original.avatar?.startsWith('http') ? undefined : 'cloudflare',
            class: 'size-9 rounded object-cover shadow-md' }),
          h('div', { class: '' }, [
            h('p', { }, row.original.name || 'N/A'),
            h('p', { class: 'text-muted' }, row.original.email || 'N/A'),
          ])
        ]
      )
    },
  },
  {
    accessorKey: 'birthday',
    header: 'Birthday',
    cell: ({ row }: TableRow) => h('p', `${row.original.birthday ?? ''}`),
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }: TableRow) =>
      h(UTooltip, {
        ui: { content: 'bg-primary py-3.5 px-3 text-sm shadow-md font-medium' },
        content: { align: 'center', side: 'top', sideOffset: 8 },
        text: `${row.original.country} - ${row.original.city} - ${row.original.street}`,
      },
      () => [
        h('p', { class: 'w-44 truncate cursor-default' },
          `${row.original.country},${row.original.city}, ${row.original.street}`
        )]
      ),
  },
  {
    accessorKey: 'orders',
    header: 'Orders ',
    cell: ({ row }: TableRow) =>
      h('div', { class: 'flex justify-center cursor-pointer' }, [
        h('p', row.original.ordersCount ?? 0),
      ])
  },
  {
    accessorKey: 'status',
    header: () => h('p', { class: 'text-center' }, 'status'),
    cell: ({ row }: TableRow) => {
      const userStatus = row.original.status ?? ''
      const color
    = userStatus === 'active'
      ? 'primary'
      : userStatus === 'banned'
        ? 'error'
        : userStatus === 'suspended'
          ? 'warning'
          : 'info'

      return h(UButton, {
        color,
        size: 'xs',
        class: 'px-5',
        variant: 'subtle',
        label: userStatus.charAt(0).toUpperCase() + userStatus.slice(1),
      })
    }
  },
  {
    accessorKey: 'amount',
    header: 'Amount Spent ',
    cell: ({ row }: TableRow) =>
      h('div', { class: 'flex justify-center' }, [
        h('p', formatCurrency(row.original.totalPurchase || 0)),
      ])
  },
  {
    accessorKey: 'action',
    header: 'Action ',
    cell: ({ row }: TableRow) =>
      h('div', { class: 'flex justify-center' }, [
        h(resolveComponent('UDropdownMenu'),
          {
            content: { align: 'end' },
            ui: { content: 'w-54' },
            items: [
              [
                { type: 'label', label: 'Actions' },
                { label: 'Copy customer ID', icon: 'i-lucide-copy',
                  onSelect() {
                    navigator.clipboard.writeText((row.original.id ?? '').toString())
                    showToast('customerIdCopy')
                  }
                },
              ],
              [
                {
                  label: 'View customer details',
                  icon: 'tabler:list-details',
                  onSelect() { navigateTo(`/dashboard/customers/${row.original.id}`) }
                },
                // { label: 'View customer payments', icon: 'i-lucide-credit-card',
                //   onSelect() { navigateTo(`/dashboard/customers/payments/${row.original.id}`) }
                // },
              ],
              [
                { label: 'Delete customer', icon: 'i-lucide-trash-2', color: 'error',
                  onSelect: () => {
                    deleteMode.value = 'single'
                    selectedCustomerId.value = row.original.id
                    isDeleteModal.value = true
                  }
                }
              ]
            ]
          },
          () => h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            class: 'ml-auto',
            icon: 'i-lucide-ellipsis-vertical'
          })
        ),
      ])
  },
]
</script>

<template>
  <div>
    <div class="flex justify-between gap-2 pb-3">
      <div class=" flex gap-1 items-center">
        <UDropdownMenu
          v-if="selectedCustomerIds.size === 0"
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
          <UButton label="Display" color="neutral" variant="soft" trailing-icon="i-lucide-sliders-horizontal" :ui="{ trailingIcon: 'size-4 ml-1' }" />
        </UDropdownMenu>
        <UButton
          v-if="selectedCustomerIds.size > 0"
          color="error"
          variant="soft"
          label="Delete"
          icon="i-lucide-trash-2"
          @click="deleteBtn">
          <template #trailing>
            <UKbd variant="subtle">
              {{ selectedCustomerIds.size }}
            </UKbd>
          </template>
        </UButton>
      </div>

      <DashboardPartialsInputSearch v-model:search="search" placeholder="Customers" />
    </div>
    <DashboardPartialsTable ref="customerRef" :data="customers" :columns :loading title="customer" />
    <DashboardPartialsPagination v-if="isPagination" v-model:page="page" :limit :total />
    <DashboardPartialsDeleteModal
      v-model:is-open="isDeleteModal"
      :loading
      :title="deleteMode === 'single' ? 'Customer' : 'Customers'"
      @delete="handleDelete" />
  </div>
</template>
