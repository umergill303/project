interface ReturnOrder {
  id: string
  status: string
  createdAt: Date

}

interface ReturnOrdersResponse {
  data: ReturnOrder[]
  total: number
  page: number
  limit: number
}

export const useReturnOrders = () => {
  const total = ref(0)
  const loading = ref(false)
  const orders = ref<ReturnOrder[]>([])

  const fetchOrders = async (page: number, limit: number, search = '') => {
    loading.value = true
    try {
      const res = await $fetch<ReturnOrdersResponse>('/api/orders/return/returnOrders', {
        query: {
          page,
          limit,
          ...(search && { search })
        }
      })
      orders.value = res.data
      total.value = res.total
    }
    catch (err) {
      console.error('Failed to fetch return orders:', err)
      orders.value = []
      total.value = 0
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteOrder = async (id: string) => {
    loading.value = true
    try {
      await $fetch(`/api/orders/return/${id}`, {
        method: 'DELETE'
      })
      showToast('success', 'Return order deleted successfully')
      return true
    }
    catch (err) {
      console.error('Failed to delete return order:', err)
      showToast('error', 'Failed to delete return order')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteMultipleOrders = async (ids: string[]) => {
    loading.value = true
    try {
      await $fetch('/api/orders/return/multiOrders', {
        method: 'DELETE',
        body: { ids }
      })
      showToast('success', `${ids.length} return orders deleted successfully`)
      return true
    }
    catch (err) {
      console.error('Failed to delete return orders:', err)
      showToast('error', 'Failed to delete return orders')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    orders,
    total,
    fetchOrders,
    deleteOrder,
    deleteMultipleOrders
  }
}
