<script setup lang="ts">
const { features } = useRuntimeConfig().public.ecommerce
const page = ref(1)
const itemsPerPage = 10
// const isLoading = ref(false)
const loadingStates = ref<Record<string, boolean>>({})
const appConfig = useAppConfig()
const toast = useToast()

// Fetch paginated orders from API
const { data, status, refresh } = useFetch('/api/orders/order', {
  query: { page, limit: itemsPerPage },
  watch: [page],
})
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.ordersPageTitle || ordersPage.title, // Fallback title
  description: pageSeoData.value.ordersPageDescription || ordersPage.description, // Fallback description
})

const totalItems = computed(() => data.value?.pagination?.total || 0)
const orders = computed(() => data.value?.orders || [])

const updateOrderStatus = async (orderId: string) => {
  loadingStates.value[orderId] = true
  try {
    await $fetch(`/api/orders/status`, { method: 'PATCH', body: { id: orderId, status: 'Canceled' } })
    await refresh()
    toast.add({
      title: 'Success',
      icon: 'iconoir:check-circle-solid',
      description: 'Your Order has been cancelled successfully!',
      color: 'success',
    })
  }
  catch (error) {
    console.error('Error updating order status:', error)
    toast.add({
      title: 'Error',
      icon: appConfig.ui.icons.error,
      description: 'Failed to cancel your order. Please try again.',
      color: 'error',
    })
  }
  finally {
    loadingStates.value[orderId] = false
  }
}
const { data: returnOrders, pending: returnOrdersPending } = useFetch('/api/orders/return')

// Debug: Log return orders to verify data
watch(returnOrders, newVal => {
  console.log('Return Orders Data:', newVal)
}, { immediate: true })

// Enhanced helper function with debugging
const getReturnStatus = (orderId: string) => {
  if (!returnOrders.value) {
    console.log('No return orders data available')
    return null
  }

  const returnOrder = returnOrders.value.find(ro => {
    console.log(`Checking return order:`, ro)
    return ro.order === orderId
  })

  console.log(`Found return status for order ${orderId}:`, returnOrder?.status)
  return returnOrder?.status?.toLowerCase()
}
</script>

<template>
  <UMain>
    <UContainer class="py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs class="mb-4" />

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold dark:text-white">
            Order History
          </h1>
          <p class="text-muted font-medium mt-1">
            View and manage your past orders
          </p>
        </div>
      </div>

      <div v-if="status === 'pending'" class="flex items-center justify-center py-20">
        <AppSpinner size="md" color="primary" />
      </div>

      <template v-else-if="status === 'success'">
        <div v-if="orders.length">
          <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <UCard v-for="order in orders" :key="order.id" :ui="{ body: 'p-3 sm:p-3' }">
              <div class="flex flex-col space-y-4 h-full">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Order</span>
                  <div class="space-x-1">
                    <UBadge color="primary" variant="subtle" :label="`#${order.id.split('-')[0]}`" />
                    <UBadge
                      :color="order.status === 'shipped'
                        ? 'warning'
                        : order.status === 'pending' || order.status === 'processing'
                          ? 'secondary'
                          : order.status === 'delivered'
                            ? 'primary'
                            : order.status === 'cancel' || order.status === 'Returned'
                              ? 'error'
                              : 'error'"
                      variant="subtle"
                      :label="order.status || 'Unknown'"
                      class="shrink-0" />
                  </div>
                </div>

                <div class="flex justify-between gap-4 text-sm font-medium">
                  <div>
                    <p class="">
                      Date
                    </p>
                    <p>{{ new Date(order.createdAt).toLocaleDateString() }}</p>
                  </div>
                  <div>
                    <p class="">
                      Total
                    </p>
                    <p class="font-medium">
                      ${{ order.totalPrice?.toFixed(2) }}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-2 mt-auto">
                  <template v-if="features.orderCancellation">
                    <UButton
                      v-if="order.status && ['pending', 'processing'].includes(order.status.toLowerCase())"
                      color="error"
                      variant="outline"
                      icon="i-lucide-trash-2"
                      label="Cancel"
                      block
                      class="cursor-pointer"
                      :loading="loadingStates[order.id]"
                      size="xs"
                      @click="updateOrderStatus(order.id)" />
                  </template>

                  <template v-if="features.orderReturn">
                    <template v-if="!returnOrdersPending">
                      <template v-if="!getReturnStatus(order.id)">
                        <UButton
                          v-if="order.status && order.status.toLowerCase() === 'delivered'"
                          color="error"
                          variant="outline"
                          :icon="appConfig.ui.icons.return"
                          label="Return"
                          block
                          size="xs"
                          class="cursor-pointer"
                          @click="navigateTo(`/orders/${order.id}/return`)" />
                      </template>

                      <template v-else>
                        <UBadge
                          :color="
                            getReturnStatus(order.id) === 'requested' ? 'warning'
                            : getReturnStatus(order.id) === 'rejected' ? 'error'
                              : getReturnStatus(order.id) === 'approved' ? 'primary' : 'success'"
                          variant="subtle"
                          :label="
                            getReturnStatus(order.id) === 'requested' ? 'Return Requested'
                            : getReturnStatus(order.id) === 'rejected' ? 'Return Rejected'
                              : getReturnStatus(order.id) === 'approved' ? 'Return Approved'
                                : 'Return Processing'"
                          size="sm"
                          :icon="
                            getReturnStatus(order.id) === 'rejected' ? appConfig.ui.icons.error
                            : getReturnStatus(order.id) === 'approved' ? 'i-lucide-check' : ''" />
                      </template>

                      <UButton
                        v-if="features.orderTracking"
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-list"
                        label="Details"
                        block
                        size="xs"
                        class="cursor-pointer"
                        @click="navigateTo(`/orders/${order.id}`)" />
                    </template>
                  </template>
                </div>
              </div>
            </UCard>
          </div>

          <div class="mt-8 flex justify-center">
            <UPagination
              v-if="totalItems > itemsPerPage"
              v-model:page="page"
              :total="totalItems"
              :items-per-page="itemsPerPage"
              :sibling-count="1"
              show-edges
              active-color="primary"
              color="neutral" />
          </div>
        </div>

        <UAlert
          v-else
          title="No orders found"
          description="You haven't placed any orders yet."
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="subtle"
          class="mt-8" />
      </template>

      <UAlert
        v-else-if="status === 'error'"
        title="Error loading orders"
        description="We couldn't load your order history. Please try again later."
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
        class="mt-8" />
    </UContainer>
  </UMain>
</template>
