<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import type { TableColumn, TabsItem, DropdownMenuItem } from '@nuxt/ui'
import { resolveComponent, h } from 'vue'
import { formatCurrency } from '~/utils/formatCurrency'
import type { Product } from '~~/server/database/schema'
import { getCapitalize } from '~~/shared/utils/capitalize'
import { UChip, NuxtImg, UButton, UTooltip, UCheckbox } from '#components'
import { toggleSelection, toggleAllSelection } from '~~/shared/utils/toggleSelection'

const emit = defineEmits(['update-analytics'])
const { features } = useRuntimeConfig().public.ecommerce

const page = ref(1)
const limit = ref(9)
const search = ref('')
const { ui } = useAppConfig()

const selectedProductId = ref()
const isDeleteModal = ref(false)
const selectedProductIds = ref(new Set<string>())
const deleteMode = ref<'single' | 'multiple'>('single')

const activeTab = ref('all')
const publishedTabs = ref<TabsItem[]>([
  { label: 'All', value: 'all' }, { label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }
])

const { loading, products, total, fetchProducts, deleteProduct, deleteMultipleProducts } = useProducts()

const loadProducts = useDebounceFn(async () => {
  await fetchProducts(page.value, limit.value, search.value, activeTab.value as 'all' | 'published' | 'draft')
}, 300)

watch([page, search, activeTab], async ([_newPage, newSearch, newTab], [_oldPage, oldSearch, oldTab]) => {
  if (newSearch !== oldSearch || newTab !== oldTab) { page.value = 1 }
  await loadProducts()
}, { immediate: true })

const isPagination = computed(() => total.value > limit.value)
const prevPage = async () => {
  if (products.value.length === 0 && page.value > 1) { page.value-- }
}

// Delete handler
const handleDelete = async () => {
  if (deleteMode.value === 'single' && selectedProductId.value) {
    await deleteProduct(selectedProductId.value)
    products.value = products.value.filter((p: Product) => p.id !== selectedProductId.value)
  }
  else if (deleteMode.value === 'multiple' && selectedProductIds.value.size > 0) {
    const idsToDelete = Array.from(selectedProductIds.value)
    await deleteMultipleProducts(idsToDelete)
    products.value = products.value.filter((p: Product) => !selectedProductIds.value.has(p.id!))
  }
  await prevPage()
  emit('update-analytics')
  selectedProductIds.value.clear()
  isDeleteModal.value = false
}

const deleteBtn = () => {
  if (selectedProductIds.value.size > 0) {
    deleteMode.value = 'multiple'
    isDeleteModal.value = true
  }
}

// Publish handler
const publishLoading = ref(false)
const publish = async () => {
  publishLoading.value = true
  try {
    const idsToPublish = Array.from(selectedProductIds.value)
    await $fetch('/api/products/publish', { method: 'PATCH', body: { ids: idsToPublish } })
    loadProducts()
    emit('update-analytics')
    showToast('productPublished')
    selectedProductIds.value.clear()
  }
  catch { showToast('error') }
  finally { publishLoading.value = false }
}

const table = ref()
const productRef = ref()
watchEffect(() => {
  if (productRef.value) { table.value = productRef.value.table }
})

