import type { Tag, Brand, Category } from '~~/server/database/schema'

export const useClassification = () => {
  const tagData = ref<Tag[]>([])
  const brandData = ref<Brand[]>([])
  const cateData = ref<Category[]>([])
  const loading = ref(false)
  const fetchTags = async () => {
    loading.value = true
    try {
      const data = await $fetch<Tag[]>('/api/tag')
      tagData.value = data
    }
    catch (err) { console.log('Failed to fetch tags data useComposable', err) }
    finally { loading.value = false }
  }

  const fetchBrands = async () => {
    loading.value = true
    try {
      const data = await $fetch<Brand[]>('/api/brands')
      brandData.value = data
    }
    catch (err) { console.log('Failed to fetch brands data useComposable', err) }
    finally { loading.value = false }
  }

  const fetchCategories = async () => {
    loading.value = true
    try {
      const data = await $fetch<Category[]>('/api/categories')
      cateData.value = data
    }
    catch (err) { console.log('Failed to fetch cate data useComposable', err) }
    finally { loading.value = false }
  }

  const deleteItem = async (endpoint: string, id: string | number) => {
    loading.value = true
    try {
      await $fetch(`${endpoint}/${id}`, { method: 'DELETE' })

      if (endpoint.includes('tag')) await fetchTags()
      else if (endpoint.includes('brands')) await fetchBrands()
      else if (endpoint.includes('categories')) await fetchCategories()
    }
    catch { showToast('error') }
    finally { loading.value = false }
  }

  return {
    loading, deleteItem,
    tagData, brandData, cateData,
    fetchTags, fetchBrands, fetchCategories,
  }
}
