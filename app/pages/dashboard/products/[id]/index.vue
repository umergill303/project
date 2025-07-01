<script lang="ts" setup>
const route = useRoute()
const { ui } = useAppConfig()
const id = (route.params as { id: string }).id

const { products, fetchProducts } = await useProducts()
fetchProducts()

const { product, tags, seoTags, thumbnails: productThumbnails } = await useProduct(id)

const productId = computed(() =>
  products.value.findIndex(p => p.id === product?.id))

const prevId = () => {
  if (productId.value > 0) {
    const prev = products.value[productId.value - 1]
    navigateTo(`/dashboard/products/${prev?.id}`)
  }
}
const nextId = () => {
  if (productId.value < products.value.length - 1) {
    const next = products.value[productId.value + 1]
    navigateTo(`/dashboard/products/${next?.id}`)
  }
}
</script>

<template>
  <UDashboardPanel v-if="product" id="product_detail" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar :ui="{ right: '*:cursor-pointer *:shadow-sm' }">
        <template #leading>
          <AppBreadcrumbs />
        </template>
        <template #right>
          <UButton color="neutral" variant="soft" icon="i-lucide-square-pen" :to="`/dashboard/products/${product.id}/patch`" />
          <UButton color="neutral" variant="soft" :icon="ui.icons.arrowLeft" @click="prevId" />
          <UButton color="neutral" variant="soft" :icon="ui.icons.arrowRight" @click="nextId" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardProductsDetail :product :tags :seo-tags :product-thumbnails />
    </template>
  </UDashboardPanel>
</template>