type TableRow = { row: { original: Product } }
let brandCounter = 0
const colorTypes = ['primary', 'neutral', 'warning', 'info', 'error'] as const
const columns: TableColumn<Product>[] = [
  {
    id: 'select',
    header: () =>
      h(UCheckbox, {
        modelValue: selectedProductIds.value.size === products.value.length
          ? true
          : selectedProductIds.value.size > 0 ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          selectedProductIds.value = toggleAllSelection(value, products.value)
        },
        ariaLabel: 'Select all',
      }),
    cell: ({ row }: TableRow) =>
      h(UCheckbox, {
        icon: 'i-lucide-check',
        modelValue: selectedProductIds.value.has(row.original.id || ''),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          if (typeof value === 'boolean') { toggleSelection(row.original.id || '', value, selectedProductIds.value) }
        },
        ariaLabel: 'Select row',
      }),
  },
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }: TableRow) => {
      const isFeatured = features.featured && row.original.featured === true
      const image = h(NuxtImg, {
        src: row.original.thumbnail || '/noimage1.jpg',
        provider: 'cloudflare',
        loading: 'lazy',
        class: 'w-9 aspect-square rounded object-cover shadow bg-(--ui-border-accented)',
      })
      return h('div',
        {
          class: 'flex items-center gap-2 cursor-pointer',
          onClick: () => navigateTo(`/dashboard/products/${row.original.id}`),
        },
        [
          isFeatured ? h(UChip, [image]) : image,
          h(UTooltip, {
            ui: { content: 'bg-primary/50 py-3.5 px-3 text-sm shadow-md font-medium text-highlighted' },
            content: { align: 'center', side: 'top', sideOffset: 8 },
            text: row.original.name || 'N/A',
          },
          () => h('p', { class: 'w-[150px] truncate' }, row.original.name || 'N/A')
          ),
        ]
      )
    },
  },
  {
    accessorKey: 'sku',
    header: 'Sku',
    cell: ({ row }: TableRow) => {
      return h('p', { class: 'w-[110px] truncate' }, row.original.sku || 'N/A')
    },
  },
  {
    accessorKey: 'brand',
    header: () => h('p', { class: 'text-center' }, 'Brand'),
    cell: ({ row }: TableRow) => {
      const colorIndex = brandCounter++ % colorTypes.length
      const color = colorTypes[colorIndex]
      return h('div', { class: 'flex justify-center' },
        h(UButton, { color, size: 'xs', class: 'rounded', variant: 'subtle', icon: ui.icons.circle },
          () => row.original.brand || 'No Brand'))
    },
  },
  {
    accessorKey: 'category',
    header: () => h('p', { class: 'text-center' }, 'Category'),
    cell: ({ row }: TableRow) => {
      const colorIndex = brandCounter++ % colorTypes.length
      const color = colorTypes[colorIndex]
      return h('div', { class: 'flex justify-center' },
        h(UButton, { color, size: 'xs', class: 'rounded', variant: 'subtle', icon: ui.icons.circle },
          () => row.original.category || 'No Category'))
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }: TableRow) => {
      return h('p', { class: 'pl-1' }, formatCurrency(row.original.salePrice || 0))
    },
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
    cell: ({ row }: TableRow) => h('p', { class: 'pl-3' }, row.original.discount !== undefined ? `${row.original.discount}%` : '0.00'),
  },
  {
    accessorKey: 'sold',
    header: 'Sold',
    cell: ({ row }: TableRow) => h('p', row.original.sold || '0'),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }: TableRow) => h('p', { class: 'pl-1' }, row.original.stock || '0'),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }: TableRow) => {
      const dropdownItems: DropdownMenuItem[] = [
        {
          label: 'Edit',
          icon: 'i-lucide-square-pen',
          onClick: () => navigateTo(`/dashboard/products/${row.original.id}/patch`)
        },
        ...(row.original.hVariants
          ? [{
              label: 'Variant',
              icon: 'i-mdi-tune-variant',
              onClick: () => navigateTo(`/dashboard/products/${row.original.id}/variants`)
            }]
          : []
        ),
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          onClick: () => {
            deleteMode.value = 'single'
            selectedProductId.value = row.original.id
            isDeleteModal.value = true
          }
        }
      ]

      const DropdownMenu = resolveComponent('UDropdownMenu')
      return h(DropdownMenu,
        {
          items: dropdownItems,
          content: { align: 'start', side: 'left' },
          ui: { content: 'w-40', item: 'cursor-pointer' }
        },
        {
          default: () => h(UButton, {
            icon: 'i-lucide-more-vertical',
            color: 'neutral',
            variant: 'ghost',
            class: 'ml-auto cursor-pointer'
          })
        }
      )
    }
  }
]
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-grow flex-wrap items-center gap-2">
        <UButton
          v-if="selectedProductIds.size > 0"
          color="error"
          variant="soft"
          label="Remove"
          block
          class="shadow-sm flex-1 sm:flex-0"
          icon="i-lucide-trash-2"
          @click="deleteBtn">
          <template #trailing>
            <UKbd>{{ selectedProductIds.size }}</UKbd>
          </template>
        </UButton>
        <UButton
          v-if="selectedProductIds.size > 0 && activeTab === 'draft'"
          variant="soft"
          :loading="publishLoading"
          label="Publish"
          block
          class="shadow-sm flex-1 sm:flex-0"
          icon="i-material-symbols-publish"
          @click="publish">
          <template #trailing>
            <UKbd>{{ selectedProductIds.size }}</UKbd>
          </template>
        </UButton>
        <UDropdownMenu
          v-if="selectedProductIds.size === 0"
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
        <UTabs v-model="activeTab" :items="publishedTabs" size="sm" class="w-full flex-1 sm:w-auto sm:flex-0" :ui="{ list: 'sm:w-70 ', root: '-mb-2', label: 'text-highlighted' }" />
      </div>
      <div v-if="selectedProductIds.size === 0" class="flex items-center gap-1">
        <DashboardPartialsInputSearch v-model:search="search" placeholder="products" />
        <UButton :icon="ui.icons.add" class="shadow-sm" to="/dashboard/products/post" />
      </div>
    </div>
    <DashboardPartialsTable
      ref="productRef"
      :columns
      :loading
      title="product"
      :data="products"
      label="Add new product"
      to="/dashboard/products/post" />
    <DashboardPartialsPagination v-if="isPagination" v-model:page="page" :limit :total />
    <DashboardPartialsDeleteModal
      v-model:is-open="isDeleteModal"
      :loading
      :title="deleteMode === 'single' ? 'product' : 'products'"
      @delete="handleDelete" />
  </div>
</template>
