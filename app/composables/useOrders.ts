import type { Order } from '~~/server/database/schema'

export const useOrders = () => {
  const total = ref(0)
  const loading = ref(false)
  const orders = ref<Order[]>([])

  const fetchOrders = async (page: number, limit: number, search = '') => {
    loading.value = true
    try {
      const res = await $fetch<{ data: Order[], total: number }>(`/api/orders`, {
        params: { page, limit, search }
      })
      orders.value = res.data
      total.value = res.total
    }
    catch (err) { console.error('Failed to fetch orders:', err) }
    finally { loading.value = false }
  }

  const deleteOrder = async (id: string) => {
    loading.value = true
    try {
      await $fetch(`/api/orders/${id}`, { method: 'DELETE' })
      showToast('orderDeleted')
    }
    catch (err) {
      console.error('Failed to delete product:', err)
      showToast('error')
    }
    finally { loading.value = false }
  }

  const deleteMultipleOrders = async (ids: string[]) => {
    loading.value = true
    try {
      await $fetch(`/api/orders/multiOrders`, { method: 'DELETE', body: { ids } })
      showToast('ordersDeleted')
    }
    catch (err) {
      console.error('Failed to delete multiple orders:', err)
      showToast('error')
    }
    finally { loading.value = false }
  }

  return { loading, orders, total, fetchOrders, deleteOrder, deleteMultipleOrders }
}
