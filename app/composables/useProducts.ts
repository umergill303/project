import type { Product } from '~~/server/database/schema'

export const useProducts = () => {
  const total = ref(0)
  const loading = ref(false)
  const products = ref<Product[]>([])

  const fetchProducts = async (page?: number, limit?: number, search = '', published?: 'all' | 'published' | 'draft') => {
    loading.value = true
    try {
      const params: Record<string, any> = { page, limit }
      if (search) params.q = search

      if (published === 'published') {
        params.published = 'true'
      }
      else if (published === 'draft') {
        params.published = 'false'
      }

      const res = await $fetch<{ data: Product[], total: number }>(`/api/products`, { params })
      products.value = res.data
      total.value = res.total
    }
    catch (err) { console.error('Failed to fetch products:', err) }
    finally { loading.value = false }
  }

  const deleteProduct = async (id: string) => {
    loading.value = true
    try {
      await $fetch(`/api/products/${id}`, { method: 'DELETE' })
      showToast('productDeleted')
    }
    catch (err) {
      console.error('Failed to delete product:', err)
      showToast('error')
    }
    finally { loading.value = false }
  }

  const deleteMultipleProducts = async (ids: string[]) => {
    loading.value = true
    try {
      await $fetch(`/api/products/multiProducts`, { method: 'DELETE', body: { ids } })
      showToast('productsDeleted')
    }
    catch (err) {
      console.error('Failed to delete multiple products:', err)
      showToast('error')
    }
    finally { loading.value = false }
  }

  const publishProduct = async (ids: string[]) => {
    loading.value = true
    try {
      await $fetch('/api/products/publish', { method: 'PATCH', body: ids })
      showToast('productPublished')
    }
    catch { showToast('error') }
    finally { loading.value = false }
  }

  return { loading, products, total, fetchProducts, deleteProduct, deleteMultipleProducts, publishProduct }
}
