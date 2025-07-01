<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useRouter, useRoute } from 'vue-router'
import { formatCurrency } from '~/utils/formatCurrency'

const getProductStock = (product: any): number => product.variant?.stock ?? product.stock ?? 0
const getProductSalePrice = (product: any): number => product.variant?.salePrice ?? product.salePrice ?? 0
const getProductDiscount = (product: any): number => product.variant?.discount ?? product.discount ?? 0
const getDiscountedPrice = (price: number, discount: number): number => price - (price * discount) / 100
const getOriginalTotalPrice = (price: number, quantity: number): string => (price * quantity).toFixed(2)
const getThumbnail = (thumbnail: string | string[] | undefined): string[] => {
  if (!thumbnail) return []
  return Array.isArray(thumbnail) ? thumbnail : JSON.parse(thumbnail)
}
const getThumbnails = (thumbnail: string | string[] | undefined): string[] => {
  if (!thumbnail) return []
  if (Array.isArray(thumbnail)) return thumbnail
  try {
    if (typeof thumbnail === 'string' && thumbnail.startsWith('[')) return JSON.parse(thumbnail)
    return [thumbnail]
  }
  catch {
    return []
  }
}

const getVariantQueryParams = (variant: Product['variant']): Record<string, string> => {
  if (!variant?.options) return {}
  return variant.options.reduce((query, option) => {
    if (option.attribute?.id) {
      query[`attr_${option.attribute.id}`] = option.id.toString()
    }
    return query
  }, {} as Record<string, string>)
}

const UCheckbox = resolveComponent('UCheckbox')
const appConfig = useAppConfig()

interface Product {
  productId: string
  name: string
  stock: number
  qty: number
  minShippingProducts?: number
  maxShippingProducts?: number
  thumbnail?: string | string[]
  salePrice?: number
  discount?: number
  baseSalePrice?: number
  baseDiscount?: number
  done?: boolean
  variant?: {
    id: number
    salePrice?: number
    discount?: number
    stock?: number
    sku?: string
    options?: {
      id: number
      name: string
      color?: string
      image?: string
      attribute?: {
        id: number
        name: string
      }
    }[]
  }
}

const cartCount = useState('cartCount')
const props = defineProps<{ products: Product[] }>()
const emit = defineEmits(['refresh', 'update:selectedProducts'])
const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const deleting = ref<string | null>(null)
const selectedProductIds = ref(new Set<string>(
  props.products.filter(product => product.done && getProductStock(product) > 0).map(product => product.productId)
))
const previouslySelectedProductIds = ref(new Set<string>(selectedProductIds.value))

watch(selectedProductIds, async newSelection => {
  const addedProducts = [...newSelection].filter(id => !previouslySelectedProductIds.value.has(id))
  const removedProducts = [...previouslySelectedProductIds.value].filter(id => !newSelection.has(id))
  const selectedProducts = props.products.filter(product => newSelection.has(product.productId))
  emit('update:selectedProducts', selectedProducts)
  if (addedProducts.length > 0 || removedProducts.length > 0) {
    try {
      await $fetch('/api/cart/done', {
        method: 'POST',
        body: { productIds: addedProducts.length > 0 ? addedProducts : removedProducts, done: addedProducts.length > 0 }
      })
    }
    catch (error) {
      console.error('Error updating done status:', error)
    }
  }
  previouslySelectedProductIds.value = new Set(newSelection)
}, { deep: true })

const toggleAllSelection = (checked: boolean) => {
  selectedProductIds.value = checked
    ? new Set(props.products.filter(product => getProductStock(product) > 0).map(product => product.productId))
    : new Set()
}

const productQuantities = ref<Record<string, number>>(
  Object.fromEntries(props.products.map(product => [product.productId, product.qty]))
)

watch(() => props.products, newProducts => {
  productQuantities.value = Object.fromEntries(newProducts.map(product => [product.productId, product.qty]))
}, { deep: true })

const data = computed(() => props.products.map(product => {
  const salePrice = getProductSalePrice(product)
  const discount = getProductDiscount(product)
  const stock = getProductStock(product)
  const qty = productQuantities.value[product.productId] || product.qty
  return {
    id: product.productId,
    name: product.name,
    stock,
    qty,
    minShippingProducts: product.minShippingProducts || 1,
    maxShippingProducts: product.maxShippingProducts || stock,
    thumbnail: getThumbnail(product.thumbnail),
    totalPrice: formatCurrency(Number(getOriginalTotalPrice(salePrice, qty))),
    price: formatCurrency(Number(getDiscountedPrice(salePrice, discount).toFixed(2))),
    isOutOfStock: stock <= 0,
    variant: product.variant,
    salePrice,
    discount
  }
}))

const updatedProducts = computed(() => Object.entries(productQuantities.value)
  .filter(([id, qty]) => qty !== props.products.find(p => p.productId === id)?.qty)
  .map(([id]) => id))

