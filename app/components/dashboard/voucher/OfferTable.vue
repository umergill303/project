<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { OfferType } from '#shared/types/offer'
import type { Product } from '~~/server/database/schema'
import { NuxtImg, UButton, UTooltip, UCheckbox } from '#components'
import { toggleSelection, toggleAllSelection } from '~~/shared/utils/toggleSelection'

const { ui } = useAppConfig()
const selectedProductIds = ref(new Set<string>())
const loadingProduct = ref<Record<string, boolean>>({})

const props = defineProps<{ offerId?: string, showDelBtn?: boolean, showActionBtn?: boolean }>()

const page = ref(1)
const limit = ref(8)
const search = ref('')

const currencySymbol = useState('currencySymbol')
const { loading, products, total, fetchProducts } = useProducts()

const offer = ref<OfferType | null>(null)
const totalOfferProducts = ref(0)
const fetchOffer = async () => {
  if (!props.offerId) return
  loading.value = true
  try {
    const res = await $fetch<{ offer: OfferType, totalOfferProducts: number }>(
      `/api/offers/${props.offerId}?page=${page.value}&limit=${limit.value}&search=${search.value}`)
    offer.value = res.offer
    totalOfferProducts.value = res.totalOfferProducts
  }
  catch { showToast('error') }
  finally { loading.value = false }
}
fetchOffer()

watch(() => props.offerId, async () => {
  await fetchOffer()
}, { immediate: true })

// expose refresh method to parent
const refresh = async () => {
  if (props.offerId) {
    await fetchOffer()
  }
  else {
    await fetchProducts(page.value, limit.value, search.value)
  }
}
defineExpose({ selectedProductIds, refresh })

// Watch for update page and search
watch([page, search], async ([_newPage, newSearch], [_oldPage, oldSearch]) => {
  if (newSearch !== oldSearch) { page.value = 1 }
  await refresh()
}, { immediate: true })

// filter products
const filteredProducts = computed(() => props.offerId ? offer.value?.products : products.value)
console.log('filteredProducts', filteredProducts.value)
// Pagination
const isPagination = computed(() => {
  if (props.offerId) {
    return totalOfferProducts.value > limit.value
  }
  return total.value > limit.value
})

// Remove single or multiple products from offer
const isDeleteModal = ref(false)
const removeProductFromOffer = async (offerId: string, productIds: string | string[]) => {
  try {
    if (!Array.isArray(productIds)) {
      loadingProduct.value[productIds] = true
    }
    else { loading.value = true }

    await $fetch(`/api/offers/${offerId}/products`, {
      method: 'DELETE', body: { productIds: Array.isArray(productIds) ? productIds : [productIds] },
    })
    isDeleteModal.value = false
    showToast('offerProductRemoved')
    await fetchOffer()
  }
  catch { showToast('error') }
  finally {
    if (!Array.isArray(productIds)) {
      loadingProduct.value[productIds] = false
    }
    else { loading.value = false }
  }
}

const removeSelectedProducts = async () => {
  if (selectedProductIds.value.size === 0) return
  await removeProductFromOffer(props.offerId ?? '', Array.from(selectedProductIds.value))
  selectedProductIds.value.clear()
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
        modelValue: selectedProductIds.value.size === (filteredProducts.value?.length || 0)
          ? true
          : selectedProductIds.value.size > 0 ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          selectedProductIds.value = toggleAllSelection(value, filteredProducts.value ?? [])
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
      return h(
        'div',
        {
          class: 'flex items-center gap-2 cursor-pointer',
          onClick: () => navigateTo(`/dashboard/products/${row.original.id}`),
        },
        [
          h(NuxtImg, {
            src: getThumbnail(row.original.thumbnail)[0],
            class: 'size-9 rounded object-cover shadow-md',
          }),
          h(UTooltip, {
            ui: { content: 'ring ring-(--ui-ring)/50 py-3.5 px-3 text-sm shadow-md font-medium text-highlighted' },
            content: { align: 'center', side: 'top', sideOffset: 8 },
            text: row.original.name || 'N/A',
          },
          () => h('p', { class: 'w-[150px] truncate' }, row.original.name || 'N/A')),
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
    header: 'Brand',
    cell: ({ row }: TableRow) => {
      const colorIndex = brandCounter++ % colorTypes.length
      const color = colorTypes[colorIndex]
      return h('div', { class: 'flex justify-center' },
        h(UButton, { color, size: 'xs', class: 'rounded', variant: 'subtle', icon: ui.icons.circle },
          () => row.original.brand))
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }: TableRow) => {
      const colorIndex = brandCounter++ % colorTypes.length
      const color = colorTypes[colorIndex]
      return h('div', { class: 'flex justify-center' },
        h(UButton, { color, size: 'xs', class: 'rounded', variant: 'subtle', icon: ui.icons.circle },
          () => row.original.category))
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }: TableRow) => {
      return h('p', { class: 'pl-1' }, row.original.salePrice !== undefined ? `${currencySymbol.value} ${row.original.salePrice}` : '0.00')
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
    cell: ({ row }: TableRow) => h('p', row.original.sold || 'N/A'),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }: TableRow) => h('p', { class: 'pl-1' }, row.original.stock || '0'),
  },
  {
    accessorKey: 'action',
    header: () => props.showActionBtn ? 'Action' : null,
    cell: ({ row }: TableRow) => {
      if (!props.showActionBtn) return null

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        loading: loadingProduct.value[row.original.id ?? ''],
        loadingIcon: ui.icons.loading,
        icon: loadingProduct.value[row.original.id ?? ''] ? '' : ui.icons.remove,
        onClick: () => removeProductFromOffer(props.offerId ?? '', String(row.original.id))
      })
    },
  }

]
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-2 pb-3">
      <UButton
        v-if="showDelBtn && selectedProductIds.size > 0"
        color="error"
        variant="soft"
        label="Remove"
        :icon="ui.icons.remove"
        @click="isDeleteModal = true">
        <template #trailing>
          <UKbd>{{ selectedProductIds.size }}</UKbd>
        </template>
      </UButton>
      <div class="flex w-full justify-end">
        <DashboardPartialsInputSearch v-model:search="search" placeholder="products" />
      </div>
    </div>
    <DashboardPartialsTable ref="productRef" :columns :loading title="product" :data="filteredProducts" />
    <DashboardPartialsPagination
      v-if="isPagination"
      v-model:page="page"
      :limit
      :total="props.offerId ? totalOfferProducts : total" />
    <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" :loading title="products" @delete="removeSelectedProducts" />
  </div>
</template>
