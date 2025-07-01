export const useCustomers = () => {
  const total = ref(0)
  const loading = ref(false)
  const customers = ref<User[]>([])

  const fetchCustomers = async (page: number, limit: number, search = '') => {
    loading.value = true
    try {
      const res = await $fetch<{ data: User[], total: number }>(`/api/customers`, {
        params: { page, limit, search }
      })
      customers.value = res.data
      total.value = res.total
    }
    catch (err) { console.error('Failed to fetch customers:', err) }
    finally { loading.value = false }
  }

  const deleteCustomer = async (id: string) => {
    loading.value = true
    try {
      await $fetch(`/api/customers/${id}`, { method: 'DELETE' })
      showToast('customerDeleted')
    }
    catch (err) {
      console.error('Failed to delete customer:', err)
      showToast('error')
    }
    finally { loading.value = false }
  }

  const deleteMultipleCustomers = async (ids: string[]) => {
    loading.value = true
    try {
      await $fetch(`/api/customers/multiCustomer`, { method: 'DELETE', body: { ids } })
      showToast('customersDeleted')
    }
    catch (err) {
      console.error('Failed to delete multiple customers:', err)
      showToast('error')
    }
    finally { loading.value = false }
  }

  return { loading, customers, total, fetchCustomers, deleteCustomer, deleteMultipleCustomers }
}