async function updateAllQuantities() {
  isLoading.value = true
  try {
    const updatedItems = Object.entries(productQuantities.value)
      .filter(([id, qty]) => qty !== props.products.find(p => p.productId === id)?.qty)
      .map(([id, qty]) => {
        const product = props.products.find(p => p.productId === id)
        return { productId: id, qty, variantId: product?.variant?.id || null }
      })
    if (updatedItems.length === 0) {
      isLoading.value = false
      return
    }
    await $fetch('/api/cart/qty', { method: 'POST', body: { products: updatedItems } })
    updatedItems.forEach(({ productId, qty }) => {
      const product = props.products.find(p => p.productId === productId)
      if (product) product.qty = qty
    })
    emit('refresh')
    showToast('cartQuantity')
  }
  catch (error) {
    showToast('cartError')
    console.error('Error updating quantities:', error)
  }
  finally {
    isLoading.value = false
  }
}

const { refreshCart } = useCount()
async function delCartProduct(id: string) {
  deleting.value = id
  try {
    await $fetch(`/api/cart/${id}`, { method: 'DELETE' })
    emit('refresh')
    selectedProductIds.value.delete(id)
    delete productQuantities.value[id]
    emit('update:selectedProducts', props.products.filter(product => selectedProductIds.value.has(product.productId)))
    const query = { ...route.query }
    Object.keys(query).forEach(key => {
      if (key.startsWith('attr_')) delete query[key]
    })
    router.replace({ query })
    showToast('cartDelete')
    refreshCart()
  }
  catch (error) {
    showToast('cartDelError')
    console.error('Error removing product:', error)
  }
  finally {
    deleting.value = null
  }
}

const increment = (id: string) => {
  const product = props.products.find(p => p.productId === id)
  if (!product) return
  const currentQty = productQuantities.value[id]
  const maxQty = Math.min(product.maxShippingProducts || Infinity, getProductStock(product) || Infinity)
  if ((currentQty ?? 0) + 1 <= maxQty) productQuantities.value[id] = (currentQty ?? 0) + 1
  else if ((currentQty ?? 0) < maxQty) productQuantities.value[id] = maxQty
  productQuantities.value = { ...productQuantities.value }
}

const decrement = (id: string) => {
  const product = props.products.find(p => p.productId === id)
  if (!product) return
  const currentQty = productQuantities.value[id]
  const minQty = product.minShippingProducts || 1
  if ((currentQty ?? 0) - 1 >= minQty) productQuantities.value[id] = (currentQty ?? 0) - 1
  else if ((currentQty ?? 0) > minQty) productQuantities.value[id] = minQty
  productQuantities.value = { ...productQuantities.value }
}

const columns: TableColumn<{ original: Product }>[] = [
  {
    id: 'select',
    header: () => h(UCheckbox, {
      color: 'neutral',
      modelValue: selectedProductIds.value.size === props.products.length ? true : selectedProductIds.value.size > 0 ? 'indeterminate' : false,
      'onUpdate:modelValue': toggleAllSelection,
      ariaLabel: 'Select all'
    }),
    cell: ({ row }) => {
      const isOutOfStock = getProductStock(row.original) <= 0
      return h(UCheckbox, {
        color: 'neutral',
        icon: 'i-lucide-check',
        modelValue: selectedProductIds.value.has(row.original.id),
        'onUpdate:modelValue': (value: boolean) => {
          if (value) selectedProductIds.value.add(row.original.id)
          else selectedProductIds.value.delete(row.original.id)
        },
        class: isOutOfStock ? 'opacity-50' : '',
        ariaLabel: isOutOfStock ? 'Out of stock' : 'Select row'
      })
    }
  },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'minShippingProducts', header: 'Quantity' },
  { accessorKey: 'totalPrice', header: 'Total Price' },
  { id: 'action', header: 'Actions' }
]
</script>

<template>
  <div class="w-full">
    <UTable
      :data="data"
      :columns="columns"
      class="border border-muted rounded-md w-full table-auto sm:table"
      :ui="{
        th: 'py-4 font-medium border-b border-muted text-xs sm:text-sm md:text-base hidden sm:table-cell',
        thead: 'relative [&>tr]:after:absolute [&>tr]:after:inset-x-0 [&>tr]:after:bottom-0 [&>tr]:after:h-px [&>tr]:after:bg-transparent hidden sm:table-header-group',
        tr: (row) => (row.stock <= 0 ? 'opacity-60' : 'flex flex-col sm:table-row border-b border-muted sm:border-b-0 py-4 sm:py-0 gap-3 sm:gap-0'),
        td: 'py-3 px-3 text-xs sm:text-sm md:text-base flex justify-between sm:table-cell items-center',
      }">
      <template #name-cell="{ row }">
        <div class="flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full">
          <NuxtLink
            :to="{
              path: `/products/${row.original.name?.toLowerCase().replace(/\s+/g, '')}-${row.original.id}`,
              query: getVariantQueryParams(row.original.variant),
            }"
            class="flex-shrink-0">
            <NuxtImg
              :provider="getThumbnail(row.original.thumbnail)[0] ? 'cloudflare' : undefined"
              :src="getThumbnail(row.original.thumbnail)[0] || '/Noimage.jpg'"
              alt="Product Image"
              class="novel-img w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded object-cover bg-gray-200"
              :class="{ 'opacity-50': row.original.stock <= 0 }" />
          </NuxtLink>
          <div class="flex-1 min-w-0 overflow-hidden">
            <NuxtLink
              :to="{
                path: `/products/${row.original.name?.toLowerCase().replace(/\s+/g, '')}-${row.original.id}`,
                query: getVariantQueryParams(row.original.variant),
              }">
              <p class="font-medium text-highlighted truncate  flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full">{{ row.original.name }}</p>
            </NuxtLink>
            <div v-if="row.original.variant?.options" class=" flex-wrap mt-1 overflow-hidden max-w-full  flex items-center gap-2 sm:gap-3  sm:flex-row w-full">
              <div v-for="option in row.original.variant.options" :key="option.id" class="flex items-center gap-1">
                <span class="text-xs text-gray-500 capitalize">{{ option.attribute?.name || 'Option' }}:</span>
                <template v-if="option.color || (option.name && option.name.startsWith('#'))">
                  <div class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: option.color || option.name }" />
                </template>
                <template v-if="option.image && getThumbnails(option.image).length > 0">
                  <NuxtImg :src="getThumbnails(option.image)[0]" :alt="option.name" class="novel-img w-6 h-6 rounded object-cover" provider="cloudflare" />
                </template>
                <template v-if="option.name">
                  <span class="text-xs">
                    <UButton color="neutral" variant="soft" size="xs" class="border border-gray-300">{{ option.name }}</UButton>
                  </span>
                </template>
              </div>
            </div>
            <p v-if="row.original.minShippingProducts > 1 || (row.original.maxShippingProducts ?? 0) < (row.original.stock ?? 0)" class="text-xs text-gray-500 mt-1  flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full">
              Min: {{ row.original.minShippingProducts }} | Max: {{ Math.min(row.original.maxShippingProducts ?? Infinity, row.original.stock ?? 0) }}
            </p>
          </div>
        </div>
      </template>
      <template #price-cell="{ row }">
        <span class="text-xs sm:text-sm md:text-base whitespace-nowrap hidden sm:table-cell">{{ formatCurrency(Number(getDiscountedPrice(row.original.salePrice, row.original.discount).toFixed(2))) }}</span>
        <span class="text-xs sm:hidden flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full">Price: {{ formatCurrency(Number(getDiscountedPrice(row.original.salePrice, row.original.discount).toFixed(2))) }}</span>
      </template>
      <template #minShippingProducts-cell="{ row }">
        <div v-if="row.original.stock > 0" class="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 sm:flex-row w-full scale-90">
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer rounded-l rounded-r-none border h-9 w-9 sm:h-10 sm:w-10"
            :icon="appConfig.ui.icons.minus"
            :disabled="productQuantities[row.original.id] <= (row.original.minShippingProducts ?? 1)"
            aria-label="Decrease quantity"
            @click="decrement(row.original.id)" />
          <UButton
            color="neutral"
            variant="outline"
            class="w-12 h-9 sm:h-10 sm:w-14 flex justify-center text-xs sm:text-sm md:text-base border-y border-x rounded-none"
            :disabled="true"
            aria-label="Current quantity">
            {{ productQuantities[row.original.id] }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="cursor-pointer rounded-l-none rounded-r border h-9 w-9 sm:h-10 sm:w-10"
            :icon="appConfig.ui.icons.plus"
            :disabled="productQuantities[row.original.id] >= Math.min(row.original.maxShippingProducts ?? Infinity, row.original.stock ?? Infinity)"
            aria-label="Increase quantity"
            @click="increment(row.original.id)" />
        </div>
        <div v-else class="text-red-500 text-xs whitespace-nowrap flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full">
          Out of Stock
        </div>
      </template>
      <template #totalPrice-cell="{ row }">
        <span class="text-xs sm:text-sm md:text-base whitespace-nowrap hidden sm:table-cell">{{ row.original.totalPrice }}</span>
        <span class="text-xs sm:hidden flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full">Total: {{ row.original.totalPrice }}</span>
      </template>
      <template #action-cell="{ row }">
        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          class="ml-2 h-8 sm:h-9 sm:w-9 flex items-center gap-2 sm:gap-3 flex-col sm:flex-row w-full"
          :loading="deleting === row.original.id"
          aria-label="Remove product from cart"
          @click="delCartProduct(row.original.id)" />
      </template>
    </UTable>
    <UFooter
      :ui="{ root: 'mt-4', right: 'flex flex-col sm:flex-row gap-2' }">
      <template #right>
        <UButtonGroup class="flex flex-col sm:flex-row gap-2">
          <UButton
            v-if="updatedProducts.length > 0"
            color="neutral"
            :loading="isLoading"
            label="Update"
            icon="i-material-symbols-update"
            class="sm:w-auto"
            @click="updateAllQuantities" />
          <UButton
            color="neutral"
            variant="outline"
            label="Continue Shopping"
            to="/"
            class="sm:w-auto" />
        </UButtonGroup>
      </template>
    </UFooter>
  </div>
</template>
